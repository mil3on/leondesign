import * as THREE from 'https://esm.sh/three@0.180.0';
import { GLTFLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#planet-canvas');
const stage = document.querySelector('.planet-stage');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0.1, 7.6);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const world = new THREE.Group();
world.rotation.set(-0.18, -0.34, 0.06);
scene.add(world);

scene.add(new THREE.HemisphereLight(0xffffff, 0x6e7165, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 5.2);
keyLight.position.set(-4, 5, 6);
keyLight.castShadow = true;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xcfff58, 4.8);
rimLight.position.set(5, -1, 2);
scene.add(rimLight);
const fillLight = new THREE.PointLight(0xd8e3ff, 2.8, 15);
fillLight.position.set(0, -4, 4);
scene.add(fillLight);

function createFallbackPlanet() {
  const geometry = new THREE.IcosahedronGeometry(2.15, 18);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const wave = Math.sin(vertex.x * 3.7) * Math.cos(vertex.y * 4.3) * Math.sin(vertex.z * 3.1);
    vertex.multiplyScalar(1 + wave * 0.018);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x20221d,
    roughness: 0.72,
    metalness: 0.04,
    clearcoat: 0.08,
    clearcoatRoughness: 0.85,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.fallback = true;
  world.add(mesh);

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.62, 0.018, 12, 220),
    new THREE.MeshBasicMaterial({ color: 0x8f9188, transparent: true, opacity: 0.38 })
  );
  orbit.rotation.set(1.18, 0.25, -0.2);
  world.add(orbit);
}

createFallbackPlanet();

const clock = new THREE.Clock();
let mixer = null;
const loader = new GLTFLoader();
const planetModelUrl = new URL('../public/models/planet.glb', import.meta.url).href;
loader.load(planetModelUrl, (gltf) => {
  world.clear();
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 4.3 / Math.max(size.x, size.y, size.z);
  model.position.sub(center.multiplyScalar(scale));
  model.scale.setScalar(scale);
  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  world.add(model);
  if (gltf.animations.length) {
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
  }
}, undefined, () => {
  // The sculpted fallback remains visible until a custom planet.glb is supplied.
});

const pointer = new THREE.Vector2();
const target = new THREE.Vector2(-0.34, -0.18);
stage.addEventListener('pointermove', (event) => {
  const rect = stage.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  target.x = -0.34 + pointer.x * 0.22;
  target.y = -0.18 + pointer.y * 0.14;
});
stage.addEventListener('pointerleave', () => target.set(-0.34, -0.18));

function resize() {
  const { width, height } = stage.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const observer = new ResizeObserver(resize);
observer.observe(stage);

let elapsed = 0;
function animate() {
  const delta = Math.min(clock.getDelta(), 0.04);
  elapsed += delta;
  mixer?.update(delta);
  world.rotation.y += delta * 0.1;
  world.rotation.x += (target.y - world.rotation.x) * 0.035;
  const desiredY = target.x + elapsed * 0.1;
  world.rotation.y += (desiredY - world.rotation.y) * 0.02;
  world.position.y = Math.sin(elapsed * 0.75) * 0.08;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
animate();
