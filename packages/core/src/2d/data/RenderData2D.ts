import { Color, Vector2, Vector3 } from "@oasis-engine/math";

export interface RenderData2D {
  /** @internal */
  vertexCount: number;
  /** @internal */
  positions: Vector3[];
  /** @internal */
  uvs: Vector2[];
  /** @internal */
  triangles: number[];
  /** @internal */
  color: Color;
}
