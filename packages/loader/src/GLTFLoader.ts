import {
  AssetPromise,
  AssetType,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
  RestoreContentInfo
} from "@oasis-engine/core";
import { RequestConfig } from "@oasis-engine/core/types/asset/request";
import { Vector2 } from "@oasis-engine/math";
import { GLTFParser } from "./gltf/GLTFParser";
import { GLTFResource } from "./gltf/GLTFResource";
import { ParserContext } from "./gltf/parser/ParserContext";
import { IAccessor, IBufferView } from "./gltf/Schema";

@resourceLoader(AssetType.Prefab, ["gltf", "glb"])
export class GLTFLoader extends Loader<GLTFResource> {
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
        // @ts-ignore
        resourceManager._addRestoreContentInfo(glTFResource.instanceId, new GLTFContentRestorer());
        masterPromiseInfo.resolve(glTFResource);
      })
      .catch((e) => {
        console.error(e);
        masterPromiseInfo.reject(`Error loading glTF model from ${url} .`);
      });

    return context.promiseMap;
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
export class GLTFContentRestorer extends RestoreContentInfo {
  isGLB: boolean;
  glbBufferSlice: Vector2[] = [];
  bufferRequestInfos: BufferRequestInfo[] = [];
  bufferViews: IBufferView[] = [];
  meshInfos: ModelMeshRestoreInfo[] = [];
  bufferTextureRestoreInfos: BufferTextureRestoreInfo[] = [];

  restoreContent() {}
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
export class ModelMeshRestoreInfo {
  public vertexBufferAccessors: IAccessor[] = [];
  public indexBufferAccessor: IAccessor;
  public blendShapeAccessors: Record<string, IAccessor>[] = [];
}

/**
 * @internal
 */
export class BufferTextureRestoreInfo {
  public bufferView: IBufferView;
  public mimeType: string;
}
