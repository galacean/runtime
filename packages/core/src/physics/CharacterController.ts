import { ICharacterController } from "@oasis-engine/design";
import { Vector3 } from "@oasis-engine/math";
import { Entity } from "../Entity";
import { Collider } from "./Collider";
import { ControllerNonWalkableMode } from "./enums/ControllerNonWalkableMode";
import { PhysicsManager } from "./PhysicsManager";
import { ColliderShape } from "./shape";

/**
 * The character controllers.
 */
export class CharacterController extends Collider {
  private static _tempVec = new Vector3();
  /** @internal */
  _index: number = -1;

  private _stepOffset: number = 0.5;
  private _nonWalkableMode: ControllerNonWalkableMode = ControllerNonWalkableMode.PreventClimbing;
  private _upDirection = new Vector3(0, 1, 0);
  private _slopeLimit: number = 0.707;
  private _center = new Vector3();
  private _scaledCenter = new Vector3();

  /**
   * The step offset for the controller.
   */
  get stepOffset(): number {
    return this._stepOffset;
  }

  set stepOffset(value: number) {
    if (this._stepOffset !== value) {
      this._stepOffset = value;
      (<ICharacterController>this._nativeCollider).setStepOffset(value);
    }
  }

  /**
   * The value of the non-walkable mode.
   */
  get nonWalkableMode(): ControllerNonWalkableMode {
    return this._nonWalkableMode;
  }

  set nonWalkableMode(value: ControllerNonWalkableMode) {
    if (this._nonWalkableMode !== value) {
      this._nonWalkableMode = value;
      (<ICharacterController>this._nativeCollider).setNonWalkableMode(value);
    }
  }

  /**
   * The up direction for the controller.
   */
  get upDirection(): Vector3 {
    return this._upDirection;
  }

  set upDirection(value: Vector3) {
    if (this._upDirection !== value) {
      this._upDirection.copyFrom(value);
    }
  }

  /**
   * The center of the character relative to the transform's position.
   */
  get center(): Vector3 {
    return this._center;
  }

  set center(value: Vector3) {
    if (this._center !== value) {
      this._center.copyFrom(value);
    }
  }

  /**
   * The slope limit for the controller.
   */
  get slopeLimit(): number {
    return this._slopeLimit;
  }

  set slopeLimit(value: number) {
    if (this._slopeLimit !== value) {
      this._slopeLimit = value;
      (<ICharacterController>this._nativeCollider).setSlopeLimit(value);
    }
  }

  /**
   * @internal
   */
  constructor(entity: Entity) {
    super(entity);
    (<ICharacterController>this._nativeCollider) = PhysicsManager._nativePhysics.createCharacterController();

    this._setUpDirection = this._setUpDirection.bind(this);
    this._setCenter = this._setCenter.bind(this);

    //@ts-ignore
    this._upDirection._onValueChanged = this._setUpDirection;
    //@ts-ignore
    this._center._onValueChanged = this._setCenter;
  }

  /**
   * Moves the character using a "collide-and-slide" algorithm.
   * @param disp - Displacement vector
   * @param minDist - The minimum travelled distance to consider.
   * @param elapsedTime - Time elapsed since last call
   * @return flags - The ControllerCollisionFlag
   */
  move(disp: Vector3, minDist: number, elapsedTime: number): number {
    return (<ICharacterController>this._nativeCollider).move(disp, minDist, elapsedTime);
  }

  /**
   * Add collider shape on this controller.
   * @param shape - Collider shape
   * @override
   */
  addShape(shape: ColliderShape): void {
    if (this._shapes.length > 0) {
      throw "only allow single shape on controller!";
    }
    super.addShape(shape);
    this._updateFlag.flag = true;
  }

  /**
   * Remove all shape attached.
   * @override
   */
  clearShapes(): void {
    if (this._shapes.length > 0) {
      super.removeShape(this._shapes[0]);
    }
  }

  /**
   * @internal
   * @override
   */
  _onUpdate() {
    if (this._updateFlag.flag) {
      const { transform } = this.entity;
      const { shapes, _center: center, _scaledCenter: scaledCenter } = this;

      const worldScale = transform.lossyWorldScale;
      for (let i = 0, n = shapes.length; i < n; i++) {
        shapes[i]._nativeShape.setWorldScale(worldScale);
      }

      Vector3.multiply(center, worldScale, scaledCenter);
      Vector3.add(transform.worldPosition, scaledCenter, CharacterController._tempVec);
      (<ICharacterController>this._nativeCollider).setWorldPosition(CharacterController._tempVec);

      this._updateFlag.flag = false;
    }
  }

  /**
   * @internal
   * @override
   */
  _onLateUpdate() {
    (<ICharacterController>this._nativeCollider).getWorldPosition(CharacterController._tempVec);
    Vector3.subtract(CharacterController._tempVec, this._scaledCenter, this.entity.transform.worldPosition);
    this._updateFlag.flag = false;
  }

  /**
   * @override
   * @internal
   */
  _onEnable() {
    this.engine.physicsManager._addCharacterController(this);
  }

  /**
   * @override
   * @internal
   */
  _onDisable() {
    this.engine.physicsManager._removeCharacterController(this);
  }

  private _setUpDirection(): void {
    (<ICharacterController>this._nativeCollider).setUpDirection(this._upDirection);
  }

  private _setCenter(): void {
    this._updateFlag.flag = true;
  }
}
