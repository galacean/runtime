import { IXRPose } from "./IXRPose";
export interface IXRInput {
  /** The type of the input. */
  type: number;
  /** The pose of the input in XR space. */
  pose: IXRPose;
  /** The tracking state of xr input. */
  trackingState: number;
}
