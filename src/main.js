import * as THREE from './vendor/three.module.min.js?v=1';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js?v=2';
import { RoomEnvironment } from './vendor/environments/RoomEnvironment.js?v=2';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gltfLoader = new GLTFLoader();

function setupRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: true, powerPreference: 'high-performance' });
  // Большой canvas планеты раньше рисовал почти 5 млн пикселей каждый кадр.
  // На широких экранах незаметно снижаем внутреннее разрешение, сохраняя CSS-размер.
  const pixelRatioLimit = innerWidth >= 1600 ? .75 : innerWidth < 700 ? 1 : .9;
  renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatioLimit));
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
const planetLoader = planetStage.querySelector('.planet-loader');
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
planetKey.shadow.mapSize.set(512, 512);
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
let updatePlanetLayout = () => {};
let trackedHand = null;
const planetWorld = new THREE.Group();
planetScene.add(planetWorld);

// Orbit the view around the complete scene; never rotate animated model nodes.
const planetViewRig = new THREE.Group();
planetViewRig.position.set(0, -1.1, 0);
planetScene.add(planetViewRig);
planetViewRig.attach(planetCamera);
const planetParallaxMedia = matchMedia('(min-width:761px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
const planetParallaxTarget = new THREE.Vector2();
const resetPlanetParallax = () => planetParallaxTarget.set(0, 0);
window.addEventListener('pointermove', (event) => {
  if (!planetParallaxMedia.matches || event.pointerType !== 'mouse' || document.querySelector('dialog[open]')) {
    resetPlanetParallax();
    return;
  }
  planetParallaxTarget.set(
    THREE.MathUtils.clamp(event.clientY / innerHeight * 2 - 1, -1, 1) * .025,
    THREE.MathUtils.clamp(event.clientX / innerWidth * 2 - 1, -1, 1) * -.045,
  );
}, { passive: true });
document.documentElement.addEventListener('pointerleave', resetPlanetParallax);
window.addEventListener('blur', resetPlanetParallax);
window.addEventListener('scroll', resetPlanetParallax, { passive: true });
planetParallaxMedia.addEventListener('change', resetPlanetParallax);

gltfLoader.load(new URL('../public/FINAL.glb?v=3', import.meta.url).href, (gltf) => {
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
  characterRoot?.scale.setScalar(2.5);
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
  normalized.updateMatrixWorld(true);
  const referenceHead = head ? normalized.worldToLocal(head.getWorldPosition(new THREE.Vector3())) : null;
  updatePlanetLayout = () => {
    const layout = innerWidth <= 760
      ? { size:14.5, headY:2.5 }
      : innerWidth <= 900 ? { size:14, headY:2.85 } : { size:14, headY:2.25 };
    const scale = layout.size / Math.max(size.x, size.y, size.z);
    normalized.scale.setScalar(scale);
    if (referenceHead) normalized.position.set(-referenceHead.x * scale, layout.headY - referenceHead.y * scale, 0);
    else normalized.position.set(0, -2.7, 0);
    normalized.updateMatrixWorld(true);
  };
  updatePlanetLayout();
  planetRenderer.render(planetScene, planetCamera);
  // Ждём не только загрузки GLB, но и фактической отрисовки первого кадра.
  // Второй animation frame гарантирует, что canvas успел попасть в композицию
  // страницы до того, как глобальный предзагрузчик начнёт исчезать.
  requestAnimationFrame(() => {
    planetRenderer.render(planetScene, planetCamera);
    planetStage.classList.add('is-loaded');
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('portfolio:planet-ready'));
    });
  });
}, (event) => {
  if (!event.total) return;
  const progress = Math.min(99, Math.max(0, Math.round(event.loaded / event.total * 100)));
  planetLoader.textContent = document.documentElement.lang === 'en' ? `Loading the planet… ${progress}%` : `Загружаю планету… ${progress}%`;
  window.dispatchEvent(new CustomEvent('portfolio:planet-progress', { detail: { progress } }));
}, (error) => {
  planetLoader.textContent = document.documentElement.lang === 'en' ? 'The planet is temporarily unavailable' : 'Планета временно недоступна';
  window.dispatchEvent(new CustomEvent('portfolio:planet-error'));
  console.error('Не удалось загрузить планету', error);
});

function resizePlanet() {
  updatePlanetLayout();
  const { width, height } = planetStage.getBoundingClientRect();
  if (!width || !height) return;
  planetRenderer.setSize(width, height, false);
  planetCamera.aspect = width / height;
  planetCamera.updateProjectionMatrix();
  planetRenderer.render(planetScene, planetCamera);
}
const planetResize = new ResizeObserver(resizePlanet);
planetResize.observe(planetStage);
resizePlanet();

const hotspot = document.querySelector('#bag-hotspot');
const trackedPosition = new THREE.Vector3();
function placeHotspot() {
  if (!trackedHand) return;
  trackedHand.getWorldPosition(trackedPosition);
  trackedPosition.project(planetCamera);
  const stageBox = planetStage.getBoundingClientRect();
  const parentBox = hotspot.offsetParent.getBoundingClientRect();
  hotspot.style.left = `${stageBox.left - parentBox.left + (trackedPosition.x * .5 + .5) * stageBox.width -30}px`;
  hotspot.style.top = `${stageBox.top - parentBox.top + (-trackedPosition.y * .5 + .5) * stageBox.height -20}px`;

}

// Footer character exported from Official Leon.blend.
const leonCanvas = document.querySelector('#leon-canvas');
const leonStage = document.querySelector('.leon-stage');
const leonScene = new THREE.Scene();
const leonCamera = new THREE.PerspectiveCamera(28, 1, .01, 100);
const leonRenderer = setupRenderer(leonCanvas);
leonRenderer.setClearColor(0xffffff, 0);
leonRenderer.toneMappingExposure = .82;
const leonPmrem = new THREE.PMREMGenerator(leonRenderer);
leonScene.environment = leonPmrem.fromScene(new RoomEnvironment(), .03).texture;
leonScene.environmentIntensity = .42;
leonPmrem.dispose();
leonScene.add(new THREE.HemisphereLight(0xf7fbff, 0x68655f, .68));
const leonKey = new THREE.DirectionalLight(0xfff2e1, 1.05);
leonKey.position.set(-4, 5, 6);
leonKey.castShadow = true;
leonKey.shadow.mapSize.set(512, 512);
leonScene.add(leonKey);
const leonFill = new THREE.RectAreaLight(0xeef6ff, .72, 6, 8);
leonFill.position.set(3, 2, 5);
leonScene.add(leonFill);
const leonRim = new THREE.DirectionalLight(0xcbdcff, .24);
leonRim.position.set(2, 5, -4);
leonScene.add(leonRim);

let leonMixer = null;
let leonLoadStarted = false;
function loadLeonModel() {
  if (leonLoadStarted) return;
  leonLoadStarted = true;
  gltfLoader.load(new URL('../public/models/official-leon-edited.glb?v=2', import.meta.url).href, (gltf) => {
    const model = gltf.scene;
    const normalized = new THREE.Group();
    normalized.add(model);
    leonScene.add(normalized);
    softenMaterials(model, .38);
    model.rotation.y = -.33;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const targetHeight = 4.35;
    const scale = targetHeight / Math.max(size.y, .001);
    normalized.scale.setScalar(scale);
    normalized.position.y = -.12;
    leonCamera.position.set(.1, .15, 9.65);
    leonCamera.lookAt(0, .12, 0);
    if (gltf.animations.length) {
      leonMixer = new THREE.AnimationMixer(model);
      const action = leonMixer.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.fadeIn(.35).play();
    }
    leonStage.classList.add('is-loaded');
    leonRenderer.render(leonScene, leonCamera);
  }, (event) => {
    if (!event.total) return;
    const label = leonStage.querySelector('.model-loader');
    const progress = Math.min(99, Math.max(0, Math.round(event.loaded / event.total * 100)));
    label.textContent = document.documentElement.lang === 'en' ? `Loading 3D… ${progress}%` : `Загружаю 3D… ${progress}%`;
  }, (error) => {
    leonStage.querySelector('.model-loader').textContent = document.documentElement.lang === 'en' ? '3D is temporarily unavailable' : '3D временно недоступен';
    console.error('Не удалось загрузить Official Leon', error);
  });
}

function resizeLeon() {
  const { width, height } = leonStage.getBoundingClientRect();
  if (!width || !height) return;
  leonRenderer.setSize(width, height, false);
  leonCamera.aspect = width / height;
  leonCamera.updateProjectionMatrix();
  leonRenderer.render(leonScene, leonCamera);
}
const leonResize = new ResizeObserver(resizeLeon);
leonResize.observe(leonStage);
resizeLeon();

let leonVisible = false;
new IntersectionObserver(([entry]) => {
  leonVisible = entry.isIntersecting;
  if (entry.isIntersecting) loadLeonModel();
}, { rootMargin: '250px 0px' }).observe(leonStage);

let planetVisible = true;
new IntersectionObserver(([entry]) => {
  planetVisible = entry.isIntersecting;
}, { rootMargin: '160px 0px' }).observe(planetStage);

const clock = new THREE.Clock();
function animate() {
  const delta = Math.min(clock.getDelta(), .04);
  const pageVisible = document.visibilityState === 'visible';
  if (pageVisible && planetVisible) {
    planetMixer?.update(delta);
    planetViewRig.rotation.x = THREE.MathUtils.damp(planetViewRig.rotation.x, -planetParallaxTarget.x, 5, delta);
    planetViewRig.rotation.y = THREE.MathUtils.damp(planetViewRig.rotation.y, -planetParallaxTarget.y, 5, delta);
    planetViewRig.updateMatrixWorld(true);
    placeHotspot();
    planetRenderer.render(planetScene, planetCamera);
  }
  if (pageVisible && leonVisible) {
    leonMixer?.update(delta);
    leonRenderer.render(leonScene, leonCamera);
  }
  requestAnimationFrame(animate);
}
animate();

// Cases hotspot.
hotspot.addEventListener('click', () => {
  activateWorkTab('cases');
  requestAnimationFrame(() => {
    const target = document.querySelector('#portfolio');
    if (!target) return;
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top,
      behavior: reduceMotion ? 'instant' : 'smooth',
    });
  });
});

// About / skills drawer.
const drawer = document.querySelector('#about-drawer');
const backdrop = document.querySelector('#about-backdrop');
const closeButton = document.querySelector('#about-close');
const drawerTriggers = [...document.querySelectorAll('.js-about-open')];
const drawerSurface = document.createElement('div');
drawerSurface.className = 'drawer-surface';
[...drawer.children].filter(el => el !== closeButton).forEach(el => drawerSurface.append(el));
drawer.append(drawerSurface);
let drawerReturnFocus = null;
function measureDrawerHeight() {
  const about = drawer.querySelector('[data-panel="about"]');
  const copy = about.cloneNode(true);
  copy.classList.add('is-active');
  Object.assign(copy.style, {position:'absolute', visibility:'hidden', display:'block', height:'auto', maxHeight:'none', flex:'none', width:(drawer.clientWidth - 28) + 'px', overflow:'visible'});
  drawerSurface.append(copy);
  const tabs = drawer.querySelector('.drawer-tabs');
  const tabsStyle = getComputedStyle(tabs);
  const height = 30 + drawer.querySelector('.drawer-top').offsetHeight + tabs.offsetHeight + parseFloat(tabsStyle.marginBottom || 0) + copy.offsetHeight;
  copy.remove();
  drawer.style.setProperty('--drawer-height', Math.ceil(height) + 'px');
}
function syncDrawerViewport() {
  const mobile = matchMedia('(max-width:760px)').matches;
  const open = drawer.classList.contains('is-open');
  backdrop.hidden = !mobile || !open;
  drawer.setAttribute('aria-modal', String(mobile && open));
  measureDrawerHeight();
  if (!mobile) {
    const parent = drawer.offsetParent.getBoundingClientRect();
    const edge = document.querySelector('.portfolio-panel').getBoundingClientRect().right;
    const controls = document.querySelector('.sound-controls').getBoundingClientRect();
    drawer.style.right = Math.max(0, parent.right - edge) + 'px';
    drawer.style.top = (controls.bottom - parent.top - drawer.offsetHeight) + 'px';
  } else {
    drawer.style.removeProperty('right');
    drawer.style.removeProperty('top');
  }
}
// Keep longer case descriptions clear of their illustrations at every width.
const caseCopyObserver = new ResizeObserver(entries => {
  for (const {target} of entries) {
    const card = target.closest('.work-card');
    card.style.setProperty('--card-copy-bottom', (target.offsetTop + target.offsetHeight + 20) + 'px');
  }
});
document.querySelectorAll('.work-card > p').forEach(p => caseCopyObserver.observe(p));
window.addEventListener('resize', syncDrawerViewport);
document.fonts.ready.then(syncDrawerViewport);

function setDrawer(open, trigger, restoreFocus = true) {
  if (open) drawerReturnFocus = trigger || document.activeElement;
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('about-open', open);
  drawerTriggers.forEach((button) => button.setAttribute('aria-expanded', String(open)));
  syncDrawerViewport();
  if (open) {
    closeButton.focus({preventScroll:true});
    if (!matchMedia('(max-width:760px)').matches) {
      const parent = drawer.offsetParent.getBoundingClientRect();
      const center = window.scrollY + parent.top + parseFloat(drawer.style.top) + drawer.offsetHeight / 2;
      window.scrollTo({top:Math.max(0, center - window.innerHeight / 2), behavior:reduceMotion ? 'auto' : 'smooth'});
    }
  }
  else if (restoreFocus) drawerReturnFocus?.focus?.();
}
drawerTriggers.forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  const nextOpen = !drawer.classList.contains('is-open');
  setDrawer(nextOpen, button, nextOpen);
}));
drawer.addEventListener('click', (event) => event.stopPropagation());
closeButton.addEventListener('click', () => setDrawer(false));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('click', (event) => {
  if (drawer.classList.contains('is-open') && !drawer.contains(event.target) && !event.target.closest('.js-about-open')) setDrawer(false, null, false);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setDrawer(false); } });

document.querySelectorAll('[data-tab]').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach((item) => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === tab.dataset.tab));
}));

// Portfolio cases / shots tabs.
const worldSection = document.querySelector('.world');
const portfolioPanel = document.querySelector('.portfolio-panel');
const contactSection = document.querySelector('.contact-section');
const syncPortfolioClearance = () => {
  if (!worldSection || !portfolioPanel || !contactSection) return;
  const contactTop = contactSection.getBoundingClientRect().top;
  const characterTop = leonStage?.getBoundingClientRect().top ?? contactTop;
  const characterLift = Math.max(0, contactTop - characterTop);
  if (matchMedia('(max-width:760px)').matches) {
    const bottom = portfolioPanel.offsetTop + portfolioPanel.offsetHeight;
    const baseline = parseFloat(getComputedStyle(worldSection).getPropertyValue('--world-min-height')) || 0;
    const gap = Math.max(baseline - bottom, 40 + characterLift);
    worldSection.style.minHeight = Math.ceil(bottom + gap / 2) + 'px';
  } else {
    worldSection.style.removeProperty('min-height');
  }
  const requiredHeight = Math.ceil(portfolioPanel.offsetTop + portfolioPanel.offsetHeight + 40 + characterLift);
  worldSection.style.setProperty('--portfolio-clearance-height', `${requiredHeight}px`);
};
const portfolioResize = new ResizeObserver(syncPortfolioClearance);
if (portfolioPanel) portfolioResize.observe(portfolioPanel);
window.addEventListener('resize', syncPortfolioClearance);
window.addEventListener('load', syncPortfolioClearance, { once: true });

const workTabs = [...document.querySelectorAll('[data-work-tab]')];
const workPanels = [...document.querySelectorAll('[data-work-panel]')];
const syncMobileConceptHeight = () => {
  const cases = document.querySelector('[data-work-panel="cases"]');
  const shots = document.querySelector('[data-work-panel="shots"]');
  const concepts = document.querySelector('[data-work-panel="concepts"]');
  if (!cases || !shots || !concepts || !portfolioPanel) return;
  const savedStyle = cases.style.cssText;
  const wasHidden = cases.hidden;
  if (wasHidden) {
    const panelStyle = getComputedStyle(portfolioPanel);
    const width = portfolioPanel.clientWidth - parseFloat(panelStyle.paddingLeft) - parseFloat(panelStyle.paddingRight);
    cases.hidden = false;
    Object.assign(cases.style, {display:'block', position:'absolute', visibility:'hidden', pointerEvents:'none', width:width + 'px'});
  }
  const measuredHeight = cases.getBoundingClientRect().height;
  cases.style.cssText = savedStyle;
  cases.hidden = wasHidden;
  const columns = matchMedia('(max-width:640px)').matches ? 1 : matchMedia('(max-width:900px)').matches ? 2 : 3;
  const count = cases.querySelectorAll('.work-card').length;
  const rows = Math.ceil(count / columns);
  const theoreticalHeight = rows * 492 + Math.max(0, rows - 1) * (columns === 1 ? 12 : 16);
  const height = Math.max(measuredHeight, theoreticalHeight);
  if (height) [shots,concepts].forEach(panel => panel.style.setProperty('--cases-panel-height', height + 'px'));
};
window.addEventListener('resize', syncMobileConceptHeight, {passive:true});
window.addEventListener('load', syncMobileConceptHeight, {once:true});
document.fonts.ready.then(syncMobileConceptHeight);
requestAnimationFrame(syncMobileConceptHeight);
const activateWorkTab = (selected) => {
  workTabs.forEach((item) => {
    const active = item.dataset.workTab === selected;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });
  workPanels.forEach((panel) => {
    panel.hidden = panel.dataset.workPanel !== selected;
  });
  syncMobileConceptHeight();
  requestAnimationFrame(syncPortfolioClearance);
};
workTabs.forEach((tab) => tab.addEventListener('click', () => activateWorkTab(tab.dataset.workTab)));
if (window.location.hash === '#shots' || window.location.hash === '#concepts') {
  activateWorkTab(window.location.hash === '#concepts' ? 'concepts' : 'shots');
  requestAnimationFrame(() => portfolioPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}
requestAnimationFrame(syncPortfolioClearance);

// Gentle pointer parallax for portfolio-card artwork.
const canTiltPortfolioArt = !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (canTiltPortfolioArt) {
  document.querySelectorAll('.work-card').forEach((card) => {
    if (!card.querySelector('.card-art--portfolio')) return;
    let animationFrame = 0;
    let nextX = 0;
    let nextY = 0;

    const renderTilt = () => {
      card.style.setProperty('--art-tilt-x', `${(-nextY * 2.6).toFixed(2)}deg`);
      card.style.setProperty('--art-tilt-y', `${(nextX * 3.2).toFixed(2)}deg`);
      card.style.setProperty('--art-shift-x', `${(nextX * 5).toFixed(2)}px`);
      card.style.setProperty('--art-shift-y', `${(nextY * 4).toFixed(2)}px`);
      card.style.setProperty('--art-scale', '1.012');
      animationFrame = 0;
    };

    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      nextX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      nextY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      card.classList.add('is-parallax-active');
      if (!animationFrame) animationFrame = requestAnimationFrame(renderTilt);
    });

    card.addEventListener('pointerleave', () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      card.classList.remove('is-parallax-active');
      card.style.setProperty('--art-tilt-x', '0deg');
      card.style.setProperty('--art-tilt-y', '0deg');
      card.style.setProperty('--art-shift-x', '0px');
      card.style.setProperty('--art-shift-y', '0px');
      card.style.setProperty('--art-scale', '1');
    });
  });
  document.querySelectorAll('.concept-card').forEach((card) => {
    if (!card.querySelector('.concept-illustration')) return;
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      card.classList.add('is-parallax-active');
      card.style.setProperty('--concept-shift-x', `${(x * 7).toFixed(2)}px`);
      card.style.setProperty('--concept-shift-y', `${(y * 5).toFixed(2)}px`);
      card.style.setProperty('--concept-scale', '1.012');
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-parallax-active');
      card.style.removeProperty('--concept-shift-x');
      card.style.removeProperty('--concept-shift-y');
      card.style.removeProperty('--concept-scale');
    });
  });
}

const shotLightbox = document.querySelector('#shot-lightbox');
const shotLightboxImage = shotLightbox?.querySelector('img');
const shotLightboxMedia = shotLightbox?.querySelector('.shot-lightbox__media');
const shotLightboxPagination = shotLightbox?.querySelector('.shot-lightbox__pagination');
const mobileShots = window.matchMedia('(max-width:720px), (hover:none)');
let lightboxScreens = [];
let lightboxScreenIndex = 0;
const shotCards = [...document.querySelectorAll('.shot-card')];
let lightboxCardIndex = 0;
let lightboxGesture = null;
const shotSlider = document.createElement('nav');
shotSlider.className = 'shot-lightbox__slider';
shotSlider.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Flow screens' : 'Экраны флоу');
let shotThumbnails = [];
shotLightbox?.querySelector('.shot-lightbox__frame')?.append(shotSlider);
const changeShot = (direction) => {
  if (shotCards.length) openShot(shotCards[(lightboxCardIndex + direction + shotCards.length) % shotCards.length]);
};

for (const direction of [-1, 1]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'shot-lightbox__concept-arrow ' + (direction < 0 ? 'is-prev' : 'is-next');
  button.setAttribute('aria-label', direction < 0 ? (document.documentElement.lang === 'en' ? 'Previous concept' : 'Предыдущий концепт') : (document.documentElement.lang === 'en' ? 'Next concept' : 'Следующий концепт'));
  button.innerHTML = '<svg width="12" height="22" viewBox="0 0 12 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 1L9.58579 9.58579C10.3668 10.3668 10.3668 11.6332 9.58579 12.4142L1 21" stroke-width="2" stroke-linecap="round" stroke="white"/></svg>';
  button.addEventListener('click', () => changeShot(direction));
  shotLightbox?.querySelector('.shot-lightbox__frame')?.append(button);
}

shotLightboxImage?.addEventListener('load', () => {
  if (!shotLightboxImage.naturalWidth || !shotLightboxImage.naturalHeight) return;
  const ratio = shotLightboxImage.naturalWidth / shotLightboxImage.naturalHeight;
  shotLightbox.style.setProperty('--shot-ratio', String(ratio));
  const screen = lightboxScreens[lightboxScreenIndex];
  if (screen && screen.src === shotLightboxImage.src) screen.ratio = ratio;
});

const setLightboxScreen = (index) => {
  if (!shotLightboxImage || !lightboxScreens.length) return;
  lightboxScreenIndex = Math.max(0, Math.min(lightboxScreens.length - 1, index));
  const screen = lightboxScreens[lightboxScreenIndex];
  shotLightboxImage.src = screen.src;
  shotLightboxImage.alt = screen.alt;
  shotThumbnails.forEach((button, i) => {
    button.classList.toggle('is-active', i === lightboxScreenIndex);
    button.setAttribute('aria-pressed', String(i === lightboxScreenIndex));
  });
  requestAnimationFrame(() => {
    const active = shotThumbnails[lightboxScreenIndex];
    if (active) shotSlider.scrollTo({left:active.offsetLeft - (shotSlider.clientWidth - active.offsetWidth) / 2, behavior:reduceMotion ? 'auto' : 'smooth'});
  });
  shotLightbox.style.setProperty('--shot-ratio', String(screen.ratio));
  shotLightboxPagination.querySelectorAll('button').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === lightboxScreenIndex);
    dot.setAttribute('aria-pressed', String(i === lightboxScreenIndex));
  });
};

const openShot = (card) => {
  if (!shotLightbox || !shotLightboxImage) return;
  lightboxCardIndex = shotCards.indexOf(card);
  lightboxGesture = null;
  const images = [...card.querySelectorAll('[data-scenario-screen]')];
  if (!images.length) images.push(card.querySelector('.shot-card__media > img'));
  lightboxScreens = images.map((img) => ({src:img.src, alt:img.alt, ratio:(img.naturalWidth || 780) / (img.naturalHeight || 1688)}));
  shotSlider.replaceChildren();
  shotThumbnails = lightboxScreens.map((screen, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', document.documentElement.lang === 'en' ? `Screen ${index + 1} of ${lightboxScreens.length}` : 'Экран ' + (index + 1) + ' из ' + lightboxScreens.length);
    const image = document.createElement('img');
    image.src = screen.src;
    image.alt = '';
    image.draggable = false;
    button.append(image);
    button.addEventListener('click', () => setLightboxScreen(index));
    shotSlider.append(button);
    return button;
  });
  const dots = shotLightboxPagination.querySelector('.shot-scenario__pagination');
  dots.replaceChildren();
  shotLightboxPagination.hidden = images.length < 2;
  if (images.length > 1) images.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', document.documentElement.lang === 'en' ? `Screen ${index + 1} of ${images.length}` : `Экран ${index + 1} из ${images.length}`);
    dot.addEventListener('click', () => setLightboxScreen(index));
    dots.append(dot);
  });
  setLightboxScreen(Math.max(0, images.findIndex((img) => img.classList.contains('is-active'))));
  if (!shotLightbox.open) shotLightbox.showModal();
};

shotLightboxMedia?.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
  lightboxGesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
  shotLightboxMedia.setPointerCapture(event.pointerId);
});
shotLightboxMedia?.addEventListener('pointerup', (event) => {
  if (!lightboxGesture || lightboxGesture.id !== event.pointerId) return;
  const dx = event.clientX - lightboxGesture.x;
  const dy = event.clientY - lightboxGesture.y;
  lightboxGesture = null;
  if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    changeShot(dx < 0 ? 1 : -1);
  } else if (Math.hypot(dx, dy) < 12 && lightboxScreens.length > 1) {
    const bounds = shotLightboxMedia.getBoundingClientRect();
    const direction = event.clientX < bounds.left + bounds.width / 2 ? -1 : 1;
    setLightboxScreen((lightboxScreenIndex + direction + lightboxScreens.length) % lightboxScreens.length);
  }
});
shotLightboxMedia?.addEventListener('pointercancel', () => { lightboxGesture = null; });
shotLightbox?.addEventListener('close', () => { lightboxGesture = null; });
shotLightbox?.addEventListener('keydown', (event) => {
  if (lightboxScreens.length < 2 || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  setLightboxScreen(lightboxScreenIndex + (event.key === 'ArrowRight' ? 1 : -1));
});

const setScenarioScreen = (card, requestedIndex) => {
  const screens = [...card.querySelectorAll('[data-scenario-screen]')];
  const dots = [...card.querySelectorAll('[data-scenario-dot]')];
  if (!screens.length) return;

  const index = Math.max(0, Math.min(screens.length - 1, requestedIndex));
  screens.forEach((screen, screenIndex) => {
    const isActive = screenIndex === index;
    screen.classList.toggle('is-active', isActive);
    screen.setAttribute('aria-hidden', String(!isActive));
  });
  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });

  const action = card.querySelector('[data-shot-src]');
  if (action) {
    action.dataset.shotSrc = screens[index].getAttribute('src') || '';
    action.dataset.shotAlt = screens[index].alt || '';
  }
};

document.querySelectorAll('[data-shot-scenario]').forEach((card) => {
  const chooseByPointer = (event) => {
    if (event.target.closest('button')) return;
    const bounds = card.getBoundingClientRect();
    const progress = Math.max(0, Math.min(.999, (event.clientX - bounds.left) / bounds.width));
    setScenarioScreen(card, Math.floor(progress * 3));
  };

  card.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') chooseByPointer(event);
  });
  card.querySelectorAll('[data-scenario-dot]').forEach((dot) => {
    dot.addEventListener('click', () => setScenarioScreen(card, Number(dot.dataset.scenarioDot)));
  });
  setScenarioScreen(card, 0);
});

document.querySelectorAll('.shot-card').forEach((card) => {
  card.querySelector('[data-shot-src]')?.addEventListener('click', () => openShot(card));
  card.addEventListener('click', (event) => {
    if (!event.target.closest('button,a')) openShot(card);
  });
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (event) => {
    if (event.target === card && ['Enter',' '].includes(event.key)) {
      event.preventDefault();
      openShot(card);
    }
  });
});
shotLightbox?.querySelector('.shot-lightbox__close')?.addEventListener('click', () => shotLightbox.close());
shotLightbox?.addEventListener('click', (event) => {
  if (event.target === shotLightbox) shotLightbox.close();
});

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .08 });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
if (reduceMotion) document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    const register = () => navigator.serviceWorker.register('./sw.js').catch(() => {});
    if ('requestIdleCallback' in window) window.requestIdleCallback(register, { timeout: 2500 });
    else window.setTimeout(register, 1200);
  }, { once: true });
}
