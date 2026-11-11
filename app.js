
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let media=[],selectedIndex=0,currentStyle="cinematic",currentRatio="9:16",deferredInstall=null,scenes=[],isExporting=false;
const input=$("#mediaInput"),list=$("#mediaList"),preview=$("#previewScreen");
const toast=msg=>{const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),3000)};
const fmt=n=>n<1048576?Math.max(1,Math.round(n/1024))+" KB":(n/1048576).toFixed(1)+" MB";
$("#chooseMedia").onclick=()=>input.click();
$("#dropZone").onclick=e=>{if(e.target.id==="dropZone"||e.target.closest(".upload-symbol,strong,small"))input.click()};
input.onchange=e=>addFiles([...e.target.files]);
function addFiles(files){const valid=files.filter(f=>f.type.startsWith("image/")||f.type.startsWith("video/"));if(!valid.length)return toast("فایل تصویری معتبر انتخاب کن.");valid.forEach(file=>media.push({file,url:URL.createObjectURL(file),type:file.type.startsWith("video/")?"video":"image"}));renderMedia();selectMedia(media.length-1);$("#mediaStatus").textContent=media.length+" فایل اضافه شد";toast(valid.length+" فایل اضافه شد.");input.value=""}
function renderMedia(){list.innerHTML="";media.forEach((m,i)=>{const row=document.createElement("div");row.className="media-item";const thumb=m.type==="image"?document.createElement("img"):document.createElement("div");if(m.type==="image")thumb.src=m.url;else{thumb.textContent="▶";thumb.style.display="grid";thumb.style.placeItems="center";thumb.style.color="#e21b36"}thumb.className="media-thumb";const info=document.createElement("div");info.className="media-info";const b=document.createElement("b");b.textContent=m.file.name;const sm=document.createElement("small");sm.textContent=(m.type==="image"?"عکس":"ویدیو")+" · "+fmt(m.file.size);info.append(b,sm);const del=document.createElement("button");del.textContent="×";del.setAttribute("aria-label","حذف فایل");del.onclick=e=>{e.stopPropagation();URL.revokeObjectURL(m.url);media.splice(i,1);renderMedia();if(media.length)selectMedia(Math.min(selectedIndex,media.length-1));else resetPreview();$("#mediaStatus").textContent=media.length?media.length+" فایل اضافه شد":"در انتظار فایل"};row.append(thumb,info,del);row.onclick=()=>selectMedia(i);list.append(row)})}
function selectMedia(i){if(!media[i])return;selectedIndex=i;imagePreviewPlaying=false;$("#playPreview").textContent="▶";preview.innerHTML="";const el=document.createElement(media[i].type==="image"?"img":"video");el.src=media[i].url;if(el.tagName==="VIDEO"){el.controls=true;el.playsInline=true;el.preload="metadata"}preview.append(el);$("#previewLabel").textContent=media[i].file.name}
function resetPreview(){preview.innerHTML='<div class="preview-placeholder"><div class="preview-r">R</div><b>RIBAR</b><small>YOUR PRODUCT FILM STARTS HERE</small></div>'}
$("#clearPreview").onclick=resetPreview;
let imagePreviewPlaying=false;
$("#playPreview").onclick=()=>{
  const v=$("video",preview),im=$("img",preview);
  if(v){if(v.paused)v.play().catch(()=>toast("برای پخش ویدیو دوباره روی دکمه بزن."));else v.pause();return}
  if(im){imagePreviewPlaying=!imagePreviewPlaying;im.classList.toggle("preview-kenburns",imagePreviewPlaying);$("#playPreview").textContent=imagePreviewPlaying?"Ⅱ":"▶";toast(imagePreviewPlaying?"پیش‌نمایش حرکتی عکس فعال شد.":"پیش‌نمایش متوقف شد.");return}
  toast("اول عکس یا ویدیوی کتونی را اضافه کن.")
};
$$(".style-option").forEach(b=>b.onclick=()=>{$$(".style-option").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");currentStyle=b.dataset.style});
$$("[data-ratio]").forEach(b=>b.onclick=()=>{$$("[data-ratio]").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentRatio=b.dataset.ratio;preview.style.aspectRatio=currentRatio.replace(":"," / ")});
function buildScenes(){
 if(!media.length)return toast("اول رسانه اضافه کن.");
 const base=currentStyle==="cinematic"?[
  {title:"ورود قهرمانانه",desc:"نمای باز با نور و حرکت دوربین",duration:3,shot:"hero"},
  {title:"نمای نزدیک جزئیات",desc:"حرکت دوربین روی بافت و متریال",duration:2.5,shot:"detail"},
  {title:"حرکت جانبی محصول",desc:"اسلاید نرم برای نمایش فرم کتونی",duration:2.5,shot:"slide"},
  {title:"فریم نهایی برند",desc:"جمع‌بندی تمیز با امضای ریبار",duration:2,shot:"outro"}
 ]:[
  {title:"شروع ضربه‌ای",desc:"ورود سریع محصول به قاب",duration:1.5,shot:"impact"},
  {title:"کلوزآپ پویا",desc:"کات نزدیک با حرکت سریع",duration:2,shot:"detail"},
  {title:"اسلاید محصول",desc:"حرکت جانبی و تاکید روی فرم",duration:1.8,shot:"slide"},
  {title:"پایان ریلز",desc:"فریم نهایی برند",duration:1.5,shot:"outro"}
 ];
 scenes=base.map((s,i)=>({...s,mediaIndex:Math.min(i,media.length-1)}));
 renderScenes();renderStory();toast("سناریوی چندبخشی ساخته شد؛ هر صحنه حرکت متفاوت دارد.")
}
function renderStory(){
 const el=$("#storyList");el.innerHTML="";
 scenes.forEach((s,i)=>{
  const row=document.createElement("div");row.className="scene";
  row.innerHTML='<span class="scene-num"></span><div class="scene-text"><b></b><small></small></div><span class="scene-time"></span>';
  $(".scene-num",row).textContent=String(i+1).padStart(2,"0");
  $(".scene-text b",row).textContent=s.title;
  $(".scene-text small",row).textContent=s.desc+" · "+(SHOT_LABELS[s.shot]||"حرکت دوربین");
  $(".scene-time",row).textContent=s.duration+" ثانیه";el.append(row)
 })
}
const SHOT_LABELS={hero:"ورود سینمایی",detail:"کلوزآپ جزئیات",slide:"اسلاید جانبی",impact:"ورود ضربه‌ای",outro:"پایان برند"};
function renderScenes(){
 const el=$("#timelineList");el.innerHTML="";$("#timelineStatus").textContent=scenes.length+" صحنه";
 if(!scenes.length){el.innerHTML='<div class="empty-state">صحنه‌ای وجود ندارد.</div>';return}
 scenes.forEach((s,i)=>{
  const row=document.createElement("div");row.className="timeline-item";
  const top=document.createElement("div");top.className="timeline-top";
  const name=document.createElement("b");name.textContent=String(i+1).padStart(2,"0")+" · "+s.title;
  const actions=document.createElement("div");actions.className="timeline-actions";
  const button=(txt,fn,disabled=false)=>{const b=document.createElement("button");b.textContent=txt;b.disabled=disabled;b.onclick=fn;return b};
  actions.append(button("↑",()=>{[scenes[i-1],scenes[i]]=[scenes[i],scenes[i-1]];renderScenes();renderStory()},i===0),button("↓",()=>{[scenes[i+1],scenes[i]]=[scenes[i],scenes[i+1]];renderScenes();renderStory()},i===scenes.length-1),button("×",()=>{scenes.splice(i,1);renderScenes();renderStory()}));top.append(name,actions);
  const select=document.createElement("select");select.className="scene-media";
  media.forEach((m,j)=>{const o=document.createElement("option");o.value=j;o.textContent=(j+1)+". "+m.file.name;o.selected=j===s.mediaIndex;select.append(o)});
  select.onchange=()=>s.mediaIndex=Number(select.value);
  const shot=document.createElement("select");shot.className="scene-media";
  Object.entries(SHOT_LABELS).forEach(([key,label])=>{const o=document.createElement("option");o.value=key;o.textContent="حرکت: "+label;o.selected=key===s.shot;shot.append(o)});
  shot.onchange=()=>{s.shot=shot.value;renderStory()};
  const label=document.createElement("label");label.textContent="مدت صحنه";
  const range=document.createElement("input");range.type="range";range.min="1";range.max="8";range.step=".5";range.value=s.duration;
  const time=document.createElement("span");time.className="duration-value";time.textContent=s.duration+" ثانیه";
  range.oninput=()=>{s.duration=Number(range.value);time.textContent=s.duration+" ثانیه";renderStory()};
  row.append(top,select,shot,label,range,time);el.append(row)
 })
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function loadImage(url){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url})}
function loadVideo(url){return new Promise((resolve,reject)=>{const v=document.createElement("video");v.src=url;v.muted=true;v.playsInline=true;v.preload="auto";v.onloadeddata=()=>resolve(v);v.onerror=reject;v.load()})}
function drawScene(ctx,source,w,h,p,scene={}){
 const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;
 if(!sw||!sh)throw Error("Media not ready");
 const shot=scene.shot||"hero",ease=p*p*(3-2*p);
 let zoom=1.06,moveX=0,moveY=0;
 if(shot==="hero"){zoom=1.18-.10*ease;moveX=(.5-p)*w*.045;moveY=(.5-p)*h*.018}
 if(shot==="detail"){zoom=1.48+.08*Math.sin(p*Math.PI);moveX=(p-.5)*w*.10;moveY=-h*.035}
 if(shot==="slide"){zoom=1.12;moveX=(.5-p)*w*.16;moveY=Math.sin(p*Math.PI)*h*.012}
 if(shot==="impact"){zoom=p<.18?1.10+(1-p/.18)*.12:1.10-.08*ease;moveY=(.5-p)*h*.035}
 if(shot==="outro"){zoom=1.10-.07*ease;moveY=(.5-p)*h*.015}
 const scale=Math.max(w/sw,h/sh)*zoom,dw=sw*scale,dh=sh*scale;
 ctx.save();ctx.fillStyle="#070707";ctx.fillRect(0,0,w,h);
 ctx.drawImage(source,(w-dw)/2+moveX,(h-dh)/2+moveY,dw,dh);
 const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,"rgba(0,0,0,.12)");shade.addColorStop(.52,"rgba(0,0,0,0)");shade.addColorStop(1,"rgba(0,0,0,.78)");ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 const vignette=ctx.createRadialGradient(w*.5,h*.45,Math.min(w,h)*.2,w*.5,h*.45,Math.max(w,h)*.72);vignette.addColorStop(0,"rgba(0,0,0,0)");vignette.addColorStop(1,"rgba(0,0,0,.42)");ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
 const lx=(p*1.55-.25)*w;const light=ctx.createLinearGradient(lx-w*.18,0,lx+w*.18,0);light.addColorStop(0,"rgba(255,255,255,0)");light.addColorStop(.5,"rgba(255,255,255,.10)");light.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
 ctx.globalAlpha=Math.min(1,p*5);ctx.fillStyle="#e21b36";ctx.fillRect(w*.075,h*.075,w*.11,Math.max(3,h*.004));
 ctx.fillStyle="rgba(255,255,255,.78)";ctx.font="600 "+Math.round(w*.022)+"px Arial";ctx.textAlign="left";ctx.fillText("RIBAR COLLECTION",w*.075,h*.12);
 ctx.textAlign="center";ctx.fillStyle="#fff";ctx.font="800 "+Math.round(w*(shot==="outro"?.075:.052))+"px Arial";
 const headline=shot==="hero"?"THE ICON":shot==="detail"?"BUILT IN DETAIL":shot==="slide"?"FORM. FUNCTION.":shot==="impact"?"MAKE A STATEMENT":"RIBAR";
 ctx.fillText(headline,w/2,h*(shot==="outro"?.82:.88));
 ctx.fillStyle="rgba(255,255,255,.72)";ctx.font="500 "+Math.round(w*.022)+"px Arial";ctx.fillText("PREMIUM SNEAKER EDITION",w/2,h*.92);
 ctx.fillStyle="#e21b36";ctx.fillRect(w*.38,h*.95,w*.24,Math.max(3,h*.005));ctx.restore();
}

async function exportVideo(){if(isExporting)return;if(!scenes.length)return toast("ابتدا سناریو بساز.");if(!HTMLCanvasElement.prototype.captureStream||!window.MediaRecorder)return toast("ضبط ویدیو در این مرورگر پشتیبانی نمی‌شود.");const canvas=document.createElement("canvas"),parts=currentRatio.split(":").map(Number),w=720,h=Math.round(w*parts[1]/parts[0]);canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");const mime=["video/mp4;codecs=avc1.42E01E","video/mp4","video/webm;codecs=vp9","video/webm"].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)return toast("کدک ویدیویی سازگار پیدا نشد.");const stream=canvas.captureStream(30);let recorder;try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000})}catch(e){stream.getTracks().forEach(t=>t.stop());return toast("ساخت رندرر در این دستگاه ممکن نشد.")}const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(chunks,{type:mime}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="RIBAR-VIDEO."+(mime.includes("mp4")?"mp4":"webm");document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);isExporting=false;$("#exportBtn").disabled=false;$("#exportBtn").textContent="رندر و ذخیره ویدیو";$("#exportNote").textContent="رندر تمام شد. اگر دانلود خودکار انجام نشد، لینک ویدیو را در مرورگر باز و از Share گزینه Save to Files را انتخاب کن.";toast("رندر ویدیو تمام شد.")};recorder.onerror=()=>{isExporting=false;$("#exportBtn").disabled=false;toast("در ضبط ویدیو خطا رخ داد.")};isExporting=true;$("#exportBtn").disabled=true;$("#exportBtn").textContent="در حال رندر…";$("#exportNote").textContent="صفحه را باز نگه دار؛ رندر روی همین گوشی انجام می‌شود.";recorder.start(250);try{for(const scene of scenes){const item=media[scene.mediaIndex]||media[0];let source=item.type==="image"?await loadImage(item.url):await loadVideo(item.url);if(item.type==="video"){source.currentTime=0;await source.play().catch(()=>{})}const frames=Math.max(1,Math.round(scene.duration*30));for(let f=0;f<frames;f++){if(item.type==="video"&&source.ended){source.currentTime=0;await source.play().catch(()=>{})}drawScene(ctx,source,w,h,f/frames,scene);await sleep(1000/30)}if(item.type==="video"){source.pause();source.remove()}}}catch(e){toast("یکی از رسانه‌ها قابل رندر نبود.")}finally{if(recorder.state!=="inactive")recorder.stop();stream.getTracks().forEach(t=>t.stop())}}
$("#exportBtn").onclick=exportVideo;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e});
$("#installBtn").onclick=async()=>{if(deferredInstall){deferredInstall.prompt();deferredInstall=null}else toast("در آیفون: Safari ← Share ← Add to Home Screen")};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
