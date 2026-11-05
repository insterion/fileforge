// FileForge 1.1.0. Strict app-shell cache; never cache user-shared URLs.
const VERSION='1.1.0';
const CACHE='fileforge-shell-'+VERSION;
const FILES=[
  './','./index.html','./styles.css','./app.js','./pdf-studio.js','./archive-studio.js',
  './jszip.min.js','./library.js','./batch-studio.js','./audio-studio.js',
  './video-studio.js','./downloads-studio.js','./health.js','./manifest.webmanifest',
  './icon-192.png','./icon-512.png'
];
const APP_FILES=new Set(FILES.filter(x=>x!=='./').map(x=>x.slice(2)));
const SCOPE=new URL(self.registration.scope);
const PDF_LIB='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(FILES);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(n=>n.startsWith('fileforge-shell-')&&n!==CACHE).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.href===PDF_LIB){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(PDF_LIB);
      if(cached)return cached;
      try{
        const response=await fetch(req);
        if(response.ok)await cache.put(PDF_LIB,response.clone());
        return response;
      }catch{return Response.error();}
    })());
    return;
  }
  if(url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
  const name=url.pathname.slice(SCOPE.pathname.length);
  if(req.mode==='navigate'){
    // A received Android share URL may contain sensitive query parameters.
    // Do not put that URL or those parameters in Cache Storage.
    event.respondWith((async()=>{
      try{return await fetch(req);}
      catch{
        const cache=await caches.open(CACHE);
        return await cache.match('./index.html')||Response.error();
      }
    })());
    return;
  }
  if(!APP_FILES.has(name))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(req);
      if(response.ok&&response.type==='basic')await cache.put(req,response.clone());
      return response;
    }catch{
      return await cache.match(req,{ignoreSearch:true})||Response.error();
    }
  })());
});
