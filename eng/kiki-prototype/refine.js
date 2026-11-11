const originalSheetContent=sheetContent;
sheetContent=function(){return originalSheetContent().replace('Cancel advanced settings','Hide advanced settings')};
tags[0].push('TV series','Action','Epic','Adventure');
tags[1].push('Fantasy','Historical','For the whole family','Romance');
tags[2].push('About friendship','About love','About superheroes','A little scary');
tags[3].push('Lightweight','Inspirational','With an unexpected ending');
const originalMascot=mascot;
mascot=function(cls=''){
  return originalMascot(cls).replace('<div class="eyes"><img class="eye-left"', '<div class="eyes"><span class="eye-slot"><img class="eye-left"')
    .replace('alt=""><img class="eye-right"','alt=""><i class="eye-oval"></i></span><span class="eye-slot"><img class="eye-right"')
    .replace('class="eye-right" src="'+A('029d9.svg')+'" alt=""></div>','class="eye-right" src="'+A('029d9.svg')+'" alt=""><i class="eye-oval"></i></span></div>');
};
bar=function(){return `<img class="ios-status" src="${A('ios-status-bar.png')}" alt=""><div class="homebar"></div>`};
const originalSearch=search;
search=function(){return originalSearch()
  .replace('Search for movies with <span class="orange">Kiki</span>','Search for movies with <span class="orange">Kiki</span>')
  .replace('Describe the plot, mood of the film or details, and Alice will select a film for you<br>by interests','Describe the plot, mood or other details, and Kiki, Alice\'s AI assistant, will select options for you according to your interests')};
ideas=function(){return `<div class="cards"><button class="idea-card" data-action="idea" data-value="Popular foreign films of 2026"><span class="card-title">Popular foreign films of 2026</span><img class="card-art card-art-year" src="${A('card-2026.png')}" alt=""></button><button class="idea-card" data-action="idea" data-value="Robert Pattinson's best roles"><span class="card-title">Best roles<br>Roberta<br>Pattinson</span><img class="card-art card-art-people" src="${A('card-pattinson.png')}" alt=""></button><button class="idea-card" data-action="idea" data-value="Deep dramatic series"><span class="card-title">Deep dramatic series</span><img class="card-art card-art-series" src="${A('card-series.png')}" alt=""></button></div>`};
const originalChat=chat;
chat=function(){return originalChat().replace('class="chat-copy"','class="chat-copy" data-phase="0"')};
let chatPhraseStarted=false,chatPhraseTimer;
startPhrases=function(){
  const box=app.querySelector('.chat-copy');if(!box)return;
  box.dataset.phase=String(phrase);
  box.querySelectorAll('[data-phrase]').forEach((el,i)=>el.className=i===phrase?'current':i<phrase?'past':'future');
  if(chatPhraseStarted)return;
  chatPhraseStarted=true;
  chatPhraseTimer=setInterval(()=>{
    if(page!=='chat'||phrase>=2){clearInterval(chatPhraseTimer);chatPhraseTimer=null;return}
    phrase++;
    box.dataset.phase=String(phrase);
    box.querySelectorAll('[data-phrase]').forEach((el,i)=>el.className=i===phrase?'current':i<phrase?'past':'future');
  },3200);
};
app.addEventListener('click',e=>{
  if(page==='search'&&e.target.closest('[data-action="chat"]')){
    clearInterval(chatPhraseTimer);chatPhraseTimer=null;chatPhraseStarted=false;
  }
},true);
filters[0][1].push('Adventure','Detective','Melodrama','Animation','Horror');
filters[1][1].push('2024','2023','90s','80s');
filters[2][1].push('Warm','Tense','Magical','Calm');
filters[3][1].push('Funny','Inspiring','Touching','Exciting');
filters[4][1].push('For the evening','For company','No subscription');
filters[5][1].push('Original','With subtitles','German','Spanish');
const originalEdit=edit;
edit=function(){return originalEdit().replace('Kinopoisk AI','Movie search with <span class="orange">Kiki</span>')};
const originalLoading=loading;
loading=function(){return originalLoading().replace('<div class="loading-rays"></div>',`<div class="loading-glow" aria-hidden="true"><i class="glow-orange"></i><i class="glow-yellow"></i><i class="glow-white"></i><i class="glow-ray ray-a"></i><i class="glow-ray ray-b"></i><img class="figma-beam beam-one" src="${A('deef9.svg')}" alt=""><img class="figma-beam beam-two" src="${A('cce6b.svg')}" alt=""><img class="figma-beam beam-three" src="${A('26e23.svg')}" alt=""><img class="figma-beam beam-four" src="${A('cafcc.svg')}" alt=""></div>`)};
const originalResult=result;
result=function(){return originalResult()
  .replace('<div class="screen">','<div class="screen result-screen">')
  .replace('<div class="posters">','<div class="poster-aura" aria-hidden="true"><i class="poster-aura-warm"></i><i class="poster-aura-white"></i><i class="poster-aura-rays"></i></div><div class="posters">')
  .replace(/(<span class="rating-badge"><img[^>]*>)([0-9.]+)(<img[^>]*><\/span>)/g,'$1<strong>$2</strong>$3')};
let filmSaved=false,saveTimer;
const originalFilm=film;
film=function(){return originalFilm()
  .replace('<b>8.7</b>　',`<b>8.7</b><img class="film-rating-right" src="${A('17bcb.svg')}" alt="">　`)
  .replace('<div class="film-poster-frame">','<div class="film-poster-stage"><div class="film-poster-glow" aria-hidden="true"><i class="poster-glow-blue"></i><i class="poster-glow-teal"></i><i class="poster-glow-white"></i></div><div class="film-poster-frame">')
  .replace('alt="Inception movie poster"></div><div class="film-details">',`alt="Inception movie poster"><video class="film-trailer" id="filmTrailer" src="${A('inception-trailer.mp4')}" playsinline preload="metadata" aria-label="Trailer for the film Inception" data-action="trailer-toggle"></video><button class="trailer-toggle" data-action="trailer-toggle" aria-label="Stop the trailer" title="Stop the trailer"><img src="${A('trailer-stop.svg')}" alt=""></button><button class="trailer-expand" data-action="trailer-expand" aria-label="Expand trailer" title="Expand trailer"><img src="${A('trailer-expand.svg')}" alt=""></button><button class="trailer-sound" data-action="trailer-sound" aria-label="Mute" title="Mute"><img src="${A('trailer-sound-on.svg')}" alt=""></button></div></div><div class="film-details">`)
  .replace('<button class="iconbtn save" data-action="save" aria-label="Save"></button>',`<button class="iconbtn save ${filmSaved?'phase-active':'phase-default'}" data-action="save" aria-label="Save" aria-pressed="${filmSaved}"><img class="save-icon save-default" src="${A('b2fef.svg')}" alt=""><img class="save-icon save-between" src="${A('7052a.svg')}" alt=""><img class="save-icon save-active" src="${A('74bcb.svg')}" alt=""></button>`)};
filmContent=function(){return activeTab==='why'?`<div class="film-section"><p class="why-intro">Film <b>"The Beginning"</b> perfectly suits your request</p><div class="reason-chips"><span>tense plot <img src="${A('6fd2b.svg')}" alt=""></span><span>4 Oscars <img src="${A('6fd2b.svg')}" alt=""></span><span>star cast <img src="${A('6fd2b.svg')}" alt=""></span></div><div class="feature-images"><img src="${A('feature-leo.png')}" alt="Starring Leonardo DiCaprio"><img src="${A('feature-cast.png')}" alt="Cast"><img src="${A('feature-awards.png')}" alt="Four Oscars"><img src="${A('feature-trailer.png')}" alt="Fantastic thriller 2010"></div><div class="from-kiki"><div class="from-kiki-title"><span>From <em>Kiki</em></span><img src="${A('f1ea1.svg')}" alt=""></div><p>If you like stories where you have to question the reality of what is happening, this film is worth adding to the list.</p><p>But the film requires attention to detail and may seem difficult if you want an easy viewing experience.</p></div></div>`:`<div class="film-section about-content"><div class="about-strip strip-one"><img src="${A('32fa3.png')}" alt="Description of the film"></div><div class="about-strip strip-two"><img src="${A('00674.png')}" alt="Rating and actors"></div><div class="about-strip strip-three"><img src="${A('4fbc1.png')}" alt="Team and reviews"></div><div class="about-strip strip-four"><img src="${A('4b25d.png')}" alt="Additional information"></div></div>`};
const originalStartLoading=startLoading;
startLoading=function(){
  page='loading';render(false);
  [[1600,-4,0,2400],[6500,4,-1,2500]].forEach(([delay,x,y,duration])=>{
    setTimeout(()=>{
      if(page!=='loading')return;
      const m=app.querySelector('#mascot');if(!m)return;
      m.style.setProperty('--oval-x',x+'px');m.style.setProperty('--oval-y',y+'px');m.classList.add('oval-eyes');
      setTimeout(()=>{if(page==='loading')m.classList.remove('oval-eyes')},duration);
    },delay);
  });
};
bindHorizontal=function(){
  app.querySelectorAll('.cards,.tag-scroll').forEach(el=>{
    if(el.dataset.panBound)return;
    el.dataset.panBound='1';
    el.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){el.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
    let down=false,moved=false,startX=0,startScroll=0;
    el.addEventListener('pointerdown',e=>{if(e.button!==0)return;down=true;moved=false;startX=e.clientX;startScroll=el.scrollLeft});
    el.addEventListener('pointermove',e=>{
      if(!down)return;
      const dx=e.clientX-startX;
      if(Math.abs(dx)>7){
        if(!moved){moved=true;el.setPointerCapture(e.pointerId)}
        el.scrollLeft=startScroll-dx;
      }
    });
    const finish=()=>{if(!down)return;down=false;if(moved){el.dataset.dragged='1';setTimeout(()=>delete el.dataset.dragged,120)}};
    el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
  });
};
const originalRender=render;
let trailerTimer,inlineFullscreenFrame=null;
function expandTrailerInline(frame){
  if(page!=='film'||!frame.isConnected)return;
  const button=frame.querySelector('.trailer-expand');
  frame.classList.add('trailer-inline-fullscreen');
  app.append(frame);
  button.setAttribute('aria-label','Collapse trailer');button.title='Collapse trailer';
  inlineFullscreenFrame=frame;
}
function collapseTrailerInline(){
  const frame=inlineFullscreenFrame;if(!frame)return;
  frame.classList.remove('trailer-inline-fullscreen');
  app.querySelector('.film-poster-stage')?.append(frame);
  const button=frame.querySelector('.trailer-expand');
  button.setAttribute('aria-label','Expand trailer');button.title='Expand trailer';
  inlineFullscreenFrame=null;
}
function startTrailer(){
  const video=app.querySelector('#filmTrailer'),frame=video?.closest('.film-poster-frame');
  if(!video||page!=='film')return;
  video.volume=.1;video.muted=false;video.currentTime=0;
  video.play().then(()=>{frame.classList.remove('trailer-stopped');frame.classList.add('trailer-playing')}).catch(()=>{
    video.muted=true;
    const button=frame.querySelector('.trailer-sound');
    button.setAttribute('aria-label','Unmute');button.title='Unmute';button.querySelector('img').src=A('trailer-sound-off.svg');
    video.play().then(()=>{frame.classList.remove('trailer-stopped');frame.classList.add('trailer-playing')}).catch(()=>{});
  });
  video.addEventListener('ended',()=>{
    frame.classList.remove('trailer-playing');frame.classList.add('trailer-stopped');
    const toggle=frame.querySelector('.trailer-toggle');toggle.setAttribute('aria-label','Enable trailer');toggle.title='Enable trailer';toggle.querySelector('img').src=A('trailer-play.svg');
  });
}
render=function(animate=true){
  clearTimeout(trailerTimer);
  inlineFullscreenFrame=null;
  originalRender(animate);
  if(page==='edit'){
    const s=app.querySelector('.sheet');
    if(s&&!s.querySelector('.sheet-inner')){const inner=document.createElement('div');inner.className='sheet-inner';while(s.firstChild)inner.append(s.firstChild);s.append(inner)}
    attachSheet(false);
  }
  if(page==='film')trailerTimer=setTimeout(startTrailer,3000);
};

function updateRating(value){
  const rating=app.querySelector('.rating');if(!rating)return;
  const v=Number(value);
  rating.classList.toggle('low',v<5);rating.classList.toggle('mid',v>=5&&v<=8);rating.classList.toggle('high',v>8);
  const number=rating.querySelector('#ratingValue');if(number)number.textContent=v.toFixed(1);
  const input=rating.querySelector('#rating'),marker=rating.querySelector('.rating-marker');
  if(input&&marker){
    const track=input.getBoundingClientRect(),box=rating.getBoundingClientRect();
    const scale=box.width/rating.offsetWidth||1;
    marker.style.left=((track.left-box.left)/scale+12+(track.width/scale-24)*v/10)+'px';
    marker.style.top=((track.top-box.top+track.height/2)/scale)+'px';
  }
}
function attachSheet(bind=true){
  const s=app.querySelector('.sheet');if(!s)return;
  const actions=s.querySelector('.sheet-inner>.sheet-actions');
  if(actions){
    const persistent=s.querySelector(':scope>.sheet-actions');
    if(persistent){
      persistent.querySelector('.secondary').innerHTML=actions.querySelector('.secondary').innerHTML;
      actions.remove();
    }else s.append(actions);
  }
  const sc=s.querySelector('.sheet-inner>.tag-scroll');if(sc)requestAnimationFrame(()=>{sc.scrollLeft=(sc.scrollWidth-sc.clientWidth)/2});
  const t=s.querySelector('#query');if(t)t.addEventListener('input',()=>{query=t.value;t.scrollTop=t.scrollHeight;lookAt(0,5)});
  const rating=s.querySelector('.rating');
  if(rating&&!rating.querySelector('.rating-marker')){
    const marker=document.createElement('div');marker.className='rating-marker';
    const label=rating.querySelector('.rating-top');
    marker.append(label);
    const thumb=document.createElement('i');thumb.className='rating-thumb';marker.append(thumb);
    rating.append(marker);
  }
  s.querySelectorAll('.rating-top img').forEach(img=>img.classList.add('laurel'));
  updateRating(s.querySelector('#rating')?.value||8);
  s.querySelectorAll('.filter-row .tag-scroll').forEach(row=>row.addEventListener('scroll',()=>row.classList.toggle('is-scrolled',row.scrollLeft>2),{passive:true}));
  if(bind)bindHorizontal();
}
function openMorph(value){
  if(value)query=value;
  const screen=app.querySelector('.screen');const pill=screen?.querySelector('.search-pill');if(!pill)return;
  clearInterval(chatPhraseTimer);chatPhraseTimer=null;
  sheetOrigin='chat';page='edit';advanced=false;screen.classList.add('editing');
  const sheet=document.createElement('div');sheet.className='sheet morph';
  sheet.innerHTML=`<div class="morph-preview"><span>For example, a good movie for the evening</span><img src="${A('27542.svg')}" alt=""></div><div class="sheet-inner">${sheetContent()}</div>`;pill.replaceWith(sheet);screen.scrollTop=0;
  const help=document.createElement('p');help.className='edit-help';help.textContent='You can describe your desires in great detail or find what you want using filters';help.style.opacity='0';screen.append(help);
  requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('open')));
  attachSheet();
}
let sheetOrigin='chat';
function openResultMorph(){
  const screen=app.querySelector('.result-screen'),button=screen?.querySelector('.result-footer button');
  if(!button)return;
  const rect=button.getBoundingClientRect(),parent=screen.getBoundingClientRect(),scale=parent.width/390;
  sheetOrigin='result';page='edit';advanced=false;
  const sheet=document.createElement('div');sheet.className='sheet morph result-morph';
  sheet.style.setProperty('--start-left',(rect.left-parent.left)/scale+'px');
  sheet.style.setProperty('--start-top',(rect.top-parent.top)/scale+'px');
  sheet.style.setProperty('--start-width',rect.width/scale+'px');
  sheet.innerHTML=`<div class="morph-preview"><span>${button.querySelector('span')?.textContent||query}</span><img src="${A('27542.svg')}" alt=""></div><div class="sheet-inner">${sheetContent()}</div>`;
  screen.append(sheet);screen.classList.add('result-editing');screen.scrollTop=0;button.style.visibility='hidden';
  requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('open')));
  attachSheet();
}
function closeMorph(){
  const s=app.querySelector('.sheet.morph');if(!s){page=sheetOrigin;render(false);return}
  s.querySelector('.sheet-inner').style.opacity='0';
  const actions=s.querySelector(':scope>.sheet-actions');if(actions)actions.style.opacity='0';
  s.classList.remove('open','expanded');
  if(sheetOrigin==='result'){
    const screen=app.querySelector('.result-screen');
    setTimeout(()=>{s.remove();screen?.classList.remove('result-editing');const button=screen?.querySelector('.result-footer button');if(button)button.style.visibility='';page='result';advanced=false},920);
  }else{
    app.querySelector('.screen')?.classList.remove('editing');
    setTimeout(()=>{page='chat';advanced=false;render(false)},920);
  }
}
function toggleAdvanced(){
  const s=app.querySelector('.sheet');if(!s||s.dataset.switching)return;
  s.dataset.switching='1';
  const inside=s.querySelector('.sheet-inner');inside.style.transition='opacity .28s ease';inside.style.opacity='0';
  setTimeout(()=>{
    advanced=!advanced;s.classList.toggle('expanded',advanced);
    const help=app.querySelector('.edit-help');if(help)help.textContent=advanced?'':'You can describe your desires in great detail or find what you want using filters';
    inside.innerHTML=sheetContent();attachSheet();
    requestAnimationFrame(()=>{inside.style.opacity='1'});
    setTimeout(()=>delete s.dataset.switching,650);
  },280);
}
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;
  const action=b.dataset.action;
  if(action==='sheet'&&page==='chat'){e.stopImmediatePropagation();openMorph();return}
  if(action==='sheet'&&page==='result'){e.stopImmediatePropagation();openResultMorph();return}
  if(action==='idea'&&page==='chat'){e.stopImmediatePropagation();openMorph(b.dataset.value);return}
  if(action==='advanced'&&page==='edit'){e.stopImmediatePropagation();toggleAdvanced();return}
  if(action==='close'&&page==='edit'){e.stopImmediatePropagation();closeMorph();return}
  if(action==='back'&&page==='edit'){e.stopImmediatePropagation();closeMorph();return}
  if(action==='save'&&page==='film'){
    e.stopImmediatePropagation();clearTimeout(saveTimer);filmSaved=!filmSaved;
    b.classList.remove('phase-default','phase-active');b.classList.add('phase-between');
    saveTimer=setTimeout(()=>{b.classList.remove('phase-between');b.classList.add(filmSaved?'phase-active':'phase-default');b.setAttribute('aria-pressed',String(filmSaved))},220);
    return;
  }
  if(action==='trailer-sound'&&page==='film'){
    e.stopImmediatePropagation();
    const video=app.querySelector('#filmTrailer');if(!video)return;
    video.muted=!video.muted;video.volume=.1;
    b.setAttribute('aria-label',video.muted?'Unmute':'Mute');b.title=video.muted?'Unmute':'Mute';
    b.querySelector('img').src=A(video.muted?'trailer-sound-off.svg':'trailer-sound-on.svg');
    if(video.paused)video.play().catch(()=>{});
    return;
  }
  if(action==='trailer-expand'&&page==='film'){
    e.stopImmediatePropagation();
    if(inlineFullscreenFrame){collapseTrailerInline();return}
    const frame=b.closest('.film-poster-frame'),video=frame?.querySelector('#filmTrailer');if(!video)return;
    video.controls=true;
    if(video.requestFullscreen)video.requestFullscreen().catch(()=>{video.controls=false;expandTrailerInline(frame)});
    else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
    else{video.controls=false;expandTrailerInline(frame)}
    if(video.paused)video.play().catch(()=>{});
    return;
  }
  if(action==='trailer-toggle'&&page==='film'){
    e.stopImmediatePropagation();
    const frame=b.closest('.film-poster-frame'),video=frame?.querySelector('#filmTrailer');if(!video)return;
    const toggle=frame.querySelector('.trailer-toggle');
    if(frame.classList.contains('trailer-playing')){
      video.pause();video.currentTime=0;frame.classList.remove('trailer-playing');frame.classList.add('trailer-stopped');
      toggle.setAttribute('aria-label','Play trailer');toggle.title='Play trailer';toggle.querySelector('img').src=A('trailer-play.svg');
    }else{
      video.currentTime=0;video.play().then(()=>{
        frame.classList.remove('trailer-stopped');frame.classList.add('trailer-playing');
        toggle.setAttribute('aria-label','Stop the trailer');toggle.title='Stop the trailer';toggle.querySelector('img').src=A('trailer-stop.svg');
      }).catch(()=>{});
    }
    return;
  }
},true);
document.addEventListener('fullscreenchange',()=>{
  if(!document.fullscreenElement){
    const video=app.querySelector('#filmTrailer');if(video)video.controls=false;
  }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&inlineFullscreenFrame){e.stopPropagation();collapseTrailerInline()}
});
app.addEventListener('input',e=>{if(e.target.id==='rating')updateRating(e.target.value)},true);

let lookTimer;
function lookAt(x,y){const m=app.querySelector('#mascot');if(!m)return;m.style.setProperty('--look-x',x+'px');m.style.setProperty('--look-y',y+'px');clearTimeout(lookTimer);lookTimer=setTimeout(()=>{m.style.setProperty('--look-x','0px');m.style.setProperty('--look-y','0px')},2200)}
setInterval(()=>{
  const m=app.querySelector('#mascot');if(!m)return;
  if(document.activeElement?.id==='query'){lookAt(0,5);return}
  const views=page==='loading'?[[-5,-4],[4,-5],[0,-2]]:[[-5,0],[5,1],[0,-3],[0,0]];
  const v=views[Math.floor(Math.random()*views.length)];lookAt(v[0],v[1]);
},3000);
setInterval(()=>{const eyes=app.querySelector('#mascot .eyes');if(!eyes)return;eyes.style.setProperty('--blink-y','.12');setTimeout(()=>eyes.style.setProperty('--blink-y','1'),160)},4600);

// After repeated misses, point to the next useful action without blocking touch.
const flowHintTarget = {
  main: '[data-action="search"]',
  search: '.search-promo button',
  chat: '.search-pill',
  edit: '.sheet .primary',
  result: '.poster-wrap:nth-child(2) [data-action="film"]',
  film: '.film-tabs [data-value="why"]'
};
let flowMisses = 0;
let flowHintPage = page;
let flowHintRing = null;
let flowHintElement = null;
function clearFlowHint(){flowHintRing?.remove();flowHintRing=null;flowHintElement=null;flowMisses=0}
function positionFlowHint(){
  if(!flowHintRing||!flowHintElement?.isConnected)return;
  const bounds=flowHintElement.getBoundingClientRect();
  const frame=app.getBoundingClientRect();
  const scale=frame.width/app.offsetWidth||1;
  const size=72;
  flowHintRing.style.left=((bounds.left+bounds.width/2-frame.left)/scale-size/2)+'px';
  flowHintRing.style.top=((bounds.top+bounds.height/2-frame.top)/scale-size/2)+'px';
}
function showFlowHint(){
  flowHintElement=app.querySelector(flowHintTarget[page]);
  if(!flowHintElement)return;
  flowHintRing=app.querySelector('.flow-hint-ring')||document.createElement('span');
  flowHintRing.className='flow-hint-ring';
  flowHintRing.setAttribute('aria-hidden','true');
  app.append(flowHintRing);
  positionFlowHint();
}
document.addEventListener('click',event=>{
  if(!app.contains(event.target))return;
  if(page!==flowHintPage){clearFlowHint();flowHintPage=page}
  const control=event.target.closest('[data-action],button,a,input,select,textarea,[role="button"],[role="link"],[contenteditable="true"]');
  if(control){
    if(control.dataset.action&&control.dataset.action!=='more')clearFlowHint();
    return;
  }
  if(!flowHintTarget[page])return;
  flowMisses++;
  if(flowMisses>=2&&!flowHintRing)showFlowHint();
},true);
app.addEventListener('scroll',()=>{if(flowHintRing)requestAnimationFrame(positionFlowHint)},true);
window.addEventListener('resize',()=>{if(flowHintRing)requestAnimationFrame(positionFlowHint)});
