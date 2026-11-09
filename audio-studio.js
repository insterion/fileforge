'use strict';
/* FileForge 0.6 — browser-only Audio Studio. No uploads, no third-party libraries.
   Input decoding depends on the Android Chrome codecs. Output: 16-bit PCM WAV. */
(() => {
  const $ = id => document.getElementById(id);
  const MAX_INPUT = 20 * 1024 * 1024;
  const MAX_SECONDS = 300;
  const MAX_DECODED_SAMPLES = 24_000_000;
  const MAX_WAV_BYTES = 48 * 1024 * 1024;
  const text = {
    bg: {
      homeTitle:'🎵 Audio Studio — изрежи и запази WAV',homeDescription:'Зареди аудио файл, избери откъс и изтегли нов WAV.',openAudio:'Отвори Audio →',toolDescription:'Възпроизвеждане · Trim · Volume · Fade · WAV',
      audioHeading:'Звуков редактор',audioIntro:'Избери откъс и запази нов WAV файл локално на телефона.',reset:'Ново',chooseHeading:'1. Избери аудио',formatHelp:'WAV, MP3, M4A, OGG, WebM — ако Chrome може да ги декодира. Максимум 20 MB, до 5 минути.',chooseFile:'＋ Избери аудио файл',originalPlayer:'Плейърът по-горе възпроизвежда оригиналния запис.',trimHeading:'2. Избери откъс',waveHint:'Вълната показва силата на звука, а оцветената част — избрания откъс.',startLabel:'Начало (секунди)',endLabel:'Край (секунди)',startSlider:'Начало',endSlider:'Край',preview:'▶ Чуй избрания откъс',stop:'■ Спри',effectsHeading:'3. Настройки на звука',volumeLabel:'Сила на звука при export',fadeIn:'Плавно начало (Fade in)',fadeOut:'Плавен край (Fade out)',filenameLabel:'Име на новия файл (WAV)',exportButton:'4. Обработи и създай WAV',readyTitle:'WAV файлът е готов',downloadButton:'↓ Изтегли WAV',privacyNote:'Оригиналът не се променя. В историята се пазят само името и размерът, а не аудио файлът.',limitsNote:'Изход: 16-bit PCM WAV. Паметта на телефона ограничава дългите записи. MP3 export и съединяване на файлове предстоят.',
      chooseFirst:'Първо избери аудио файл.',tooLarge:'Този файл е твърде голям или празен (лимит 20 MB).',unsupported:'Неподдържан формат. Опитай с MP3 или WAV.',decoding:'Декодиране на аудио…',decodeFailed:'Chrome не успя да декодира този файл. Опитай с друг MP3/WAV или по-кратък запис.',tooLong:'Записът е твърде дълъг или изисква прекалено много памет (макс. 5 минути).',loaded:'Аудиото е заредено. Избери откъс.',invalidTime:'Избери валиден откъс с дължина поне 0.1 секунда.',working:'Създавам WAV…',wavTooBig:'WAV резултатът е твърде голям. Избери по-кратък откъс.',done:'Готово — WAV файлът може да се изтегли.',exportError:'Неуспешен export. Опитай с по-кратък откъс.',playing:'Възпроизвеждам избрания откъс…',noWebAudio:'Този браузър не поддържа Web Audio API.',seconds:'сек',channels:'канала',channel:'канал',samples:'Hz'
    },
    en: {
      homeTitle:'🎵 Audio Studio — trim and save WAV',homeDescription:'Load audio, select a clip, and download a new WAV.',openAudio:'Open Audio →',toolDescription:'Playback · Trim · Volume · Fade · WAV',
      audioHeading:'Audio editor',audioIntro:'Select a clip and save a new WAV file locally on your phone.',reset:'New',chooseHeading:'1. Choose audio',formatHelp:'WAV, MP3, M4A, OGG, WebM — if Chrome can decode them. Maximum 20 MB, up to 5 minutes.',chooseFile:'＋ Choose audio file',originalPlayer:'The player above plays the original recording.',trimHeading:'2. Select clip',waveHint:'The waveform shows loudness. The highlighted portion is your selected clip.',startLabel:'Start (seconds)',endLabel:'End (seconds)',startSlider:'Start',endSlider:'End',preview:'▶ Preview selection',stop:'■ Stop',effectsHeading:'3. Sound settings',volumeLabel:'Export volume',fadeIn:'Fade in',fadeOut:'Fade out',filenameLabel:'New file name (WAV)',exportButton:'4. Process and create WAV',readyTitle:'Your WAV is ready',downloadButton:'↓ Download WAV',privacyNote:'Your original stays untouched. History stores the name and size, not the audio.',limitsNote:'Output: 16-bit PCM WAV. Phone memory limits long recordings. MP3 export and joining files are planned for later.',
      chooseFirst:'Choose audio first.',tooLarge:'This file is empty or too large (20 MB limit).',unsupported:'Unsupported file. Try MP3 or WAV.',decoding:'Decoding audio…',decodeFailed:'Chrome could not decode this file. Try another MP3/WAV or shorter clip.',tooLong:'The track is too long or uses too much memory (5-minute limit).',loaded:'Audio loaded. Select a clip.',invalidTime:'Select a valid clip at least 0.1 second long.',working:'Creating WAV…',wavTooBig:'The WAV output is too large. Choose a shorter clip.',done:'Ready — the WAV can be downloaded.',exportError:'Export failed. Try a shorter clip.',playing:'Playing your selection…',noWebAudio:'Web Audio API is unavailable in this browser.',seconds:'sec',channels:'channels',channel:'channel',samples:'Hz'
    }
  };
  const lang = () => window.FileForgeLanguage?.() === 'en' ? 'en' : 'bg';
  const tr = key => text[lang()][key] || key;
  const state = {file:null,buffer:null,ctx:null,source:null,sourceUrl:null,downloadUrl:null,busy:false,loading:false,loadId:0,selectionStart:0,selectionEnd:0};
  const legalExt = /\.(wav|wave|mp3|m4a|aac|ogg|oga|webm|mp4)$/i;
  const keepValue = (n,min,max) => Math.min(max,Math.max(min,n));
  const round = n => Math.round(n * 10) / 10;
  const formatSeconds = n => {const secs=Math.max(0,Math.floor(n)),m=Math.floor(secs/60),s=secs%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');};
  const sizeText = n => n>=1048576?(n/1048576).toFixed(2)+' MB':Math.round(n/1024)+' KB';
  const msg = (value, bad=false) => {const el=$('audioStatus');el.textContent=value;el.classList.toggle('danger',bad);};
  const sanitize = name => name.replace(/\.[^.]+$/,'').normalize('NFC').replace(/[^\p{L}\p{N}_-]+/gu,'_').replace(/^_+|_+$/g,'').slice(0,70) || 'audio';
  function clearDownload(){
    if(state.downloadUrl)URL.revokeObjectURL(state.downloadUrl);
    state.downloadUrl=null;$('audioDownload').removeAttribute('href');$('audioResults').hidden=true;$('audioResultDescription').textContent='';
  }
  function stopPreview(){
    if(state.source){try{state.source.onended=null;state.source.stop();state.source.disconnect();}catch{}state.source=null;}
  }
  function invalidate(){stopPreview();clearDownload();}
  function reset(){
    if(state.busy||state.loading)return;
    state.loadId++;stopPreview();clearDownload();
    $('audioPlayer').pause();$('audioPlayer').removeAttribute('src');$('audioPlayer').load();
    if(state.sourceUrl)URL.revokeObjectURL(state.sourceUrl);
    state.sourceUrl=null;state.file=null;state.buffer=null;state.selectionStart=0;state.selectionEnd=0;
    $('audioInput').value='';$('audioDetails').hidden=true;$('audioFileName').textContent='';$('audioFileMeta').textContent='';
    $('audioStartNumber').value='0';$('audioEndNumber').value='0';$('audioVolume').value='100';$('audioVolumeValue').textContent='100%';
    $('audioFadeIn').checked=false;$('audioFadeOut').checked=false;$('audioProgress').hidden=true;msg('');
  }
  async function context(){
    if(!state.ctx){const AudioContextType=window.AudioContext||window.webkitAudioContext;if(!AudioContextType)throw Error(tr('noWebAudio'));state.ctx=new AudioContextType();}
    return state.ctx;
  }
  function drawWave(){
    const canvas=$('audioWave'),data=state.buffer,box=canvas.parentElement;
    const w=Math.max(240,Math.round(box.getBoundingClientRect().width-2)),h=160;
    const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width='100%';canvas.style.height=h+'px';
    const g=canvas.getContext('2d');if(!g)return;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
    g.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--surface3').trim()||'#192839';g.fillRect(0,0,w,h);
    if(!data)return;
    const dur=data.duration;
    const startX=state.selectionStart/dur*w,endX=state.selectionEnd/dur*w;
    g.fillStyle='rgba(76,200,148,0.18)';g.fillRect(startX,0,Math.max(0,endX-startX),h);
    const ch=data.getChannelData(0),mid=h/2,bars=Math.floor(w/3),sampleStep=Math.max(1,Math.floor(ch.length/(bars*28)));
    for(let b=0;b<bars;b++){
      const from=Math.floor(b*ch.length/bars),to=Math.min(ch.length,Math.floor((b+1)*ch.length/bars));let peak=0;
      for(let i=from;i<to;i+=sampleStep)peak=Math.max(peak,Math.abs(ch[i]));
      const bh=Math.max(2,Math.min(1,peak)*(h*.44));
      g.fillStyle=b*3>=startX&&b*3<=endX?'#76dfb2':'#6383a0';g.fillRect(b*3+1,mid-bh,2,bh*2);
    }
    g.fillStyle='#d5f7e8';g.fillRect(startX,0,2,h);g.fillRect(endX-2,0,2,h);
  }
  function updateLabels(){
    $('audioStartNumber').value=state.selectionStart.toFixed(1);$('audioEndNumber').value=state.selectionEnd.toFixed(1);
    $('audioStartRange').value=String(state.selectionStart);$('audioEndRange').value=String(state.selectionEnd);
    $('audioSelectionLabel').textContent=`${formatSeconds(state.selectionStart)} → ${formatSeconds(state.selectionEnd)}`;
    $('audioDurationLabel').textContent=(state.selectionEnd-state.selectionStart).toFixed(1)+' s';
    drawWave();
  }
  function setSelection(which,raw){
    if(!state.buffer||state.busy)return;
    const d=state.buffer.duration;let n=Number(raw);if(!Number.isFinite(n))return;
    n=round(keepValue(n,0,d));
    if(which==='start')state.selectionStart=Math.min(n,round(Math.max(0,state.selectionEnd-0.1)));
    else state.selectionEnd=Math.max(n,round(Math.min(d,state.selectionStart+0.1)));
    invalidate();updateLabels();msg('');
  }
  async function load(file){
    if(!file||state.busy||state.loading)return;
    reset();
    if(!legalExt.test(file.name)||file.size===0||file.size>MAX_INPUT){msg(tr(file.size>MAX_INPUT||file.size===0?'tooLarge':'unsupported'),true);return;}
    const loadId=++state.loadId;
    state.loading=true;$('audioPick').disabled=true;$('audioReset').disabled=true;msg(tr('decoding'));
    try{
      const ctx=await context(),b=await file.arrayBuffer();
      const decoded=await ctx.decodeAudioData(b);
      if(loadId!==state.loadId)return;
      const total=decoded.length*decoded.numberOfChannels;
      if(decoded.duration>MAX_SECONDS||total>MAX_DECODED_SAMPLES||decoded.numberOfChannels>2||decoded.duration<0.1)throw Error(tr('tooLong'));
      state.file=file;state.buffer=decoded;state.selectionStart=0;state.selectionEnd=round(decoded.duration);
      // The last tenth-of-a-second can be slightly beyond the buffer duration: clamp on encode.
      state.sourceUrl=URL.createObjectURL(file);$('audioPlayer').src=state.sourceUrl;
      $('audioFileName').textContent=file.name;
      $('audioFileMeta').textContent=`${sizeText(file.size)} · ${formatSeconds(decoded.duration)} · ${decoded.sampleRate} ${tr('samples')} · ${decoded.numberOfChannels} ${decoded.numberOfChannels===1?tr('channel'):tr('channels')}`;
      $('audioOutputName').value=sanitize(file.name)+'-fileforge';
      for(const id of ['audioStartRange','audioEndRange','audioStartNumber','audioEndNumber'])$(id).max=decoded.duration.toFixed(3);
      $('audioDetails').hidden=false;updateLabels();msg(tr('loaded'));
    }catch(err){console.warn('AudioStudio load:',err);msg(err.message===tr('tooLong')||err.message===tr('noWebAudio')?err.message:tr('decodeFailed'),true);}
    finally{state.loading=false;$('audioPick').disabled=false;$('audioReset').disabled=false;$('audioInput').value='';}
  }
  async function preview(){
    if(!state.buffer||state.busy){msg(tr('chooseFirst'),true);return;}
    const duration=Math.min(state.selectionEnd,state.buffer.duration)-state.selectionStart;
    if(duration<0.1){msg(tr('invalidTime'),true);return;}
    stopPreview();$('audioPlayer').pause();
    try{
      const ctx=await context();await ctx.resume();
      const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=state.buffer;gain.gain.value=Number($('audioVolume').value)/100;
      source.connect(gain).connect(ctx.destination);
      const fadeTime=Math.min(.6,duration/4),now=ctx.currentTime;
      if($('audioFadeIn').checked){gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(Number($('audioVolume').value)/100,now+fadeTime);}
      if($('audioFadeOut').checked){gain.gain.setValueAtTime(Number($('audioVolume').value)/100,now+duration-fadeTime);gain.gain.linearRampToValueAtTime(0,now+duration);}
      source.onended=()=>{if(state.source===source){state.source=null;msg('');}};
      state.source=source;source.start(0,state.selectionStart,duration);msg(tr('playing'));
    }catch(err){console.warn('AudioStudio preview:',err);msg(tr('decodeFailed'),true);}
  }
  function writeString(view,offset,str){for(let i=0;i<str.length;i++)view.setUint8(offset+i,str.charCodeAt(i));}
  async function makeWav(){
    if(!state.buffer||state.busy){msg(tr('chooseFirst'),true);return;}
    stopPreview();$('audioPlayer').pause();clearDownload();
    const buff=state.buffer,rate=buff.sampleRate,channels=buff.numberOfChannels;
    const from=Math.round(keepValue(state.selectionStart,0,buff.duration)*rate),to=Math.min(buff.length,Math.round(keepValue(state.selectionEnd,0,buff.duration)*rate));
    const frames=to-from,bytes=44+frames*channels*2;
    if(frames<Math.round(.1*rate)){msg(tr('invalidTime'),true);return;}
    if(bytes>MAX_WAV_BYTES){msg(tr('wavTooBig'),true);return;}
    state.busy=true;const button=$('audioExport');button.disabled=true;$('audioPick').disabled=true;$('audioReset').disabled=true;
    const progress=$('audioProgress');progress.hidden=false;progress.value=0;msg(tr('working'));
    try{
      const buffer=new ArrayBuffer(bytes),v=new DataView(buffer);
      writeString(v,0,'RIFF');v.setUint32(4,bytes-8,true);writeString(v,8,'WAVE');writeString(v,12,'fmt ');
      v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,rate,true);
      v.setUint32(28,rate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);
      writeString(v,36,'data');v.setUint32(40,bytes-44,true);
      const streams=Array.from({length:channels},(_,c)=>buff.getChannelData(c));
      const level=Number($('audioVolume').value)/100,fadeLen=Math.min(Math.round(.6*rate),Math.floor(frames/4));
      const fadeIn=$('audioFadeIn').checked,fadeOut=$('audioFadeOut').checked;
      let offset=44;
      for(let block=0;block<frames;block+=16384){
        const stop=Math.min(frames,block+16384);
        for(let frame=block;frame<stop;frame++){
          let gain=level;
          if(fadeIn&&fadeLen>0&&frame<fadeLen)gain*=frame/fadeLen;
          if(fadeOut&&fadeLen>0&&frame>frames-fadeLen-1)gain*=(frames-frame-1)/fadeLen;
          for(let c=0;c<channels;c++){
            const x=Math.max(-1,Math.min(1,streams[c][from+frame]*gain));
            v.setInt16(offset,x<0?Math.round(x*32768):Math.round(x*32767),true);offset+=2;
          }
        }
        progress.value=Math.round(stop/frames*100);
        if(stop<frames)await new Promise(resolve=>setTimeout(resolve,0));
      }
      const blob=new Blob([buffer],{type:'audio/wav'});
      const name=sanitize($('audioOutputName').value)+'.wav';
      state.downloadUrl=URL.createObjectURL(blob);$('audioDownload').href=state.downloadUrl;$('audioDownload').download=name;
      window.FileForgeResults?.add({blob,name,kind:'audio'});
      $('audioResultDescription').textContent=`${name} · ${(frames/rate).toFixed(1)} s · ${sizeText(blob.size)} · PCM 16-bit`;
      $('audioResults').hidden=false;msg(tr('done'));
      window.FileForgeAddAudioHistory?.({kind:'audio',name:state.file.name,output:name,time:Date.now(),before:state.file.size,after:blob.size,duration:round(frames/rate)});
    }catch(err){console.warn('AudioStudio WAV:',err);msg(tr('exportError'),true);}
    finally{state.busy=false;button.disabled=false;$('audioPick').disabled=false;$('audioReset').disabled=false;progress.hidden=true;}
  }
  function translate(){
    document.querySelectorAll('[data-audio-i18n]').forEach(el=>{const value=text[lang()][el.dataset.audioI18n];if(value)el.textContent=value;});
    if(state.file){$('audioFileMeta').textContent=`${sizeText(state.file.size)} · ${formatSeconds(state.buffer.duration)} · ${state.buffer.sampleRate} ${tr('samples')} · ${state.buffer.numberOfChannels} ${state.buffer.numberOfChannels===1?tr('channel'):tr('channels')}`;drawWave();}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('audioOpenHome').addEventListener('click',()=>window.FileForgeOpenAudio?.());
    $('audioOpenTools').addEventListener('click',()=>window.FileForgeOpenAudio?.());
    $('audioPick').addEventListener('click',()=>{if(state.busy||state.loading)return;$('audioInput').value='';$('audioInput').click();});
    $('audioInput').addEventListener('change',e=>load(e.target.files?.[0]));
    $('audioReset').addEventListener('click',reset);
    $('audioPreview').addEventListener('click',preview);
    $('audioStop').addEventListener('click',()=>{stopPreview();$('audioPlayer').pause();msg('');});
    $('audioExport').addEventListener('click',makeWav);
    for(const [id,key] of [['audioStartNumber','start'],['audioStartRange','start'],['audioEndNumber','end'],['audioEndRange','end']])$(id).addEventListener(id.endsWith('Number')?'change':'input',e=>setSelection(key,e.target.value));
    for(const id of ['audioVolume','audioFadeIn','audioFadeOut','audioOutputName'])$(id).addEventListener('input',()=>{clearDownload();if(id==='audioVolume')$('audioVolumeValue').textContent=$('audioVolume').value+'%';});
    window.addEventListener('resize',()=>{if(state.buffer&&!$('audioDetails').hidden)drawWave();});
    translate();
  });
  window.AudioStudio={translate,stop:stopPreview};
})();
