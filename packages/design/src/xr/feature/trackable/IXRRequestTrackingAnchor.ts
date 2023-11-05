import { IXRPose } from "../../input/IXRPose";
import { IXRTrackedAnchor } from "./IXRTrackedAnchor";

export interface IXRRequestTrackingAnchor {
  state: number;
  pose: IXRPose;
  trackedResult?: IXRTrackedAnchor;
  dispose?: (anchor: IXRRequestTrackingAnchor) => any;
}
