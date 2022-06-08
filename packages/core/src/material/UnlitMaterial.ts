import { Color, Vector4 } from "@oasis-engine/math";
import { Engine } from "../Engine";
import { Shader } from "../shader/Shader";
import { Texture2D } from "../texture/Texture2D";
import { BaseMaterial } from "./BaseMaterial";

interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Unlit Material.
 */
export class UnlitMaterial extends BaseMaterial {
  /**
   * Base color.
   */
  get baseColor(): Color {
    return this.shaderData.getColor(UnlitMaterial._baseColorProp);
  }

  set baseColor(value: Color) {
    const baseColor = this.shaderData.getColor(UnlitMaterial._baseColorProp);
    if (value !== baseColor) {
      baseColor.setValue(value.r, value.g, value.b, value.a);
    }
  }

  /**
   * Base texture.
   */
  get baseTexture(): Texture2D {
    return <Texture2D>this.shaderData.getTexture(UnlitMaterial._baseTextureProp);
  }

  set baseTexture(value: Texture2D) {
    this.shaderData.setTexture(UnlitMaterial._baseTextureProp, value);
    if (value) {
      this.shaderData.enableMacro(UnlitMaterial._baseTextureMacro);
    } else {
      this.shaderData.disableMacro(UnlitMaterial._baseTextureMacro);
    }
  }

  /**
   * Tiling and offset of main textures.
   */
  get tilingOffset(): Vector4 {
    return this.shaderData.getVector4(UnlitMaterial._tilingOffsetProp);
  }

  set tilingOffset(value: Vector4) {
    const tilingOffset = this.shaderData.getVector4(UnlitMaterial._tilingOffsetProp);
    if (value !== tilingOffset) {
      value.cloneTo(tilingOffset);
    }
  }

  /**
   * Create a unlit material instance.
   * @param engine - Engine to which the material belongs
   */
  constructor(engine: Engine) {
    super(engine, Shader.find("unlit"));

    const shaderData = this.shaderData;

    shaderData.enableMacro("OMIT_NORMAL");
    shaderData.enableMacro("O3_NEED_TILINGOFFSET");

    shaderData.setColor(UnlitMaterial._baseColorProp, new Color(1, 1, 1, 1));
    shaderData.setVector4(UnlitMaterial._tilingOffsetProp, new Vector4(1, 1, 0, 0));
  }

  /**
   * @override
   */
  clone(): UnlitMaterial {
    const dest = new UnlitMaterial(this._engine);
    this.cloneTo(dest);
    return dest;
  }
}
