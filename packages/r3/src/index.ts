export * from '@alipay/r3-2d';
export * from '@alipay/r3-animation';
export * from '@alipay/r3-base';
export * from '@alipay/r3-collider';
export * from '@alipay/r3-collision';
export * from '@alipay/r3-core';
export * from '@alipay/r3-default-camera';
export * from '@alipay/r3-fog';
export * from '@alipay/r3-framebuffer-picker';
export * from '@alipay/r3-free-controls';
export * from '@alipay/r3-fsm';
export * from '@alipay/r3-geometry';
export * from '@alipay/r3-geometry-shape';
export * from '@alipay/r3-hud';
export * from '@alipay/r3-lighting';
export * from '@alipay/r3-loader';
export * from '@alipay/r3-loader-gltf';
export * from '@alipay/r3-material';
export * from '@alipay/r3-math';
export * from '@alipay/r3-mesh';
export * from '@alipay/r3-mobile-material';
export * from '@alipay/r3-orbit-controls';
export * from '@alipay/r3-particle';
export * from '@alipay/r3-pbr';
// export * from '@alipay/r3-post-processing';
export * from '@alipay/r3-primitive';
import '@alipay/r3-raycast';
export * from '@alipay/r3-renderer-basic';
export * from '@alipay/r3-renderer-cull';
export * from '@alipay/r3-request';
export * from '@alipay/r3-rfui';
export * from '@alipay/r3-rhi-webgl';
export * from '@alipay/r3-shaderlib';
import '@alipay/r3-shadow';
export * from '@alipay/r3-skybox';
export * from '@alipay/r3-trail';
export * from '@alipay/r3-tween';

import { PBRMaterial } from '@alipay/r3-pbr';
import { TextureMaterial, TransparentMaterial } from '@alipay/r3-mobile-material';
import { RegistExtension } from "@alipay/r3-loader-gltf";

RegistExtension({ PBRMaterial, TextureMaterial, TransparentMaterial });
