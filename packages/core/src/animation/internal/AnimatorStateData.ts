import { KeyframeValueType } from "../KeyFrame";
import { AnimationCurveOwner } from "./AnimationCurveOwner";
import { AnimationEventHandler } from "./AnimationEventHandler";

/**
 * @internal
 */
export class AnimatorStateData {
  curveOwners: AnimationCurveOwner<KeyframeValueType>[] = [];
  eventHandlers: AnimationEventHandler[] = [];
}
