import { Quaternion, Vector4 } from "@oasis-engine/math";
import { StaticInterfaceImplement } from "../../base/StaticInterfaceImplement";
import { AnimatorUtils } from "../AnimatorUtils";
import { AnimationCurveOwner } from "../internal/AnimationCurveOwner";
import { AnimationCurve } from "./AnimationCurve";
import { IAnimationReferenceCurveStatic } from "./interfaces/IAnimationReferenceCurveStatic";

/**
 * Store a collection of Keyframes that can be evaluated over time.
 */
@StaticInterfaceImplement<IAnimationReferenceCurveStatic<Vector4, Quaternion>>()
export class AnimationQuaternionCurve extends AnimationCurve<Vector4, Quaternion> {
  private static _tempConjugateQuat = new Quaternion();

  /** @internal */
  static _isReferenceType: boolean = true;

  /**
   * @internal
   */
  static _lerpValue(srcValue: Quaternion, destValue: Quaternion, weight: number, out: Quaternion): void {
    Quaternion.slerp(srcValue, destValue, weight, out);
  }

  /**
   * @internal
   */
  static _additiveValue(value: Quaternion, weight: number, out: Quaternion) {
    AnimatorUtils.quaternionWeight(value, weight, value);
    value.normalize();
    out.multiply(value);
  }

  /**
   * @internal
   */
  static _copyFrom(scource: Quaternion, out: Quaternion): void {
    out.copyFrom(scource);
  }

  /**
   * @internal
   */
  static _initializeOwner(owner: AnimationCurveOwner<Vector4, Quaternion>): void {
    owner.defaultValue = new Quaternion();
    owner.fixedPoseValue = new Quaternion();
    owner.baseTempValue = new Quaternion();
    owner.crossTempValue = new Quaternion();
  }

  /**
   * @internal
   */
  _evaluateAdditive(time: number, out?: Quaternion): Quaternion {
    const { _tempConjugateQuat } = AnimationQuaternionCurve;
    const baseValue = this.keys[0].value;
    this._evaluate(time, out);
    Quaternion.conjugate(baseValue, _tempConjugateQuat);
    Quaternion.multiply(_tempConjugateQuat, out, out);
    return out;
  }

  protected _evaluateLinear(frameIndex: number, nextFrameIndex: number, t: number, out: Quaternion): Quaternion {
    const { keys } = this;
    Quaternion.slerp(keys[frameIndex].value, keys[nextFrameIndex].value, t, out);
    return out;
  }

  protected _evaluateStep(frameIndex: number, out: Quaternion): Quaternion {
    out.copyFrom(this.keys[frameIndex].value);
    return out;
  }

  protected _evaluateHermite(
    frameIndex: number,
    nextFrameIndex: number,
    t: number,
    dur: number,
    out: Quaternion
  ): Quaternion {
    const { keys } = this;
    const curKey = keys[frameIndex];
    const nextKey = keys[nextFrameIndex];
    const p0 = curKey.value;
    const tan0 = curKey.outTangent;
    const p1 = nextKey.value;
    const tan1 = nextKey.inTangent;

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

    (t0 = tan0.z), (t1 = tan1.z);
    if (Number.isFinite(t0) && Number.isFinite(t1)) {
      out.z = a * p0.z + b * t0 * dur + c * t1 * dur + d * p1.z;
    } else {
      out.z = p0.z;
    }

    (t0 = tan0.w), (t1 = tan1.w);
    if (Number.isFinite(t0) && Number.isFinite(t1)) {
      out.w = a * p0.w + b * t0 * dur + c * t1 * dur + d * p1.w;
    } else {
      out.w = p0.w;
    }
    return out;
  }
}
