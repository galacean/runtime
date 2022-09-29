import { Quaternion } from "@oasis-engine/math";
import { Transform } from "../../../../Transform";
import { KeyframeTangentType, KeyframeValueType } from "../../../KeyFrame";
import { AnimationCurveOwner } from "../AnimationCurveOwner";
import { IAnimationCurveOwnerAssembler } from "./IAnimationCurveOwnerAssembler";

/**
 * @internal
 */
export class RotationAnimationCurveOwnerAssembler implements IAnimationCurveOwnerAssembler<Quaternion> {
  private _transform: Transform;

  initialize(owner: AnimationCurveOwner<KeyframeTangentType, KeyframeValueType>): void {
    this._transform = owner.target.transform;
  }

  getTargetValue(): Quaternion {
    return this._transform.rotationQuaternion;
  }

  setTargetValue(value: Quaternion): void {
    this._transform.rotationQuaternion = value;
  }
}

AnimationCurveOwner.registerAssembler(Transform, "rotationQuaternion", RotationAnimationCurveOwnerAssembler);
