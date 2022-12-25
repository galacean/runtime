import { AssetPromise, Buffer, TypedArray } from "@oasis-engine/core";
import { GLTFResource } from "../GLTFResource";
import { IGLTF } from "../Schema";

/**
 * @internal
 */
export class ParserContext {
  gltf: IGLTF;
  buffers: ArrayBuffer[];
  glTFResource: GLTFResource;
  keepMeshData: boolean;
  hasSkinned: boolean = false;
  /** chain asset promise */
  chainPromises: AssetPromise<any>[] = [];
  accessorBufferCache: Record<string, BufferInfo> = {};
  subAssetFiflter:Function;
  query:string;
}

export class BufferInfo {
  vertxBuffer: Buffer;
  vertexBindingInfos: Record<number, number> = {};
  constructor(public data: TypedArray, public interleaved: boolean, public stride: number) {}
}
