//-- SSAO demo
import { vec3,vec4} from '@alipay/r3-math';
import { Logger } from '@alipay/r3-base';
import { Engine} from '@alipay/r3-core';
import { RegistExtension } from '@alipay/r3-loader-gltf';
import { ADefaultCamera } from '@alipay/r3-default-camera';
import { AEnvironmentMapLight, PBRMaterial } from '@alipay/r3-pbr';
import { ADirectLight } from '@alipay/r3-lighting';
import '@alipay/r3-engine-stats';
import { ResourceLoader, Resource} from '@alipay/r3-loader';
import '@alipay/r3-loader-gltf';
import '@alipay/r3-shadow';
import { AOrbitControls } from '@alipay/r3-orbit-controls'
import {LambertMaterial} from '@alipay/r3-mobile-material';
import {PostProcessFeature,SSAOEffect,addNormalPass,addDepthTexturePass,addDepthPass} from '@alipay/r3-post-processing';
import '@alipay/r3-engine-stats';
import { createControllerUI } from '../common/ControllerUI';

const cameraNear = 0.1;
const cameraFar = 20.0;

Logger.enable();
RegistExtension( { PBRMaterial } );
//-- create engine object
let engine = new Engine();
const resourceLoader = new ResourceLoader(engine);
let scene = engine.currentScene;
let rootNode = scene.root;

//-- create  material
let mtl = new LambertMaterial('building_mtl', false);
mtl.diffuse = vec4.fromValues(0.5, 0.5, 0.5, 1);
mtl.ambient = vec4.fromValues(0.4, 0.6, 0.75, 1);

//-- create a light

const envLightNode = rootNode.createChild( 'env_light' );
    const envLight = envLightNode.createAbility( AEnvironmentMapLight );
    envLight.diffuse = [ 0.75, 0.75, 0.75 ];
    envLight.specular = [ 0.5, 0.5, 0.7 ];

    const light2 = rootNode.createChild( 'light2' );
    light2.position = [ -1, 1.3, -0.5 ];
    light2.lookAt( [ 0, 0, 0 ], [ 0, 1, 0 ] );
    const directLight = light2.createAbility( ADirectLight, {
      color: [ 1, 1, 1 ],
      intensity: 1.0
    } );

const animationRes = new Resource('earth', {
  type: 'gltf',
  //url: 'https://gw.alipayobjects.com/os/hpmweb-unittest/22169d10-30ba-476c-a3bd-473f40bc0a22/testtree_demo.gltf',
  url: 'https://gw.alipayobjects.com/os/earth_gltf/7b81bcfe-b77b-44b2-b57f-766f52bfa06f/earth.gltf'
});

//-- create camera
let cameraNode = rootNode.createChild('camera_node');
var camera = cameraNode.createAbility(ADefaultCamera, {
  canvas: 'r3-demo', position: [0, 0.8, 10],near:cameraNear,far:cameraFar,fov:90.0,
  clearParam : [0.0,0.0,0.0,1.0]
});
cameraNode.lookAt(vec3.fromValues(0,0,0), (0,1,0));
cameraNode.createAbility(AOrbitControls, { canvas: document.getElementById('r3-demo') });

let node = rootNode.createChild('gltf_node');

resourceLoader.load(animationRes, (err, gltf) => {
  const nodes = gltf.asset.rootScene.nodes;
  nodes.forEach(n => {
    node.addChild(n);
  });

})


//setup the postProcessing
let rtSize = 2048;
let depthPack = true;

const postProcess = scene.findFeature(PostProcessFeature);
postProcess.initRT(rtSize,rtSize);

const ssao = new SSAOEffect(postProcess,{depthPack: depthPack, rtSize: rtSize});
const sceneNormalRT = addNormalPass(camera,0,[rtSize,rtSize]);
ssao.normalTexture = sceneNormalRT.texture;

if(depthPack){
  const sceneDepthRT = addDepthPass(camera,0,rtSize);
  ssao.depthTexture = sceneDepthRT.texture;
}else{
  let depthFeature = addDepthTexturePass(camera,0,rtSize);
  ssao.depthTexture = depthFeature.depthTexture;
}

ssao.projectionInvertMat = camera.inverseProjectionMatrix;
ssao.projectionMat = camera.projectionMatrix;
postProcess.addEffect(ssao);

console.log(ssao);
console.log(ssao._ao.radius);

//-- add parameters control
createControllerUI('SSAO', {
  radius:[0,100],
  bias:[0,1],
  attenuation_x:[0,2],
  attenuation_y:[0,10],
  chooser:[-3,3],
  blurSize:[0,3],
  depthBias:[0,0.01]
},ssao);



engine.run();
