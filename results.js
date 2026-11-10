/* FileForge 1.6 — Results shelf with optional device-only saved copies.
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
  const view = {query:'',kind:'all',saved:'all',order:'newest'};
  let exportingSaved = false;
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
      storageHelp:'Защитата на данните в Settings може да намали риска от автоматично изчистване, но не е гаранция. При изчистване на данните на Chrome, запазените тук копия може да изчезнат.',
      exportSaved:'↓ ZIP на запазените', exportBusy:'Подготвям ZIP…', exportDone:'ZIP архивът е готов в Downloads. Запази го и извън FileForge.', exportError:'Не успях да създам ZIP. Можеш да изтеглиш файловете поотделно.',
      searchLabel:'Търси по име', searchPlaceholder:'Например: документ.pdf', kindLabel:'Формат', savedLabel:'Съхранение', sortLabel:'Подреди',
      allKinds:'Всички формати', allStorage:'Всички файлове', onlySaved:'Само запазени', onlyTemporary:'Само временни',
      newest:'Най-нови', oldest:'Най-стари', nameAZ:'По име (А–Я)', sizeBig:'Най-големи', clearFilters:'Изчисти филтрите',
      matching:'Показани', noMatches:'Няма резултати за избраните филтри. Изчисти филтрите, за да видиш всички файлове.',
      kindImage:'Снимки', kindPdf:'PDF', kindZip:'ZIP', kindBatch:'Batch', kindAudio:'Аудио', kindVideo:'Видео', kindDownload:'Downloads',
      filterPanel:'Филтри на готовите файлове'
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
      storageHelp:'Storage protection in Settings can help against eviction but is not guaranteed. Clearing Chrome site data may delete these local copies.',
      exportSaved:'↓ Export saved as ZIP', exportBusy:'Preparing ZIP…', exportDone:'ZIP is ready in Downloads. Keep a copy outside FileForge.', exportError:'Could not create ZIP. You can download each file separately.',
      searchLabel:'Search filename', searchPlaceholder:'For example: document.pdf', kindLabel:'File type', savedLabel:'Storage', sortLabel:'Sort',
      allKinds:'All types', allStorage:'All files', onlySaved:'Saved only', onlyTemporary:'Temporary only',
      newest:'Newest first', oldest:'Oldest first', nameAZ:'Name A–Z', sizeBig:'Largest first', clearFilters:'Clear filters',
      matching:'Shown', noMatches:'No files match these filters. Clear filters to see every file.',
      kindImage:'Images', kindPdf:'PDF', kindZip:'ZIP', kindBatch:'Batch', kindAudio:'Audio', kindVideo:'Video', kindDownload:'Downloads',
      filterPanel:'Ready file filters'
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
  const kindOptions=[['all','allKinds'],['image','kindImage'],['pdf','kindPdf'],['zip','kindZip'],['batch','kindBatch'],['audio','kindAudio'],['video','kindVideo'],['download','kindDownload']];
  const savedOptions=[['all','allStorage'],['saved','onlySaved'],['temporary','onlyTemporary']];
  const sortOptions=[['newest','newest'],['oldest','oldest'],['name','nameAZ'],['size','sizeBig']];
  function visibleItems(){
    const query=view.query.trim().toLocaleLowerCase();
    const filtered=items.filter(item=>(!query||item.name.toLocaleLowerCase().includes(query)) &&
      (view.kind==='all'||kindFrom(item.kind,item.blob,item.name)===view.kind) &&
      (view.saved==='all'||(view.saved==='saved'?item.saved:!item.saved)));
    filtered.sort((a,b)=>{
      if(view.order==='oldest')return a.time-b.time;
      if(view.order==='name')return a.name.localeCompare(b.name,lang()==='bg'?'bg':'en',{sensitivity:'base'});
      if(view.order==='size')return b.blob.size-a.blob.size||b.time-a.time;
      return b.time-a.time;
    });
    return filtered;
  }
  function createFilters(){
    const page=$('page-results');
    const list=$('resultsList');
    if(!page||!list||$('ffResultsFilters'))return;
    const style=document.createElement('style');style.id='ffResultsFilterStyle';
    style.textContent=`
      .ff-result-filters{background:var(--surface,rgba(127,127,127,.07));border:1px solid rgba(127,127,127,.22);border-radius:16px;padding:13px;margin:14px 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
      .ff-result-filters label{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:.8rem;font-weight:650}
      .ff-result-filters input,.ff-result-filters select{width:100%;min-width:0;min-height:44px;padding:10px 11px;color:inherit;background:var(--card,rgba(127,127,127,.08));border:1px solid rgba(127,127,127,.35);border-radius:11px;font:inherit;font-size:16px}
      .ff-result-filters input:focus-visible,.ff-result-filters select:focus-visible{outline:2px solid #40b99d;outline-offset:2px}
      .ff-result-filters .ff-result-search{grid-column:1/-1}
      .ff-result-filter-footer{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
      .ff-result-filter-footer small{color:inherit;opacity:.75}
      .ff-result-filters button{min-height:42px}
      .ff-result-filter-empty{padding:18px;margin:0 0 12px;border:1px dashed rgba(127,127,127,.34);border-radius:13px;text-align:center;opacity:.85}
      @media(min-width:760px){.ff-result-filters{grid-template-columns:minmax(190px,2fr) repeat(3,minmax(130px,1fr))}.ff-result-filters .ff-result-search{grid-column:auto}}`;
    document.head.append(style);
    const panel=document.createElement('section');panel.id='ffResultsFilters';panel.className='ff-result-filters';panel.setAttribute('aria-label',t('filterPanel'));
    function field(key,id,tag,options){
      const label=document.createElement('label');label.htmlFor=id;label.dataset.ffResultFilterLabel=key;
      const span=document.createElement('span');span.textContent=t(key);
      const input=document.createElement(tag);input.id=id;
      if(tag==='input'){input.type='search';input.autocomplete='off';input.placeholder=t('searchPlaceholder');input.value=view.query;
        input.addEventListener('input',()=>{view.query=input.value;render();});}
      else{
        for(const [value,k] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=t(k);opt.dataset.ffResultOption=k;input.append(opt);}
        input.value=key==='kindLabel'?view.kind:key==='savedLabel'?view.saved:view.order;
        input.addEventListener('change',()=>{if(key==='kindLabel')view.kind=input.value;else if(key==='savedLabel')view.saved=input.value;else view.order=input.value;render();});
      }
      label.append(span,input);if(key==='searchLabel')label.className='ff-result-search';return label;
    }
    panel.append(field('searchLabel','ffResultsSearch','input'),field('kindLabel','ffResultsKind','select',kindOptions),field('savedLabel','ffResultsSaved','select',savedOptions),field('sortLabel','ffResultsSort','select',sortOptions));
    const footer=document.createElement('div');footer.className='ff-result-filter-footer';
    const count=document.createElement('small');count.id='ffResultsVisible';count.setAttribute('aria-live','polite');
    const clear=button(t('clearFilters'),()=>{
      view.query='';view.kind='all';view.saved='all';view.order='newest';
      $('ffResultsSearch').value='';$('ffResultsKind').value='all';$('ffResultsSaved').value='all';$('ffResultsSort').value='newest';
      render();
    });clear.id='ffResultsReset';
    footer.append(count,clear);panel.append(footer);
    const empty=document.createElement('p');empty.id='ffResultsNoMatches';empty.className='ff-result-filter-empty';empty.hidden=true;empty.textContent=t('noMatches');
    page.insertBefore(panel,list);page.insertBefore(empty,list);
  }
  async function exportSavedZip(){
    if(exportingSaved||pendingSaves.size||loading)return;
    const selected=savedItems();
    if(!selected.length)return;
    if(typeof window.JSZip!=='function'){status(t('exportError'));return;}
    exportingSaved=true;render();status(t('exportBusy'));
    try{
      const archive=new window.JSZip();
      for(let i=0;i<selected.length;i++){
        const item=selected[i];
        const safe=item.name.replace(/[\/\\\x00-\x1f]/g,'_');
        // Sequential reads bound memory and prevent untrusted archive paths.
        archive.file(String(i+1).padStart(2,'0')+'_'+safe,new Uint8Array(await item.blob.arrayBuffer()));
      }
      const blob=await archive.generateAsync({type:'blob',compression:'STORE',streamFiles:true});
      download({blob,name:'FileForge-saved-results.zip'});
      status(t('exportDone'));
    }catch(error){console.warn('FileForge export saved ZIP:',error);status(t('exportError'));}
    finally{exportingSaved=false;render();}
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
    const shown=visibleItems();
    if(selectedId && !shown.some(item=>item.id===selectedId)){selectedId=null;removePreview();}
    const shownCount=$('ffResultsVisible');if(shownCount)shownCount.textContent=`${t('matching')}: ${shown.length}/${items.length}`;
    const noMatches=$('ffResultsNoMatches');if(noMatches)noMatches.hidden=loading||!items.length||shown.length>0;
    const clearFilters=$('ffResultsReset');if(clearFilters)clearFilters.disabled=!view.query && view.kind==='all' && view.saved==='all' && view.order==='newest';
    $('resultsCount').textContent=`${items.length} ${t('count')} · ${size(itemBytes())} · ${t('savedCount')}: ${saved.length}/${MAX_SAVED_ITEMS} (${size(savedBytes())}/${size(MAX_SAVED_TOTAL)})`;
    $('resultsClear').disabled=!items.some(item=>!item.saved);
    $('resultsEmpty').hidden=items.length!==0||loading;
    $('resultsSkipped').hidden=!skipped;
    const preview=$('resultsPreview');if(!selectedId&&preview)preview.hidden=true;
    const allDelete=$('ffSavedDeleteAll');if(allDelete)allDelete.disabled=!saved.length||loading||exportingSaved||pendingSaves.size>0;
    const exportButton=$('ffSavedExport');if(exportButton)exportButton.disabled=!saved.length||loading||exportingSaved||pendingSaves.size>0;
    const shelfStatus=$('ffSavedStatus');if(shelfStatus)shelfStatus.textContent=loading?t('loading'):`${t('savedCount')}: ${saved.length}/${MAX_SAVED_ITEMS} · ${size(savedBytes())}/${size(MAX_SAVED_TOTAL)}`;
    root.replaceChildren();
    for(const item of shown){
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
    const exportButton=button(t('exportSaved'),exportSavedZip);exportButton.id='ffSavedExport';
    const deleteButton=button(t('removeAllSaved'),clearSaved);deleteButton.id='ffSavedDeleteAll';
    controls.append(statusText,exportButton,deleteButton);
    const help=document.createElement('p');help.id='ffSavedHelp';help.className='pdf-help';help.style.margin='0 0 12px';help.textContent=t('storageHelp');
    const list=$('resultsList');page.insertBefore(controls,list);page.insertBefore(help,list);
  }
  function translate(){
    document.querySelectorAll('[data-results-i18n]').forEach(el=>{
      const key=el.dataset.resultsI18n;
      if(strings[lang()][key])el.textContent=t(key);
    });
    const deleteButton=$('ffSavedDeleteAll');if(deleteButton)deleteButton.textContent=t('removeAllSaved');
    const exportButton=$('ffSavedExport');if(exportButton)exportButton.textContent=t('exportSaved');
    const panel=$('ffResultsFilters');if(panel)panel.setAttribute('aria-label',t('filterPanel'));
    document.querySelectorAll('[data-ff-result-filter-label]').forEach(label=>{
      const key=label.dataset.ffResultFilterLabel;label.querySelector('span').textContent=t(key);
    });
    document.querySelectorAll('[data-ff-result-option]').forEach(option=>{option.textContent=t(option.dataset.ffResultOption);});
    const search=$('ffResultsSearch');if(search)search.placeholder=t('searchPlaceholder');
    const reset=$('ffResultsReset');if(reset)reset.textContent=t('clearFilters');
    const noMatches=$('ffResultsNoMatches');if(noMatches)noMatches.textContent=t('noMatches');
    const help=$('ffSavedHelp');if(help)help.textContent=t('storageHelp');
    render();
  }
  function markVersion(){
    // The host PWA stays intact: this upgrade replaces only the Results, Health and SW modules.
    document.title='FileForge 1.6';
    const brand=document.querySelector('.brand-name small');if(brand)brand.textContent='1.6';
    const versionRow=document.querySelector('[data-i18n="version"]')?.closest('.setting-row');
    if(versionRow){const label=versionRow.querySelector('small');const value=versionRow.querySelector(':scope > span');
      if(label)label.textContent='FileForge 1.6.0 · PWA';if(value)value.textContent='1.6.0';}
    const footer=document.querySelector('.footer');
    if(footer?.firstChild?.nodeType===Node.TEXT_NODE)footer.firstChild.textContent='FileForge 1.6 ';
    try{
      if(typeof I18N!=='undefined'){
        I18N.bg.heroPill=String(I18N.bg.heroPill).replace(/FILEFORGE 1\.[45]/i,'FILEFORGE 1.6');
        I18N.en.heroPill=String(I18N.en.heroPill).replace(/FILEFORGE 1\.[45]/i,'FILEFORGE 1.6');
      }
    }catch{/* Optional version badge; no functionality depends on it. */}
    const pill=document.querySelector('[data-i18n="heroPill"]');
    if(pill)pill.textContent=pill.textContent.replace(/FILEFORGE 1\.[45]/i,'FILEFORGE 1.6');
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
    ensureControls();createFilters();markVersion();
    $('resultsClear')?.addEventListener('click',clearTemporary);
    $('resultsHome')?.addEventListener('click',()=>window.FileForgeOpenResults?.());
    $('resultsTools')?.addEventListener('click',()=>window.FileForgeOpenResults?.());
    translate();restoreSaved();
  });
})();
