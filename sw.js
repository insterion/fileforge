// FileForge 1.6.0 — safe offline update from 1.4, no user files in Cache Storage.
const VERSION='1.6.0';
const CACHE='fileforge-shell-'+VERSION;
const FILES=[
  './','./index.html','./styles.css','./app.js','./pdf-studio.js','./archive-studio.js',
  './jszip.min.js','./library.js','./batch-studio.js','./audio-studio.js',
  './video-studio.js','./downloads-studio.js','./health.js','./file-desk.js',
  './results.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'
];
const APP_FILES=new Set(FILES.filter(x=>x!=='./').map(x=>x.slice(2)));
const SCOPE=new URL(self.registration.scope);
const PDF_LIB='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
const PDFJS_FILES=new Set([
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
]);
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // Explicitly refresh the shell rather than reusing stale v1.4 HTTP cached scripts.
    await Promise.all(FILES.map(async path=>{
      const response=await fetch(new Request(path,{cache:'reload'}));
      if(!response.ok)throw new Error('PWA cache failed: '+path+' ('+response.status+')');
      await cache.put(path,response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('fileforge-shell-')&&name!==CACHE).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.href===PDF_LIB||PDFJS_FILES.has(url.href)){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const saved=await cache.match(url.href);
      if(saved)return saved;
      try{
        const response=await fetch(req);
        if(response.ok||response.type==='opaque')await cache.put(url.href,response.clone());
        return response;
      }catch{return Response.error();}
    })());
    return;
  }
  if(url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
  const name=url.pathname.slice(SCOPE.pathname.length);
  if(req.mode==='navigate'){
    // Never cache a navigation with share URL query parameters.
    event.respondWith((async()=>{
      try{return await fetch(req);}catch{
        const cache=await caches.open(CACHE);
        return await cache.match('./index.html')||Response.error();
      }
    })());
    return;
  }
  if(!APP_FILES.has(name))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    // index.html in v1.4 references ?v=1.4.0. Serve the updated v1.6
    // Results and Health modules from the verified new shell regardless of query.
    if(name==='results.js'||name==='health.js'){
      const fresh=await cache.match('./'+name);
      if(fresh)return fresh;
    }
    try{
      const response=await fetch(req);
      if(response.ok&&response.type==='basic')await cache.put(req,response.clone());
      return response;
    }catch{
      return await cache.match(req,{ignoreSearch:true})||Response.error();
    }
  })());
});
