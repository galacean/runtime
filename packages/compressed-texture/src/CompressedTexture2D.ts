import { TextureFilter, Logger, GLCompressedTextureInternalFormat } from "@alipay/o3-base";
import { Texture2D, TextureConfig } from "@alipay/o3-material";

import { CompressedTextureData, Mipmap } from "./type";

/**
 * 2D 贴图数据对象
 */
export class CompressedTexture2D extends Texture2D {
  private _mipmaps: Mipmap[];

  public isCompressed: boolean = true;

  private _internalFormat: GLCompressedTextureInternalFormat;

  /**
   * 2D 贴图数据对象
   * @param {String} name 名称
   * @param {CompressedTextureData} compressedData 压缩纹理内容
   * @param {TextureConfig} config 可选配置
   */
  constructor(name: string, compressedData?: CompressedTextureData, config?: TextureConfig) {
    // 压缩纹理不可以flipY
    super(name, null, { ...config, flipY: false });

    if (compressedData) {
      this.setCompressedData(compressedData);
    }
  }

  get mipmaps(): Mipmap[] {
    return this._mipmaps;
  }

  set mipmaps(mipmaps: Mipmap[]) {
    this._mipmaps = mipmaps;
    // 压缩纹理不支持运行时生成mipmap，所以如果只传入一张纹理，要将minfilter改为linear
    if (mipmaps.length === 1) {
      this.setFilter(this.filterMag, TextureFilter.LINEAR);
    }
    this.updateTexture();
  }

  get internalFormat(): GLCompressedTextureInternalFormat {
    return this._internalFormat;
  }

  get flipY() {
    return false;
  }

  set flipY(value: boolean) {
    if (value === true) {
      Logger.warn("CompressedTexture2D: flipY is always false");
    }
  }

  // 压缩纹理不支持运行时生成mipmap
  get canMipmap(): boolean {
    return false;
  }

  set canMipmap(value: boolean) {
    if (value === true) {
      Logger.warn("CompressedTexture2D: can't generate mipmap");
    }
  }

  setCompressedData(data: CompressedTextureData) {
    this.mipmaps = data.mipmaps;
    this._width = data.width;
    this._height = data.height;
    this._internalFormat = data.internalFormat;
  }

  /**
   * 刷新整个纹理
   */
  updateTexture() {
    this.needUpdateWholeTexture = true;
    this.needUpdateFilers = true;
  }

  /**
   * 重置共享状态，以防清除GL资源后重建时状态错误
   * @private
   */
  resetState() {
    if (this.mipmaps) this.mipmaps = this.mipmaps;
    super.resetState();
  }

  // 覆盖Texture2D方法
  get image() {
    Logger.warn("CompressedTexture2D: cant't get image from a compressed texture");
    return null;
  }

  set image(img) {
    Logger.warn("CompressedTexture2D: cant't set image");
  }

  updateSubTexture(texSubRect, texSubImageData?) {
    Logger.warn("CompressedTexture2D: cant't updateSubTexture");
  }

  getImageData() {
    Logger.warn("CompressedTexture2D: cant't getImageData from a compressed texture");
  }

  configMipmap() {
    Logger.warn("CompressedTexture2D: cant't config mipmap");
  }
}
