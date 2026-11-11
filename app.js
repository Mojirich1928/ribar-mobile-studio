const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let media = [], selectedIndex = 0, currentStyle = "cinematic", currentRatio = "9:16", deferredInstall = null;
const input = $("#mediaInput"), list = $("#mediaList"), preview = $("#previewScreen");
const toast = (msg) => { const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2600); };
const fmt = n => n < 1024*1024 ? `${Math.max(1,Math.round(n/1024))} KB` : `${(n/1024/1024).toFixed(1)} MB`;

$("#chooseMedia").addEventListener("click",()=>input.click());
$("#dropZone").addEventListener("click",e=>{ if(e.target.id==="dropZone" || e.target.closest(".upload-symbol, strong, small")) input.click(); });
input.addEventListener("change", e => addFiles([...e.target.files]));
function addFiles(files){
  const valid=files.filter(f=>f.type.startsWith("image/")||f.type.startsWith("video/"));
  if(!valid.length){toast("فایل تصویری معتبر انتخاب کن.");return;}
  valid.forEach(file=>media.push({file,url:URL.createObjectURL(file),type:file.type.startsWith("video/")?"video":"image"}));
  renderMedia(); if(media.length) selectMedia(media.length-1);
  $("#mediaStatus").textContent=`${media.length} فایل اضافه شد`;
  toast(`${valid.length} فایل به پروژه اضافه شد.`);
}
function renderMedia(){
  list.innerHTML="";
  media.forEach((m,i)=>{
    const row=document.createElement("div");row.className="media-item";
    const thumb=m.type==="image"?document.createElement("img"):document.createElement("div");
    if(m.type==="image") thumb.src=m.url; else {thumb.textContent="▶";thumb.style.display="grid";thumb.style.placeItems="center";thumb.style.color="#e21b36";}
    thumb.className="media-thumb";
    const info=document.createElement("div");info.className="media-info";
    const name=document.createElement("b");name.textContent=m.file.name;
    const sub=document.createElement("small");sub.textContent=`${m.type==="image"?"عکس":"ویدیو"} · ${fmt(m.file.size)}`;
    info.append(name,sub);
    const remove=document.createElement("button");remove.textContent="×";remove.setAttribute("aria-label","حذف فایل");
    remove.onclick=()=>{URL.revokeObjectURL(m.url);media.splice(i,1);if(selectedIndex>=media.length)selectedIndex=Math.max(0,media.length-1);renderMedia();media.length?selectMedia(selectedIndex):resetPreview();$("#mediaStatus").textContent=media.length?`${media.length} فایل اضافه شد`:"در انتظار فایل";};
    row.append(thumb,info,remove);row.onclick=e=>{if(e.target!==remove)selectMedia(i);};list.append(row);
  });
}
function selectMedia(i){
  if(!media[i])return;selectedIndex=i;const m=media[i];preview.innerHTML="";
  const el=document.createElement(m.type==="image"?"img":"video");el.src=m.url;
  if(m.type==="video"){el.controls=true;el.playsInline=true;el.preload="metadata";}
  preview.append(el);$("#previewLabel").textContent=m.file.name;
}
function resetPreview(){preview.innerHTML='<div class="preview-placeholder"><div class="preview-r">R</div><b>RIBAR</b><small>YOUR PRODUCT FILM STARTS HERE</small></div>';}
$("#clearPreview").onclick=resetPreview;
$("#playPreview").onclick=()=>{const v=$("video",preview);if(v){v.paused?v.play().catch(()=>toast("برای پخش، یک بار روی ویدیو بزن.")):v.pause();}else toast("برای پخش، ابتدا یک ویدیو انتخاب کن.");};
$$(".style-option").forEach(b=>b.onclick=()=>{$$(".style-option").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");currentStyle=b.dataset.style;});
$$("[data-ratio]").forEach(b=>b.onclick=()=>{$$("[data-ratio]").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentRatio=b.dataset.ratio;preview.style.aspectRatio=currentRatio.replace(":"," / ");});
$("#buildStory").onclick=()=>{
  if(!media.length){toast("اول عکس یا ویدیوی کتونی را اضافه کن.");return;}
  const titles=currentStyle==="cinematic"?[
    ["معرفی محصول","نمایش قهرمانانه کتونی با حرکت آرام دوربین","۲.۵ ثانیه"],
    ["جزئیات نزدیک","تمرکز روی جنس، دوخت و ساختار کفش","۲ ثانیه"],
    ["نمای نهایی","کادر تمیز محصول و پایان‌بندی برند","۲ ثانیه"]
  ]:[
    ["شروع ضربه‌ای","نمایش سریع محصول در اولین لحظه","۱ ثانیه"],
    ["جزئیات و کات","چند برش کوتاه برای نمایش ویژگی‌ها","۲ ثانیه"],
    ["فریم پایانی","نمای نهایی مناسب ریلز","۱.۵ ثانیه"]
  ];
  $("#storyList").innerHTML="";
  titles.forEach((s,i)=>{const row=document.createElement("div");row.className="scene";row.innerHTML=`<span class="scene-num">${String(i+1).padStart(2,"0")}</span><div class="scene-text"><b></b><small></small></div><span class="scene-time"></span>`;$(".scene-text b",row).textContent=s[0];$(".scene-text small",row).textContent=s[1];$(".scene-time",row).textContent=s[2];$("#storyList").append(row);});
  toast("سناریوی اولیه ساخته شد؛ فعلاً پیشنهاد تدوینی است، نه تولید خودکار AI.");
};
$("#exportBtn").onclick=()=>{
  if(!media.length){toast("برای شروع خروجی، رسانه اضافه کن.");return;}
  $("#exportNote").textContent="این نسخه اولیه رسانه‌ها و سناریو را در مرورگر مدیریت می‌کند. خروجی MP4 نهایی هنوز به موتور رندر ابری متصل نشده است.";
  toast("پروژه آماده مرحله اتصال موتور رندر است.");
};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;});
$("#installBtn").onclick=async()=>{
  if(deferredInstall){deferredInstall.prompt();deferredInstall=null;}
  else toast("در آیفون: Safari ← Share ← Add to Home Screen");
};
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
