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
  const planetLayout = innerWidth <= 760
    ? { size: 14.5, headX: 0, headY: 2.5 }
    : innerWidth <= 900
      ? { size: 14, headX: 0, headY: 2.85 }
      : { size: 14, headX: 0, headY: 2.25 };
  model.position.sub(center);
  normalized.scale.setScalar(planetLayout.size / Math.max(size.x, size.y, size.z));
  normalized.updateMatrixWorld(true);
  if (head) {
    const headPosition = new THREE.Vector3();
    head.getWorldPosition(headPosition);
    normalized.position.x += planetLayout.headX - headPosition.x;
    normalized.position.y += planetLayout.headY - headPosition.y;
  } else {
    normalized.position.y = -2.7;
  }
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
  planetLoader.textContent = `Загружаю планету… ${progress}%`;
  window.dispatchEvent(new CustomEvent('portfolio:planet-progress', { detail: { progress } }));
}, (error) => {
  planetLoader.textContent = 'Планета временно недоступна';
  window.dispatchEvent(new CustomEvent('portfolio:planet-error'));
  console.error('Не удалось загрузить планету', error);
});

function resizePlanet() {
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
    label.textContent = `Загружаю 3D… ${progress}%`;
  }, (error) => {
    leonStage.querySelector('.model-loader').textContent = '3D временно недоступен';
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
const casePeek = document.querySelector('#case-peek');
const casePeekClose = document.querySelector('#case-peek-close');
function setCases(open) {
  casePeek.classList.toggle('is-open', open);
  casePeek.setAttribute('aria-hidden', String(!open));
  hotspot.setAttribute('aria-expanded', String(open));
}
hotspot.addEventListener('click', () => {
  setCases(!casePeek.classList.contains('is-open'));
});
casePeekClose.addEventListener('click', () => {
  setCases(false);
  hotspot.focus();
});
document.addEventListener('click', (event) => {
  if (!casePeek.contains(event.target) && !hotspot.contains(event.target)) setCases(false);
});

// About / skills drawer.
const drawer = document.querySelector('#about-drawer');
const backdrop = document.querySelector('#about-backdrop');
const closeButton = document.querySelector('#about-close');
const drawerTriggers = [...document.querySelectorAll('.js-about-open')];
let drawerReturnFocus = null;
function setDrawer(open, trigger, restoreFocus = true) {
  if (open) drawerReturnFocus = trigger || document.activeElement;
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('about-open', open);
  drawerTriggers.forEach((button) => button.setAttribute('aria-expanded', String(open)));
  backdrop.hidden = true;
  if (open) setTimeout(() => closeButton.focus(), 40);
  else if (restoreFocus) drawerReturnFocus?.focus?.();
}
drawerTriggers.forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  setCases(false);
  const nextOpen = !drawer.classList.contains('is-open');
  setDrawer(nextOpen, button, nextOpen);
}));
drawer.addEventListener('click', (event) => event.stopPropagation());
closeButton.addEventListener('click', () => setDrawer(false));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('click', (event) => {
  if (drawer.classList.contains('is-open') && !drawer.contains(event.target) && !event.target.closest('.js-about-open')) setDrawer(false, null, false);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setDrawer(false); setCases(false); } });

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
  if (!cases || !shots || !portfolioPanel) return;
  if (!matchMedia('(max-width:760px)').matches) {
    shots.style.removeProperty('--cases-panel-height');
    return;
  }
  const savedStyle = cases.style.cssText;
  if (cases.hidden) {
    const panelStyle = getComputedStyle(portfolioPanel);
    const width = portfolioPanel.clientWidth - parseFloat(panelStyle.paddingLeft) - parseFloat(panelStyle.paddingRight);
    Object.assign(cases.style, {display:'block', position:'absolute', visibility:'hidden', pointerEvents:'none', width:width + 'px'});
  }
  const height = cases.getBoundingClientRect().height;
  cases.style.cssText = savedStyle;
  if (height) shots.style.setProperty('--cases-panel-height', height + 'px');
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
  requestAnimationFrame(syncPortfolioClearance);
};
workTabs.forEach((tab) => tab.addEventListener('click', () => activateWorkTab(tab.dataset.workTab)));
if (window.location.hash === '#shots') {
  activateWorkTab('shots');
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
shotSlider.setAttribute('aria-label', 'UI концепты');
const shotThumbnails = shotCards.map((card, index) => {
  const source = card.querySelector('.shot-card__media > img');
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', source.alt || ('Дизайн ' + (index + 1)));
  const img = document.createElement('img');
  img.src = source.src; img.alt = ''; img.draggable = false;
  button.append(img);
  button.addEventListener('click', () => openShot(card));
  shotSlider.append(button);
  return button;
});
shotLightbox?.querySelector('.shot-lightbox__frame')?.append(shotSlider);
const changeShot = (direction) => {
  if (shotCards.length) openShot(shotCards[(lightboxCardIndex + direction + shotCards.length) % shotCards.length]);
};

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
  shotLightbox.style.setProperty('--shot-ratio', String(screen.ratio));
  shotLightboxPagination.querySelectorAll('button').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === lightboxScreenIndex);
    dot.setAttribute('aria-pressed', String(i === lightboxScreenIndex));
  });
};

const openShot = (card) => {
  if (!shotLightbox || !shotLightboxImage) return;
  lightboxCardIndex = shotCards.indexOf(card);
  shotThumbnails.forEach((button, index) => {
    button.classList.toggle('is-active', index === lightboxCardIndex);
    button.setAttribute('aria-pressed', String(index === lightboxCardIndex));
  });
  requestAnimationFrame(() => {
    const active = shotThumbnails[lightboxCardIndex];
    shotSlider.scrollTo({left:active.offsetLeft - (shotSlider.clientWidth - active.offsetWidth) / 2, behavior:'smooth'});
  });
  lightboxGesture = null;
  const images = [...card.querySelectorAll('[data-scenario-screen]')];
  if (!images.length) images.push(card.querySelector('.shot-card__media > img'));
  lightboxScreens = images.map((img) => ({src:img.src, alt:img.alt, ratio:(img.naturalWidth || 780) / (img.naturalHeight || 1688)}));
  const dots = shotLightboxPagination.querySelector('.shot-scenario__pagination');
  dots.replaceChildren();
  shotLightboxPagination.hidden = images.length < 2;
  if (images.length > 1) images.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Экран ${index + 1} из ${images.length}`);
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
    if (mobileShots.matches && !event.target.closest('button,a')) openShot(card);
  });
  const updateCardFocus = () => {
    if (mobileShots.matches) card.setAttribute('tabindex', '0');
    else card.removeAttribute('tabindex');
  };
  updateCardFocus();
  mobileShots.addEventListener('change', updateCardFocus);
  card.addEventListener('keydown', (event) => {
    if (mobileShots.matches && event.target === card && ['Enter',' '].includes(event.key)) {
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
