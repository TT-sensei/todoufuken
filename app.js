const DATA_URL = './data/prefectures.json';
const FEATURE_ADDITIONS_URL = './data/feature-additions.json';
const GEO_URL = './data/japan-prefectures.geojson';
const COMPONENTS_URL = 'https://tt-sensei.github.io/edu-components/index.js';
const SOUNDS_URL = 'https://tt-sensei.github.io/sounds-recipe-/sounds.js';
const NAVI_BASE = 'https://tt-sensei.github.io/navi-character-/assets/web';
const BADGE_BASE = 'https://tt-sensei.github.io/edu-assets/assets/web/badges';

const NAVI = {
  correct: [
    `${NAVI_BASE}/characters/tsuki/fullbody/correct.webp`,
    `${NAVI_BASE}/characters/sora/fullbody/correct.webp`,
    `${NAVI_BASE}/characters/saku/fullbody/correct.webp`,
    `${NAVI_BASE}/characters/riku/fullbody/correct.webp`,
    `${NAVI_BASE}/characters/kai/fullbody/correct.webp`,
    `${NAVI_BASE}/characters/nami/fullbody/correct.webp`
  ],
  retry: [
    `${NAVI_BASE}/characters/nami/fullbody/retry.webp`,
    `${NAVI_BASE}/characters/saku/fullbody/retry.webp`,
    `${NAVI_BASE}/characters/sora/fullbody/retry.webp`
  ],
  hint: [
    `${NAVI_BASE}/characters/kai/fullbody/hint.webp`,
    `${NAVI_BASE}/characters/kai/fullbody/pointing.webp`,
    `${NAVI_BASE}/characters/nami/fullbody/hint.webp`
  ]
};

const BADGES = [
  {id:'first',name:'はじめての正解',condition:'1問正解',image:`${BADGE_BASE}/common/first-step/badge.webp`},
  {id:'correct3',name:'はじめの一歩',condition:'合計3問正解',image:`${BADGE_BASE}/common/growth/badge.webp`},
  {id:'correct10',name:'10問チャレンジャー',condition:'合計10問正解',image:`${BADGE_BASE}/common/challenger/badge.webp`},
  {id:'correct30',name:'こつこつ学習',condition:'合計30問正解',image:`${BADGE_BASE}/common/steady-progress/badge.webp`},
  {id:'map5',name:'地図のたまご',condition:'地図を5県達成',image:`${BADGE_BASE}/social/map-reader/badge.webp`},
  {id:'capital5',name:'まち名人のたまご',condition:'県庁所在地を5県達成',image:`${BADGE_BASE}/social/location-thinking/badge.webp`},
  {id:'feature5',name:'特色はっけん',condition:'特色を5県達成',image:`${BADGE_BASE}/social/find-features/badge.webp`},
  {id:'allModes',name:'3モード体験',condition:'3つのモードで1県ずつ達成',image:`${BADGE_BASE}/common/discovery/badge.webp`},
  {id:'master1',name:'はじめてのMASTER',condition:'1県をMASTER',image:`${BADGE_BASE}/common/new-skill/badge.webp`},
  {id:'master3',name:'3県マスター',condition:'3県をMASTER',image:`${BADGE_BASE}/common/power-up/badge.webp`},
  {id:'master5',name:'5県マスター',condition:'5県をMASTER',image:`${BADGE_BASE}/common/knowledge/badge.webp`},
  {id:'master10',name:'10県マスター',condition:'10県をMASTER',image:`${BADGE_BASE}/social/local-explorer/badge.webp`},
  {id:'master20',name:'20県マスター',condition:'20県をMASTER',image:`${BADGE_BASE}/social/social-discovery/badge.webp`},
  {id:'region',name:'地方コンプリート',condition:'どこか1地方を完成',image:`${BADGE_BASE}/social/spatial-pattern/badge.webp`},
  {id:'east',name:'東日本コンプリート',condition:'東日本を完成',image:`${BADGE_BASE}/social/map-reader/badge.webp`},
  {id:'west',name:'西日本コンプリート',condition:'西日本を完成',image:`${BADGE_BASE}/social/perspective/badge.webp`},
  {id:'all',name:'47都道府県コンプリート',condition:'47県をMASTER',image:`${BADGE_BASE}/common/champion/badge.webp`},
  {id:'map',name:'地図パズル達人',condition:'47県の場所を達成',image:`${BADGE_BASE}/social/map-reader/badge.webp`},
  {id:'capital',name:'県庁所在地達人',condition:'47県の所在地を達成',image:`${BADGE_BASE}/social/location-thinking/badge.webp`},
  {id:'feature',name:'特色クイズ達人',condition:'47県の特色を達成',image:`${BADGE_BASE}/social/find-features/badge.webp`}
];

const MODE_META = {
  map:{title:'地図パズル',description:'都道府県の形と位置を、地図をタップして確かめます。',kicker:'地図をタップ'},
  capital:{title:'県庁所在地クイズ',description:'都道府県と県庁所在地を、4つの選択肢から結び付けます。',kicker:'4つから選ぼう'},
  feature:{title:'地域の特色クイズ',description:'自然・文化・産業についての基本的な特色から県名を考えます。',kicker:'特色から考えよう'}
};

const REGIONS = ['北海道・東北','関東','中部','近畿','中国・四国','九州・沖縄'];
const MAP_BASE_VIEW = Object.freeze({x:0,y:0,w:720,h:540});
const defaultState = () => ({version:1,sound:true,correctAnswers:0,progress:{},badges:[]});
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const random = (list) => list[Math.floor(Math.random()*list.length)];
const shuffle = (list) => {
  const copy=[...list];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
};

let prefectures=[], geoData=null, byCode=new Map();
let StorageManager=null, QuestionPool=null, BadgeManager=null, soundList=[];
let storage=null, badgeManager=null, state=defaultState();
let selectedMode='map',selectedScope='全国',selectedRegion=REGIONS[0],selectedCount='10';
let queue=[],queueIndex=0,currentQuestion=null,attempts=0,locked=false,firstTryCorrect=0,newMasters=[];
let toastTimer=null,lastConfig=null,audioContext=null;
let quizMapView={...MAP_BASE_VIEW};

class LocalStorageAdapter {
  constructor(namespace){this.prefix=`edu:${namespace}:`;this.memory=new Map()}
  save(key,value){
    const raw=JSON.stringify(value);this.memory.set(key,raw);
    try{localStorage.setItem(this.prefix+key,raw)}catch{} return true;
  }
  load(key,fallback=null){
    let raw=null;try{raw=localStorage.getItem(this.prefix+key)}catch{} raw??=this.memory.get(key)??null;
    if(raw===null)return fallback;try{return JSON.parse(raw)}catch{return fallback}
  }
}
class LocalBadgeManager {
  constructor(options){this.badges=new Map(options.badges.map(b=>[b.id,b]));this.awarded=new Set(options.storage.load('badges-local',[]));this.storage=options.storage}
  award(id){if(this.awarded.has(id))return false;this.awarded.add(id);this.storage.save('badges-local',[...this.awarded]);showBadgeToast(this.badges.get(id));return true}
  has(id){return this.awarded.has(id)} getAwardedCount(){return this.awarded.size}
}

async function loadSharedAssets(){
  try{
    const components=await import(COMPONENTS_URL);
    ({StorageManager,QuestionPool,BadgeManager}=components);
  }catch(error){console.info('Shared components unavailable; using resilient local fallback.',error)}
  try{({soundList}=await import(SOUNDS_URL))}catch(error){console.info('Sound recipes unavailable; app continues silently.',error)}
}

async function init(){
  try{
    const [dataResponse,featureResponse,geoResponse]=await Promise.all([fetch(DATA_URL),fetch(FEATURE_ADDITIONS_URL),fetch(GEO_URL),loadSharedAssets()]);
    if(!dataResponse.ok||!featureResponse.ok||!geoResponse.ok)throw new Error('学習データを読み込めませんでした。');
    const data=await dataResponse.json(),featureAdditions=await featureResponse.json();geoData=await geoResponse.json();
    const additionsByCode=new Map(featureAdditions.prefectures.map(pref=>[pref.code,pref.features]));
    prefectures=data.prefectures.map(pref=>({...pref,features:[...pref.features,...(additionsByCode.get(pref.code)||[])]}));byCode=new Map(prefectures.map(p=>[p.code,p]));
    storage=StorageManager?new StorageManager('todoufuken-master'):new LocalStorageAdapter('todoufuken-master');
    state=normalizeState(storage.load('state',defaultState()));
    badgeManager=BadgeManager?new BadgeManager({storage,storageKey:'badges',badges:BADGES}):new LocalBadgeManager({storage,badges:BADGES});
    bindEvents();renderRegionButtons();renderBadges();renderHome();showScreen('homeScreen');
    $('#app').setAttribute('aria-busy','false');
  }catch(error){
    console.error(error);$('#loadingScreen').innerHTML=`<h1>読み込みに失敗しました</h1><p>通信を確かめて、ページをもう一度開いてください。</p>`;
  }
}

function normalizeState(saved){
  const next={...defaultState(),...(saved&&typeof saved==='object'?saved:{})};
  next.progress={};
  for(const pref of prefectures){
    const old=saved?.progress?.[pref.code]||{};
    next.progress[pref.code]={map:Boolean(old.map),capital:Boolean(old.capital),feature:Boolean(old.feature)};
  }
  next.correctAnswers=Number.isFinite(Number(next.correctAnswers))?Number(next.correctAnswers):0;
  next.sound=next.sound!==false;
  return next;
}
function saveState(){storage.save('state',state)}
function learnedCount(code){return Object.values(state.progress[code]||{}).filter(Boolean).length}
function isMaster(code){return learnedCount(code)===3}
function masterCount(filter=()=>true){return prefectures.filter(p=>filter(p)&&isMaster(p.code)).length}
function modeCount(mode,filter=()=>true){return prefectures.filter(p=>filter(p)&&state.progress[p.code]?.[mode]).length}

function bindEvents(){
  $$('.mode-card').forEach(button=>button.addEventListener('click',()=>openSetup(button.dataset.mode)));
  $$('.scope-grid .select-button').forEach(button=>button.addEventListener('click',()=>selectScope(button.dataset.scope)));
  $$('.count-grid .select-button').forEach(button=>button.addEventListener('click',()=>selectCount(button.dataset.count)));
  $('#startButton').addEventListener('click',startChallenge);
  $('#homeButton').addEventListener('click',goHome);
  $('#resultHomeButton').addEventListener('click',goHome);
  $('#retryButton').addEventListener('click',()=>{if(lastConfig){selectedMode=lastConfig.mode;selectedScope=lastConfig.scope;selectedRegion=lastConfig.region;selectedCount=lastConfig.count;startChallenge()}});
  $('#soundButton').addEventListener('click',toggleSound);
  $('#feedbackNavi').addEventListener('error',event=>event.currentTarget.hidden=true);
  document.addEventListener('edu:badge',event=>showBadgeToast(event.detail?.badge));
}

function showScreen(id){
  $$('.screen').forEach(screen=>{const active=screen.id===id;screen.hidden=!active;screen.classList.toggle('is-active',active)});
  $('#homeButton').hidden=id==='homeScreen'||id==='loadingScreen';
  $('#main').focus({preventScroll:true});
}
function goHome(){locked=false;renderHome();showScreen('homeScreen')}

function renderRegionButtons(){
  $('#regionGrid').innerHTML=REGIONS.map((region,index)=>`<button type="button" class="select-button ${index===0?'is-selected':''}" data-region="${region}">${region}</button>`).join('');
  $$('#regionGrid button').forEach(button=>button.addEventListener('click',()=>{
    selectedRegion=button.dataset.region;$$('#regionGrid button').forEach(b=>b.classList.toggle('is-selected',b===button));updateAllCount();
  }));
}
function openSetup(mode){
  selectedMode=mode;$('#setupModeTitle').textContent=MODE_META[mode].title;$('#setupModeDescription').textContent=MODE_META[mode].description;
  $('#setupNavi').src=mode==='feature'?`${NAVI_BASE}/groups/learning/group-learning-social-sources.webp`:`${NAVI_BASE}/groups/learning/group-learning-pair-map.webp`;
  updateAllCount();showScreen('setupScreen');
}
function selectScope(scope){
  selectedScope=scope;$$('.scope-grid .select-button').forEach(b=>b.classList.toggle('is-selected',b.dataset.scope===scope));
  $('#regionGrid').hidden=scope!=='地方';updateAllCount();
}
function selectCount(count){
  selectedCount=count;$$('.count-grid .select-button').forEach(b=>b.classList.toggle('is-selected',b.dataset.count===count));
}
function scopeFilter(pref){
  if(selectedScope==='全国')return true;if(selectedScope==='地方')return pref.region===selectedRegion;return pref.side===selectedScope;
}
function scopedPrefectures(){return prefectures.filter(scopeFilter)}
function updateAllCount(){const count=scopedPrefectures().length;$('#allCountLabel').textContent=`${count}問`}

function startChallenge(){
  const pool=scopedPrefectures();
  const count=selectedCount==='all'?pool.length:Math.min(10,pool.length);
  queue=QuestionPool?new QuestionPool(pool).take(count):shuffle(pool).slice(0,count);
  if(selectedMode==='map')quizMapView={...MAP_BASE_VIEW};
  queueIndex=0;firstTryCorrect=0;newMasters=[];lastConfig={mode:selectedMode,scope:selectedScope,region:selectedRegion,count:selectedCount};
  $('#quizModeLabel').textContent=MODE_META[selectedMode].title;showScreen('quizScreen');showQuestion();
}
function showQuestion(){
  if(queueIndex>=queue.length){showResults();return}
  attempts=0;locked=false;const pref=queue[queueIndex];currentQuestion=makeQuestion(pref);
  $('#progressText').textContent=`${queueIndex+1} / ${queue.length}`;$('#progressBar').style.width=`${(queueIndex/queue.length)*100}%`;
  $('#questionKicker').textContent=currentQuestion.kicker;$('#questionText').textContent=currentQuestion.text;$('#questionSubtext').textContent='';
  setFeedback('','よく見て、考えてみよう');
  if(selectedMode==='map'){
    $('#choiceGrid').hidden=true;$('#quizMap').hidden=false;
    renderMap($('#quizMap'),{interactive:true,scopeCodes:new Set(scopedPrefectures().map(p=>p.code))});
  }else{
    $('#quizMap').hidden=true;$('#choiceGrid').hidden=false;renderChoices(currentQuestion.choices);
  }
}
function makeQuestion(pref){
  if(selectedMode==='map')return{pref,answer:pref.code,kicker:'地図をタップ',text:`${pref.name}はどこ？`,explanation:`ここが${pref.name}です。`};
  if(selectedMode==='capital'){
    const reverse=Math.random()<.5;
    if(reverse)return{pref,answer:pref.name,kicker:'県庁所在地 → 都道府県',text:`「${pref.capital}」が都道府県庁所在地なのは？`,choices:choiceSet(pref.name,'name'),explanation:`${pref.capital}は、${pref.name}の都道府県庁所在地です。`};
    return{pref,answer:pref.capital,kicker:'都道府県 → 県庁所在地',text:`${pref.name}の都道府県庁所在地は？`,choices:choiceSet(pref.capital,'capital'),explanation:`${pref.name}の都道府県庁所在地は、${pref.capital}です。`};
  }
  const feature=random(pref.features);
  return{pref,answer:pref.name,kicker:feature.category,text:feature.text,choices:choiceSet(pref.name,'name'),explanation:`この特色があるのは、${pref.name}です。`};
}
function choiceSet(answer,key){
  const nearby=scopedPrefectures().map(p=>p[key]).filter(value=>value!==answer);
  const all=prefectures.map(p=>p[key]).filter(value=>value!==answer&&!nearby.includes(value));
  return shuffle([answer,...shuffle([...nearby,...all]).slice(0,3)]);
}
function renderChoices(choices){
  const host=$('#choiceGrid');host.innerHTML='';
  for(const choice of choices){
    const button=document.createElement('button');button.type='button';button.className='choice-button';button.textContent=choice;
    button.addEventListener('click',()=>answerChoice(choice,button));host.append(button);
  }
}
function answerChoice(choice,button){
  if(locked)return;
  if(choice===currentQuestion.answer){handleCorrect(button);return}
  attempts++;button.classList.add('is-wrong');playSound('softFail');
  if(attempts===1)setFeedback('wrong','もういちど！',random(NAVI.retry));
  else{setFeedback('hint','黄色く光る答えを、もう一度えらぼう。',random(NAVI.hint));$$('.choice-button').find(b=>b.textContent===currentQuestion.answer)?.classList.add('is-hint')}
  setTimeout(()=>button.classList.remove('is-wrong'),450);
}
function answerMap(code,path){
  if(locked)return;
  if(code===currentQuestion.answer){handleCorrect(path);return}
  attempts++;path.classList.add('is-wrong');playSound('softFail');
  if(attempts===1)setFeedback('wrong','もういちど！ 形やまわりの県も見てみよう。',random(NAVI.retry));
  else{
    setFeedback('hint','黄色く光っている県を、もう一度タップしよう。',random(NAVI.hint));
    $(`#quizMap [data-code="${currentQuestion.answer}"]`)?.classList.add('is-hint');
  }
  setTimeout(()=>path.classList.remove('is-wrong'),450);
}
function handleCorrect(element){
  locked=true;element.classList.remove('is-hint');element.classList.add('is-correct');
  if(attempts===0)firstTryCorrect++;
  const code=currentQuestion.pref.code,wasMaster=isMaster(code);
  state.progress[code][selectedMode]=true;state.correctAnswers++;saveState();
  if(!wasMaster&&isMaster(code))newMasters.push(currentQuestion.pref.name);
  checkBadges();setFeedback('correct',attempts?`できた！ ${currentQuestion.explanation}`:`正解！ ${currentQuestion.explanation}`,random(NAVI.correct));
  $('#questionSubtext').textContent=currentQuestion.explanation;playSound('correct');
  setTimeout(()=>{queueIndex++;showQuestion()},760);
}
function setFeedback(type,text,image=''){
  const host=$('#feedback'),img=$('#feedbackNavi');host.className=`feedback${type?` is-${type}`:''}`;$('#feedbackText').textContent=text;
  if(image){img.src=image;img.alt=type==='correct'?'正解を喜ぶナビキャラ':type==='hint'?'ヒントを示すナビキャラ':'再挑戦を励ますナビキャラ';img.hidden=false}else{img.hidden=true;img.removeAttribute('src');img.alt=''}
}
function showResults(){
  $('#progressBar').style.width='100%';$('#resultCorrect').textContent=firstTryCorrect;$('#resultTotal').textContent=queue.length;
  const rate=firstTryCorrect/queue.length;$('#resultMessage').textContent=rate===1?'すべて1回で正解！ しっかり身についています。':rate>=.7?'よくできました。迷った県をもう一度確かめると、もっと強くなります。':'最後は自分で正しい答えを選べました。繰り返すほど地図がつながります。';
  $('#newMasterList').innerHTML=newMasters.map(name=>`<span class="master-chip">${name} MASTER！</span>`).join('');
  showScreen('resultScreen');playSound(newMasters.length?'mission':'result');
}

function checkBadges(){
  const masters=masterCount();
  const conditions={
    first:state.correctAnswers>=1,correct3:state.correctAnswers>=3,correct10:state.correctAnswers>=10,correct30:state.correctAnswers>=30,
    map5:modeCount('map')>=5,capital5:modeCount('capital')>=5,feature5:modeCount('feature')>=5,
    allModes:modeCount('map')>=1&&modeCount('capital')>=1&&modeCount('feature')>=1,
    master1:masters>=1,master3:masters>=3,master5:masters>=5,master10:masters>=10,master20:masters>=20,
    region:REGIONS.some(region=>masterCount(p=>p.region===region)===prefectures.filter(p=>p.region===region).length),
    east:masterCount(p=>p.side==='東日本')===prefectures.filter(p=>p.side==='東日本').length,
    west:masterCount(p=>p.side==='西日本')===prefectures.filter(p=>p.side==='西日本').length,
    all:masters===47,map:modeCount('map')===47,capital:modeCount('capital')===47,feature:modeCount('feature')===47
  };
  for(const [id,earned] of Object.entries(conditions))if(earned)badgeManager.award(id);
  renderBadges();
}
function renderBadges(){
  if(!badgeManager)return;
  $('#badgeGrid').innerHTML=BADGES.map(badge=>{
    const earned=badgeManager.has(badge.id);
    return `<div class="badge-item ${earned?'is-earned':''}"><img src="${badge.image}" alt=""><strong>${earned?badge.name:'？？？'}</strong><small>${earned?'獲得済み':badge.condition}</small></div>`;
  }).join('');
  $('#badgeSummary').textContent=`${badgeManager.getAwardedCount()} / ${BADGES.length}`;
}
function showBadgeToast(badge){
  if(!badge)return;const toast=$('#toast');toast.textContent=`バッジ獲得！「${badge.name}」`;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2600);playSound('badge')
}

function renderHome(){
  if(!geoData)return;const count=masterCount();$('#masterCount').textContent=count;$('#remainingCount').textContent=count===47?'日本地図 完成！':`あと${47-count}県！`;
  renderMap($('#collectionMap'),{interactive:false});renderBadges();$('#soundButton').setAttribute('aria-pressed',String(state.sound));$('#soundButton').setAttribute('aria-label',state.sound?'音を消す':'音を出す');
}
function renderMap(host,{interactive=false,scopeCodes=null}={}){
  host.innerHTML='';const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 720 540');svg.setAttribute('class','japan-map');svg.setAttribute('role','img');svg.setAttribute('aria-label',interactive?'答えたい都道府県をタップする日本地図':'47都道府県の習熟状況を表す日本地図');
  const bg=document.createElementNS(ns,'rect');bg.setAttribute('x','16');bg.setAttribute('y','16');bg.setAttribute('width','185');bg.setAttribute('height','120');bg.setAttribute('rx','14');bg.setAttribute('class','map-bg');svg.append(bg);
  const label=document.createElementNS(ns,'text');label.setAttribute('x','29');label.setAttribute('y','39');label.setAttribute('class','inset-label');label.textContent='沖縄県';svg.append(label);
  const zoomController=interactive?createMapZoomController(host,svg,quizMapView):null;
  for(const feature of geoData.features){
    const code=feature.properties.code,path=document.createElementNS(ns,'path');path.setAttribute('d',geometryPath(feature.geometry,code));path.dataset.code=code;path.setAttribute('fill-rule','evenodd');path.classList.add('prefecture',`level-${learnedCount(code)}`);
    if(scopeCodes&&!scopeCodes.has(code))path.classList.add('is-outside');
    if(interactive){
      path.setAttribute('role','button');path.setAttribute('tabindex','0');path.setAttribute('aria-label',`地図の領域 ${Number(code)}`);
      path.addEventListener('click',()=>{if(!zoomController.consumePan())answerMap(code,path)});path.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();answerMap(code,path)}});
    }
    svg.append(path);
  }
  host.append(svg);zoomController?.mount();
}
function geometryPath(geometry,code){
  return geometry.coordinates.map(polygon=>polygon.map(ring=>ring.map((point,index)=>{
    const [x,y]=project(point,code);return `${index?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join('')+'Z').join('')).join('');
}
function project([lon,lat],code){
  if(code==='47')return[24+(lon-122.5)*17.5,128-(lat-24)*17.5];
  return[58+(lon-128)*34,35+(46-lat)*30];
}

function createMapZoomController(host,svg,view){
  const base=MAP_BASE_VIEW;let dragStart=null,moved=false,suppressUntil=0;
  const apply=()=>svg.setAttribute('viewBox',`${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`);
  const clamp=()=>{view.x=Math.max(0,Math.min(base.w-view.w,view.x));view.y=Math.max(0,Math.min(base.h-view.h,view.y))};
  const zoom=(factor)=>{
    const nextW=Math.max(base.w/3.2,Math.min(base.w,view.w*factor)),nextH=nextW*(base.h/base.w);
    view.x+=(view.w-nextW)/2;view.y+=(view.h-nextH)/2;view.w=nextW;view.h=nextH;clamp();apply();
  };
  const reset=()=>{Object.assign(view,base);apply()};
  svg.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;dragStart={x:event.clientX,y:event.clientY,vx:view.x,vy:view.y};moved=false;svg.setPointerCapture?.(event.pointerId);
  });
  svg.addEventListener('pointermove',event=>{
    if(!dragStart)return;const dx=event.clientX-dragStart.x,dy=event.clientY-dragStart.y;if(Math.hypot(dx,dy)<5&&!moved)return;
    moved=true;const rect=svg.getBoundingClientRect();view.x=dragStart.vx-dx*(view.w/Math.max(1,rect.width));view.y=dragStart.vy-dy*(view.h/Math.max(1,rect.height));clamp();apply();svg.classList.add('is-panning');event.preventDefault();
  });
  const endPan=event=>{if(!dragStart)return;if(moved)suppressUntil=Date.now()+300;dragStart=null;svg.classList.remove('is-panning');svg.releasePointerCapture?.(event.pointerId)};
  svg.addEventListener('pointerup',endPan);svg.addEventListener('pointercancel',endPan);
  return{
    consumePan(){return Date.now()<suppressUntil},
    mount(){
      apply();
      const controls=document.createElement('div');controls.className='map-controls';controls.setAttribute('aria-label','地図の拡大操作');
      controls.innerHTML='<button type="button" aria-label="地図を拡大">＋</button><button type="button" aria-label="地図を縮小">−</button><button type="button" class="map-reset">全体</button>';
      const [plus,minus,all]=controls.querySelectorAll('button');plus.addEventListener('click',()=>zoom(.72));minus.addEventListener('click',()=>zoom(1.38));all.addEventListener('click',reset);host.append(controls);
    }
  };
}

async function playSound(id){
  if(!state.sound||!soundList?.length)return false;
  try{
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')await audioContext.resume();
    const recipe=soundList.find(item=>item.id===id)||soundList.find(item=>item.id===(id==='softFail'?'wrong':'correct'));if(!recipe)return false;recipe.play(audioContext,.18);return true;
  }catch{return false}
}
function toggleSound(){state.sound=!state.sound;saveState();renderHome();if(state.sound)playSound('decide')}

init();
