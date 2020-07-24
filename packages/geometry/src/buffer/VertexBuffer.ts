import { Logger, UpdateType } from "@alipay/o3-base";
import { BufferAttribute } from "../index";
import { getVertexDataTypeSize, getVertexDataTypeDataView } from "../Constant";

/**
 * VertexBuffer
 * 只包含非instanced的非插值buffer
 */
export class VertexBuffer {
  attributes: BufferAttribute[];
  buffers: ArrayBuffer[] = [];
  vertexCount: number;
  private _semanticList: string[] = [];
  private _startBufferIndex: number;
  readonly isInterleaved: boolean = false;

  get semanticList() {
    return this._semanticList;
  }

  constructor(attributes: BufferAttribute[], vertexCount: number) {
    this.attributes = attributes;
    this.vertexCount = vertexCount;
  }

  _initialize(startBufferIndex) {
    this._startBufferIndex = startBufferIndex;
    const { attributes, vertexCount } = this;
    for (let i = 0; i < attributes.length; i += 1) {
      const attribute = attributes[i];
      const { instanced, semantic } = attribute;
      this._semanticList.push(semantic);
      const stride = this._getSizeInByte(attribute.size, attribute.type);
      attribute.stride = stride;
      console.log(this._startBufferIndex + i);
      attribute.vertexBufferIndex = this._startBufferIndex + i;
      const bufferLength = instanced ? (vertexCount / instanced) * stride : vertexCount * stride;
      const buffer = new ArrayBuffer(bufferLength);
      this.buffers.push(buffer);
    }
  }

  setData(
    semantic: string,
    vertexValues,
    dataStartIndex: number = 0,
    bufferOffset: number = 0,
    dataCount: number = Number.MAX_SAFE_INTEGER
  ) {
    const vertexAttrib = this._getAttributeBySemantic(semantic);
    const buffer = this._getBufferBySemantic(semantic);
    console.log("fdafds", buffer);
    const { stride, updateType } = vertexAttrib;
    const constructor = getVertexDataTypeDataView(vertexAttrib.type);
    const view = new constructor(buffer, dataStartIndex, dataCount);
    view.set(vertexValues);
    const byteOffset = dataStartIndex * stride;
    const byteLength = dataCount * stride;
    const bufferByteOffset = bufferOffset * stride;
    if (updateType === UpdateType.NO_UPDATE) {
      vertexAttrib.updateType = UpdateType.UPDATE_RANGE;
    }
    if (updateType === UpdateType.UPDATE_RANGE) {
      vertexAttrib.updateRange = {
        byteOffset,
        byteLength,
        bufferByteOffset
      };
    }
  }

  getData(semantic) {
    const vertexAttrib = this._getAttributeBySemantic(semantic);
    const buffer = this._getBufferBySemantic(semantic);
    const constructor = getVertexDataTypeDataView(vertexAttrib.type);
    return new constructor(buffer);
  }

  setDataByIndex(semantic: string, vertexIndex: number, value: number[] | Float32Array) {
    const vertexAttrib = this._getAttributeBySemantic(semantic);
    const { stride, size, updateType, updateRange } = vertexAttrib;
    const buffer = this._getBufferBySemantic(semantic);
    const constructor = getVertexDataTypeDataView(vertexAttrib.type);
    const view = new constructor(buffer, vertexIndex * stride, size);
    view.set(value);
    const byteOffset = vertexAttrib.offset + vertexAttrib.stride * vertexIndex;
    const byteLength = vertexAttrib.stride;
    if (updateType === UpdateType.NO_UPDATE) {
      vertexAttrib.updateType = UpdateType.UPDATE_RANGE;
    }
    if (updateType === UpdateType.UPDATE_RANGE) {
      if (updateRange.byteLength === -1 && updateRange.byteOffset === 0) {
        vertexAttrib.updateRange = {
          byteOffset,
          byteLength,
          bufferByteOffset: byteOffset
        };
      } else {
        const updateRange = this._getUpdateRange(vertexAttrib, byteOffset, byteLength);
        vertexAttrib.updateRange = updateRange;
      }
    }
  }

  getDataByIndex(semantic: string, vertexIndex: number) {
    const vertexAttrib = this._getAttributeBySemantic(semantic);
    const { stride, size } = vertexAttrib;
    const buffer = this._getBufferBySemantic(semantic);
    const constructor = getVertexDataTypeDataView(vertexAttrib.type);
    return new constructor(buffer, vertexIndex * stride, size);
  }

  /**
   * 获取当前类型的数据所占字节数
   * @param {Number} size 所占空间长度
   * @param {Number} type 数据类型常量
   * @private
   */
  protected _getSizeInByte(size, type) {
    const num = getVertexDataTypeSize(type);
    if (num) {
      return size * num;
    } else {
      Logger.error("UNKNOWN vertex attribute type: " + type);
      return 0;
    }
  }

  protected _getAttributeBySemantic(semantic: string) {
    return this.attributes.find((item) => (item.semantic = semantic));
  }

  protected _getBufferBySemantic(semantic: string) {
    const vertexAttrib = this.attributes.find((item) => (item.semantic = semantic));
    console.log(vertexAttrib);
    const { vertexBufferIndex } = vertexAttrib;
    const bufferIndex = vertexBufferIndex - this._startBufferIndex;
    console.log(vertexBufferIndex);
    const buffer = this.buffers[bufferIndex];
    return buffer;
  }

  /**
   * 获取更新范围
   * @param {number} offset 字节偏移
   * @param {number} length 字节长度
   * @private
   */
  protected _getUpdateRange(vertexAttrib, offset, length) {
    const updateRange = vertexAttrib.updateRange;
    const rangeEnd1 = updateRange.byteOffset + updateRange.byteLength;
    const byteOffset = Math.min(offset, updateRange.byteOffset);
    const rangeEnd2 = offset + length;
    const byteLength = rangeEnd1 <= rangeEnd2 ? rangeEnd2 - updateRange.byteOffset : rangeEnd1 - updateRange.byteOffset;
    return { byteOffset, byteLength, bufferByteOffset: byteOffset };
  }
}
