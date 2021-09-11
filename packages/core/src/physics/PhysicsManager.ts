import { Entity } from "../Entity";
import { Script } from "../Script";
import { Collision } from "./Collision";
import { HitResult } from "./HitResult";
import { Ray, Vector3 } from "@oasis-engine/math";
import { IPhysics, IPhysicsManager } from "@oasis-engine/design";
import { DynamicCollider } from "./DynamicCollider";
import { Collider } from "./Collider";
import { Layer } from "../Layer";

/** Filtering flags for scene queries. */
export enum QueryFlag {
  STATIC = 1 << 0,
  DYNAMIC = 1 << 1,
  ANY_HIT = 1 << 4,
  NO_BLOCK = 1 << 5
}

export class PhysicsManager {
  private static _tempCollision: Collision = new Collision();
  /** @internal */
  static nativePhysics: IPhysics;
  private _physicsManager: IPhysicsManager;
  private _physicalObjectsMap = new Map<number, Entity>();

  queryFlag: QueryFlag = QueryFlag.STATIC | QueryFlag.DYNAMIC;

  onContactBegin = (obj1: number, obj2: number) => {
    let scripts: Script[] = [];
    this._physicalObjectsMap.get(obj1).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        PhysicsManager._tempCollision.collider = this._physicalObjectsMap.get(obj2).getComponent(DynamicCollider);
        scripts[i].onCollisionEnter(PhysicsManager._tempCollision);
      }
    }

    scripts = [];
    this._physicalObjectsMap.get(obj2).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        PhysicsManager._tempCollision.collider = this._physicalObjectsMap.get(obj2).getComponent(DynamicCollider);
        scripts[i].onCollisionEnter(PhysicsManager._tempCollision);
      }
    }
  };

  onContactEnd = (obj1: number, obj2: number) => {
    let scripts: Script[] = [];
    this._physicalObjectsMap.get(obj1).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        PhysicsManager._tempCollision.collider = this._physicalObjectsMap.get(obj2).getComponent(DynamicCollider);
        scripts[i].onCollisionExit(PhysicsManager._tempCollision);
      }
    }

    scripts = [];
    this._physicalObjectsMap.get(obj2).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        PhysicsManager._tempCollision.collider = this._physicalObjectsMap.get(obj2).getComponent(DynamicCollider);
        scripts[i].onCollisionExit(PhysicsManager._tempCollision);
      }
    }
  };

  onContactPersist = (obj1: number, obj2: number) => {
    let scripts: Script[] = [];
    this._physicalObjectsMap.get(obj1).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        PhysicsManager._tempCollision.collider = this._physicalObjectsMap.get(obj2).getComponent(DynamicCollider);
        scripts[i].onCollisionStay(PhysicsManager._tempCollision);
      }
    }

    scripts = [];
    this._physicalObjectsMap.get(obj2).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        PhysicsManager._tempCollision.collider = this._physicalObjectsMap.get(obj2).getComponent(DynamicCollider);
        scripts[i].onCollisionStay(PhysicsManager._tempCollision);
      }
    }
  };

  onTriggerBegin = (obj1: number, obj2: number) => {
    let scripts: Script[] = [];
    this._physicalObjectsMap.get(obj2).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        scripts[i].onTriggerEnter(this._physicalObjectsMap.get(obj1).getComponent(DynamicCollider));
      }
    }
  };

  onTriggerEnd = (obj1: number, obj2: number) => {
    let scripts: Script[] = [];
    this._physicalObjectsMap.get(obj2).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        scripts[i].onTriggerExit(this._physicalObjectsMap.get(obj1).getComponent(DynamicCollider));
      }
    }
  };

  onTriggerPersist = (obj1: number, obj2: number) => {
    let scripts: Script[] = [];
    this._physicalObjectsMap.get(obj2).getComponents(Script, scripts);
    if (scripts.length > 0) {
      for (let i = 0, len = scripts.length; i < len; i++) {
        scripts[i].onTriggerStay(this._physicalObjectsMap.get(obj1).getComponent(DynamicCollider));
      }
    }
  };

  constructor() {
    this._physicsManager = PhysicsManager.nativePhysics.createPhysicsManager(
      this.onContactBegin,
      this.onContactEnd,
      this.onContactPersist,
      this.onTriggerBegin,
      this.onTriggerEnd
    );
  }

  /** Global gravity in the physical scene */
  get gravity(): Vector3 {
    return this._physicsManager.gravity;
  }

  set gravity(value: Vector3) {
    this._physicsManager.gravity = value;
  }

  getPhysicsEntity(idx: number): Entity {
    return this._physicalObjectsMap.get(idx);
  }

  //--------------adding to the scene-------------------------------------------
  /** add Static Actor, i.e Collider and Trigger. */
  addCollider(actor: Collider) {
    const shapes = actor.shapes;
    for (let i = 0, len = shapes.length; i < len; i++) {
      this._physicalObjectsMap.set(shapes[i].id, actor.entity);
    }
    this._physicsManager.addCollider(actor._nativeStaticCollider);
  }

  //--------------simulation ---------------------------------------------------
  simulate(elapsedTime: number = 1 / 60, controlSimulation: boolean = true) {
    this._physicsManager.simulate(elapsedTime, controlSimulation);
  }

  fetchResults(block: boolean = true) {
    this._physicsManager.fetchResults(block);
  }

  advance() {
    this._physicsManager.advance();
  }

  fetchCollision(block: boolean = true) {
    this._physicsManager.fetchCollision(block);
  }

  collide(elapsedTime: number = 1 / 60) {
    this._physicsManager.collide(elapsedTime);
  }

  /**
   * call on every frame to update pose of objects
   */
  update() {
    this._physicsManager.update();
  }

  //----------------raycast-----------------------------------------------------
  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @returns Returns true if the ray intersects with a Collider, otherwise false.
   */
  raycast(ray: Ray): Boolean;

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param outHitResult - If true is returned, outHitResult will contain more detailed collision information
   * @returns Returns true if the ray intersects with a Collider, otherwise false.
   */
  raycast(ray: Ray, outHitResult: HitResult): Boolean;

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param distance - The max distance the ray should check
   * @returns Returns true if the ray intersects with a Collider, otherwise false.
   */
  raycast(ray: Ray, distance: number): Boolean;

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param distance - The max distance the ray should check
   * @param outHitResult - If true is returned, outHitResult will contain more detailed collision information
   * @returns Returns true if the ray intersects with a Collider, otherwise false.
   */
  raycast(ray: Ray, distance: number, outHitResult: HitResult): Boolean;

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param distance - The max distance the ray should check
   * @param layerMask - Layer mask that is used to selectively ignore Colliders when casting
   * @returns Returns true if the ray intersects with a Collider, otherwise false.
   */
  raycast(ray: Ray, distance: number, layerMask: Layer): Boolean;

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param distance - The max distance the ray should check
   * @param layerMask - Layer mask that is used to selectively ignore Colliders when casting
   * @param outHitResult - If true is returned, outHitResult will contain more detailed collision information
   * @returns Returns true if the ray intersects with a Collider, otherwise false.
   */
  raycast(ray: Ray, distance: number, layerMask: Layer, outHitResult: HitResult): Boolean;

  raycast(
    ray: Ray,
    distanceOrResult?: number | HitResult,
    layerMaskOrResult?: Layer | HitResult,
    outHitResult?: HitResult
  ): Boolean {
    let hitResult: HitResult;

    let distance = Number.MAX_VALUE;
    if (typeof distanceOrResult === "number") {
      distance = distanceOrResult;
    } else if (distanceOrResult != undefined) {
      hitResult = distanceOrResult;
    }

    let layerMask = Layer.Everything;
    if (typeof layerMaskOrResult === "number") {
      layerMask = layerMaskOrResult;
    } else if (layerMaskOrResult != undefined) {
      hitResult = layerMaskOrResult;
    }

    if (outHitResult) {
      hitResult = outHitResult;
    }

    if (hitResult != undefined) {
      const result = this._physicsManager.raycast(ray, distance, this.queryFlag, (idx, distance, position, normal) => {
        hitResult.entity = this.getPhysicsEntity(idx);
        hitResult.distance = distance;
        normal.cloneTo(hitResult.normal);
        position.cloneTo(hitResult.point);
      });

      if (result) {
        if (hitResult.entity.layer & layerMask) {
          return true;
        } else {
          hitResult.entity = null;
          hitResult.distance = 0;
          hitResult.point.setValue(0, 0, 0);
          hitResult.normal.setValue(0, 0, 0);
          return false;
        }
      }
      return false;
    } else {
      return this._physicsManager.raycast(ray, distance, this.queryFlag);
    }
  }
}
