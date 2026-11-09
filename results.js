/* FileForge 1.4 — Recent Results, session-only output shelf.
   Output bytes are never written to localStorage, IndexedDB, Cache Storage or a server.
   A reloaded/closed PWA forgets these blobs; History keeps metadata only. */
'use strict';
(() => {
  const MAX_ITEMS = 8;
  const MAX_SINGLE = 64 * 1024 * 1024;
  const MAX_TOTAL = 96 * 1024 * 1024;
  const items = [];
  let selectedId = null;
  let previewUrl = null;
  let nextId = 1;
  let skipped = false;
  const $ = id => document.getElementById(id);
  const lang = () => window.FileForgeLanguage?.() === 'en' ? 'en' : 'bg';
  const strings = {
    bg: {
      nav:'Готови',title:'Готови файлове',subtitle:'Прегледай, изтегли отново или сподели резултатите.',
      homeTitle:'📂 Готови файлове',homeHelp:'Всички нови резултати на едно място — до затваряне на приложението.',
      open:'Отвори резултатите →',empty:'Все още няма готови файлове. Обработи снимка, PDF, ZIP, аудио или видео.',
      note:'Файловете се пазят само в паметта на текущата сесия. При затваряне, презареждане или актуализация ще изчезнат от този списък. Изтегли важните резултати сега. Историята не съдържа самите файлове.',
      count:'файла',preview:'Преглед',hide:'Скрий прегледа',download:'↓ Запази',share:'Сподели',remove:'Премахни',clear:'Изчисти списъка',
      clearConfirm:'Да премахна ли всички временни резултати? Вече изтеглените файлове няма да бъдат изтрити.',
      noPreview:'За този формат няма вграден преглед. Можеш да го запазиш или споделиш.',openPdf:'Отвори PDF за преглед',
      noShare:'Android не предлага споделяне на този файл тук. Запази го и използвай Files → Share / Open with.',
      shareCancelled:'Споделянето е отменено.',shareFail:'Споделянето не успя. Използвай Запази → Android Files.',
      tooBig:'Някои големи резултати не се добавят тук, за да не се претоварва телефонът. Изтегли ги от съответния инструмент.',
      cleared:'Временните резултати са премахнати.',session:'Само за тази сесия',of:'от'
    },
    en: {
      nav:'Results',title:'Ready files',subtitle:'Preview, download again or share your outputs.',
      homeTitle:'📂 Ready files',homeHelp:'Find your recent outputs in one place until the app is closed.',
      open:'Open results →',empty:'No ready files yet. Process an image, PDF, ZIP, audio or video.',
      note:'Files are kept only in memory for this session. Closing, reloading or updating the app removes them from this list. Download important outputs now. History does not contain file bytes.',
      count:'files',preview:'Preview',hide:'Hide preview',download:'↓ Save',share:'Share',remove:'Remove',clear:'Clear list',
      clearConfirm:'Remove all temporary results? Already downloaded files will not be deleted.',
      noPreview:'No built-in preview for this format. You can save or share it.',openPdf:'Open PDF preview',
      noShare:'Android cannot share this file here. Save it, then choose Files → Share / Open with.',
      shareCancelled:'Sharing cancelled.',shareFail:'Sharing failed. Use Save → Android Files.',
      tooBig:'Some large results were not added to protect phone memory. Download them from the original tool.',
      cleared:'Temporary results cleared.',session:'Session only',of:'of'
    }
  };
  const t = key => strings[lang()][key] || key;
  const size = n => n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? Math.round(n / 1024) + ' KB' : n + ' B';
  const icon = kind => ({image:'🖼️',pdf:'📄',zip:'🗜️',batch:'🗃️',audio:'🎵',video:'🎬',download:'⬇️'})[kind] || '📁';
  const kindFrom = (kind,blob,name) => {
    if(kind && kind !== 'download') return kind;
    const type=blob.type;
    const ext=name.split('.').pop()?.toLowerCase();
    if(type.startsWith('image/') || ['png','jpg','jpeg','webp'].includes(ext))return 'image';
    if(type==='application/pdf'||ext==='pdf')return 'pdf';
    if(type==='application/zip'||ext==='zip')return 'zip';
    if(type.startsWith('audio/')||['mp3','wav','m4a'].includes(ext))return 'audio';
    if(type.startsWith('video/')||['mp4','webm','mov'].includes(ext))return 'video';
    return kind||'download';
  };
  function removePreview(){
    const preview=$('resultsPreview');
    if(preview){preview.querySelectorAll('audio,video').forEach(media=>{media.pause();media.removeAttribute('src');media.load();});preview.replaceChildren();}
    if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
  }
  function dropById(id){
    const at=items.findIndex(x=>x.id===id);
    if(at<0)return;
    items.splice(at,1);
    if(selectedId===id){selectedId=null;removePreview();}
    render();
  }
  function add({blob,name,kind}={}){
    if(!(blob instanceof Blob)||!blob.size)return false;
    if(blob.size>MAX_SINGLE||blob.size>MAX_TOTAL){skipped=true;render();return false;}
    const clean=String(name||'file').replace(/[\\/\x00-\x1f]/g,'_').slice(0,160).trim()||'file';
    // Objects hold a reference to Blob bytes; no second raw copy is stored.
    while(items.length>=MAX_ITEMS || items.reduce((n,x)=>n+x.blob.size,0)+blob.size>MAX_TOTAL){
      const last=items.pop();if(last?.id===selectedId){selectedId=null;removePreview();}
    }
    items.unshift({id:nextId++,blob,name:clean,kind:kindFrom(kind,blob,clean),time:Date.now()});
    render();return true;
  }
  function showPreview(item){
    removePreview();
    const box=$('resultsPreview');if(!box)return;
    if(selectedId===item.id){selectedId=null;render();return;}
    selectedId=item.id;
    const kind=kindFrom(item.kind,item.blob,item.name);
    previewUrl=URL.createObjectURL(item.blob);
    let el;
    if(kind==='image'){
      el=document.createElement('img');el.src=previewUrl;el.alt=item.name;el.className='ff-result-img';
    }else if(kind==='audio' || kind==='video'){
      el=document.createElement(kind==='audio'?'audio':'video');el.controls=true;el.preload='metadata';el.src=previewUrl;el.playsInline=true;el.className='ff-result-media';
    }else if(kind==='pdf'){
      el=document.createElement('a');el.href=previewUrl;el.target='_blank';el.rel='noopener noreferrer';el.className='secondary-button';el.textContent=t('openPdf');
    }else{
      el=document.createElement('p');el.className='pdf-help';el.textContent=t('noPreview');
    }
    box.append(el);box.hidden=false;render();
  }
  function download(item){
    const url=URL.createObjectURL(item.blob);
    const link=document.createElement('a');link.href=url;link.download=item.name;
    link.hidden=true;document.body.append(link);link.click();link.remove();
    // Don't release before Chrome has started handling the download.
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  function share(item){
    if(typeof navigator.share!=='function' || typeof navigator.canShare!=='function' || typeof File!=='function'){
      status(t('noShare'));return;
    }
    const file=new File([item.blob],item.name,{type:item.blob.type||'application/octet-stream'});
    if(!navigator.canShare({files:[file]})){status(t('noShare'));return;}
    // Initiate share synchronously in the user gesture (no await/fetch beforehand).
    navigator.share({files:[file],title:item.name}).catch(error=>{
      status(error?.name==='AbortError'?t('shareCancelled'):t('shareFail'));
    });
  }
  function status(message){const target=$('resultsStatus');if(target)target.textContent=message;}
  function mkButton(label,action,cls){const b=document.createElement('button');b.type='button';b.className=cls||'secondary-button';b.textContent=label;b.addEventListener('click',action);return b;}
  function render(){
    const root=$('resultsList');if(!root)return;
    const total=items.reduce((n,x)=>n+x.blob.size,0);
    $('resultsCount').textContent=`${items.length} ${t('count')} · ${size(total)}`;
    $('resultsClear').disabled=items.length===0;
    $('resultsEmpty').hidden=items.length!==0;
    $('resultsSkipped').hidden=!skipped;
    const holder=$('resultsPreview');
    if(!selectedId)holder.hidden=true;
    else holder.hidden=false;
    root.replaceChildren();
    for(const item of items){
      const row=document.createElement('article');row.className='ff-result-row';
      const img=document.createElement('span');img.className='ff-result-icon';img.textContent=icon(item.kind);
      const content=document.createElement('div');content.className='ff-result-content';
      const name=document.createElement('strong');name.textContent=item.name;
      const meta=document.createElement('small');meta.textContent=`${size(item.blob.size)} · ${new Date(item.time).toLocaleTimeString(lang()==='bg'?'bg-BG':'en-GB',{hour:'2-digit',minute:'2-digit'})}`;
      const buttons=document.createElement('div');buttons.className='ff-result-actions';
      buttons.append(mkButton(selectedId===item.id?t('hide'):t('preview'),()=>showPreview(item)));
      buttons.append(mkButton(t('download'),()=>download(item),'primary-button'));
      buttons.append(mkButton(t('share'),()=>share(item)));
      buttons.append(mkButton(t('remove'),()=>dropById(item.id)));
      content.append(name,meta,buttons);row.append(img,content);root.append(row);
    }
  }
  function clear(){if(!items.length)return;if(!confirm(t('clearConfirm')))return;items.length=0;selectedId=null;skipped=false;removePreview();render();status(t('cleared'));}
  function translate(){
    document.querySelectorAll('[data-results-i18n]').forEach(el=>{const value=strings[lang()][el.dataset.resultsI18n];if(value)el.textContent=value;});
    render();
  }
  window.FileForgeResults={add,translate,itemsCount:()=>items.length};
  document.addEventListener('DOMContentLoaded',()=>{
    $('resultsClear')?.addEventListener('click',clear);
    $('resultsHome')?.addEventListener('click',()=>window.FileForgeOpenResults?.());
    $('resultsTools')?.addEventListener('click',()=>window.FileForgeOpenResults?.());
    translate();
  });
})();
