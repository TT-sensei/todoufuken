const DATA_URL="./data/prefecture-gallery.json";
const $=(s,r=document)=>r.querySelector(s);
let data,activeCode="08",searchText="";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function init(){
 const res=await fetch(DATA_URL);
 if(!res.ok)throw new Error("図鑑データを読み込めません");
 data=await res.json();
 renderNav();
 $("#guideSearch").addEventListener("input",e=>{searchText=e.target.value.trim().toLocaleLowerCase("ja");renderPref(activeCode);});
 renderPref(activeCode);
}
function renderNav(){
 const regions=data.regions||[...new Set(data.prefectures.map(p=>p.region))];
 $("#prefList").innerHTML=regions.map(region=>{
  const prefs=data.prefectures.filter(p=>p.region===region);
  if(!prefs.length)return "";
  return `<section class="region-group"><div class="region-heading"><h3>${esc(region)}</h3><span>${String(prefs.length).padStart(2,"0")} PREFECTURES</span></div><div class="pref-list">${prefs.map(p=>`<button class="pref-button" type="button" data-code="${p.code}" aria-pressed="${p.code===activeCode}"><small>${p.code}</small><strong>${esc(p.name)}</strong></button>`).join("")}</div></section>`;
 }).join("");
 $("#prefList").onclick=e=>{
  const b=e.target.closest("[data-code]");
  if(!b)return;
  activeCode=b.dataset.code;
  renderNav();
  renderPref(activeCode);
  $("#detail").scrollIntoView({behavior:"smooth",block:"start"});
 };
}
function photoCredit(item){
 const p=item.photo;
 if(!p)return "";
 return `<div class="credit">写真：${esc(p.author)} ／ ${esc(p.license)}<br><a href="${esc(p.sourcePage)}" target="_blank" rel="noopener">Wikimedia Commons 原ページ</a> ・ <a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener">ライセンス</a><br>画像の状態：原画像（ローカル配置前）</div>`;
}
function card(item){
 const photo=item.photo
  ?`<img class="item-photo" src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
  :`<div class="photo-pending" aria-label="写真を準備中"><span>PHOTO</span><strong>写真を準備中</strong></div>`;
 const status=item.photo?"":"<span class=\"pending-label\">写真候補を選定中</span>";
 return `<article class="item-card">${photo}<div class="item-body">${status}<h4>${esc(item.name)}</h4><p>${esc(item.description)}</p><div class="inquiry"><span>調べる視点</span><p>${esc(item.inquiry||"この特色は、地域の自然や歴史、人々の暮らしとどう関係しているのだろう？")}</p><small>自分の住む地域や、ほかの都道府県と比べてみよう。</small></div>${photoCredit(item)}${item.reference?`<a class="source-link" href="${esc(item.reference.url)}" target="_blank" rel="noopener">参考資料を開く：${esc(item.reference.title)} ↗</a>${item.reference.note?`<div class="source-note">${esc(item.reference.note)}</div>`:""}`:""}</div></article>`;
}
function renderPref(code){
 const p=data.prefectures.find(x=>x.code===code);
 if(!p)return;
 const allItems=p.items||[];
 const matches=allItems.filter(x=>!searchText||[x.name,x.description,x.category].some(v=>String(v||"").toLocaleLowerCase("ja").includes(searchText)));
 const sections=data.categories.map(cat=>{
  const items=matches.filter(x=>x.category===cat);
  if(!items.length)return "";
  const photoCount=items.filter(x=>x.photo).length;
  return `<section class="category"><div class="category-title"><h3>${esc(cat)}</h3><span></span><small>${photoCount}/${items.length} 写真確認済み</small></div><div class="item-grid">${items.map(card).join("")}</div></section>`;
 }).join("");
 $("#searchStatus").textContent=searchText?`「${$("#guideSearch").value}」に一致：${matches.length}件 / ${allItems.length}件`:`全${allItems.length}項目を表示中。写真確認済み ${allItems.filter(x=>x.photo).length}件。`;
 const empty=matches.length?"":'<div class="empty-state">見つかりませんでした。別の言葉で検索してみよう。</div>';
 $("#detail").innerHTML=`<div class="pref-head"><div><p class="pref-kicker">${esc(p.region)} / PREFECTURE GUIDE ${p.code}</p><h2>${esc(p.name)}<span>${esc(p.region)}</span></h2><p class="capital">${p.code==="13"?"都庁所在地":"県庁所在地"}：${esc(p.capital)}</p></div><span class="status">図鑑の閲覧はMASTER条件に含まれません</span></div>${empty}${sections}<div class="map-note"><strong>学びのヒント：</strong>写真で見つけた場所を地図帳や日本地図で探してみよう。県のどのあたりにあるか、海や山との位置関係も確かめてみよう。</div>`;
 $("#detail").querySelectorAll("img.item-photo").forEach(img=>img.addEventListener("error",()=>{
  const fallback=document.createElement("div");
  fallback.className="photo-pending image-error";
  fallback.textContent="写真を読み込めませんでした";
  img.replaceWith(fallback);
 },{once:true}));
}
init().catch(e=>{$("#detail").textContent="図鑑データを読み込めませんでした。"+e.message});
