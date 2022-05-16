import { TextureCubeFace } from "../texture";
import { IPlatformTexture } from "./IPlatformTexture";

/**
 * Cube texture interface specification.
 */
export interface IPlatformTextureCube extends IPlatformTexture {
  /**
   * Setting pixels data through cube face,color buffer data, designated area and texture mipmapping level,it's also applicable to compressed formats.
   * @remarks When compressed texture is in WebGL1, the texture must be filled first before writing the sub-region
   * @param face - Cube face
   * @param colorBuffer - Color buffer data
   * @param mipLevel - Texture mipmapping level
   * @param x - X coordinate of area start
   * @param y -  Y coordinate of area start
   * @param width - Data width.if it's empty, width is the width corresponding to mipLevel minus x , width corresponding to mipLevel is Math.max(1, this.width >> mipLevel)
   * @param height - Data height.if it's empty, height is the height corresponding to mipLevel minus y , height corresponding to mipLevel is Math.max(1, this.height >> mipLevel)
   */
  setPixelBuffer(
    face: TextureCubeFace,
    colorBuffer: ArrayBufferView,
    mipLevel: number,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void;

  /**
   * Setting pixels data through cube face, TexImageSource, designated area and texture mipmapping level.
   * @param face - Cube face
   * @param imageSource - The source of texture
   * @param mipLevel - Texture mipmapping level
   * @param flipY - Whether to flip the Y axis
   * @param premultiplyAlpha - Whether to premultiply the transparent channel
   * @param x - X coordinate of area start
   * @param y - Y coordinate of area start
   */
  setImageSource(
    face: TextureCubeFace,
    imageSource: TexImageSource | OffscreenCanvas,
    mipLevel: number,
    flipY: boolean,
    premultiplyAlpha: boolean,
    x: number,
    y: number
  ): void;

  /**
   * Get the pixel color buffer according to the specified cube face and area.
   * @param face - You can choose which cube face to read
   * @param x - X coordinate of area start
   * @param y - Y coordinate of area start
   * @param width - Area width
   * @param height - Area height
   * @param mipLevel - Set mip level the data want to get from
   * @param out - Color buffer
   */
  getPixelBuffer(
    face: TextureCubeFace,
    x: number,
    y: number,
    width: number,
    height: number,
    mipLevel: number,
    out: ArrayBufferView
  ): void;
}
