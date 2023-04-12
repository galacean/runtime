import { LiteCollider } from "./LiteCollider";
import { IDynamicCollider } from "@galacean/engine-design";
import { Quaternion, Vector3 } from "@galacean/engine";

/**
 * A dynamic collider can act with self-defined movement or physical force
 */
export class LiteDynamicCollider extends LiteCollider implements IDynamicCollider {
  /**
   * Initialize dynamic actor.
   * @param position - The global position
   * @param rotation - The global rotation
   */
  constructor(position: Vector3, rotation: Quaternion) {
    super();
    this._transform.setPosition(position.x, position.y, position.z);
    this._transform.setRotationQuaternion(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  /**
   * {@inheritDoc IDynamicCollider.addForce }
   */
  addForce(force: Vector3): void {
    throw "Physics-lite don't support addForce. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.addTorque }
   */
  addTorque(torque: Vector3): void {
    throw "Physics-lite don't support addTorque. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.move }
   */
  move(positionOrRotation: Vector3 | Quaternion, rotation?: Quaternion): void {
    throw "Physics-lite don't support move. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.sleep }
   */
  sleep(): void {
    throw "Physics-lite don't support putToSleep. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setAngularDamping }
   */
  setAngularDamping(value: number): void {
    throw "Physics-lite don't support setAngularDamping. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setAngularVelocity }
   */
  setAngularVelocity(value: Vector3): void {
    throw "Physics-lite don't support setAngularVelocity. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setCenterOfMass }
   */
  setCenterOfMass(value: Vector3): void {
    throw "Physics-lite don't support setCenterOfMass. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setCollisionDetectionMode }
   */
  setCollisionDetectionMode(value: number): void {
    throw "Physics-lite don't support setCollisionDetectionMode. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setConstraints }
   */
  setConstraints(flags: number): void {
    throw "Physics-lite don't support setConstraints. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setInertiaTensor }
   */
  setInertiaTensor(value: Vector3): void {
    throw "Physics-lite don't support setInertiaTensor. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setIsKinematic }
   */
  setIsKinematic(value: boolean): void {
    throw "Physics-lite don't support setIsKinematic. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setLinearDamping }
   */
  setLinearDamping(value: number): void {
    throw "Physics-lite don't support setLinearDamping. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setLinearVelocity }
   */
  setLinearVelocity(value: Vector3): void {
    throw "Physics-lite don't support setLinearVelocity. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setMass }
   */
  setMass(value: number): void {
    throw "Physics-lite don't support setMass. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setMaxAngularVelocity }
   */
  setMaxAngularVelocity(value: number): void {
    throw "Physics-lite don't support setMaxAngularVelocity. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setMaxDepenetrationVelocity }
   */
  setMaxDepenetrationVelocity(value: number): void {
    throw "Physics-lite don't support setMaxDepenetrationVelocity. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setSleepThreshold }
   */
  setSleepThreshold(value: number): void {
    throw "Physics-lite don't support setSleepThreshold. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.setSolverIterations }
   */
  setSolverIterations(value: number): void {
    throw "Physics-lite don't support setSolverIterations. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IDynamicCollider.wakeUp }
   */
  wakeUp(): void {
    throw "Physics-lite don't support wakeUp. Use Physics-PhysX instead!";
  }
}
