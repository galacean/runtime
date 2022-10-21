import { Vector2 } from "@oasis-engine/math";
import { Entity } from "../../Entity";
import { PointerButton } from "../enums/PointerButton";
import { PointerPhase } from "../enums/PointerPhase";

/**
 * Pointer.
 */
export class Pointer {
  /**
   * Unique id.
   * @remark Start from 0.
   */
  readonly id: number;
  /** The phase of pointer. */
  phase: PointerPhase = PointerPhase.Leave;
  /** The button that triggers the pointer event. */
  button: PointerButton;
  /** The currently pressed buttons for this pointer. */
  pressedButtons: number;
  /** The position of the pointer in screen space pixel coordinates. */
  position: Vector2 = new Vector2();
  /** The change of the pointer. */
  deltaPosition: Vector2 = new Vector2();
  /** The time stamp the pointer was generated. */
  timeStamp: number = 0;
  /** @internal */
  _events: PointerEvent[] = [];

  private _currentPressedEntity: Entity;
  private _currentEnteredEntity: Entity;

  /** @internal */
  _firePointerExitAndEnter(rayCastEntity: Entity): void {
    if (this._currentEnteredEntity !== rayCastEntity) {
      if (this._currentEnteredEntity) {
        const scripts = this._currentEnteredEntity._scripts;
        for (let i = scripts.length - 1; i >= 0; i--) {
          const script = scripts.get(i);
          script._waitHandlingInValid || script.onPointerExit(this);
        }
      }
      if (rayCastEntity) {
        const scripts = rayCastEntity._scripts;
        for (let i = scripts.length - 1; i >= 0; i--) {
          const script = scripts.get(i);
          script._waitHandlingInValid || script.onPointerEnter(this);
        }
      }
      this._currentEnteredEntity = rayCastEntity;
    }
  }

  /** @internal */
  _firePointerDown(rayCastEntity: Entity): void {
    if (rayCastEntity) {
      const scripts = rayCastEntity._scripts;
      for (let i = scripts.length - 1; i >= 0; i--) {
        const script = scripts.get(i);
        script._waitHandlingInValid || script.onPointerDown(this);
      }
    }
    this._currentPressedEntity = rayCastEntity;
  }

  /** @internal */
  _firePointerDrag(): void {
    if (this._currentPressedEntity) {
      const scripts = this._currentPressedEntity._scripts;
      for (let i = scripts.length - 1; i >= 0; i--) {
        const script = scripts.get(i);
        script._waitHandlingInValid || script.onPointerDrag(this);
      }
    }
  }

  /** @internal */
  _firePointerUpAndClick(rayCastEntity: Entity): void {
    const { _currentPressedEntity: pressedEntity } = this;
    if (pressedEntity) {
      const sameTarget = pressedEntity === rayCastEntity;
      const scripts = pressedEntity._scripts;
      for (let i = scripts.length - 1; i >= 0; i--) {
        const script = scripts.get(i);
        if (!script._waitHandlingInValid) {
          sameTarget && script.onPointerClick(this);
          script.onPointerUp(this);
        }
      }
      this._currentPressedEntity = null;
    }
  }

  /**
   * @internal
   */
  constructor(id: number) {
    this.id = id;
  }
}
