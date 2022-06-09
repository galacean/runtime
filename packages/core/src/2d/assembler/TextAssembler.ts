import { Color, Vector2, Vector3 } from "@oasis-engine/math";
import { Texture2D } from "../../texture";
import { TextHorizontalAlignment, TextVerticalAlignment } from "../enums/TextAlignment";
import { TextRenderer, DirtyFlag } from "../text/TextRenderer";
import { TextUtils } from "../text/TextUtils";
import { IAssembler } from "./IAssembler";
import { StaticInterfaceImplement } from "./StaticInterfaceImplement";

@StaticInterfaceImplement<IAssembler>()
export class TextAssembler {
  private static _tempVec3: Vector3 = new Vector3();

  public static resetData(renderer: TextRenderer) {
    const positions: Array<Vector3> = [];
    const uvs: Array<Vector2> = [];
    const triangles: Array<number> = [];
    const color: Color = null;

    positions[0] = new Vector3();
    positions[1] = new Vector3();
    positions[2] = new Vector3();
    positions[3] = new Vector3();
    triangles[0] = 0, triangles[1] = 2, triangles[2] = 1;
    triangles[3] = 2, triangles[4] = 0, triangles[5] = 3;

    renderer._renderData = { positions, uvs, triangles, color};
  }

  static updateData(renderer: TextRenderer): void {
    const isTextureDirty = renderer._isContainDirtyFlag(DirtyFlag.Property);
    if (isTextureDirty) {
      TextAssembler._updateText(renderer);
      renderer._setDirtyFlagFalse(DirtyFlag.Property);
    }

    if (renderer._isWorldMatrixDirty.flag || isTextureDirty) {
      TextAssembler._updatePosition(renderer);
      renderer._isWorldMatrixDirty.flag = false;
    }

    renderer._renderData.color = renderer.color;
  }

  private static _updatePosition(renderer: TextRenderer): void {
    const localPositions = renderer._sprite._positions;
    const localVertexPos = TextAssembler._tempVec3;
    const worldMatrix = renderer.entity.transform.worldMatrix;

    const { positions: _positions } = renderer._renderData;
    for (let i = 0, n = _positions.length; i < n; i++) {
      const curVertexPos = localPositions[i];
      localVertexPos.setValue(curVertexPos.x, curVertexPos.y, 0);
      Vector3.transformToVec3(localVertexPos, worldMatrix, _positions[i]);
    }
  }

  private static _updateText(renderer: TextRenderer): void {
    const { width: originWidth, height: originHeight, enableWrapping, overflowMode } = renderer;
    const fontString = TextUtils.getNativeFontString(renderer.font.name, renderer.fontSize, renderer.fontStyle);
    const textMetrics = TextUtils.measureText(
      renderer.text,
      originWidth,
      originHeight,
      renderer.lineSpacing,
      enableWrapping,
      overflowMode,
      fontString
    );
    TextUtils.updateText(textMetrics, fontString, renderer.horizontalAlignment, renderer.verticalAlignment);
    TextAssembler._updateTexture(renderer);
  }

  private static _updateTexture(renderer: TextRenderer): void {
    const trimData = TextUtils.trimCanvas();
    const { width, height } = trimData;
    const canvas = TextUtils.updateCanvas(width, height, trimData.data);
    renderer._clearTexture();

    const { _sprite: sprite, horizontalAlignment, verticalAlignment } = renderer;

    // Handle the case that width or height of text is larger than real width or height.
    const { pixelsPerUnit, pivot } = sprite;
    switch (horizontalAlignment) {
      case TextHorizontalAlignment.Left:
        pivot.x = (renderer.width * pixelsPerUnit) / width * 0.5;
        break;
      case TextHorizontalAlignment.Right:
        pivot.x = 1 - (renderer.width * pixelsPerUnit) / width * 0.5;
        break;
      case TextHorizontalAlignment.Center:
        pivot.x = 0.5;
        break;
    }
    switch (verticalAlignment) {
      case TextVerticalAlignment.Top:
        pivot.y = 1 - (renderer.height * pixelsPerUnit) / height * 0.5;
        break;
      case TextVerticalAlignment.Bottom:
        pivot.y = (renderer.height * pixelsPerUnit) / height * 0.5;
        break;
      case TextVerticalAlignment.Center:
        pivot.y = 0.5;
        break;
    }
    sprite.pivot = pivot;

    // If add fail, set texture for sprite.
    if (!renderer.engine._dynamicTextAtlasManager.addSprite(sprite, canvas)) {
      const texture = new Texture2D(renderer.engine, width, height);
      texture.setImageSource(canvas);
      texture.generateMipmaps();
      sprite.texture = texture;
    }
    // Update sprite data.
    sprite._updateMesh();
    renderer._renderData.uvs = sprite._uv;
  }
}
