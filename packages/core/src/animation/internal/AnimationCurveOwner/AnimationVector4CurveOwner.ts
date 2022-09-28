import { Vector4 } from "@oasis-engine/math";
import { Component } from "../../../Component";
import { AnimationProperty } from "../../enums/AnimationProperty";
import { Entity } from "./../../../Entity";
import { AnimationCurveOwner } from "./AnimationCurveOwner";

/**
 * @internal
 */
export class AnimationVector4CurveOwner extends AnimationCurveOwner<Vector4, Vector4> {
  constructor(target: Entity, type: new (entity: Entity) => Component, property: string) {
    super(target, type, property);

    this._defaultValue = new Vector4();
    this._fixedPoseValue = new Vector4();
    this._baseTempValue = new Vector4();
    this._crossTempValue = new Vector4();
  }

  saveDefaultValue(): void {
    this._defaultValue.copyFrom(this._targetValue);
    this._hasSavedDefaultValue = true;
  }

  saveFixedPoseValue(): void {
    this._fixedPoseValue.copyFrom(this._targetValue);
  }

  revertDefaultValue(): void {
    if (!this._hasSavedDefaultValue) return;

    const { mounted, propertyName } = this._propertyReference;
    mounted[propertyName] = this._defaultValue;
  }

  protected _applyValue(value: Vector4, weight: number): void {
    const { mounted, propertyName } = this._propertyReference;
    if (weight === 1.0) {
      mounted[propertyName] = value;
    } else {
      const originValue = mounted[propertyName];
      Vector4.lerp(originValue, value, weight, originValue);
    }
  }

  protected _applyAdditiveValue(value: Vector4, weight: number): void {
    const { mounted, propertyName } = this._propertyReference;
    const originValue = mounted[propertyName];
    originValue.x += value.x * weight;
    originValue.y += value.y * weight;
    originValue.z += value.z * weight;
    originValue.w += value.w * weight;
    mounted[propertyName] = originValue;
  }

  protected _lerpValue(srcValue: Vector4, destValue: Vector4, crossWeight: number, out: Vector4): Vector4 {
    Vector4.lerp(srcValue, destValue, crossWeight, out);
    return out;
  }
}
