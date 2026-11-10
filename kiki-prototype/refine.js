const originalSheetContent=sheetContent;
sheetContent=function(){return originalSheetContent().replace('Отменить дополнительные настройки','Скрыть дополнительные настройки')};
tags[0].push('Сериал','Боевик','Эпичный','Приключения');
tags[1].push('Фантастика','Исторический','Для всей семьи','Романтика');
tags[2].push('Про дружбу','Про любовь','Про супергероев','Немного страшно');
tags[3].push('Лёгкий','Вдохновляющий','С неожиданным финалом');
const originalMascot=mascot;
mascot=function(cls=''){
  return originalMascot(cls).replace('<div class="eyes"><img class="eye-left"', '<div class="eyes"><span class="eye-slot"><img class="eye-left"')
    .replace('alt=""><img class="eye-right"','alt=""><i class="eye-oval"></i></span><span class="eye-slot"><img class="eye-right"')
    .replace('class="eye-right" src="'+A('029d9.svg')+'" alt=""></div>','class="eye-right" src="'+A('029d9.svg')+'" alt=""><i class="eye-oval"></i></span></div>');
};
bar=function(){return `<img class="ios-status" src="${A('ios-status-bar.png')}" alt=""><div class="homebar"></div>`};
const originalSearch=search;
search=function(){return originalSearch()
  .replace('Поиск кино с <span class="orange">Кики</span>','Поиск кино с <span class="orange">Кики</span>')
  .replace('Опишите сюжет, настроение фильма или детали, а Алиса подберет вам фильм<br>по интересам','Опишите сюжет, настроение или другие детали, а Кики, помощник Алисы AI, подберет вам варианты по интересам')};
ideas=function(){return `<div class="cards"><button class="idea-card" data-action="idea" data-value="Популярные зарубежные фильмы 2026 года"><span class="card-title">Популярные зарубежные фильмы 2026 года</span><img class="card-art card-art-year" src="${A('card-2026.png')}" alt=""></button><button class="idea-card" data-action="idea" data-value="Лучшие роли Роберта Паттинсона"><span class="card-title">Лучшие роли<br>Роберта<br>Паттинсона</span><img class="card-art card-art-people" src="${A('card-pattinson.png')}" alt=""></button><button class="idea-card" data-action="idea" data-value="Глубокий драматичный сериал"><span class="card-title">Глубокий драматичный сериал</span><img class="card-art card-art-series" src="${A('card-series.png')}" alt=""></button></div>`};
const originalChat=chat;
chat=function(){return originalChat().replace('class="chat-copy"','class="chat-copy" data-phase="0"')};
startPhrases=function(){
  phrase=0;
  const box=app.querySelector('.chat-copy');if(!box)return;
  box.dataset.phase='0';
  const iv=setInterval(()=>{
    if(page!=='chat'){clearInterval(iv);return}
    if(phrase>=2){clearInterval(iv);return}
    phrase++;
    box.dataset.phase=String(phrase);
    box.querySelectorAll('[data-phrase]').forEach((el,i)=>el.className=i===phrase?'current':i<phrase?'past':'future');
  },3200);
};
filters[0][1].push('Приключения','Детектив','Мелодрама','Анимация','Ужасы');
filters[1][1].push('2024','2023','90-е','80-е');
filters[2][1].push('Тёплая','Напряжённая','Волшебная','Спокойная');
filters[3][1].push('Смешной','Вдохновляющий','Трогательный','Захватывающий');
filters[4][1].push('На вечер','Для компании','Без подписки');
filters[5][1].push('Оригинал','С субтитрами','Немецкий','Испанский');
const originalEdit=edit;
edit=function(){return originalEdit().replace('Кинопоиск AI','Поиск кино с <span class="orange">Кики</span>')};
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
  .replace('alt="Постер фильма Начало"></div><div class="film-details">',`alt="Постер фильма Начало"><video class="film-trailer" id="filmTrailer" src="${A('inception-trailer.mp4')}" playsinline preload="metadata" aria-label="Трейлер фильма Начало"></video><button class="trailer-toggle" data-action="trailer-toggle" aria-label="Остановить трейлер" title="Остановить трейлер"><img src="${A('trailer-stop.svg')}" alt=""></button><button class="trailer-sound" data-action="trailer-sound" aria-label="Выключить звук" title="Выключить звук"><img src="${A('trailer-sound-on.svg')}" alt=""></button></div></div><div class="film-details">`)
  .replace('<button class="iconbtn save" data-action="save" aria-label="Сохранить"></button>',`<button class="iconbtn save ${filmSaved?'phase-active':'phase-default'}" data-action="save" aria-label="Сохранить" aria-pressed="${filmSaved}"><img class="save-icon save-default" src="${A('b2fef.svg')}" alt=""><img class="save-icon save-between" src="${A('7052a.svg')}" alt=""><img class="save-icon save-active" src="${A('74bcb.svg')}" alt=""></button>`)};
filmContent=function(){return activeTab==='why'?`<div class="film-section"><p class="why-intro">Фильм <b>«Начало»</b> отлично подходит под ваш запрос</p><div class="reason-chips"><span>напряжённый сюжет <img src="${A('6fd2b.svg')}" alt=""></span><span>4 премии «Оскар» <img src="${A('6fd2b.svg')}" alt=""></span><span>звёздный актёрский состав <img src="${A('6fd2b.svg')}" alt=""></span></div><div class="feature-images"><img src="${A('feature-leo.png')}" alt="Леонардо Ди Каприо в главной роли"><img src="${A('feature-cast.png')}" alt="Актёрский состав"><img src="${A('feature-awards.png')}" alt="Четыре премии Оскар"><img src="${A('feature-trailer.png')}" alt="Фантастический триллер 2010 года"></div><div class="from-kiki"><div class="from-kiki-title"><span>От <em>Кики</em></span><img src="${A('f1ea1.svg')}" alt=""></div><p>Если любите истории, в которых приходится сомневаться в реальности происходящего, этот фильм стоит добавить в список.</p><p>Но фильм требует внимания к деталям и может показаться сложным, если хочется лёгкого просмотра.</p></div></div>`:`<div class="film-section about-content"><div class="about-strip strip-one"><img src="${A('32fa3.png')}" alt="Описание фильма"></div><div class="about-strip strip-two"><img src="${A('00674.png')}" alt="Рейтинг и актёры"></div><div class="about-strip strip-three"><img src="${A('4fbc1.png')}" alt="Команда и рецензии"></div><div class="about-strip strip-four"><img src="${A('4b25d.png')}" alt="Дополнительная информация"></div></div>`};
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
let trailerTimer;
function startTrailer(){
  const video=app.querySelector('#filmTrailer'),frame=video?.closest('.film-poster-frame');
  if(!video||page!=='film')return;
  video.volume=.1;video.muted=false;video.currentTime=0;
  video.play().then(()=>{frame.classList.remove('trailer-stopped');frame.classList.add('trailer-playing')}).catch(()=>{
    video.muted=true;
    const button=frame.querySelector('.trailer-sound');
    button.setAttribute('aria-label','Включить звук');button.title='Включить звук';button.querySelector('img').src=A('trailer-sound-off.svg');
    video.play().then(()=>{frame.classList.remove('trailer-stopped');frame.classList.add('trailer-playing')}).catch(()=>{});
  });
  video.addEventListener('ended',()=>{
    frame.classList.remove('trailer-playing');frame.classList.add('trailer-stopped');
    const toggle=frame.querySelector('.trailer-toggle');toggle.setAttribute('aria-label','Включить трейлер');toggle.title='Включить трейлер';toggle.querySelector('img').src=A('trailer-play.svg');
  });
}
render=function(animate=true){
  clearTimeout(trailerTimer);
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
  sheetOrigin='chat';page='edit';advanced=false;screen.classList.add('editing');
  const sheet=document.createElement('div');sheet.className='sheet morph';
  sheet.innerHTML=`<div class="morph-preview"><span>Например, добрый фильм на вечер</span><img src="${A('27542.svg')}" alt=""></div><div class="sheet-inner">${sheetContent()}</div>`;pill.replaceWith(sheet);screen.scrollTop=0;
  const help=document.createElement('p');help.className='edit-help';help.textContent='Можно описать желания очень подробно или найти желаемое по фильтрам';help.style.opacity='0';screen.append(help);
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
    const help=app.querySelector('.edit-help');if(help)help.textContent=advanced?'':'Можно описать желания очень подробно или найти желаемое по фильтрам';
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
    b.setAttribute('aria-label',video.muted?'Включить звук':'Выключить звук');b.title=video.muted?'Включить звук':'Выключить звук';
    b.querySelector('img').src=A(video.muted?'trailer-sound-off.svg':'trailer-sound-on.svg');
    if(video.paused)video.play().catch(()=>{});
    return;
  }
  if(action==='trailer-toggle'&&page==='film'){
    e.stopImmediatePropagation();
    const frame=b.closest('.film-poster-frame'),video=frame?.querySelector('#filmTrailer');if(!video)return;
    if(frame.classList.contains('trailer-playing')){
      video.pause();video.currentTime=0;frame.classList.remove('trailer-playing');frame.classList.add('trailer-stopped');
      b.setAttribute('aria-label','Включить трейлер');b.title='Включить трейлер';b.querySelector('img').src=A('trailer-play.svg');
    }else{
      video.currentTime=0;video.play().then(()=>{
        frame.classList.remove('trailer-stopped');frame.classList.add('trailer-playing');
        b.setAttribute('aria-label','Остановить трейлер');b.title='Остановить трейлер';b.querySelector('img').src=A('trailer-stop.svg');
      }).catch(()=>{});
    }
  }
},true);
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
