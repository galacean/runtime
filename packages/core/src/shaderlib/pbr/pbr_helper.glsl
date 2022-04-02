#include <normal_get>

float computeSpecularOcclusion(float ambientOcclusion, float roughness, float dotNV ) {
    return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}

float getAARoughnessFactor(vec3 normal) {
    #ifdef HAS_DERIVATIVES
        vec3 dxy = max( abs(dFdx(normal)), abs(dFdy(normal)) );
        return max( max(dxy.x, dxy.y), dxy.z );
    #else
        return 0.0;
    #endif
}

mat3 transposeMat3(mat3 inMatrix) {
    vec3 i0 = inMatrix[0];
    vec3 i1 = inMatrix[1];
    vec3 i2 = inMatrix[2];

    mat3 outMatrix = mat3(
        vec3(i0.x, i1.x, i2.x),
        vec3(i0.y, i1.y, i2.y),
        vec3(i0.z, i1.z, i2.z)
        );

    return outMatrix;
}

void initGeometry(out Geometry geometry){
    geometry.position = v_pos;
    geometry.viewDir =  normalize(u_cameraPos - v_pos);

    #if defined(O3_NORMAL_TEXTURE) || defined(HAS_CLEARCOATNORMALTEXTURE) || defined(HAS_PARALLAXTEXTURE) 
        mat3 tbn = getTBN();
    #endif

    geometry.normal = getNormal( 
            #ifdef O3_NORMAL_TEXTURE
                tbn,
                u_normalTexture,
                u_normalIntensity
            #endif
    );

    geometry.dotNV = saturate( dot(geometry.normal, geometry.viewDir) );
    geometry.uv = v_uv;

    #ifdef CLEARCOAT
        geometry.clearcoatNormal = getNormal(
              #ifdef HAS_CLEARCOATNORMALTEXTURE
                tbn,
                u_clearcoatNormalTexture,
                u_normalIntensity
            #endif
        );
        geometry.clearcoatDotNV = saturate( dot(geometry.clearcoatNormal, geometry.viewDir) );
    #endif

    #ifdef HAS_PARALLAXTEXTURE
        mat3 invTBN = transposeMat3(tbn);
        float height = texture2D(u_parallaxTexture, v_uv).r;
        vec2 uvOffset = parallaxOffset(invTBN * geometry.viewDir, height, u_parallaxTextureIntensity);
        geometry.uv += uvOffset;
    #endif

}

void initMaterial(out Material material, const in Geometry geometry){
        vec4 baseColor = u_baseColor;
        float metal = u_metal;
        float roughness = u_roughness;
        vec3 specularColor = u_specularColor;
        float glossiness = u_glossiness;
        float alphaCutoff = u_alphaCutoff;

        #ifdef HAS_BASECOLORMAP
            vec4 baseTextureColor = texture2D(u_baseColorSampler, geometry.uv);
            #ifndef OASIS_COLORSPACE_GAMMA
                baseTextureColor = gammaToLinear(baseTextureColor);
            #endif
            baseColor *= baseTextureColor;
        #endif

        #ifdef O3_HAS_VERTEXCOLOR
            baseColor *= v_color;
        #endif


        #ifdef ALPHA_CUTOFF
            if( baseColor.a < alphaCutoff ) {
                discard;
            }
        #endif

        #ifdef HAS_METALROUGHNESSMAP
            vec4 metalRoughMapColor = texture2D( u_metallicRoughnessSampler, geometry.uv );
            roughness *= metalRoughMapColor.g;
            metal *= metalRoughMapColor.b;
        #endif

        #ifdef HAS_SPECULARGLOSSINESSMAP
            vec4 specularGlossinessColor = texture2D(u_specularGlossinessSampler, geometry.uv );
            #ifndef OASIS_COLORSPACE_GAMMA
                specularGlossinessColor = gammaToLinear(specularGlossinessColor);
            #endif
            specularColor *= specularGlossinessColor.rgb;
            glossiness *= specularGlossinessColor.a;
        #endif


        #ifdef IS_METALLIC_WORKFLOW
            material.diffuseColor = baseColor.rgb * ( 1.0 - metal );
            material.specularColor = mix( vec3( 0.04), baseColor.rgb, metal );
            material.roughness = roughness;
        #else
            float specularStrength = max( max( specularColor.r, specularColor.g ), specularColor.b );
            material.diffuseColor = baseColor.rgb * ( 1.0 - specularStrength );
            material.specularColor = specularColor;
            material.roughness = 1.0 - glossiness;
        #endif

        material.roughness = max(material.roughness, getAARoughnessFactor(geometry.normal));

        #ifdef CLEARCOAT
            material.clearcoat = u_clearcoat;
            material.clearcoatRoughness = u_clearcoatRoughness;
            #ifdef HAS_CLEARCOATTEXTURE
                material.clearcoat *= texture2D( u_clearcoatTexture, geometry.uv ).r;
            #endif
            #ifdef HAS_CLEARCOATROUGHNESSTEXTURE
                material.clearcoatRoughness *= texture2D( u_clearcoatRoughnessTexture, geometry.uv ).g;
            #endif
            material.clearcoat = saturate( material.clearcoat );
            material.clearcoatRoughness = max(material.clearcoatRoughness, getAARoughnessFactor(geometry.clearcoatNormal));
        #endif

        material.opacity = baseColor.a;
}

// direct + indirect
#include <brdf>
#include <direct_irradiance_frag_define>
#include <ibl_frag_define>