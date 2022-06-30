import { Matrix, Vector2, Vector3 } from "@oasis-engine/math";
import { SpriteMask } from "../sprite";
import { SpriteRenderer } from "../sprite/SpriteRenderer";
import { IAssembler } from "./IAssembler";
import { StaticInterfaceImplement } from "./StaticInterfaceImplement";

@StaticInterfaceImplement<IAssembler>()
export class SlicedSpriteAssembler {
  static _worldMatrix: Matrix = new Matrix();
  static resetData(renderer: SpriteRenderer | SpriteMask): void {
    const { _renderData: renderData } = renderer;
    const { positions, uvs } = renderData;
    if (positions.length < 16) {
      for (let i = positions.length; i < 16; i++) {
        positions.push(new Vector3());
        uvs.push(new Vector2());
      }
    }
    renderData.triangles = [];
  }

  static updateData(renderer: SpriteRenderer | SpriteMask): void {}

  static updatePositions(renderer: SpriteRenderer | SpriteMask): void {
    // Update WorldMatrix.
    const { width, height, sprite } = renderer;
    const { positions, uvs, triangles } = renderer._renderData;
    const { border } = sprite;
    const spriteUVs = sprite._getUVs();
    // Update local positions.
    const spritePositions = sprite._getPositions();
    const { x: left, y: bottom } = spritePositions[0];
    const { x: right, y: top } = spritePositions[3];
    const expectWidth = sprite._getPixelWidth() / SpriteRenderer._pixelPerUnit;
    const expectHeight = sprite._getPixelHeight() / SpriteRenderer._pixelPerUnit;
    const fixedLeft = expectWidth * border.x;
    const fixedBottom = expectHeight * border.y;
    const fixedRight = expectHeight * border.z;
    const fixedTop = expectWidth * border.w;

    // ------------------------
    //     [3]
    //      |
    //     [2]
    //      |
    //     [1]
    //      |
    // row [0] - [1] - [2] - [3]
    //    column
    // ------------------------
    // Calculate row and column.
    let row: number[], column: number[];
    if (fixedLeft + fixedRight > width) {
      const widthScale = width / (fixedLeft + fixedRight);
      row = [
        expectWidth * left * widthScale,
        fixedLeft * widthScale,
        fixedLeft * widthScale,
        width - expectWidth * (1 - right) * widthScale
      ];
    } else {
      row = [expectWidth * left, fixedLeft, width - fixedRight, width - expectWidth * (1 - right)];
    }

    if (fixedTop + fixedBottom > height) {
      const heightScale = height / (fixedTop + fixedBottom);
      column = [
        expectHeight * bottom * heightScale,
        fixedBottom * heightScale,
        fixedBottom * heightScale,
        height - expectHeight * (1 - top) * heightScale
      ];
    } else {
      column = [expectHeight * bottom, fixedBottom, height - fixedTop, height - expectHeight * (1 - top)];
    }

    // Update renderer's worldMatrix.
    const { x: pivotX, y: pivotY } = renderer.sprite.pivot;
    const localTransX = renderer.width * pivotX;
    const localTransY = renderer.height * pivotY;
    const { _worldMatrix: worldMatrix } = SlicedSpriteAssembler;
    // Parent's worldMatrix.
    const { elements: pE } = renderer.entity.transform.worldMatrix;
    // Renderer's worldMatrix.
    const { elements: wE } = worldMatrix;
    const sx = renderer.flipX ? -1 : 1;
    const sy = renderer.flipY ? -1 : 1;
    (wE[0] = pE[0] * sx), (wE[1] = pE[1] * sx), (wE[2] = pE[2] * sx);
    (wE[4] = pE[4] * sy), (wE[5] = pE[5] * sy), (wE[6] = pE[6] * sy);
    (wE[8] = pE[8]), (wE[9] = pE[9]), (wE[10] = pE[10]);
    wE[12] = pE[12] - localTransX * wE[0] - localTransY * wE[4];
    wE[13] = pE[13] - localTransX * wE[1] - localTransY * wE[5];
    wE[14] = pE[14];

    // ------------------------
    //  3 - 7 - 11 - 15
    //  |   |   |    |
    //  2 - 6 - 10 - 14
    //  |   |   |    |
    //  1 - 5 - 9  - 13
    //  |   |   |    |
    //  0 - 4 - 8  - 12
    // ------------------------
    // Assemble position and uv.
    let vertexCount = 0;
    let realICount = 0;
    for (let i = 0; i < 4; i++) {
      const rowValue = row[i];
      const rowU = spriteUVs[i].x;
      for (let j = 0; j < 4; j++) {
        const columnValue = column[j];
        positions[vertexCount].set(
          wE[0] * rowValue + wE[4] * columnValue + wE[12],
          wE[1] * rowValue + wE[5] * columnValue + wE[13],
          wE[2] * rowValue + wE[6] * columnValue + wE[14]
        );
        uvs[vertexCount].set(rowU, spriteUVs[j].y);
        ++vertexCount;
      }
      ++realICount;
    }

    const realJCount = vertexCount / realICount;
    let indexOffset = 0;
    for (let i = 0; i < realICount - 1; ++i) {
      for (let j = 0; j < realJCount - 1; ++j) {
        const start = i * realJCount + j;
        triangles[indexOffset++] = start;
        triangles[indexOffset++] = start + 1;
        triangles[indexOffset++] = start + realJCount;
        triangles[indexOffset++] = start + 1;
        triangles[indexOffset++] = start + realJCount + 1;
        triangles[indexOffset++] = start + realJCount;
      }
    }
    renderer._renderData.vertexCount = realICount * realJCount;
    triangles.length = (realICount - 1) * (realJCount - 1) * 6;

    // Update bounds.
    const { min, max } = renderer._bounds;
    min.set(row[0], column[0], 0);
    max.set(row[3], column[3], 0);
    renderer._bounds.transform(worldMatrix);
  }

  static updateUVs(renderer: SpriteRenderer | SpriteMask): void {}
}
