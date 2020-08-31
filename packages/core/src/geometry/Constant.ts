import { DataType } from "../base/Constant";

const vertexDataTypeSizeHash = {};
vertexDataTypeSizeHash[DataType.BYTE] = 1;
vertexDataTypeSizeHash[DataType.UNSIGNED_BYTE] = 1;
vertexDataTypeSizeHash[DataType.SHORT] = 2;
vertexDataTypeSizeHash[DataType.UNSIGNED_SHORT] = 2;
vertexDataTypeSizeHash[DataType.INT] = 4;
vertexDataTypeSizeHash[DataType.UNSIGNED_INT] = 4;
vertexDataTypeSizeHash[DataType.FLOAT] = 4;

export function getVertexDataTypeSize(type) {
  return vertexDataTypeSizeHash[type];
}

const vertexDataTypeDataView = {};
vertexDataTypeDataView[DataType.BYTE] = Int8Array;
vertexDataTypeDataView[DataType.UNSIGNED_BYTE] = Uint8Array;
vertexDataTypeDataView[DataType.SHORT] = Int16Array;
vertexDataTypeDataView[DataType.UNSIGNED_SHORT] = Uint16Array;
vertexDataTypeDataView[DataType.INT] = Int32Array;
vertexDataTypeDataView[DataType.UNSIGNED_INT] = Uint32Array;
vertexDataTypeDataView[DataType.FLOAT] = Float32Array;

export function getVertexDataTypeDataView(type) {
  return vertexDataTypeDataView[type];
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array;
