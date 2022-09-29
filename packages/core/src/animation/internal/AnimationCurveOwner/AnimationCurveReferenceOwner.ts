import { Component } from "../../../Component";
import { Entity } from "../../../Entity";
import { IAnimationReferenceCurveCalculator } from "../../AnimationCurve/interfaces/IAnimationReferenceCurveCalculator";
import { KeyframeValueType } from "../../Keyframe";
import { AnimationCurveOwner } from "./AnimationCurveOwner";

/**
 * @internal
 */
export class AnimationCurveReferenceOwner<V extends KeyframeValueType> extends AnimationCurveOwner<V> {
  cureType: IAnimationReferenceCurveCalculator<V>;
  targetValue: V;

  constructor(target: Entity, type: new (entity: Entity) => Component, property: string) {
    super(target, type, property);
    this.targetValue = this._assembler.getTargetValue();
  }

  saveDefaultValue(): void {
    this.cureType._copyFrom(this.targetValue, this.defaultValue);
    this.hasSavedDefaultValue = true;
  }

  saveFixedPoseValue(): void {
    this.cureType._copyFrom(this.targetValue, this.fixedPoseValue);
  }

  protected _applyLerpValue(value: V, weight: number): void {
    const targetValue = this.targetValue;
    this.cureType._lerpValue(targetValue, value, weight, targetValue);
  }

  protected _applyAdditiveValue(value: V, weight: number): void {
    this.cureType._additiveValue(value, weight, this.targetValue);
  }

  protected _lerpCrossValue(srcValue: V, destValue: V, weight: number): V {
    const out = this.baseTempValue;
    this.cureType._lerpValue(srcValue, destValue, weight, out);
    return out;
  }
}
