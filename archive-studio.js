'use strict';
// FileForge 0.4 — ZIP creation, inspection, and extraction in the browser.
// JSZip 3.10.1 is hosted in this same repository for reliable PWA offline use.
// Original file bytes are not written to localStorage, IndexedDB or a remote server.
(() => {
  const $ = (id) => document.getElementById(id);
  const TEXT = {
    bg: {
      archiveCardTitle:'🗜️ ZIP & Archives вече работи',archiveCardDesc:'Създай ZIP · Отвори архив · Извлечи файлове',archiveOpenButton:'Отвори Archives →',
      archiveName:'ZIP & Archives',archiveToolDesc:'Създай ZIP · Отвори · Извлечи',archiveTitle:'ZIP инструменти',archiveIntro:'Създавай ZIP и извличай файлове без качване на сървър.',
      newWorkspace:'Ново',tabCreate:'Създай ZIP',tabOpen:'Отвори ZIP',createHeading:'Създаване на ZIP архив',
      createHelp:'Добави файлове от телефона. Можеш да ги премахваш или да променяш реда преди създаването.',addFiles:'＋ Добави файлове',
      zipName:'Име на архива',compression:'Компресия',standard:'Стандартна',fast:'Бърза',none:'Без компресиране',makeZip:'Създай ZIP файл',
      openHeading:'Отвори ZIP архив',openHelp:'Разгледай съдържанието, избери файлове и ги подготви за отделно изтегляне. Не се поддържат ZIP файлове с парола.',
      chooseZip:'＋ Избери ZIP',selectAll:'Избери всички',selectNone:'Премахни избора',extractSelected:'Подготви отделни файлове',repackSelected:'Изтегли избраните като ZIP',
      readyFiles:'Готови файлове',downloadHelp:'Натисни всеки линк, за да запазиш файла. Оригиналите остават непроменени.',
      limits:'Създаване: до 60 файла, 25 MB на файл, 60 MB общо. Отваряне: ZIP до 30 MB, 120 файла и 80 MB разархивирано съдържание.',
      offlineNote:'ZIP инструментите работят локално и offline след успешното обновяване на PWA.',
      emptyCreate:'Няма добавени файлове.',emptyZip:'Избери ZIP архив, за да видиш съдържанието.',
      total:'общо',files:'файла',selected:'избрани',remove:'Премахни',moveUp:'Премести нагоре',moveDown:'Премести надолу',
      chooseCreateFirst:'Добави поне един файл.',chooseZipFirst:'Първо избери ZIP архив.',emptySelection:'Избери поне един файл от списъка.',
      tooManyCreate:'Можеш да добавиш най-много 60 файла.',createTooLarge:'Файлът е над 25 MB.',createTotalTooLarge:'Общият размер е над 60 MB.',
      archiveTooLarge:'ZIP архивът е над 30 MB.',wrongZip:'Избери файл с разширение .zip.',
      archiveTooMany:'Архивът има повече от 120 файла.',archiveUnsafe:'ZIP архивът съдържа опасни имена на файлове. Не е отворен.',
      archiveDeclaredTooLarge:'Разархивираното съдържание е над 80 MB или някой файл е над 30 MB.',
      archiveUnsupported:'ZIP не може да се отвори. Възможно е да е повреден, защитен с парола или с неподдържан формат.',
      noLibrary:'ZIP библиотеката липсва. Провери дали jszip.min.js е качен в GitHub.',
      busy:'Обработване…',openBusy:'Четене на ZIP…',progress:'Готово',created:'Готово! Архивът е проверен и е готов за изтегляне.',
      opened:'Архивът е отворен. Избери файлове за извличане.',extracted:'Готово! Натисни всеки линк за отделно изтегляне.',
      selectedZipReady:'Готово! Избраните файлове са в нов ZIP архив.',download:'↓ Изтегли',
      extractLimit:'За отделно извличане избери най-много 20 файла. За повече използвай „Изтегли избраните като ZIP“.',
      memoryLimit:'Резултатът е прекалено голям за безопасна обработка на телефон.',resetDone:'ZIP работното пространство е изчистено.',
      badFilename:'Въведи валидно име на архива.',operationError:'Неуспешна операция. Провери файловете и опитай с по-малък архив.',
      extractionError:'Не може да се извлече файл от архива. Може да е повреден.',
      duplicates:'Файловете с еднакви имена получават номер, за да не се презаписват.',
      sourceName:'Архив',repacked:'selected-files.zip',savePrepared:'Подготвени файлове',noEmpty:'ZIP архивът не съдържа обикновени файлове.'
    },
    en: {
      archiveCardTitle:'🗜️ ZIP & Archives is ready',archiveCardDesc:'Create ZIP · Open archives · Extract files',archiveOpenButton:'Open Archives →',
      archiveName:'ZIP & Archives',archiveToolDesc:'Create ZIP · Open · Extract',archiveTitle:'ZIP tools',archiveIntro:'Create ZIPs and extract files locally, without uploading them to a server.',
      newWorkspace:'New',tabCreate:'Create ZIP',tabOpen:'Open ZIP',createHeading:'Create ZIP archive',
      createHelp:'Add files from your device. Remove or reorder them before building the archive.',addFiles:'＋ Add files',
      zipName:'Archive name',compression:'Compression',standard:'Standard',fast:'Fast',none:'No compression',makeZip:'Create ZIP',
      openHeading:'Open ZIP archive',openHelp:'Inspect the contents, choose files and prepare individual downloads. Password-protected ZIPs are unsupported.',
      chooseZip:'＋ Choose ZIP',selectAll:'Select all',selectNone:'Clear selection',extractSelected:'Prepare individual files',repackSelected:'Download selected as ZIP',
      readyFiles:'Ready files',downloadHelp:'Tap each link to save that file. Originals remain unchanged.',
      limits:'Create: up to 60 files, 25 MB per file, 60 MB total. Open: ZIP up to 30 MB, 120 files and 80 MB of uncompressed content.',
      offlineNote:'ZIP tools work locally and offline once the PWA update has installed successfully.',
      emptyCreate:'No files added yet.',emptyZip:'Choose a ZIP to see its files.',
      total:'total',files:'files',selected:'selected',remove:'Remove',moveUp:'Move up',moveDown:'Move down',
      chooseCreateFirst:'Add at least one file.',chooseZipFirst:'Choose a ZIP archive first.',emptySelection:'Select at least one file.',
      tooManyCreate:'You can add at most 60 files.',createTooLarge:'File exceeds 25 MB.',createTotalTooLarge:'Total size exceeds 60 MB.',
      archiveTooLarge:'The ZIP archive exceeds 30 MB.',wrongZip:'Choose a .zip file.',
      archiveTooMany:'The archive contains more than 120 files.',archiveUnsafe:'The ZIP contains unsafe filenames and was not opened.',
      archiveDeclaredTooLarge:'Uncompressed content exceeds 80 MB or one file exceeds 30 MB.',
      archiveUnsupported:'Cannot open this ZIP. It may be damaged, password protected or unsupported.',
      noLibrary:'ZIP library is missing. Check that jszip.min.js was uploaded to GitHub.',
      busy:'Processing…',openBusy:'Reading ZIP…',progress:'Complete',created:'Done! Archive validated and ready to download.',
      opened:'Archive opened. Select files to extract.',extracted:'Done! Tap each link to download an individual file.',
      selectedZipReady:'Done! Selected files have been packed into a new ZIP.',download:'↓ Download',
      extractLimit:'To extract individual files, select no more than 20. For more, use “Download selected as ZIP”.',
      memoryLimit:'Result is too large for safe processing on this phone.',resetDone:'ZIP workspace cleared.',
      badFilename:'Enter a valid archive name.',operationError:'Operation failed. Check files or try a smaller archive.',
      extractionError:'Unable to extract a file. The archive may be damaged.',
      duplicates:'Duplicate filenames are numbered to prevent overwriting.',
      sourceName:'Archive',repacked:'selected-files.zip',savePrepared:'Prepared files',noEmpty:'This ZIP does not contain ordinary files.'
    }
  };

  const CREATE_FILE_LIMIT=25*1024*1024;
  const CREATE_TOTAL_LIMIT=60*1024*1024;
  const CREATE_COUNT_LIMIT=60;
  const ZIP_FILE_LIMIT=30*1024*1024;
  const OPEN_SINGLE_LIMIT=30*1024*1024;
  const OPEN_TOTAL_LIMIT=80*1024*1024;
  const OPEN_COUNT_LIMIT=120;
  const EXTRACT_COUNT_LIMIT=20;
  const S={mode:'create',files:[],archive:null,entries:[],selected:new Set(),urls:[],busy:false};

  function lang(){return window.FileForgeLanguage?.() || 'bg';}
  function t(key){return (TEXT[lang()]||TEXT.bg)[key]||TEXT.bg[key]||key;}
  function size(n){return n>=1048576?(n/1048576).toFixed(2)+' MB':n>=1024?Math.round(n/1024)+' KB':n+' B';}
  function status(message='',danger=false){const node=$('archiveStatus');node.textContent=message;node.classList.toggle('danger',danger);}
  function safeName(name){
    const result=String(name||'file').split(/[\\/]/).pop().replace(/[\u0000-\u001f<>:"|?*]/g,'_').trim().replace(/^[. ]+|[. ]+$/g,'');
    return (result||'file').slice(0,125);
  }
  function archiveName(){
    const raw=$('archiveOutputName').value.trim().replace(/\.zip$/i,'');
    const name=safeName(raw);
    if(!raw || !name)return null;
    return name+'.zip';
  }
  function uniqueName(name,names){
    const clean=safeName(name);
    const index=clean.lastIndexOf('.');
    const base=index>0?clean.slice(0,index):clean;
    const ext=index>0?clean.slice(index):'';
    let candidate=clean,count=2;
    while(names.has(candidate.toLowerCase())) candidate=`${base} (${count++})${ext}`;
    names.add(candidate.toLowerCase());
    return candidate;
  }
  function clearResult(){
    for(const url of S.urls) URL.revokeObjectURL(url);
    S.urls=[];$('archiveDownloads').replaceChildren();$('archiveResults').hidden=true;
  }
  function linkFor(blob,filename){
    const url=URL.createObjectURL(blob);S.urls.push(url);
    const a=document.createElement('a');a.className='download-button';a.href=url;a.download=filename;
    a.textContent=`${t('download')} · ${filename} (${size(blob.size)})`;
    $('archiveDownloads').append(a);
    window.FileForgeResults?.add({blob,name:filename,kind:'download'});
  }
  function displayResult(){ $('archiveResults').hidden=false; }
  function messageEmpty(text){const div=document.createElement('div');div.className='pdf-empty';div.textContent=text;return div;}
  function smallButton(icon,title,action,disabled=false){
    const b=document.createElement('button');b.type='button';b.className='pdf-small-button';b.textContent=icon;
    b.title=title;b.setAttribute('aria-label',title);b.disabled=disabled||S.busy;b.addEventListener('click',action);return b;
  }
  function renderCreate(){
    const list=$('archiveCreateList');list.replaceChildren();
    if(!S.files.length){list.append(messageEmpty(t('emptyCreate')));return;}
    S.files.forEach((entry,i)=>{
      const row=document.createElement('div');row.className='pdf-item';
      const icon=document.createElement('div');icon.className='pdf-item-icon';icon.textContent='📦';
      const content=document.createElement('div');content.className='pdf-item-main';
      const title=document.createElement('strong');title.textContent=entry.name;
      const meta=document.createElement('small');meta.textContent=`${size(entry.file.size)} · ${i+1}/${S.files.length}`;
      content.append(title,meta);
      const buttons=document.createElement('div');buttons.className='pdf-item-actions';
      buttons.append(
        smallButton('↑',t('moveUp'),()=>swap(i,i-1),i===0),
        smallButton('↓',t('moveDown'),()=>swap(i,i+1),i===S.files.length-1),
        smallButton('×',t('remove'),()=>{S.files.splice(i,1);clearResult();renderCreate();})
      );
      row.append(icon,content,buttons);list.append(row);
    });
  }
  function swap(a,b){
    if(S.busy||b<0||b>=S.files.length)return;
    [S.files[a],S.files[b]]=[S.files[b],S.files[a]];clearResult();renderCreate();
  }
  function renderOpen(){
    const list=$('archiveOpenList');list.replaceChildren();
    $('archiveOpenInfo').textContent=S.archive?`${S.archive.name} · ${size(S.archive.size)} · ${S.entries.length} ${t('files')}`:'';
    $('archiveSelectAll').disabled=!S.entries.length||S.busy;
    $('archiveSelectNone').disabled=!S.entries.length||S.busy;
    $('archiveSelectionCount').textContent=S.archive?`${S.selected.size}/${S.entries.length} ${t('selected')}`:'';
    if(!S.archive){list.append(messageEmpty(t('emptyZip')));return;}
    S.entries.forEach((entry)=>{
      const label=document.createElement('label');label.className='archive-entry';
      const check=document.createElement('input');check.type='checkbox';check.checked=S.selected.has(entry.name);check.disabled=S.busy;
      check.addEventListener('change',()=>{
        if(check.checked)S.selected.add(entry.name);else S.selected.delete(entry.name);
        clearResult();$('archiveSelectionCount').textContent=`${S.selected.size}/${S.entries.length} ${t('selected')}`;
      });
      const info=document.createElement('div');info.className='archive-entry-main';
      const heading=document.createElement('strong');heading.textContent=entry.name;
      const meta=document.createElement('small');meta.textContent=size(entry.size);
      info.append(heading,meta);label.append(check,info);list.append(label);
    });
  }
  function translate(){
    document.querySelectorAll('[data-archive-i18n]').forEach(el=>{el.textContent=t(el.dataset.archiveI18n);});
    renderCreate();renderOpen();
  }
  function switchMode(mode){
    if(!['create','open'].includes(mode)||S.busy)return;
    S.mode=mode;
    document.querySelectorAll('[data-archive-tab]').forEach(btn=>{
      const active=btn.dataset.archiveTab===mode;
      btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));
    });
    $('archiveModeCreate').hidden=mode!=='create';$('archiveModeOpen').hidden=mode!=='open';
    clearResult();status('');
  }
  function reset(){
    if(S.busy)return;
    S.files=[];S.archive=null;S.entries=[];S.selected.clear();
    $('archiveOutputName').value='fileforge-archive';$('archiveCompression').value='standard';
    $('archiveCreateInput').value='';$('archiveOpenInput').value='';
    clearResult();renderCreate();renderOpen();status(t('resetDone'));
  }
  function requireLibrary(){if(typeof JSZip!=='function')throw new Error(t('noLibrary'));}
  async function run(action){
    if(S.busy)return;S.busy=true;
    document.querySelectorAll('.archive-workspace button, [data-archive-tab], #archiveReset').forEach(b=>b.disabled=true);
    status(t('busy'));await new Promise(r=>setTimeout(r,0));
    try{requireLibrary();await action();}
    catch(e){console.error('Archives:',e);status(e?.message||t('operationError'),true);clearResult();}
    finally{
      S.busy=false;
      document.querySelectorAll('.archive-workspace button, [data-archive-tab], #archiveReset').forEach(b=>b.disabled=false);
      renderCreate();renderOpen();
    }
  }
  function addFiles(files){
    if(S.busy)return;
    const incoming=Array.from(files||[]);if(!incoming.length)return;
    if(S.files.length+incoming.length>CREATE_COUNT_LIMIT){status(t('tooManyCreate'),true);return;}
    if(incoming.some(f=>f.size>CREATE_FILE_LIMIT)){status(t('createTooLarge'),true);return;}
    if([...S.files.map(x=>x.file),...incoming].reduce((sum,f)=>sum+f.size,0)>CREATE_TOTAL_LIMIT){status(t('createTotalTooLarge'),true);return;}
    const existingNames=new Set(S.files.map(x=>x.name.toLowerCase()));
    for(const file of incoming) S.files.push({file,name:uniqueName(file.name,existingNames)});
    clearResult();renderCreate();status(`${S.files.length} ${t('files')} · ${size(S.files.reduce((n,x)=>n+x.file.size,0))} ${t('total')}`);
  }
  function record(output,files,before,after){
    window.FileForgeAddArchiveHistory?.({kind:'zip',name:output,output,files,before,after,time:Date.now()});
  }
  async function checkedZip(blob,expectedCount){
    if(blob.size>OPEN_TOTAL_LIMIT)throw new Error(t('memoryLimit'));
    const reopened=await JSZip.loadAsync(blob);
    const count=Object.values(reopened.files).filter(f=>!f.dir).length;
    if(count!==expectedCount)throw new Error(t('operationError'));
  }
  async function createZip(){
    if(!S.files.length){status(t('chooseCreateFirst'),true);return;}
    const name=archiveName();if(!name){status(t('badFilename'),true);return;}
    await run(async()=>{
      const zip=new JSZip();
      for(const entry of S.files) zip.file(entry.name,entry.file);
      const compression=$('archiveCompression').value;
      const opts=compression==='none'?{compression:'STORE'}:{compression:'DEFLATE',compressionOptions:{level:compression==='fast'?1:6}};
      const blob=await zip.generateAsync({type:'blob',streamFiles:true,...opts},meta=>{
        status(`${t('busy')} ${Math.round(meta.percent)}%`);
      });
      if(blob.size>OPEN_TOTAL_LIMIT)throw new Error(t('memoryLimit'));
      await checkedZip(blob,S.files.length);
      clearResult();linkFor(blob,name);displayResult();
      record(name,S.files.length,S.files.reduce((n,e)=>n+e.file.size,0),blob.size);
      status(t('created'));
    });
  }
  function unsafePath(raw){
    const str=String(raw||'');
    return str.includes('\\')||str.includes('\0')||str.startsWith('/')||/^[a-zA-Z]:/.test(str)||str.split('/').some(p=>p==='..'||p==='.')||!str.trim();
  }
  async function openZip(file){
    if(!file||S.busy)return;
    if(!/\.zip$/i.test(file.name)){status(t('wrongZip'),true);return;}
    if(file.size>ZIP_FILE_LIMIT){status(t('archiveTooLarge'),true);return;}
    // Drop the previous archive before trying a different one, including on failure.
    S.archive=null;S.entries=[];S.selected.clear();clearResult();renderOpen();
    await run(async()=>{
      status(t('openBusy'));
      const zip=await JSZip.loadAsync(file,{createFolders:false});
      const entries=Object.values(zip.files).filter(entry=>!entry.dir);
      if(entries.length===0)throw new Error(t('noEmpty'));
      if(entries.length>OPEN_COUNT_LIMIT)throw new Error(t('archiveTooMany'));
      let declared=0;
      for(const entry of entries){
        const original=entry.unsafeOriginalName||entry.name;
        if(unsafePath(original)||unsafePath(entry.name))throw new Error(t('archiveUnsafe'));
        // This is a bound on decompression. JSZip 3.10.1 exposes the ZIP header's uncompressed size.
        const single=entry._data?.uncompressedSize;
        if(!Number.isSafeInteger(single)||single<0||single>OPEN_SINGLE_LIMIT)throw new Error(t('archiveDeclaredTooLarge'));
        declared+=single;
        if(declared>OPEN_TOTAL_LIMIT)throw new Error(t('archiveDeclaredTooLarge'));
      }
      S.archive=file;S.entries=entries.map(entry=>({file:entry,name:entry.name,size:entry._data.uncompressedSize}));
      S.selected=new Set(S.entries.slice(0,EXTRACT_COUNT_LIMIT).map(entry=>entry.name));
      clearResult();status(t('opened'));
    });
  }
  function chosen(){return S.entries.filter(entry=>S.selected.has(entry.name));}
  async function contents(selected){
    const ready=[];let total=0;
    for(let i=0;i<selected.length;i++){
      const entry=selected[i];status(`${t('busy')} ${i+1}/${selected.length}: ${entry.name}`);
      let data;
      try{data=await entry.file.async('uint8array');}catch{throw new Error(t('extractionError'));}
      if(data.byteLength!==entry.size||data.byteLength>OPEN_SINGLE_LIMIT)throw new Error(t('archiveDeclaredTooLarge'));
      total+=data.byteLength;
      if(total>OPEN_TOTAL_LIMIT)throw new Error(t('archiveDeclaredTooLarge'));
      ready.push({entry,data});
    }
    return {ready,total};
  }
  async function extract(){
    if(!S.archive){status(t('chooseZipFirst'),true);return;}
    const selected=chosen();if(!selected.length){status(t('emptySelection'),true);return;}
    if(selected.length>EXTRACT_COUNT_LIMIT){status(t('extractLimit'),true);return;}
    await run(async()=>{
      const {ready,total}=await contents(selected);
      const names=new Set();clearResult();
      for(const {entry,data} of ready){
        const blob=new Blob([data],{type:'application/octet-stream'});
        linkFor(blob,uniqueName(entry.name,names));
      }
      displayResult();record(`${t('savePrepared')} (${ready.length})`,ready.length,S.archive.size,total);
      status(t('extracted'));
    });
  }
  async function repack(){
    if(!S.archive){status(t('chooseZipFirst'),true);return;}
    const selected=chosen();if(!selected.length){status(t('emptySelection'),true);return;}
    await run(async()=>{
      const {ready,total}=await contents(selected);
      const newZip=new JSZip();
      for(const {entry,data} of ready)newZip.file(entry.name,data);
      const blob=await newZip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:1}},meta=>{
        status(`${t('busy')} ${Math.round(meta.percent)}%`);
      });
      await checkedZip(blob,selected.length);
      clearResult();
      const name=safeName(S.archive.name.replace(/\.zip$/i,''))+'-selected.zip';
      linkFor(blob,name);displayResult();record(name,ready.length,total,blob.size);status(t('selectedZipReady'));
    });
  }
  function init(){
    $('archiveOpenHome').addEventListener('click',()=>window.FileForgeOpenArchives?.());
    $('archiveOpenTools').addEventListener('click',()=>window.FileForgeOpenArchives?.());
    document.querySelectorAll('[data-archive-tab]').forEach(button=>button.addEventListener('click',()=>switchMode(button.dataset.archiveTab)));
    $('archiveReset').addEventListener('click',reset);
    $('archiveAddFiles').addEventListener('click',()=>{if(S.busy)return;$('archiveCreateInput').value='';$('archiveCreateInput').click();});
    $('archiveChooseZip').addEventListener('click',()=>{if(S.busy)return;$('archiveOpenInput').value='';$('archiveOpenInput').click();});
    $('archiveCreateInput').addEventListener('change',e=>addFiles(e.target.files));
    $('archiveOpenInput').addEventListener('change',e=>openZip(e.target.files?.[0]));
    $('archiveCreate').addEventListener('click',createZip);
    $('archiveExtract').addEventListener('click',extract);
    $('archiveRepack').addEventListener('click',repack);
    $('archiveSelectAll').addEventListener('click',()=>{S.selected=new Set(S.entries.map(e=>e.name));clearResult();renderOpen();});
    $('archiveSelectNone').addEventListener('click',()=>{S.selected.clear();clearResult();renderOpen();});
    $('archiveOutputName').addEventListener('input',clearResult);
    $('archiveCompression').addEventListener('change',clearResult);
    switchMode('create');translate();
  }
  window.ArchiveStudio={translate};
  document.addEventListener('DOMContentLoaded',init);
})();
