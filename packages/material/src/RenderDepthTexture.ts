import { TextureCubeFace, RenderBufferDepthFormat, GLCapabilityType, AssetType, Logger } from "@alipay/o3-base";
import { Texture } from "./Texture";

/**
 * 类应用于渲染深度纹理。
 */
export class RenderDepthTexture extends Texture {
  /**
   * 格式。
   */
  get format(): RenderBufferDepthFormat {
    return this._format;
  }

  /**
   * 自动生成多级纹理。
   */
  get autoGenerateMipmaps(): boolean {
    return this._autoMipmap;
  }

  set autoGenerateMipmaps(value: boolean) {
    this._autoMipmap = value;
  }

  private _format: RenderBufferDepthFormat;
  private _autoMipmap: boolean = false;

  /**
   * 构造渲染深度纹理。
   * @param rhi - GPU 硬件抽象层
   * @param width - 宽
   * @param height - 高
   * @param format - 格式。默认 RenderBufferDepthFormat.Depth,深度纹理,自动选择精度
   * @param mipmap - 是否使用多级纹理
   * @param isCube - 是否需要生成立方体纹理
   */
  constructor(
    rhi,
    width: number,
    height: number,
    format: RenderBufferDepthFormat = RenderBufferDepthFormat.Depth,
    mipmap: boolean = false,
    isCube: boolean = false
  ) {
    // todo: delete super
    super("", null);

    const gl: WebGLRenderingContext & WebGL2RenderingContext = rhi.gl;
    const isWebGL2: boolean = rhi.isWebGL2;

    if (format === RenderBufferDepthFormat.Stencil) {
      Logger.error("webGL不能单独生成模板纹理,可以绑定到RBO");
      return;
    }

    if (!rhi.canIUse(GLCapabilityType.depthTexture)) {
      Logger.error("当前环境不支持生成深度相关的纹理,请先检测能力再使用");
      return;
    }
    if ((format === RenderBufferDepthFormat.Depth24 || format === RenderBufferDepthFormat.Depth32) && !isWebGL2) {
      Logger.error("当前环境不支持高精度深度纹理,请先检测能力再使用");
      return;
    }
    if (format === RenderBufferDepthFormat.Depth32Stencil8 && !isWebGL2) {
      Logger.error("当前环境不支持高精度深度模版纹理,请先检测能力再使用");
      return;
    }
    if (isCube && width !== height) {
      Logger.error("立方体纹理的宽高必须一致");
      return;
    }
    if (mipmap && !isWebGL2 && (!Texture._isPowerOf2(width) || !Texture._isPowerOf2(height))) {
      Logger.warn("WebGL1不支持非二次幂纹理开启 mipmap,已自动降级为非mipmap");
      mipmap = false;
    }

    const formatDetail = Texture._getRenderBufferDepthFormatDetail(format, gl, isWebGL2);

    if (!formatDetail) {
      Logger.error(`很抱歉，引擎不支持此格式: ${format}`);
      return;
    }

    const glTexture = gl.createTexture();

    this._glTexture = glTexture;
    this._formatDetail = formatDetail;
    this._isCube = isCube;
    this._rhi = rhi;
    this._target = isCube ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
    this._mipmap = mipmap;
    this._width = width;
    this._height = height;
    this._format = format;

    this._initMipmap();
    //todo: delete
    this.type = AssetType.Scene;
  }
}
