const DATA_URL="../data/prefecture-gallery.json";
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const shuffle=list=>{const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
let data=null,activeCode="08",searchText="",photoItems=[],queue=[],queueIndex=0,correctCount=0,locked=false,current=null,lastQuestConfig={region:"全国",count:"10"};

function imageUrl(item){
  if(item.image)return item.image;
  if(item.photo?.file)return "https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(item.photo.file);
  return "";
}
function withPhoto(pref,item){return {...item,prefecture:pref.name,prefectureCode:pref.code,region:pref.region,capital:pref.capital};}
async function init(){
  const response=await fetch(DATA_URL);
  if(!response.ok)throw new Error("図鑑データを読み込めませんでした");
  data=await response.json();
  photoItems=data.prefectures.flatMap(pref=>(pref.items||[]).filter(item=>item.photo?.file).map(item=>withPhoto(pref,item)));
  const allItems=data.prefectures.flatMap(pref=>pref.items||[]);
  const photoPrefectures=data.prefectures.filter(pref=>(pref.items||[]).some(item=>item.photo?.file)).length;
  $("#photoCoverage").textContent=\`写真候補 \${photoItems.length}/\${allItems.length}項目\`;
  renderPhotoProgress(allItems,photoItems,photoPrefectures);
  renderQuestRegions();
  renderPrefNav();
  $("#questAvailable").textContent=\`出題できる写真：\${photoItems.length}点\`;
  $("#questRegion").addEventListener("change",updateQuestAvailable);
  $("#startQuest").addEventListener("click",startQuest);
  $("#nextQuestion").addEventListener("click",nextQuestion);
  $("#retryQuest").addEventListener("click",()=>startQuest(lastQuestConfig));
  $("#toGuide").addEventListener("click",()=>setView("guide"));
  $("#guideSearch").addEventListener("input",event=>{searchText=event.target.value.trim().toLocaleLowerCase("ja");if(searchText)renderSearchResults();else renderPref(activeCode);});
  $$(".view-tab").forEach(button=>button.addEventListener("click",()=>setView(button.dataset.view)));
  const requested=new URLSearchParams(location.search).get("mode");
  setView(requested==="guide"?"guide":"quest");
  renderPref(activeCode);
}
function renderPhotoProgress(allItems,photos,prefCount){
  const categories=data.categories||[];
  const rows=categories.map(category=>{
    const total=allItems.filter(item=>item.category===category).length;
    const count=photos.filter(item=>item.category===category).length;
    const percent=total?Math.round(count/total*100):0;
    return \`<div class="photo-progress-row"><div class="photo-progress-label"><span>\${esc(category)}</span><strong>\${count}/\${total}</strong></div><div class="photo-progress-track"><span style="width:\${percent}%"></span></div></div>\`;
  }).join("");
  $("#photoProgress").innerHTML=\`<div class="photo-progress-summary"><strong>\${prefCount}/47</strong><span>都道府県に写真候補あり</span><span class="photo-progress-total">\${photos.length}/\${allItems.length}項目</span></div><div class="photo-progress-grid">\${rows}</div>\`;
}
function setView(view){
  const quest=view==="quest";
  $("#questView").hidden=!quest;$("#guideView").hidden=quest;
  $$(".view-tab").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.view===view)));
  history.replaceState(null,"",location.pathname+\`?mode=\${view}\`);
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderQuestRegions(){
  const regions=[...new Set(data.prefectures.map(pref=>pref.region).filter(Boolean))];
  $("#questRegion").innerHTML='<option value="全国">全国</option>'+regions.map(region=>\`<option value="\${esc(region)}">\${esc(region)}</option>\`).join("");
  updateQuestAvailable();
}
function updateQuestAvailable(){
  const region=$("#questRegion").value;
  const count=photoItems.filter(item=>region==="全国"||item.region===region).length;
  $("#questAvailable").textContent=\`出題できる写真：\${count}点\`;
}
function startQuest(config=null){
  if(config){$("#questRegion").value=config.region;$("#questCount").value=config.count;}
  const region=$("#questRegion").value,countChoice=$("#questCount").value;
  const pool=shuffle(photoItems.filter(item=>region==="全国"||item.region===region));
  const count=countChoice==="all"?pool.length:Math.min(10,pool.length);
  if(!count){$("#questAvailable").textContent="この範囲には出題できる写真がありません。";return;}
  lastQuestConfig={region,count:countChoice};queue=pool.slice(0,count);queueIndex=0;correctCount=0;locked=false;
  $("#questSetup").hidden=true;$("#questResult").hidden=true;$("#questPlay").hidden=false;
  $("#questRegionLabel").textContent=region;showQuestion();
}
function makeChoices(answer,region){
  const sameRegion=data.prefectures.filter(pref=>pref.region===region&&pref.name!==answer).map(pref=>pref.name);
  const others=data.prefectures.filter(pref=>pref.name!==answer&&!sameRegion.includes(pref.name)).map(pref=>pref.name);
  return shuffle([answer,...shuffle([...sameRegion,...others]).slice(0,3)]);
}
function showQuestion(){
  current=queue[queueIndex];locked=false;
  $("#questProgressText").textContent=\`\${queueIndex+1} / \${queue.length}\`;
  $("#questProgress").style.width=\`\${queueIndex/queue.length*100}%\`;
  $("#questionCategory").textContent=current.category;
  $("#questionPhoto").src=imageUrl(current);
  $("#questionPhoto").alt=\`\${current.name}の写真\`;
  $("#questionPhotoCaption").textContent=current.photo?.description||current.name;
  $("#questionPhoto").onerror=()=>{$("#questionPhoto").replaceWith(Object.assign(document.createElement("div"),{className:"photo-fallback",textContent:"写真を読み込めませんでした"}));};
  $("#answerReveal").hidden=true;
  $("#choiceGrid").innerHTML=makeChoices(current.prefecture,current.region).map(choice=>\`<button type="button" class="choice-button" data-answer="\${esc(choice)}">\${esc(choice)}</button>\`).join("");
  $$(".choice-button").forEach(button=>button.addEventListener("click",()=>answerQuestion(button.dataset.answer,button)));
}
function answerQuestion(answer,button){
  if(locked)return;locked=true;
  const correct=answer===current.prefecture;
  if(correct)correctCount++;
  $$(".choice-button").forEach(choice=>{choice.disabled=true;if(choice.dataset.answer===current.prefecture)choice.classList.add("is-correct");else if(choice===button)choice.classList.add("is-wrong");});
  $("#answerResultTitle").textContent=correct?"正解！":"おしい！";
  $("#answerResultTitle").className=correct?"is-correct":"is-wrong";
  $("#answerResultText").textContent=correct?\`\${current.prefecture}です。\`:\`正解は\${current.prefecture}です。\`;
  $("#answerExplanation").innerHTML=explanationCard(current);
  $("#answerReveal").hidden=false;
  $("#nextQuestion").textContent=queueIndex===queue.length-1?"結果を見る":"次の問題へ ›";
  $("#answerReveal").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function explanationCard(item){
  const caption=item.photo?.description||item.name;
  return \`<div class="reveal-heading"><span>\${esc(item.category)}</span><h3>\${esc(item.name)}</h3><p>\${esc(item.prefecture)}・\${esc(item.region)}地方</p></div>
    <p class="explanation-text">\${esc(item.description)}</p>
    <p class="photo-caption-in-reveal">写真：\${esc(caption)}</p>
    \${creditHtml(item)}
    \${item.reference?.url?\`<a class="source-link" href="\${esc(item.reference.url)}" target="_blank" rel="noopener">参考資料：\${esc(item.reference.title||"関連資料")} ↗</a>\`:""}\`;
}
function nextQuestion(){
  if(!locked)return;
  queueIndex++;
  if(queueIndex>=queue.length){showQuestResult();return;}
  showQuestion();
  window.scrollTo({top:0,behavior:"smooth"});
}
function showQuestResult(){
  $("#questPlay").hidden=true;$("#questResult").hidden=false;
  $("#questProgress").style.width="100%";
  $("#questScore").textContent=correctCount;$("#questTotal").textContent=queue.length;
  const rate=correctCount/queue.length;
  $("#questResultMessage").textContent=rate===1?"全問正解！写真と都道府県がしっかり結び付きました。":rate>=.7?"よくできました。まちがえた写真は、図鑑でもう一度確かめてみよう。":"最後まで挑戦できました。写真と説明を図鑑で見返すと、次はもっと分かるはず！";
}
function renderPrefNav(){
  const regions=data.regions||[...new Set(data.prefectures.map(pref=>pref.region))];
  $("#prefList").innerHTML=regions.map(region=>{
    const prefs=data.prefectures.filter(pref=>pref.region===region);
    if(!prefs.length)return "";
    return \`<section class="region-group"><div class="region-heading"><h3>\${esc(region)}</h3><span>\${String(prefs.length).padStart(2,"0")} PREFECTURES</span></div><div class="pref-list">\${prefs.map(pref=>\`<button class="pref-button" type="button" data-code="\${pref.code}" aria-pressed="\${pref.code===activeCode}"><small>\${pref.code}</small><strong>\${esc(pref.name)}</strong></button>\`).join("")}</div></section>\`;
  }).join("");
  $("#prefList").onclick=event=>{
    const button=event.target.closest("[data-code]");if(!button)return;
    activeCode=button.dataset.code;searchText="";$("#guideSearch").value="";renderPrefNav();renderPref(activeCode);
    $("#detail").scrollIntoView({behavior:"smooth",block:"start"});
  };
}
function creditHtml(item){
  const photo=item.photo;if(!photo)return "";
  return \`<div class="credit">写真：\${esc(photo.author||"作者情報を確認")} ／ \${esc(photo.license||"ライセンス情報")}<br>加工：\${esc(photo.changes||"未加工")}<br><a href="\${esc(photo.sourcePage||"#")}" target="_blank" rel="noopener">Wikimedia Commons 原ページ</a>\${photo.licenseUrl?\` ・ <a href="\${esc(photo.licenseUrl)}" target="_blank" rel="noopener">ライセンス</a>\`:""}<br><small>\${esc(photo.reviewStatus||"")}</small></div>\`;
}
function itemCard(item){
  const src=imageUrl(item);
  const photo=src?\`<img class="item-photo" src="\${esc(src)}" alt="\${esc(item.name)}：\${esc(item.photo?.description||item.description)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">\`:'<div class="photo-pending"><span>PHOTO</span><strong>写真を準備中</strong></div>';
  const status=item.photo?'<span class="photo-verified-label">写真・権利情報を登録</span>':'<span class="pending-label">写真候補を選定中</span>';
  return \`<article class="item-card">\${photo}<div class="item-body">\${status}<h4>\${esc(item.name)}</h4><p>\${esc(item.description)}</p>\${item.photo?.description?\`<p class="photo-caption-in-reveal">写真：\${esc(item.photo.description)}</p>\`:""}<div class="inquiry"><span>調べる視点</span><p>\${esc(item.inquiry||"この特色は、地域の自然や歴史、人々の暮らしとどう関係しているのだろう？")}</p><small>ほかの都道府県や自分の地域と比べてみよう。</small></div>\${creditHtml(item)}\${item.reference?.url?\`<a class="source-link" href="\${esc(item.reference.url)}" target="_blank" rel="noopener">参考資料：\${esc(item.reference.title||"関連資料")} ↗</a>\`:""}</div></article>\`;
}
function renderSearchResults(){
  const matches=[];
  data.prefectures.forEach(pref=>(pref.items||[]).forEach(item=>{
    if([item.name,item.description,item.category,pref.name,pref.capital,pref.region].some(value=>String(value||"").toLocaleLowerCase("ja").includes(searchText)))matches.push({pref,item});
  }));
  $("#searchStatus").textContent=\`全国47都道府県から検索：\${matches.length}件\`;
  const groups=data.prefectures.map(pref=>{
    const found=matches.filter(match=>match.pref.code===pref.code);if(!found.length)return "";
    return \`<section class="search-group"><div class="search-group-head"><div><p>\${esc(pref.region)}</p><h3>\${esc(pref.name)}</h3></div><button type="button" class="search-pref-open" data-code="\${pref.code}">この県の図鑑へ</button></div><div class="item-grid">\${found.map(match=>itemCard(match.item)).join("")}</div></section>\`;
  }).join("");
  $("#detail").innerHTML=\`<div class="pref-head"><div><p class="pref-kicker">SEARCH ALL PREFECTURES</p><h2>全国から検索</h2><p class="capital">「\${esc($("#guideSearch").value)}」の検索結果</p></div></div>\${matches.length?groups:'<div class="empty-state">見つかりませんでした。別の言葉で探してみよう。</div>'}\`;
  $$(".search-pref-open").forEach(button=>button.addEventListener("click",()=>{activeCode=button.dataset.code;searchText="";$("#guideSearch").value="";renderPrefNav();renderPref(activeCode);$("#detail").scrollIntoView({behavior:"smooth",block:"start"});}));
  bindImageFallbacks();
}
function renderPref(code){
  const pref=data.prefectures.find(entry=>entry.code===code);if(!pref)return;
  const items=pref.items||[];
  const matches=items.filter(item=>!searchText||[item.name,item.description,item.category].some(value=>String(value||"").toLocaleLowerCase("ja").includes(searchText)));
  const sections=data.categories.map(category=>{
    const found=matches.filter(item=>item.category===category);if(!found.length)return "";
    const photoCount=found.filter(item=>item.photo?.file).length;
    return \`<section class="category"><div class="category-title"><h3>\${esc(category)}</h3><span></span><small>\${photoCount}/\${found.length} 写真あり</small></div><div class="item-grid">\${found.map(itemCard).join("")}</div></section>\`;
  }).join("");
  $("#searchStatus").textContent=searchText?\`「\${esc($("#guideSearch").value)}」に一致：\${matches.length}件 / \${items.length}件\`:\`全\${items.length}項目。写真候補あり \${items.filter(item=>item.photo?.file).length}件。\`;
  $("#detail").innerHTML=\`<div class="pref-head"><div><p class="pref-kicker">\${esc(pref.region)} / PREFECTURE GUIDE \${pref.code}</p><h2>\${esc(pref.name)}<span>\${esc(pref.region)}</span></h2><p class="capital">\${pref.code==="13"?"都庁所在地":"県庁所在地"}：\${esc(pref.capital)}</p></div><span class="status">図鑑を見るだけではMASTER条件は変わりません</span></div>\${matches.length?sections:'<div class="empty-state">見つかりませんでした。</div>'}<div class="map-note"><strong>学び方：</strong>①写真と説明を読む。②調べる視点を手がかりに資料を確かめる。③ほかの県や自分の地域と比べ、気付いたことを説明してみよう。</div>\`;
  bindImageFallbacks();
}
function bindImageFallbacks(){
  $$(".item-photo").forEach(img=>img.addEventListener("error",()=>{
    const fallback=document.createElement("div");fallback.className="photo-pending image-error";fallback.textContent="写真を読み込めませんでした";img.replaceWith(fallback);
  },{once:true}));
}
init().catch(error=>{$("#detail").textContent="図鑑データを読み込めませんでした。"+error.message;$("#questAvailable").textContent="データを読み込めませんでした。";});
