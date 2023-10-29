import { Engine, XRFeatureType, XRFeatureChangeFlag, XRPlatformFeature } from "@galacean/engine";
import { registerXRPlatformFeature } from "../WebXRDevice";
import { WebXRInputManager } from "../WebXRInputManager";
import { WebXRSessionManager } from "../WebXRSessionManager";

@registerXRPlatformFeature(XRFeatureType.MovementTracking)
export class WebXRMovementTracking extends XRPlatformFeature {
  private _inputManager: WebXRInputManager;
  private _sessionManager: WebXRSessionManager;

  _onFlagChange(flag: XRFeatureChangeFlag, ...param): void {
    switch (flag) {
      case XRFeatureChangeFlag.Enable:
        break;

      default:
        break;
    }
  }

  _onDestroy(): void {}

  constructor(engine: Engine) {
    super(engine);
    const { xrModule } = engine;
    this._inputManager = <WebXRInputManager>xrModule.inputManager;
    this._sessionManager = <WebXRSessionManager>xrModule.sessionManager;
  }
}
