// ------------------------Diffuse------------------------

// sh need be pre-scaled in CPU.
vec3 getLightProbeIrradiance(vec3 sh[9], vec3 normal){
      vec3 result = sh[0] +

            sh[1] * (normal.y) +
            sh[2] * (normal.z) +
            sh[3] * (normal.x) +

            sh[4] * (normal.y * normal.x) +
            sh[5] * (normal.y * normal.z) +
            sh[6] * (3.0 * normal.z * normal.z - 1.0) +
            sh[7] * (normal.z * normal.x) +
            sh[8] * (normal.x * normal.x - normal.y * normal.y);
    
    return max(result, vec3(0.0));

}

// ------------------------Specular------------------------

// source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html
float GGXRoughnessToBlinnExponent(float ggxRoughness ) {
    return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );
}

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec3 envBRDFApprox(vec3 specularColor,float roughness, float dotNV ) {

    const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

    const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

    vec4 r = roughness * c0 + c1;

    float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

    vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

    return specularColor * AB.x + AB.y;

}


// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
float getSpecularMIPLevel(float blinnShininessExponent, int maxMIPLevel ) {
    float maxMIPLevelScalar = float( maxMIPLevel );
    float desiredMIPLevel = maxMIPLevelScalar + 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );

    // clamp to allowable LOD ranges.
    return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}

vec3 getLightProbeRadiance(GeometricContext geometry, float roughness, int maxMIPLevel, float specularIntensity) {

    #ifndef O3_USE_SPECULAR_ENV

        return vec3(0);

    #else

        vec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );
        
        float specularMIPLevel = getSpecularMIPLevel( GGXRoughnessToBlinnExponent( roughness ), maxMIPLevel );

        #ifdef HAS_TEX_LOD
            vec4 envMapColor = textureCubeLodEXT( u_env_specularSampler, reflectVec, specularMIPLevel );
        #else
            vec4 envMapColor = textureCube( u_env_specularSampler, reflectVec, specularMIPLevel );
        #endif

        envMapColor.rgb *= specularIntensity;

        return envMapColor.rgb;

    #endif

}