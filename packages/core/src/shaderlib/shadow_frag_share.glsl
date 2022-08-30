#ifdef CASCADED_SHADOW_MAP_COUNT

// bias, intensity, radius, whether cascade
uniform vec4 u_shadowInfos[CASCADED_SHADOW_MAP_COUNT];
uniform sampler2D u_shadowMaps[CASCADED_SHADOW_MAP_COUNT];
uniform mat4 u_viewProjMatFromLight[4 * CASCADED_SHADOW_MAP_COUNT];
uniform vec4 u_cascade;

varying vec3 view_pos;

//const vec2 offsets[4] = vec2[](
//    vec2(0, 0),
//    vec2(0.5, 0),
//    vec2(0, 0.5),
//    vec2(0.5, 0.5)
//);

/**
* Degree of shadow.
*/
float getVisibility(const in sampler2D shadowMap, float bias, float intensity, float radius) {
    // Get cascade index for the current fragment's view position
    int cascadeIndex = 0;
    float scale = 1.0;
    vec2 offsets = vec2(0.0);
    mat4 viewProjMatFromLight;

    if (u_shadowInfos[0].w != 0.0) {
        scale = 0.5;
        for (int i = 0; i < 4 - 1; ++i) {
            if (view_pos.z < u_cascade[i]) {
                cascadeIndex = i + 1;
            }
        }

        if (cascadeIndex == 0) {
            viewProjMatFromLight = u_viewProjMatFromLight[0];
            offsets = vec2(0.0, 0.0);
        } else if (cascadeIndex == 1) {
            viewProjMatFromLight = u_viewProjMatFromLight[1];
            offsets = vec2(0.5, 0.0);
        } else if (cascadeIndex == 2) {
            viewProjMatFromLight = u_viewProjMatFromLight[2];
            offsets = vec2(0.0, 0.5);
        } else {
            viewProjMatFromLight = u_viewProjMatFromLight[3];
            offsets = vec2(0.5, 0.5);
        }
    }

    vec4 positionFromLight = viewProjMatFromLight * vec4(v_pos, 1.0);
    vec3 shadowCoord = positionFromLight.xyz / positionFromLight.w;
    shadowCoord = shadowCoord * 0.5 + 0.5;
    vec2 xy = shadowCoord.xy;
    xy *= scale;
    xy += offsets;
    float depth = texture2D(shadowMap, xy).x;
    if (depth <= shadowCoord.z ) {
        return 0.0;
    } else {
        return 1.0;
    }
}

#endif