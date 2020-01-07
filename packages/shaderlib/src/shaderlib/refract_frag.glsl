#ifdef HAS_PERTURBATIONMAP

  vec4 screenColor = texture2D(u_perturbationSampler, getScreenUv() + normalize(u_viewMat * vec4(normal, 1.)).xy * vec2(u_perturbationUOffset, u_perturbationVOffset));
  gl_FragColor = mix(screenColor, gl_FragColor, gl_FragColor.a);

#endif
