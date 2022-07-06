import { Joint } from "./Joint";
import { IFixedJoint } from "@oasis-engine/design";
import { PhysicsManager } from "../PhysicsManager";
import { Collider } from "../Collider";
import { Vector3 } from "@oasis-engine/math";

/*
 * A fixed joint permits no relative movement between two colliders. ie the colliders are glued together.
 */
export class FixedJoint extends Joint {
  private static _offsetVector = new Vector3(1, 0, 0);

  /**
   * @override
   */
  set connectedCollider(value: Collider) {
    this._connectedCollider.collider = value;
    this._nativeJoint.setConnectedCollider(value._nativeCollider);
    const offsetVector = FixedJoint._offsetVector;
    Vector3.subtract(this.entity.transform.worldPosition, value.entity.transform.worldPosition, offsetVector);
    (<IFixedJoint>this._nativeJoint).setOffset(offsetVector);
  }

  /**
   * @override
   * @internal
   */
  _onAwake() {
    const jointCollider0 = this._connectedCollider;
    const jointCollider1 = this._collider;
    jointCollider0.collider = null;
    jointCollider1.collider = this.entity.getComponent(Collider);
    this._nativeJoint = PhysicsManager._nativePhysics.createFixedJoint(jointCollider1.collider._nativeCollider);
  }
}
