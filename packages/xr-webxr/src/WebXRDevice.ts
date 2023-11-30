import { IXRPlatformFeature, IHardwareRenderer, IXRDevice, IXRFeature } from "@galacean/engine-design";
import { XRFeatureType } from "@galacean/engine";
import { parseFeature, parseXRMode } from "./util";
import { WebXRSession } from "./WebXRSession";

type PlatformFeatureConstructor = new () => IXRPlatformFeature;
export class WebXRDevice implements IXRDevice {
  /** @internal */
  static _platformFeatureMap: PlatformFeatureConstructor[] = [];
  /** @internal */
  static _uuid: number = 0;

  isSupportedSessionMode(mode: number): Promise<void> {
    return new Promise((resolve, reject: (reason: Error) => void) => {
      if (!window.isSecureContext) {
        reject(new Error("WebXR is available only in secure contexts (HTTPS)."));
        return;
      }
      if (!navigator.xr) {
        reject(new Error("WebXR isn't available"));
        return;
      }
      navigator.xr.isSessionSupported(parseXRMode(mode)).then((isSupported: boolean) => {
        isSupported ? resolve() : reject(new Error("The current context doesn't support WebXR."));
      });
    });
  }

  isSupportedFeature(type: XRFeatureType): Promise<void> {
    return Promise.resolve();
  }

  createFeature(type: number): IXRPlatformFeature {
    const platformFeatureConstructor = WebXRDevice._platformFeatureMap[type];
    return platformFeatureConstructor ? new platformFeatureConstructor() : null;
  }

  requestSession(rhi: IHardwareRenderer, mode: number, requestFeatures: IXRFeature[]): Promise<WebXRSession> {
    return new Promise((resolve, reject) => {
      const sessionMode = parseXRMode(mode);
      const options: XRSessionInit = { requiredFeatures: ["local"] };
      const promiseArr = [];
      for (let i = 0, n = requestFeatures.length; i < n; i++) {
        const promise = parseFeature(requestFeatures[i]._generateConfig(), options);
        promise && promiseArr.push(promise);
      }
      Promise.all(promiseArr).then(() => {
        navigator.xr.requestSession(sessionMode, options).then((session) => {
          const { gl } = rhi;
          const attributes = gl.getContextAttributes();
          if (!attributes) {
            reject(Error("GetContextAttributes Error!"));
          }
          gl.makeXRCompatible().then(() => {
            const scaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
            let layer: XRWebGLLayer;
            if (session.renderState.layers === undefined || !!!rhi.isWebGL2) {
              const layerInit = {
                antialias: session.renderState.layers === undefined ? attributes.antialias : true,
                alpha: true,
                depth: attributes.depth,
                stencil: attributes.stencil,
                framebufferScaleFactor: scaleFactor
              };
              layer = new XRWebGLLayer(session, gl, layerInit);
              session.updateRenderState({
                baseLayer: layer
              });
            } else {
              layer = new XRWebGLLayer(session, gl);
              session.updateRenderState({
                layers: [layer]
              });
            }
            session.requestReferenceSpace("local").then((referenceSpace: XRReferenceSpace) => {
              resolve(new WebXRSession(session, layer, referenceSpace));
            }, reject);
          }, reject);
        }, reject);
      }, reject);
    });
  }
}

export function registerXRPlatformFeature(type: number) {
  return (platformFeatureConstructor: PlatformFeatureConstructor) => {
    WebXRDevice._platformFeatureMap[type] = platformFeatureConstructor;
  };
}
