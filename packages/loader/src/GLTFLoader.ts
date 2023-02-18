import {
  AssetPromise,
  AssetType,
  Buffer,
  ContentRestoreInfo,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
  Texture2D
} from "@oasis-engine/core";
import { RequestConfig } from "@oasis-engine/core/types/asset/request";
import { Vector2 } from "@oasis-engine/math";
import { GLTFParser } from "./gltf/GLTFParser";
import { GLTFResource } from "./gltf/GLTFResource";
import { GLTFUtil } from "./gltf/GLTFUtil";
import { ParserContext } from "./gltf/parser/ParserContext";
import { IAccessor, IBufferView } from "./gltf/Schema";

@resourceLoader(AssetType.Prefab, ["gltf", "glb"])
export class GLTFLoader extends Loader<GLTFResource> {
  /**
   * @override
   */
  load(item: LoadItem, resourceManager: ResourceManager): Record<string, AssetPromise<any>> {
    const url = item.url;
    const context = new ParserContext(url);
    const glTFResource = new GLTFResource(resourceManager.engine, url);
    const masterPromiseInfo = context.masterPromiseInfo;

    context.glTFResource = glTFResource;
    context.keepMeshData = item.params?.keepMeshData ?? false;

    masterPromiseInfo.onCancel(() => {
      const { chainPromises } = context;
      for (const promise of chainPromises) {
        promise.cancel();
      }
    });

    GLTFParser.defaultPipeline
      .parse(context)
      .then((glTFResource) => {
        this.addContentRestoreInfo(glTFResource, context.contentRestoreInfo);
        masterPromiseInfo.resolve(glTFResource);
      })
      .catch((e) => {
        console.error(e);
        masterPromiseInfo.reject(`Error loading glTF model from ${url} .`);
      });

    return context.promiseMap;
  }

  /**
   * @override
   */
  restoreContent(host: GLTFResource, restoreInfo: GLTFContentRestoreInfo): AssetPromise<GLTFResource> {
    return new AssetPromise((resolve, reject) => {
      Promise.all(
        restoreInfo.bufferRequests.map((bufferRequestInfo) => {
          return this.request<ArrayBuffer>(bufferRequestInfo.url, bufferRequestInfo.config);
        })
      )
        .then((buffers: ArrayBuffer[]) => {
          // Buffer parse
          if (restoreInfo.isGLB) {
            const glbBufferSlice = restoreInfo.glbBufferSlices;
            const bigBuffer = buffers[0];
            const bufferCount = glbBufferSlice.length;
            buffers.length = bufferCount;
            for (let i = 0; i < bufferCount; i++) {
              const slice = glbBufferSlice[i];
              buffers[i] = bigBuffer.slice(slice.x, slice.y);
            }
          }

          // Restore texture
          AssetPromise.all(
            restoreInfo.bufferTextures.map((textureRestoreInfo) => {
              const { bufferView } = textureRestoreInfo;
              const buffer = buffers[bufferView.buffer];
              const bufferData = buffer.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength);

              return GLTFUtil.loadImageBuffer(bufferData, textureRestoreInfo.mimeType).then((image) => {
                textureRestoreInfo.texture.setImageSource(image);
              });
            })
          )
            .then(() => {
              // Restore mesh
              for (const meshInfo of restoreInfo.meshes) {
                for (const restoreInfo of meshInfo.vertexBuffer) {
                  const buffer = buffers[restoreInfo.bufferIndex];
                  const byteOffset = restoreInfo.byteOffset;
                  const data = new restoreInfo.TypedArray(buffer, byteOffset, restoreInfo.length);
                  restoreInfo.buffer.setData(data);
                }

                const restoreInfo = meshInfo.indexBuffer;
                const buffer = buffers[restoreInfo.bufferIndex];
                const byteOffset = restoreInfo.byteOffset;
                const data = new restoreInfo.TypedArray(buffer, byteOffset, restoreInfo.length);
                restoreInfo.buffer.setData(data);
              }
              resolve(host);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

/**
 * GlTF loader params.
 */
export interface GLTFParams {
  /** Keep raw mesh data for glTF parser, default is false. */
  keepMeshData: boolean;
}

/**
 * @internal
 */
export class GLTFContentRestoreInfo extends ContentRestoreInfo {
  isGLB: boolean;
  bufferRequests: BufferRequestInfo[] = [];
  glbBufferSlices: Vector2[] = [];
  bufferTextures: BufferTextureRestoreInfo[] = [];
  meshes: ModelMeshRestoreInfo[] = [];
}

/**
 * @internal
 */
export class BufferRequestInfo {
  constructor(public url: string, public config: RequestConfig) {}
}

/**
 * @internal
 */
export class BufferTextureRestoreInfo {
  public texture: Texture2D;
  public bufferView: IBufferView;
  public mimeType: string;
}

/**
 * @internal
 */
export class ModelMeshRestoreInfo {
  public vertexBuffer: BufferRestoreInfo[] = [];
  public indexBuffer: BufferRestoreInfo;
  public blendShapeAccessors: Record<string, IAccessor>[] = [];
}

/**
 * @internal
 */
export class BufferRestoreInfo {
  buffer: Buffer;
  bufferIndex: number;
  TypedArray: any;
  byteOffset: number;
  length: number;
  setRestoreInfo(bufferIndex: number, TypedArray: any, byteOffset: number, length: number) {
    this.bufferIndex = bufferIndex;
    this.TypedArray = TypedArray;
    this.byteOffset = byteOffset;
    this.length = length;
  }
}
