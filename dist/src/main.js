import * as THREE from 'https://esm.sh/three@0.180.0';
import { GLTFLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const canvas = document.querySelector('#planet-canvas');
const stage = document.querySelector('.planet-stage');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
camera.position.set(0, 0.2, -7.8);
camera.lookAt(0, -0.65, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xf4f4ef, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.96;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const environmentGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = environmentGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.34;
environmentGenerator.dispose();

const world = new THREE.Group();
scene.add(world);

scene.add(new THREE.HemisphereLight(0xeaf5ff, 0x596451, 0.5));

const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.02);
keyLight.position.set(-3.2, 6.5, -8.5);
keyLight.target.position.set(0, -2.8, 0);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 32;
keyLight.shadow.camera.left = -9;
keyLight.shadow.camera.right = 9;
keyLight.shadow.camera.top = 9;
keyLight.shadow.camera.bottom = -9;
keyLight.shadow.bias = -0.00025;
keyLight.shadow.normalBias = 0.035;
keyLight.shadow.radius = 7;
keyLight.shadow.blurSamples = 16;
scene.add(keyLight, keyLight.target);

const frontLight = new THREE.RectAreaLight(0xf3f8ff, 0.58, 7, 5);
frontLight.position.set(1.8, 2.6, -6.5);
frontLight.lookAt(0, -2.4, 0);
scene.add(frontLight);

const rimLight = new THREE.DirectionalLight(0xcddfff, 0.13);
rimLight.position.set(5, 4, 3);
scene.add(rimLight);

const clock = new THREE.Clock();
let mixer = null;
let leftFoot = null;
let rightFoot = null;
let contactShadow = null;

const footPositions = {
  left: new THREE.Vector3(),
  right: new THREE.Vector3(),
};
const shadowTarget = new THREE.Vector3();

function makeSoftTexture(innerColor, outerColor) {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 128;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.35, innerColor);
  gradient.addColorStop(1, outerColor);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const shadowTexture = makeSoftTexture('rgba(28, 29, 25, .48)', 'rgba(28, 29, 25, 0)');

function updateGroundEffects(delta) {
  if (!leftFoot || !rightFoot || !contactShadow) return;

  leftFoot.getWorldPosition(footPositions.left);
  rightFoot.getWorldPosition(footPositions.right);

  shadowTarget.set(
    (footPositions.left.x + footPositions.right.x) * 0.5,
    Math.min(footPositions.left.y, footPositions.right.y) - 0.06,
    (footPositions.left.z + footPositions.right.z) * 0.5 - 0.055,
  );
  const smoothing = 1 - Math.exp(-delta * 18);
  contactShadow.position.lerp(shadowTarget, smoothing);
  const footSpread = Math.min(Math.abs(footPositions.left.x - footPositions.right.x), 0.42);
  contactShadow.scale.set(0.58 + footSpread, 0.15 + footSpread * 0.08, 1);
}

const loader = new GLTFLoader();

const modelUrl = new URL('../public/FINAL.glb', import.meta.url).href;
loader.load(modelUrl, (gltf) => {
  const model = gltf.scene;
  world.add(model);
  model.rotation.y = -Math.PI / 2;

  if (gltf.animations.length) {
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    });
    mixer.update(0);
  }

  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        if (!material?.isMeshStandardMaterial) return;
        material.envMapIntensity = 0.42;
        material.roughness = THREE.MathUtils.clamp(material.roughness, 0.38, 0.92);
        material.needsUpdate = true;
      });
    }
    if (/mixamorig.*LeftFoot$/i.test(node.name)) leftFoot = node;
    if (/mixamorig.*RightFoot$/i.test(node.name)) rightFoot = node;
  });

  model.scale.setScalar(1);
  model.position.set(0, -9.5, 0);
  model.updateMatrixWorld(true);

  let head = null;
  model.traverse((node) => {
    if (/mixamorig.*Head$/i.test(node.name)) head = node;
  });
  if (head) {
    const headPosition = new THREE.Vector3();
    head.getWorldPosition(headPosition);
    model.position.x -= headPosition.x;
  }
  model.updateMatrixWorld(true);

  const shadowMaterial = new THREE.SpriteMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.11,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  });
  contactShadow = new THREE.Sprite(shadowMaterial);
  contactShadow.renderOrder = 3;
  contactShadow.scale.set(0.68, 0.18, 1);
  scene.add(contactShadow);
  updateGroundEffects(1 / 60);

}, undefined, (error) => {
  console.error('WEB_FULL_LOOP.glb failed to load', error);
});

function resize() {
  const { width, height } = stage.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const observer = new ResizeObserver(resize);
observer.observe(stage);

function animate() {
  const delta = Math.min(clock.getDelta(), 0.04);
  mixer?.update(delta);
  updateGroundEffects(delta);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
animate();
