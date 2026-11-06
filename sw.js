const CACHE="vanguard-fight-tool-v55-6-20261107";
const ASSETS=["./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener("message",event=>{
 if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting();
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith("vanguard-fight-tool-")&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==="navigate"){
  event.respondWith((async()=>{
   try{
    const response=await fetch(req,{cache:"no-store"});
    if(response.ok){const cache=await caches.open(CACHE);await cache.put("./index.html",response.clone())}
    return response;
   }catch(e){
    const cache=await caches.open(CACHE);
    return await cache.match("./index.html")||Response.error();
   }
  })());
  return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(req,{cache:"no-store"});
   if(response.ok&&new URL(req.url).pathname.startsWith(new URL("./",self.registration.scope).pathname))await cache.put(req,response.clone());
   return response;
  }catch(e){return await cache.match(req)||Response.error()}
 })());
});
