const CACHE="ribar-studio-v13";
const ASSETS=["./","./index.html","./styles.css?v=13","./app.js?v=13","./manifest.webmanifest","./assets/icon.svg"];
self.addEventListener("install",event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS);await self.skipWaiting()})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 const shell=url.pathname.endsWith("/")||url.pathname.endsWith("/index.html")||url.pathname.endsWith("/app.js")||url.pathname.endsWith("/styles.css")||url.pathname.endsWith("/sw.js");
 if(shell){event.respondWith((async()=>{try{const response=await fetch(event.request,{cache:"no-store"});if(response.ok){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone())}return response}catch(error){return (await caches.match(event.request))||(await caches.match("./index.html"))}})());return}
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match("./index.html"))))
});