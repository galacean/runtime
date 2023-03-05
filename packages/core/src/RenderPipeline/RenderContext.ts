import { Camera } from "../Camera";
import { Shader } from "../shader";
import { ShaderString } from "../shader/ShaderString";
import { VirtualCamera } from "../VirtualCamera";

/**
 * @internal
 * Rendering context.
 */
export class RenderContext {
  /** @internal */
  static _vpMatrixProperty = Shader.getPropertyByName("u_VPMat");

  private static _viewMatrixProperty = Shader.getPropertyByName("u_viewMat");
  private static _projectionMatrixProperty = Shader.getPropertyByName("u_projMat");

  camera: Camera;
  virtualCamera: VirtualCamera;

  replacementShader: Shader;
  replacementTag: ShaderString;
  pipelineStage: ShaderString;

  applyVirtualCamera(virtualCamera: VirtualCamera): void {
    this.virtualCamera = virtualCamera;
    const shaderData = this.camera.shaderData;
    shaderData.setMatrix(RenderContext._viewMatrixProperty, virtualCamera.viewMatrix);
    shaderData.setMatrix(RenderContext._projectionMatrixProperty, virtualCamera.projectionMatrix);
    shaderData.setMatrix(RenderContext._vpMatrixProperty, virtualCamera.viewProjectionMatrix);
  }
}
