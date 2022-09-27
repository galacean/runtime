import { Component } from "../../../Component";
import { AnimationProperty } from "../../enums/AnimationProperty";
import { Entity } from "./../../../Entity";
import { AnimationCurveOwner } from "./AnimationCurveOwner";

/**
 * @internal
 */
export class AnimationFloatCurveOwner extends AnimationCurveOwner<number, number> {
  constructor(target: Entity, type: new (entity: Entity) => Component, property: AnimationProperty) {
    super(target, type, property);
    this._propertyReference = this._getPropertyReference();
    const { mounted, propertyName } = this._propertyReference;
    this._targetValue = mounted[propertyName];
  }

  saveDefaultValue() {
    this._defaultValue = this._targetValue;
    this._hasSavedDefaultValue = true;
  }

  saveFixedPoseValue() {
    this._fixedPoseValue = this._targetValue;
  }

  revertDefaultValue() {
    if (!this._hasSavedDefaultValue) return;

    const { mounted, propertyName } = this._propertyReference;
    mounted[propertyName] = this._defaultValue;
  }

  protected _applyValue(value: number, weight: number) {
    const { mounted, propertyName } = this._propertyReference;
    mounted[propertyName] += (value - mounted[propertyName]) * weight;
  }

  protected _applyAdditiveVale(value: number, weight: number) {
    const { mounted, propertyName } = this._propertyReference;
    mounted[propertyName] += value * weight;
  }

  protected _applyCrossValue(
    srcValue: number,
    destValue: number,
    crossWeight: number,
    layerWeight: number,
    additive: boolean
  ) {
    const value = srcValue + (destValue - srcValue) * crossWeight;
    if (additive) {
      this._applyAdditiveVale(value, layerWeight);
    } else {
      this._applyValue(value, layerWeight);
    }
  }
}
