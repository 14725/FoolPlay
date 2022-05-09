/*

The file is.a part of Foolplay（傻瓜弹曲）

Foolplay is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

/* 对接meSpeak的接口，或者说，加载器 */

var Transplant = {
  ctx: null, 
  ok: false
};
Transplant.loadMeSpeak = function(){
  loadme.innerText = '加载TTS引擎...';
  var script = document.createElement('script');
  script.onload = Transplant.loadVoice;
  script.src = 'js/mespeak/mespeak.js';
  document.body.appendChild(script);
  Transplant.ok = true;
};
Transplant.loadVoice = function(){
  loadme.innerText = '加载英语语音数据...';
  meSpeak.loadVoice('en.json',Transplant.avalible);
};
Transplant.addVoice = async function(text){
  meSpeak.resetQueue(); /* meSpeak bug: 不能正确queue */
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
    int16[i] = float32[i] * 32767;
    i--;
  }
  /* 自动标注 */
  var i,sum=0;
  var sum2 = 0;
  const WIN = 1024;
  const MANL = 22050;
  for(i = 0; i<WIN; i++){
    sum += float32[i] * float32[i];
  }
  for(; i < MANL; i++){
    sum += float32[i] * float32[i];
    sum -= float32[i-WIN] * float32[i-WIN];
    sum2 += sum;
  }
  sum2 /= (MANL-WIN) * 2;
  sum = 0;
  for(i = 0; i<WIN; i++){
    sum += float32[i] * float32[i];
  }
  for(; i < MANL; i++){
    sum += float32[i] * float32[i];
    sum -= float32[i-WIN] * float32[i-WIN];
    if(sum > sum2) break;
  }
  var item = {
    consonant:i,
    data: int16, /* int16s */
    vowel: int16.length - 2048,
    length: int16.length * 2, /* x * 2 */
    freq: 441
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
  Transplant.addAllVoice();
  loadme.onclick = Transplant.addAllVoice;
  loadme.innerText = '为本乐谱准备英语';
}
Transplant.main = function(){
  Transplant.ctx = new OfflineAudioContext(1,1,44100)
  Transplant.loadMeSpeak();
};


Transplant.main();