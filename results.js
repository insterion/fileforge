/* FileForge 1.5 — Results shelf with optional device-only saved copies.
   IMPORTANT: Outputs are session-only unless a user explicitly chooses Save locally.
   Saved copies live in a dedicated IndexedDB database, not in JSON History backups.
   No upload, analytics, account or network request is made by this module. */
'use strict';
(() => {
  const DB_NAME = 'fileforge-saved-results-v1';
  const DB_STORE = 'files';
  const DB_VERSION = 1;
  const MAX_ITEMS = 13;
  const MAX_SINGLE_SESSION = 64 * 1024 * 1024;
  const MAX_SESSION_TOTAL = 96 * 1024 * 1024;
  const MAX_SAVED_ITEMS = 5;
  const MAX_SAVED_SINGLE = 20 * 1024 * 1024;
  const MAX_SAVED_TOTAL = 40 * 1024 * 1024;
  const items = [];
  let selectedId = null;
  let previewUrl = null;
  let nextId = 1;
  let skipped = false;
  let storageAvailable = typeof indexedDB !== 'undefined';
  let dbPromise = null;
  let loading = true;
  const pendingSaves = new Set();
  const $ = id => document.getElementById(id);
  const lang = () => window.FileForgeLanguage?.() === 'en' ? 'en' : 'bg';
  const strings = {
    bg: {
      nav:'Готови', title:'Готови файлове', subtitle:'Преглед, изтегляне, споделяне и избрани локални копия.',
      homeTitle:'📂 Готови файлове', homeHelp:'Тук са последните резултати. Избери кои да останат след рестартиране.',
      open:'Отвори резултатите →', empty:'Все още няма готови файлове. Обработи снимка, PDF, ZIP, аудио или видео.',
      note:'Незапазените резултати са временни. Само файловете, за които натиснеш „Запази локално“, остават след презареждане. Съхраняват се единствено на това устройство, не се включват в JSON Backup. Изтегляй важните файлове и в Downloads.',
      count:'файла', preview:'Преглед', hide:'Скрий прегледа', download:'↓ Изтегли', share:'Сподели', remove:'Премахни', clear:'Изчисти временните',
      clearConfirm:'Да премахна ли временните резултати? Локално запазените ще останат.',
      noPreview:'За този формат няма вграден преглед. Можеш да го изтеглиш или споделиш.', openPdf:'Отвори PDF за преглед',
      noShare:'Android не предлага споделяне тук. Изтегли файла и избери Files → Share / Open with.',
      shareCancelled:'Споделянето е отменено.', shareFail:'Споделянето не успя. Използвай Изтегли → Android Files.',
      tooBig:'Някои големи резултати не са добавени, за да не се претоварва телефонът. Изтегли ги от съответния инструмент.',
      cleared:'Временните резултати са изчистени.', session:'Временно + запазено', of:'от',
      saveLocal:'Запази локално', removeLocal:'Спри запазването', savedTag:'Запазен локално', temporaryTag:'Временен',
      saveDone:'Файлът е запазен локално и ще се появява след презареждане.', unsaveDone:'Локално запазеното копие е премахнато.',
      saveFail:'Локалното запазване не успя. Изтегли файла във Files/Downloads.', dbError:'Локалната библиотека не е достъпна в този браузър.',
      saveLimit:'Лимит: максимум 5 запазени файла, до 20 MB всеки и 40 MB общо. Изтрий старо локално копие или изтегли резултата.',
      deleteConfirm:'Този файл е запазен локално. Да премахна ли и съхраненото копие?',
      deleted:'Файлът е премахнат.', loading:'Зареждам локално запазените файлове…',
      savedCount:'Локално запазени', removeAllSaved:'Изтрий запазените',
      clearSavedConfirm:'Сигурен ли си, че искаш да изтриеш ВСИЧКИ локално запазени файлове? Това не може да се възстанови от JSON Backup.',
      savedCleared:'Локално запазените файлове са изтрити. Вече изтеглените във Files остават.',
      storageHelp:'Защитата на данните в Settings може да намали риска от автоматично изчистване, но не е гаранция. При изчистване на данните на Chrome, запазените тук копия може да изчезнат.'
    },
    en: {
      nav:'Results', title:'Ready files', subtitle:'Preview, download, share and keep selected copies on this device.',
      homeTitle:'📂 Ready files', homeHelp:'Your recent outputs. Choose which should survive a restart.',
      open:'Open results →', empty:'No ready files yet. Process an image, PDF, ZIP, audio or video.',
      note:'Unsaved outputs are temporary. Only files you explicitly “Keep locally” remain after a reload. They stay on this device and are NOT part of JSON History Backup. Download important files to Downloads as well.',
      count:'files', preview:'Preview', hide:'Hide preview', download:'↓ Download', share:'Share', remove:'Remove', clear:'Clear temporary',
      clearConfirm:'Remove temporary outputs? Saved local copies will stay.',
      noPreview:'No built-in preview for this format. You can download or share it.', openPdf:'Open PDF preview',
      noShare:'Android cannot share this file here. Download it, then use Files → Share / Open with.',
      shareCancelled:'Sharing cancelled.', shareFail:'Sharing failed. Use Download → Android Files.',
      tooBig:'Some large results were not added to protect phone memory. Download them from the original tool.',
      cleared:'Temporary results cleared.', session:'Temporary + saved', of:'of',
      saveLocal:'Keep locally', removeLocal:'Unsave local copy', savedTag:'Saved on device', temporaryTag:'Temporary',
      saveDone:'Saved on this device. It will reappear after reloading.', unsaveDone:'Local saved copy removed.',
      saveFail:'Could not keep this file locally. Download it to Android Files/Downloads.', dbError:'The local results library is unavailable in this browser.',
      saveLimit:'Limit: 5 saved files, up to 20 MB each and 40 MB total. Remove an older saved copy or download the result.',
      deleteConfirm:'This file is saved locally. Also delete the saved copy?',
      deleted:'File removed.', loading:'Loading locally saved files…',
      savedCount:'Saved locally', removeAllSaved:'Delete saved files',
      clearSavedConfirm:'Permanently delete ALL files saved inside FileForge? JSON History Backup cannot restore them.',
      savedCleared:'Locally saved copies deleted. Files already downloaded to Android Files are unaffected.',
      storageHelp:'Storage protection in Settings can help against eviction but is not guaranteed. Clearing Chrome site data may delete these local copies.'
    }
  };
  const t = key => strings[lang()][key] || key;
  const size = n => n >= 1048576 ? (n/1048576).toFixed(1)+' MB' : n >= 1024 ? Math.round(n/1024)+' KB' : n+' B';
  const icon = kind => ({image:'🖼️',pdf:'📄',zip:'🗜️',batch:'🗃️',audio:'🎵',video:'🎬',download:'⬇️'})[kind]||'📁';
  const kindFrom = (kind, blob, name) => {
    if(kind && kind!=='download')return kind;
    const type=blob.type||'';const ext=name.split('.').pop()?.toLowerCase();
    if(type.startsWith('image/')||['png','jpg','jpeg','webp'].includes(ext))return 'image';
    if(type==='application/pdf'||ext==='pdf')return 'pdf';
    if(type==='application/zip'||ext==='zip')return 'zip';
    if(type.startsWith('audio/')||['mp3','wav','m4a'].includes(ext))return 'audio';
    if(type.startsWith('video/')||['mp4','webm','mov'].includes(ext))return 'video';
    return kind||'download';
  };
  function newId(){return typeof crypto!=='undefined' && typeof crypto.randomUUID==='function' ? crypto.randomUUID() : String(Date.now())+'-'+String(nextId++);}
  function dbOpen(){
    if(!storageAvailable)return Promise.reject(new Error('IndexedDB unavailable'));
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      let req;
      try{req=indexedDB.open(DB_NAME,DB_VERSION);}catch(e){reject(e);return;}
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(DB_STORE))req.result.createObjectStore(DB_STORE,{keyPath:'id'});};
      req.onsuccess=()=>{req.result.onversionchange=()=>{req.result.close();dbPromise=null;};resolve(req.result);};
      req.onerror=()=>reject(req.error||Error('Open failed'));
      req.onblocked=()=>reject(Error('Database blocked'));
    }).catch(err=>{dbPromise=null;storageAvailable=false;throw err;});
    return dbPromise;
  }
  async function dbReadAll(){
    const db=await dbOpen();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readonly');
      const req=tx.objectStore(DB_STORE).getAll();
      req.onsuccess=()=>resolve(req.result||[]);
      req.onerror=()=>reject(req.error);
      tx.onabort=()=>reject(tx.error||Error('Read aborted'));
    });
  }
  async function dbWrite(record,action='put'){
    const db=await dbOpen();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readwrite');
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>reject(tx.error||Error('Write failed'));
      tx.onabort=()=>reject(tx.error||Error('Write aborted'));
      try {if(action==='delete')tx.objectStore(DB_STORE).delete(record);else if(action==='clear')tx.objectStore(DB_STORE).clear();else tx.objectStore(DB_STORE).put(record);}
      catch(error){reject(error);}
    });
  }
  function removePreview(){
    const box=$('resultsPreview');
    if(box){box.querySelectorAll('audio,video').forEach(el=>{el.pause();el.removeAttribute('src');el.load();});box.replaceChildren();box.hidden=true;}
    if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
  }
  const savedItems=()=>items.filter(item=>item.saved);
  const savedBytes=()=>savedItems().reduce((total,item)=>total+item.blob.size,0);
  const itemBytes=()=>items.reduce((total,item)=>total+item.blob.size,0);
  function removeOldTemporary(){
    const index=items.findLastIndex(item=>!item.saved);
    if(index<0)return false;
    const [old]=items.splice(index,1);
    if(selectedId===old.id){selectedId=null;removePreview();}
    return true;
  }
  function add({blob,name,kind}={}){
    if(!(blob instanceof Blob)||!blob.size)return false;
    if(blob.size>MAX_SINGLE_SESSION||blob.size>MAX_SESSION_TOTAL){skipped=true;render();return false;}
    const clean=String(name||'file').replace(/[\\/\x00-\x1f]/g,'_').slice(0,160).trim()||'file';
    while(items.length>=MAX_ITEMS||itemBytes()+blob.size>MAX_SESSION_TOTAL){
      if(!removeOldTemporary()){skipped=true;render();return false;}
    }
    items.unshift({id:newId(),blob,name:clean,kind:kindFrom(kind,blob,clean),time:Date.now(),saved:false});
    render();return true;
  }
  function showPreview(item){
    if(selectedId===item.id){selectedId=null;removePreview();render();return;}
    removePreview();selectedId=item.id;
    const box=$('resultsPreview');if(!box)return;
    const kind=kindFrom(item.kind,item.blob,item.name);
    previewUrl=URL.createObjectURL(item.blob);
    let element;
    if(kind==='image'){
      element=document.createElement('img');element.src=previewUrl;element.alt=item.name;element.className='ff-result-img';
    } else if(kind==='audio'||kind==='video'){
      element=document.createElement(kind==='audio'?'audio':'video');element.controls=true;element.preload='metadata';element.src=previewUrl;element.playsInline=true;element.className='ff-result-media';
    } else if(kind==='pdf'){
      element=document.createElement('a');element.href=previewUrl;element.target='_blank';element.rel='noopener noreferrer';element.className='secondary-button';element.textContent=t('openPdf');
    } else {element=document.createElement('p');element.className='pdf-help';element.textContent=t('noPreview');}
    box.append(element);box.hidden=false;render();
  }
  function download(item){
    const url=URL.createObjectURL(item.blob);
    const link=document.createElement('a');link.href=url;link.download=item.name;link.hidden=true;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  function share(item){
    if(typeof navigator.share!=='function'||typeof navigator.canShare!=='function'||typeof File!=='function'){status(t('noShare'));return;}
    const file=new File([item.blob],item.name,{type:item.blob.type||'application/octet-stream'});
    if(!navigator.canShare({files:[file]})){status(t('noShare'));return;}
    navigator.share({files:[file],title:item.name}).catch(error=>status(error?.name==='AbortError'?t('shareCancelled'):t('shareFail')));
  }
  const status=message=>{const box=$('resultsStatus');if(box)box.textContent=message;};
  async function saveLocally(item){
    if(loading||pendingSaves.has(item.id))return;
    if(!storageAvailable){status(t('dbError'));return;}
    if(!item.saved && (item.blob.size>MAX_SAVED_SINGLE||savedItems().length>=MAX_SAVED_ITEMS||savedBytes()+item.blob.size>MAX_SAVED_TOTAL)){
      status(t('saveLimit'));return;
    }
    pendingSaves.add(item.id);render();
    try{
      if(!item.saved){
        await dbWrite({id:item.id,blob:item.blob,name:item.name,kind:item.kind,time:item.time});
        item.saved=true;status(t('saveDone'));
      }else{
        await dbWrite(item.id,'delete');item.saved=false;status(t('unsaveDone'));
      }
    }catch(error){console.warn('FileForge local save:',error);status(t('saveFail'));}
    finally{pendingSaves.delete(item.id);render();}
  }
  async function dropById(id){
    const at=items.findIndex(item=>item.id===id);
    if(at<0)return;
    const item=items[at];
    if(item.saved){
      if(!confirm(t('deleteConfirm')))return;
      try{await dbWrite(item.id,'delete');}catch(error){console.warn(error);status(t('saveFail'));return;}
    }
    items.splice(at,1);
    if(selectedId===id){selectedId=null;removePreview();}
    render();status(t('deleted'));
  }
  function button(label,callback,cls='secondary-button'){
    const el=document.createElement('button');el.type='button';el.className=cls;el.textContent=label;el.addEventListener('click',callback);return el;
  }
  function render(){
    const root=$('resultsList');if(!root)return;
    const saved=savedItems();
    $('resultsCount').textContent=`${items.length} ${t('count')} · ${size(itemBytes())} · ${t('savedCount')}: ${saved.length}/${MAX_SAVED_ITEMS} (${size(savedBytes())}/${size(MAX_SAVED_TOTAL)})`;
    $('resultsClear').disabled=!items.some(item=>!item.saved);
    $('resultsEmpty').hidden=items.length!==0||loading;
    $('resultsSkipped').hidden=!skipped;
    const preview=$('resultsPreview');if(!selectedId&&preview)preview.hidden=true;
    const allDelete=$('ffSavedDeleteAll');if(allDelete)allDelete.disabled=!saved.length||loading;
    const shelfStatus=$('ffSavedStatus');if(shelfStatus)shelfStatus.textContent=loading?t('loading'):`${t('savedCount')}: ${saved.length}/${MAX_SAVED_ITEMS} · ${size(savedBytes())}/${size(MAX_SAVED_TOTAL)}`;
    root.replaceChildren();
    for(const item of items){
      const row=document.createElement('article');row.className='ff-result-row';
      const img=document.createElement('span');img.className='ff-result-icon';img.textContent=icon(item.kind);
      const content=document.createElement('div');content.className='ff-result-content';
      const name=document.createElement('strong');name.textContent=item.name;
      const meta=document.createElement('small');
      meta.textContent=`${size(item.blob.size)} · ${new Date(item.time).toLocaleTimeString(lang()==='bg'?'bg-BG':'en-GB',{hour:'2-digit',minute:'2-digit'})} · ${t(item.saved?'savedTag':'temporaryTag')}`;
      const actions=document.createElement('div');actions.className='ff-result-actions';
      actions.append(button(selectedId===item.id?t('hide'):t('preview'),()=>showPreview(item)));
      actions.append(button(t('download'),()=>download(item),'primary-button'));
      actions.append(button(t('share'),()=>share(item)));
      const save=button(t(item.saved?'removeLocal':'saveLocal'),()=>saveLocally(item));
      save.disabled=loading||pendingSaves.has(item.id)||(!storageAvailable&&!item.saved);actions.append(save);
      actions.append(button(t('remove'),()=>dropById(item.id)));
      content.append(name,meta,actions);row.append(img,content);root.append(row);
    }
  }
  function clearTemporary(){
    if(!items.some(item=>!item.saved))return;
    if(!confirm(t('clearConfirm')))return;
    const kept=items.filter(item=>item.saved);
    items.splice(0,items.length,...kept);skipped=false;
    if(!items.some(item=>item.id===selectedId)){selectedId=null;removePreview();}
    render();status(t('cleared'));
  }
  async function clearSaved(){
    if(!savedItems().length)return;
    if(!confirm(t('clearSavedConfirm')))return;
    try{
      await dbWrite(undefined,'clear');
      for(const item of items)item.saved=false;
      render();status(t('savedCleared'));
    }catch(error){console.warn('FileForge clear saved:',error);status(t('saveFail'));}
  }
  function ensureControls(){
    const page=$('page-results');if(!page||$('ffSavedControls'))return;
    const controls=document.createElement('div');controls.id='ffSavedControls';
    controls.style.cssText='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:12px 0;';
    const statusText=document.createElement('strong');statusText.id='ffSavedStatus';statusText.style.fontSize='0.9rem';
    const deleteButton=button(t('removeAllSaved'),clearSaved);deleteButton.id='ffSavedDeleteAll';
    controls.append(statusText,deleteButton);
    const help=document.createElement('p');help.id='ffSavedHelp';help.className='pdf-help';help.style.margin='0 0 12px';help.textContent=t('storageHelp');
    const list=$('resultsList');page.insertBefore(controls,list);page.insertBefore(help,list);
  }
  function translate(){
    document.querySelectorAll('[data-results-i18n]').forEach(el=>{
      const key=el.dataset.resultsI18n;
      if(strings[lang()][key])el.textContent=t(key);
    });
    const deleteButton=$('ffSavedDeleteAll');if(deleteButton)deleteButton.textContent=t('removeAllSaved');
    const help=$('ffSavedHelp');if(help)help.textContent=t('storageHelp');
    render();
  }
  function markVersion(){
    // The host PWA (1.4) deliberately stays intact: this upgrade replaces only the Results module.
    document.title='FileForge 1.5';
    const brand=document.querySelector('.brand-name small');if(brand)brand.textContent='1.5';
    const versionRow=document.querySelector('[data-i18n="version"]')?.closest('.setting-row');
    if(versionRow){const label=versionRow.querySelector('small');const value=versionRow.querySelector(':scope > span');
      if(label)label.textContent='FileForge 1.5.0 · PWA';if(value)value.textContent='1.5.0';}
    const footer=document.querySelector('.footer');
    if(footer?.firstChild?.nodeType===Node.TEXT_NODE)footer.firstChild.textContent='FileForge 1.5 ';
    try{
      if(typeof I18N!=='undefined'){
        I18N.bg.heroPill=String(I18N.bg.heroPill).replace(/FILEFORGE 1\.4/i,'FILEFORGE 1.5');
        I18N.en.heroPill=String(I18N.en.heroPill).replace(/FILEFORGE 1\.4/i,'FILEFORGE 1.5');
      }
    }catch{/* Optional version badge; no functionality depends on it. */}
    const pill=document.querySelector('[data-i18n="heroPill"]');
    if(pill)pill.textContent=pill.textContent.replace(/FILEFORGE 1\.4/i,'FILEFORGE 1.5');
  }
  async function restoreSaved(){
    try{
      const saved=await dbReadAll();
      saved.filter(x=>x&&typeof x.id==='string'&&x.blob instanceof Blob&&x.blob.size>0)
        .sort((a,b)=>b.time-a.time).slice(0,MAX_SAVED_ITEMS).forEach(x=>{
          if(!items.some(item=>item.id===x.id))items.push({...x,saved:true});
        });
    }catch(error){console.warn('FileForge saved results unavailable:',error);storageAvailable=false;status(t('dbError'));}
    finally{loading=false;render();}
  }
  window.FileForgeResults={add,translate,itemsCount:()=>items.length};
  document.addEventListener('DOMContentLoaded',()=>{
    ensureControls();markVersion();
    $('resultsClear')?.addEventListener('click',clearTemporary);
    $('resultsHome')?.addEventListener('click',()=>window.FileForgeOpenResults?.());
    $('resultsTools')?.addEventListener('click',()=>window.FileForgeOpenResults?.());
    translate();restoreSaved();
  });
})();
