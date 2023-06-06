import { KeyframeValueType } from "../Keyframe";
import { AnimationCurveLayerOwner } from "./AnimationCurveLayerOwner";
import { AnimationEventHandler } from "./AnimationEventHandler";

/**
 * @internal
 */
export class AnimatorStateData {
  curveLayerOwner: AnimationCurveLayerOwner<KeyframeValueType>[] = [];
  eventHandlers: AnimationEventHandler[] = [];
}
