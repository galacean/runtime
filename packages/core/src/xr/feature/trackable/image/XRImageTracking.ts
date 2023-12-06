import { IXRReferenceImage, IXRRequestImageTracking, IXRTrackedImage } from "@galacean/engine-design";
import { XRManager } from "../../../XRManager";
import { XRFeatureType } from "../../XRFeatureType";
import { XRRequestTrackingState } from "../XRRequestTrackingState";
import { XRTrackableFeature } from "../XRTrackableFeature";

/**
 * The manager of XR image tracking.
 */
export class XRImageTracking extends XRTrackableFeature<IXRTrackedImage, IXRRequestImageTracking> {
  /**
   * @param xrManager - The xr manager
   * @param images - The images to be tracked
   */
  constructor(xrManager: XRManager, images: IXRReferenceImage[]) {
    super(xrManager, XRFeatureType.ImageTracking, images);
    const imageLength = images ? images.length : 0;
    if (imageLength > 0) {
      for (let i = 0, n = images.length; i < n; i++) {
        this._addRequestTracking({
          image: images[i],
          state: XRRequestTrackingState.None,
          tracked: []
        });
      }
    } else {
      console.warn("No image to be tracked.");
    }
  }
}
