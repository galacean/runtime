#include <common>
#include <common_vert>
#include <blendShape_input>
uniform mat4 camera_VPMat;


void main() {

    #include <begin_position_vert>
    #include <blendShape_vert>
    #include <skinning_vert>

    gl_Position = renderer_MVPMat * position;

}
