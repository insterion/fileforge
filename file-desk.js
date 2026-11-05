'use strict';
/* FileForge 1.2 — File Desk. Works locally with files explicitly selected by the user.
   It stores no file contents, file names, or metadata in permanent browser storage. */
(() => {
  const $=id=>document.getElementById(id);
  const MIB=1024*1024;
  const D={
    bg:{title:'File Desk — отвори файл',intro:'Избери файл и FileForge ще предложи подходящия инструмент. Оригиналът остава непроменен.',
      choose:'＋ Избери файл',empty:'Тук ще видиш информацията и прегледа на избрания файл.',
      name:'Име',size:'Размер',type:'Формат',modified:'Последна промяна',preview:'Преглед',
      continue:'Отвори в подходящия инструмент',save:'↓ Запази копие',share:'Сподели',copy:'Копирай информация',clear:'Премахни избора',
      privacy:'Файлът не се качва никъде и не се добавя в историята само от избора му. Прегледът е временен.',
      chosen:'Файлът е избран. Можеш да го разгледаш или да го отвориш в инструмент.',
      emptyError:'Файлът е празен. Избери друг файл.',readError:'Файлът не може да се прочете. Опитай с друг файл.',
      image:'Снимка',pdf:'PDF документ',zip:'ZIP архив',audio:'Аудио',video:'Видео',text:'Текстов файл',other:'Друг файл',
      imageDetail:'Преглед на снимката',pdfDetail:'За PDF използвай „Преглед на PDF“ или отвори в PDF Studio.',zipDetail:'Отвори в ZIP & Archives, за да видиш съдържанието.',
      textDetail:'Показваме само началото на текста. Това е обикновен текстов преглед, без изпълняване на код.',
      otherDetail:'Не се предлага директен преглед. Можеш да запазиш копие или да споделиш файла.',
      pdfView:'↗ Преглед на PDF',imageTool:'Image Studio',pdfTool:'PDF Studio · Страници',zipTool:'ZIP & Archives',audioTool:'Audio Studio',videoTool:'Video Studio',otherTool:'Downloads & Sharing',
      tooLarge:'Файлът е над лимита на избрания инструмент',chooseSmaller:'Избери по-малък файл или използвай друг инструмент.',
      notSupported:'Този формат още не се поддържа в съответния редактор. Можеш да използваш Сподели/Запази копие.',
      copied:'Информацията е копирана.',copyFailed:'Браузърът не позволи копиране.',sharingUnavailable:'Споделянето на файлове не се поддържа от този браузър. Използвай Save copy и Android Files → Share.',
      shareCancelled:'Споделянето е отменено.',shareError:'Файлът не можа да бъде споделен. Използвай Save copy и менюто на Android.',
      saved:'Копието е подготвено за изтегляне.',transferError:'Не успях да предам файла автоматично. Отвори инструмента и го избери отново.',
      previewUnavailable:'Прегледът не се поддържа за този файл на телефона.',previewBig:'Файлът е твърде голям за безопасен преглед тук.',
      pdfTooBig:'PDF Studio поддържа до 20 MB на файл.',zipTooBig:'ZIP & Archives отваря ZIP до 30 MB.',audioTooBig:'Audio Studio поддържа до 20 MB.',imageTooBig:'Image Studio поддържа до 25 MB.',videoTooBig:'Video Studio поддържа до 120 MB.'},
    en:{title:'File Desk — open a file',intro:'Choose a file and FileForge suggests the right tool. The original file remains untouched.',
      choose:'＋ Choose a file',empty:'Your selected file details and preview will appear here.',
      name:'Name',size:'Size',type:'Format',modified:'Last modified',preview:'Preview',
      continue:'Open in suggested tool',save:'↓ Save a copy',share:'Share',copy:'Copy details',clear:'Clear selection',
      privacy:'Your file is never uploaded or saved in history just by selecting it. Preview is temporary.',
      chosen:'File selected. Preview it or open it in the matching tool.',
      emptyError:'The file is empty. Choose a different file.',readError:'Unable to read that file. Try another.',
      image:'Image',pdf:'PDF document',zip:'ZIP archive',audio:'Audio',video:'Video',text:'Text file',other:'Other file',
      imageDetail:'Image preview',pdfDetail:'Use “Preview PDF” or open PDF Studio to process this document.',zipDetail:'Open ZIP & Archives to view its contents.',
      textDetail:'Only the beginning of this file is displayed as plain text. No code is executed.',
      otherDetail:'No inline preview is available. You can save a copy or share the file.',
      pdfView:'↗ Preview PDF',imageTool:'Image Studio',pdfTool:'PDF Studio · Pages',zipTool:'ZIP & Archives',audioTool:'Audio Studio',videoTool:'Video Studio',otherTool:'Downloads & Sharing',
      tooLarge:'This file exceeds the selected tool limit',chooseSmaller:'Use a smaller file or another tool.',
      notSupported:'This format is not supported by the editor yet. You can still share or save a copy.',
      copied:'File details copied.',copyFailed:'Clipboard access was denied.',sharingUnavailable:'This browser cannot share files directly. Save a copy then use Android Files → Share.',
      shareCancelled:'Share cancelled.',shareError:'Unable to share this file. Save a copy and try Android Share.',
      saved:'Your copy is ready to download.',transferError:'Could not pass the file automatically. Open the tool and choose it again.',
      previewUnavailable:'This phone cannot preview the selected file.',previewBig:'This file is too large for a safe inline preview.',
      pdfTooBig:'PDF Studio limit is 20 MB per file.',zipTooBig:'ZIP & Archives can open ZIP files up to 30 MB.',audioTooBig:'Audio Studio limit is 20 MB.',imageTooBig:'Image Studio limit is 25 MB.',videoTooBig:'Video Studio limit is 120 MB.'}
  };
  const lang=()=>window.FileForgeLanguage?.()==='en'?'en':'bg';
  const t=k=>D[lang()][k]||k;
  const size=x=>x>=MIB?(x/MIB).toFixed(2)+' MB':x>=1024?Math.ceil(x/1024)+' KB':x+' B';
  const ext=f=>f.name.split('.').pop()?.toLowerCase()||'';
  const state={file:null,url:null,kind:null,viewId:0,ready:false};
  const kinds={image:new Set(['jpg','jpeg','png','webp','gif','bmp','heic','heif','avif']),pdf:new Set(['pdf']),zip:new Set(['zip']),
    audio:new Set(['mp3','wav','m4a','aac','ogg','opus','flac']),video:new Set(['mp4','webm','mov','m4v','mkv','avi']),
    text:new Set(['txt','md','csv','json','xml','log','yaml','yml','js','css','html'])};
  function kindOf(f){
    const e=ext(f),mime=(f.type||'').toLowerCase();
    // SVG is not sent to the image editor or previewed as active document content.
    if(mime==='image/svg+xml'||e==='svg')return'other';
    for(const [kind,set] of Object.entries(kinds))if(set.has(e))return kind;
    if(mime.startsWith('image/'))return'image';
    if(mime==='application/pdf')return'pdf';
    if(mime==='application/zip'||mime==='application/x-zip-compressed')return'zip';
    if(mime.startsWith('audio/'))return'audio';
    if(mime.startsWith('video/'))return'video';
    if(mime.startsWith('text/'))return'text';
    return'other';
  }
  function limitInfo(){
    const f=state.file,k=state.kind;
    if(!f)return'';
    if(k==='image'&&f.size>25*MIB)return t('imageTooBig');
    if(k==='pdf'&&f.size>20*MIB)return t('pdfTooBig');
    if(k==='zip'&&f.size>30*MIB)return t('zipTooBig');
    if(k==='audio'&&f.size>20*MIB)return t('audioTooBig');
    if(k==='video'&&f.size>120*MIB)return t('videoTooBig');
    return'';
  }
  const toolKey={image:'imageTool',pdf:'pdfTool',zip:'zipTool',audio:'audioTool',video:'videoTool',text:'otherTool',other:'otherTool'};
  function status(s,error=false){const el=$('fileDeskStatus');if(el){el.textContent=s;el.classList.toggle('ff-desk-error',error);}}
  function clearUrl(){if(state.url){URL.revokeObjectURL(state.url);state.url=null;}}
  function clearPreview(){const preview=$('fileDeskPreview');preview.replaceChildren();}
  function selectEmpty(){state.viewId++;state.file=null;state.kind=null;clearUrl();clearPreview();$('fileDeskDetails').hidden=true;$('fileDeskPlaceholder').hidden=false;status('');}
  function note(message){const p=document.createElement('p');p.className='ff-desk-note';p.textContent=message;return p;}
  function renderActions(){
    const file=state.file;
    $('fileDeskDetails').hidden=!file;
    $('fileDeskPlaceholder').hidden=!!file;
    if(!file)return;
    $('fileDeskName').textContent=file.name;
    $('fileDeskSize').textContent=size(file.size);
    $('fileDeskType').textContent=t(state.kind)+' · '+(file.type||ext(file).toUpperCase()||'—');
    $('fileDeskModified').textContent=file.lastModified?new Date(file.lastModified).toLocaleString(lang()==='bg'?'bg-BG':'en-GB'):'—';
    $('fileDeskToolName').textContent=t(toolKey[state.kind]);
    $('fileDeskRoute').disabled=Boolean(limitInfo()) || (state.kind==='image'&&!['jpg','jpeg','png','webp'].includes(ext(file))&&!['image/jpeg','image/png','image/webp'].includes(file.type));
    if(state.kind==='image'&&$('fileDeskRoute').disabled&&!limitInfo())status(t('notSupported'),true);
    else if(limitInfo())status(limitInfo()+' '+t('chooseSmaller'),true);
    else status(t('chosen'));
  }
  function preview(){
    const f=state.file,k=state.kind,id=state.viewId;
    if(!f)return;
    clearPreview();
    const root=$('fileDeskPreview');
    if(k==='image'){
      if(f.size>25*MIB){root.append(note(t('previewBig')));return;}
      const img=document.createElement('img');img.className='ff-desk-image';img.alt=f.name;img.loading='eager';img.src=state.url;
      img.onerror=()=>{if(id===state.viewId){root.replaceChildren(note(t('previewUnavailable')));}};
      root.append(img);return;
    }
    if(k==='video'){
      if(f.size>120*MIB){root.append(note(t('previewBig')));return;}
      const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.src=state.url;video.className='ff-desk-video';root.append(video);return;
    }
    if(k==='audio'){
      if(f.size>20*MIB){root.append(note(t('previewBig')));return;}
      const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=state.url;audio.className='ff-desk-audio';root.append(audio);return;
    }
    if(k==='pdf'){
      root.append(note(t('pdfDetail')));
      if(f.size<=20*MIB){const a=document.createElement('a');a.href=state.url;a.target='_blank';a.rel='noopener';a.className='secondary-button ff-desk-pdf-open';a.textContent=t('pdfView');root.append(a);}
      return;
    }
    if(k==='text'){
      root.append(note(t('textDetail')));
      if(f.size>2*MIB){root.append(note(t('previewBig')));return;}
      const pre=document.createElement('pre');pre.className='ff-desk-text';pre.textContent='…';root.append(pre);
      f.slice(0,12000).text().then(text=>{if(id===state.viewId){pre.textContent=text+(f.size>12000?'\n…':'');}})
        .catch(()=>{if(id===state.viewId)pre.textContent=t('readError');});return;
    }
    root.append(note(t(k==='zip'?'zipDetail':'otherDetail')));
  }
  function selectFile(file){
    if(!file)return;
    if(!file.size){status(t('emptyError'),true);return;}
    state.viewId++;
    clearPreview();clearUrl();
    state.file=file;state.kind=kindOf(file);state.url=URL.createObjectURL(file);
    renderActions();preview();
  }
  function openPicker(){const inp=$('fileDeskInput');inp.value='';inp.click();}
  function copy(){
    if(!state.file)return;
    const f=state.file;
    const details=`${t('name')}: ${f.name}\n${t('size')}: ${size(f.size)}\n${t('type')}: ${f.type||ext(f)}\n${t('modified')}: ${f.lastModified?new Date(f.lastModified).toISOString():'—'}`;
    if(!navigator.clipboard?.writeText){status(t('copyFailed'),true);return;}
    navigator.clipboard.writeText(details).then(()=>status(t('copied'))).catch(()=>status(t('copyFailed'),true));
  }
  function saveCopy(){
    if(!state.file)return;
    const a=document.createElement('a');a.href=state.url;a.download=state.file.name;a.style.display='none';document.body.append(a);a.click();a.remove();status(t('saved'));
  }
  async function share(){
    const f=state.file;
    if(!f)return;
    if(!navigator.share||!navigator.canShare?.({files:[f]})){status(t('sharingUnavailable'),true);return;}
    try{await navigator.share({files:[f]});}
    catch(e){status(e.name==='AbortError'?t('shareCancelled'):t('shareError'),e.name!=='AbortError');}
  }
  function route(){
    if(!state.file)return;
    const file=state.file,kind=state.kind;
    if(limitInfo()){status(limitInfo()+' '+t('chooseSmaller'),true);return;}
    let target='downloadLocalInput',go=window.FileForgeOpenDownloads;
    if(kind==='image'){
      if(!(['jpg','jpeg','png','webp'].includes(ext(file))||['image/jpeg','image/png','image/webp'].includes(file.type))){status(t('notSupported'),true);return;}
      target='fileInput';go=()=>{ /* Images navigates when the input is changed. */ };
    }else if(kind==='pdf'){
      target='pdfInputOrganize';go=window.FileForgeOpenPdf;
    }else if(kind==='zip'){
      target='archiveOpenInput';go=window.FileForgeOpenArchives;
    }else if(kind==='audio'){
      target='audioInput';go=window.FileForgeOpenAudio;
    }else if(kind==='video'){
      target='videoInput';go=window.FileForgeOpenVideo;
    }
    const input=$(target);
    if(!input){status(t('transferError'),true);return;}
    try{
      const transfer=new DataTransfer();transfer.items.add(file);
      input.files=transfer.files;
      if(kind==='pdf')document.querySelector('[data-pdf-tab="organize"]')?.click();
      if(kind==='zip')document.querySelector('[data-archive-tab="open"]')?.click();
      if(go)go();
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }catch(e){console.warn('File Desk route:',e);if(go)go();status(t('transferError'),true);}
  }
  function translate(){
    document.querySelectorAll('[data-desk-i18n]').forEach(el=>{const v=D[lang()][el.dataset.deskI18n];if(v)el.textContent=v;});
    if(state.file){renderActions();preview();}
  }
  function init(){
    $('fileDeskChoose').addEventListener('click',openPicker);
    $('fileDeskInput').addEventListener('change',e=>selectFile(e.target.files?.[0]));
    $('fileDeskRoute').addEventListener('click',route);
    $('fileDeskSave').addEventListener('click',saveCopy);
    $('fileDeskShare').addEventListener('click',share);
    $('fileDeskCopy').addEventListener('click',copy);
    $('fileDeskClear').addEventListener('click',selectEmpty);
    $('fileDeskHome').addEventListener('click',()=>{window.FileForgeOpenDesk?.();openPicker();});
    $('fileDeskTools').addEventListener('click',()=>window.FileForgeOpenDesk?.());
    translate();state.ready=true;
  }
  window.FileForgeDesk={translate,kindOf};
  document.addEventListener('DOMContentLoaded',init);
  window.addEventListener('pagehide',clearUrl);
})();
