'use strict';
/* FileForge 1.2 — local PWA health, updates and storage safety.
   Never reads personal file content, upload URLs or history entries. */
(() => {
  const VERSION='1.4.0';
  const CACHE='fileforge-shell-'+VERSION;
  const SHELL=['index.html','styles.css','app.js','pdf-studio.js','archive-studio.js','jszip.min.js',
    'library.js','batch-studio.js','audio-studio.js','video-studio.js','downloads-studio.js',
    'health.js','file-desk.js','results.js','manifest.webmanifest','icon-192.png','icon-512.png'];
  const $=id=>document.getElementById(id);
  const dictionary={
    bg:{healthTitle:'🔧 Състояние и поддръжка',healthDesc:'Offline проверка, актуализации и локални данни — само от телефона.',
      connectLabel:'Връзка',offlineLabel:'Offline файлове',storageLabel:'Памет на сайта',protectLabel:'Защита на данните',
      check:'Провери състоянието',update:'Провери за обновяване',persist:'Защити локалните данни',backup:'Изтегли JSON Backup',copy:'Копирай диагностика',reload:'Презареди новата версия',
      healthNote:'Backup пази история и любими, но не самите файлове. Защитата на данните зависи от Chrome и не замества Backup. PDF библиотеката може да изисква интернет при първо използване.',
      online:'Онлайн',offline:'Без интернет',yes:'Разрешена',no:'Стандартна',unsupported:'Не се поддържа',unknown:'Неизвестно',checking:'Проверка…',
      cacheMissing:'Няма пълен offline кеш',cacheReady:'Готови',storageApprox:'приблизително',
      checkDone:'Проверката приключи.',updateChecking:'Проверявам за по-нова версия…',updateChecked:'Проверено. Ако има нова версия, бутонът за презареждане ще се появи.',
      updateReady:'Налична е нова версия. Запази резултатите си, след което натисни „Презареди“.',
      updateUnavailable:'Няма активен Service Worker за проверка.',updateError:'Проверката за обновяване не успя. Опитай при включен интернет.',
      persistGranted:'Chrome разреши устойчиво съхранение. JSON Backup все пак е препоръчителен.',
      persistDenied:'Chrome не разреши допълнителна защита. Данните остават на устройството; прави JSON Backup.',
      persistUnsupported:'Браузърът не предлага тази функция. Използвай JSON Backup.',
      copyDone:'Диагностиката е копирана (без лични имена или файлове).',copyUnavailable:'Копирането не е разрешено. Показвам кратък отчет за ръчно копиране.',
      backupMissing:'Отвори History, за да създадеш JSON Backup.',refreshing:'Проверявам…'},
    en:{healthTitle:'🔧 Health & maintenance',healthDesc:'Check offline availability, updates and storage from your phone.',
      connectLabel:'Connection',offlineLabel:'Offline files',storageLabel:'Site storage',protectLabel:'Storage protection',
      check:'Check status',update:'Check for updates',persist:'Protect local data',backup:'Download JSON Backup',copy:'Copy diagnostics',reload:'Reload new version',
      healthNote:'Backup includes history and favourites, not the actual files. Storage protection depends on Chrome and does not replace backups. The PDF library may need internet on first use.',
      online:'Online',offline:'Offline',yes:'Granted',no:'Standard',unsupported:'Unsupported',unknown:'Unknown',checking:'Checking…',
      cacheMissing:'Offline cache incomplete',cacheReady:'Ready',storageApprox:'approximately',
      checkDone:'Status check complete.',updateChecking:'Checking for a newer version…',updateChecked:'Checked. If an update is available, a reload button will appear.',
      updateReady:'A new version is ready. Save your results, then tap Reload.',
      updateUnavailable:'No active service worker to check.',updateError:'Could not check for updates. Try again with internet access.',
      persistGranted:'Chrome granted persistent storage. JSON backups are still recommended.',
      persistDenied:'Chrome did not grant extra protection. Keep a JSON backup.',
      persistUnsupported:'Your browser does not support this option. Use JSON Backup.',
      copyDone:'Diagnostics copied (no private filenames or files).',copyUnavailable:'Clipboard permission denied. Showing a report for manual copying.',
      backupMissing:'Open History to create a JSON backup.',refreshing:'Checking…'}
  };
  const language=()=>window.FileForgeLanguage?.()==='en'?'en':'bg';
  const t=key=>dictionary[language()][key]||key;
  const data={online:navigator.onLine,offlineCount:null,usage:null,quota:null,persisted:null,
    worker:false,manifest:false,updateReady:false};
  let hadController=Boolean(navigator.serviceWorker?.controller);
  const setMessage=msg=>{if($('ffHealthMessage'))$('ffHealthMessage').textContent=msg;};
  const fmt=n=>Number.isFinite(n)?n>=1048576?(n/1048576).toFixed(1)+' MB':Math.round(n/1024)+' KB':'—';

  function translate(){
    document.querySelectorAll('[data-health-i18n]').forEach(node=>{
      const val=dictionary[language()][node.dataset.healthI18n];
      if(val)node.textContent=val;
    });
    draw();
  }
  function draw(){
    if(!$('ffHealthConnection'))return;
    $('ffHealthConnection').textContent=data.online?t('online'):t('offline');
    $('ffHealthOffline').textContent=data.offlineCount===null?t('checking'):data.offlineCount===-1?t('unknown'):
      (data.offlineCount===SHELL.length?`${t('cacheReady')} (${SHELL.length}/${SHELL.length})`:
      `${data.offlineCount}/${SHELL.length} · ${t('cacheMissing')}`);
    $('ffHealthStorage').textContent=data.usage===null?t('unknown'):
      `${t('storageApprox')} ${fmt(data.usage)}`;
    $('ffHealthProtect').textContent=data.persisted===true?t('yes'):data.persisted===false?t('no'):t('unsupported');
    $('ffHealthReload').hidden=!data.updateReady;
  }
  async function refresh(){
    data.online=navigator.onLine;
    data.offlineCount=0;
    try {
      const cache=await caches.open(CACHE);
      for(const file of SHELL){
        const url=new URL(file,document.baseURI).href;
        if(await cache.match(url,{ignoreSearch:true}))data.offlineCount++;
      }
    }catch(e){console.warn('FileForge offline status:',e);data.offlineCount=-1;}
    if(navigator.storage?.estimate){
      try{const estimate=await navigator.storage.estimate();data.usage=estimate.usage??null;data.quota=estimate.quota??null;}catch{data.usage=null;}
    }
    if(navigator.storage?.persisted){
      try{data.persisted=await navigator.storage.persisted();}catch{data.persisted=null;}
    }
    if('serviceWorker' in navigator){
      try{const reg=await navigator.serviceWorker.getRegistration('./');data.worker=Boolean(reg?.active||navigator.serviceWorker.controller);}catch{data.worker=false;}
    }
    const link=document.querySelector('link[rel="manifest"]');data.manifest=Boolean(link);
    draw();
  }
  function newVersion(){
    // Never force reload while the user could be working on a file.
    data.updateReady=true;
    draw();setMessage(t('updateReady'));
  }
  async function checkUpdate(){
    setMessage(t('updateChecking'));
    try{
      if(!('serviceWorker' in navigator))throw Error('not supported');
      const reg=await navigator.serviceWorker.getRegistration('./');
      if(!reg){setMessage(t('updateUnavailable'));return;}
      $('ffHealthUpdate').disabled=true;
      await reg.update();
      if(reg.waiting)newVersion();
      else if(!data.updateReady)setMessage(t('updateChecked'));
      await refresh();
    }catch(err){console.warn('FileForge SW update:',err);setMessage(t('updateError'));}
    finally{$('ffHealthUpdate').disabled=false;}
  }
  async function persist(){
    if(!navigator.storage?.persist){setMessage(t('persistUnsupported'));return;}
    try{
      const granted=await navigator.storage.persist();
      await refresh();
      setMessage(t(granted?'persistGranted':'persistDenied'));
    }catch(error){console.warn('Persistent storage:',error);setMessage(t('persistDenied'));}
  }
  async function copyReport(){
    await refresh();
    // Technical data only. Never include URL query strings, names or local records.
    const report=[`FileForge ${VERSION}`,'PWA: '+(matchMedia('(display-mode: standalone)').matches?'yes':'no'),
      'Online: '+(data.online?'yes':'no'),'Service worker: '+(data.worker?'yes':'no'),
      `Offline shell: ${data.offlineCount??'?'} / ${SHELL.length}`,
      'Storage used (approx): '+fmt(data.usage),'Persistent storage: '+String(data.persisted),
      'Browser: '+(navigator.userAgent.includes('Android')?'Android':'Other')].join('\n');
    try{await navigator.clipboard.writeText(report);setMessage(t('copyDone'));}
    catch{setMessage(t('copyUnavailable'));window.prompt('FileForge diagnostics',report);}
  }
  function reload(){window.location.reload();}
  function backup(){
    const button=$('historyBackup');
    if(button)button.click();else setMessage(t('backupMissing'));
  }
  document.addEventListener('DOMContentLoaded',()=>{
    translate();refresh();
    $('ffHealthCheck').addEventListener('click',async()=>{setMessage(t('refreshing'));await refresh();setMessage(t('checkDone'));});
    $('ffHealthUpdate').addEventListener('click',checkUpdate);
    $('ffHealthPersist').addEventListener('click',persist);
    $('ffHealthBackup').addEventListener('click',backup);
    $('ffHealthCopy').addEventListener('click',copyReport);
    $('ffHealthReload').addEventListener('click',reload);
    window.addEventListener('online',refresh);
    window.addEventListener('offline',refresh);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    if('serviceWorker' in navigator){
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(hadController)newVersion();
        hadController=true;
        refresh();
      });
      navigator.serviceWorker.getRegistration('./').then(reg=>{
        if(!reg)return;
        if(reg.waiting)newVersion();
        reg.addEventListener('updatefound',()=>{
          const installing=reg.installing;
          installing?.addEventListener('statechange',()=>{
            if(installing.state==='installed'&&navigator.serviceWorker.controller)newVersion();
          });
        });
      }).catch(()=>{});
    }
  });
  window.FileForgeHealth={translate,refresh};
})();
