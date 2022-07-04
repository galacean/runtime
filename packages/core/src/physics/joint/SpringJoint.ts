import { Joint } from "./Joint";
import { ISpringJoint } from "@oasis-engine/design";
import { PhysicsManager } from "../PhysicsManager";
import { SpringJointFlag } from "../enums";
import { Collider } from "../Collider";
import { dependentComponents } from "../../ComponentsDependencies";
import { Vector3 } from "@oasis-engine/math";

/**
 * A joint that maintains an upper or lower bound (or both) on the distance between two points on different objects.
 * @decorator `@dependentComponents(Collider)`
 */
@dependentComponents(Collider)
export class SpringJoint extends Joint {
  private _minDistance: number = 0;
  private _maxDistance: number = 0;
  private _tolerance: number = 0;
  private _stiffness: number = 0;
  private _damping: number = 0;
  private _swingOffset: Vector3 = new Vector3();

  /**
   * The minimum distance.
   */
  get minDistance(): number {
    return this._minDistance;
  }

  set minDistance(value: number) {
    this._minDistance = value;
    (<ISpringJoint>this._nativeJoint).setMinDistance(value);
  }

  /**
   * The maximum distance.
   */
  get maxDistance(): number {
    return this._maxDistance;
  }

  set maxDistance(value: number) {
    this._maxDistance = value;
    (<ISpringJoint>this._nativeJoint).setMaxDistance(value);
  }

  /**
   * The distance beyond the allowed range at which the joint becomes active.
   */
  get tolerance(): number {
    return this._tolerance;
  }

  set tolerance(value: number) {
    this._tolerance = value;
    (<ISpringJoint>this._nativeJoint).setTolerance(value);
  }

  /**
   * The spring strength of the joint.
   */
  get stiffness(): number {
    return this._stiffness;
  }

  set stiffness(value: number) {
    this._stiffness = value;
    (<ISpringJoint>this._nativeJoint).setStiffness(value);
  }

  /**
   * The degree of damping of the joint spring of the joint.
   */
  get damping(): number {
    return this._damping;
  }

  set damping(value: number) {
    this._damping = value;
    (<ISpringJoint>this._nativeJoint).setDamping(value);
  }

  /**
   * The swing offset.
   */
  get swingOffset(): Vector3 {
    return this._swingOffset;
  }

  set swingOffset(value: Vector3) {
    if (value !== this._swingOffset) {
      this._swingOffset.copyFrom(value);
    }
    this.localPosition1 = value;
  }

  /**
   * The connected collider.
   */
  get connectedCollider(): Collider {
    return this.collider0;
  }

  set connectedCollider(value: Collider) {
    this.collider0 = value;
  }

  /**
   * The connected anchor position.
   * @note If connectedCollider is set, this anchor is relative offset.
   * Or the anchor is world anchor position.
   */
  get connectedAnchor(): Vector3 {
    return this.localPosition0;
  }

  set connectedAnchor(value: Vector3) {
    this.localPosition0 = value;
  }

  /**
   * Set a single flag specific to a Distance Joint to true or false.
   * @param flag The flag to set or clear.
   * @param value the value to which to set the flag
   */
  setDistanceJointFlag(flag: SpringJointFlag, value: boolean): void {
    (<ISpringJoint>this._nativeJoint).setDistanceJointFlag(flag, value);
  }

  /**
   * @override
   * @internal
   */
  _onAwake() {
    const jointCollider0 = this._jointCollider0;
    const jointCollider1 = this._jointCollider1;
    jointCollider0.collider = null;
    jointCollider1.collider = this.entity.getComponent(Collider);
    this._nativeJoint = PhysicsManager._nativePhysics.createSpringJoint(
      null,
      jointCollider0.localPosition,
      jointCollider0.localRotation,
      jointCollider1.collider._nativeCollider,
      jointCollider1.localPosition,
      jointCollider1.localRotation
    );
  }
}
