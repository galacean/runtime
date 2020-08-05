import { DataType } from "@alipay/o3-core";
import { BufferGeometry, InterleavedBuffer, IndexBuffer } from "@alipay/o3-geometry";
import { BufferAttribute } from "@alipay/o3-primitive";

/**
 * CubeGeometry 平面创建类
 * @extends BufferGeometry
 */
export class PlaneGeometry extends BufferGeometry {
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
  constructor(width?: number, height?: number, horizontalSegments?: number, verticalSegments?: number) {
    super();
    this._parameters = {
      width: width || 1,
      height: height || 1,
      horizontalSegments: Math.floor(horizontalSegments) || 1,
      verticalSegments: Math.floor(verticalSegments) || 1
    };

    this.halfWidth = this._parameters.width / 2;
    this.halfHeight = this._parameters.height / 2;
    this.initialize();
  }

  initialize() {
    const vertexCount = (this._parameters.verticalSegments + 1) * (this._parameters.horizontalSegments + 1);
    // 生成经纬线上的几何体顶点的数据
    let index = 0;
    const grid = [];
    const vertexValues = [];
    const indexValues = [];
    // const positions = [];
    for (let iy = 0; iy <= this._parameters.verticalSegments; iy++) {
      const verticesRow = [];
      const v = iy / this._parameters.verticalSegments;
      for (let ix = 0; ix <= this._parameters.horizontalSegments; ix++) {
        const u = ix / this._parameters.horizontalSegments;
        const posX = u * this._parameters.width - this.halfWidth;
        const posY = v * this._parameters.height - this.halfHeight;

        vertexValues.push({
          POSITION: [posX, posY, 0],
          NORMAL: [0, 0, 1],
          TEXCOORD_0: [u, 1 - v]
        });
        verticesRow.push(index++);
      }
      grid.push(verticesRow);
    }

    // 生成所有三角形顶点序号
    for (let iy = 0; iy < this._parameters.verticalSegments; iy++) {
      for (let ix = 0; ix < this._parameters.horizontalSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];

        indexValues.push(a, c, b);
        indexValues.push(a, d, c);
      }
    }

    const position = new BufferAttribute({
      semantic: "POSITION",
      size: 3,
      type: DataType.FLOAT,
      normalized: false
    });
    const normal = new BufferAttribute({
      semantic: "NORMAL",
      size: 3,
      type: DataType.FLOAT,
      normalized: true
    });
    const uv = new BufferAttribute({
      semantic: "TEXCOORD_0",
      size: 2,
      type: DataType.FLOAT,
      normalized: true
    });

    const buffer = new InterleavedBuffer([position, normal, uv], vertexCount);
    this.addVertexBufferParam(buffer);

    const indexBuffer = new IndexBuffer(indexValues.length);
    this.addIndexBufferParam(indexBuffer);
    this.setIndexBufferData(indexValues);

    vertexValues.forEach((values, index) => {
      const pos = values["POSITION"];
      const normal = values["NORMAL"];
      const uv = values["TEXCOORD_0"];
      this.setVertexBufferDataByIndex("POSITION", index, pos);
      this.setVertexBufferDataByIndex("NORMAL", index, normal);
      this.setVertexBufferDataByIndex("TEXCOORD_0", index, uv);
    });
  }
}
