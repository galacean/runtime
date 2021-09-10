import { IPhysicsShape } from "./IPhysicsShape";
import { Quaternion, Vector3 } from "@oasis-engine/math";

export interface ICollider {
  /**
   * attach Collider with StaticCollider
   * @param shape The Collider attached
   * @remark must call after init.
   */
  attachShape(shape: IPhysicsShape);

  init(position: Vector3, rotation: Quaternion);

  setGlobalPose(position: Vector3, rotation: Quaternion);

  getGlobalPose(): { translation: Vector3; rotation: Quaternion };
}
