import { AnimatorLayerBlendingMode, WrapMode } from "@oasis-engine/core";

export interface IAnimatorControllerAsset {
  layers: Array<{
    name: string;
    blending: AnimatorLayerBlendingMode;
    weight: number;
    stateMachine: {
      states: Array<{
        name: string;
        speed: number;
        wrapMode: WrapMode;
        isDefaultState: boolean;
        clipStartNormalizedTime: number;
        clipEndNormalizedTime: number;
        clip: { path: string; objectId: string };
        transitions: Array<{
          duration: number;
          offset: number;
          exitTime: number;
          targetStateName: string;
        }>;
      }>;
    };
  }>;
}
