import { Component } from "../Component";
import { ignoreClone } from "../clone/CloneManager";
import { ICollider } from "@oasis-engine/design";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { ColliderShape } from "./shape/ColliderShape";
import { DisorderedArray } from "../DisorderedArray";
import { UpdateFlag } from "../UpdateFlag";
import { Entity } from "../Entity";

/**
 * Abstract class for collider shapes.
 */
export abstract class Collider extends Component {
  /** @internal */
  @ignoreClone
  _index: number = -1;
  /** @internal */
  _nativeCollider: ICollider;

  private _shapes: DisorderedArray<ColliderShape> = new DisorderedArray();
  protected _updateFlag: UpdateFlag;

  /**
   * The shapes of this collider.
   */
  get shapes(): Readonly<ColliderShape[]> {
    return this._shapes._elements;
  }

  protected constructor(entity: Entity) {
    super(entity);
    this._updateFlag = this.entity.transform.registerWorldChangeFlag();
    this._updateFlag.flag = false;
  }

  /**
   * Add collider shape on this collider.
   * @param shape collider shape.
   */
  addShape(shape: ColliderShape): void {
    shape._collider = this;
    this._nativeCollider.addShape(shape._nativeShape);
    shape._index = this._shapes.length;
    this._shapes.add(shape);
  }

  /**
   * Remove a collider shape.
   * @param shape - The collider shape.
   */
  removeShape(shape: ColliderShape): void {
    this._nativeCollider.removeShape(shape._nativeShape);
    const replaced = this._shapes.deleteByIndex(shape._index);
    replaced && (replaced._index = shape._index);
    shape._index = -1;
  }

  /**
   * Remove all shape attached.
   */
  clearAllShape(): void {
    let shapes = this._shapes;
    for (let i = 0, len = shapes.length; i < len; i++) {
      this.removeShape(shapes[i]);
    }
  }

  /**
   * @internal
   */
  abstract _onUpdate();

  /**
   * @override
   * @internal
   */
  _onEnable() {
    this.engine._componentsManager.addCollider(this);
  }

  /**
   * @override
   * @internal
   */
  _onDisable() {
    this.engine._componentsManager.removeCollider(this);
  }
}
