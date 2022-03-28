uniform float u_alphaCutoff;
uniform float u_ior;
uniform vec4 u_baseColor;
uniform float u_metal;
uniform float u_roughness;
uniform vec3 u_specularColor;
uniform float u_glossiness;
uniform vec3 u_emissiveColor;
uniform float u_dielectricSpecularIntensity;
uniform vec3 u_dielectricF0Color;

#ifdef CLEARCOAT
    uniform float u_clearcoat;
    uniform float u_clearcoatRoughness;
#endif

#ifdef SHEEN
    uniform vec3  u_sheenColor;
    uniform float u_sheenRoughness;
#endif

#ifdef REFRACTION
    uniform sampler2D u_refractionTexture;
    uniform float u_refractionIntensity;
    uniform float u_thickness;
    uniform float u_attenuationDistance;
    uniform vec3  u_attenuationColor;
#endif

uniform float u_normalIntensity;
uniform float u_occlusionStrength;


// Texture
#ifdef HAS_BASECOLORMAP
    uniform sampler2D u_baseColorSampler;
#endif

#ifdef O3_NORMAL_TEXTURE
    uniform sampler2D u_normalTexture;
#endif

#ifdef HAS_EMISSIVEMAP
    uniform sampler2D u_emissiveSampler;
#endif

#ifdef HAS_METALROUGHNESSMAP
    uniform sampler2D u_metallicRoughnessSampler;
#endif


#ifdef HAS_SPECULARGLOSSINESSMAP
    uniform sampler2D u_specularGlossinessSampler;
#endif

#ifdef HAS_OCCLUSIONMAP
    uniform sampler2D u_occlusionSampler;
#endif

#ifdef HAS_CLEARCOATTEXTURE
    uniform sampler2D u_clearcoatTexture;
#endif

#ifdef HAS_CLEARCOATROUGHNESSTEXTURE
    uniform sampler2D u_clearcoatRoughnessTexture;
#endif

#ifdef HAS_CLEARCOATNORMALTEXTURE
    uniform sampler2D u_clearcoatNormalTexture;
#endif

#ifdef HAS_SHEENCOLORTEXTURE
    uniform sampler2D u_sheenColorTexture;
#endif

#ifdef HAS_SHEENROUGHNESSTEXTURE
    uniform sampler2D u_sheenRoughnessTexture;
#endif

#ifdef HAS_DIELECTRICSPECULARINTENSITYTEXTURE
    uniform sampler2D u_dielectricSpecularIntensityTexture;
#endif

#ifdef HAS_DIELECTRICF0COLORTEXTURE
    uniform sampler2D u_dielectricF0ColorTexture;
#endif

#ifdef HAS_REFRACTIONINTENSITYTEXTURE
    uniform sampler2D u_refractionIntensityTexture;
#endif

#ifdef HAS_THICKNESSTEXTURE
    uniform sampler2D u_thicknessTexture;
#endif


// Runtime
struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};

struct Geometry {
    vec3  position;
    vec3  normal;
    vec3  viewDir;
    float dotNV;
    
    #ifdef CLEARCOAT
        vec3 clearcoatNormal;
        float clearcoatDotNV;
    #endif

};

struct Material {
    vec3  diffuseColor;
    float roughness;
    vec3  specularColor;
    float F90;
    float opacity;
    float clearcoatAttenuation;
    float sheenAttenuation;

    #ifdef CLEARCOAT
        float clearcoat;
        float clearcoatRoughness;
    #endif
    
    #ifdef SHEEN
        vec3  sheenColor;
        float sheenRoughness;
        float sheenEnvBRDF;
    #endif

};
