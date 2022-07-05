import { Vector3, Quaternion } from "@oasis-engine/math";
import { ICollider } from "../ICollider";

/**
 * a base interface providing common functionality for joints.
 */
export interface IJoint {
  /**
   * The connected collider.
   */
  setConnectedCollider(value: ICollider): void;

  /**
   *  The scale to apply to the inverse mass of collider 0 for resolving this constraint.
   */
  setConnectedMassScale(value: number): void;

  /**
   * The scale to apply to the inverse inertia of collider0 for resolving this constraint.
   */
  setConnectedInertiaScale(value: number): void;

  /**
   * The scale to apply to the inverse mass of collider 1 for resolving this constraint.
   */
  setMassScale(value: number): void;

  /**
   * The scale to apply to the inverse inertia of collider1 for resolving this constraint.
   */
  setInertiaScale(value: number): void;

  /**
   * The maximum force the joint can apply before breaking.
   */
  setBreakForce(value: number): void;

  /**
   * The maximum torque the joint can apply before breaking.
   */
  setBreakTorque(value: number): void;

  /**
   * set a constraint flags for this joint.
   */
  setConstraintFlags(flags: number): void;
}
