import { Matrix, Vector4 } from "@oasis-engine/math";
import { BackgroundMode } from "../Background";
import { Logger } from "../base";
import { Camera, CameraClearFlags } from "../Camera";
import { Engine } from "../Engine";
import { Layer } from "../Layer";
import { RenderQueueType } from "../material";
import { Material } from "../material/Material";
import { Shader } from "../shader/Shader";
import { ShaderMacroCollection } from "../shader/ShaderMacroCollection";
import { Sky } from "../sky";
import { TextureCubeFace } from "../texture/enums/TextureCubeFace";
import { RenderTarget } from "../texture/RenderTarget";
import { RenderContext } from "./RenderContext";
import { RenderElement } from "./RenderElement";
import { RenderPass } from "./RenderPass";
import { RenderQueue } from "./RenderQueue";
import { SpriteElement } from "./SpriteElement";

/**
 * Basic render pipeline.
 */
export class BasicRenderPipeline {
  /** @internal */
  _opaqueQueue: RenderQueue;
  /** @internal */
  _transparentQueue: RenderQueue;
  /** @internal */
  _alphaTestQueue: RenderQueue;

  private _camera: Camera;
  private _defaultPass: RenderPass;
  private _renderPassArray: Array<RenderPass>;
  private _canvasDepthPass;

  /**
   * Create a basic render pipeline.
   * @param camera - Camera
   */
  constructor(camera: Camera) {
    this._camera = camera;
    const { engine } = camera;
    this._opaqueQueue = new RenderQueue(engine);
    this._alphaTestQueue = new RenderQueue(engine);
    this._transparentQueue = new RenderQueue(engine);

    this._renderPassArray = [];
    this._defaultPass = new RenderPass("default", 0, null, null, 0);
    this.addRenderPass(this._defaultPass);
  }

  /**
   * Default render pass.
   */
  get defaultRenderPass() {
    return this._defaultPass;
  }

  /**
   * Add render pass.
   * @param nameOrPass - The name of this Pass or RenderPass object. When it is a name, the following parameters need to be provided
   * @param priority - Priority, less than 0 before the default pass, greater than 0 after the default pass
   * @param renderTarget - The specified Render Target
   * @param replaceMaterial -  Replaced material
   * @param mask - Perform bit and operations with Entity.Layer to filter the objects that this Pass needs to render
   */
  addRenderPass(
    nameOrPass: string | RenderPass,
    priority: number = null,
    renderTarget: RenderTarget = null,
    replaceMaterial: Material = null,
    mask: Layer = null
  ) {
    if (typeof nameOrPass === "string") {
      const renderPass = new RenderPass(nameOrPass, priority, renderTarget, replaceMaterial, mask);
      this._renderPassArray.push(renderPass);
    } else if (nameOrPass instanceof RenderPass) {
      this._renderPassArray.push(nameOrPass);
    }

    this._renderPassArray.sort(function (p1, p2) {
      return p1.priority - p2.priority;
    });
  }

  /**
   * Remove render pass by name or render pass object.
   * @param nameOrPass - Render pass name or render pass object
   */
  removeRenderPass(nameOrPass: string | RenderPass): void {
    let pass: RenderPass;
    if (typeof nameOrPass === "string") pass = this.getRenderPass(nameOrPass);
    else if (nameOrPass instanceof RenderPass) pass = nameOrPass;
    if (pass) {
      const idx = this._renderPassArray.indexOf(pass);
      this._renderPassArray.splice(idx, 1);
    }
  }

  /**
   * Get render pass by name.
   * @param  name - Render pass name
   */
  getRenderPass(name: string) {
    for (let i = 0, len = this._renderPassArray.length; i < len; i++) {
      const pass = this._renderPassArray[i];
      if (pass.name === name) return pass;
    }

    return null;
  }

  /**
   * Destroy internal resources.
   */
  destroy() {}

  /**
   * Perform scene rendering.
   * @param context - Render context
   * @param cubeFace - Render surface of cube texture
   */
  render(context: RenderContext, cubeFace?: TextureCubeFace) {
    const camera = this._camera;
    const opaqueQueue = this._opaqueQueue;
    const alphaTestQueue = this._alphaTestQueue;
    const transparentQueue = this._transparentQueue;

    opaqueQueue.clear();
    alphaTestQueue.clear();
    transparentQueue.clear();
    camera.engine._componentsManager.callRender(context);
    opaqueQueue.sort(RenderQueue._compareFromNearToFar);
    alphaTestQueue.sort(RenderQueue._compareFromNearToFar);
    transparentQueue.sort(RenderQueue._compareFromFarToNear);

    if (this._canvasDepthPass) this._canvasDepthPass.enabled = false;

    for (let i = 0, len = this._renderPassArray.length; i < len; i++) {
      this._drawRenderPass(this._renderPassArray[i], camera, cubeFace);
    }
  }

  private _drawRenderPass(pass: RenderPass, camera: Camera, cubeFace?: TextureCubeFace) {
    pass.preRender(camera, this._opaqueQueue, this._alphaTestQueue, this._transparentQueue);

    if (pass.enabled) {
      const { engine, scene } = camera;
      const { background } = scene;
      const rhi = engine._hardwareRenderer;
      const renderTarget = camera.renderTarget || pass.renderTarget;
      rhi.activeRenderTarget(renderTarget, camera);
      renderTarget?._setRenderTargetFace(cubeFace);
      const clearFlags = pass.clearFlags ?? camera.clearFlags;
      if (clearFlags !== CameraClearFlags.None) {
        rhi.clearRenderTarget(camera.engine, clearFlags, background.color);
      }

      if (pass.renderOverride) {
        pass.render(camera, this._opaqueQueue, this._alphaTestQueue, this._transparentQueue);
      } else {
        this._opaqueQueue.render(camera, pass.replaceMaterial, pass.mask);
        this._alphaTestQueue.render(camera, pass.replaceMaterial, pass.mask);
        if (background.mode === BackgroundMode.Sky && background.sky) {
          this._drawSky(engine, camera, background.sky);
        }
        this._transparentQueue.render(camera, pass.replaceMaterial, pass.mask);
      }

      renderTarget?._blitRenderTarget();
      renderTarget?.generateMipmaps();
    }

    pass.postRender(camera, this._opaqueQueue, this._alphaTestQueue, this._transparentQueue);
  }

  /**
   * Push a render element to the render queue.
   * @param element - Render element
   */
  pushPrimitive(element: RenderElement | SpriteElement) {
    const renderQueueType = element.material.renderQueueType;

    if (renderQueueType > (RenderQueueType.Transparent + RenderQueueType.AlphaTest) >> 1) {
      this._transparentQueue.pushPrimitive(element);
    } else if (renderQueueType > (RenderQueueType.AlphaTest + RenderQueueType.Opaque) >> 1) {
      this._alphaTestQueue.pushPrimitive(element);
    } else {
      this._opaqueQueue.pushPrimitive(element);
    }
  }

  private _drawSky(engine: Engine, camera: Camera, sky: Sky) {
    const { material, mesh, _matrix } = sky;
    if (!material) {
      Logger.warn("The material of sky is not defined.");
      return;
    }
    if (!mesh) {
      Logger.warn("The mesh of sky is not defined.");
      return;
    }

    const rhi = engine._hardwareRenderer;
    const { shaderData, shader, renderState } = material;

    const compileMacros = Shader._compileMacros;
    ShaderMacroCollection.unionCollection(camera._globalShaderMacro, shaderData._macroCollection, compileMacros);

    const { viewMatrix, projectionMatrix } = camera;
    viewMatrix.cloneTo(_matrix);
    const e = _matrix.elements;
    e[12] = e[13] = e[14] = 0;
    Matrix.multiply(projectionMatrix, _matrix, _matrix);
    shaderData.setMatrix("u_mvpNoscale", _matrix);

    const program = shader._getShaderProgram(engine, compileMacros);
    program.bind();
    program.uploadAll(program.materialUniformBlock, shaderData);

    renderState._apply(engine);
    rhi.drawPrimitive(mesh, mesh.subMesh, program);
  }
}
