'use strict';
/* FileForge 0.5 — sequential, local-only image conversion and ZIP export. */
(() => {
  const $=id=>document.getElementById(id);
  const MAX_FILES=12,MAX_FILE=20*1024*1024,MAX_TOTAL=60*1024*1024,MAX_PIXELS=32_000_000,MAX_OUTPUT=90*1024*1024;
  const PRESET_KEY='fileforge_batch_preset_v1';
  const MIME={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
  const EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
  const text={
    bg:{batchTitle:'Batch Images',batchIntro:'Еднакви настройки за множество снимки. Резултатът е ZIP файл.',newBatch:'Ново',batchChooseTitle:'1. Избери снимки',batchChooseHelp:'JPG, PNG или WEBP, до 12 файла (20 MB на файл, 60 MB общо).',batchChoose:'＋ Добави снимки',batchSettingsTitle:'2. Общи настройки',batchFormatLabel:'Изходен формат',batchKeepFormat:'Запази оригиналния формат',batchSizeLabel:'Максимална дълга страна',batchOriginalSize:'Без ограничение',batchCropLabel:'Централно изрязване',batchNoCrop:'Без изрязване',batchRotateLabel:'Завъртане',batchQualityLabel:'Качество JPG / WEBP',batchGrayLabel:'Черно-бяло',savePreset:'☆ Запази настройките',loadPreset:'↺ Зареди запазените',batchProcess:'3. Обработи и създай ZIP',batchReady:'Готов архив',batchDownload:'↓ Изтегли ZIP с резултатите',batchDownloadHint:'ZIP съдържа новите снимки. Оригиналите не се променят, а резултатите не се съхраняват в историята.',zero:'Няма избрани снимки.',selected:'Избрани',processing:'Обработка',zipping:'Създаване на ZIP',finished:'Готови',skipped:'Пропуснати',chooseFirst:'Избери поне една снимка.',invalid:'Поддържат се JPG, PNG и WEBP, до 20 MB за файл и 60 MB общо.',tooMany:'Максимум 12 снимки.',badImage:'Невалидна или прекалено голяма снимка.',outputTooBig:'Резултатите са твърде големи за паметта на телефона.',busy:'В момента се обработват файлове.',error:'Обработката се провали. Опитай с по-малко снимки.',presetSaved:'Настройките са запазени на устройството.',presetMissing:'Все още няма запазени настройки.',presetLoaded:'Настройките са заредени.',cancelled:'Изчистване на избора ще изтрие само временно заредените снимки.',noSupport:'Браузърът не поддържа този формат.',badJSZip:'ZIP модулът липсва. Провери дали jszip.min.js е качен.'},
    en:{batchTitle:'Batch Images',batchIntro:'One set of settings for multiple images. The output is a ZIP.',newBatch:'New',batchChooseTitle:'1. Choose images',batchChooseHelp:'JPG, PNG or WEBP, up to 12 files (20 MB each, 60 MB total).',batchChoose:'＋ Add images',batchSettingsTitle:'2. Shared settings',batchFormatLabel:'Output format',batchKeepFormat:'Keep original format',batchSizeLabel:'Maximum long side',batchOriginalSize:'No limit',batchCropLabel:'Centre crop',batchNoCrop:'No crop',batchRotateLabel:'Rotation',batchQualityLabel:'JPG / WEBP quality',batchGrayLabel:'Black & white',savePreset:'☆ Save settings',loadPreset:'↺ Load saved settings',batchProcess:'3. Process and create ZIP',batchReady:'Archive ready',batchDownload:'↓ Download processed images ZIP',batchDownloadHint:'The ZIP contains your new images. Originals are untouched; the output files are not stored in history.',zero:'No images selected.',selected:'Selected',processing:'Processing',zipping:'Creating ZIP',finished:'Done',skipped:'Skipped',chooseFirst:'Select at least one image.',invalid:'Only JPG, PNG and WEBP, up to 20 MB per file and 60 MB total.',tooMany:'Maximum 12 images.',badImage:'Invalid image or too many pixels.',outputTooBig:'The output is too large for this device.',busy:'Processing files now.',error:'Processing failed. Try fewer images.',presetSaved:'Settings saved on this device.',presetMissing:'No saved preset yet.',presetLoaded:'Settings loaded.',cancelled:'Clear selection affects only the temporary image list.',noSupport:'Browser does not support this format.',badJSZip:'ZIP library is missing. Make sure jszip.min.js is uploaded.'}
  };
  const lang=()=>window.FileForgeLanguage?.()==='en'?'en':'bg';const tr=k=>text[lang()][k]||k;
  let selected=[],working=false,resultUrl=null;
  function status(s){$('batchStatus').textContent=s;}
  function bytes(n){return n>=1048576?(n/1048576).toFixed(2)+' MB':n>=1024?Math.round(n/1024)+' KB':n+' B';}
  function formatOf(f){return MIME[f.name.split('.').pop()?.toLowerCase()]||(['image/jpeg','image/png','image/webp'].includes(f.type)?f.type:null);}
  function invalidate(){if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl=null;$('batchResults').hidden=true;$('batchDownload').removeAttribute('href');}
  function renderFiles(){
    const root=$('batchFileList');root.replaceChildren();
    selected.forEach((file,index)=>{
      const item=document.createElement('div');item.className='pdf-item';
      const ic=document.createElement('div');ic.className='pdf-item-icon';ic.textContent='🖼️';
      const content=document.createElement('div');content.className='pdf-item-main';const name=document.createElement('strong');name.textContent=file.name;const size=document.createElement('small');size.textContent=bytes(file.size);content.append(name,size);
      const actions=document.createElement('div');actions.className='pdf-item-actions';const del=document.createElement('button');del.type='button';del.className='pdf-small-button';del.textContent='×';del.setAttribute('aria-label',`Remove ${file.name}`);del.disabled=working;del.addEventListener('click',()=>{if(working)return;selected.splice(index,1);invalidate();renderFiles();});actions.append(del);item.append(ic,content,actions);root.append(item);
    });
    $('batchFileCount').textContent=selected.length?`${tr('selected')}: ${selected.length}/${MAX_FILES} · ${bytes(selected.reduce((n,f)=>n+f.size,0))}`:tr('zero');
  }
  function settings(){return {format:$('batchFormat').value,size:$('batchSize').value,crop:$('batchCrop').value,rotation:$('batchRotation').value,quality:$('batchQuality').value,gray:$('batchGray').checked};}
  function applySettings(p){
    if(!p||typeof p!=='object')throw Error('Bad preset');
    const allowed={batchFormat:['same','image/jpeg','image/png','image/webp'],batchSize:['0','1280','1920','2560'],batchCrop:['none','1','1.3333333333','1.7777777778'],batchRotation:['0','90','180','270']};
    for(const [id,key] of [['batchFormat','format'],['batchSize','size'],['batchCrop','crop'],['batchRotation','rotation']])if(allowed[id].includes(String(p[key])))$(id).value=String(p[key]);
    const q=Number(p.quality);if(Number.isFinite(q)&&q>=40&&q<=100)$('batchQuality').value=String(Math.round(q));
    $('batchGray').checked=p.gray===true;$('batchQualityValue').textContent=$('batchQuality').value+'%';
    invalidate();
  }
  function handleFiles(files){
    if(working)return;
    const received=[...files];const next=[...selected,...received];
    if(next.length>MAX_FILES){status(tr('tooMany'));return;}
    if(next.some(f=>!formatOf(f)||f.size>MAX_FILE||f.size===0)||next.reduce((n,f)=>n+f.size,0)>MAX_TOTAL){status(tr('invalid'));return;}
    selected=next;invalidate();renderFiles();status('');
  }
  function safeName(input){const name=input.replace(/\.[^.]+$/,'').normalize('NFC').replace(/[^\p{L}\p{N}_-]+/gu,'_').replace(/^_+|_+$/g,'').slice(0,60);return name||'image';}
  async function renderImage(file,opts){
    let bitmap;
    try{
      bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>MAX_PIXELS||!bitmap.width||!bitmap.height)throw Error(tr('badImage'));
      let sx=0,sy=0,sw=bitmap.width,sh=bitmap.height;
      if(opts.crop!=='none'){const target=Number(opts.crop);if(sw/sh>target){const w=sh*target;sx=(sw-w)/2;sw=w;}else{const h=sw/target;sy=(sh-h)/2;sh=h;}}
      const degrees=Number(opts.rotation),swap=degrees===90||degrees===270;
      const rotatedW=swap?sh:sw,rotatedH=swap?sw:sh;
      const limit=Number(opts.size),scale=limit?Math.min(1,limit/Math.max(rotatedW,rotatedH)):1;
      const width=Math.max(1,Math.round(rotatedW*scale)),height=Math.max(1,Math.round(rotatedH*scale));
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      const mime=opts.format==='same'?formatOf(file):opts.format;
      if(mime==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);}
      ctx.translate(width/2,height/2);ctx.rotate(degrees*Math.PI/180);if(opts.gray)ctx.filter='grayscale(100%)';
      const dw=swap?height:width,dh=swap?width:height;
      ctx.drawImage(bitmap,sx,sy,sw,sh,-dw/2,-dh/2,dw,dh);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Blob failed')),mime,Number(opts.quality)/100));
      if(blob.type!==mime)throw Error(tr('noSupport'));
      return {blob,mime};
    }finally{bitmap?.close();}
  }
  async function process(){
    if(working)return;if(!selected.length){status(tr('chooseFirst'));return;}
    if(typeof JSZip==='undefined'){status(tr('badJSZip'));return;}
    working=true;invalidate();$('batchProcess').disabled=true;$('batchPick').disabled=true;$('batchReset').disabled=true;$('batchProgress').hidden=false;$('batchProgress').value=0;
    const opts=settings(),zip=new JSZip(),usedNames=new Set();let good=0,bad=0,totalBytes=0,outputBytes=0;
    try{
      for(let i=0;i<selected.length;i++){
        const file=selected[i];status(`${tr('processing')} ${i+1}/${selected.length}: ${file.name}`);
        await new Promise(resolve=>setTimeout(resolve,0));
        try{
          const {blob,mime}=await renderImage(file,opts);
          outputBytes+=blob.size;if(outputBytes>MAX_OUTPUT)throw Error(tr('outputTooBig'));
          const base=safeName(file.name);let filename=base+'-fileforge.'+EXT[mime];let n=2;
          while(usedNames.has(filename.toLocaleLowerCase()))filename=`${base}-fileforge-${n++}.${EXT[mime]}`;
          usedNames.add(filename.toLocaleLowerCase());zip.file(filename,blob);good++;totalBytes+=file.size;
        }catch(error){console.warn('Batch skipped:',file.name,error);if(error.message===tr('outputTooBig'))throw error;bad++;}
        $('batchProgress').value=Math.round(((i+1)/selected.length)*80);
      }
      if(!good)throw Error(tr('badImage'));
      status(`${tr('zipping')}...`);
      const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:3}},m=>{$('batchProgress').value=80+Math.round(m.percent*.2);});
      resultUrl=URL.createObjectURL(blob);
      const name=`fileforge-batch-${new Date().toISOString().slice(0,10)}.zip`;
      const link=$('batchDownload');link.href=resultUrl;link.download=name;
      $('batchSummaryText').textContent=`${tr('finished')}: ${good} · ${tr('skipped')}: ${bad} · ZIP: ${bytes(blob.size)}`;
      $('batchResults').hidden=false;status(`${tr('finished')}: ${good}; ${tr('skipped')}: ${bad}`);
      window.FileForgeAddBatchHistory?.({kind:'batch',name:`${good} images`,output:name,time:Date.now(),files:good,before:totalBytes,after:blob.size});
    }catch(e){console.error('Batch failed:',e);status(e.message===tr('outputTooBig')?tr('outputTooBig'):tr('error'));}
    finally{working=false;$('batchProcess').disabled=false;$('batchPick').disabled=false;$('batchReset').disabled=false;$('batchProgress').hidden=true;renderFiles();}
  }
  function clear(){if(working){status(tr('busy'));return;}selected=[];invalidate();renderFiles();status('');$('batchInput').value='';}
  function translate(){document.querySelectorAll('[data-ff-i18n]').forEach(el=>{if(text[lang()][el.dataset.ffI18n])el.textContent=tr(el.dataset.ffI18n);});renderFiles();}
  document.addEventListener('DOMContentLoaded',()=>{
    $('batchOpenHome').addEventListener('click',()=>window.FileForgeOpenBatch?.());
    $('batchOpenTools').addEventListener('click',()=>window.FileForgeOpenBatch?.());
    $('batchPick').addEventListener('click',()=>{$('batchInput').value='';$('batchInput').click();});
    $('batchInput').addEventListener('change',e=>handleFiles(e.target.files||[]));
    $('batchReset').addEventListener('click',clear);
    $('batchProcess').addEventListener('click',process);
    $('batchQuality').addEventListener('input',()=>{$('batchQualityValue').textContent=$('batchQuality').value+'%';invalidate();});
    for(const id of ['batchFormat','batchSize','batchCrop','batchRotation','batchGray'])$(id).addEventListener('change',invalidate);
    $('batchSavePreset').addEventListener('click',()=>{try{localStorage.setItem(PRESET_KEY,JSON.stringify(settings()));status(tr('presetSaved'));}catch{status(tr('error'));}});
    $('batchLoadPreset').addEventListener('click',()=>{try{const s=localStorage.getItem(PRESET_KEY);if(!s){status(tr('presetMissing'));return;}applySettings(JSON.parse(s));status(tr('presetLoaded'));}catch{status(tr('error'));}});
    translate();
  });
  window.BatchStudio={translate};
})();
