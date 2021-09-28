import { IBoxColliderShape } from "@oasis-engine/design";
import { BoundingBox, Ray, Vector3 } from "@oasis-engine/math";
import { LiteColliderShape } from "./LiteColliderShape";
import { LiteHitResult } from "../LiteHitResult";
import { LitePhysicsMaterial } from "../LitePhysicsMaterial";

/**
 * Box collider shape in Lite.
 */
export class LiteBoxColliderShape extends LiteColliderShape implements IBoxColliderShape {
  private static _tempBox: BoundingBox = new BoundingBox();
  private static _tempHalfExtents = new Vector3();
  private _halfSize: Vector3 = new Vector3();

  /** @internal */
  _boxMin: Vector3 = new Vector3(-0.5, -0.5, -0.5);
  /** @internal */
  _boxMax: Vector3 = new Vector3(0.5, 0.5, 0.5);

  /**
   * Init Box Shape.
   * @param uniqueID - UniqueID mark Shape.
   * @param size - Size of Shape.
   * @param material - Material of PhysXCollider.
   */
  constructor(uniqueID: number, size: Vector3, material: LitePhysicsMaterial) {
    super();
    this._id = uniqueID;
    this._halfSize.setValue(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    this._setBondingBox();
  }

  /**
   * {@inheritDoc IColliderShape.setPosition }
   */
  setPosition(position: Vector3): void {
    super.setPosition(position);
    this._setBondingBox();
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  setWorldScale(scale: Vector3): void {
    this._transform.setScale(scale.x, scale.y, scale.z);
    this._setBondingBox();
  }

  /**
   * {@inheritDoc IBoxColliderShape.setSize }
   */
  setSize(value: Vector3): void {
    this._halfSize.setValue(value.x * 0.5, value.y * 0.5, value.z * 0.5);
    this._setBondingBox();
  }

  /**
   * @internal
   */
  _raycast(ray: Ray, hit: LiteHitResult): boolean {
    const localRay = this._getLocalRay(ray);

    const boundingBox = LiteBoxColliderShape._tempBox;
    this._boxMin.cloneTo(boundingBox.min);
    this._boxMax.cloneTo(boundingBox.max);
    const intersect = localRay.intersectBox(boundingBox);
    if (intersect !== -1) {
      this._updateHitResult(localRay, intersect, hit, ray.origin);
      return true;
    } else {
      return false;
    }
  }

  private _setBondingBox(): void {
    const { position: center, scale } = this._transform;
    const halfSize = this._halfSize;

    const extents = LiteBoxColliderShape._tempHalfExtents;
    extents.setValue(scale.x * halfSize.x, scale.y * halfSize.y, scale.z * halfSize.z);
    Vector3.add(center, extents, this._boxMax);
    Vector3.subtract(center, extents, this._boxMin);
  }
}
