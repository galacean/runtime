import { Engine } from "../Engine";
import { ShapeGeometry } from "./ShapeGeometry";

/**
 * CubeGeometry 平面创建类
 */
export class PlaneGeometry extends ShapeGeometry {
  private _parameters;
  private halfWidth;
  private halfHeight;

  /**
   * @constructor
   * @param {number} width 宽
   * @param {number} height 高
   * @param {number} horizontalSegments 水平分段数
   * @param {number} verticalSegments 垂直分段数
   */
  constructor(
    width: number = 1,
    height: number = 1,
    horizontalSegments: number = 1,
    verticalSegments: number = 1,
    engine?: Engine
  ) {
    super(engine);
    this._parameters = {
      width: width,
      height: height,
      horizontalSegments: Math.floor(horizontalSegments),
      verticalSegments: Math.floor(verticalSegments)
    };

    this.halfWidth = this._parameters.width / 2;
    this.halfHeight = this._parameters.height / 2;
    this.initialize(engine);
  }

  initialize(engine: Engine) {
    const { verticalSegments, horizontalSegments } = this._parameters;
    // 生成经纬线上的几何体顶点的数据
    let index = 0;
    let offset = 0;
    const grid = [];
    const vertices: Float32Array = new Float32Array((verticalSegments + 1) * (horizontalSegments + 1) * 8);
    const indices: Uint16Array = new Uint16Array(verticalSegments * horizontalSegments * 6);

    for (let iy = 0; iy <= verticalSegments; iy++) {
      const verticesRow = [];
      const v = iy / verticalSegments;
      for (let ix = 0; ix <= horizontalSegments; ix++) {
        const u = ix / horizontalSegments;
        const posX = u * this._parameters.width - this.halfWidth;
        const posY = v * this._parameters.height - this.halfHeight;

        // POSITION
        vertices[offset++] = posX;
        vertices[offset++] = posY;
        vertices[offset++] = 0;
        // NORMAL
        vertices[offset++] = 0;
        vertices[offset++] = 0;
        vertices[offset++] = 1;
        // TEXCOORD_0
        vertices[offset++] = u;
        vertices[offset++] = 1 - v;

        verticesRow.push(index++);
      }
      grid.push(verticesRow);
    }

    // 生成所有三角形顶点序号
    index = 0;
    for (let iy = 0; iy < verticalSegments; iy++) {
      for (let ix = 0; ix < horizontalSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];

        indices[index++] = a;
        indices[index++] = c;
        indices[index++] = b;
        indices[index++] = a;
        indices[index++] = d;
        indices[index++] = c;
      }
    }

    this._initialize(engine, vertices, indices);
  }
}
