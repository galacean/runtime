import { IAnimationValueCurveStatic } from "../../AnimationCurve/interfaces/IAnimationValueCurveStatic";
import { AnimationCurveOwner } from "./AnimationCurveOwner";

/**
 * @internal
 */
export class AnimationCurveValueOwner<T extends number, V extends number> extends AnimationCurveOwner<T, V> {
  cureType: IAnimationValueCurveStatic<T, V>;

  saveDefaultValue(): void {
    this.defaultValue = this._getTargetValue();
    this.hasSavedDefaultValue = true;
  }

  saveFixedPoseValue(): void {
    this.fixedPoseValue = this._getTargetValue();
  }

  protected _getTargetValue(): V {
    return this._assembler.getTargetValue();
  }

  protected _applyLerpValue(value: V, weight: number): void {
    const originValue = this._assembler.getTargetValue();
    const lerpValue = this.cureType._lerpValue(originValue, value, weight);
    this._assembler.setTargetValue(lerpValue);
  }

  protected _applyAdditiveValue(value: V, weight: number): void {
    const originValue = this._assembler.getTargetValue();
    const lerpValue = this.cureType._additiveValue(value, weight, originValue);
    this._assembler.setTargetValue(lerpValue);
  }

  protected _lerpCrossValue(srcValue: V, destValue: V, weight: number): V {
    return this.cureType._lerpValue(srcValue, destValue, weight);
  }
}
