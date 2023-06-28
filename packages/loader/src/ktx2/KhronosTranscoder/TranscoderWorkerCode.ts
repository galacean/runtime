interface WasmModule {
  memory: WebAssembly.Memory;
  transcode: (nBlocks: number) => number;
}

export interface EncodedData {
  buffer: Uint8Array;
  levelWidth: number;
  levelHeight: number;
  uncompressedByteLength: number;
}

type MessageType = "init" | "transcode";

export interface IBaseMessage {
  type: MessageType;
}

export interface IInitMessage extends IBaseMessage {
  type: "init";
  transcoderWasm: ArrayBuffer;
}

export interface ITranscodeMessage extends IBaseMessage {
  type: "transcode";
  format: number;
  needZstd: boolean;
  data: EncodedData[][];
}

export type IMessage = IInitMessage | ITranscodeMessage;

export type TranscodeResult = {
  data: Array<{ data: Uint8Array; width: number; height: number }>;
};

export type TranscodeResponse = {
  id: number;
  type: "transcoded";
} & TranscodeResult;

interface DecoderExports {
  memory: Uint8Array;

  ZSTD_findDecompressedSize: (compressedPtr: number, compressedSize: number) => number;
  ZSTD_decompress: (
    uncompressedPtr: number,
    uncompressedSize: number,
    compressedPtr: number,
    compressedSize: number
  ) => number;
  malloc: (ptr: number) => number;
  free: (ptr: number) => void;
}

export function TranscodeWorkerCode() {
  let wasmPromise: Promise<WasmModule>;
  /**
   * ZSTD (Zstandard) decoder.
   */
  class ZSTDDecoder {
    public static heap: Uint8Array;
    public static IMPORT_OBJECT = {
      env: {
        emscripten_notify_memory_growth: function (): void {
          ZSTDDecoder.heap = new Uint8Array(ZSTDDecoder.instance.exports.memory.buffer);
        }
      }
    };
    public static instance: { exports: DecoderExports };
    public static WasmModuleURL =
      "https://mdn.alipayobjects.com/rms/afts/file/A*awNJR7KqIAEAAAAAAAAAAAAAARQnAQ/zstddec.wasm";

    public _initPromise: Promise<any>;

    init(): Promise<void> {
      if (!this._initPromise) {
        this._initPromise = fetch(ZSTDDecoder.WasmModuleURL)
          .then((response) => {
            if (response.ok) {
              return response.arrayBuffer();
            }
            throw new Error(
              `Could not fetch the wasm component for the Zstandard decompression lib: ${response.status} - ${response.statusText}`
            );
          })
          .then((arrayBuffer) => WebAssembly.instantiate(arrayBuffer, ZSTDDecoder.IMPORT_OBJECT))
          .then(this._init);
      }
      return this._initPromise;
    }

    _init(result: WebAssembly.WebAssemblyInstantiatedSource): void {
      ZSTDDecoder.instance = result.instance as unknown as {
        exports: DecoderExports;
      };

      ZSTDDecoder.IMPORT_OBJECT.env.emscripten_notify_memory_growth(); // initialize heap.
    }

    decode(array: Uint8Array, uncompressedSize = 0): Uint8Array {
      if (!ZSTDDecoder.instance) {
        throw new Error(`ZSTDDecoder: Await .init() before decoding.`);
      }

      // Write compressed data into WASM memory.
      const compressedSize = array.byteLength;
      const compressedPtr = ZSTDDecoder.instance.exports.malloc(compressedSize);
      ZSTDDecoder.heap.set(array, compressedPtr);

      // Decompress into WASM memory.
      uncompressedSize =
        uncompressedSize ||
        Number(ZSTDDecoder.instance.exports.ZSTD_findDecompressedSize(compressedPtr, compressedSize));
      const uncompressedPtr = ZSTDDecoder.instance.exports.malloc(uncompressedSize);
      const actualSize = ZSTDDecoder.instance.exports.ZSTD_decompress(
        uncompressedPtr,
        uncompressedSize,
        compressedPtr,
        compressedSize
      );

      // Read decompressed data and free WASM memory.
      const dec = ZSTDDecoder.heap.slice(uncompressedPtr, uncompressedPtr + actualSize);
      ZSTDDecoder.instance.exports.free(compressedPtr);
      ZSTDDecoder.instance.exports.free(uncompressedPtr);

      return dec;
    }
  }
  function transcodeASTCAndBC7(wasmTranscoder: WasmModule, compressedData: Uint8Array, width: number, height: number) {
    const nBlocks = ((width + 3) >> 2) * ((height + 3) >> 2);

    const texMemoryPages = (nBlocks * 16 + 65535) >> 16;
    const memory = wasmTranscoder.memory;
    const delta = texMemoryPages + 1 - (memory.buffer.byteLength >> 16);
    if (delta > 0) memory.grow(delta);

    const textureView = new Uint8Array(memory.buffer, 65536, nBlocks * 16);
    textureView.set(compressedData);
    return wasmTranscoder.transcode(nBlocks) === 0 ? textureView : null;
  }

  function initWasm(buffer: ArrayBuffer): Promise<WasmModule> {
    // @ts-ignore
    wasmPromise = WebAssembly.instantiate(buffer, {
      env: { memory: new WebAssembly.Memory({ initial: 16 }) }
    }).then((moduleWrapper) => moduleWrapper.instance.exports);
    return wasmPromise;
  }

  let zstdDecoder = new ZSTDDecoder();

  function transcode(data: EncodedData[][], needZstd: boolean, wasmModule: WasmModule) {
    const faceCount = data.length;
    const result = new Array<
      {
        width: number;
        height: number;
        data: Uint8Array;
      }[]
    >(faceCount);

    let promise = Promise.resolve();
    if (needZstd) {
      zstdDecoder.init();
      promise = zstdDecoder._initPromise;
    }

    return promise.then(() => {
      for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
        const mipmapCount = data[faceIndex].length;
        const decodedData = new Array<{
          width: number;
          height: number;
          data: Uint8Array;
        }>(mipmapCount);

        for (let i = 0; i < mipmapCount; i++) {
          let { buffer, levelHeight, levelWidth, uncompressedByteLength } = data[faceIndex][i];
          if (needZstd) buffer = zstdDecoder.decode(buffer.slice(), uncompressedByteLength);

          const faceByteLength = buffer.byteLength / faceCount;
          const originByteOffset = buffer.byteOffset;
          const decodedBuffer = transcodeASTCAndBC7(
            wasmModule,
            new Uint8Array(buffer.buffer, originByteOffset + faceIndex * faceByteLength, faceByteLength),
            levelWidth,
            levelHeight
          );
          if (decodedBuffer) {
            decodedData[i] = {
              // use wasm memory as buffer, should slice to avoid duplicate
              data: decodedBuffer.slice(),
              width: levelWidth,
              height: levelHeight
            };
          } else {
            throw "buffer decoded error";
          }
        }
        result[faceIndex] = decodedData;
      }
      return result;
    });
  }

  self.onmessage = function onmessage(event: MessageEvent<IMessage>) {
    const message = event.data;
    switch (message.type) {
      case "init":
        initWasm(message.transcoderWasm)
          .then(() => {
            self.postMessage("init-completed");
          })
          .catch((e) => {
            self.postMessage({ type: "init-error", msg: e });
          });
        break;
      case "transcode":
        wasmPromise.then((module) => {
          transcode(message.data, message.needZstd, module).then((decodedData) => {
            self.postMessage(decodedData);
          });
        });
        break;
    }
  };
}
