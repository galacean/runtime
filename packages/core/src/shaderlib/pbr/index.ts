import pbr_util_frag_define from "./util_frag_define.glsl";

import pbr_frag_define from "./pbr_frag_define.glsl";

// todo: BxDF
import pbr_brdf_cook_torrance_frag_define from "./brdf_cook_torrance_frag_define.glsl";

/** direct + IBL */
import pbr_direct_irradiance_frag_define from "./direct_irradiance_frag_define.glsl";
import pbr_ibl_specular_frag_define from "./ibl_specular_frag_define.glsl";
import pbr_ibl_diffuse_frag_define from "./ibl_diffuse_frag_define.glsl";

import pbr_begin_frag from "./begin_frag.glsl";
import pbr_direct_irradiance_frag from "./direct_irradiance_frag.glsl";
import pbr_ibl_diffuse_frag from "./ibl_diffuse_frag.glsl";
import pbr_ibl_specular_frag from "./ibl_specular_frag.glsl";
import pbr_end_frag from "./end_frag.glsl";

export default {
  pbr_util_frag_define,

  pbr_frag_define,
  pbr_brdf_cook_torrance_frag_define,

  pbr_direct_irradiance_frag_define,
  pbr_ibl_specular_frag_define,
  pbr_ibl_diffuse_frag_define,

  pbr_begin_frag,
  pbr_direct_irradiance_frag,
  pbr_ibl_diffuse_frag,
  pbr_ibl_specular_frag,
  pbr_end_frag
};
