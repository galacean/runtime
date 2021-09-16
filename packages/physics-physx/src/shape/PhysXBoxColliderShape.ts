import { IBoxColliderShape } from "@oasis-engine/design";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { PhysXPhysics } from "../PhysXPhysics";
import { PhysXColliderShape } from "./PhysXColliderShape";
import { PhysXPhysicsMaterial } from "../PhysXPhysicsMaterial";

/**
 * PhysX Shape for Box
 */
export class PhysXBoxColliderShape extends PhysXColliderShape implements IBoxColliderShape {
  private _tempHalfExtents: Vector3 = new Vector3();

  /**
   * init Box Shape and alloc PhysX objects.
   * @param index index mark Shape
   * @param extents size of Shape
   * @param material material of PhysXCollider
   * @param position position of Shape
   * @param rotation rotation of Shape
   * @remarks must call after this component add to Entity.
   */
  constructor(
    index: number,
    extents: Vector3,
    material: PhysXPhysicsMaterial,
    position: Vector3,
    rotation: Quaternion
  ) {
    super(position, rotation);
    // alloc Physx object
    this._allocGeometry(extents);
    this._allocShape(material);
    this._setLocalPose(this._position, this._rotation);
    this.setID(index);
  }

  /**
   * set size of Box Shape
   * @param value the extents
   */
  setSize(value: Vector3) {
    const halfExtents = this._halfExtents(value);

    this._pxGeometry.halfExtents = {
      x: halfExtents.x,
      y: halfExtents.y,
      z: halfExtents.z
    };
    this._pxShape.setGeometry(this._pxGeometry);
  }

  private _halfExtents(extents: Vector3): Vector3 {
    Vector3.scale(extents, 0.5, this._tempHalfExtents);
    return this._tempHalfExtents;
  }

  private _allocGeometry(extents: Vector3) {
    const halfExtents = this._halfExtents(extents);
    this._pxGeometry = new PhysXPhysics.PhysX.PxBoxGeometry(halfExtents.x, halfExtents.y, halfExtents.z);
  }
}
