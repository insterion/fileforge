'use strict';
/* FileForge 0.9 — Direct HTTPS file download and Android system sharing.
   External URLs only requested by user action. Never proxy, bypass CORS or store URLs.
   No uploads: fetched bytes and selected local files remain on this device. */
(() => {
  const $ = (id) => document.getElementById(id);
  const LIMIT = 30 * 1024 * 1024;
  const messages = {
    bg: {
      homeTitle:'⬇️ Downloads & Sharing', homeDesc:'Директни HTTPS линкове · Android Share · файлове към VLC',open:'Отвори Downloads →',toolDesc:'Директни HTTPS файлове · Share · VLC',
      heading:'Линкове и споделяне', intro:'Изтегляй директни публични HTTPS файлове, копирай линкове и споделяй файлове с приложенията на Android.',
      linkHeading:'1. Директен линк към файл', linkHelp:'Постави директен HTTPS адрес към JPG, PDF, MP3, MP4, ZIP или друг файл. Сървърът трябва да позволява CORS. Това не е downloader за YouTube или стрийминг сайтове.',
      urlLabel:'Адрес на файл (HTTPS)',nameLabel:'Име на файла (по избор)',fetch:'↓ Подготви файла',cancel:'Откажи',openLink:'Отвори линка ↗',copyLink:'Копирай линка',shareLink:'Сподели линка',
      resultTitle:'Файлът е готов',save:'↓ Запази файла',shareFile:'Сподели файла',
      corsHelp:'При CORS ограничение използвай „Отвори линка“ и запази файла от браузъра, ако сайтът позволява. Максимум 30 MB. Не заобикаляме пароли и защити.',
      localHeading:'2. Сподели файл от телефона',localHelp:'Избери файл от устройството и използвай Android Share. Ако VLC се предлага в системното меню, избери го. Не всички приложения се показват винаги.',pickFile:'＋ Избери файл от телефона',clearFile:'Премахни избора',
      vlcHelp:'За VLC: опитай „Сподели файла“. Ако VLC не се показва, отвори Downloads/Files → файла → Open with → VLC. Уеб приложението не може принудително да стартира VLC.',
      filterDownloads:'Изтегляния',invalid:'Въведи валиден HTTPS адрес към директен файл.',working:'Изтегляне…',ready:'Готово! Можеш да запазиш или споделиш файла.',
      tooLarge:'Файлът е по-голям от 30 MB.',httpError:'Сървърът върна грешка HTTP ',htmlError:'Линкът води към уеб страница, а не към директен файл.',
      failed:'Файлът не може да се изтегли в PWA. Възможно е сайтът да блокира CORS, да изисква вход или линкът да не е директен. Използвай „Отвори линка“.',
      cancelled:'Изтеглянето е отказано.',timedOut:'Времето за изтегляне изтече. Опитай с по-малък файл.',unknownSize:'размерът не е известен',
      copied:'Линкът е копиран.',copyFailed:'Неуспешно копиране. Копирай адреса ръчно.',shareUnsupported:'Android системното споделяне не се поддържа тук. Можеш да запазиш файла и да използваш Files → Share / Open with.',
      shareCancelled:'Споделянето е отменено.',shareFailed:'Файлът не може да бъде споделен чрез този браузър. Използвай Downloads → Share / Open with.',
      chooseFirst:'Първо избери файл.',localTooBig:'Файлът е прекалено голям за директно споделяне от FileForge (30 MB). Използвай Files на Android.',
      noPreview:'Няма вграден преглед за този формат. Можеш да запазиш или споделиш файла.',opening:'Отваряне на линка…'
    },
    en: {
      homeTitle:'⬇️ Downloads & Sharing',homeDesc:'Direct HTTPS files · Android Share · VLC',open:'Open Downloads →',toolDesc:'Direct HTTPS files · Share · VLC',
      heading:'Downloads & Sharing',intro:'Download publicly accessible direct HTTPS files, copy URLs, and share files with Android apps.',
      linkHeading:'1. Direct file link',linkHelp:'Paste a direct HTTPS link to a JPG, PDF, MP3, MP4, ZIP, or another file. The server must allow CORS. Not a YouTube or streaming-site downloader.',
      urlLabel:'File URL (HTTPS)',nameLabel:'Filename (optional)',fetch:'↓ Prepare file',cancel:'Cancel',openLink:'Open link ↗',copyLink:'Copy link',shareLink:'Share link',
      resultTitle:'File is ready',save:'↓ Save file',shareFile:'Share file',
      corsHelp:'If CORS blocks downloading, choose “Open link” and save the file in the browser if the site allows it. 30 MB limit; no password or DRM bypass.',
      localHeading:'2. Share a local file',localHelp:'Choose a local file and use Android Share. If VLC appears in the Android chooser, you can select it. App availability varies.',pickFile:'＋ Choose file',clearFile:'Clear selection',
      vlcHelp:'For VLC: try “Share file”. If VLC is absent, open Android Downloads/Files → file → Open with → VLC. A PWA cannot force VLC to launch.',
      filterDownloads:'Downloads',invalid:'Enter a valid direct HTTPS file URL.',working:'Downloading…',ready:'Ready! You can save or share the file.',
      tooLarge:'File exceeds the 30 MB limit.',httpError:'Server returned HTTP ',htmlError:'The URL points to a web page, not a direct file.',
      failed:'The PWA cannot fetch this file. The site may block CORS, require a login, or the URL may not be direct. Try “Open link”.',
      cancelled:'Download cancelled.',timedOut:'Download timed out. Try a smaller file.',unknownSize:'size unknown',
      copied:'Link copied.',copyFailed:'Could not copy the link. Copy it manually.',shareUnsupported:'System file sharing is unavailable here. Save the file, then use Android Files → Share / Open with.',
      shareCancelled:'Sharing cancelled.',shareFailed:'Could not share through this browser. Use Downloads → Share / Open with.',
      chooseFirst:'Choose a file first.',localTooBig:'File too large for direct sharing from FileForge (30 MB). Use the Android Files app.',
      noPreview:'No built-in preview for this file type. You can save or share it.',opening:'Opening link…'
    }
  };
  const lang=()=>window.FileForgeLanguage?.()==='en'?'en':'bg';
  const tr=(key)=>messages[lang()][key]||key;
  const state={file:null,blob:null,name:'',blobUrl:null,localUrl:null,controller:null,busy:false,reason:''};
  const size=(n)=>n>=1024*1024?(n/(1024*1024)).toFixed(2)+' MB':n>=1024?Math.round(n/1024)+' KB':n+' B';
  const status=(message,danger=false)=>{const el=$('downloadStatus');el.textContent=message;el.classList.toggle('danger',danger);};
  const progress=(message)=>{$('downloadProgressText').textContent=message;};
  function validUrl() {
    const text=$('downloadUrl').value.trim();
    try {const url=new URL(text);if(url.protocol==='https:' && url.hostname && !url.username && !url.password)return url;}catch{}
    return null;
  }
  function cleanName(value){
    const raw=String(value||'').split(/[\\/]/).pop()||'file';
    const name=raw.replace(/[\u0000-\u001f\u007f<>:"|?*]/g,'_').replace(/[. ]+$/,'').trim().slice(0,110);
    return name && name!=='.' && name!=='..'?name:'file';
  }
  function fromHeader(header){
    if(!header)return '';
    const ext=header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if(ext){try{return decodeURIComponent(ext[1].trim().replace(/^['"]|['"]$/g,''));}catch{}}
    const normal=header.match(/filename\s*=\s*(?:"([^"]+)"|([^;\s]+))/i);
    return normal?(normal[1]||normal[2]):'';
  }
  function fallbackName(url,mime){
    let path='';try{path=decodeURIComponent(url.pathname.split('/').pop()||'');}catch{path=url.pathname.split('/').pop()||'';}
    let name=cleanName(path||'download');
    if(!/\.[a-z\d]{1,8}$/i.test(name)){
      const suffix=({ 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','application/pdf':'.pdf','application/zip':'.zip','audio/mpeg':'.mp3','audio/mp4':'.m4a','video/mp4':'.mp4','audio/wav':'.wav','audio/webm':'.webm','video/webm':'.webm' })[mime]||'';
      name+=suffix;
    }
    return name;
  }
  function clearBlob(){
    if(state.blobUrl)URL.revokeObjectURL(state.blobUrl);
    state.blob=null;state.blobUrl=null;state.name='';$('downloadResult').hidden=true;
    $('downloadSave').removeAttribute('href');$('downloadSave').removeAttribute('download');$('downloadPreview').replaceChildren();
  }
  function clearLocal(){
    if(state.localUrl)URL.revokeObjectURL(state.localUrl);
    state.file=null;state.localUrl=null;$('downloadLocalInput').value='';$('downloadLocalPreview').replaceChildren();$('downloadLocalDetails').hidden=true;
  }
  function setBusy(value){
    state.busy=value;$('downloadFetch').disabled=value;$('downloadCancel').hidden=!value;
    $('downloadProgress').hidden=!value;
    if(!value){$('downloadProgress').value=0;progress('');}
  }
  function mediaPreview(container,blob,url){
    container.replaceChildren();
    let element;
    const type=blob.type.toLowerCase();
    if(type==='image/jpeg'||type==='image/png'||type==='image/webp'||type==='image/gif'){
      element=document.createElement('img');element.alt=lang()==='bg'?'Преглед на снимката':'Image preview';
    }else if(type.startsWith('audio/')){
      element=document.createElement('audio');element.controls=true;element.preload='metadata';
    }else if(type.startsWith('video/')){
      element=document.createElement('video');element.controls=true;element.playsInline=true;element.preload='metadata';
    }
    if(element){element.src=url;container.append(element);}
    else {const p=document.createElement('p');p.className='pdf-help';p.textContent=tr('noPreview');container.append(p);}
  }
  function shareFile(file){
    if(!file){status(tr('chooseFirst'),true);return;}
    if(file.size>LIMIT){status(tr('localTooBig'),true);return;}
    if(typeof navigator.share!=='function'||typeof navigator.canShare!=='function'||!navigator.canShare({files:[file]})){
      status(tr('shareUnsupported'),true);return;
    }
    // IMPORTANT: call navigator.share during the click, before any asynchronous operations.
    navigator.share({files:[file],title:file.name}).catch((error)=>{
      if(error?.name==='AbortError')status(tr('shareCancelled'));
      else {console.warn('File share failed',error);status(tr('shareFailed'),true);}
    });
  }
  async function fetchFile(){
    if(state.busy)return;
    const url=validUrl();if(!url){status(tr('invalid'),true);return;}
    clearBlob();status('');state.reason='';
    const controller=new AbortController();state.controller=controller;setBusy(true);
    const timeout=setTimeout(()=>{state.reason='timeout';controller.abort();},90000);
    $('downloadProgress').removeAttribute('value');progress(tr('working'));
    try{
      // Explicit CORS only; never no-cors, proxy servers, cookies or bypasses.
      const response=await fetch(url.href,{mode:'cors',credentials:'omit',redirect:'follow',cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error('http:'+response.status);
      if(!response.url.startsWith('https://'))throw new Error('invalid');
      const mime=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
      if(mime==='text/html'||mime==='application/xhtml+xml')throw new Error('html');
      const declared=Number(response.headers.get('content-length'));
      if(Number.isFinite(declared)&&declared>LIMIT)throw new Error('large');
      if(!response.body)throw new Error('stream');
      const reader=response.body.getReader();
      let received=0;const chunks=[];
      while(true){
        const {done,value}=await reader.read();if(done)break;
        received+=value.byteLength;
        if(received>LIMIT){reader.cancel().catch(()=>{});throw new Error('large');}
        chunks.push(value);
        if(declared>0){$('downloadProgress').value=Math.min(100,Math.round(received/declared*100));}
        progress(`${tr('working')} ${size(received)}${declared>0?' / '+size(declared):' ('+tr('unknownSize')+')'}`);
      }
      if(received===0)throw new Error('empty');
      const blob=new Blob(chunks,{type:mime||'application/octet-stream'});
      // Some servers return HTML while mislabelling Content-Type.
      if(mime===''||mime==='application/octet-stream'||mime==='text/plain'){
        const prefix=(await blob.slice(0,160).text()).trimStart().toLowerCase();
        if(prefix.startsWith('<!doctype html')||prefix.startsWith('<html'))throw new Error('html');
      }
      const headerName=fromHeader(response.headers.get('content-disposition'));
      const name=cleanName($('downloadName').value.trim()||headerName||fallbackName(new URL(response.url),mime));
      state.blob=blob;state.name=name;state.blobUrl=URL.createObjectURL(blob);
      $('downloadSave').href=state.blobUrl;$('downloadSave').download=name;
      $('downloadResultInfo').textContent=`${name} · ${size(blob.size)}`;
      $('downloadResult').hidden=false;mediaPreview($('downloadPreview'),blob,state.blobUrl);
      window.FileForgeAddDownloadHistory?.({kind:'download',name,output:name,time:Date.now(),before:0,after:blob.size});
      status(tr('ready'));
    }catch(error){
      console.warn('FileForge direct file fetch:',error);
      const msg=error.message==='large'?tr('tooLarge'):error.message==='html'?tr('htmlError'):
        error.message?.startsWith('http:')?tr('httpError')+error.message.slice(5):
        error.name==='AbortError'?(state.reason==='timeout'?tr('timedOut'):tr('cancelled')):tr('failed');
      status(msg,true);
    }finally{
      clearTimeout(timeout);state.controller=null;setBusy(false);
    }
  }
  function openLink(){const url=validUrl();if(!url){status(tr('invalid'),true);return;}window.open(url.href,'_blank','noopener,noreferrer');}
  function copyLink(){
    const url=validUrl();if(!url){status(tr('invalid'),true);return;}
    if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url.href).then(()=>status(tr('copied'))).catch(()=>status(tr('copyFailed'),true));}
    else {const field=$('downloadUrl');field.focus();field.select();status(tr('copyFailed'),true);}
  }
  function shareLink(){
    const url=validUrl();if(!url){status(tr('invalid'),true);return;}
    if(typeof navigator.share!=='function'){copyLink();return;}
    navigator.share({title:'File link',url:url.href}).catch((e)=>{if(e?.name==='AbortError')status(tr('shareCancelled'));else status(tr('shareFailed'),true);});
  }
  function selectLocal(file){
    clearLocal();if(!file)return;
    if(file.size>LIMIT){status(tr('localTooBig'),true);return;}
    state.file=file;$('downloadLocalName').textContent=file.name;$('downloadLocalMeta').textContent=size(file.size)+' · '+(file.type||'Unknown type');
    state.localUrl=URL.createObjectURL(file);
    mediaPreview($('downloadLocalPreview'),file,state.localUrl);
    $('downloadLocalDetails').hidden=false;status('');
  }
  function translate(){
    document.querySelectorAll('[data-download-i18n]').forEach(el=>{
      const key=el.dataset.downloadI18n;if(messages[lang()][key])el.textContent=tr(key);
    });
    if(state.file)mediaPreview($('downloadLocalPreview'),state.file,state.localUrl);
    if(state.blob)mediaPreview($('downloadPreview'),state.blob,state.blobUrl);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('downloadsOpenHome').addEventListener('click',()=>window.FileForgeOpenDownloads?.());
    $('downloadsOpenTools').addEventListener('click',()=>window.FileForgeOpenDownloads?.());
    $('downloadFetch').addEventListener('click',fetchFile);
    $('downloadCancel').addEventListener('click',()=>{state.reason='cancel';state.controller?.abort();});
    $('downloadOpenUrl').addEventListener('click',openLink);
    $('downloadCopyUrl').addEventListener('click',copyLink);
    $('downloadShareUrl').addEventListener('click',shareLink);
    $('downloadShareResult').addEventListener('click',()=>shareFile(state.blob?new File([state.blob],state.name,{type:state.blob.type}):null));
    $('downloadPickFile').addEventListener('click',()=>{$('downloadLocalInput').value='';$('downloadLocalInput').click();});
    $('downloadLocalInput').addEventListener('change',e=>selectLocal(e.target.files?.[0]));
    $('downloadShareLocal').addEventListener('click',()=>shareFile(state.file));
    $('downloadClearLocal').addEventListener('click',clearLocal);
    translate();
  });
  window.DownloadsStudio={translate};
})();
