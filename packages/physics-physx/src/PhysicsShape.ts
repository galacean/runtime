import { IPhysicsShape } from "@oasis-engine/design";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { PhysicsMaterial } from "./PhysicsMaterial";
import { PhysXManager } from "./PhysXManager";

/** Flags which affect the behavior of Shapes. */
export enum ShapeFlag {
  /** The shape will partake in collision in the physical simulation. */
  SIMULATION_SHAPE = 1 << 0,
  /** The shape will partake in scene queries (ray casts, overlap tests, sweeps, ...). */
  SCENE_QUERY_SHAPE = 1 << 1,
  /** The shape is a trigger which can send reports whenever other shapes enter/leave its volume. */
  TRIGGER_SHAPE = 1 << 2
}

export class PhysicsShape implements IPhysicsShape {
  protected _position: Vector3;
  protected _rotation: Quaternion;

  protected _shapeFlags: ShapeFlag = ShapeFlag.SCENE_QUERY_SHAPE | ShapeFlag.SIMULATION_SHAPE;

  protected _material: PhysicsMaterial = new PhysicsMaterial(0.1, 0.1, 0.1);

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
   * Physics Material
   */
  get material(): PhysicsMaterial {
    return this._material;
  }

  set material(value: PhysicsMaterial) {
    this._material = value;
    this._pxShape.setMaterials([this.material._pxMaterial]);
  }

  /**
   * Set Trigger or not
   * @param value true for TriggerShape, false for SimulationShape
   */
  setTrigger(value: boolean) {
    this._modifyFlag(ShapeFlag.SIMULATION_SHAPE, !value);
    this._modifyFlag(ShapeFlag.TRIGGER_SHAPE, value);
    this.setFlags(this._shapeFlags);
  }

  /**
   * Set Scene Query or not
   * @param value true for Query, false for not Query
   */
  setSceneQuery(value: boolean) {
    this._modifyFlag(ShapeFlag.SCENE_QUERY_SHAPE, value);
    this.setFlags(this._shapeFlags);
  }

  /**
   * Set Shape Flags
   * @param flags Shape Flag
   */
  setFlags(flags: ShapeFlag) {
    this._shapeFlags = flags;
    this._pxShape.setFlags(new PhysXManager.PhysX.PxShapeFlags(this._shapeFlags));
  }

  /**
   * Set Local Pose for the Shape
   * @param position local position
   * @param rotation local rotation
   */
  setLocalPose(position: Vector3, rotation: Quaternion) {
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
        w: quat.w, // PHYSX uses WXYZ quaternions,
        x: quat.x,
        y: quat.y,
        z: quat.z
      }
    };
    this._pxShape.setLocalPose(transform);
  }

  protected _allocShape() {
    this._pxShape = PhysXManager.physics.createShape(
      this._pxGeometry,
      this._material._pxMaterial,
      false,
      new PhysXManager.PhysX.PxShapeFlags(this._shapeFlags)
    );
  }

  protected _setIndex(index: number) {
    this._pxShape.setQueryFilterData(new PhysXManager.PhysX.PxFilterData(index, 0, 0, 0));
  }

  private _modifyFlag(flag: ShapeFlag, value: boolean) {
    this._shapeFlags = value ? this._shapeFlags | flag : this._shapeFlags & ~flag;
  }
}
