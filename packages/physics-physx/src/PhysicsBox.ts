import { IPhysicsBox } from "@oasis-engine/design";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { PhysXManager } from "./PhysXManager";
import { PhysicsShape } from "./PhysicsShape";

export class PhysicsBox extends PhysicsShape implements IPhysicsBox {
  private _size: Vector3 = new Vector3();

  get size(): Vector3 {
    return this._size;
  }

  /**
   * set size of collider
   * @param value size of BoxCollider
   * @remarks will re-alloc new PhysX object.
   */
  set size(value: Vector3) {
    this._size = value;
    this.initWithSize(this._index, value, this._position, this._rotation);
  }

  /**
   * init Collider and alloc PhysX objects.
   * @param index index mark collider
   * @param value size of BoxCollider
   * @param position position of Collider
   * @param rotation rotation of Collider
   * @remarks must call after this component add to Entity.
   */
  initWithSize(index: number, value: Vector3, position: Vector3, rotation: Quaternion): void {
    this._index = index;
    this._size = value;
    this._position = position;
    this._rotation = rotation;

    // alloc Physx object
    this._allocGeometry();
    this._allocShape();
    this.setLocalPose(this._position, this._rotation);
    this._pxShape.setQueryFilterData(new PhysXManager.PhysX.PxFilterData(this._index, 0, 0, 0));
  }

  //----------------------------------------------------------------------------
  private _allocGeometry() {
    this._pxGeometry = new PhysXManager.PhysX.PxBoxGeometry(
      // PHYSX uses half-extents
      this._size.x / 2,
      this._size.y / 2,
      this._size.z / 2
    );
  }
}
