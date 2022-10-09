import { StaticInterfaceImplement } from "../../base/StaticInterfaceImplement";
import { InterpolationType } from "../enums/InterpolationType";
import { AnimationCurveOwner } from "../internal/AnimationCurveOwner/AnimationCurveOwner";
import { Keyframe } from "../Keyframe";
import { AnimationCurve } from "./AnimationCurve";
import { IAnimationCurveCalculator } from "./interfaces/IAnimationCurveCalculator";

/**
 * Store a collection of Keyframes that can be evaluated over time.
 */
@StaticInterfaceImplement<IAnimationCurveCalculator<Boolean>>()
export class AnimationBoolCurve extends AnimationCurve<Boolean> {
  /** @internal */
  static _isReferenceType: boolean = false;

  /**
   * @internal
   */
  static _initializeOwner(owner: AnimationCurveOwner<Boolean>): void {}

  /**
   * @internal
   */
  static _lerpValue(srcValue: Boolean, destValue: Boolean): Boolean {
    return destValue;
  }

  /**
   * @internal
   */
  static _relativeBaseValue(base: Boolean, src: Boolean): Boolean {
    return src;
  }

  /**
   * @internal
   */
  static _additiveValue(value: Boolean, weight: number, source: Boolean): Boolean {
    return value;
  }

  /**
   * @internal
   */
  static _copyValue(value: Boolean): Boolean {
    return value;
  }

  /**
   * @internal
   */
  static _hermiteInterpolationValue(frame: Keyframe<Boolean>): Boolean {
    return frame.value;
  }

  /**
   * @internal
   */
  _evaluate(time: number, out?: Boolean): Boolean {
    this.interpolation = InterpolationType.Step;
    return super._evaluate(time, out);
  }
}
