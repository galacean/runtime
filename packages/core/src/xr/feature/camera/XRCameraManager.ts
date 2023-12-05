import { Matrix } from "@galacean/engine-math";
import { Camera } from "../../../Camera";
import { Engine } from "../../../Engine";
import { CameraClearFlags } from "../../../enums/CameraClearFlags";
import { CameraType } from "../../../enums/CameraType";
import { XRCamera } from "../../input/XRCamera";
import { XRTrackedInputDevice } from "../../input/XRTrackedInputDevice";
import { XRSessionState } from "../../session/XRSessionState";

/**
 * The manager of XR camera.
 */
export class XRCameraManager {
  /**
   * The fixed foveation of the camera.
   */
  get fixedFoveation(): number {
    const { _platformSession: platformSession } = this._engine.xrManager.sessionManager;
    if (platformSession) {
      return platformSession.getFixedFoveation();
    } else {
      throw new Error("XR session is not available.");
    }
  }

  set fixedFoveation(value: number) {
    const { _platformSession: platformSession } = this._engine.xrManager.sessionManager;
    if (platformSession) {
      platformSession.setFixedFoveation(value);
    } else {
      throw new Error("XR session is not available.");
    }
  }

  /**
   * @internal
   */
  constructor(private _engine: Engine) {}

  /**
   * Attach the camera to the specified input type(Camera, LeftCamera or RightCamera).
   * The camera entity need to be moved to the XROrigin entity.
   * @param type - The input type
   * @param camera - The camera to be attached
   */
  attachCamera(
    type: XRTrackedInputDevice.Camera | XRTrackedInputDevice.LeftCamera | XRTrackedInputDevice.RightCamera,
    camera: Camera
  ): void {
    this._engine.xrManager.inputManager.getTrackedDevice<XRCamera>(type).camera = camera;
  }

  /**
   * Detach the camera from the specified input type.
   * @param type - The input type
   * @returns The camera that was detached
   */
  detachCamera(
    type: XRTrackedInputDevice.Camera | XRTrackedInputDevice.LeftCamera | XRTrackedInputDevice.RightCamera
  ): Camera {
    const xrCamera = this._engine.xrManager.inputManager.getTrackedDevice<XRCamera>(type);
    const preCamera = xrCamera.camera;
    xrCamera.camera = null;
    return preCamera;
  }

  /**
   * @internal
   */
  _onSessionStart(): void {}

  /**
   * @internal
   */
  _onUpdate(): void {
    const { _cameras: cameras } = this._engine.xrManager.inputManager;
    for (let i = 0, n = cameras.length; i < n; i++) {
      const cameraDevice = cameras[i];
      const { camera } = cameraDevice;
      if (!camera) continue;
      // sync position and rotation
      const { transform } = camera.entity;
      transform.position = cameraDevice.pose.position;
      transform.rotationQuaternion = cameraDevice.pose.rotation;
      // sync viewport
      const { viewport } = camera;
      const { x, y, width, height } = cameraDevice.viewport;
      if (!(x === viewport.x && y === viewport.y && width === viewport.z && height === viewport.w)) {
        camera.viewport = viewport.set(x, y, width, height);
      }
      // sync project matrix
      if (!Matrix.equals(camera.projectionMatrix, cameraDevice.projectionMatrix)) {
        camera.projectionMatrix = cameraDevice.projectionMatrix;
      }
    }
  }

  /**
   * @internal
   */
  _onSessionDestroy(): void {}

  /**
   * @internal
   */
  _getCameraClearFlagsMask(cameraType: CameraType): CameraClearFlags {
    if (cameraType === CameraType.XRCenterCamera) {
      if (this._engine.xrManager.sessionManager.state === XRSessionState.Running) {
        return CameraClearFlags.DepthStencil;
      } else {
        return CameraClearFlags.All;
      }
    } else {
      return CameraClearFlags.All;
    }
  }

  /**
   * @internal
   */
  _onDestroy(): void {}
}
