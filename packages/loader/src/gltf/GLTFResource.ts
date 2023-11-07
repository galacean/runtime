import {
  AnimationClip,
  Camera,
  Engine,
  Entity,
  Light,
  Material,
  ModelMesh,
  ReferResource,
  Skin,
  Texture2D
} from "@galacean/engine-core";

/**
 * Product after glTF parser, usually, `defaultSceneRoot` is only needed to use.
 */
export class GLTFResource extends ReferResource {
  /** glTF file url. */
  readonly url: string;
  /** Texture2D after TextureParser. */
  readonly textures?: Texture2D[];
  /** Material after MaterialParser. */
  readonly materials?: Material[];
  /** ModelMesh after MeshParser. */
  readonly meshes?: ModelMesh[][];
  /** Skin after SkinParser. */
  readonly skins?: Skin[];
  /** AnimationClip after AnimationParser. */
  readonly animations?: AnimationClip[];

  /** @internal */
  _defaultSceneRoot: Entity;
  /** @internal */
  _sceneRoots: Entity[];
  /** @internal */
  _extensionsData: Record<string, any>;

  /**
   * Extensions data.
   */
  get extensionsData(): Record<string, any> {
    return this._extensionsData;
  }

  /**
   * @internal
   */
  constructor(engine: Engine, url: string) {
    super(engine);
    this.url = url;
  }

  /**
   * Instantiate scene root entity.
   * @param sceneIndex - Scene index
   * @returns Root entity
   */
  instantiateSceneRoot(sceneIndex?: number): Entity {
    const sceneRoot = sceneIndex === undefined ? this._defaultSceneRoot : this._sceneRoots[sceneIndex];
    return sceneRoot.clone();
  }

  protected override _onDestroy(): void {
    super._onDestroy();

    const { textures, materials, meshes } = this;
    textures && this._disassociationSuperResource(textures);
    materials && this._disassociationSuperResource(materials);
    if (meshes) {
      for (let i = 0, n = meshes.length; i < n; i++) {
        this._disassociationSuperResource(meshes[i]);
      }
    }
  }

  private _disassociationSuperResource(resources: ReferResource[]): void {
    for (let i = 0, n = resources.length; i < n; i++) {
      // @ts-ignore
      resources[i]._disassociationSuperResource(this);
    }
  }

  /**
   * @deprecated
   * Entity after EntityParser.
   */
  entities: Entity[];

  /**
   * @deprecated
   * Camera after SceneParser.
   */
  cameras?: Camera[];

  /**
   * @deprecated
   * Export lights in extension KHR_lights_punctual.
   */
  lights?: Light[];

  /**
   * @deprecated Please use `instantiateSceneRoot` instead.
   * RootEntities after SceneParser.
   */
  get sceneRoots(): Entity[] {
    return this._sceneRoots;
  }

  /**
   * @deprecated Please use `instantiateSceneRoot` instead.
   * RootEntity after SceneParser.
   */
  get defaultSceneRoot(): Entity {
    return this._defaultSceneRoot;
  }
}
