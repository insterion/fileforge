'use strict';
// FileForge 1.3 PDF Studio. PDF editing uses pdf-lib; optional previews use PDF.js.
// Nothing in this module uploads files or persists document bytes.
(() => {
  const $ = (id) => document.getElementById(id);
  const LANG = {
    bg: {
      pdfCardTitle:'📄 PDF Studio вече е тук',pdfCardDesc:'Снимки в PDF · Обединяване · Извличане · Разделяне · Подреждане',openPdfStudio:'Отвори PDF Studio →',
      pdfStudioTitle:'PDF инструменти',pdfStudioIntro:'Обработвай PDF и снимки директно на устройството.',pdfNew:'Ново',tabImages:'Снимки → PDF',tabMerge:'Обедини',tabOrganize:'Страници',tabSplit:'Раздели',
      imagesHeading:'Създай PDF от снимки',imagesHelp:'Добави JPG, PNG или WEBP. Подреди снимките с бутоните ↑ ↓ и избери размер на страницата.',addImages:'＋ Добави снимки',pageSize:'Размер на страницата',naturalSize:'Размер на снимката',makeImagePdf:'Създай PDF',
      mergeHeading:'Обедини PDF файлове',mergeHelp:'Добави поне два PDF файла. Можеш да промениш реда преди обединяване.',addPdfs:'＋ Добави PDF файлове',mergePdfs:'Обедини PDF файловете',
      organizeHeading:'Подреди PDF страниците',organizeHelp:'Виж миниатюри, мести и завъртай страници или избери няколко за премахване. Оригиналът остава непроменен.',choosePdf:'＋ Избери PDF',saveOrganized:'Запази нов PDF',
      splitHeading:'Раздели или извлечи страници',splitHelp:'Зареди PDF и избери: извличане на страници или разделяне на две части.',pageRange:'Страници за извличане (напр. 1-3,5)',extractPages:'Извлечи посочените страници',orDivide:'ИЛИ',splitAfter:'Раздели след страница №',dividePdf:'Раздели на две части',
      pdfReady:'Готови файлове',downloadReminder:'Докосни всеки бутон, за да запазиш файла. Оригиналите не са променени.',
      pdfLimits:'Лимит: 20 MB на файл, общо 50 MB и до 120 PDF страници. PDF с парола не се поддържат.',pdfExternalNote:'Миниатюрите изискват интернет при първото ползване. Ако PDF.js не се зареди, редактирането работи и без миниатюри.',
      emptyImages:'Още няма избрани снимки.',emptyMerge:'Още няма добавени PDF файлове.',emptyPages:'Избери PDF, за да се появят страниците.',
      moveUp:'Нагоре',moveDown:'Надолу',remove:'Премахни',rotateLeft:'Наляво',rotateRight:'Надясно',page:'Страница',pages:'стр.',
      noPdfLib:'Не успях да заредя PDF библиотеката. Свържи се с интернет, отвори отново приложението и повтори.',
      invalidImages:'Приемат се само JPG, PNG и WEBP снимки.',invalidPdf:'Избери валиден PDF файл.',singleTooBig:'Файлът е над 20 MB.',totalTooBig:'Общият размер е над 50 MB.',tooMany:'Превишен е лимитът от 120 страници или 30 снимки.',
      brokenPdf:'PDF файлът не може да се отвори (може да е повреден, защитен с парола или неподдържан).',brokenImage:'Снимката не може да се отвори.',
      needImages:'Добави поне една снимка.',needMerge:'Добави поне два PDF файла.',needPdf:'Избери PDF файл първо.',needPages:'Не може да създадеш празен PDF.',
      badRange:'Невалиден списък страници. Пример: 1-3,5. Провери номерата и повторенията.',badSplit:'Избери номер между 1 и предпоследната страница.',
      busy:'Обработва се…',generated:'Готово! Натисни Download, за да запазиш новия файл.',resetDone:'PDF работното пространство е изчистено.',fileAdded:'Файловете са добавени.',oneFileAdded:'Файлът е зареден.',
      error:'Неуспешна обработка. Опитай с по-малък или друг файл.',downloadFile:'↓ Изтегли',locked:'При големи или криптирани PDF файлове някои операции може да не работят.',
      removed:'Премахнато',rotation:'завъртане',files:'файла',imageLimit:'Снимката е над 32 мегапиксела.',
      thumbHint:'Виж страниците и ги подреди със стрелките. Миниатюрите може да изискват интернет първия път.',thumbRetry:'Обнови миниатюрите',
      selectAll:'Избери всички',deselect:'Отмени избора',removeSelected:'Премахни избраните',selected:'избрани',selection:'Избери',
      previewLoading:'Подготвям миниатюрите…',previewReady:'Миниатюрите са готови.',
      previewUnavailable:'Няма миниатюри. PDF обработката работи; провери връзката и натисни „Обнови миниатюрите“.',
      previewRendering:'Миниатюрите се зареждат при превъртане…',removedSelected:'Избраните страници са премахнати.',
      moveFirst:'Най-отпред',moveLast:'Най-отзад',emptySelection:'Няма избрани страници.'
    },
    en: {
      pdfCardTitle:'📄 PDF Studio is ready',pdfCardDesc:'Images to PDF · Merge · Extract · Split · Organise',openPdfStudio:'Open PDF Studio →',
      pdfStudioTitle:'PDF tools',pdfStudioIntro:'Work with PDFs and pictures locally on your device.',pdfNew:'New',tabImages:'Images → PDF',tabMerge:'Merge',tabOrganize:'Pages',tabSplit:'Split',
      imagesHeading:'Make a PDF from images',imagesHelp:'Add JPG, PNG or WEBP images. Set their order with ↑ ↓ and choose the page size.',addImages:'＋ Add images',pageSize:'Page size',naturalSize:'Image dimensions',makeImagePdf:'Create PDF',
      mergeHeading:'Merge PDF files',mergeHelp:'Add at least two PDFs. Reorder the files before merging.',addPdfs:'＋ Add PDF files',mergePdfs:'Merge PDFs',
      organizeHeading:'Organise PDF pages',organizeHelp:'Preview, reorder and rotate pages, or select several to remove. Your original stays unchanged.',choosePdf:'＋ Choose PDF',saveOrganized:'Save new PDF',
      splitHeading:'Split or extract pages',splitHelp:'Load a PDF, then extract a page range or split it into two files.',pageRange:'Pages to extract (e.g. 1-3,5)',extractPages:'Extract selected pages',orDivide:'OR',splitAfter:'Split after page #',dividePdf:'Split into two files',
      pdfReady:'Ready files',downloadReminder:'Tap each button to save your file. Originals are unchanged.',
      pdfLimits:'Limits: 20 MB per file, 50 MB total and 120 PDF pages. Password-protected PDFs are unsupported.',pdfExternalNote:'Thumbnails need internet on first use. If PDF.js cannot load, you can still edit pages without previews.',
      emptyImages:'No images chosen yet.',emptyMerge:'No PDFs added yet.',emptyPages:'Choose a PDF to see its pages.',
      moveUp:'Up',moveDown:'Down',remove:'Remove',rotateLeft:'Rotate left',rotateRight:'Rotate right',page:'Page',pages:'pages',
      noPdfLib:'PDF library did not load. Connect to the internet, reopen FileForge and try again.',invalidImages:'Choose JPG, PNG or WEBP images only.',invalidPdf:'Choose a valid PDF.',singleTooBig:'This file exceeds 20 MB.',totalTooBig:'Total size exceeds 50 MB.',tooMany:'Limit exceeded: 120 pages or 30 images.',
      brokenPdf:'Cannot open PDF (may be corrupt, password-protected or unsupported).',brokenImage:'Cannot open image.',
      needImages:'Add at least one image.',needMerge:'Add at least two PDF files.',needPdf:'Choose a PDF first.',needPages:'Cannot create an empty PDF.',
      badRange:'Invalid page range. Example: 1-3,5. Check page numbers and duplicates.',badSplit:'Choose a page number from 1 to the second-to-last page.',
      busy:'Processing…',generated:'Ready! Tap Download to save the new file.',resetDone:'PDF workspace cleared.',fileAdded:'Files added.',oneFileAdded:'File loaded.',
      error:'Processing failed. Try a smaller or different file.',downloadFile:'↓ Download',locked:'Large or encrypted PDFs may not work.',
      removed:'Removed',rotation:'rotation',files:'files',imageLimit:'Image exceeds 32 megapixels.',
      thumbHint:'See PDF pages and reorder with arrows. Thumbnails may need internet the first time.',thumbRetry:'Refresh thumbnails',
      selectAll:'Select all',deselect:'Clear selection',removeSelected:'Remove selected',selected:'selected',selection:'Select',
      previewLoading:'Preparing thumbnails…',previewReady:'Thumbnails are ready.',
      previewUnavailable:'Previews unavailable. PDF editing still works; check your connection and tap Refresh thumbnails.',
      previewRendering:'Thumbnails load as you scroll…',removedSelected:'Selected pages removed.',
      moveFirst:'Move to beginning',moveLast:'Move to end',emptySelection:'No pages selected.'
    }
  };
  const MAX_FILE = 20 * 1024 * 1024;
  const MAX_TOTAL = 50 * 1024 * 1024;
  const MAX_PAGES = 120;
  const MAX_IMAGES = 30;
  const MODE = ['images','merge','organize','split'];
  const S = {mode:'images',images:[], merge:[], organize:null, pages:[], selectedPages:new Set(), split:null, resultUrls:[], busy:false};
  const PDFJS_URL='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
  const PDFJS_WORKER='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  const Preview={doc:null,generation:0,cache:new Map(),observer:null,renderQueue:Promise.resolve(),loading:false};
  let pdfjsPromise=null;
  const PDF_LIB_URL='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  let libraryPromise=null;
  function lang() { return window.FileForgeLanguage?.() || document.documentElement.lang || 'bg'; }
  function t(k) { return (LANG[lang()] || LANG.bg)[k] || LANG.bg[k] || k; }
  function size(n) { return n >= 1048576 ? (n/1048576).toFixed(2)+' MB' : n >= 1024 ? (n/1024).toFixed(0)+' KB' : n+' B'; }
  function setStatus(text, danger=false) {
    $('pdfStatus').textContent=text;
    $('pdfStatus').classList.toggle('danger',danger);
  }
  async function validateLibrary() {
    if(window.PDFLib?.PDFDocument)return true;
    if(!libraryPromise){
      libraryPromise=new Promise((resolve,reject)=>{
        const script=document.createElement('script');script.src=PDF_LIB_URL;
        script.onload=()=>window.PDFLib?.PDFDocument?resolve(true):reject(new Error('PDFLib missing'));
        script.onerror=()=>reject(new Error('PDFLib unavailable'));
        document.head.append(script);
      });
    }
    try{await libraryPromise;return true;}
    catch(error){console.warn('PDF dependency:',error);libraryPromise=null;setStatus(t('noPdfLib'),true);return false;}
  }
  function cleanName(name) { return String(name || 'document').replace(/\.[^.]+$/,'').replace(/[^a-z0-9а-яА-Я_-]+/gi,'_').slice(0,55) || 'document'; }
  function clearDownloads() {
    S.resultUrls.forEach(url=>URL.revokeObjectURL(url));S.resultUrls=[];
    $('pdfDownloads').replaceChildren();$('pdfResults').hidden=true;
  }
  function dropOutput() { clearDownloads(); }
  function refreshLanguage() {
    document.querySelectorAll('[data-pdf-i18n]').forEach(el=>{el.textContent=t(el.dataset.pdfI18n);});
    renderImages();renderMerge();renderOrganize();renderSplitInfo();
  }
  function switchMode(mode) {
    if (!MODE.includes(mode) || S.busy)return;
    S.mode=mode;
    document.querySelectorAll('[data-pdf-tab]').forEach(button=>{
      const active=button.dataset.pdfTab===mode;
      button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));
    });
    for(const key of MODE) $('pdfMode'+key[0].toUpperCase()+key.slice(1)).hidden=mode!==key;
    clearDownloads();setStatus('');
  }
  function handleReset() {
    if(S.busy)return;
    S.images=[];S.merge=[];S.organize=null;S.pages=[];S.selectedPages.clear();S.split=null;
    clearPreview();
    ['pdfInputImages','pdfInputMerge','pdfInputOrganize','pdfInputSplit'].forEach(id=>$(id).value='');
    $('pdfRange').value='';$('pdfSplitAfter').value='1';
    clearDownloads();refreshLanguage();setStatus(t('resetDone'));
  }
  function itemButton(label,icon,cb,disabled=false) {
    const b=document.createElement('button');b.type='button';b.className='pdf-small-button';b.textContent=icon;
    b.setAttribute('aria-label',label);b.title=label;b.disabled=disabled || S.busy;
    b.addEventListener('click',cb);return b;
  }
  function itemRow(title,meta,index,list,renderer,isPage=false) {
    const row=document.createElement('div');row.className='pdf-item';
    const symbol=document.createElement('div');symbol.className='pdf-item-icon';symbol.textContent=isPage?'📄':list===S.images?'🖼️':'📑';
    const body=document.createElement('div');body.className='pdf-item-main';
    const strong=document.createElement('strong');strong.textContent=title;
    const small=document.createElement('small');small.textContent=meta;
    body.append(strong,small);
    const actions=document.createElement('div');actions.className='pdf-item-actions';
    const reorder=delta=>{const next=index+delta;if(next<0||next>=list.length)return;
      [list[index],list[next]]=[list[next],list[index]];dropOutput();renderer();};
    actions.append(itemButton(t('moveUp'),'↑',()=>reorder(-1),index===0),itemButton(t('moveDown'),'↓',()=>reorder(1),index===list.length-1));
    if(isPage){
      actions.append(itemButton(t('rotateLeft'),'↶',()=>{list[index].rotate=(list[index].rotate+270)%360;dropOutput();renderer();}),itemButton(t('rotateRight'),'↷',()=>{list[index].rotate=(list[index].rotate+90)%360;dropOutput();renderer();}));
    }
    actions.append(itemButton(t('remove'),'✕',()=>{list.splice(index,1);dropOutput();renderer();}));
    row.append(symbol,body,actions);return row;
  }
  function renderImages() {
    const root=$('pdfImageList');root.replaceChildren();
    if(!S.images.length){const p=document.createElement('p');p.className='pdf-empty';p.textContent=t('emptyImages');root.append(p);}
    S.images.forEach((file,i)=>root.append(itemRow((i+1)+'. '+file.name,size(file.size),i,S.images,renderImages)));
    $('pdfCreateImages').disabled=S.busy || !S.images.length;
  }
  function renderMerge() {
    const root=$('pdfMergeList');root.replaceChildren();
    if(!S.merge.length){const p=document.createElement('p');p.className='pdf-empty';p.textContent=t('emptyMerge');root.append(p);}
    S.merge.forEach((entry,i)=>root.append(itemRow((i+1)+'. '+entry.file.name,entry.count+' '+t('pages')+' · '+size(entry.file.size),i,S.merge,renderMerge)));
    $('pdfCreateMerge').disabled=S.busy || S.merge.length<2;
  }
  function setThumbStatus(msg){
    const node=$('pdfThumbStatus');if(node)node.textContent=msg;
  }
  function clearPreview(){
    Preview.generation++;
    Preview.observer?.disconnect();Preview.observer=null;
    const old=Preview.doc;Preview.doc=null;Preview.cache.clear();Preview.renderQueue=Promise.resolve();
    Preview.loading=false;setThumbStatus('');
    if(old){Promise.resolve(old.destroy()).catch(()=>{});}
  }
  async function getPreviewLibrary(){
    if(window.pdfjsLib?.getDocument)return window.pdfjsLib;
    if(!pdfjsPromise){
      pdfjsPromise=new Promise((resolve,reject)=>{
        const script=document.createElement('script');script.src=PDFJS_URL;
        script.onload=()=>window.pdfjsLib?.getDocument?resolve(window.pdfjsLib):reject(new Error('PDF.js unavailable'));
        script.onerror=()=>reject(new Error('PDF.js network error'));
        document.head.appendChild(script);
      });
    }
    try {return await pdfjsPromise;}
    catch(e){pdfjsPromise=null;throw e;}
  }
  async function startPreview(entry){
    clearPreview();
    if(!entry)return;
    const generation=Preview.generation;
    Preview.loading=true;setThumbStatus(t('previewLoading'));
    try{
      const lib=await getPreviewLibrary();
      if(generation!==Preview.generation)return;
      lib.GlobalWorkerOptions.workerSrc=PDFJS_WORKER;
      const bytes=new Uint8Array(await entry.file.arrayBuffer());
      if(generation!==Preview.generation)return;
      const task=lib.getDocument({data:bytes,disableAutoFetch:true,stopAtErrors:false,isEvalSupported:false});
      const doc=await task.promise;
      if(generation!==Preview.generation){doc.destroy().catch(()=>{});return;}
      Preview.doc=doc;Preview.loading=false;
      setThumbStatus(t('previewRendering'));
      renderOrganize();
    }catch(e){
      if(generation!==Preview.generation)return;
      console.warn('PDF.js thumbnails:',e);
      Preview.loading=false;
      setThumbStatus(t('previewUnavailable'));
    }
  }
  function scheduleThumb(img,part,generation){
    if(!Preview.doc)return;
    const key=part.index+':'+part.rotate;
    const cached=Preview.cache.get(key);
    if(cached){img.src=cached;img.hidden=false;img.parentElement.querySelector('.pdf-page-placeholder')?.remove();return;}
    Preview.renderQueue=Preview.renderQueue.catch(()=>{}).then(async()=>{
      if(generation!==Preview.generation||!img.isConnected||!Preview.doc)return;
      const page=await Preview.doc.getPage(part.index+1);
      if(generation!==Preview.generation||!img.isConnected)return;
      const rotation=((page.rotate||0)+part.rotate)%360;
      const v=page.getViewport({scale:1,rotation});
      const scale=Math.min(150/v.width,170/v.height,2);
      const viewport=page.getViewport({scale,rotation});
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.ceil(viewport.width));canvas.height=Math.max(1,Math.ceil(viewport.height));
      const context=canvas.getContext('2d',{alpha:false});
      if(!context)return;
      const renderTask=page.render({canvasContext:context,viewport,background:'#ffffff'});
      await renderTask.promise;
      if(generation!==Preview.generation||!img.isConnected){canvas.width=0;canvas.height=0;return;}
      const data=canvas.toDataURL('image/jpeg',.68);
      canvas.width=0;canvas.height=0;
      Preview.cache.set(key,data);
      img.src=data;img.hidden=false;img.parentElement.querySelector('.pdf-page-placeholder')?.remove();
    }).catch(e=>{
      if(generation===Preview.generation){console.warn('PDF thumbnail page:',e);}
    });
  }
  function attachPreview(img,part){
    if(!Preview.doc)return;
    const key=part.index+':'+part.rotate;
    if(Preview.cache.has(key)){
      img.src=Preview.cache.get(key);img.hidden=false;
      img.parentElement.querySelector('.pdf-page-placeholder')?.remove();
      return;
    }
    const generation=Preview.generation;
    if('IntersectionObserver' in window){
      if(!Preview.observer){
        Preview.observer=new IntersectionObserver(entries=>{
          for(const entry of entries){
            if(entry.isIntersecting){Preview.observer?.unobserve(entry.target);
              const meta=entry.target.__pdfPart;
              if(meta)scheduleThumb(entry.target.__pdfImage,meta,generation);
            }
          }
        },{rootMargin:'240px'});
      }
      const visibleTarget=img.parentElement;
      visibleTarget.__pdfPart={index:part.index,rotate:part.rotate};
      visibleTarget.__pdfImage=img;
      Preview.observer.observe(visibleTarget);
    }else{scheduleThumb(img,{index:part.index,rotate:part.rotate},generation);}
  }
  function renderOrganize(){
    $('pdfOrganizeName').textContent=S.organize?S.organize.file.name+' · '+S.organize.count+' '+t('pages'):t('emptyPages');
    Preview.observer?.disconnect();Preview.observer=null;
    const root=$('pdfOrganizeList');root.replaceChildren();
    if(!S.pages.length){
      const p=document.createElement('p');p.className='pdf-empty';p.textContent=t('emptyPages');root.append(p);
    }
    S.pages.forEach((part,i)=>{
      const card=document.createElement('div');card.className='pdf-item pdf-page-card';
      if(S.selectedPages.has(part.index))card.classList.add('is-selected');
      const visual=document.createElement('div');visual.className='pdf-page-visual';
      const placeholder=document.createElement('span');placeholder.className='pdf-page-placeholder';placeholder.textContent='📄';
      const img=document.createElement('img');img.alt=(lang()==='bg'?'Преглед страница ':'Page preview ')+(part.index+1);img.hidden=true;
      visual.append(placeholder,img);
      const head=document.createElement('div');head.className='pdf-page-head';
      const body=document.createElement('div');body.className='pdf-item-main';
      const title=document.createElement('strong');title.textContent=t('page')+' '+(part.index+1);
      const small=document.createElement('small');small.textContent=(i+1)+' / '+S.pages.length+(part.rotate?' · ↻ '+part.rotate+'°':'');
      body.append(title,small);
      const label=document.createElement('label');label.className='pdf-page-select';
      const check=document.createElement('input');check.type='checkbox';check.checked=S.selectedPages.has(part.index);check.disabled=S.busy;
      check.setAttribute('aria-label',t('selection')+' '+(part.index+1));
      check.addEventListener('change',()=>{
        if(check.checked)S.selectedPages.add(part.index);else S.selectedPages.delete(part.index);
        card.classList.toggle('is-selected',check.checked);updateSelectionButtons();
      });
      label.append(check,document.createTextNode(t('selection')));head.append(body,label);
      const buttons=document.createElement('div');buttons.className='pdf-item-actions';
      const move=(n)=>{
        const current=S.pages.indexOf(part);if(current<0)return;
        const next=Math.max(0,Math.min(S.pages.length-1,n));if(current===next)return;
        S.pages.splice(current,1);S.pages.splice(next,0,part);dropOutput();renderOrganize();
      };
      buttons.append(
        itemButton(t('moveUp'),'↑',()=>move(S.pages.indexOf(part)-1),i===0),
        itemButton(t('moveDown'),'↓',()=>move(S.pages.indexOf(part)+1),i===S.pages.length-1),
        itemButton(t('moveFirst'),'⇤',()=>move(0),i===0),
        itemButton(t('moveLast'),'⇥',()=>move(S.pages.length-1),i===S.pages.length-1),
        itemButton(t('rotateLeft'),'↶',()=>{part.rotate=(part.rotate+270)%360;dropOutput();renderOrganize();}),
        itemButton(t('rotateRight'),'↷',()=>{part.rotate=(part.rotate+90)%360;dropOutput();renderOrganize();}),
        itemButton(t('remove'),'✕',()=>{S.pages.splice(S.pages.indexOf(part),1);S.selectedPages.delete(part.index);dropOutput();renderOrganize();})
      );
      card.append(visual,head,buttons);root.append(card);
      attachPreview(img,part);
    });
    $('pdfCreateOrganize').disabled=S.busy||!S.organize||!S.pages.length;
    updateSelectionButtons();
  }
  function updateSelectionButtons(){
    const n=S.selectedPages.size;
    $('pdfSelectAll').disabled=S.busy||S.pages.length===0||n===S.pages.length;
    $('pdfDeselect').disabled=S.busy||n===0;
    $('pdfRemoveSelected').disabled=S.busy||n===0;
    $('pdfRemoveSelected').textContent=t('removeSelected')+(n?' ('+n+')':'');
  }
  function removeSelected(){
    if(S.busy||!S.selectedPages.size)return;
    S.pages=S.pages.filter(p=>!S.selectedPages.has(p.index));
    S.selectedPages.clear();dropOutput();renderOrganize();setStatus(t('removedSelected'));
  }
  function renderSplitInfo() {
    $('pdfSplitName').textContent=S.split?S.split.file.name+' · '+S.split.count+' '+t('pages'):t('emptyPages');
    $('pdfExtract').disabled=S.busy || !S.split;
    $('pdfDivide').disabled=S.busy || !S.split || S.split.count<2;
    if(S.split) $('pdfSplitAfter').max=String(Math.max(1,S.split.count-1));
  }
  function checkFile(file, type) {
    if(!file)return null;
    if(file.size>MAX_FILE)return t('singleTooBig');
    const ext=file.name.split('.').pop()?.toLowerCase();
    const good = type==='pdf' ? ext==='pdf' : ['jpg','jpeg','png','webp'].includes(ext);
    return good ? null : t(type==='pdf'?'invalidPdf':'invalidImages');
  }
  async function getDoc(file) {
    const data=await file.arrayBuffer();
    try {
      const doc=await PDFLib.PDFDocument.load(data,{updateMetadata:false});
      const count=doc.getPageCount();
      if(count<1)throw new Error('Empty PDF');
      if(count>MAX_PAGES)throw new Error('too-many');
      return {file,doc,count};
    }catch(e){if(e.message==='too-many')throw new Error(t('tooMany'));throw new Error(t('brokenPdf'));}
  }
  function totalBytes(files){return files.reduce((n,f)=>n+(f.file?.size||f.size),0);}
  async function addImages(files){
    if(S.busy)return;
    const newFiles=Array.from(files||[]);if(!newFiles.length)return;
    for(const file of newFiles){const err=checkFile(file,'images');if(err){setStatus(err,true);return;}}
    if(S.images.length+newFiles.length>MAX_IMAGES){setStatus(t('tooMany'),true);return;}
    if(totalBytes([...S.images,...newFiles])>MAX_TOTAL){setStatus(t('totalTooBig'),true);return;}
    S.images.push(...newFiles);dropOutput();renderImages();setStatus(t('fileAdded'));
  }
  async function addMerge(files){
    if(S.busy)return;const selected=Array.from(files||[]);if(!selected.length)return;
    if(selected.some(f=>checkFile(f,'pdf'))){setStatus(selected.map(f=>checkFile(f,'pdf')).find(Boolean),true);return;}
    if(totalBytes([...S.merge,...selected])>MAX_TOTAL){setStatus(t('totalTooBig'),true);return;}
    if(!await validateLibrary())return;
    await withBusy(async()=>{
      const entries=[];let pages=S.merge.reduce((n,e)=>n+e.count,0);
      for(const file of selected){const entry=await getDoc(file);pages+=entry.count;
        if(pages>MAX_PAGES)throw new Error(t('tooMany'));entries.push(entry);}
      S.merge.push(...entries);dropOutput();setStatus(t('fileAdded'));
    });renderMerge();
  }
  async function loadSingle(file,mode){
    if(!file || S.busy)return;
    const err=checkFile(file,'pdf');if(err){setStatus(err,true);return;}
    if(!await validateLibrary())return;
    await withBusy(async()=>{
      const entry=await getDoc(file);
      if(mode==='organize'){
        S.organize=entry;S.pages=Array.from({length:entry.count},(_,i)=>({index:i,rotate:0}));
        S.selectedPages.clear();
        clearPreview();
      }else{
        S.split=entry;$('pdfRange').value='1-'+entry.count;
        $('pdfSplitAfter').value=String(Math.max(1,Math.floor(entry.count/2)));
      }
      dropOutput();setStatus(t('oneFileAdded'));
    });renderOrganize();renderSplitInfo();
    if(mode==='organize'&&S.organize?.file===file){void startPreview(S.organize);}
  }
  async function withBusy(task){
    if(S.busy)return;S.busy=true;
    document.querySelectorAll('.pdf-workspace button,.pdf-tabs button').forEach(b=>b.disabled=true);
    setStatus(t('busy'));
    try{await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));await task();}
    catch(e){console.error('PDF Studio:',e);setStatus(e.message?.startsWith('PDF')||e.message?.includes(' ') ? e.message : t('error'),true);}
    finally{S.busy=false;document.querySelectorAll('.pdf-tabs button').forEach(b=>b.disabled=false);
      document.querySelectorAll('.pdf-workspace button').forEach(b=>b.disabled=false);
      renderImages();renderMerge();renderOrganize();renderSplitInfo();}
  }
  async function exportPdf(outputs) {
    // Validate exported bytes before offering downloads; never record actual downloads.
    const ready=[];
    for(const output of outputs){
      const bytes=await output.doc.save({useObjectStreams:true});
      if(!(bytes.length>20) || String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw new Error(t('error'));
      ready.push({name:output.name,bytes,pages:output.doc.getPageCount()});
    }
    clearDownloads();
    for(const output of ready){
      const blob=new Blob([output.bytes],{type:'application/pdf'});
      const url=URL.createObjectURL(blob);S.resultUrls.push(url);
      const anchor=document.createElement('a');anchor.href=url;anchor.download=output.name;
      anchor.className='download-button';anchor.textContent=t('downloadFile')+' · '+output.name+' ('+size(blob.size)+')';
      $('pdfDownloads').append(anchor);
      window.FileForgeResults?.add({blob,name:output.name,kind:'pdf'});
      window.FileForgeAddPdfHistory?.({kind:'pdf',output:output.name,name:output.name,time:Date.now(),before:0,after:blob.size,pages:output.pages});
    }
    $('pdfResults').hidden=false;setStatus(t('generated'));
  }
  async function imageAsJpg(file){
    let bitmap;
    try{
      bitmap=await createImageBitmap(file);
      if(bitmap.width*bitmap.height>32_000_000)throw new Error(t('imageLimit'));
      const factor=Math.min(1,2200/Math.max(bitmap.width,bitmap.height));
      const w=Math.max(1,Math.round(bitmap.width*factor));const h=Math.max(1,Math.round(bitmap.height*factor));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error(t('brokenImage'));
      ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
      ctx.drawImage(bitmap,0,0,w,h);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error(t('brokenImage'))),'image/jpeg',0.88));
      return {data:await blob.arrayBuffer(),w,h};
    }catch(e){if(e.message===t('imageLimit'))throw e;throw new Error(t('brokenImage'));}
    finally{bitmap?.close();}
  }
  async function createImages(){
    if(!S.images.length){setStatus(t('needImages'),true);return;}
    if(!await validateLibrary())return;
    await withBusy(async()=>{
      const doc=await PDFLib.PDFDocument.create();
      for(const file of S.images){
        const {data,w,h}=await imageAsJpg(file);
        const img=await doc.embedJpg(data);
        let pageW,pageH;
        const choice=$('pdfPageSize').value;
        if(choice==='a4'){pageW=595.28;pageH=841.89;}
        else if(choice==='a4-landscape'){pageW=841.89;pageH=595.28;}
        else{const k=Math.min(.75,1440/Math.max(w,h));pageW=Math.max(36,w*k);pageH=Math.max(36,h*k);}
        const page=doc.addPage([pageW,pageH]);
        const margin=choice==='original'?0:24;
        const scale=Math.min((pageW-margin*2)/w,(pageH-margin*2)/h);
        const drawW=w*scale,drawH=h*scale;
        page.drawImage(img,{x:(pageW-drawW)/2,y:(pageH-drawH)/2,width:drawW,height:drawH});
      }
      await exportPdf([{doc,name:'fileforge-images.pdf'}]);
    });
  }
  async function createMerge(){
    if(S.merge.length<2){setStatus(t('needMerge'),true);return;}
    if(!await validateLibrary())return;
    await withBusy(async()=>{
      const doc=await PDFLib.PDFDocument.create();
      for(const entry of S.merge){const pages=await doc.copyPages(entry.doc,entry.doc.getPageIndices());pages.forEach(p=>doc.addPage(p));}
      await exportPdf([{doc,name:'fileforge-merged.pdf'}]);
    });
  }
  async function createOrganize(){
    if(!S.organize){setStatus(t('needPdf'),true);return;}
    if(!S.pages.length){setStatus(t('needPages'),true);return;}
    if(!await validateLibrary())return;
    await withBusy(async()=>{
      const doc=await PDFLib.PDFDocument.create();
      for(const part of S.pages){
        const [page]=await doc.copyPages(S.organize.doc,[part.index]);
        const original=S.organize.doc.getPage(part.index).getRotation().angle;
        page.setRotation(PDFLib.degrees((original+part.rotate)%360));doc.addPage(page);
      }
      await exportPdf([{doc,name:cleanName(S.organize.file.name)+'-organized.pdf'}]);
    });
  }
  function parseRange(input,count){
    const nums=[],used=new Set();
    for(const token of input.split(',')){
      const match=token.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if(!match)return null;
      const a=Number(match[1]),b=match[2]?Number(match[2]):a;
      if(a<1||b<a||b>count)return null;
      for(let n=a;n<=b;n++){if(used.has(n))return null;used.add(n);nums.push(n-1);}
    }
    return nums.length?nums:null;
  }
  async function createFromSelection(indices){
    const doc=await PDFLib.PDFDocument.create();
    const pages=await doc.copyPages(S.split.doc,indices);pages.forEach(p=>doc.addPage(p));
    return doc;
  }
  async function extract(){
    if(!S.split){setStatus(t('needPdf'),true);return;}
    const selection=parseRange($('pdfRange').value,S.split.count);
    if(!selection){setStatus(t('badRange'),true);return;}
    if(!await validateLibrary())return;
    await withBusy(async()=>{
      const doc=await createFromSelection(selection);
      await exportPdf([{doc,name:cleanName(S.split.file.name)+'-extracted.pdf'}]);
    });
  }
  async function divide(){
    if(!S.split){setStatus(t('needPdf'),true);return;}
    const n=Number($('pdfSplitAfter').value);
    if(!Number.isInteger(n)||n<1||n>=S.split.count){setStatus(t('badSplit'),true);return;}
    if(!await validateLibrary())return;
    await withBusy(async()=>{
      const first=await createFromSelection(Array.from({length:n},(_,i)=>i));
      const second=await createFromSelection(Array.from({length:S.split.count-n},(_,i)=>n+i));
      const base=cleanName(S.split.file.name);
      await exportPdf([{doc:first,name:base+'-part-1.pdf'},{doc:second,name:base+'-part-2.pdf'}]);
    });
  }
  function init(){
    $('pdfOpenHome').addEventListener('click',()=>window.FileForgeOpenPdf?.());
    $('pdfOpenTools').addEventListener('click',()=>window.FileForgeOpenPdf?.());
    document.querySelectorAll('[data-pdf-tab]').forEach(button=>button.addEventListener('click',()=>switchMode(button.dataset.pdfTab)));
    $('pdfResetAll').addEventListener('click',handleReset);
    const bindings=[['pdfAddImages','pdfInputImages'],['pdfAddMerge','pdfInputMerge'],['pdfChooseOrganize','pdfInputOrganize'],['pdfChooseSplit','pdfInputSplit']];
    for(const [button,input] of bindings){$(button).addEventListener('click',()=>{if(S.busy)return;$(input).value='';$(input).click();});}
    $('pdfInputImages').addEventListener('change',e=>addImages(e.target.files));
    $('pdfInputMerge').addEventListener('change',e=>addMerge(e.target.files));
    $('pdfInputOrganize').addEventListener('change',e=>loadSingle(e.target.files?.[0],'organize'));
    $('pdfInputSplit').addEventListener('change',e=>loadSingle(e.target.files?.[0],'split'));
    $('pdfCreateImages').addEventListener('click',createImages);
    $('pdfCreateMerge').addEventListener('click',createMerge);
    $('pdfCreateOrganize').addEventListener('click',createOrganize);
    $('pdfThumbRetry').addEventListener('click',()=>{if(S.organize&&!S.busy)void startPreview(S.organize);});
    $('pdfSelectAll').addEventListener('click',()=>{S.pages.forEach(part=>S.selectedPages.add(part.index));renderOrganize();});
    $('pdfDeselect').addEventListener('click',()=>{S.selectedPages.clear();renderOrganize();});
    $('pdfRemoveSelected').addEventListener('click',removeSelected);
    $('pdfExtract').addEventListener('click',extract);
    $('pdfDivide').addEventListener('click',divide);
    $('pdfPageSize').addEventListener('change',dropOutput);
    $('pdfRange').addEventListener('input',dropOutput);
    $('pdfSplitAfter').addEventListener('input',dropOutput);
    switchMode('images');refreshLanguage();
  }
  window.PDFStudio={init,translate:refreshLanguage};
  document.addEventListener('DOMContentLoaded',init);
})();
