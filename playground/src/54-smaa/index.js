import { TextureFilter } from '@alipay/r3-base';
import { Engine } from '@alipay/r3-core';
import { ResourceLoader, Resource } from '@alipay/r3-loader';
import { RegistExtension } from '@alipay/r3-loader-gltf';
import { ADefaultCamera } from '@alipay/r3-default-camera';
import { AOrbitControls } from '@alipay/r3-orbit-controls';
import { AEnvironmentMapLight, PBRMaterial } from '@alipay/r3-pbr';
import { ASkyBox } from '@alipay/r3-skybox';
import '@alipay/r3-shadow';
import { PostProcessFeature, SMAAEffect } from '@alipay/r3-post-processing';
import { ADirectLight } from '@alipay/r3-lighting';
import { vec3, mat4 } from '@alipay/r3-math';
RegistExtension( { PBRMaterial } );import { createControllerUI } from '../common/ControllerUI';

//-- create engine object
let engine = new Engine();
const resourceLoader = new ResourceLoader(engine);
let scene = engine.currentScene;
let rootNode = scene.root;

//-- create camera
let cameraNode = rootNode.createChild('camera_node');
let camera = cameraNode.createAbility(ADefaultCamera, {
  canvas: 'r3-demo', position: [300, 400, 500], near: 0.01, attributes: { antialias: false}
});
cameraNode.createAbility(AOrbitControls, { canvas: 'r3-demo'});
    
// 方向光
let light2 = rootNode.createChild("light2");
light2.position = [20, 300, 220];
light2.lookAt([0, 0, 0], [0, 1, 0]);
let directLight = light2.createAbility(ADirectLight, {
  color: vec3.fromValues(0.25, 0.25, 0.25),
  intensity: 1.0
});
directLight.enableShadow = true;
directLight.shadow.setMapSize(1024, 1024);
directLight.shadow.intensity = 0.35;
mat4.ortho( directLight.shadow.projectionMatrix, -200, 200, -200, 200, 0.1, 1000 );

let envLightNode = rootNode.createChild('env_light');
let envLight = envLightNode.createAbility(AEnvironmentMapLight);


let cubeMapRes = new Resource('env', {
  type: 'cubemap',
  urls: [
    './environment/px.jpg',
    './environment/nx.jpg',
    './environment/py.jpg',
    './environment/ny.jpg',
    './environment/pz.jpg',
    './environment/nz.jpg',
  ]
});

let diffuseMapRes = new Resource('dif', {
  type: 'cubemap',
  urls: [
    './env/papermill/diffuse/diffuse_right_0.jpg',
    './env/papermill/diffuse/diffuse_left_0.jpg',
    './env/papermill/diffuse/diffuse_top_0.jpg',
    './env/papermill/diffuse/diffuse_bottom_0.jpg',
    './env/papermill/diffuse/diffuse_front_0.jpg',
    './env/papermill/diffuse/diffuse_back_0.jpg',
  ],
});

let environmentMapRes = new Resource('dif', {
  type: 'cubemap',
  urls: [
    './env/papermill/environment/environment_right_0.jpg',
    './env/papermill/environment/environment_left_0.jpg',
    './env/papermill/environment/environment_top_0.jpg',
    './env/papermill/environment/environment_bottom_0.jpg',
    './env/papermill/environment/environment_front_0.jpg',
    './env/papermill/environment/environment_back_0.jpg',
  ],
});

let specularMapRes = new Resource('env', {
  type: 'cubemap',
  urls: [
    [
      './env/papermill/specular/specular_right_0.jpg',
      './env/papermill/specular/specular_left_0.jpg',
      './env/papermill/specular/specular_top_0.jpg',
      './env/papermill/specular/specular_bottom_0.jpg',
      './env/papermill/specular/specular_front_0.jpg',
      './env/papermill/specular/specular_back_0.jpg',
    ],
    [
      './env/papermill/specular/specular_right_1.jpg',
      './env/papermill/specular/specular_left_1.jpg',
      './env/papermill/specular/specular_top_1.jpg',
      './env/papermill/specular/specular_bottom_1.jpg',
      './env/papermill/specular/specular_front_1.jpg',
      './env/papermill/specular/specular_back_1.jpg',
    ],
    [
      './env/papermill/specular/specular_right_2.jpg',
      './env/papermill/specular/specular_left_2.jpg',
      './env/papermill/specular/specular_top_2.jpg',
      './env/papermill/specular/specular_bottom_2.jpg',
      './env/papermill/specular/specular_front_2.jpg',
      './env/papermill/specular/specular_back_2.jpg',
    ],
    [
      './env/papermill/specular/specular_right_3.jpg',
      './env/papermill/specular/specular_left_3.jpg',
      './env/papermill/specular/specular_top_3.jpg',
      './env/papermill/specular/specular_bottom_3.jpg',
      './env/papermill/specular/specular_front_3.jpg',
      './env/papermill/specular/specular_back_3.jpg',
    ],
    [
      './env/papermill/specular/specular_right_4.jpg',
      './env/papermill/specular/specular_left_4.jpg',
      './env/papermill/specular/specular_top_4.jpg',
      './env/papermill/specular/specular_bottom_4.jpg',
      './env/papermill/specular/specular_front_4.jpg',
      './env/papermill/specular/specular_back_4.jpg',
    ],
    [
      './env/papermill/specular/specular_right_5.jpg',
      './env/papermill/specular/specular_left_5.jpg',
      './env/papermill/specular/specular_top_5.jpg',
      './env/papermill/specular/specular_bottom_5.jpg',
      './env/papermill/specular/specular_front_5.jpg',
      './env/papermill/specular/specular_back_5.jpg',
    ],
    [
      './env/papermill/specular/specular_right_6.jpg',
      './env/papermill/specular/specular_left_6.jpg',
      './env/papermill/specular/specular_top_6.jpg',
      './env/papermill/specular/specular_bottom_6.jpg',
      './env/papermill/specular/specular_front_6.jpg',
      './env/papermill/specular/specular_back_6.jpg',
    ],
    [
      './env/papermill/specular/specular_right_7.jpg',
      './env/papermill/specular/specular_left_7.jpg',
      './env/papermill/specular/specular_top_7.jpg',
      './env/papermill/specular/specular_bottom_7.jpg',
      './env/papermill/specular/specular_front_7.jpg',
      './env/papermill/specular/specular_back_7.jpg',
    ],
    [
      './env/papermill/specular/specular_right_8.jpg',
      './env/papermill/specular/specular_left_8.jpg',
      './env/papermill/specular/specular_top_8.jpg',
      './env/papermill/specular/specular_bottom_8.jpg',
      './env/papermill/specular/specular_front_8.jpg',
      './env/papermill/specular/specular_back_8.jpg',
    ],
    [
      './env/papermill/specular/specular_right_9.jpg',
      './env/papermill/specular/specular_left_9.jpg',
      './env/papermill/specular/specular_top_9.jpg',
      './env/papermill/specular/specular_bottom_9.jpg',
      './env/papermill/specular/specular_front_9.jpg',
      './env/papermill/specular/specular_back_9.jpg',
    ],

  ],
  config: {
    magFilter: TextureFilter.LINEAR,
    minFilter: TextureFilter.LINEAR_MIPMAP_LINEAR,
  }
});

const lutRes = new Resource('lut', {
  type: 'texture',
  url: './env/brdfLUT.png',
});


const gltfRes = new Resource('campaign_gltf', {
  type: 'gltf',
  url: 'https://gw.alipayobjects.com/os/hpmweb-unittest/22169d10-30ba-476c-a3bd-473f40bc0a22/testtree_demo.gltf',
});

let node = rootNode.createChild('gltf_node');
resourceLoader.batchLoad([gltfRes, lutRes, diffuseMapRes, specularMapRes, cubeMapRes], (err, res) => {
  const glb = res[0];
  const nodes = glb.asset.rootScene.nodes;
    
  const postProcess = scene.findFeature(PostProcessFeature);
  postProcess.initRT(3000, 3000);

  const lut = res[1].asset;
  envLight.brdfMap = lut;
  envLight.diffuseMap = res[2].asset;
  envLight.specularMap = res[3].asset;

  let cubeMaps = res[4].assets[0];
  let skybox = rootNode.createAbility(ASkyBox, { skyBoxMap: cubeMaps });

  nodes.forEach(n => {
    n.scale = [50, 50, 50];
    node.addChild(n);
    n.castShadow = true;
    n.recieveShadow = true;

  });
  
  nodes[0].children[16].recieveShadow = false;
  nodes[0].children[14].recieveShadow = false;
  nodes[0].children[4].recieveShadow = false;
  nodes[0].children[0].recieveShadow = false;
  nodes[0].children[2].recieveShadow = false;
  nodes[0].children[15].recieveShadow = false;
  nodes[0].children[13].castShadow = false;
  nodes[0].children[15].castShadow = false;
  nodes[0].children[2].castShadow = false;
  nodes[0].children[3].castShadow = false;

  // 添加smaa效果
  const smaa = new SMAAEffect(postProcess, {camera: camera, rtSize: 3000});
  postProcess.addEffect(smaa);
  createControllerUI('SMAA', {
  }, smaa);

});

//-- run
engine.run();
