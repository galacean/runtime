void main() {
#ifdef OASIS_NO_DEPTH_TEXTURE
    gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);
#else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
#endif
}