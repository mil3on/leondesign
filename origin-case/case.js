const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll('.case-section')];
const progress = document.querySelector('.scroll-progress span');
const topTrack = document.querySelector('.case-track i');
const toggle = document.querySelector('.contents-toggle');
const panel = document.querySelector('.contents-panel');
const activeNumber = document.querySelector('.active-number');
const activeLabel = document.querySelector('.active-label');
const menuLinks = [...document.querySelectorAll('.contents-panel a')];

function setCurrentSection() {
  const marker = window.scrollY + window.innerHeight * 0.36;
  let current = sections[0];
  sections.forEach((section) => {
    if (section.offsetTop <= marker) current = section;
  });
  const index = Math.max(0, sections.indexOf(current));
  activeNumber.textContent = String(index + 1).padStart(2, '0');
  activeLabel.textContent = current?.dataset.label || 'Коротко';
  menuLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`));
}

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  progress.style.width = `${ratio * 100}%`;
  topTrack.style.width = `${ratio * 100}%`;
  toggle.querySelector('i').style.transform = `rotate(${ratio * 360}deg)`;
  setCurrentSection();
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
onScroll();

function closeContents() {
  panel.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

toggle.addEventListener('click', () => {
  const open = panel.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
panel.querySelector('button').addEventListener('click', closeContents);
menuLinks.forEach((link) => link.addEventListener('click', closeContents));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeContents();
});

const modal = document.querySelector('.image-modal');
const modalImage = modal.querySelector('img');
document.querySelectorAll('[data-zoom]').forEach((frame) => {
  const image = frame.querySelector('img');
  const inspect = document.createElement('a');
  inspect.className = 'inspect-link';
  inspect.href = image.currentSrc || image.src;
  inspect.target = '_blank';
  inspect.rel = 'noopener';
  inspect.textContent = 'Рассмотреть';
  inspect.setAttribute('aria-label', `Рассмотреть изображение: ${image.alt}`);
  inspect.addEventListener('click', (event) => event.stopPropagation());
  frame.append(inspect);
  frame.addEventListener('click', () => {
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;
    modal.showModal();
  });
});
modal.querySelector('button').addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

// Keeps short Russian prepositions and conjunctions with the following word
// at every responsive width without hard-coded line breaks.
const noBreakWords = /(^|[\s([{«„“])((?:а|в|во|и|к|ко|о|об|с|со|у|из|от|до|по|за|на|не|ни|но|да|же|ли|бы|для|без|над|под|при|про|как|что|или))\s+(?=[\p{L}\p{N}])/giu;
const typographyRoot = document.querySelector('main');
const textWalker = document.createTreeWalker(typographyRoot, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script, style, code, pre')) return NodeFilter.FILTER_REJECT;
    return /\s/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
  }
});
const textNodes = [];
while (textWalker.nextNode()) textNodes.push(textWalker.currentNode);
textNodes.forEach((node) => {
  node.nodeValue = node.nodeValue.replace(noBreakWords, '$1$2\u00A0');
});

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    const register = () => navigator.serviceWorker.register('../sw.js').catch(() => {});
    if ('requestIdleCallback' in window) window.requestIdleCallback(register, { timeout: 2500 });
    else window.setTimeout(register, 1200);
  }, { once: true });
}
