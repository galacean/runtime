import { IColliderShape } from "@oasis-engine/design";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { PhysicsMaterial } from "../PhysicsMaterial";
import { PhysXManager } from "../PhysXManager";

/** Flags which affect the behavior of Shapes. */
export enum ShapeFlag {
  /** The shape will partake in collision in the physical simulation. */
  SIMULATION_SHAPE = 1 << 0,
  /** The shape will partake in scene queries (ray casts, overlap tests, sweeps, ...). */
  SCENE_QUERY_SHAPE = 1 << 1,
  /** The shape is a trigger which can send reports whenever other shapes enter/leave its volume. */
  TRIGGER_SHAPE = 1 << 2
}

/** Abstract class for collision shapes. */
export class ColliderShape implements IColliderShape {
  protected _position: Vector3;
  protected _rotation: Quaternion;

  private _shapeFlags: ShapeFlag = ShapeFlag.SCENE_QUERY_SHAPE | ShapeFlag.SIMULATION_SHAPE;

  /**
   * PhysX shape object
   * @internal
   */
  _pxShape: any;

  /**
   * PhysX geometry object
   * @internal
   */
  _pxGeometry: any;

  /**
   *  Shape Flags
   *  @internal
   */
  get shapeFlags(): ShapeFlag {
    return this._shapeFlags;
  }

  set shapeFlags(flags: ShapeFlag) {
    this._shapeFlags = flags;
    this._pxShape.setFlags(new PhysXManager.PhysX.PxShapeFlags(this._shapeFlags));
  }

  /** local position */
  setPosition(value: Vector3) {
    this._position = value;
    this._setLocalPose();
  }

  /** local rotation */
  setRotation(value: Quaternion) {
    this._rotation = value;
    this._setLocalPose();
  }

  /** physics material on shape */
  setMaterial(value: PhysicsMaterial) {
    this._pxShape.setMaterials([value._pxMaterial]);
  }

  /** physics shape marker */
  setID(index: number) {
    this._pxShape.setQueryFilterData(new PhysXManager.PhysX.PxFilterData(index, 0, 0, 0));
  }

  /**
   * Set Trigger or not
   * @param value true for TriggerShape, false for SimulationShape
   */
  isTrigger(value: boolean) {
    this._modifyFlag(ShapeFlag.SIMULATION_SHAPE, !value);
    this._modifyFlag(ShapeFlag.TRIGGER_SHAPE, value);
    this.shapeFlags = this._shapeFlags;
  }

  /**
   * Set Scene Query or not
   * @param value true for Query, false for not Query
   */
  isSceneQuery(value: boolean) {
    this._modifyFlag(ShapeFlag.SCENE_QUERY_SHAPE, value);
    this.shapeFlags = this._shapeFlags;
  }

  /**
   * Set Local Pose for the Shape
   */
  protected _setLocalPose(position: Vector3 = this._position, rotation: Quaternion = this._rotation) {
    this._position = position;
    this._rotation = rotation;
    const quat = this._rotation.normalize();
    const transform = {
      translation: {
        x: this._position.x,
        y: this._position.y,
        z: this._position.z
      },
      rotation: {
        w: quat.w,
        x: quat.x,
        y: quat.y,
        z: quat.z
      }
    };
    this._pxShape.setLocalPose(transform);
  }

  protected _allocShape(material: PhysicsMaterial) {
    this._pxShape = PhysXManager.physics.createShape(
      this._pxGeometry,
      material._pxMaterial,
      false,
      new PhysXManager.PhysX.PxShapeFlags(this._shapeFlags)
    );
  }

  private _modifyFlag(flag: ShapeFlag, value: boolean) {
    this._shapeFlags = value ? this._shapeFlags | flag : this._shapeFlags & ~flag;
  }
}
