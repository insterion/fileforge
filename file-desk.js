'use strict';
/* FileForge 1.7 — File Desk: quick routes, capability guidance and safe fallbacks. Works locally with files explicitly selected by the user.
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
      pdfTooBig:'PDF Studio поддържа до 20 MB на файл.',zipTooBig:'ZIP & Archives отваря ZIP до 30 MB.',audioTooBig:'Audio Studio поддържа до 20 MB.',imageTooBig:'Image Studio поддържа до 25 MB.',       videoTooBig:'Video Studio поддържа до 120 MB.',
       quickTitle:'Бързи действия',imageEdit:'✦ Редактирай снимка',imagePdf:'📄 Направи PDF от снимката',pdfOrganize:'📑 Подреди PDF страниците',pdfExtract:'✂️ Извлечи или раздели PDF',
       routePreparing:'Отварям инструмента…',routeReady:'Файлът е предаден към инструмента.',
       manualRoute:'Отворих инструмента, но Chrome не разреши автоматичното предаване. Натисни „Избери файл“ в него и посочи същия файл.',
       noEditor:'Няма редактор за този формат. Можеш да запазиш копие, да споделиш или да избереш друг файл.',
       unsupportedImage:'Редакторът поддържа JPG, PNG и WEBP. Този формат може да се прегледа или сподели, но не и да се обработи тук.',
       moreImage:'За JPG, PNG и WEBP: избери редактор или PDF. Оригиналът остава непроменен.',
       morePdf:'Можеш да подреждаш/завърташ страниците или да извличаш отделни страници.',
       moreZip:'Можеш да отвориш архива и да избереш файлове за извличане.',
       moreAudio:'Аудиото може да се изреже и запази като WAV, ако телефонът го декодира.',
       moreVideo:'Можеш да извличаш кадри; кратък WebM export зависи от Chrome.',
       moreOther:'За този формат са налични запазване на копие и Android Share.',
       fileCheckFailed:'Не мога да проверя файла. Избери го отново и опитай.',
       unsupportedHeader:'Форматът или началото на файла не съответства на разширението. Избери правилния файл.'},
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
      pdfTooBig:'PDF Studio limit is 20 MB per file.',zipTooBig:'ZIP & Archives can open ZIP files up to 30 MB.',audioTooBig:'Audio Studio limit is 20 MB.',imageTooBig:'Image Studio limit is 25 MB.',       videoTooBig:'Video Studio limit is 120 MB.',
       quickTitle:'Quick actions',imageEdit:'✦ Edit image',imagePdf:'📄 Make PDF from this image',pdfOrganize:'📑 Organise PDF pages',pdfExtract:'✂️ Extract or split PDF',
       routePreparing:'Opening the tool…',routeReady:'The file has been passed to the tool.',
       manualRoute:'The tool is open, but Chrome could not pass the file automatically. Tap Choose File there and select the same file.',
       noEditor:'There is no editor for this format. You can save a copy, share it or select another file.',
       unsupportedImage:'The editor accepts JPG, PNG and WEBP. You can preview/share this format but not edit it here.',
       moreImage:'For JPG, PNG and WEBP: choose the editor or make a PDF. Your original is unchanged.',
       morePdf:'Organise/rotate pages or extract a selection into another PDF.',
       moreZip:'Open the archive and choose files to extract.',
       moreAudio:'Trim audio and export WAV when your phone can decode it.',
       moreVideo:'Extract frames; short WebM export depends on Chrome support.',
       moreOther:'You can save a copy or use Android Share for this format.',
       fileCheckFailed:'Unable to check this file. Choose it again and retry.',
       unsupportedHeader:'The file header does not match its extension. Select the correct file.'}
  };
  const lang=()=>window.FileForgeLanguage?.()==='en'?'en':'bg';
  const t=k=>D[lang()][k]||k;
  const size=x=>x>=MIB?(x/MIB).toFixed(2)+' MB':x>=1024?Math.ceil(x/1024)+' KB':x+' B';
  const ext=f=>f.name.split('.').pop()?.toLowerCase()||'';
  const state={file:null,url:null,kind:null,viewId:0,ready:false,invalid:false,checking:false};
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
  const imageEditable=f=>['jpg','jpeg','png','webp'].includes(ext(f)) ||
    ['image/jpeg','image/png','image/webp'].includes((f.type||'').toLowerCase());
  const actionSpecs={
    image:[{name:'imageEdit',target:'fileInput',tab:null,open:null},{name:'imagePdf',target:'pdfInputImages',tab:'images',open:'FileForgeOpenPdf'}],
    pdf:[{name:'pdfOrganize',target:'pdfInputOrganize',tab:'organize',open:'FileForgeOpenPdf'},
      {name:'pdfExtract',target:'pdfInputSplit',tab:'split',open:'FileForgeOpenPdf'}],
    zip:[{name:'zipTool',target:'archiveOpenInput',tab:'open',open:'FileForgeOpenArchives'}],
    audio:[{name:'audioTool',target:'audioInput',tab:null,open:'FileForgeOpenAudio'}],
    video:[{name:'videoTool',target:'videoInput',tab:null,open:'FileForgeOpenVideo'}]
  };
  function availableActions(){
    const file=state.file;
    if(!file||state.checking||state.invalid||limitInfo())return [];
    if(state.kind==='image'&&!imageEditable(file))return [];
    return actionSpecs[state.kind]||[];
  }
  function adviceKey(){
    if(state.kind==='image'&&!imageEditable(state.file))return 'unsupportedImage';
    if(state.kind==='image')return 'moreImage';
    if(state.kind==='pdf')return 'morePdf';
    if(state.kind==='zip')return 'moreZip';
    if(state.kind==='audio')return 'moreAudio';
    if(state.kind==='video')return 'moreVideo';
    return 'moreOther';
  }
  // No data is persisted: File Desk only keeps the selected File in memory.
  function ensureQuickUI(){
    if($('fileDeskQuick'))return;
    const actions=document.querySelector('#fileDeskDetails .ff-desk-actions');
    if(!actions)return;
    const wrap=document.createElement('div');wrap.id='fileDeskQuick';
    wrap.style.cssText='margin:14px 0';
    const heading=document.createElement('strong');heading.id='fileDeskQuickTitle';heading.style.fontSize='13px';
    const choices=document.createElement('div');choices.id='fileDeskQuickChoices';
    choices.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px';
    const hint=document.createElement('p');hint.id='fileDeskQuickHint';hint.className='ff-desk-note';
    wrap.append(heading,choices,hint);
    actions.parentNode.insertBefore(wrap,actions);
  }
  function renderQuick(){
    ensureQuickUI();
    const root=$('fileDeskQuick');if(!root)return;
    root.hidden=!state.file;
    if(!state.file)return;
    $('fileDeskQuickTitle').textContent=t('quickTitle');
    const hint=$('fileDeskQuickHint');hint.textContent=t(adviceKey());
    const choices=$('fileDeskQuickChoices');choices.replaceChildren();
    const actions=availableActions();
    // Existing primary routing button remains the main action. Additional button
    // is shown only when the chosen file supports a second genuine operation.
    const alternatives=actions.length>1?actions.slice(1):[];
    for(const spec of alternatives){
      const btn=document.createElement('button');btn.type='button';btn.className='secondary-button';
      btn.textContent=t(spec.name);btn.dataset.ffDeskAction=spec.name;
      btn.addEventListener('click',()=>routeWith(spec));choices.append(btn);
    }
    $('fileDeskRoute').hidden=actions.length===0;
  }
  async function checkSignature(file,kind){
    // Avoid sending disguised documents to parsers. No upload and no permanent read.
    const e=ext(file);
    if(!(kind==='pdf'||kind==='zip'||(kind==='image'&&['jpg','jpeg','png','webp'].includes(e))))return true;
    const bytes=new Uint8Array(await file.slice(0,1024).arrayBuffer());
    if(kind==='pdf'){
      // Header may appear after a short BOM/preamble.
      const head=new TextDecoder('latin1').decode(bytes);
      return head.indexOf('%PDF-')>=0&&head.indexOf('%PDF-')<1020;
    }
    if(kind==='zip')return bytes[0]===0x50&&bytes[1]===0x4b&&
      ((bytes[2]===3&&bytes[3]===4)||(bytes[2]===5&&bytes[3]===6)||(bytes[2]===7&&bytes[3]===8));
    if(e==='jpg'||e==='jpeg')return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
    if(e==='png')return bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47;
    if(e==='webp')return new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&
      new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
    return true;
  }
  function status(s,error=false){const el=$('fileDeskStatus');if(el){el.textContent=s;el.classList.toggle('ff-desk-error',error);}}
  function clearUrl(){if(state.url){URL.revokeObjectURL(state.url);state.url=null;}}
  function clearPreview(){const preview=$('fileDeskPreview');preview.replaceChildren();}
  function selectEmpty(){state.viewId++;state.file=null;state.kind=null;state.invalid=false;state.checking=false;clearUrl();clearPreview();$('fileDeskDetails').hidden=true;$('fileDeskPlaceholder').hidden=false;renderQuick();status('');}
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
    $('fileDeskRoute').disabled=state.checking||state.invalid||Boolean(limitInfo())||availableActions().length===0;
    renderQuick();
    if(state.invalid)status(t('unsupportedHeader'),true);
    else if(state.checking)status(t('routePreparing'));
    else if(limitInfo())status(limitInfo()+' '+t('chooseSmaller'),true);
    else if(state.kind==='image'&&!imageEditable(file))status(t('unsupportedImage'),true);
    else if(!availableActions().length)status(t('noEditor'));
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
  async function selectFile(file){
    if(!file)return;
    if(!file.size){selectEmpty();status(t('emptyError'),true);return;}
    const selection=++state.viewId;
    clearPreview();clearUrl();
    state.file=file;state.kind=kindOf(file);state.invalid=false;state.checking=true;
    state.url=URL.createObjectURL(file);
    renderActions();preview();
    try{
      const valid=await checkSignature(file,state.kind);
      if(selection!==state.viewId)return;
      state.invalid=!valid;
    }catch(err){
      if(selection!==state.viewId)return;
      console.warn('File Desk signature check:',err);
      state.invalid=true;status(t('fileCheckFailed'),true);
    }finally{
      if(selection===state.viewId){state.checking=false;renderActions();}
    }
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
  function manualNotice(){
    // File Desk is no longer visible after opening a different studio.
    // Make the fallback instructions visible on top of that studio.
    const msg=t('manualRoute');
    let bar=$('ffDeskManualNotice');
    if(!bar){
      bar=document.createElement('div');bar.id='ffDeskManualNotice';
      bar.setAttribute('role','alert');
      bar.style.cssText='position:fixed;z-index:100;bottom:calc(85px + env(safe-area-inset-bottom));left:16px;right:16px;max-width:540px;margin:auto;padding:15px 17px;border:1px solid var(--accent);border-radius:12px;background:var(--surface3);color:var(--ink);box-shadow:0 12px 28px #0004;font-size:13px;line-height:1.5';
      document.body.append(bar);
    }
    bar.textContent=msg;bar.hidden=false;
    clearTimeout(manualNotice.hideTimer);
    manualNotice.hideTimer=setTimeout(()=>{bar.hidden=true;},9500);
  }
  function routeWith(spec){
    if(!state.file||state.checking||state.invalid||limitInfo()||!spec)return;
    const input=$(spec.target);
    if(!input){status(t('transferError'),true);return;}
    const open=spec.open&&window[spec.open];
    // When choosing the document mode, switch the actual tab BEFORE sending
    // the change event; each PDF studio input has a separate listener.
    if(typeof open==='function')open();
    if(spec.tab==='open')document.querySelector('[data-archive-tab="open"]')?.click();
    else if(spec.tab)document.querySelector('[data-pdf-tab="'+spec.tab+'"]')?.click();
    try{
      const transfer=new DataTransfer();transfer.items.add(state.file);
      input.files=transfer.files;
      if(input.files.length!==1)throw Error('File transfer unavailable');
      input.dispatchEvent(new Event('change',{bubbles:true}));
      // The receiving studio owns any subsequent errors, but never claim that
      // processing or exporting succeeded just because the file was handed off.
      status(t('routeReady'));
    }catch(err){
      console.warn('File Desk file hand-off:',err);
      status(t('manualRoute'),true);
      manualNotice();
    }
  }
  function route(){routeWith(availableActions()[0]);}
  function showVersion(){
    // Compatible with older 1.4 index.html: do not replace the page or its
    // other modules just to update the visible version label.
    document.title='FileForge 1.7';
    const versionLabel=document.querySelector('[data-i18n="version"]');
    const row=versionLabel?.closest('.setting-row');
    if(row){
      const detail=row.querySelector('small');if(detail)detail.textContent='FileForge 1.7.0 · PWA';
      const value=row.querySelector(':scope > span');if(value)value.textContent='1.7.0';
    }
    const footer=document.querySelector('.footer');
    if(footer){for(const node of footer.childNodes){if(node.nodeType===3&&/FileForge\s+1\.\d+/.test(node.textContent))node.textContent=node.textContent.replace(/FileForge\s+1\.\d+(?:\.\d+)?/, 'FileForge 1.7');}}
    const hero=document.querySelector('[data-i18n="heroPill"]');
    if(hero)hero.textContent=hero.textContent.replace(/FILEFORGE\s+1\.\d+(?:\.\d+)?/i,'FILEFORGE 1.7');
  }
  function translate(){
    document.querySelectorAll('[data-desk-i18n]').forEach(el=>{const v=D[lang()][el.dataset.deskI18n];if(v)el.textContent=v;});
    if(state.file){renderActions();preview();}
    showVersion();
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
