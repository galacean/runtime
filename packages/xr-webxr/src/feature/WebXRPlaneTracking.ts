import { Matrix, Quaternion, Vector3 } from "@galacean/engine-math";
import { IXRRequestPlane, IXRTrackedPlane } from "@galacean/engine-design";
import { WebXRDevice, registerXRPlatformFeature } from "../WebXRDevice";
import { WebXRFrame } from "../WebXRFrame";
import { WebXRSession } from "../WebXRSession";
import { WebXRTrackableFeature } from "./WebXRTrackableFeature";

/**
 *  WebXR implementation of XRPlatformPlaneTracking.
 */
@registerXRPlatformFeature(2)
export class WebXRPlaneTracking implements WebXRTrackableFeature<IWebXRTrackedPlane, IXRRequestPlane> {
  private _lastDetectedPlanes: XRPlaneSet;

  get canModifyRequestTrackingAfterInit(): boolean {
    return false;
  }

  constructor(detectedMode: number) {
    // XRPlaneMode.EveryThing
    if (detectedMode !== 3) {
      console.warn("WebXR only support XRPlaneMode.EveryThing");
    }
  }

  onAddRequestTracking(requestTracking: IXRRequestPlane): void {
    // XRRequestTrackingState.Resolved
    requestTracking.state = 2;
  }

  checkAvailable(session: WebXRSession, frame: WebXRFrame, requestTrackings: IXRRequestPlane[]): boolean {
    return !!frame._platformFrame;
  }

  getTrackedResult(session: WebXRSession, frame: WebXRFrame, requestTrackings: IXRRequestPlane[]): void {
    const { _platformReferenceSpace: platformReferenceSpace } = session;
    const { _platformFrame: platformFrame } = frame;
    // @ts-ignore
    const detectedPlanes: XRPlaneSet = platformFrame.detectedPlanes || platformFrame.worldInformation?.detectedPlanes;
    const tracked = <IWebXRTrackedPlane[]>requestTrackings[0].tracked;
    for (let i = 0, n = tracked.length; i < n; i++) {
      const trackedPlane = tracked[i];
      if (detectedPlanes.has(trackedPlane.xrPlane)) {
        // XRTrackingState.Tracking
        trackedPlane.state = 1;
        this._updatePlane(platformFrame, platformReferenceSpace, trackedPlane);
      } else {
        // XRTrackingState.NotTracking
        trackedPlane.state = 0;
      }
    }

    const { _lastDetectedPlanes: lastDetectedPlanes } = this;
    detectedPlanes.forEach((xrPlane) => {
      if (!lastDetectedPlanes?.has(xrPlane)) {
        const plane = {
          id: WebXRDevice.generateUUID(),
          pose: {
            matrix: new Matrix(),
            rotation: new Quaternion(),
            position: new Vector3(),
            inverseMatrix: new Matrix()
          },
          // XRPlaneMode.Horizontal
          planeMode: 1,
          // XRTrackingState.Tracking
          state: 1,
          xrPlane: xrPlane,
          polygon: [],
          attributesDirty: false
        };
        this._updatePlane(platformFrame, platformReferenceSpace, plane);
        tracked.push(plane);
      }
    });
    this._lastDetectedPlanes = detectedPlanes;
  }

  /**
   * @internal
   */
  _assembleOptions(options: XRSessionInit): void {
    options.requiredFeatures.push("plane-detection");
  }

  private _updatePlane(frame: XRFrame, space: XRSpace, trackedPlane: IWebXRTrackedPlane): void {
    const { pose, polygon, xrPlane } = trackedPlane;
    const planePose = frame.getPose(xrPlane.planeSpace, space);
    if (!planePose) return;
    const { transform, emulatedPosition } = planePose;
    // XRTrackingState.TrackingLost : XRTrackingState.Tracking
    trackedPlane.state = emulatedPosition ? 2 : 1;
    // XRPlaneMode.Horizontal : XRPlaneMode.Vertical
    trackedPlane.planeMode = xrPlane.orientation === "horizontal" ? 1 : 2;
    if (trackedPlane.lastChangedTime < xrPlane.lastChangedTime) {
      trackedPlane.lastChangedTime = xrPlane.lastChangedTime;
      trackedPlane.attributesDirty = true;
      const { polygon: oriPolygon } = xrPlane;
      for (let i = 0, n = (polygon.length = oriPolygon.length); i < n; i++) {
        (polygon[i] ||= new Vector3()).copyFrom(oriPolygon[i]);
      }
    } else {
      trackedPlane.attributesDirty = false;
    }
    pose.rotation.copyFrom(transform.orientation);
    pose.position.copyFrom(transform.position);
    pose.matrix.copyFromArray(transform.matrix);
    pose.inverseMatrix.copyFromArray(transform.inverse.matrix);
  }
}

interface IWebXRTrackedPlane extends IXRTrackedPlane {
  xrPlane?: XRPlane;
  lastChangedTime?: number;
}
