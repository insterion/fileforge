'use strict';
/* FileForge 0.7: metadata-only history, safe JSON export/import and favourite tools.
   Existing v1 history and prefs keys are deliberately unchanged. */
(() => {
  const $ = (id) => document.getElementById(id);
  const IDS = ['image','pdf','zip','batch','audio','video','download'];
  const FAVORITES_KEY='fileforge_favorites_v1';
  const labels = {
    bg:{favorites:'☆ Любими инструменти',favoritesHelp:'Докосни ☆, за да добавиш или махнеш инструмент.', batchCta:'✨ Batch Images — много снимки наведнъж',batchCtaDesc:'Конвертирай до 12 снимки с едни настройки и изтегли ZIP.',openBatch:'Отвори Batch →',batchTitle:'Batch Images',batchSummary:'Множество снимки → един ZIP',historySearch:'Търси по име...',filterAll:'Всички',filterImage:'Снимки',exportBackup:'↓ Запази History & Favorites',importBackup:'↑ Възстанови backup',historyPrivacy:'Историята съдържа само имена и метаданни, не файловете. Импортът добавя записи към съществуващите.',historyNoMatches:'Няма съвпадения.',saved:'Любимите инструменти са обновени.',backupDone:'JSON архивът е готов.',badBackup:'Невалиден или неподдържан JSON архив.',backupImported:'Историята и любимите инструменти са възстановени.',confirmImport:'Добавяне на записи от резервния архив към настоящата история?',image:'Снимки',pdf:'PDF Studio',zip:'ZIP & Archives',batch:'Batch Images',audio:'Audio Studio',video:'Video Studio',download:'Downloads & Sharing',filterDownloads:'Изтегляния',date:'Дата',files:'файла',pages:'стр.',importError:'Неуспешно отваряне на архива.'},
    en:{favorites:'☆ Favourite tools',favoritesHelp:'Tap ☆ to add or remove a shortcut.',batchCta:'✨ Batch Images — many photos at once',batchCtaDesc:'Convert up to 12 images using one set of settings and download a ZIP.',openBatch:'Open Batch →',batchTitle:'Batch Images',batchSummary:'Multiple images → one ZIP',historySearch:'Search filename...',filterAll:'All',filterImage:'Images',exportBackup:'↓ Export History & Favorites',importBackup:'↑ Import backup',historyPrivacy:'Only filenames and metadata are stored, not your files. Import merges existing history.',historyNoMatches:'No matches.',saved:'Favourites updated.',backupDone:'JSON backup is ready.',badBackup:'Invalid or unsupported JSON backup.',backupImported:'History and favourites restored.',confirmImport:'Add records from the backup to your existing history?',image:'Images',pdf:'PDF Studio',zip:'ZIP & Archives',batch:'Batch Images',audio:'Audio Studio',video:'Video Studio',download:'Downloads & Sharing',filterDownloads:'Downloads',date:'Date',files:'files',pages:'pages',importError:'Could not open backup.'}
  };
  const language=()=>window.FileForgeLanguage?.()==='en'?'en':'bg';
  const tr=(key)=>labels[language()][key]||key;
  function readFavourites(){try{const a=JSON.parse(localStorage.getItem(FAVORITES_KEY));return Array.isArray(a)?[...new Set(a.filter(x=>IDS.includes(x)))]:['image','pdf'];}catch{return ['image','pdf'];}}
  let favourites=readFavourites();
  function saveFavourites(){try{localStorage.setItem(FAVORITES_KEY,JSON.stringify(favourites));}catch{}}
  function openTool(id){if(id==='image'){$('fileInput').value='';$('fileInput').click();}else if(id==='pdf')window.FileForgeOpenPdf?.();else if(id==='zip')window.FileForgeOpenArchives?.();else if(id==='batch')window.FileForgeOpenBatch?.();else if(id==='audio')window.FileForgeOpenAudio?.();else if(id==='video')window.FileForgeOpenVideo?.();else if(id==='download')window.FileForgeOpenDownloads?.();}
  function renderFavourites(){
    const root=$('favoriteTools');if(!root)return;root.replaceChildren();
    for(const id of IDS){
      const tile=document.createElement('div');tile.className='ff-favorite-tile';
      const go=document.createElement('button');go.type='button';go.className='ff-favorite-go';go.textContent=({image:'🖼️ ',pdf:'📄 ',zip:'🗜️ ',batch:'✨ ',audio:'🎵 ',video:'🎬 ',download:'⬇️ '})[id]+tr(id);go.addEventListener('click',()=>openTool(id));
      const star=document.createElement('button');star.type='button';star.className='ff-favorite-star'+(favourites.includes(id)?' active':'');star.textContent=favourites.includes(id)?'★':'☆';star.setAttribute('aria-label',`${tr(id)} favourite`);star.setAttribute('aria-pressed',String(favourites.includes(id)));
      star.addEventListener('click',()=>{favourites=favourites.includes(id)?favourites.filter(x=>x!==id):[...favourites,id];saveFavourites();renderFavourites();});
      tile.append(go,star);root.append(tile);
    }
  }
  function kind(r){return r.kind==='pdf'?'pdf':r.kind==='zip'?'zip':r.kind==='batch'?'batch':r.kind==='audio'?'audio':r.kind==='video'?'video':r.kind==='download'?'download':'image';}
  function bytes(n){return Number.isFinite(n)?n>=1048576?(n/1048576).toFixed(2)+' MB':n>=1024?Math.round(n/1024)+' KB':n+' B':'—';}
  function renderHistory(){
    const records=window.FileForgeGetHistory?.()||[];
    const list=$('historyList');if(!list)return;list.replaceChildren();
    const search=($('historySearch')?.value||'').trim().toLocaleLowerCase();
    const filter=$('historyFilter')?.value||'all';
    const filtered=records.filter(r=>(filter==='all'||kind(r)===filter)&&`${r.name||''} ${r.output||''}`.toLocaleLowerCase().includes(search));
    $('emptyHistory').hidden=records.length!==0;
    $('clearHistory').disabled=records.length===0;
    const locale=language()==='bg'?'bg-BG':'en-GB';
    for(const r of filtered){
      const row=document.createElement('div');row.className='history-row';
      const symbol=document.createElement('div');symbol.className='history-icon';symbol.textContent=({image:'🖼️',pdf:'📄',zip:'🗜️',batch:'✨',audio:'🎵',video:'🎬',download:'⬇️'})[kind(r)];
      const main=document.createElement('div');main.className='history-main';
      const name=document.createElement('div');name.className='history-name';name.textContent=String(r.output||r.name||'FileForge').slice(0,150);
      const meta=document.createElement('div');meta.className='history-meta';
      const time=Number(r.time);const date=Number.isFinite(time)?new Date(time).toLocaleString(locale):'—';
      let detail='';
      if(kind(r)==='download')detail=`${bytes(r.after)}`;
      else if(kind(r)==='video')detail=`${(Number(r.duration)||0).toFixed(1)} s · ${r.width||'?'} × ${r.height||'?'} px · ${bytes(r.after)}`;
      else if(kind(r)==='audio')detail=`${(Number(r.duration)||0).toFixed(1)} s · ${bytes(r.before)} → ${bytes(r.after)}`;
      else if(kind(r)==='batch')detail=`${r.files||0} ${tr('files')} · ${bytes(r.before)} → ${bytes(r.after)}`;
      else if(kind(r)==='zip')detail=`${r.files||0} ${tr('files')} · ${bytes(r.after)}`;
      else if(kind(r)==='pdf')detail=`${r.pages||0} ${tr('pages')} · ${bytes(r.after)}`;
      else detail=`${r.width||'?'} × ${r.height||'?'} px · ${bytes(r.before)} → ${bytes(r.after)}`;
      meta.textContent=`${date} · ${detail}`;main.append(name,meta);row.append(symbol,main);list.append(row);
    }
    if(records.length && !filtered.length){const empty=document.createElement('div');empty.className='ff-empty-list';empty.textContent=tr('historyNoMatches');list.append(empty);}
  }
  function translate(){
    document.querySelectorAll('[data-ff-i18n]').forEach(el=>{const key=el.dataset.ffI18n;if(labels[language()][key])el.textContent=tr(key);});
    document.querySelectorAll('[data-ff-placeholder]').forEach(el=>el.placeholder=tr(el.dataset.ffPlaceholder));
    renderFavourites();renderHistory();
  }
  function downloadJson(){
    const data={app:'FileForge',backupVersion:1,created:new Date().toISOString(),history:window.FileForgeGetHistory?.()||[],favorites:favourites};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`fileforge-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
  }
  function cleanRecord(r){
    if(!r||typeof r!=='object'||Array.isArray(r))return null;
    const out={};
    if(['pdf','zip','batch','audio','video','download'].includes(r.kind))out.kind=r.kind;
    for(const key of ['name','output']) if(typeof r[key]==='string')out[key]=r[key].slice(0,180);
    for(const key of ['time','before','after','width','height','pages','files','duration']) if(Number.isFinite(r[key])&&r[key]>=0)out[key]=r[key];
    if(!out.output||!Number.isFinite(out.time)||out.time>4102444800000)return null;
    return out;
  }
  async function restore(file){
    if(!file)return;
    if(file.size>1024*1024){alert(tr('badBackup'));return;}
    try{
      const data=JSON.parse(await file.text());
      if(data?.app!=='FileForge'||data?.backupVersion!==1||!Array.isArray(data.history)||!Array.isArray(data.favorites)||data.history.length>500){throw new Error('Invalid backup');}
      if(!window.confirm(tr('confirmImport')))return;
      const restored=data.history.map(cleanRecord).filter(Boolean);
      const existing=(window.FileForgeGetHistory?.()||[]).map(cleanRecord).filter(Boolean);
      const unique=new Map();for(const record of [...existing,...restored]){const key=`${record.time}|${record.output}|${record.kind||'image'}`;unique.set(key,record);}
      const merged=[...unique.values()].sort((a,b)=>b.time-a.time).slice(0,40);
      favourites=[...new Set(data.favorites.filter(x=>IDS.includes(x)))];saveFavourites();window.FileForgeSetHistory?.(merged);translate();alert(tr('backupImported'));
    }catch(e){console.warn('FileForge backup:',e);alert(tr('badBackup'));}
    finally{$('backupInput').value='';}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('historySearch').addEventListener('input',renderHistory);
    $('historyFilter').addEventListener('change',renderHistory);
    $('historyBackup').addEventListener('click',downloadJson);
    $('historyRestore').addEventListener('click',()=>{$('backupInput').value='';$('backupInput').click();});
    $('backupInput').addEventListener('change',(e)=>restore(e.target.files?.[0]));
    translate();
  });
  window.FileForgeLibrary={renderHistory,translate,renderFavourites};
})();
