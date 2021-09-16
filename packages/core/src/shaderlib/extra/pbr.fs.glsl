#define IS_METALLIC_WORKFLOW
#include <common>
#include <common_frag>

#include <fog_share>

#include <uv_share>
#include <normal_share>
#include <color_share>
#include <worldpos_share>

#include <light_frag>


#include <pbr_frag_define>
#include <pbr_helper>
#include <normal_get>

void main() {
    #include <pbr_frag>
    #include <gamma_frag>
    #include <fog_frag>
}
