import { SkinnedMeshRenderer } from "../../../../mesh";
import { KeyframeValueType } from "../../../Keyframe";
import { IAnimationCurveOwnerAssembler } from "./IAnimationCurveOwnerAssembler";
import type { AnimationCurveOwner } from "../AnimationCurveOwner";

/**
 * @internal
 */
export class BlendShapeWeightsAnimationCurveOwnerAssembler implements IAnimationCurveOwnerAssembler<Float32Array> {
  private _skinnedMeshRenderer: SkinnedMeshRenderer;

  initialize(owner: AnimationCurveOwner<KeyframeValueType>): void {
    this._skinnedMeshRenderer = owner.target.getComponent(SkinnedMeshRenderer);
  }

  getTargetValue(): Float32Array {
    return this._skinnedMeshRenderer.blendShapeWeights;
  }

  setTargetValue(value: Float32Array): void {
    this._skinnedMeshRenderer.blendShapeWeights = value;
  }
}
