import { PhysXPhysics } from "./PhysXPhysics";
import { Ray, Vector3 } from "@oasis-engine/math";
import { IPhysicsManager } from "@oasis-engine/design";
import { PhysXCollider } from "./PhysXCollider";
import { DisorderedArray } from "./DisorderedArray";

/**
 * A manager is a collection of bodies and constraints which can interact.
 */
export class PhysXPhysicsManager implements IPhysicsManager {
  private static _tempPosition: Vector3 = new Vector3();
  private static _tempNormal: Vector3 = new Vector3();
  private static _pxRaycastHit: any;
  private static _pxFilterData: any;

  static _init() {
    PhysXPhysicsManager._pxRaycastHit = new PhysXPhysics._physX.PxRaycastHit();
    PhysXPhysicsManager._pxFilterData = new PhysXPhysics._physX.PxQueryFilterData();
    PhysXPhysicsManager._pxFilterData.flags = new PhysXPhysics._physX.PxQueryFlags(
      QueryFlag.STATIC | QueryFlag.DYNAMIC
    );
  }

  private _pxScene: any;

  private readonly _onContactEnter?: (obj1: number, obj2: number) => void;
  private readonly _onContactExit?: (obj1: number, obj2: number) => void;
  private readonly _onContactStay?: (obj1: number, obj2: number) => void;
  private readonly _onTriggerEnter?: (obj1: number, obj2: number) => void;
  private readonly _onTriggerExit?: (obj1: number, obj2: number) => void;
  private readonly _onTriggerStay?: (obj1: number, obj2: number) => void;

  private _currentEvents: DisorderedArray<TriggerEvent> = new DisorderedArray<TriggerEvent>();
  private _eventMap: Record<number, Record<number, TriggerEvent>> = {};
  private _eventPool: TriggerEvent[] = [];

  constructor(
    onContactEnter?: (obj1: number, obj2: number) => void,
    onContactExit?: (obj1: number, obj2: number) => void,
    onContactStay?: (obj1: number, obj2: number) => void,
    onTriggerEnter?: (obj1: number, obj2: number) => void,
    onTriggerExit?: (obj1: number, obj2: number) => void,
    onTriggerStay?: (obj1: number, obj2: number) => void
  ) {
    this._onContactEnter = onContactEnter;
    this._onContactExit = onContactExit;
    this._onContactStay = onContactStay;
    this._onTriggerEnter = onTriggerEnter;
    this._onTriggerExit = onTriggerExit;
    this._onTriggerStay = onTriggerStay;

    const triggerCallback = {
      onContactBegin: (obj1, obj2) => {},
      onContactEnd: (obj1, obj2) => {},
      onContactPersist: (obj1, obj2) => {},
      onTriggerBegin: (obj1, obj2) => {
        const index1 = obj1.getQueryFilterData().word0;
        const index2 = obj2.getQueryFilterData().word0;
        const event = index1 < index2 ? this._getTrigger(index1, index2) : this._getTrigger(index2, index1);
        event.state = TriggerEventState.Enter;
        this._currentEvents.add(event);
      },
      onTriggerEnd: (obj1, obj2) => {
        const index1 = obj1.getQueryFilterData().word0;
        const index2 = obj2.getQueryFilterData().word0;
        let event: TriggerEvent;
        if (index1 < index2) {
          const subMap = this._eventMap[index1];
          event = subMap[index2];
          subMap[index2] = undefined;
        } else {
          const subMap = this._eventMap[index2];
          event = subMap[index1];
          subMap[index1] = undefined;
        }
        event.state = TriggerEventState.Exit;
      }
    };

    const PHYSXSimulationCallbackInstance = PhysXPhysics._physX.PxSimulationEventCallback.implement(triggerCallback);
    const sceneDesc = PhysXPhysics._physX.getDefaultSceneDesc(
      PhysXPhysics._pxPhysics.getTolerancesScale(),
      0,
      PHYSXSimulationCallbackInstance
    );
    this._pxScene = PhysXPhysics._pxPhysics.createScene(sceneDesc);
  }

  /**
   * {@inheritDoc IPhysicsManager.setGravity }
   */
  setGravity(value: Vector3) {
    this._pxScene.setGravity(value);
  }

  /**
   * {@inheritDoc IPhysicsManager.addCollider }
   */
  addCollider(collider: PhysXCollider): void {
    this._pxScene.addActor(collider._pxActor, null);
    const shapes = collider._shapes;
    for (let i = 0, n = shapes.length; i < n; i++) {
      this._eventMap[shapes[i]._id] = {};
    }
  }

  /**
   * {@inheritDoc IPhysicsManager.removeCollider }
   */
  removeCollider(collider: PhysXCollider): void {
    this._pxScene.removeActor(collider._pxActor, true);
    const shapes = collider._shapes;
    for (let i = 0, n = shapes.length; i < n; i++) {
      delete this._eventMap[shapes[i]._id];
    }
  }

  /**
   * {@inheritDoc IPhysicsManager.update }
   */
  update(elapsedTime: number): void {
    this._simulate(elapsedTime);
    this._fetchResults();
    this._fireEvent();
  }

  /**
   * {@inheritDoc IPhysicsManager.raycast }
   */
  raycast(
    ray: Ray,
    distance: number,
    hit?: (shapeUniqueID: number, distance: number, position: Vector3, normal: Vector3) => void
  ): boolean {
    const result = this._pxScene.raycastSingle(
      ray.origin,
      ray.direction,
      distance,
      PhysXPhysicsManager._pxRaycastHit,
      PhysXPhysicsManager._pxFilterData
    );

    if (result == false) {
      return false;
    }

    if (hit != undefined) {
      const hitResult = PhysXPhysicsManager._pxRaycastHit;
      const { position: pos, normal: nor } = hitResult;

      const position = PhysXPhysicsManager._tempPosition;
      position.setValue(pos.x, pos.y, pos.z);

      const normal = PhysXPhysicsManager._tempNormal;
      normal.setValue(nor.x, nor.y, nor.z);

      hit(hitResult.getShape().getQueryFilterData().word0, hitResult.distance, position, normal);
    }
    return result;
  }

  private _simulate(elapsedTime: number = 1 / 60, controlSimulation: boolean = true): void {
    this._pxScene.simulate(elapsedTime, controlSimulation);
  }

  private _fetchResults(block: boolean = true): void {
    this._pxScene.fetchResults(block);
  }

  private _advance(): void {
    this._pxScene.advance();
  }

  private _fetchCollision(block: boolean = true): void {
    this._pxScene.fetchCollision(block);
  }

  private _collide(elapsedTime: number = 1 / 60): void {
    this._pxScene.collide(elapsedTime);
  }

  private _getTrigger(index1: number, index2: number): TriggerEvent {
    const event = this._eventPool.length ? this._eventPool.pop() : new TriggerEvent(index1, index2);
    this._eventMap[index1][index2] = event;
    return event;
  }

  private _fireEvent(): void {
    const { _eventPool: eventPool, _currentEvents: currentEvents } = this;
    for (let i = 0, n = currentEvents.length; i < n; ) {
      const event = currentEvents.get(i);
      if (event.state == TriggerEventState.Enter) {
        this._onTriggerEnter(event.index1, event.index2);
        event.state = TriggerEventState.Stay;
        i++;
      } else if (event.state == TriggerEventState.Stay) {
        this._onTriggerStay(event.index1, event.index2);
        i++;
      } else if (event.state == TriggerEventState.Exit) {
        this._onTriggerExit(event.index1, event.index2);
        currentEvents.deleteByIndex(i);
        eventPool.push(event);
        n--;
      }
    }
  }
}

/**
 * Filtering flags for scene queries.
 */
enum QueryFlag {
  STATIC = 1 << 0,
  DYNAMIC = 1 << 1,
  ANY_HIT = 1 << 4,
  NO_BLOCK = 1 << 5
}

/**
 * Physics state
 */
enum TriggerEventState {
  Enter,
  Stay,
  Exit
}

/**
 * Trigger event to store interactive object ids and state.
 */
class TriggerEvent {
  state: TriggerEventState;
  index1: number;
  index2: number;

  constructor(index1: number, index2: number) {
    this.index1 = index1;
    this.index2 = index2;
  }
}
