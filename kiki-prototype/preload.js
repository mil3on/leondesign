// Prepare only the next flow screen, including CSS masks, backgrounds and fonts.
(() => {
  const next = {main:'search', search:'chat', chat:'edit', edit:'loading', loading:'result', result:'film'};
  const factories = {main:()=>main(), search:()=>search(), chat:()=>chat(), edit:()=>edit(), loading:()=>loading(), result:()=>result(), film:()=>film()};
  const decoded = new Map();
  let stage = null, timer = 0, generation = 0, lastKey = '';
  function decode(url) {
    if (!decoded.has(url)) {
      const image = new Image();
      image.src = url;
      const ready = image.decode().catch(() => { decoded.delete(url); });
      decoded.set(url, {image, ready});
      // Keep a bounded decoded-image cache; the browser retains its HTTP cache.
      if (decoded.size > 80) decoded.delete(decoded.keys().next().value);
      return ready;
    }
    return decoded.get(url).ready;
  }
  async function prepare() {
    const target = next[page];
    const key = page + ':' + query + ':' + [...selected].join('|');
    if (key === lastKey) return;
    lastKey = key;
    const token = ++generation;
    stage?.remove(); stage = null;
    if (!target) return;
    const host = document.createElement('div');
    host.inert = true;
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;width:390px;height:845px;overflow:hidden;pointer-events:none;contain:layout paint;';
    host.innerHTML = factories[target]();
    // Avoid duplicate IDs interfering with the live prototype's event handlers.
    host.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    host.querySelectorAll('video,audio,iframe').forEach(el => el.remove());
    document.body.append(host); stage = host;
    const urls = new Set();
    const fonts = new Set();
    host.querySelectorAll('img').forEach(img => { img.loading='eager'; if(img.src) urls.add(img.src); });
    for (const el of host.querySelectorAll('*')) {
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(el, pseudo);
        for (const value of [style.backgroundImage, style.maskImage, style.webkitMaskImage, style.content]) {
          for (const match of (value || '').matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(new URL(match[1], location.href).href);
        }
        if (!pseudo && style.font) fonts.add(style.font);
      }
    }
    const queue = [...urls];
    await Promise.all([
      ...Array.from({length:3}, async () => { while(queue.length && token === generation) await decode(queue.shift()); }),
      ...[...fonts].map(font => document.fonts.load(font).catch(()=>{})),
    ]);
    if (token !== generation) return;
    // Resolve layout after assets arrive, without running screen timers or handlers.
    host.getBoundingClientRect();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if(token === generation) { host.remove(); stage=null; }
    }));
  }
  function schedule() { clearTimeout(timer); timer=setTimeout(prepare,150); }
  const renderNow = render;
  let transitionId = 0;
  const transitionStyle = document.createElement('style');
  transitionStyle.textContent = '#app > .screen{animation:none!important} #app .result-screen .poster{animation:none!important} .kiki-transition-cover{position:absolute;inset:0;z-index:1000;overflow:hidden;background:#000001;pointer-events:auto} .kiki-transition-cover > .screen{animation:none!important}';
  document.head.append(transitionStyle);
  render = function(...args) {
    const id = ++transitionId;
    const previous = app.querySelector('.screen')?.cloneNode(true);
    previous?.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    if (previous) previous.removeAttribute('id');
    ++generation; stage?.remove(); stage=null; lastKey='';
    const result = renderNow.apply(this,args);
    const images = [...app.querySelectorAll('img')];
    if (previous && images.some(img=>!img.complete || !img.naturalWidth)) {
      const cover = document.createElement('div');
      cover.className = 'kiki-transition-cover';
      cover.setAttribute('aria-hidden','true');
      cover.append(previous);
      // Block accidental clicks through the retained frame while the new one decodes.
      cover.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();},true);
      app.append(cover);
      let timeout;
      const ready = Promise.all(images.map(img=>img.decode().catch(()=>{})));
      Promise.race([ready,new Promise(resolve=>{timeout=setTimeout(resolve,8000);})]).then(()=>{
        clearTimeout(timeout);
        requestAnimationFrame(()=>{
          if(id===transitionId) cover.remove();
        });
      });
    }
    schedule();
    return result;
  };
  // Morph transitions update the DOM directly rather than calling render().
  new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  app.addEventListener('input',schedule,{passive:true});
  schedule();
})();
