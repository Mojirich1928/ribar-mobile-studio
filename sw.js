const CACHE="ribar-studio-v20";
const ASSETS=["./","./index.html","./styles.css?v=20","./app.js?v=20","./manifest.webmanifest","./assets/icon.svg"];
self.addEventListener("install",e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(ASSETS);await self.skipWaiting()})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url),shell=u.pathname.endsWith("/")||u.pathname.endsWith("/index.html")||u.pathname.endsWith("/app.js")||u.pathname.endsWith("/styles.css")||u.pathname.endsWith("/sw.js");
 if(shell){e.respondWith((async()=>{try{const r=await fetch(e.request,{cache:"no-store"});if(r.ok){const c=await caches.open(CACHE);await c.put(e.request,r.clone())}return r}catch(err){return(await caches.match(e.request))||(await caches.match("./index.html"))}})());return}
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(response=>{if(response.ok)caches.open(CACHE).then(c=>c.put(e.request,response.clone()));return response}).catch(()=>caches.match("./index.html"))));
});