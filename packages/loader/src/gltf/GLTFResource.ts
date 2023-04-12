import {
  AnimationClip,
  Camera,
  Engine,
  EngineObject,
  Entity,
  Light,
  Material,
  ModelMesh,
  Renderer,
  Skin,
  Texture2D
} from "@galacean/engine-core";

/**
 * Product after GLTF parser, usually, `defaultSceneRoot` is only needed to use.
 */
export class GLTFResource extends EngineObject {
  /** GLTF file url. */
  url: string;
  /** Texture2D after TextureParser. */
  textures?: Texture2D[];
  /** Material after MaterialParser. */
  materials?: Material[];
  /** ModelMesh after MeshParser. */
  meshes?: ModelMesh[][];
  /** Skin after SkinParser. */
  skins?: Skin[];
  /** AnimationClip after AnimationParser. */
  animations?: AnimationClip[];
  /** Entity after EntityParser. */
  entities: Entity[];
  /** Camera after SceneParser. */
  cameras?: Camera[];
  /** Export lights in extension KHR_lights_punctual */
  lights?: Light[];
  /** RootEntities after SceneParser. */
  sceneRoots: Entity[];
  /** RootEntity after SceneParser. */
  defaultSceneRoot: Entity;
  /** Renderer can replace material by `renderer.setMaterial` if gltf use plugin-in KHR_materials_variants. */
  variants?: { renderer: Renderer; material: Material; variants: string[] }[];

  constructor(engine: Engine, url: string) {
    super(engine);
    this.url = url;
  }

  /**
   * @override
   */
  destroy(): void {
    if (this._destroyed) {
      return;
    }

    super.destroy();
    this.defaultSceneRoot.destroy();

    this.textures = null;
    this.materials = null;
    this.meshes = null;
    this.skins = null;
    this.animations = null;
    this.entities = null;
    this.cameras = null;
    this.lights = null;
    this.sceneRoots = null;
    this.variants = null;
  }
}
