'use strict';

// FileForge 0.5.0: no external API or file upload. Local metadata only.
const $ = (id) => document.getElementById(id);
const I18N = {
  bg: {
    archivesTitle:'ZIP & Archives',
    workspace:'РАБОТНО ПРОСТРАНСТВО',navHome:'Начало',navTools:'Инструменти',navHistory:'История',navSettings:'Настройки',offlineTag:'Локална обработка · Без акаунт',appTag:'YOUR FILES. YOUR TOOLS.',homeTitle:'Начало',heroPill:'FILEFORGE 0.5 · IMAGE + PDF + ZIP + BATCH',heroTitle:'Твоите файлове.<br>Твоят контрол.',heroDesc:'Конвертирай, компресирай и редактирай снимки директно на телефона — без качване на сървър.',chooseImage:'Избери снимка',noUpload:'Без качване',noLogin:'Без регистрация',quickTools:'Бързи инструменти',quickToolsDesc:'Избери какво искаш да направиш',viewAll:'Виж всички →',convert:'Конвертиране',compress:'Компресиране',resize:'Преоразмеряване',cropRotate:'Изрязване и завъртане',smallerImage:'По-малък файл',changeResolution:'Промени резолюцията',privateHeading:'Личните файлове остават при теб',privateDesc:'Обработката става в браузъра. Историята пази само имена и информация, не копия на снимките.',allTools:'Всички инструменти',availableNow:'Активните инструменти са отбелязани. Останалите предстоят.',imagesStudio:'Снимки',imagesDescription:'Convert, Compress, Resize, Crop, Rotate, Adjust',ready:'Работи',soon:'Скоро',editorHeading:'Редактор на изображения',editorIntro:'Оригиналът не се променя. Запазваш нов файл.',newImage:'＋ Друга снимка',original:'Оригинал',result:'Резултат',resultHint:'Избери настройки и натисни „Обработи“',processingSettings:'Настройки за обработка',format:'Изходен формат',longSide:'Максимална дълга страна',originalSize:'Оригинален размер',crop:'Централно изрязване',noCrop:'Без изрязване',rotate:'Завъртане',quality:'Качество',qualityInfo:'За JPG/WEBP. При PNG не се използва.',limitsNote:'Максимум 25 MB / 32 MP на снимка. При големи снимки използвай 1920 px.',process:'✦ Обработи снимката',processing:'Обработва се…',download:'↓ Изтегли резултата',resetResult:'Изчисти резултата',historyTitle:'Последни операции',historyDesc:'История само с метаданни на това устройство.',clearHistory:'Изчисти историята',emptyHistoryTitle:'Все още няма история',emptyHistoryDesc:'След първата обработка тя ще се появи тук.',settingsHeading:'Настройки',settingsIntro:'Персонализирай FileForge за твоето устройство.',appearance:'Външен вид',appearanceDesc:'Избирай между светла, тъмна и системна тема',system:'Системна',dark:'Тъмна',light:'Светла',language:'Език',languageDesc:'Език на интерфейса',privacy:'Поверителност',privacySettings:'Снимките, PDF и ZIP файловете се обработват локално. Историята е само на това устройство.',version:'Версия',offlineTitle:'Инсталация и offline',offlineText:'Отвори сайта през Chrome → меню ⋮ → Add to Home screen / Install app. След успешното първо зареждане основните файлове се запазват за работа без интернет.',footer:'Made for your files, not your data.',chooseFirst:'Първо избери снимка.',unsupported:'Избери JPG, PNG или WEBP файл.',tooBig:'Файлът е по-голям от 25 MB.',tooManyPixels:'Изображението е над 32 мегапиксела.',openError:'Снимката не може да се отвори.',processError:'Неуспешна обработка. Опитай с по-малка снимка.',formatError:'Браузърът не поддържа избрания изходен формат.',success:'Файлът е готов за изтегляне.',nothingToClear:'Няма резултат за изчистване.',historyCleared:'Историята е изчистена.',confirmClear:'Сигурен ли си, че искаш да изтриеш историята?',smaller:'по-малък',larger:'по-голям',same:'същия размер',source:'изходен',exported:'резултат',operations:'операции',fileLoaded:'Снимката е заредена.',adjustmentsTitle:'Цветове и ефекти',resetAdjustments:'Нулирай',brightness:'Яркост',contrast:'Контраст',saturation:'Наситеност',grayscale:'Черно-бяло изображение',flip:'Огледално обръщане',flipNone:'Без обръщане',flipHorizontal:'Хоризонтално',flipVertical:'Вертикално',flipBoth:'И двете',installCardTitle:'Инсталирай FileForge на телефона',installCardHelp:'Работи и offline след първото зареждане.',installButton:'Инсталирай',installHelpButton:'Как да инсталирам?',pwaSettingsTitle:'PWA инсталация',pwaSettingsDesc:'Проверка и инструкции за Android Chrome.',secureStatus:'Сигурна връзка (HTTPS)',installInstructions:'Отвори адреса https://...github.io/fileforge/ директно в Chrome, не в GitHub, ChatGPT или файловия мениджър. Избери ⋮ → Add to Home screen → Install app. Ако опцията липсва, провери показаните статуси и презареди.',pwaInstalled:'FileForge вече работи като инсталирано приложение.',pwaReady:'Chrome предлага инсталация. Натисни бутона „Инсталирай“.',pwaManual:'В Chrome отвори ⋮ → Add to Home screen → Install app. Ако няма опция, отвори сайта директно през Chrome и провери HTTPS, Manifest и Service Worker.',pwaUnsecure:'За PWA е нужен HTTPS адресът на GitHub Pages, а не файл, отворен от Downloads.',pwaDenied:'Инсталацията не е потвърдена. Може да опиташ от менюто на Chrome.',pwaError:'Автоматичното инсталиране не е налично. Използвай менюто на Chrome.',pwaManifestIssue:'Manifest не е намерен или е невалиден. Качи manifest.webmanifest в главната папка на GitHub.',pwaWorkerIssue:'Service Worker не е готов. Провери sw.js и презареди сайта.',pwaNotAvailable:'Не се поддържа',pwaYes:'✓ Готово',pwaNo:'✕ Проблем',pwaChecking:'Проверка…',bgLabel:'Български',enLabel:'English'
  },
  en: {
    archivesTitle:'ZIP & Archives',
    workspace:'WORKSPACE',navHome:'Home',navTools:'Tools',navHistory:'History',navSettings:'Settings',offlineTag:'Local processing · No account',appTag:'YOUR FILES. YOUR TOOLS.',homeTitle:'Home',heroPill:'FILEFORGE 0.5 · IMAGE + PDF + ZIP + BATCH',heroTitle:'Your files.<br>Your control.',heroDesc:'Convert, compress and edit pictures directly on your phone — no server uploads.',chooseImage:'Choose image',noUpload:'No uploads',noLogin:'No sign-up',quickTools:'Quick tools',quickToolsDesc:'Choose what you want to do',viewAll:'View all →',convert:'Convert',compress:'Compress',resize:'Resize',cropRotate:'Crop & rotate',smallerImage:'Smaller file',changeResolution:'Change resolution',privateHeading:'Your private files stay with you',privateDesc:'Processing happens in your browser. History saves filenames and metadata, not copies of your pictures.',allTools:'All tools',availableNow:'Working tools are marked. More tools are coming later.',imagesStudio:'Images',imagesDescription:'Convert, Compress, Resize, Crop, Rotate, Adjust',ready:'Ready',soon:'Soon',editorHeading:'Image editor',editorIntro:'Your original stays untouched. Export a new copy.',newImage:'＋ Another image',original:'Original',result:'Result',resultHint:'Choose your settings and tap “Process image”',processingSettings:'Processing settings',format:'Export format',longSide:'Maximum long side',originalSize:'Original size',crop:'Centre crop',noCrop:'No crop',rotate:'Rotate',quality:'Quality',qualityInfo:'For JPG/WEBP. Not used for PNG.',limitsNote:'Maximum 25 MB / 32 MP per image. Use 1920 px for large pictures.',process:'✦ Process image',processing:'Processing…',download:'↓ Download result',resetResult:'Clear result',historyTitle:'Recent operations',historyDesc:'Metadata-only history on this device.',clearHistory:'Clear history',emptyHistoryTitle:'No history yet',emptyHistoryDesc:'Your first processed image will appear here.',settingsHeading:'Settings',settingsIntro:'Make FileForge work the way you want.',appearance:'Appearance',appearanceDesc:'Choose light, dark or device theme',system:'System',dark:'Dark',light:'Light',language:'Language',languageDesc:'Interface language',privacy:'Privacy',privacySettings:'Images, PDFs and ZIP files are processed locally. History stays on this device.',version:'Version',offlineTitle:'Install & offline',offlineText:'Open the site in Chrome → menu ⋮ → Add to Home screen / Install app. Once the essential files are cached successfully, the main app works offline.',footer:'Made for your files, not your data.',chooseFirst:'Choose an image first.',unsupported:'Choose a JPG, PNG or WEBP file.',tooBig:'This file is larger than 25 MB.',tooManyPixels:'This image is larger than 32 megapixels.',openError:'Cannot open this image.',processError:'Processing failed. Try a smaller image.',formatError:'Your browser does not support this output format.',success:'Your file is ready to download.',nothingToClear:'No result to clear.',historyCleared:'History cleared.',confirmClear:'Are you sure you want to clear the history?',smaller:'smaller',larger:'larger',same:'same size',source:'source',exported:'result',operations:'operations',fileLoaded:'Image loaded.',adjustmentsTitle:'Colours & effects',resetAdjustments:'Reset',brightness:'Brightness',contrast:'Contrast',saturation:'Saturation',grayscale:'Black and white',flip:'Mirror / flip',flipNone:'No flip',flipHorizontal:'Horizontal',flipVertical:'Vertical',flipBoth:'Both',installCardTitle:'Install FileForge on your phone',installCardHelp:'Works offline after the first successful visit.',installButton:'Install app',installHelpButton:'How to install',pwaSettingsTitle:'PWA installation',pwaSettingsDesc:'Requirements and Android Chrome instructions.',secureStatus:'Secure connection (HTTPS)',installInstructions:'Open the https://...github.io/fileforge/ URL directly in Chrome, not in GitHub, ChatGPT, or a file manager. Select ⋮ → Add to Home screen → Install app. If the option is missing, check the statuses shown and refresh.',pwaInstalled:'FileForge is already running as an installed app.',pwaReady:'Chrome supports installation. Tap Install app.',pwaManual:'In Chrome open ⋮ → Add to Home screen → Install app. If missing, open the website directly in Chrome and check HTTPS, Manifest and Service Worker.',pwaUnsecure:'PWA installation needs the HTTPS GitHub Pages address, not a file opened from Downloads.',pwaDenied:'Installation was not confirmed. You can try again in the Chrome menu.',pwaError:'Automatic installation is unavailable. Use the Chrome menu.',pwaManifestIssue:'Manifest is missing or invalid. Upload manifest.webmanifest to the GitHub root folder.',pwaWorkerIssue:'Service Worker is not ready. Check sw.js and refresh.',pwaNotAvailable:'Unsupported',pwaYes:'✓ Ready',pwaNo:'✕ Error',pwaChecking:'Checking…',bgLabel:'Български',enLabel:'English'
  }
};

const STORAGE = {prefs:'fileforge_prefs_v1',history:'fileforge_history_v1'};
const SUPPORTED = new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']]);
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_PIXELS = 32_000_000;
const state = {page:'home',file:null,sourceUrl:null,resultUrl:null,history:[],prefs:{theme:'system',language:'bg'},timer:null,busy:false,deferredInstall:null,manifestOK:null,workerOK:null};

function readJson(key,fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function storeJson(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* Browsers may deny storage. File editing still works. */ } }
function t(key) { return I18N[state.prefs.language][key] || I18N.bg[key] || key; }
function bytes(num) { if (num >= 1024*1024) return (num/(1024*1024)).toFixed(2)+' MB'; if (num >= 1024) return Math.round(num/1024)+' KB'; return num+' B'; }
function showToast(message) { const el=$('toast'); el.textContent=message; el.hidden=false; clearTimeout(state.timer); state.timer=setTimeout(()=>{el.hidden=true;},3800); }
function translate() {
  document.documentElement.lang=state.prefs.language;
  document.querySelectorAll('[data-i18n]').forEach((el)=>{
    const key=el.dataset.i18n;
    if(key==='heroTitle') el.innerHTML=t(key); // Only static, hardcoded local translation.
    else el.textContent=t(key);
  });
  $('languageQuick').textContent=state.prefs.language==='bg'?'EN':'BG';
  $('languageSetting').value=state.prefs.language;
  $('pageTitle').textContent=state.page==='editor'?t('imagesStudio'):state.page==='pdf'?'PDF Studio':state.page==='archives'?t('archivesTitle'):state.page==='batch'?'Batch Images':t({home:'navHome',tools:'navTools',history:'navHistory',settings:'navSettings'}[state.page]);
  $('processButton').textContent=state.busy?t('processing'):t('process');
  renderHistory();
  window.FileForgeLibrary?.translate();
  window.BatchStudio?.translate();
  updateSourceLabel();
  renderInstallUI();
  window.PDFStudio?.translate();
  window.ArchiveStudio?.translate();
}
function applyTheme() {
  const preferred=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  const actual=state.prefs.theme==='system'?preferred:state.prefs.theme;
  document.documentElement.dataset.theme=actual;
  $('themeSetting').value=state.prefs.theme;
  $('themeQuick').textContent=actual==='dark'?'☼':'☾';
  document.querySelector('meta[name="theme-color"]').content=actual==='dark'?'#0a111b':'#f4f7fb';
}
function savePrefs() { storeJson(STORAGE.prefs,state.prefs); applyTheme(); translate(); }
function navigate(page) {
  if(page==='editor'&&!state.file){showToast(t('chooseFirst'));page='home';}
  state.page=page;
  document.querySelectorAll('.page').forEach((el)=>{ const current=el.id==='page-'+page; el.hidden=!current; el.classList.toggle('active',current); });
  document.querySelectorAll('[data-nav]').forEach((el)=>el.classList.toggle('active',el.dataset.nav===((page==='editor'||page==='pdf'||page==='archives'||page==='batch')?'tools':page)));
  $('pageTitle').textContent=page==='editor'?t('imagesStudio'):page==='pdf'?'PDF Studio':page==='archives'?t('archivesTitle'):page==='batch'?'Batch Images':t({home:'navHome',tools:'navTools',history:'navHistory',settings:'navSettings'}[page]);
  window.scrollTo(0,0);
}
function chooseImage() { if(state.busy)return; $('fileInput').value=''; $('fileInput').click(); }
function freeUrl(key) { if(state[key]) URL.revokeObjectURL(state[key]); state[key]=null; }
function clearResult() {
  freeUrl('resultUrl');
  $('resultPreview').hidden=true;
  $('resultPreview').removeAttribute('src');
  $('resultPlaceholder').hidden=false;
  $('resultInfo').textContent='—';
  $('resultSummary').textContent='';
  $('downloadButton').hidden=true;
  $('downloadButton').removeAttribute('href');
}
function updateQuality() {
  $('qualityValue').textContent=$('quality').value+'%';
  const png=$('outputFormat').value==='image/png';
  $('quality').disabled=png;
  $('qualityRow').classList.toggle('is-disabled',png);
}
function updateAdjustmentLabels() {
  for (const id of ['brightness','contrast','saturation']) $(id+'Value').textContent=$(id).value+'%';
}
function resetAdjustments() {
  $('brightness').value='100'; $('contrast').value='100'; $('saturation').value='100';
  $('grayscale').checked=false; $('flip').value='none';
  updateAdjustmentLabels(); clearResult();
}
function updateSourceLabel() {
  if(!state.file)return;
  $('fileName').textContent=state.file.name;
  const dimensions=state.width?state.width+' × '+state.height+' px · ':'';
  $('sourceInfo').textContent=dimensions+bytes(state.file.size);
}
async function openFile(file) {
  if(!file)return;
  const mime=file.type.toLowerCase();
  const ext=file.name.split('.').pop()?.toLowerCase();
  if(!SUPPORTED.has(mime) && !['jpg','jpeg','png','webp'].includes(ext)){showToast(t('unsupported'));return;}
  if(file.size>MAX_BYTES){showToast(t('tooBig'));return;}
  let bitmap;
  try {
    bitmap=await createImageBitmap(file);
    if(bitmap.width*bitmap.height>MAX_PIXELS){showToast(t('tooManyPixels'));return;}
    const w=bitmap.width,h=bitmap.height;
    freeUrl('sourceUrl');clearResult();
    state.file=file;state.width=w;state.height=h;
    state.sourceUrl=URL.createObjectURL(file);
    $('sourcePreview').src=state.sourceUrl;
    $('outputFormat').value=SUPPORTED.has(mime)?mime:(ext==='png'?'image/png':ext==='webp'?'image/webp':'image/jpeg');
    $('maxSize').value='1920';$('cropRatio').value='none';$('rotation').value='0';$('quality').value='82';
    resetAdjustments();updateQuality();updateSourceLabel();navigate('editor');showToast(t('fileLoaded'));
  } catch(error) { console.warn('Image open failed:',error);showToast(t('openError')); }
  finally { if(bitmap)bitmap.close(); }
}
async function exportImage() {
  if(!state.file || state.busy)return;
  state.busy=true;$('processButton').disabled=true;$('processButton').textContent=t('processing');
  clearResult();let bitmap;
  try {
    // Let the busy state paint before the browser starts image work.
    await new Promise((resolve)=>requestAnimationFrame(()=>setTimeout(resolve,0)));
    bitmap=await createImageBitmap(state.file);
    const cropValue=$('cropRatio').value;
    let sx=0,sy=0,sw=bitmap.width,sh=bitmap.height;
    if(cropValue!=='none') {
      const target=Number(cropValue);
      if(sw/sh>target){const newW=sh*target;sx=(sw-newW)/2;sw=newW;}
      else {const newH=sw/target;sy=(sh-newH)/2;sh=newH;}
    }
    const degrees=Number($('rotation').value);
    const swap=degrees===90||degrees===270;
    const rotatedW=swap?sh:sw,rotatedH=swap?sw:sh;
    const limit=Number($('maxSize').value);
    const scale=limit?Math.min(1,limit/Math.max(rotatedW,rotatedH)):1;
    const width=Math.max(1,Math.round(rotatedW*scale));
    const height=Math.max(1,Math.round(rotatedH*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx)throw new Error('Canvas unavailable');
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const format=$('outputFormat').value;
    if(format==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);}
    const flip=$('flip').value;
    ctx.translate(width/2,height/2);
    ctx.scale(flip==='horizontal'||flip==='both'?-1:1,flip==='vertical'||flip==='both'?-1:1);
    ctx.rotate(degrees*Math.PI/180);
    ctx.filter=`brightness(${$('brightness').value}%) contrast(${$('contrast').value}%) saturate(${$('saturation').value}%) grayscale(${$('grayscale').checked?100:0}%)`;
    const outW=swap?height:width,outH=swap?width:height;
    ctx.drawImage(bitmap,sx,sy,sw,sh,-outW/2,-outH/2,outW,outH);
    const quality=Number($('quality').value)/100;
    const blob=await new Promise((resolve,reject)=>canvas.toBlob((value)=>value?resolve(value):reject(new Error('Export failed')),format,quality));
    if(blob.type!==format)throw new Error('Unsupported export MIME: '+blob.type);
    state.resultUrl=URL.createObjectURL(blob);
    $('resultPreview').src=state.resultUrl;$('resultPreview').hidden=false;$('resultPlaceholder').hidden=true;
    $('resultInfo').textContent=width+' × '+height+' px · '+bytes(blob.size);
    const difference=Math.abs((1-blob.size/state.file.size)*100).toFixed(1);
    const change=blob.size<state.file.size?t('smaller'):blob.size>state.file.size?t('larger'):t('same');
    $('resultSummary').textContent=change===t('same')?t('same'):`${difference}% ${change} (${bytes(state.file.size)} → ${bytes(blob.size)})`;
    const suffix=SUPPORTED.get(format);
    const cleanBase=state.file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]+/g,'_').slice(0,65)||'image';
    const name=cleanBase+'-fileforge.'+suffix;
    $('downloadButton').href=state.resultUrl;$('downloadButton').download=name;$('downloadButton').hidden=false;
    state.history.unshift({name:state.file.name,output:name,time:Date.now(),before:state.file.size,after:blob.size,width,height});
    state.history=state.history.slice(0,40);storeJson(STORAGE.history,state.history);renderHistory();
    showToast(t('success'));
  } catch(error) { console.error(error);clearResult();showToast(error.message?.startsWith('Unsupported export MIME')?t('formatError'):t('processError')); }
  finally { if(bitmap)bitmap.close();state.busy=false;$('processButton').disabled=false;$('processButton').textContent=t('process'); }
}
function renderHistory() {
  if (window.FileForgeLibrary?.renderHistory) return window.FileForgeLibrary.renderHistory();
  const list=$('historyList');list.replaceChildren();
  $('emptyHistory').hidden=state.history.length!==0;
  $('clearHistory').disabled=state.history.length===0;
  for(const record of state.history){
    const row=document.createElement('div');row.className='history-row';
    const symbol=document.createElement('div');symbol.className='history-icon';symbol.textContent=record.kind==='pdf'?'📄':record.kind==='zip'?'🗜️':'🖼️';
    const main=document.createElement('div');main.className='history-main';
    const name=document.createElement('div');name.className='history-name';name.textContent=record.output;
    const meta=document.createElement('div');meta.className='history-meta';
    const date=new Date(record.time).toLocaleString(state.prefs.language==='bg'?'bg-BG':'en-GB');
    meta.textContent=record.kind==='zip'?`${date} · ${record.files} ${state.prefs.language==='bg'?'файла':'files'} · ${bytes(record.after)}`:record.kind==='pdf'?`${date} · ${record.pages} ${state.prefs.language==='bg'?'стр.':'pages'} · ${bytes(record.after)}`:`${date} · ${record.width} × ${record.height} px · ${bytes(record.before)} → ${bytes(record.after)}`;
    main.append(name,meta);row.append(symbol,main);list.append(row);
  }
}
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function renderInstallUI() {
  // A manifest + SW may be valid even if the browser has not offered an install prompt yet.
  const installed=isStandalone();
  $('installCard').hidden=installed;
  $('installSettingsButton').hidden=installed;
  $('installHome').textContent=state.deferredInstall?t('installButton'):t('installHelpButton');
  $('installSettingsButton').textContent=state.deferredInstall?t('installButton'):t('installHelpButton');
  let status;
  if(installed)status=t('pwaInstalled');
  else if(!window.isSecureContext)status=t('pwaUnsecure');
  else if(state.manifestOK===false)status=t('pwaManifestIssue');
  else if(state.workerOK===false)status=t('pwaWorkerIssue');
  else if(state.deferredInstall)status=t('pwaReady');
  else status=t('pwaManual');
  $('installStatus').textContent=status;
  $('installHomeStatus').textContent=state.deferredInstall?t('pwaReady'):status;
  $('pwaSecure').textContent=window.isSecureContext?t('pwaYes'):t('pwaNo');
  $('pwaManifest').textContent=state.manifestOK===null?t('pwaChecking'):state.manifestOK?t('pwaYes'):t('pwaNo');
  $('pwaWorker').textContent=state.workerOK===null?t('pwaChecking'):state.workerOK?t('pwaYes'):t('pwaNo');
}
async function startInstall() {
  const prompt=state.deferredInstall;
  if(prompt){
    state.deferredInstall=null;
    try {
      await prompt.prompt();
      const choice=await prompt.userChoice;
      if(choice?.outcome!=='accepted')showToast(t('pwaDenied'));
    } catch(error) {
      console.warn('PWA prompt:',error);showToast(t('pwaError'));
    }
    renderInstallUI();
  } else {
    navigate('settings');
    showToast(window.isSecureContext?t('pwaManual'):t('pwaUnsecure'));
    $('installStatus').scrollIntoView({block:'center',behavior:'smooth'});
  }
}
async function checkInstallability() {
  // The direct file:// version will not be installable; the deployed HTTPS site can be.
  try {
    const response=await fetch('./manifest.webmanifest', {cache:'no-store'});
    if(!response.ok)throw new Error('Manifest HTTP '+response.status);
    const manifest=await response.json();
    state.manifestOK=Boolean((manifest.name||manifest.short_name)&&manifest.start_url&&
      ['standalone','fullscreen','minimal-ui','window-controls-overlay'].includes(manifest.display)&&
      manifest.icons?.some(i=>i.sizes?.includes('192x192'))&&
      manifest.icons?.some(i=>i.sizes?.includes('512x512')));
  } catch(error) {state.manifestOK=false;console.warn('PWA manifest:',error);}
  renderInstallUI();
  if(!('serviceWorker' in navigator)||!window.isSecureContext){state.workerOK=false;renderInstallUI();return;}
  try {
    const registration=await navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'});
    const ready=await Promise.race([navigator.serviceWorker.ready,new Promise((resolve)=>setTimeout(()=>resolve(null),6000))]);
    state.workerOK=Boolean(ready || registration.active);
  } catch(error) {state.workerOK=false;console.warn('PWA service worker:',error);}
  renderInstallUI();
}
function initialize() {
  const prefs=readJson(STORAGE.prefs,{});
  if(['bg','en'].includes(prefs.language))state.prefs.language=prefs.language;
  if(['system','light','dark'].includes(prefs.theme))state.prefs.theme=prefs.theme;
  const savedHistory=readJson(STORAGE.history,[]);state.history=Array.isArray(savedHistory)?savedHistory.slice(0,40):[];
  applyTheme();translate();navigate('home');updateQuality();updateAdjustmentLabels();
  document.querySelectorAll('[data-nav]').forEach((button)=>button.addEventListener('click',()=>navigate(button.dataset.nav)));
  document.querySelectorAll('[data-open]').forEach((button)=>button.addEventListener('click',()=>navigate(button.dataset.open)));
  document.querySelectorAll('[data-action="pick"]').forEach((button)=>button.addEventListener('click',chooseImage));
  $('heroChoose').addEventListener('click',chooseImage);$('newFile').addEventListener('click',chooseImage);
  $('fileInput').addEventListener('change',(event)=>openFile(event.target.files?.[0]));
  $('processButton').addEventListener('click',exportImage);
  $('clearResult').addEventListener('click',()=>{if(state.resultUrl)clearResult();else showToast(t('nothingToClear'));});
  ['outputFormat','maxSize','cropRatio','rotation','quality','brightness','contrast','saturation','grayscale','flip'].forEach((id)=>$(id).addEventListener('input',()=>{if(!state.busy)clearResult();updateQuality();updateAdjustmentLabels();}));
  $('resetAdjustments').addEventListener('click',()=>{if(!state.busy)resetAdjustments();});
  $('installHome').addEventListener('click',startInstall);
  $('installSettingsButton').addEventListener('click',startInstall);
  window.addEventListener('beforeinstallprompt',(event)=>{event.preventDefault();state.deferredInstall=event;renderInstallUI();});
  window.addEventListener('appinstalled',()=>{state.deferredInstall=null;renderInstallUI();});
  $('clearHistory').addEventListener('click',()=>{if(!state.history.length)return;if(!window.confirm(t('confirmClear')))return;state.history=[];storeJson(STORAGE.history,[]);renderHistory();showToast(t('historyCleared'));});
  $('languageQuick').addEventListener('click',()=>{state.prefs.language=state.prefs.language==='bg'?'en':'bg';savePrefs();});
  $('themeQuick').addEventListener('click',()=>{state.prefs.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';savePrefs();});
  $('languageSetting').addEventListener('change',(event)=>{state.prefs.language=event.target.value;savePrefs();});
  $('themeSetting').addEventListener('change',(event)=>{state.prefs.theme=event.target.value;savePrefs();});
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(state.prefs.theme==='system')applyTheme();});
  const hero=document.querySelector('.hero');
  hero.addEventListener('dragover',(event)=>{event.preventDefault();});
  hero.addEventListener('drop',(event)=>{event.preventDefault();openFile(event.dataTransfer?.files?.[0]);});
  renderInstallUI();
  checkInstallability();
}
window.FileForgeOpenPdf=()=>navigate('pdf');
window.FileForgeOpenArchives=()=>navigate('archives');
window.FileForgeOpenBatch=()=>navigate('batch');
window.FileForgeGetHistory=()=>state.history;
window.FileForgeSetHistory=(records)=>{state.history=records.slice(0,40);storeJson(STORAGE.history,state.history);renderHistory();};
window.FileForgeLanguage=()=>state.prefs.language;
window.FileForgeAddPdfHistory=(record)=>{state.history.unshift(record);state.history=state.history.slice(0,40);storeJson(STORAGE.history,state.history);renderHistory();};
window.FileForgeAddArchiveHistory=window.FileForgeAddPdfHistory;
window.FileForgeAddBatchHistory=window.FileForgeAddPdfHistory;
document.addEventListener('DOMContentLoaded',initialize);
