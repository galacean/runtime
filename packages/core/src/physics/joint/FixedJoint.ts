import { Joint } from "./Joint";
import { IFixedJoint } from "@oasis-engine/design";
import { Collider } from "../Collider";
import { PhysicsManager } from "../PhysicsManager";
import { Vector3, Quaternion } from "@oasis-engine/math";

export class FixedJoint extends Joint {
  private _projectionLinearTolerance: number = 0;
  private _projectionAngularTolerance: number = 0;

  get projectionLinearTolerance(): number {
    return this._projectionLinearTolerance;
  }

  set projectionLinearTolerance(newValue: number) {
    this._projectionLinearTolerance = newValue;
    (<IFixedJoint>this._nativeJoint).setProjectionLinearTolerance(this._projectionLinearTolerance);
  }

  get projectionAngularTolerance(): number {
    return this._projectionAngularTolerance;
  }

  set projectionAngularTolerance(newValue: number) {
    this._projectionAngularTolerance = newValue;
    (<IFixedJoint>this._nativeJoint).setProjectionAngularTolerance(this._projectionAngularTolerance);
  }

  constructor(collider0: Collider, collider1: Collider) {
    super();
    this._nativeJoint = PhysicsManager._nativePhysics.createFixedJoint(
      collider0?._nativeCollider,
      new Vector3(),
      new Quaternion(),
      collider1?._nativeCollider,
      new Vector3(),
      new Quaternion()
    );
  }
}
