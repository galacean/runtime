import { ISphereColliderShape } from "@oasis-engine/design";
import { LiteColliderShape } from "./LiteColliderShape";
import { BoundingSphere, Quaternion, Ray, Vector3 } from "@oasis-engine/math";
import { HitResult } from "../HitResult";
import { LitePhysicsMaterial } from "../LitePhysicsMaterial";

/** LitePhysics Shape for Sphere */
export class LiteSphereColliderShape extends LiteColliderShape implements ISphereColliderShape {
  private static _tempSphere: BoundingSphere = new BoundingSphere();

  private _radius: number = 1;
  private _maxScale: number = 1;

  get radius(): number {
    return this._radius;
  }

  /**
   * init LiteCollider and alloc PhysX objects.
   * @param index index mark collider
   * @param radius size of SphereCollider
   * @param material material of LiteCollider
   * @remarks must call after this component add to Entity.
   */
  constructor(index: number, radius: number, material: LitePhysicsMaterial) {
    super();
    this._radius = radius;
    this._id = index;
  }

  /**
   * {@inheritDoc ISphereColliderShape.setRadius }
   */
  setRadius(value: number): void {
    this._radius = value;
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  setWorldScale(scale: Vector3): void {
    this._maxScale = Math.max(scale.x, Math.max(scale.x, scale.y));
  }

  /**
   * @internal
   */
  _raycast(ray: Ray, hit: HitResult): boolean {
    const transform = this._transform;
    const boundingSphere = LiteSphereColliderShape._tempSphere;
    Vector3.transformCoordinate(this._transform.position, transform.worldMatrix, boundingSphere.center);
    LiteSphereColliderShape._tempSphere.radius = this._radius * this._maxScale;

    const intersect = ray.intersectSphere(boundingSphere);
    if (intersect !== -1) {
      this._updateHitResult(ray, intersect, hit, ray.origin, true);
      return true;
    } else {
      return false;
    }
  }
}
