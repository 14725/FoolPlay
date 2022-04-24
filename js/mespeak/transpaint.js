var Transplant = {};
Transplant.loadMeSpeak = function(){
  loadme.innerText = '加载TTS引擎...';
  var script = document.createElement('script');
  script.onload = Transplant.loadVoice;
  script.src = 'js/mespeak/mespeak.js';
  document.body.appendChild(script);
};
Transplant.loadVoice = function(){
  loadme.innerText = '加载英语语音数据...';
  meSpeak.loadVoice('en.json',Transplant.avalible);
};
Transplant.addVoice = async function(text){
  var wav = await new Promise(function(ok,fail){
    meSpeak.speak(text,{
      rawdata: true,
      variant: 'f5',
      wordgap: 0,
      speed: 80,
      nostop: true
    },function(success,_,data){
      console.log(success,_,data)
      if(!success){
        fail(Error('Success == false'));
        return;
      }
      ok(data);
    });
  });
  var ctx = Transplant.ctx;
  var buf = await ctx.decodeAudioData(wav);
  var float32 = buf.getChannelData(0);
  var int16 = new Int16Array(float32.length);
  var i = float32.length - 1;
  while(i != 0){
    int16[i] = float32[i] * 32767 - 32767/2;
    i--;
  }
  console.log(int16)
  var item = {
    consonant:2048,
    data: int16, /* int16s */
    vowel: int16.length - 2048,
    length: int16.length * 2, /* x * 2 */
    freq: 225
  };
  Player.anoMeta[text] = item;
};
Transplant.addAllVoice = async function(){
  var words = {};
  Music.flat().map(function(a){
    return String((a.word ||'')).replace(/[^A-Z]/ig,'').toLowerCase();
  }).filter(function(a){
    return a;
  }).forEach(function(a){
    words[a] = 1;
  });
  for(var i in words){
    if(!Player.anoMeta[i]){
      Player.trace('生成声音：' + i);
      await Transplant.addVoice(i);
    }
  }
  Player.trace('英语发音准备完成。')
};
Transplant.avalible = function(){
  loadme.onclick = Transplant.addAllVoice;
  loadme.innerText = '为本乐谱准备英语';
}
Transplant.main = function(){
  Transplant.ctx = new OfflineAudioContext(1,1,44100)
  Transplant.loadMeSpeak();
};


Transplant.main();