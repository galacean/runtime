import { Component } from "../../../Component";
import { Entity } from "../../../Entity";
import { AnimationCurve } from "../../AnimationCurve";
import { IAnimationCurveStatic } from "../../AnimationCurve/IAnimationCurveStatic";
import { KeyFrameTangentType, KeyFrameValueType } from "../../KeyFrame";
import { IAnimationCurveOwnerAssembler } from "./Assembler/IAnimationCurveOwnerAssembler";
import { UniversalAnimationCurveOwnerAssembler } from "./Assembler/UniversalAnimationCurveOwnerAssembler";

/**
 * @internal
 */
export class AnimationCurveOwner<T extends KeyFrameTangentType, V extends KeyFrameValueType> {
  private static _assemblerMap = new Map<ComponentType, Record<string, AssemblerType>>();

  /**
   * @internal
   */
  static _registerAssemblerType(compomentType: ComponentType, property: string, assemblerType: AssemblerType): void {
    let subMap = AnimationCurveOwner._assemblerMap.get(compomentType);
    if (!subMap) {
      subMap = {};
      AnimationCurveOwner._assemblerMap.set(compomentType, subMap);
    }
    subMap[property] = assemblerType;
  }

  /**
   * @internal
   */
  static _getAssemblerType(compomentType: ComponentType, property: string): AssemblerType {
    const subMap = AnimationCurveOwner._assemblerMap.get(compomentType);
    return subMap ? subMap[property] : UniversalAnimationCurveOwnerAssembler<KeyFrameValueType>;
  }

  crossCurveMark: number = 0;
  crossCurveDataIndex: number;

  readonly target: Entity;
  readonly type: new (entity: Entity) => Component;
  readonly property: string;
  readonly component: Component;

  /** @internal */
  _defaultValue: V;
  /** @internal */
  _fixedPoseValue: V;
  /** @internal */
  _baseTempValue: V;
  /** @internal */
  _crossTempValue: V;
  /** @internal */
  _targetValue: V;
  /** @internal */
  _cureType: IAnimationCurveStatic<V>;

  private _hasSavedDefaultValue: boolean = false;
  private _assembler: IAnimationCurveOwnerAssembler<V>;

  constructor(target: Entity, type: new (entity: Entity) => Component, property: string) {
    this.target = target;
    this.type = type;
    this.property = property;
    this.component = target.getComponent(type);

    const assemblerType = AnimationCurveOwner._getAssemblerType(type, property);
    this._assembler = <IAnimationCurveOwnerAssembler<V>>new assemblerType();
    this._assembler.initialization(this);
    this._targetValue = this._assembler.getValue();
  }

  evaluateAndApplyValue(curve: AnimationCurve<T, V>, time: number, layerWeight: number): void {
    if (curve.keys.length) {
      const value = curve._evaluate(time, this._baseTempValue);
      this._applyValue(value, layerWeight);
    }
  }

  evaluateAndApplyAdditiveValue(curve: AnimationCurve<T, V>, time: number, layerWeight: number): void {
    if (curve.keys.length) {
      const value = curve._evaluateAdditive(time, this._baseTempValue);
      this._applyAdditiveValue(value, layerWeight);
    }
  }

  crossFadeAndApplyValue(
    srcCurve: AnimationCurve<T, V>,
    destCurve: AnimationCurve<T, V>,
    srcTime: number,
    destTime: number,
    crossWeight: number,
    layerWeight: number,
    additive: boolean
  ): void {
    const srcValue =
      srcCurve && srcCurve.keys.length ? srcCurve._evaluate(srcTime, this._baseTempValue) : this._defaultValue;
    const destValue =
      destCurve && destCurve.keys.length ? destCurve._evaluate(destTime, this._crossTempValue) : this._defaultValue;
    this._applyCrossValue(srcValue, destValue, crossWeight, layerWeight, additive);
  }

  crossFadeFromPoseAndApplyValue(
    destCurve: AnimationCurve<T, V>,
    destTime: number,
    crossWeight: number,
    layerWeight: number,
    additive: boolean
  ): void {
    const srcValue = this._fixedPoseValue;
    const destValue =
      destCurve && destCurve.keys.length ? destCurve._evaluate(destTime, this._crossTempValue) : this._defaultValue;
    this._applyCrossValue(srcValue, destValue, crossWeight, layerWeight, additive);
  }

  saveDefaultValue(): void {
    this._cureType._copyFrom(this._targetValue, this._defaultValue);
    this._hasSavedDefaultValue = true;
  }

  saveFixedPoseValue(): void {
    this._cureType._copyFrom(this._targetValue, this._fixedPoseValue);
  }

  revertDefaultValue(): void {
    if (!this._hasSavedDefaultValue) {
      return;
    }
    this._assembler.setValue(this._defaultValue);
  }

  private _applyValue(value: V, weight: number): void {
    if (weight === 1.0) {
      this._assembler.setValue(value);
    } else {
      const targetValue = this._targetValue;
      this._cureType._lerpValue(targetValue, value, weight, targetValue);
    }
  }

  private _applyAdditiveValue(value: V, weight: number): void {
    this._cureType._additiveValue(value, weight, this._targetValue);
  }

  private _applyCrossValue(
    srcValue: V,
    destValue: V,
    crossWeight: number,
    layerWeight: number,
    additive: boolean
  ): void {
    const out = this._cureType._lerpValue(srcValue, destValue, crossWeight, this._baseTempValue);
    if (additive) {
      this._applyAdditiveValue(out, layerWeight);
    } else {
      this._applyValue(out, layerWeight);
    }
  }
}

type ComponentType = new (entity: Entity) => Component;
type AssemblerType = new () => IAnimationCurveOwnerAssembler<KeyFrameValueType>;
