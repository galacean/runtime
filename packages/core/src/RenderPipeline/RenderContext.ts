import { Matrix, Vector4 } from "@galacean/engine-math";
import { Camera } from "../Camera";
import { VirtualCamera } from "../VirtualCamera";
import { Shader, ShaderProperty } from "../shader";
import { ShaderTagKey } from "../shader/ShaderTagKey";

/**
 * @internal
 * Rendering context.
 */
export class RenderContext {
  static vpMatrixProperty = ShaderProperty.getByName("camera_VPMat");
  static pipelineStageKey: ShaderTagKey = ShaderTagKey.getByName("pipelineStage");

  /** @internal */
  static _flipYMatrix = new Matrix(1, 0, 0, 0, 0, -1);

  private static _cameraProjectionProperty = ShaderProperty.getByName("camera_ProjectionParams");
  private static _viewMatrixProperty = ShaderProperty.getByName("camera_ViewMat");
  private static _projectionMatrixProperty = ShaderProperty.getByName("camera_ProjMat");
  private static _flipYProjectionMatrix = new Matrix();
  private static _flipYViewProjectionMatrix = new Matrix();

  private _projectionParams: Vector4 = new Vector4();

  camera: Camera;
  virtualCamera: VirtualCamera;

  replacementShader: Shader;
  replacementTag: ShaderTagKey;

  flipProjection = false;
  viewMatrix: Matrix;
  projectionMatrix: Matrix;
  viewProjectionMatrix: Matrix;

  applyVirtualCamera(virtualCamera: VirtualCamera, flipProjection = false): void {
    this.virtualCamera = virtualCamera;
    this.flipProjection = flipProjection;

    const shaderData = this.camera.shaderData;
    let { viewMatrix, projectionMatrix, viewProjectionMatrix } = virtualCamera;

    if (flipProjection) {
      Matrix.multiply(RenderContext._flipYMatrix, projectionMatrix, RenderContext._flipYProjectionMatrix);
      Matrix.multiply(RenderContext._flipYProjectionMatrix, viewMatrix, RenderContext._flipYViewProjectionMatrix);

      projectionMatrix = RenderContext._flipYProjectionMatrix;
      viewProjectionMatrix = RenderContext._flipYViewProjectionMatrix;
    }

    this.viewMatrix = viewMatrix;
    this.projectionMatrix = projectionMatrix;
    this.viewProjectionMatrix = viewProjectionMatrix;

    shaderData.setMatrix(RenderContext._viewMatrixProperty, viewMatrix);
    shaderData.setMatrix(RenderContext._projectionMatrixProperty, projectionMatrix);
    shaderData.setMatrix(RenderContext.vpMatrixProperty, viewProjectionMatrix);

    const camera = this.virtualCamera;
    const projectionParams = this._projectionParams;
    projectionParams.set(flipProjection ? -1 : 1, camera.nearClipPlane, camera.farClipPlane, 1);
    shaderData.setVector4(RenderContext._cameraProjectionProperty, projectionParams);
  }
}
