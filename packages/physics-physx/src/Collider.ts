import { ICollider } from "@oasis-engine/design";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { ColliderShape } from "./shape/ColliderShape";

/**
 * physical collider
 */
export abstract class Collider implements ICollider {
  /**
   * PhysX actor object
   * @internal
   */
  _pxActor: any;

  /** @internal */
  _shapes: ColliderShape[] = [];

  /**
   * attach collider shape on collider
   * @param shape The collider shape attached
   */
  addShape(shape: ColliderShape) {
    this._shapes.push(shape);
    this._pxActor.attachShape(shape._pxShape);
  }

  /**
   * remove collider shape on collider
   * @param shape The collider shape attached
   */
  removeShape(shape: ColliderShape): void {
    this._pxActor.detachShape(shape._pxShape);
    let removeID = this._shapes.findIndex((value) => {
      return value == shape;
    });
    this._shapes.splice(removeID, 1);
  }

  /**
   * set global pose of collider
   * @param position the global position
   * @param rotation the global rotation
   */
  setGlobalPose(position: Vector3, rotation: Quaternion) {
    const transform = this._transform(position, rotation);
    this._pxActor.setGlobalPose(transform, true);
  }

  /**
   * get global pose of collider
   * @param position the global position
   * @param rotation the global rotation
   */
  getGlobalPose(position: Vector3, rotation: Quaternion) {
    const transform = this._pxActor.getGlobalPose();
    position.setValue(transform.translation.x, transform.translation.y, transform.translation.z);
    rotation.setValue(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
  }

  /**
   * PhysX transform object
   * @internal
   */
  _transform(position: Vector3, rotation: Quaternion): any {
    const quat = rotation.normalize();
    return {
      translation: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      rotation: {
        w: quat.w,
        x: quat.x,
        y: quat.y,
        z: quat.z
      }
    };
  }
}
