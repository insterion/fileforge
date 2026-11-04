'use strict';
/* FileForge 0.7 — Local Video Studio. Frame export and contact sheets via Canvas.
   Optional, silent WebM excerpt via real-time CanvasCaptureStream/MediaRecorder.
   No network or backend; the input video is never persisted. */
(() => {
  const $ = id => document.getElementById(id);
  const MAX_FILE = 120 * 1024 * 1024;
  const MAX_DURATION = 1800;
  const MAX_CLIP = 15;
  const MAX_PIXELS = 3840 * 2160;
  const text = {
    bg: {
      homeTitle:'🎬 Video Studio — кадри и кратки WebM клипове',homeDescription:'Преглед · Кадри · Контактна снимка · Беззвучен WebM откъс',openVideo:'Отвори Video →',toolDescription:'Преглед · Кадри · Storyboard · Беззвучен WebM',
      heading:'Видео редактор',intro:'Извличай кадри и създавай кратки клипове, без да качваш файловете.',reset:'Ново видео',chooseHeading:'1. Избери видео файл',chooseHelp:'MP4, WebM или MOV, ако Chrome може да го отвори. До 120 MB и 30 минути.',chooseButton:'＋ Избери видео',frameHeading:'2. Запази кадър като снимка',frameFormat:'Формат',frameButton:'Извлечи кадър',downloadFrame:'↓ Изтегли снимката',storyHeading:'3. Контактна снимка (Storyboard)',storyHelp:'Събира кадри от видеото в една JPG снимка.',framesCount:'Брой кадри',storyButton:'Създай контактна снимка',downloadStory:'↓ Изтегли контактната снимка',clipHeading:'4. Кратък откъс — без звук (WebM)',clipHelp:'Експериментално: записва откъс в реално време БЕЗ звук. До 15 секунди. Резултатът е WebM, не MP4.',start:'Начало (сек.)',end:'Край (сек.)',setStart:'Начало = текущ момент',setEnd:'Край = текущ момент',previewClip:'▶ Прегледай откъса',stop:'■ Спри',exportClip:'Запиши беззвучен WebM откъс',downloadClip:'↓ Изтегли беззвучен WebM',limits:'Оригиналът остава непроменен. WebM изходът е без звук; няма MP4 export. Запазват се само метаданни за успешните операции.',
      needFile:'Първо избери видео.',bigFile:'Твърде голям или празен файл (лимит 120 MB).',invalid:'Избери MP4, WebM, MOV или M4V видео.',loading:'Зареждане на видео…',badVideo:'Chrome не може да възпроизведе този файл/кодек.',badDuration:'Видеото трябва да е до 30 минути, с валидна продължителност и резолюция до 4K.',loaded:'Видеото е заредено. Избери подходящ инструмент.',working:'Обработка на кадрите…',frameReady:'Кадърът е готов за изтегляне.',storyReady:'Контактната снимка е готова.',noFrame:'Не успях да прочета кадъра. Опитай на друг момент от видеото.',invalidClip:'Избери край след началото, с продължителност от 0.5 до 15 секунди.',notSupported:'Този браузър не поддържа запис на WebM. Снимките и контактната снимка остават достъпни.',supported:'Експериментално: без звук, до 15 секунди, със скорост 1×. Не заключвай екрана.',recording:'Записвам клипа в реално време. Не заключвай екрана…',clipReady:'WebM клипът е готов. Провери го преди да изтриеш оригинала.',clipError:'WebM записът не се получи. Опитай по-кратък откъс.',stopped:'Спряно.',busy:'Изчакай текущата операция.',error:'Операцията не успя. Опитай с по-къс или по-малък файл.',saveTooBig:'Полученият клип е прекалено голям.',previewing:'Възпроизвеждам избрания откъс…',seconds:'сек',silent:'без звук'
    },
    en: {
      homeTitle:'🎬 Video Studio — frames and short WebM clips',homeDescription:'Playback · Frames · Contact sheet · Silent WebM clip',openVideo:'Open Video →',toolDescription:'Preview · Frames · Storyboard · Silent WebM',
      heading:'Video editor',intro:'Extract frames and create short clips locally, with no uploads.',reset:'New video',chooseHeading:'1. Select a video',chooseHelp:'MP4, WebM or MOV if Chrome can play it. Up to 120 MB and 30 minutes.',chooseButton:'＋ Choose video',frameHeading:'2. Save frame as an image',frameFormat:'Format',frameButton:'Extract frame',downloadFrame:'↓ Download frame',storyHeading:'3. Contact sheet (Storyboard)',storyHelp:'Combine evenly spaced frames into a JPG image.',framesCount:'Frames',storyButton:'Create contact sheet',downloadStory:'↓ Download contact sheet',clipHeading:'4. Short excerpt — silent WebM',clipHelp:'Experimental: records in real time WITHOUT audio. Up to 15 seconds. WebM output, not MP4.',start:'Start (seconds)',end:'End (seconds)',setStart:'Set start to playhead',setEnd:'Set end to playhead',previewClip:'▶ Preview excerpt',stop:'■ Stop',exportClip:'Record silent WebM excerpt',downloadClip:'↓ Download silent WebM',limits:'Original unchanged. WebM output has no audio and MP4 export is unavailable. Only metadata from successful operations is stored.',
      needFile:'Choose a video first.',bigFile:'Empty or oversized file (120 MB limit).',invalid:'Select MP4, WebM, MOV or M4V video.',loading:'Loading video…',badVideo:'Chrome cannot play this file or codec.',badDuration:'Video must be 30 minutes or shorter, with a valid duration and resolution up to 4K.',loaded:'Video ready. Choose an action.',working:'Processing frames…',frameReady:'Frame ready to download.',storyReady:'Contact sheet ready.',noFrame:'Cannot read this frame. Try another position.',invalidClip:'Set end after start; duration must be 0.5–15 seconds.',notSupported:'This browser cannot record WebM. Image and contact sheet tools still work.',supported:'Experimental: silent output, max 15 seconds, real-time at 1× speed. Keep the screen on.',recording:'Recording in real time. Keep your screen awake…',clipReady:'WebM ready. Verify playback before removing the original.',clipError:'WebM recording failed. Try a shorter excerpt.',stopped:'Stopped.',busy:'Finish the current operation first.',error:'Operation failed. Try a shorter or smaller file.',saveTooBig:'Exported clip exceeds the allowed size.',previewing:'Previewing selected excerpt…',seconds:'sec',silent:'no audio'
    }
  };
  const tr = key => text[window.FileForgeLanguage?.()==='en'?'en':'bg'][key]||key;
  const video = () => $('videoPlayer');
  const state={file:null,url:null,duration:0,busy:false,frameUrl:null,storyUrl:null,clipUrl:null,preview:false,record:null,session:0};
  const fmt = seconds => {const n=Math.max(0,Math.floor(seconds||0));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;};
  const size = n => n>=1048576?(n/1048576).toFixed(2)+' MB':Math.ceil(n/1024)+' KB';
  const baseName = () => (state.file?.name||'video').replace(/\.[^.]+$/,'').replace(/[^\w\u0400-\u04ff-]+/g,'_').slice(0,60)||'video';
  const note = key => {$('videoStatus').textContent=tr(key);};
  const support = () => !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && MediaRecorder.isTypeSupported?.('video/webm;codecs=vp8'));
  function revoke(prop){if(state[prop])URL.revokeObjectURL(state[prop]);state[prop]=null;}
  function clearResults(){
    for(const [prop,block,link] of [['frameUrl','videoFrameResult','videoFrameDownload'],['storyUrl','videoStoryResult','videoStoryDownload'],['clipUrl','videoClipResult','videoClipDownload']]){
      revoke(prop);$(block).hidden=true;$(link).removeAttribute('href');
    }
    $('videoFramePreview').removeAttribute('src');$('videoStoryPreview').removeAttribute('src');
    $('videoClipPreview').pause();$('videoClipPreview').removeAttribute('src');$('videoClipPreview').load();
  }
  function reset(){
    if(state.record)state.record.cancel();
    state.session++;state.preview=false;state.busy=false;state.file=null;state.duration=0;
    video().pause();video().removeAttribute('src');video().load();revoke('url');clearResults();
    $('videoDetails').hidden=true;$('videoClipCard').hidden=true;$('videoInput').value='';
    $('videoFileName').textContent='';$('videoFileMeta').textContent='';$('videoSeek').value='0';$('videoCurrentTime').textContent='00:00';$('videoTotalTime').textContent='00:00';
    $('videoStart').value='0';$('videoEnd').value='0';note('');busy(false);
  }
  function busy(value){state.busy=value;for(const id of ['videoPick','videoReset','videoFrameButton','videoStoryButton','videoExportClip','videoPreviewClip','videoSetStart','videoSetEnd','videoStart','videoEnd','videoSeek'])$(id).disabled=value;
    $('videoStop').disabled=!value&&!state.preview;}
  function updateTime(){
    if(!state.file)return;
    const sec=Number.isFinite(video().currentTime)?video().currentTime:0;
    $('videoCurrentTime').textContent=fmt(sec);$('videoSeek').value=String(Math.min(state.duration,sec));
    if(state.preview&&sec>=Number($('videoEnd').value)-0.035){video().pause();state.preview=false;$('videoStop').disabled=true;}
  }
  function clipRange(){
    const start=Number($('videoStart').value),end=Number($('videoEnd').value);
    if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>state.duration+.1||end-start<.5||end-start>MAX_CLIP+.001){note('invalidClip');return null;}
    return {start,end:Math.min(end,state.duration)};
  }
  async function seek(target){
    const el=video();target=Math.max(0,Math.min(state.duration-.03,Number(target)||0));
    if(Math.abs(el.currentTime-target)>.025||el.readyState<2){
      await new Promise((resolve,reject)=>{
        let timeout;
        const done=()=>{clearTimeout(timeout);el.removeEventListener('seeked',onseek);el.removeEventListener('error',onerror);};
        const onseek=()=>{done();resolve();};const onerror=()=>{done();reject(Error('Video decoding failed'));};
        el.addEventListener('seeked',onseek,{once:true});el.addEventListener('error',onerror,{once:true});
        timeout=setTimeout(()=>{done();reject(Error('Video seek timeout'));},12000);
        try{el.currentTime=target;}catch(e){done();reject(e);}
      });
    }
    // Let the freshly decoded frame be presented to the compositor before canvas extraction.
    if(typeof el.requestVideoFrameCallback==='function')await Promise.race([
      new Promise(resolve=>el.requestVideoFrameCallback(()=>resolve())),
      new Promise(resolve=>setTimeout(resolve,300))
    ]);
    else await new Promise(resolve=>setTimeout(resolve,100));
  }
  function canvasForFrame(maxSide=1920){
    const w=video().videoWidth,h=video().videoHeight;
    const scale=Math.min(1,maxSide/Math.max(w,h));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
    return canvas;
  }
  const toBlob=(canvas,type,quality)=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Canvas export failed')),type,quality));
  function saveResult(blob,prop,block,img,link,name){
    if(!blob||!blob.size)throw Error('Empty export');
    revoke(prop);state[prop]=URL.createObjectURL(blob);$(block).hidden=false;
    $(img).src=state[prop];$(link).href=state[prop];$(link).download=name;
    window.FileForgeAddVideoHistory?.({kind:'video',name:state.file.name,output:name,time:Date.now(),before:state.file.size,after:blob.size,width:video().videoWidth,height:video().videoHeight,duration:0});
  }
  async function loadFile(file){
    if(!file)return;if(state.busy){note('busy');return;}
    reset();
    const ext=(file.name.split('.').pop()||'').toLowerCase();
    if(!['mp4','m4v','webm','mov'].includes(ext)&&!['video/mp4','video/webm','video/quicktime'].includes(file.type)){note('invalid');return;}
    if(file.size<100||file.size>MAX_FILE){note('bigFile');return;}
    const token=state.session;state.file=file;state.url=URL.createObjectURL(file);note('loading');
    const player=video();player.src=state.url;player.load();
    try{
      await new Promise((resolve,reject)=>{
        const cleanup=()=>{clearTimeout(timeout);player.removeEventListener('loadedmetadata',ready);player.removeEventListener('error',fail);};
        const ready=()=>{cleanup();resolve();};const fail=()=>{cleanup();reject(Error('Unsupported video'));};
        player.addEventListener('loadedmetadata',ready,{once:true});player.addEventListener('error',fail,{once:true});
        const timeout=setTimeout(()=>{cleanup();reject(Error('Metadata timeout'));},16000);
        if(player.readyState>=1){cleanup();resolve();}
      });
      if(token!==state.session)return;
      if(!Number.isFinite(player.duration)||player.duration<=0||player.duration>MAX_DURATION||player.videoWidth<1||player.videoHeight<1||player.videoWidth*player.videoHeight>MAX_PIXELS)throw Error('Invalid duration or dimensions');
      state.duration=player.duration;
      $('videoDetails').hidden=false;$('videoClipCard').hidden=false;
      $('videoFileName').textContent=file.name;
      $('videoFileMeta').textContent=`${player.videoWidth} × ${player.videoHeight} px · ${fmt(player.duration)} · ${size(file.size)}`;
      $('videoSeek').max=String(player.duration);$('videoCurrentTime').textContent='00:00';$('videoTotalTime').textContent=fmt(player.duration);
      $('videoStart').max=String(player.duration);$('videoEnd').max=String(player.duration);
      $('videoStart').value='0';$('videoEnd').value=String(Math.min(player.duration,10).toFixed(1));
      $('videoClipSupport').textContent=tr(support()?'supported':'notSupported');$('videoExportClip').disabled=!support();
      note('loaded');
    }catch(e){console.warn('Video load',e);if(token!==state.session)return;reset();note(e.message==='Invalid duration or dimensions'?'badDuration':'badVideo');}
  }
  async function frame(){
    if(!state.file){note('needFile');return;}if(state.busy)return;
    busy(true);note('working');const player=video();player.pause();state.preview=false;
    try{
      await seek(player.currentTime);
      const canvas=canvasForFrame();canvas.getContext('2d').drawImage(player,0,0,canvas.width,canvas.height);
      const type=$('videoImageFormat').value;
      const blob=await toBlob(canvas,type,.88);
      if(blob.type!==type)throw Error('Unsupported format');
      const ext=type==='image/png'?'png':'jpg';
      saveResult(blob,'frameUrl','videoFrameResult','videoFramePreview','videoFrameDownload',`${baseName()}-${fmt(player.currentTime).replace(':','-')}.${ext}`);
      note('frameReady');
    }catch(e){console.warn('Video frame',e);note('noFrame');}
    finally{busy(false);$('videoExportClip').disabled=!support();}
  }
  async function storyboard(){
    if(!state.file){note('needFile');return;}if(state.busy)return;
    busy(true);note('working');state.preview=false;video().pause();
    const old=video().currentTime;
    try{
      const count=Number($('videoStoryCount').value);const cols=3,rows=Math.ceil(count/cols);
      const cellW=320,cellH=Math.round(cellW*video().videoHeight/video().videoWidth),label=30;
      if(cellH>570)throw Error('Tall video would make oversized sheet');
      const sheet=document.createElement('canvas');sheet.width=cols*cellW;sheet.height=rows*(cellH+label);
      const ctx=sheet.getContext('2d');ctx.fillStyle='#101925';ctx.fillRect(0,0,sheet.width,sheet.height);
      ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='bold 15px system-ui';
      for(let i=0;i<count;i++){
        const t=state.duration*(i+1)/(count+1);
        await seek(t);
        const x=(i%cols)*cellW,y=Math.floor(i/cols)*(cellH+label);
        ctx.drawImage(video(),x,y,cellW,cellH);
        ctx.fillStyle='#142030';ctx.fillRect(x,y+cellH,cellW,label);
        ctx.fillStyle='#e8f7f1';ctx.fillText(fmt(t),x+10,y+cellH+label/2);
      }
      const blob=await toBlob(sheet,'image/jpeg',.85);
      saveResult(blob,'storyUrl','videoStoryResult','videoStoryPreview','videoStoryDownload',`${baseName()}-storyboard-${count}.jpg`);
      note('storyReady');
    }catch(e){console.warn('Storyboard',e);note('error');}
    finally{try{await seek(old);}catch{}busy(false);$('videoExportClip').disabled=!support();}
  }
  async function preview(){
    if(!state.file){note('needFile');return;}if(state.busy)return;
    const range=clipRange();if(!range)return;
    state.preview=false;video().pause();await seek(range.start);
    video().playbackRate=1;state.preview=true;$('videoStop').disabled=false;note('previewing');
    try{await video().play();}catch{state.preview=false;$('videoStop').disabled=true;note('badVideo');}
  }
  async function recordClip(){
    if(!state.file){note('needFile');return;}if(state.busy)return;if(!support()){note('notSupported');return;}
    const range=clipRange();if(!range)return;
    busy(true);note('recording');state.preview=false;video().pause();
    const player=video(),token=state.session;
    let stream,recorder,rafId=0,frameId=0,ticker=0;
    try{
      await seek(range.start);
      if(token!==state.session)return;
      const canvas=canvasForFrame(960);const ctx=canvas.getContext('2d');
      ctx.drawImage(player,0,0,canvas.width,canvas.height);
      stream=canvas.captureStream(24);
      const chunks=[];
      recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:1_500_000});
      let aborted=false,complete=false;
      const done=new Promise((resolve,reject)=>{
        recorder.addEventListener('dataavailable',e=>{if(e.data?.size)chunks.push(e.data);if(chunks.reduce((n,c)=>n+c.size,0)>55*1024*1024){aborted=true;if(recorder.state!=='inactive')recorder.stop();}});
        recorder.addEventListener('error',()=>{aborted=true;reject(Error('Recorder failed'));},{once:true});
        recorder.addEventListener('stop',()=>{if(aborted||!chunks.length)reject(Error('Recording cancelled'));else resolve(new Blob(chunks,{type:'video/webm'}));},{once:true});
      });
      const paint=()=>{
        if(complete||aborted)return;
        try{ctx.drawImage(player,0,0,canvas.width,canvas.height);}catch{}
        if(typeof player.requestVideoFrameCallback==='function')frameId=player.requestVideoFrameCallback(paint);
        else rafId=requestAnimationFrame(paint);
      };
      const stop=cancel=>{
        if(complete)return;
        complete=true;if(cancel)aborted=true;
        clearInterval(ticker);
        if(frameId&&player.cancelVideoFrameCallback)player.cancelVideoFrameCallback(frameId);
        if(rafId)cancelAnimationFrame(rafId);
        player.pause();if(recorder.state!=='inactive')recorder.stop();
      };
      state.record={cancel:()=>stop(true)};
      recorder.start(250);
      paint();
      ticker=setInterval(()=>{if(player.currentTime>=range.end-.065||player.ended){stop(false);}},45);
      player.playbackRate=1;player.muted=true;player.controls=false;
      try{await player.play();}catch(e){stop(true);throw e;}
      // Avoid indefinite recording if the phone suspends playback.
      const watchdog=setTimeout(()=>stop(true),Math.ceil((range.end-range.start+9)*1000));
      let blob;
      try{blob=await done;}finally{clearTimeout(watchdog);stop(false);}
      if(token!==state.session)return;
      if(blob.size<400)throw Error('Empty recording');
      revoke('clipUrl');state.clipUrl=URL.createObjectURL(blob);
      $('videoClipResult').hidden=false;$('videoClipPreview').src=state.clipUrl;
      const name=`${baseName()}-silent-${range.start.toFixed(1)}-${range.end.toFixed(1)}.webm`;
      $('videoClipDownload').href=state.clipUrl;$('videoClipDownload').download=name;
      window.FileForgeAddVideoHistory?.({kind:'video',name:state.file.name,output:name,time:Date.now(),before:state.file.size,after:blob.size,width:canvas.width,height:canvas.height,duration:range.end-range.start});
      note('clipReady');
    }catch(e){console.warn('Video export',e);note('clipError');}
    finally{if(stream)stream.getTracks().forEach(t=>t.stop());player.pause();player.muted=false;player.controls=true;state.record=null;busy(false);$('videoExportClip').disabled=!support();}
  }
  function translate(){document.querySelectorAll('[data-video-i18n]').forEach(el=>{const key=el.dataset.videoI18n;if(text[window.FileForgeLanguage?.()==='en'?'en':'bg'][key])el.textContent=tr(key);});$('videoClipSupport').textContent=tr(support()?'supported':'notSupported');if(state.busy)note('recording');}
  document.addEventListener('DOMContentLoaded',()=>{
    $('videoOpenHome').addEventListener('click',()=>window.FileForgeOpenVideo?.());
    $('videoOpenTools').addEventListener('click',()=>window.FileForgeOpenVideo?.());
    $('videoPick').addEventListener('click',()=>{$('videoInput').value='';$('videoInput').click();});
    $('videoInput').addEventListener('change',e=>loadFile(e.target.files?.[0]));
    $('videoReset').addEventListener('click',()=>{if(state.busy){note('busy');return;}reset();});
    video().addEventListener('timeupdate',updateTime);
    video().addEventListener('ended',()=>{state.preview=false;$('videoStop').disabled=true;});
    $('videoSeek').addEventListener('input',e=>{if(!state.busy&&state.file){state.preview=false;video().pause();video().currentTime=Number(e.target.value);}});
    $('videoFrameButton').addEventListener('click',frame);
    $('videoStoryButton').addEventListener('click',storyboard);
    $('videoSetStart').addEventListener('click',()=>{if(state.file)$('videoStart').value=video().currentTime.toFixed(1);});
    $('videoSetEnd').addEventListener('click',()=>{if(state.file)$('videoEnd').value=video().currentTime.toFixed(1);});
    $('videoPreviewClip').addEventListener('click',preview);
    $('videoStop').addEventListener('click',()=>{if(state.record)state.record.cancel();else{video().pause();state.preview=false;$('videoStop').disabled=true;note('stopped');}});
    $('videoExportClip').addEventListener('click',recordClip);
    translate();busy(false);$('videoExportClip').disabled=!support();
  });
  window.VideoStudio={translate};
})();
