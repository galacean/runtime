import { IXRFeature, IXRFeatureDescriptor } from "@galacean/engine-design";
import { Engine, EnumXRMode, EnumXRFeature, IXRDevice } from "@galacean/engine";
import { WebXRSessionManager } from "./session/WebXRSessionManager";
import { parseXRMode } from "./util";

import { WebXRInputManager } from "./input/WebXRInputManager";

type FeatureConstructor = new (engine: Engine) => IXRFeature;
export class WebXRDevice implements IXRDevice {
  // @internal
  static _platformFeatureMap: FeatureConstructor[] = [];

  isSupported(mode: EnumXRMode): Promise<void> {
    return new Promise((resolve, reject: (reason: Error) => void) => {
      if (window.isSecureContext === false) {
        reject(new Error("WebXR is available only in secure contexts (HTTPS)."));
        return;
      }
      if (!navigator.xr) {
        reject(new Error("WebXR isn't available"));
        return;
      }
      const sessionMode = parseXRMode(mode);
      if (!sessionMode) {
        reject(new Error("mode must be a value from the XRMode."));
        return;
      }
      navigator.xr.isSessionSupported(sessionMode).then((isSupported: boolean) => {
        isSupported ? resolve() : reject(new Error("The current context doesn't support WebXR."));
      });
    });
  }

  createInputManager(engine: Engine): WebXRInputManager {
    return new WebXRInputManager(engine);
  }

  createSessionManager(engine: Engine): WebXRSessionManager {
    return new WebXRSessionManager(engine);
  }

  isSupportedFeature(descriptor: IXRFeatureDescriptor): Promise<void> {
    return new Promise((resolve: () => void, reject: (reason: Error) => void) => {
      const { _platformFeatureMap: platformFeatureMap } = WebXRDevice;
      const { type } = descriptor;
      if (!platformFeatureMap[type]) {
        reject(new Error("@galacean/engine-xr-webxr 未实现" + EnumXRFeature[type] + "功能类"));
      } else {
        resolve();
      }
    });
  }

  createFeature(engine: Engine, descriptor: IXRFeatureDescriptor): Promise<IXRFeature> {
    return this.isSupportedFeature(descriptor).then(() => new WebXRDevice._platformFeatureMap[descriptor.type](engine));
  }
}

export function registerXRPlatformFeature(feature: EnumXRFeature) {
  return (featureConstructor: FeatureConstructor) => {
    WebXRDevice._platformFeatureMap[feature] = featureConstructor;
  };
}