import { KeyframeValueType } from "../Keyframe";
import { AnimationCurveOwner } from "./AnimationCurveOwner";
import { AnimationEventHandler } from "./AnimationEventHandler";

/**
 * @internal
 */
export class AnimatorStateData {
  curveOwners: AnimationCurveOwner<KeyframeValueType>[] = [];
  eventHandlers: AnimationEventHandler[] = [];
}
