const DATA_URL="./data/kanto-gallery.json";
const $=(s,r=document)=>r.querySelector(s);
let data,activeCode="08";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function init(){
 const res=await fetch(DATA_URL);
 if(!res.ok)throw new Error("図鑑データを読み込めません");
 data=await res.json();
 renderNav();
 renderPref(activeCode);
}
function renderNav(){
 $("#prefList").innerHTML=data.prefectures.map(p=>`<button class="pref-button" type="button" data-code="${p.code}" aria-pressed="${p.code===activeCode}"><small>${p.code}</small><strong>${esc(p.name)}</strong></button>`).join("");
 $("#prefList").onclick=e=>{
  const b=e.target.closest("[data-code]");
  if(!b)return;
  activeCode=b.dataset.code;
  renderNav();
  renderPref(activeCode);
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
 return `<article class="item-card">${photo}<div class="item-body">${status}<h4>${esc(item.name)}</h4><p>${esc(item.description)}</p>${photoCredit(item)}</div></article>`;
}
function renderPref(code){
 const p=data.prefectures.find(x=>x.code===code);
 if(!p)return;
 const groups=data.categories.map(cat=>{
  const items=(p.items||[]).filter(x=>x.category===cat);
  if(!items.length)return "";
  const photoCount=items.filter(x=>x.photo).length;
  return `<section class="category"><div class="category-title"><h3>${esc(cat)}</h3><span></span><small>${photoCount}/${items.length} 写真確認済み</small></div><div class="item-grid">${items.map(card).join("")}</div></section>`;
 }).join("");
 $("#detail").innerHTML=`<div class="pref-head"><div><p class="pref-kicker">PREFECTURE GUIDE / ${p.code}</p><h2>${esc(p.name)}<span>関東地方</span></h2><p class="capital">${p.code==="13"?"都庁所在地":"県庁所在地"}：${esc(p.capital)}</p></div><span class="status">図鑑の閲覧はMASTER条件に含まれません</span></div>${groups}<div class="map-note"><strong>学びのヒント：</strong>写真で見つけた場所を地図帳や日本地図で探してみよう。県のどのあたりにあるか、海や山との位置関係も確かめてみよう。</div>`;
}
init().catch(e=>{$("#detail").textContent="図鑑データを読み込めませんでした。"+e.message});
