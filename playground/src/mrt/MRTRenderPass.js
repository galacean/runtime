import { RenderPass, MaskList, RenderTarget, MultiRenderTarget, Texture2D, TextureFilter, TextureWrapMode } from "@alipay/o3";
import { MRTMaterial } from "./MRTMaterial";

export class MRTRenderPass extends RenderPass {
  constructor(name, priority, renderTarget) {
    const mtl = new MRTMaterial("name");
    // const mtl = createMat();
    super(name, priority, renderTarget, mtl, MaskList.EVERYTHING);

    const config = {
      magFilter: TextureFilter.LINEAR,
      minFilter: TextureFilter.LINEAR,
      wrapS: TextureWrapMode.CLAMP_TO_EDGE,
      wrapT: TextureWrapMode.CLAMP_TO_EDGE,
    };

    renderTarget.addTexColor(new Texture2D("diffuse-texture", null, config));
    renderTarget.addTexColor(new Texture2D("speculor-texture", null, config));
    renderTarget.addTexColor(new Texture2D("normal-texture", null, config));
    renderTarget.addTexColor(new Texture2D("position-texture", null, config));

    this.mask = MaskList.MASK1;
  }
}
