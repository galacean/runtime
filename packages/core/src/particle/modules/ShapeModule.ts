import { Rand } from "@galacean/engine-math";
import { ParticleGenerator } from "../ParticleGenerator";
import { ParticleRandomSubSeeds } from "../enums/ParticleRandomSubSeeds";
import { ParticleGeneratorModule } from "./ParticleGeneratorModule";
import { BaseShape } from "./shape/BaseShape";

/**
 * Shape module of `ParticleGenerator`.
 */
export class ShapeModule extends ParticleGeneratorModule {
  /** The shape of the emitter. */
  shape: BaseShape;

  /** @internal */
  _shapeRand = new Rand(0, ParticleRandomSubSeeds.Shape);

  constructor(generator: ParticleGenerator) {
    super(generator);
  }

  override cloneTo(destRotationOverLifetime: ParticleGeneratorModule) {}

  /**
   * @internal
   */
  _resetRandomSeed(randomSeed: number): void {
    this._shapeRand.reset(randomSeed, ParticleRandomSubSeeds.Shape);
  }
}
