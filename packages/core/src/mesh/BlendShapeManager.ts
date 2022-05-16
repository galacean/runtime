import { Vector3 } from "@oasis-engine/math";
import { BoolUpdateFlag } from "../BoolUpdateFlag";
import { Engine } from "../Engine";
import { VertexElement, VertexElementFormat } from "../graphic";
import { ListenerUpdateFlag } from "../ListenerUpdateFlag";
import { Texture2DArray, TextureFilterMode, TextureFormat } from "../texture";
import { BlendShape } from "./BlendShape";
import { ModelMesh } from "./ModelMesh";

/**
 * @internal
 */
export class BlendShapeManager {
  /** @internal */
  _useBlendNormal: boolean = true;
  /** @internal */
  _useBlendTangent: boolean = true;
  /** @internal */
  _blendShapes: BlendShape[] = [];
  /** @internal */
  _blendShapeNames: string[];
  /** @internal */
  _blendShapeCount: number = 0;
  /** @internal */
  _layoutDirtyFlag: ListenerUpdateFlag = new ListenerUpdateFlag();
  /** @internal */
  _subDataDirtyFlags: BoolUpdateFlag[] = [];
  /** @internal */
  _vertexStride: number;

  /** @internal */
  _dataTextureBuffer: Float32Array;
  /** @internal */
  _dataTexture: Texture2DArray;
  /** @internal */
  readonly _dataTextureInfo: Vector3 = new Vector3();

  private _attributeVertexElementStartIndex: number;
  private _attributeBlendShapeOffsets: number[];
  private _condensedBlendShapeWeights: Float32Array;
  private readonly _engine: Engine;
  private readonly _lastUpdateLayoutAndCountInfo: Vector3 = new Vector3(0, 0, 0);
  private readonly _canUseTextureStoreData: boolean = true;

  constructor(engine: Engine) {
    this._engine = engine;
    this._canUseTextureStoreData = this._engine._hardwareRenderer.capability.canUseFloatTextureBlendShape;
    this._layoutDirtyFlag.listener = this._updateUsePropertyFlag.bind(this);
  }

  /**
   * @internal
   */
  _addBlendShape(blendShape: BlendShape): void {
    this._blendShapes.push(blendShape);
    this._blendShapeCount++;

    blendShape._addLayoutChangeFlag(this._layoutDirtyFlag);
    this._updateUsePropertyFlag(blendShape);

    this._subDataDirtyFlags.push(blendShape._createSubDataDirtyFlag());
  }

  /**
   * @internal
   */
  _clearBlendShapes(): void {
    this._useBlendNormal = true;
    this._useBlendTangent = true;
    this._blendShapes.length = 0;
    this._blendShapeCount = 0;

    this._layoutDirtyFlag.clearFromManagers();
    const subDataDirtyFlags = this._subDataDirtyFlags;
    for (let i = 0, n = subDataDirtyFlags.length; i < n; i++) {
      subDataDirtyFlags[i].destroy();
    }
    subDataDirtyFlags.length = 0;
  }

  /**
   * @internal
   */
  _attributeModeSupportCount(): number {
    if (this._useBlendNormal || this._useBlendTangent) {
      return 4;
    } else {
      return 8;
    }
  }

  /**
   * @internal
   */
  _filterCondensedBlendShapeWights(blendShapeWeights: Float32Array, modelMesh: ModelMesh): Float32Array {
    const blendShapeCount = this._blendShapeCount;
    const maxBlendCount = this._attributeModeSupportCount();
    const vertexElements = modelMesh._vertexElements;
    const blendShapeOffsets = this._attributeBlendShapeOffsets;
    if (blendShapeCount > maxBlendCount) {
      let condensedBlendShapeWeights = this._condensedBlendShapeWeights;
      if (!condensedBlendShapeWeights) {
        condensedBlendShapeWeights = new Float32Array(maxBlendCount);
        this._condensedBlendShapeWeights = condensedBlendShapeWeights;
      }

      let index = this._attributeVertexElementStartIndex;
      for (let i = 0, j = 0; i < blendShapeCount && j < maxBlendCount; i++) {
        const weight = blendShapeWeights[i];
        if (weight > 0) {
          let offset = blendShapeOffsets[i];
          vertexElements[index++].offset = offset;
          if (this._useBlendNormal) {
            offset += 12;
            vertexElements[index++].offset = offset;
          }
          if (this._useBlendTangent) {
            offset += 12;
            vertexElements[index++].offset = offset;
          }
          condensedBlendShapeWeights[j++] = weight;
        }
      }
      return condensedBlendShapeWeights;
    } else {
      return blendShapeWeights;
    }
  }

  /**
   * @internal
   */
  _useTextureMode(): boolean {
    if (!this._canUseTextureStoreData) {
      return false;
    }
    return this._blendShapeCount > this._attributeModeSupportCount();
  }

  /**
   * @internal
   */
  _layoutOrCountChange(): boolean {
    const lastInfo = this._lastUpdateLayoutAndCountInfo;
    if (
      lastInfo.x !== this._blendShapeCount ||
      !!lastInfo.y !== this._useBlendNormal ||
      !!lastInfo.z !== this._useBlendTangent
    ) {
      return true;
    }
  }

  /**
   * @internal
   */
  _needUpdateData(): boolean {
    const subDataDirtyFlags = this._subDataDirtyFlags;
    for (let i = 0, n = subDataDirtyFlags.length; i < n; i++) {
      if (subDataDirtyFlags[i].flag) {
        return true;
      }
    }
    return false;
  }

  /**
   * @internal
   */
  _addVertexElements(modelMesh: ModelMesh, offset: number): void {
    const maxBlendCount = this._attributeModeSupportCount(); //CM：
    this._vertexStride = 1;
    this._useBlendNormal && this._vertexStride++;
    this._useBlendTangent && this._vertexStride++;

    this._attributeVertexElementStartIndex = modelMesh._vertexElements.length;
    for (let i = 0; i < maxBlendCount; i++) {
      modelMesh._addVertexElement(new VertexElement(`POSITION_BS${i}`, offset, VertexElementFormat.Vector3, 0));
      offset += 12;
      if (this._useBlendNormal) {
        modelMesh._addVertexElement(new VertexElement(`NORMAL_BS${i}`, offset, VertexElementFormat.Vector3, 0));
        offset += 12;
      }
      if (this._useBlendTangent) {
        modelMesh._addVertexElement(new VertexElement(`TANGENT_BS${i}`, offset, VertexElementFormat.Vector3, 0));
        offset += 12;
      }
    }

    this._lastUpdateLayoutAndCountInfo.setValue(maxBlendCount, +this._useBlendNormal, +this._useBlendTangent);
  }

  /**
   * @internal
   */
  _updateDataToVertices(
    vertices: Float32Array,
    offset: number,
    vertexCount: number,
    elementCount: number,
    force: boolean
  ): void {
    const blendShapeCount = this._blendShapeCount;
    const blendShapes = this._blendShapes;
    const subDataDirtyFlags = this._subDataDirtyFlags;
    const attributeBlendShapeOffsets = new Array<number>(blendShapeCount);
    for (let i = 0; i < blendShapeCount; i++) {
      const dataChangedFlag = subDataDirtyFlags[i];
      if (force || dataChangedFlag.flag) {
        const { frames } = blendShapes[i];
        const frameCount = frames.length;
        const endFrame = frames[frameCount - 1];
        if (frameCount > 0 && endFrame.deltaPositions.length !== vertexCount) {
          throw "BlendShape frame deltaPositions length must same with mesh vertexCount.";
        }

        attributeBlendShapeOffsets[i] = offset * 4;

        const { deltaPositions } = endFrame;
        for (let j = 0; j < vertexCount; j++) {
          const start = elementCount * j + offset;
          const deltaPosition = deltaPositions[j];
          if (deltaPosition) {
            vertices[start] = deltaPosition.x;
            vertices[start + 1] = deltaPosition.y;
            vertices[start + 2] = deltaPosition.z;
          }
        }
        offset += 3;

        if (this._useBlendNormal) {
          const { deltaNormals } = endFrame;
          if (deltaNormals) {
            for (let j = 0; j < vertexCount; j++) {
              const start = elementCount * j + offset;
              const deltaNormal = deltaNormals[j];
              if (deltaNormal) {
                vertices[start] = deltaNormal.x;
                vertices[start + 1] = deltaNormal.y;
                vertices[start + 2] = deltaNormal.z;
              }
            }
          }
          offset += 3;
        }

        if (this._useBlendTangent) {
          const { deltaTangents } = endFrame;
          if (deltaTangents) {
            for (let j = 0; j < vertexCount; j++) {
              const start = elementCount * j + offset;
              const deltaTangent = deltaTangents[j];
              if (deltaTangent) {
                vertices[start] = deltaTangent.x;
                vertices[start + 1] = deltaTangent.y;
                vertices[start + 2] = deltaTangent.z;
              }
            }
          }
          offset += 3;
        }
        dataChangedFlag.flag = false;
      }
    }
    this._attributeBlendShapeOffsets = attributeBlendShapeOffsets;
  }

  /**
   * @internal
   */
  _updateTexture(
    layoutOrCountChange: boolean,
    vertexCountChange: boolean,
    needUpdateBlendShape: boolean,
    vertexCount: number
  ): void {
    let reCreateTexture = !this._dataTexture || layoutOrCountChange || vertexCountChange;
    if (reCreateTexture) {
      this._createDataTexture(vertexCount);
      this._lastUpdateLayoutAndCountInfo.setValue(this._blendShapeCount, +this._useBlendNormal, +this._useBlendTangent);
    }
    if (needUpdateBlendShape) {
      this._updateDataToTexture(vertexCount, reCreateTexture);
    }
  }

  /**
   * @internal
   */
  _releaseMemoryCache(): void {
    const { _blendShapes: blendShapes } = this;
    const blendShapeNamesMap = new Array<string>(blendShapes.length);
    for (let i = 0, n = blendShapes.length; i < n; i++) {
      blendShapeNamesMap[i] = blendShapes[i].name;
    }
    this._blendShapeNames = blendShapeNamesMap;

    this._layoutDirtyFlag.destroy();
    const dataChangedFlags = this._subDataDirtyFlags;
    for (let i = 0, n = dataChangedFlags.length; i < n; i++) {
      dataChangedFlags[i].destroy();
    }

    this._layoutDirtyFlag = null;
    this._subDataDirtyFlags = null;
    this._blendShapes = null;
  }

  private _createDataTexture(vertexCount: number): void {
    const maxTextureSize = this._engine._hardwareRenderer.capability.maxTextureSize;

    let vertexPixelStride = 1;
    this._useBlendNormal && vertexPixelStride++;
    this._useBlendTangent && vertexPixelStride++;

    let textureWidth = vertexPixelStride * vertexCount;
    let textureHeight = 1;
    if (textureWidth > maxTextureSize) {
      textureHeight = Math.ceil(textureWidth / maxTextureSize);
      textureWidth = maxTextureSize;
    }

    let blendShapeDataTexture = this._dataTexture;
    const blendShapeCount = this._blendShapes.length;

    blendShapeDataTexture && blendShapeDataTexture.destroy();

    blendShapeDataTexture = new Texture2DArray(
      this._engine,
      textureWidth,
      textureHeight,
      blendShapeCount,
      TextureFormat.R32G32B32A32,
      false
    );
    blendShapeDataTexture.filterMode = TextureFilterMode.Point;

    this._dataTextureBuffer = new Float32Array(blendShapeCount * textureWidth * textureHeight * 4);
    this._dataTexture = blendShapeDataTexture;
    this._dataTextureInfo.setValue(vertexPixelStride, textureWidth, textureHeight);
  }

  private _updateDataToTexture(vertexCount: number, force: boolean): void {
    const {
      _blendShapes: blendShapes,
      _dataTexture: dataTexture,
      _dataTextureBuffer: buffer,
      _subDataDirtyFlags: subDataDirtyFlags
    } = this;

    let offset = 0;
    for (let i = 0, n = blendShapes.length; i < n; i++) {
      const subDirtyFlag = subDataDirtyFlags[i];
      const subBlendShapeDataStride = dataTexture.width * dataTexture.height * 4;
      if (force || subDirtyFlag.flag) {
        const { frames } = blendShapes[i];
        const frameCount = frames.length;
        const endFrame = frames[frameCount - 1];
        if (frameCount > 0 && endFrame.deltaPositions.length !== vertexCount) {
          throw "BlendShape frame deltaPositions length must same with mesh vertexCount.";
        }
        const { deltaPositions, deltaNormals, deltaTangents } = endFrame;
        offset = i * subBlendShapeDataStride;
        for (let j = 0; j < vertexCount; j++) {
          const position = deltaPositions[j];
          buffer[offset] = position.x;
          buffer[offset + 1] = position.y;
          buffer[offset + 2] = position.z;
          offset += 4;

          if (deltaNormals) {
            const normal = deltaNormals[j];
            buffer[offset] = normal.x;
            buffer[offset + 1] = normal.y;
            buffer[offset + 2] = normal.z;
            offset += 4;
          }

          if (deltaTangents) {
            const tangent = deltaTangents[j];
            buffer[offset] = tangent.x;
            buffer[offset + 1] = tangent.y;
            buffer[offset + 2] = tangent.z;
            offset += 4;
          }
        }
        subDirtyFlag.flag = false;
      }
    }
    dataTexture.setPixelBuffer(0, buffer);
  }

  private _updateUsePropertyFlag(blendShape: BlendShape): void {
    this._useBlendNormal = blendShape._useBlendShapeNormal && this._useBlendNormal;
    this._useBlendTangent = blendShape._useBlendShapeTangent && this._useBlendTangent;
  }
}
