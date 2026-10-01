import * as THREE from './vendor/three.module.min.js?v=1';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js?v=2';
import { RoomEnvironment } from './vendor/environments/RoomEnvironment.js?v=2';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gltfLoader = new GLTFLoader();

function setupRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

function softenMaterials(root, intensity = .45) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material) => {
      if (!material?.isMeshStandardMaterial) return;
      material.envMapIntensity = intensity;
      material.roughness = THREE.MathUtils.clamp(material.roughness ?? .6, .34, .94);
      material.needsUpdate = true;
    });
  });
}

// Main animated planet, preserved from the previous site build.
const planetCanvas = document.querySelector('#planet-canvas');
const planetStage = document.querySelector('.planet-stage');
const planetScene = new THREE.Scene();
const planetCamera = new THREE.PerspectiveCamera(31, 1, .1, 220);
planetCamera.position.set(0, .4, -15.5);
planetCamera.lookAt(0, -1.1, 0);
const planetRenderer = setupRenderer(planetCanvas);
planetRenderer.setClearColor(0xffffff, 0);
planetRenderer.toneMappingExposure = .96;

const pmrem = new THREE.PMREMGenerator(planetRenderer);
planetScene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
planetScene.environmentIntensity = .34;
pmrem.dispose();
planetScene.add(new THREE.HemisphereLight(0xeaf5ff, 0x596451, .5));
const planetKey = new THREE.DirectionalLight(0xfff3df, 1.05);
planetKey.position.set(-3.2, 6.5, -8.5);
planetKey.target.position.set(0, -2.8, 0);
planetKey.castShadow = true;
planetKey.shadow.mapSize.set(2048, 2048);
planetKey.shadow.camera.near = .1;
planetKey.shadow.camera.far = 32;
planetKey.shadow.camera.left = -9;
planetKey.shadow.camera.right = 9;
planetKey.shadow.camera.top = 9;
planetKey.shadow.camera.bottom = -9;
planetKey.shadow.bias = -.00025;
planetKey.shadow.normalBias = .035;
planetKey.shadow.radius = 7;
planetScene.add(planetKey, planetKey.target);
const planetFill = new THREE.RectAreaLight(0xf4f8ff, .56, 8, 6);
planetFill.position.set(1.8, 2.6, -6.5);
planetFill.lookAt(0, -2.4, 0);
planetScene.add(planetFill);

let planetMixer = null;
let trackedHand = null;
const planetWorld = new THREE.Group();
planetScene.add(planetWorld);

gltfLoader.load(new URL('../public/FINAL.glb', import.meta.url).href, (gltf) => {
  const model = gltf.scene;
  const normalized = new THREE.Group();
  normalized.add(model);
  planetWorld.add(normalized);
  model.rotation.y = -Math.PI / 2;
  softenMaterials(model, .42);
  let head = null;
  let characterRoot = null;
  model.traverse((node) => {
    if (/mixamorig.*RightHand$/i.test(node.name)) trackedHand = node;
    if (/mixamorig.*Head$/i.test(node.name)) head = node;
    if (!node.isBone && /^Armature/i.test(node.name)) characterRoot = node;
  });
  characterRoot?.scale.setScalar(1.5);
  if (gltf.animations.length) {
    planetMixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => planetMixer.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity).play());
    planetMixer.update(0);
  }
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  normalized.scale.setScalar(18 / Math.max(size.x, size.y, size.z));
  normalized.updateMatrixWorld(true);
  if (head) {
    const headPosition = new THREE.Vector3();
    head.getWorldPosition(headPosition);
    normalized.position.x -= headPosition.x;
    normalized.position.y += 1.2 - headPosition.y;
  } else {
    normalized.position.y = -2.7;
  }
}, undefined, (error) => console.error('Не удалось загрузить планету', error));

const planetResize = new ResizeObserver(() => {
  const { width, height } = planetStage.getBoundingClientRect();
  planetRenderer.setSize(width, height, false);
  planetCamera.aspect = width / height;
  planetCamera.updateProjectionMatrix();
});
planetResize.observe(planetStage);

const hotspot = document.querySelector('#bag-hotspot');
const trackedPosition = new THREE.Vector3();
function placeHotspot() {
  if (!trackedHand || innerWidth < 641) return;
  trackedHand.getWorldPosition(trackedPosition);
  trackedPosition.project(planetCamera);
  const box = planetStage.getBoundingClientRect();
  hotspot.style.left = `${box.left + (trackedPosition.x * .5 + .5) * box.width}px`;
  hotspot.style.top = `${box.top + (-trackedPosition.y * .5 + .5) * box.height}px`;
}

// Footer character exported from Official Leon.blend.
const leonCanvas = document.querySelector('#leon-canvas');
const leonStage = document.querySelector('.leon-stage');
const leonScene = new THREE.Scene();
const leonCamera = new THREE.PerspectiveCamera(28, 1, .01, 100);
const leonRenderer = setupRenderer(leonCanvas);
leonRenderer.setClearColor(0xffffff, 0);
leonRenderer.toneMappingExposure = 1.03;
const leonPmrem = new THREE.PMREMGenerator(leonRenderer);
leonScene.environment = leonPmrem.fromScene(new RoomEnvironment(), .03).texture;
leonPmrem.dispose();
leonScene.add(new THREE.HemisphereLight(0xf7fbff, 0x68655f, 1.25));
const leonKey = new THREE.DirectionalLight(0xfff2e1, 2.35);
leonKey.position.set(-4, 5, 6);
leonKey.castShadow = true;
leonKey.shadow.mapSize.set(1024, 1024);
leonScene.add(leonKey);
const leonFill = new THREE.RectAreaLight(0xeef6ff, 2.2, 5, 7);
leonFill.position.set(3, 2, 5);
leonScene.add(leonFill);
const leonRim = new THREE.DirectionalLight(0xcbdcff, .65);
leonRim.position.set(2, 5, -4);
leonScene.add(leonRim);

let leonMixer = null;
gltfLoader.load(new URL('../public/models/official-leon.glb', import.meta.url).href, (gltf) => {
  const model = gltf.scene;
  leonScene.add(model);
  softenMaterials(model, .7);
  model.rotation.y = -.33;
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= box.min.y;
  model.position.z -= center.z;
  model.updateMatrixWorld(true);
  const targetHeight = 4.7;
  const scale = targetHeight / Math.max(size.y, .001);
  model.scale.setScalar(scale);
  model.position.y = -2.35;
  leonCamera.position.set(.1, .15, 8.9);
  leonCamera.lookAt(0, -.05, 0);
  if (gltf.animations.length) {
    leonMixer = new THREE.AnimationMixer(model);
    const action = leonMixer.clipAction(gltf.animations[0]);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.fadeIn(.35).play();
  }
  leonStage.classList.add('is-loaded');
}, (event) => {
  if (!event.total) return;
  const label = leonStage.querySelector('.model-loader');
  label.textContent = `Загружаю 3D… ${Math.round(event.loaded / event.total * 100)}%`;
}, (error) => {
  leonStage.querySelector('.model-loader').textContent = '3D временно недоступен';
  console.error('Не удалось загрузить Official Leon', error);
});

const leonResize = new ResizeObserver(() => {
  const { width, height } = leonStage.getBoundingClientRect();
  leonRenderer.setSize(width, height, false);
  leonCamera.aspect = width / height;
  leonCamera.updateProjectionMatrix();
});
leonResize.observe(leonStage);

let leonVisible = false;
new IntersectionObserver(([entry]) => { leonVisible = entry.isIntersecting; }, { rootMargin: '200px' }).observe(leonStage);

const clock = new THREE.Clock();
function animate() {
  const delta = Math.min(clock.getDelta(), .04);
  planetMixer?.update(delta);
  placeHotspot();
  planetRenderer.render(planetScene, planetCamera);
  if (leonVisible) {
    leonMixer?.update(delta);
    leonRenderer.render(leonScene, leonCamera);
  }
  requestAnimationFrame(animate);
}
animate();

// Cases hotspot.
const casePeek = document.querySelector('#case-peek');
function setCases(open) {
  casePeek.classList.toggle('is-open', open);
  casePeek.setAttribute('aria-hidden', String(!open));
  hotspot.setAttribute('aria-expanded', String(open));
}
hotspot.addEventListener('click', () => {
  const isTouchLayout = matchMedia('(hover: none)').matches;
  setCases(isTouchLayout ? !casePeek.classList.contains('is-open') : true);
});
hotspot.addEventListener('mouseenter', () => setCases(true));
casePeek.addEventListener('mouseleave', () => setCases(false));
document.addEventListener('click', (event) => {
  if (!casePeek.contains(event.target) && !hotspot.contains(event.target)) setCases(false);
});

// About / skills drawer.
const drawer = document.querySelector('#about-drawer');
const backdrop = document.querySelector('#about-backdrop');
const closeButton = document.querySelector('#about-close');
let drawerReturnFocus = null;
function setDrawer(open, trigger) {
  if (open) drawerReturnFocus = trigger || document.activeElement;
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  backdrop.hidden = !open;
  document.body.classList.toggle('drawer-open', open);
  if (open) setTimeout(() => closeButton.focus(), 40);
  else drawerReturnFocus?.focus?.();
}
document.querySelectorAll('.js-about-open').forEach((button) => button.addEventListener('click', () => setDrawer(true, button)));
closeButton.addEventListener('click', () => setDrawer(false));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setDrawer(false); setCases(false); } });

document.querySelectorAll('[data-tab]').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach((item) => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === tab.dataset.tab));
}));

// Procedural, very soft wind bed: starts only after direct user interaction.
const soundButton = document.querySelector('#sound-toggle');
let audioContext = null;
let audioSource = null;
let audioGain = null;
function startAmbience() {
  audioContext ||= new AudioContext();
  const length = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    previous = previous * .985 + (Math.random() * 2 - 1) * .015;
    data[i] = previous;
  }
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = buffer;
  audioSource.loop = true;
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 740;
  audioGain = audioContext.createGain();
  audioGain.gain.value = 0;
  audioSource.connect(filter).connect(audioGain).connect(audioContext.destination);
  audioSource.start();
}
soundButton.addEventListener('click', async () => {
  if (!audioContext) startAmbience();
  await audioContext.resume();
  const enabled = soundButton.getAttribute('aria-pressed') !== 'true';
  soundButton.setAttribute('aria-pressed', String(enabled));
  audioGain.gain.cancelScheduledValues(audioContext.currentTime);
  audioGain.gain.linearRampToValueAtTime(enabled ? .045 : 0, audioContext.currentTime + .45);
});

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .08 });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
if (reduceMotion) document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
