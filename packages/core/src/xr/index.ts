// xr manager
export { XRManager, registerXRFeatureManager } from "./XRManager";

// xr device
export type { IXRDevice } from "./IXRDevice";

// xr feature
export { XRPlatformFeature } from "./feature/XRPlatformFeature";
export { XRFeatureType } from "./feature/XRFeatureType";
export { XRFeatureManager } from "./feature/XRFeatureManager";
// camera
export type { IXRCameraDescriptor } from "./feature/camera/IXRCameraDescriptor";
export { XRCameraManager } from "./feature/camera/XRCameraManager";
// hitTest
export { XRHitTestManager } from "./feature/hitTest/XRHitTestManager";
export { XRHitTestType } from "./feature/hitTest/XRHitTestType";
// tracking
export { XRRequestTrackingState } from "./feature/trackable/XRRequestTrackingState";
export { XRTracked } from "./feature/trackable/XRTracked";
// movement tracking
export type { IXRMovementTrackingDescriptor } from "./feature/movementTracking/IXRMovementTrackingDescriptor";
export { XRMovementTrackingManager } from "./feature/movementTracking/XRMovementTrackingManager";
export { XRMovementTrackingMode } from "./feature/movementTracking/XRMovementTrackingMode";
export { XRPlatformMovementTracking } from "./feature/movementTracking/XRPlatformMovementTracking";
// anchor tracking
export type { IXRAnchorTrackingDescriptor } from "./feature/trackable/anchor/IXRAnchorTrackingDescriptor";
export { XRAnchorTrackingManager } from "./feature/trackable/anchor/XRAnchorTrackingManager";
export { XRPlatformAnchorTracking } from "./feature/trackable/anchor/XRPlatformAnchorTracking";
export { XRRequestTrackingAnchor } from "./feature/trackable/anchor/XRRequestTrackingAnchor";
// image tracking
export type { IXRImageTrackingDescriptor } from "./feature/trackable/image/IXRImageTrackingDescriptor";
export { XRImageTrackingManager } from "./feature/trackable/image/XRImageTrackingManager";
export { XRPlatformImageTracking } from "./feature/trackable/image/XRPlatformImageTracking";
export { XRReferenceImage } from "./feature/trackable/image/XRReferenceImage";
export { XRRequestTrackingImage } from "./feature/trackable/image/XRRequestTrackingImage";
export { XRTrackedImage } from "./feature/trackable/image/XRTrackedImage";
// plane Tracking
export type { IXRPlaneTrackingDescriptor } from "./feature/trackable/plane/IXRPlaneTrackingDescriptor";
export { XRPlaneTrackingManager } from "./feature/trackable/plane/XRPlaneTrackingManager";
export { XRPlaneMode } from "./feature/trackable/plane/XRPlaneMode";
export { XRPlatformPlaneTracking } from "./feature/trackable/plane/XRPlatformPlaneTracking";
export { XRRequestTrackingPlane } from "./feature/trackable/plane/XRRequestTrackingPlane";
export { XRTrackedPlane } from "./feature/trackable/plane/XRTrackedPlane";

// xr input
export { XRTrackingState } from "./input/XRTrackingState";
export { XRInputManager } from "./input/XRInputManager";
export { XRInputButton } from "./input/XRInputButton";
export { XRInputEvent } from "./input/XRInputEvent";
export { XRController } from "./input/XRController";
export { XRInputType } from "./input/XRInputType";
export { XRCamera } from "./input/XRCamera";
export { XRTrackedUpdateFlag } from "./input/XRTrackedUpdateFlag";

// xr session
export { XRSessionManager } from "./session/XRSessionManager";
export { XRSessionType } from "./session/XRSessionType";
export { XRSessionState } from "./session/XRSessionState";
