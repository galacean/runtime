import {
  IBoxColliderShape,
  ICapsuleColliderShape,
  IDynamicCollider,
  IPhysics,
  IPhysicsManager,
  IPhysicsMaterial,
  IPlaneColliderShape,
  ISphereColliderShape,
  IStaticCollider
} from "@oasis-engine/design";
import { PhysXPhysicsMaterial } from "./PhysXPhysicsMaterial";
import { PhysXPhysicsManager } from "./PhysXPhysicsManager";
import { PhysXBoxColliderShape } from "./shape/PhysXBoxColliderShape";
import { PhysXSphereColliderShape } from "./shape/PhysXSphereColliderShape";
import { PhysXCapsuleColliderShape } from "./shape/PhysXCapsuleColliderShape";
import { PhysXDynamicCollider } from "./PhysXDynamicCollider";
import { PhysXStaticCollider } from "./PhysXStaticCollider";
import { StaticInterfaceImplement } from "./StaticInterfaceImplement";
import { Quaternion, Vector3 } from "@oasis-engine/math";
import { PhysXPlaneColliderShape } from "./shape/PhysXPlaneColliderShape";
import { PhysXRuntimeMode } from "./enum/PhysXRuntimeMode";

/**
 * PhysX object creation.
 */
@StaticInterfaceImplement<IPhysics>()
export class PhysXPhysics {
  /** PhysX wasm object */
  static PhysX: any;
  /** Physx physics object */
  static physics: any;

  /**
   * Initialize PhysXPhysics.
   * @param runtimeMode - Runtime mode
   * @returns Promise object
   */
  public static init(runtimeMode: PhysXRuntimeMode = PhysXRuntimeMode.Auto): Promise<void> {
    const scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      document.body.appendChild(script);
      script.async = true;
      script.onload = resolve;

      const supported = (() => {
        try {
          if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
            const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (module instanceof WebAssembly.Module)
              return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
          }
        } catch (e) {}
        return false;
      })();
      if (runtimeMode == PhysXRuntimeMode.Auto) {
        if (supported) {
          runtimeMode = PhysXRuntimeMode.WebAssembly;
        } else {
          runtimeMode = PhysXRuntimeMode.JavaScript;
        }
      }

      if (runtimeMode == PhysXRuntimeMode.JavaScript) {
        script.src = "http://30.50.28.1:8000/physx.release.js";
      } else if (runtimeMode == PhysXRuntimeMode.WebAssembly) {
        script.src = "http://30.50.28.1:8000/physx.release.js";
      }
    });

    return new Promise((resolve) => {
      scriptPromise.then(() => {
        (<any>window).PHYSX().then((PHYSX) => {
          PhysXPhysics.PhysX = PHYSX;
          PhysXPhysics._setup();
          console.log("PHYSX loaded");
          resolve();
        });
      });
    });
  }

  private static _setup() {
    const version = PhysXPhysics.PhysX.PX_PHYSICS_VERSION;
    const defaultErrorCallback = new PhysXPhysics.PhysX.PxDefaultErrorCallback();
    const allocator = new PhysXPhysics.PhysX.PxDefaultAllocator();
    const foundation = PhysXPhysics.PhysX.PxCreateFoundation(version, allocator, defaultErrorCallback);

    this.physics = PhysXPhysics.PhysX.PxCreatePhysics(
      version,
      foundation,
      new PhysXPhysics.PhysX.PxTolerancesScale(),
      false,
      null
    );

    PhysXPhysics.PhysX.PxInitExtensions(this.physics, null);
  }

  /**
   * Create physics manager
   * @param onContactBegin function called when contact begin
   * @param onContactEnd function called when contact end
   * @param onContactPersist function called when contact stay
   * @param onTriggerBegin function called when trigger begin
   * @param onTriggerEnd function called when trigger end
   * @param onTriggerPersist function called when trigger stay
   */
  static createPhysicsManager(
    onContactBegin?: Function,
    onContactEnd?: Function,
    onContactPersist?: Function,
    onTriggerBegin?: Function,
    onTriggerEnd?: Function,
    onTriggerPersist?: Function
  ): IPhysicsManager {
    return new PhysXPhysicsManager(
      onContactBegin,
      onContactEnd,
      onContactPersist,
      onTriggerBegin,
      onTriggerEnd,
      onTriggerPersist
    );
  }

  /**
   * Create static collider
   * @param position the global position
   * @param rotation the global rotation
   */
  static createStaticCollider(position: Vector3, rotation: Quaternion): IStaticCollider {
    return new PhysXStaticCollider(position, rotation);
  }

  /**
   * Create dynamic collider
   * @param position the global position
   * @param rotation the global rotation
   */
  static createDynamicCollider(position: Vector3, rotation: Quaternion): IDynamicCollider {
    return new PhysXDynamicCollider(position, rotation);
  }

  /**
   * Create physics material
   * @param staticFriction static friction
   * @param dynamicFriction dynamic friction
   * @param bounciness restitution
   * @param frictionCombine the mode to combine the friction of collider
   * @param bounceCombine the mode to combine the bounce of collider
   */
  static createPhysicsMaterial(
    staticFriction: number,
    dynamicFriction: number,
    bounciness: number,
    frictionCombine: number,
    bounceCombine: number
  ): IPhysicsMaterial {
    return new PhysXPhysicsMaterial(staticFriction, dynamicFriction, bounciness, frictionCombine, bounceCombine);
  }

  /**
   * Create box collider shape
   * @param index unique index to mark the shape
   * @param extents extents of the box
   * @param material the material of this shape
   */
  static createBoxColliderShape(index: number, extents: Vector3, material: PhysXPhysicsMaterial): IBoxColliderShape {
    return new PhysXBoxColliderShape(index, extents, material);
  }

  /**
   * Create sphere collider shape
   * @param index unique index to mark the shape
   * @param radius radius of the sphere
   * @param material the material of this shape
   */
  static createSphereColliderShape(
    index: number,
    radius: number,
    material: PhysXPhysicsMaterial
  ): ISphereColliderShape {
    return new PhysXSphereColliderShape(index, radius, material);
  }

  /**
   * Create plane collider shape
   * @param index unique index to mark the shape
   * @param material the material of this shape
   */
  static createPlaneColliderShape(index: number, material: PhysXPhysicsMaterial): IPlaneColliderShape {
    return new PhysXPlaneColliderShape(index, material);
  }

  /**
   * Create capsule collider shape
   * @param index unique index to mark the shape
   * @param radius radius of capsule
   * @param height height of capsule
   * @param material the material of this shape
   */
  static createCapsuleColliderShape(
    index: number,
    radius: number,
    height: number,
    material: PhysXPhysicsMaterial
  ): ICapsuleColliderShape {
    return new PhysXCapsuleColliderShape(index, radius, height, material);
  }
}
