import { Rand, Vector3 } from "@galacean/engine-math";
import { BaseShape } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { ParticleShapeType } from "./enums/ParticleShapeType";

/**
 * Particle shape that emits particles from a sphere.
 */
export class SphereShape extends BaseShape {
  /** Radius of the shape to emit particles from. */
  radius: number = 1.0;
  /** Whether emit from shell */
  emitFromShell: boolean = false;

  constructor() {
    super();
    this.shapeType = ParticleShapeType.Sphere;
  }

  override _generatePositionAndDirection(rand: Rand, position: Vector3, direction: Vector3): void {
    if (rand) {
      if (this.emitFromShell) {
        ShapeUtils._randomPointUnitSphere(position, rand);
      } else {
        ShapeUtils._randomPointInsideUnitSphere(position, rand);
      }
    } else {
      if (this.emitFromShell) {
        ShapeUtils._randomPointUnitSphere(position, rand);
      } else {
        ShapeUtils._randomPointInsideUnitSphere(position, rand);
      }
    }

    Vector3.scale(position, this.radius, position);

    if (this.randomDirectionAmount) {
      if (rand) {
        ShapeUtils._randomPointUnitSphere(direction, rand);
      } else {
        ShapeUtils._randomPointUnitSphere(direction, rand);
      }
    } else {
      direction.copyFrom(position);
    }
    // reverse to default direction
    direction.z *= -1.0;
  }

  override cloneTo(destShape: SphereShape): void {
    super.cloneTo(destShape);
    destShape.radius = this.radius;
    destShape.emitFromShell = this.emitFromShell;
    destShape.randomDirectionAmount = this.randomDirectionAmount;
  }

  override clone(): SphereShape {
    const destShape = new SphereShape();
    this.cloneTo(destShape);
    return destShape;
  }
}
