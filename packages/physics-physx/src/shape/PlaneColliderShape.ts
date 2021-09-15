import { ColliderShape } from "./ColliderShape";
import { IPlaneColliderShape } from "@oasis-engine/design";
import { PhysicsMaterial } from "../PhysicsMaterial";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { PhysXPhysics } from "../PhysXPhysics";

/**
 * PhysX Shape for Plane
 */
export class PlaneColliderShape extends ColliderShape implements IPlaneColliderShape {
  /**
   * init Collider and alloc PhysX objects.
   * @param index index mark collider
   * @param material material of Collider
   * @param position position of Collider
   * @param rotation rotation of Collider
   * @remarks must call after this component add to Entity.
   */
  constructor(index: number, material: PhysicsMaterial, position: Vector3, rotation: Quaternion) {
    super(position, rotation);

    // alloc Physx object
    this._allocGeometry();
    this._allocShape(material);
    this._setLocalPose(this._position, this._rotation);
    this.setID(index);
  }

  private _allocGeometry() {
    this._pxGeometry = new PhysXPhysics.PhysX.PxPlaneGeometry();
  }
}
