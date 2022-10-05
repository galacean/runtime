import { Vector2 } from "@oasis-engine/math";
import { StaticInterfaceImplement } from "../../base/StaticInterfaceImplement";
import { AnimationCurveOwner } from "../internal/AnimationCurveOwner";
import { Keyframe } from "../Keyframe";
import { AnimationCurve } from "./AnimationCurve";
import { IAnimationReferenceCurveCalculator } from "./interfaces/IAnimationReferenceCurveCalculator";

/**
 * Store a collection of Keyframes that can be evaluated over time.
 */
@StaticInterfaceImplement<IAnimationReferenceCurveCalculator<Vector2>>()
export class AnimationVector2Curve extends AnimationCurve<Vector2> {
  static _isReferenceType: boolean = true;

  /**
   * @internal
   */
  static _lerpValue(srcValue: Vector2, destValue: Vector2, weight: number, out: Vector2): void {
    Vector2.lerp(srcValue, destValue, weight, out);
  }

  /**
   * @internal
   */
  static _additiveValue(value: Vector2, weight: number, out: Vector2): void {
    Vector2.scale(value, weight, value);
    Vector2.add(out, value, out);
  }

  /**
   * @internal
   */
  static _copyFrom(scource: Vector2, out: Vector2): void {
    out.copyFrom(scource);
  }

  /**
   * @internal
   */
  static _initializeOwner(owner: AnimationCurveOwner<Vector2>): void {
    owner.defaultValue = new Vector2();
    owner.fixedPoseValue = new Vector2();
    owner.baseTempValue = new Vector2();
    owner.crossTempValue = new Vector2();
  }

  /**
   * @internal
   */
  _evaluateAdditive(time: number, out?: Vector2): Vector2 {
    const baseValue = this.keys[0].value;
    this._evaluate(time, out);
    Vector2.subtract(out, baseValue, out);
    return out;
  }

  protected _evaluateLinear(frame: Keyframe<Vector2>, nextFrame: Keyframe<Vector2>, t: number, out: Vector2): Vector2 {
    Vector2.lerp(frame.value, nextFrame.value, t, out);
    return out;
  }

  protected _evaluateStep(frame: Keyframe<Vector2>, out: Vector2): Vector2 {
    out.copyFrom(frame.value);
    return out;
  }

  protected _evaluateHermite(
    frame: Keyframe<Vector2>,
    nextFrame: Keyframe<Vector2>,
    t: number,
    dur: number,
    out: Vector2
  ): Vector2 {
    const p0 = frame.value;
    const tan0 = frame.outTangent;
    const p1 = nextFrame.value;
    const tan1 = nextFrame.inTangent;

    const t2 = t * t;
    const t3 = t2 * t;
    const a = 2.0 * t3 - 3.0 * t2 + 1.0;
    const b = t3 - 2.0 * t2 + t;
    const c = t3 - t2;
    const d = -2.0 * t3 + 3.0 * t2;

    let t0 = tan0.x,
      t1 = tan1.x;
    if (Number.isFinite(t0) && Number.isFinite(t1)) {
      out.x = a * p0.x + b * t0 * dur + c * t1 * dur + d * p1.x;
    } else {
      out.x = p0.x;
    }

    (t0 = tan0.y), (t1 = tan1.y);
    if (Number.isFinite(t0) && Number.isFinite(t1)) {
      out.y = a * p0.y + b * t0 * dur + c * t1 * dur + d * p1.y;
    } else {
      out.y = p0.y;
    }

    return out;
  }
}
