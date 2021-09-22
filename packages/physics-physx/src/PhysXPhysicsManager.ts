import { PhysXPhysics } from "./PhysXPhysics";
import { Ray, Vector3 } from "@oasis-engine/math";
import { IPhysicsManager } from "@oasis-engine/design";
import { PhysXCollider } from "./PhysXCollider";

/**
 * A manager is a collection of bodies and constraints which can interact.
 */
export class PhysXPhysicsManager implements IPhysicsManager {
  private static _tempPosition: Vector3 = new Vector3();
  private static _tempNormal: Vector3 = new Vector3();
  private static _pxRaycastHit: any;
  private static _pxFilterData: any;
  private static _tempGravity = {
    x: 0,
    y: -9.81,
    z: 0
  };
  private static _tempOrigin = {
    x: 0,
    y: 0,
    z: 0
  };
  private static _tempDirection = {
    x: 0,
    y: 0,
    z: 0
  };

  private _queryFlag: QueryFlag = QueryFlag.STATIC | QueryFlag.DYNAMIC;
  private _pxScene: any;

  private readonly _onContactBegin?: Function;
  private readonly _onContactEnd?: Function;
  private readonly _onContactPersist?: Function;
  private readonly _onTriggerBegin?: Function;
  private readonly _onTriggerEnd?: Function;
  private readonly _onTriggerPersist?: Function;

  private _eventMap: Map<number, [number, PhysicsState]> = new Map();

  private _gravity: Vector3 = new Vector3(0, -9.81, 0);

  /**
   * Global gravity in the physical scene.
   */
  get gravity(): Vector3 {
    return this._gravity;
  }

  set gravity(value: Vector3) {
    if (this._gravity !== value) {
      value.cloneTo(this._gravity);
    }
    PhysXPhysicsManager._tempGravity.x = value.x;
    PhysXPhysicsManager._tempGravity.y = value.y;
    PhysXPhysicsManager._tempGravity.z = value.z;
    this._pxScene.setGravity(PhysXPhysicsManager._tempGravity);
  }

  constructor(
    onContactBegin?: (obj1: number, obj2: number) => void,
    onContactEnd?: (obj1: number, obj2: number) => void,
    onContactPersist?: (obj1: number, obj2: number) => void,
    onTriggerBegin?: (obj1: number, obj2: number) => void,
    onTriggerEnd?: (obj1: number, obj2: number) => void,
    onTriggerPersist?: (obj1: number, obj2: number) => void
  ) {
    this._onContactBegin = onContactBegin;
    this._onContactEnd = onContactEnd;
    this._onContactPersist = onContactPersist;
    this._onTriggerBegin = onTriggerBegin;
    this._onTriggerEnd = onTriggerEnd;
    this._onTriggerPersist = onTriggerPersist;

    const triggerCallback = {
      onContactBegin: (obj1, obj2) => {},
      onContactEnd: (obj1, obj2) => {},
      onContactPersist: (obj1, obj2) => {},
      onTriggerBegin: (obj1, obj2) => {
        this._eventMap.set(obj1.getQueryFilterData().word0, [
          obj2.getQueryFilterData().word0,
          PhysicsState.TOUCH_FOUND
        ]);
        this._eventMap.set(obj2.getQueryFilterData().word0, [
          obj1.getQueryFilterData().word0,
          PhysicsState.TOUCH_FOUND
        ]);
      },
      onTriggerEnd: (obj1, obj2) => {
        this._eventMap.set(obj1.getQueryFilterData().word0, [obj2.getQueryFilterData().word0, PhysicsState.TOUCH_LOST]);
        this._eventMap.set(obj2.getQueryFilterData().word0, [obj1.getQueryFilterData().word0, PhysicsState.TOUCH_LOST]);
      }
    };

    const PHYSXSimulationCallbackInstance = PhysXPhysics.PhysX.PxSimulationEventCallback.implement(triggerCallback);
    const sceneDesc = PhysXPhysics.PhysX.getDefaultSceneDesc(
      PhysXPhysics.physics.getTolerancesScale(),
      0,
      PHYSXSimulationCallbackInstance
    );
    this._pxScene = PhysXPhysics.physics.createScene(sceneDesc);

    PhysXPhysicsManager._pxRaycastHit = new PhysXPhysics.PhysX.PxRaycastHit();
    PhysXPhysicsManager._pxFilterData = new PhysXPhysics.PhysX.PxQueryFilterData();
  }

  //--------------public APIs--------------------------------------------------
  /**
   * Add PhysXCollider into the manager
   * @param collider - PhysXStaticCollider or PhysXDynamicCollider
   */
  addCollider(collider: PhysXCollider) {
    this._pxScene.addActor(collider._pxActor, null);
    for (let i = 0, len = collider._shapes.length; i < len; i++) {
      this._eventMap.set(collider._shapes[i]._id, [null, PhysicsState.TOUCH_NONE]);
    }
  }

  /**
   * Remove PhysXCollider
   * @param collider - PhysXStaticCollider or PhysXDynamicCollider
   */
  removeCollider(collider: PhysXCollider) {
    this._pxScene.removeActor(collider._pxActor, true);
    for (let i = 0, len = collider._shapes.length; i < len; i++) {
      this._eventMap.delete(collider._shapes[i]._id);
    }
  }

  /**
   * Call on every frame to update pose of objects.
   */
  update(elapsedTime: number) {
    this._simulate(elapsedTime);
    this._fetchResults();
    this._resolveEvent();
  }

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param distance - The max distance the ray should check
   * @returns Returns true if the ray intersects with a PhysXCollider, otherwise false
   */
  raycast(ray: Ray, distance: number): Boolean;

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param distance - The max distance the ray should check
   * @param outHitResult - If true is returned, outHitResult will contain more detailed collision information
   * @returns Returns true if the ray intersects with a PhysXCollider, otherwise false.
   */
  raycast(ray: Ray, distance: number, outHitResult: Function): Boolean;

  raycast(
    ray: Ray,
    distance: number,
    hit?: (id: number, distance: number, position: Vector3, normal: Vector3) => void
  ): boolean {
    PhysXPhysicsManager._pxFilterData.flags = new PhysXPhysics.PhysX.PxQueryFlags(this._queryFlag);

    const { origin, direction } = ray;
    PhysXPhysicsManager._tempOrigin.x = origin.x;
    PhysXPhysicsManager._tempOrigin.y = origin.y;
    PhysXPhysicsManager._tempOrigin.z = origin.z;
    PhysXPhysicsManager._tempDirection.x = direction.x;
    PhysXPhysicsManager._tempDirection.y = direction.y;
    PhysXPhysicsManager._tempDirection.z = direction.z;

    const result = this._pxScene.raycastSingle(
      PhysXPhysicsManager._tempOrigin,
      PhysXPhysicsManager._tempDirection,
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

  //--------------private APIs -------------------------------------------------
  private _simulate(elapsedTime: number = 1 / 60, controlSimulation: boolean = true) {
    this._pxScene.simulate(elapsedTime, controlSimulation);
  }

  private _fetchResults(block: boolean = true) {
    this._pxScene.fetchResults(block);
  }

  private _advance() {
    this._pxScene.advance();
  }

  private _fetchCollision(block: boolean = true) {
    this._pxScene.fetchCollision(block);
  }

  private _collide(elapsedTime: number = 1 / 60) {
    this._pxScene.collide(elapsedTime);
  }

  private _resolveEvent() {
    this._eventMap.forEach((value, key) => {
      if (value[1] == PhysicsState.TOUCH_FOUND) {
        this._onTriggerBegin(key, value[0]);
        this._eventMap.set(key, [value[0], PhysicsState.TOUCH_PERSISTS]);
      } else if (value[1] == PhysicsState.TOUCH_PERSISTS) {
        this._onTriggerPersist(key, value[0]);
      } else if (value[1] == PhysicsState.TOUCH_LOST) {
        this._onTriggerEnd(key, value[0]);
        this._eventMap.set(key, [null, PhysicsState.TOUCH_NONE]);
      }
    });
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
enum PhysicsState {
  TOUCH_FOUND,
  TOUCH_PERSISTS,
  TOUCH_LOST,
  TOUCH_NONE
}
