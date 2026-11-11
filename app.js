"use strict";
(()=>{
const $=id=>document.getElementById(id);
const fileInput=$("fileInput"),uploadButton=$("uploadButton"),previewCanvas=$("previewCanvas"),ctx=previewCanvas.getContext("2d");
let productImage=null,productUrl="",file=null,rafId=0,previewRunning=false,rendering=false,downloadUrl="";
let ratio="9:16",duration=8,quality=1080,previewStarted=0;
const state={phase:"idle"};
function setStatus(text){$("renderStatus").textContent=text}
function aspect(){return ratio.split(":").map(Number)}
function canvasSize(){const [rw,rh]=aspect();const w=quality;return {w,h:Math.round(w*rh/rw)}}
function drawFrame(target,w,h,p){
 target.save();target.setTransform(1,0,0,1,0,0);target.clearRect(0,0,w,h);
 const bg=target.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#17171a");bg.addColorStop(.48,"#09090b");bg.addColorStop(1,"#171013");target.fillStyle=bg;target.fillRect(0,0,w,h);
 const glow=target.createRadialGradient(w*.52,h*.46,1,w*.52,h*.46,Math.max(w,h)*.55);glow.addColorStop(0,"rgba(105,28,43,.28)");glow.addColorStop(.55,"rgba(55,22,29,.12)");glow.addColorStop(1,"rgba(0,0,0,0)");target.fillStyle=glow;target.fillRect(0,0,w,h);
 const sweep=(p*1.25-.15)*w;const beam=target.createLinearGradient(sweep-w*.16,0,sweep+w*.16,0);beam.addColorStop(0,"rgba(255,255,255,0)");beam.addColorStop(.5,"rgba(255,255,255,.11)");beam.addColorStop(1,"rgba(255,255,255,0)");target.fillStyle=beam;target.fillRect(0,0,w,h);
 target.save();target.globalAlpha=.4;target.filter="blur("+Math.round(w*.035)+"px)";target.fillStyle="#000";target.beginPath();target.ellipse(w*.5,h*.69,w*.29,h*.025,0,0,Math.PI*2);target.fill();target.restore();
 if(productImage){
  const iw=productImage.naturalWidth,ih=productImage.naturalHeight;
  const scale=Math.min(w*.78/iw,h*.48/ih);
  const zoom=1+.025*Math.sin(p*Math.PI*2);
  const dw=iw*scale*zoom,dh=ih*scale*zoom;
  const x=w*.5+Math.sin(p*Math.PI*2)*w*.012,y=h*.46+Math.sin(p*Math.PI*2)*h*.012;
  target.save();target.translate(x,y);target.rotate(Math.sin(p*Math.PI*2)*.012);
  target.shadowColor="rgba(0,0,0,.8)";target.shadowBlur=w*.035;target.shadowOffsetY=h*.012;
  target.drawImage(productImage,-dw/2,-dh/2,dw,dh);target.restore();
 }
 const shade=target.createLinearGradient(0,h*.72,0,h);shade.addColorStop(0,"rgba(0,0,0,0)");shade.addColorStop(1,"rgba(0,0,0,.68)");target.fillStyle=shade;target.fillRect(0,h*.72,w,h*.28);
 target.fillStyle="#df203c";target.fillRect(w*.075,h*.075,w*.13,Math.max(2,h*.003));
 target.textAlign="left";target.fillStyle="rgba(255,255,255,.82)";target.font="600 "+Math.round(w*.021)+"px Arial";target.fillText("RIBAR COLLECTION",w*.075,h*.115);
 target.textAlign="center";target.fillStyle="#fff";target.font="800 "+Math.round(w*.052)+"px Arial";target.fillText("THE DETAILS MATTER",w*.5,h*.86);
 target.fillStyle="rgba(255,255,255,.65)";target.font="500 "+Math.round(w*.018)+"px Arial";target.fillText("PREMIUM SNEAKER EDITION",w*.5,h*.905);
 target.restore();
}
function previewLoop(now){
 if(!previewRunning)return;
 const p=((now-previewStarted)/1000%duration)/duration;
 drawFrame(ctx,previewCanvas.width,previewCanvas.height,p);
 rafId=requestAnimationFrame(previewLoop);
}
function stopPreview(){previewRunning=false;if(rafId)cancelAnimationFrame(rafId);rafId=0;$("previewButton").textContent="▶ پخش پیش‌نمایش"}
function startPreview(){
 if(!productImage)return;
 stopPreview();previewRunning=true;previewStarted=performance.now();$("previewButton").textContent="Ⅱ توقف پیش‌نمایش";$("previewState").textContent="در حال پخش";
 previewLoop(previewStarted);
}
function resizePreview(){
 const [rw,rh]=aspect();previewCanvas.width=540;previewCanvas.height=Math.round(540*rh/rw);
 $("previewFrame").style.aspectRatio=ratio.replace(":"," / ");
 if(productImage)drawFrame(ctx,previewCanvas.width,previewCanvas.height,0);
}
function clearDownload(){if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=""}$("downloadLink").hidden=true;$("downloadLink").removeAttribute("href")}
function loadProduct(selectedFile){
 if(!selectedFile)return;
 if(selectedFile.type!=="image/png"&&!selectedFile.name.toLowerCase().endsWith(".png")){setStatus("فقط فایل PNG پشتیبانی می‌شود.");return}
 stopPreview();clearDownload();
 const nextUrl=URL.createObjectURL(selectedFile),img=new Image();
 img.onload=()=>{
  if(productUrl)URL.revokeObjectURL(productUrl);
  productUrl=nextUrl;productImage=img;file=selectedFile;
  $("fileState").textContent="PNG بارگذاری شد";$("fileName").textContent=selectedFile.name+" · "+Math.round(selectedFile.size/1024)+" KB";$("fileInfo").hidden=false;
  $("emptyPreview").hidden=true;$("previewButton").disabled=false;$("renderButton").disabled=false;$("previewState").textContent="آماده";
  resizePreview();startPreview();
  try{
   const probe=document.createElement("canvas");probe.width=24;probe.height=24;const pctx=probe.getContext("2d",{willReadFrequently:true});pctx.drawImage(img,0,0,24,24);
   const data=pctx.getImageData(0,0,24,24).data;let alpha=false;for(let i=3;i<data.length;i+=4){if(data[i]<250){alpha=true;break}}
   $("alphaNote").textContent=alpha?"پس‌زمینه شفاف شناسایی شد؛ آماده ترکیب روی صحنه.":"این PNG ظاهراً پس‌زمینه شفاف ندارد؛ تصویر بدون حذف پس‌زمینه استفاده می‌شود.";
  }catch(e){$("alphaNote").textContent="تصویر بارگذاری شد."}
  setStatus("تصویر آماده است. پیش‌نمایش را بررسی کن.");
 };
 img.onerror=()=>{URL.revokeObjectURL(nextUrl);setStatus("خواندن فایل تصویر ناموفق بود.")};
 img.src=nextUrl;
}
function chooseMime(){
 if(!window.MediaRecorder)return "";
 const types=["video/mp4;codecs=avc1.42E01E","video/mp4","video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];
 if(typeof MediaRecorder.isTypeSupported!=="function")return "";
 return types.find(t=>MediaRecorder.isTypeSupported(t))||"";
}
async function renderVideo(){
 if(rendering||!productImage)return;
 if(!HTMLCanvasElement.prototype.captureStream||!window.MediaRecorder){setStatus("این مرورگر ضبط ویدیوی Canvas را پشتیبانی نمی‌کند. Safari را به‌روز کن یا از مرورگر دیگری استفاده کن.");return}
 const mime=chooseMime();
 if(!mime){setStatus("کدک MP4/WebM سازگار در این مرورگر پیدا نشد؛ امکان ساخت فایل ویدیو وجود ندارد.");return}
 rendering=true;$("renderButton").disabled=true;$("previewButton").disabled=true;clearDownload();
 $("progressTrack").hidden=false;$("progressBar").style.width="0%";setStatus("در حال آماده‌سازی رندر…");
 const size=canvasSize(),canvas=document.createElement("canvas");canvas.width=size.w;canvas.height=size.h;
 const renderCtx=canvas.getContext("2d");if(!renderCtx){setStatus("ساخت Canvas خروجی ممکن نشد.");rendering=false;$("renderButton").disabled=false;return}
 const stream=canvas.captureStream(30);let recorder,stopHandler,errorHandler;const chunks=[];
 try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.min(12000000,quality===1080?8000000:4500000)})}
 catch(e){stream.getTracks().forEach(t=>t.stop());rendering=false;$("renderButton").disabled=false;$("previewButton").disabled=false;setStatus("مرورگر نتوانست ضبط‌کننده ویدیو را بسازد: "+e.message);return}
 const stopped=new Promise((resolve,reject)=>{
  recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  stopHandler=()=>resolve();errorHandler=e=>reject(e.error||new Error("Recorder error"));
  recorder.addEventListener("stop",stopHandler,{once:true});recorder.addEventListener("error",errorHandler,{once:true});
 });
 try{
  drawFrame(renderCtx,size.w,size.h,0);recorder.start(500);
  const start=performance.now(),total=duration*1000;let lastUpdate=0;
  await new Promise((resolve,reject)=>{
   const tick=now=>{
    try{
     const elapsed=Math.min(total,now-start),p=elapsed/total;drawFrame(renderCtx,size.w,size.h,p);
     if(now-lastUpdate>180){$("progressBar").style.width=Math.round(p*92)+"%";setStatus("در حال رندر… "+Math.round(p*100)+"٪");lastUpdate=now}
     if(elapsed>=total)resolve();else requestAnimationFrame(tick);
    }catch(err){reject(err)}
   };requestAnimationFrame(tick);
  });
  recorder.stop();await stopped;
  const blob=new Blob(chunks,{type:recorder.mimeType||mime});
  if(!blob.size)throw new Error("فایل خروجی خالی است");
  downloadUrl=URL.createObjectURL(blob);const ext=(recorder.mimeType||mime).includes("mp4")?"mp4":"webm";
  const link=$("downloadLink");link.href=downloadUrl;link.download="RIBAR-COLLECTION."+ext;link.textContent="دانلود ویدیو · "+(blob.size/1048576).toFixed(1)+" MB";link.hidden=false;
  $("progressBar").style.width="100%";setStatus("رندر تمام شد. برای ذخیره، روی لینک دانلود بزن.");$("previewState").textContent="رندر کامل شد";
 }catch(err){console.error("RIBAR render failed",err);try{if(recorder.state!=="inactive")recorder.stop()}catch(_){}setStatus("رندر ناموفق بود: "+(err&&err.message?err.message:"خطای ناشناخته"))}
 finally{stream.getTracks().forEach(t=>t.stop());rendering=false;$("renderButton").disabled=!productImage;$("previewButton").disabled=!productImage}
}
uploadButton.addEventListener("click",()=>fileInput.click());
fileInput.addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];if(f)loadProduct(f);fileInput.value=""});
$("removeFile").addEventListener("click",()=>{
 stopPreview();clearDownload();if(productUrl)URL.revokeObjectURL(productUrl);productUrl="";productImage=null;file=null;
 $("fileInfo").hidden=true;$("fileState").textContent="در انتظار PNG";$("emptyPreview").hidden=false;$("previewButton").disabled=true;$("renderButton").disabled=true;$("previewState").textContent="آماده نیست";ctx.clearRect(0,0,previewCanvas.width,previewCanvas.height);setStatus("برای شروع، تصویر PNG را انتخاب کن.");$("alphaNote").textContent="تصویر اصلی بدون تغییر نگه داشته می‌شود.";
});
$("previewButton").addEventListener("click",()=>{if(previewRunning){stopPreview();$("previewState").textContent="متوقف شد"}else startPreview()});
$("ratio").addEventListener("change",e=>{ratio=e.target.value;resizePreview()});
$("quality").addEventListener("change",e=>quality=Number(e.target.value)||1080);
$("duration").addEventListener("input",e=>{duration=Number(e.target.value)||8;$("durationValue").textContent=String(duration);$("previewTime").textContent=duration+" ثانیه"});
$("renderButton").addEventListener("click",renderVideo);
$("previewTime").textContent=duration+" ثانیه";
resizePreview();
window.addEventListener("pagehide",()=>{stopPreview();if(productUrl)URL.revokeObjectURL(productUrl);if(downloadUrl)URL.revokeObjectURL(downloadUrl)});
})();