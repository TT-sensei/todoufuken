const DATA_URL="./data/kanto-gallery.json";
const $=(s,r=document)=>r.querySelector(s);
let data,activeCode="08";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function init(){const res=await fetch(DATA_URL);if(!res.ok)throw new Error("図鑑データを読み込めません");data=await res.json();renderNav();renderPref(activeCode)}
function renderNav(){
 $("#prefList").innerHTML=data.prefectures.map(p=>`<button class="pref-button" type="button" data-code="${p.code}" aria-pressed="${p.code===activeCode}"><small>${p.code}</small><strong>${esc(p.name)}</strong></button>`).join("");
 $("#prefList").addEventListener("click",e=>{const b=e.target.closest("[data-code]");if(!b)return;activeCode=b.dataset.code;renderNav();renderPref(activeCode)});
}
function card(item){
 const photo=item.image?`<img class="item-photo" src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" decoding="async">`:"";
 const credit=item.image?`<div class="credit">写真：${esc(item.author)} ／ ${esc(item.license)}<br><a href="${esc(item.source)}" target="_blank" rel="noopener">Wikimedia Commonsの原ページ</a> ・ <a href="${esc(item.licenseUrl)}" target="_blank" rel="noopener">ライセンス</a><br>試作表示：${esc(item.modified)}</div>`:"";
 return `<article class="item-card">${photo}<div class="item-body"><h4>${esc(item.name)}</h4><p>${esc(item.description)}</p>${credit}</div></article>`;
}
function renderPref(code){
 const p=data.prefectures.find(x=>x.code===code);if(!p)return;
 const items=p.items||[],facts=p.facts||[];
 const groups=data.categories.map(cat=>{
  const photos=items.filter(x=>x.category===cat),notes=facts.filter(x=>x.category===cat);
  if(!photos.length&&!notes.length)return "";
  return `<section class="category"><div class="category-title"><h3>${esc(cat)}</h3><span></span><small>${photos.length+notes.length}項目</small></div><div class="item-grid">${photos.map(card).join("")}${notes.map(x=>`<article class="item-card text-card"><span class="category-label">地域のポイント</span><h4>${esc(x.title)}</h4><p>${esc(x.description)}</p></article>`).join("")}</div></section>`;
 }).join("");
 $("#detail").innerHTML=`<div class="pref-head"><div><p class="pref-kicker">PREFECTURE GUIDE / ${p.code}</p><h2>${esc(p.name)}<span>関東地方</span></h2><p class="capital">県庁所在地：${esc(p.capital)}</p></div><span class="status">図鑑の閲覧はMASTER条件に含まれません</span></div>${groups}<div class="map-note"><strong>学びのヒント：</strong>写真で見つけた場所を地図帳や日本地図で探してみよう。県のどのあたりにあるか、海や山との位置関係も確かめてみよう。</div>`;
}
init().catch(e=>{$("#detail").textContent="図鑑データを読み込めませんでした。"+e.message});
