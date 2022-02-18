// jshint maxerr:9999

/*! https://mths.be/scrollingelement v1.5.2 by @diegoperini & @mathias | MIT license */
/* Shrunk to be small by asdfqw */
if (!('scrollingElement' in document)) (function() {
  function computeStyle(element) {
    return getComputedStyle(element, null);
  }

  function isBodyElement(element) {
    return element instanceof HTMLBodyElement;
  }

  function getNextBodyElement(frameset) {
    // We use this function to be correct per spec in case `document.body` is
    // a `frameset` but there exists a later `body`. Since `document.body` is
    // a `frameset`, we know the root is an `html`, and there was no `body`
    // before the `frameset`, so we just need to look at siblings after the
    // `frameset`.
    var current = frameset;
    while (current = current.nextSibling) {
      if (current.nodeType == 1 && isBodyElement(current)) {
        return current;
      }
    }
    // No `body` found.
    return null;
  }

  // Note: standards mode / quirks mode can be toggled at runtime via
  // `document.write`.
  var isCompliantCached;
  var isCompliant = function() {
    var isStandardsMode = /^CSS1/.test(document.compatMode);
    if (!isStandardsMode) {
      // In quirks mode, the result is equivalent to the non-compliant
      // standards mode behavior.
      return false;
    }
    if (isCompliantCached === void 0) {
      // When called for the first time, check whether the browser is
      // standard-compliant, and cache the result.
      var iframe = document.createElement('iframe');
      iframe.style.height = '1px';
      (document.body || document.documentElement || document).appendChild(iframe);
      var doc = iframe.contentWindow.document;
      doc.write('<!DOCTYPE html><div style="height:9999em">x</div>');
      doc.close();
      isCompliantCached = doc.documentElement.scrollHeight > doc.body.scrollHeight;
      iframe.parentNode.removeChild(iframe);
    }
    return isCompliantCached;
  };

  function isRendered(style) {
    return style.display != 'none' && !(style.visibility == 'collapse' &&
      /^table-(.+-group|row|column)$/.test(style.display));
  }

  function isScrollable(body) {
    // A `body` element is scrollable if `body` and `html` both have
    // non-`visible` overflow and are both being rendered.
    var bodyStyle = computeStyle(body);
    var htmlStyle = computeStyle(document.documentElement);
    return bodyStyle.overflow != 'visible' && htmlStyle.overflow != 'visible' &&
    isRendered(bodyStyle) && isRendered(htmlStyle);
  }

  var scrollingElement = function() {
    if (isCompliant()) {
      return document.documentElement;
    }
    var body = document.body;
    // Note: `document.body` could be a `frameset` element, or `null`.
    // `tagName` is uppercase in HTML, but lowercase in XML.
    var isFrameset = body && !/body/i.test(body.tagName);
    body = isFrameset ? getNextBodyElement(body): body;
    // If `body` is itself scrollable, it is not the `scrollingElement`.
    return body && isScrollable(body) ? null: body;
  };
  document.scrollingElement = scrollingElement();
  if (Object.defineProperty) {
    // Support modern browsers that lack a native implementation.
    Object.defineProperty(document, 'scrollingElement', {
      'get': scrollingElement
    });
  } else if (document.__defineGetter__) {
    // Support Firefox ≤ 3.6.9, Safari ≤ 4.1.3.
    document.__defineGetter__('scrollingElement', scrollingElement);
  }
}());
/* Array.flat/flatmap的填补*/
(function() {
    Array.prototype.flat || Object.defineProperty(Array.prototype, "flat", {
        configurable: !0,
        value: function r() {
            var t = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
            return t ? Array.prototype.reduce.call(this, function(a, e) {
                return Array.isArray(e) ? a.push.apply(a, r.call(e, t - 1)) : a.push(e), a;
            }, []) : Array.prototype.slice.call(this);
        },
        writable: !0
    }), Array.prototype.flatMap || Object.defineProperty(Array.prototype, "flatMap", {
        configurable: !0,
        value: function(r) {
            return Array.prototype.map.apply(this, arguments).flat();
        },
        writable: !0
    });
})();
/* Chainable Array ForEach */
Object.defineProperty(Array.prototype,'chainableForEach',{
  value:function(...rest){
    this.forEach.apply(this,rest);
    return this;
  }
});

var Player = {
  ctx: null,
  trans: 0,
  music: [],
  voice: [],
  highLight: [],
  highLightTid: 0,
  highLightStamp: 0,
  timePassed: 0,
  timeStart: 0,
  target: null,
  wave: null,
  pyTable: {},
  pianoSample: null,

  enableSMPlay: true,
  enableVoice: true,
  enableChord: true,
  enableMusic: true,


  tasking: [],

  storage: yuxStorage
};
Player.meta = {};
Player.buffer = null;
/* 对象模板 */
var itemT = {
  fileStart: 0,
  length: 0,
  consonant: 0,
  vowel: 0,
  freq: 0,
  volConsonant: 0,
  volFull: 0,
  data: null
  /* TODO:是什么呢 */
};
Player.manvoice = function player_manvoice(sentense, detune, start, len, vol,raw) {
  //前置条件检测
  if(1){
  if (!Player.enableVoice)return;
  if (!sentense)    return;
  if (!Player.meta) {
    Player.trace('音源尚未加载。');
    return;
  }
  if (Player.timeStart + start - Player.ctx.currentTime < -1){
    // 计时器延误，丢弃。
    return;
  }
  
  sentense = sentense[0];
  pinyin = sentense.split("").map(function(a) {
    return Pinyin.convertToPinyin(a, '', true)})[0];
  if (!pinyin) return;
  if (!(pinyin in Player.meta)) {
    Player.trace('未知拼音：'+sentense+': '+pinyin);
    return;
  }
  }
  vol *= 1.2;
  var extendLimit = 0.4; // 延长的上限
  var extendLength = 0.2;
  var l = len * 44100;
  var advance = 0.01;
  var maxGap = Math.min(len * 0.4,(len - detune[detune.length - 1].time)/8); // 最长的滑音
  var freqList = []; //频率滑动表
  
  
  //延长处理
  //console.log(sentense);
  if (!raw.isTooLong|| sentense == '啦') {
    l += extendLength * 44100;
    //console.log('处理');
  }
  if (sentense == '啦') {
    l += 0.3 * 44100;
  }
  advance = l/44100 * (Player.meta[pinyin][0].consonant / Player.meta[pinyin][0].length * 2);
  
  // 计算频率函数
  for(let i = detune.length - 1;i >=1;i--){
    maxGap = Math.min(maxGap,(detune[i].time - detune[i-1].time) / 8 - 0.005);
  }
  //maxGap = 0.001;
  freqList = detune.map(function(d,id){
    
    if(id == 0 ){
      return [
        [
          (d.time +advance) * 44100, Math.log(d.f)
        ]
      ];
    }
    
    return [
      [
        (d.time +advance- maxGap) * 44100, Math.log(detune[id-1].f)
      ],[
        (d.time +advance+ maxGap) * 44100, Math.log(d.f)
      ]
    ];
  }).flat();
  var ffreq = Player.getF(freqList);
  var buf1 = Player.transform(Player.meta[pinyin][0], l, function(x) {
    return x;
  }, function(x){return Math.exp(ffreq(x))});
  var ctx = Player.ctx;
  var n = ctx.createBufferSource();
  var g = ctx.createGain();
  var st = start;
  //g.gain.value = vol;
  g.gain.linearRampToValueAtTime(0.0001,Player.timeStart +0);
  g.gain.linearRampToValueAtTime(0.0001,Player.timeStart +start - advance);
  g.gain.linearRampToValueAtTime(vol,Player.timeStart +start);
  g.gain.linearRampToValueAtTime(vol,Player.timeStart +start + len);
  g.gain.linearRampToValueAtTime(0.0001,Player.timeStart +start + len + extendLength);
  n.buffer = Player.convertBuffer(buf1);
  n.connect(g);
  g.connect(Player.target);
  n.start(Player.timeStart + Math.max(0, start - advance));
  return (function() {
    g.disconnect(Player.target);
  });
};
/* 海宁窗 {n} = [0, 1] */
Player.hann = function hann(n) {
  return (1 + Math.cos(2 * Math.PI * (n - 0.5)))/2;
};
/* 初始化数据 */
Player.load1 = async function() {
  try {
    Player.trace('加载音源：加载数据。');

    Player.buffer = null;

    Player.buffer = await Player.storage.getItem('voice.d');
    if(!Player.buffer){
      Player.trace('加载音源：从网络下载音源...');
      await Player.downloadVoice();
      Player.buffer = await Player.storage.getItem('voice.d');
      return;
    }
    await Player.load2();
  }catch(e) {
    console.error(e);
    Player.trace(String(e));
  }
};
Player.load2 = function() {
  Player.trace('加载音源：加载记录表。');
  var meta = {};
  return (async function() {

    var text = await Player.storage.getItem('inf.d');
    var table = text.split('\n');
    /* 去除版本号和一些信息 */
    table.shift();
    table.shift();
    /* 还原袅袅音源记录表 */
    table = table.map((line)=>(
      atob(line).trim().split(/\s+/g)
    ));
    /* 转换为对象 */
    table.forEach((a) => (a[0] = a[0].split('_')[0]));
    table.forEach(function(line) {
      if (!(line[0] in meta)) {
        meta[line[0]] = [];
      }
      var item = Object.assign({}, itemT);
      Object.seal(item);

      Object.keys(item).forEach(function(key, i) {
        item[key] = parseFloat(line[i+1]);
      });
      item.data = new Int16Array(Player.buffer, item.fileStart, item.length / 2);
      meta[line[0]].push(item);
    });
    Player.meta = meta;
    Player.trace('加载音源：完成。');

  })().catch((e) => {
    console.error(e);
    throw e;
  });
};
Player.convertBuffer = function player_convertBuffer(buffer) {
  var ctx = Player.ctx;
  ctx.resume();
  var temp = new Float32Array(buffer.length);
  var audioBuffer = ctx.createBuffer(1, buffer.length, 44100);
  var i;
  var l;
  for (i = 0, l = buffer.length; i < l; ++i) {
    temp[i] = buffer[i] / 32768;
  }
  audioBuffer.copyToChannel(temp, 0);
  return audioBuffer;
}

/* 线性插值，用点列表生成连续函数 */
Player.getF = function getF(points) {
  //if(points.length >1)console.log(points)
  return function(x) {
    if (x < points[0][0]) {
      return points[0][1];
    }
    if (x >= points[points.length - 1][0]) {
      return points[points.length -1][1];
    }
    var d;
    for (d = 0; points[d][0] <= x; d++);
    var x1 = points[d-1][0],
    y1 = points[d-1][1],
    k = (points[d][1] - points[d-1][1]),
    p = (x - x1)  / (points[d][0] - points[d-1][0]);
    return y1 + k*p;
  };
};

/* 取样，并且“加窗” */
Player.sample = function player_sample(data, total, now) {
  var t = 44100 / data.freq;
  if (t > data.data.length) {
    throw new Error("频率过低：声音周期不能比声音片段更长。");
  }
  //test
  var pos = now * (data.data.length - t) / total;
  var pos1,
  pos2,
  k;
  pos1 = Math.floor(pos / t) * t;
  pos2 = Math.ceil(pos / t) * t;
  if (Math.abs(pos1- pos2) < 1) {
    k = 1;
  } else {
    k = (pos-pos1) / (pos2-pos1);
  }
  t = Math.round(t);
  pos1 = Math.max(0, Math.min(Math.round(pos1), data.data.length - t));
  pos2 = Math.max(0, Math.min(Math.round(pos2), data.data.length - t));
  var example = new Int16Array(t);

  /* 数据拷贝 -- F**k */
  for (i = 0; i < t; i++) {
    example[i] = (k * data.data[pos2 + i] + (1-k) *data.data[pos1 + i]) * Player.hann(i / t);
  }
  return example;
};

Player.transform = function transform(data, length, fPos, fFreq) {
  var wave = new Int16Array(length);
  //alert(sample(data,99999,40000));//return [];
  /* 原始周期 */
  var t0 = data.freq;
  /* 一个周期的波形 */
  var sam = null;
  /* 实时周期 */
  var t = 0;
  var pos = 0;
  var start,
  end,
  i;
  while (pos < wave.length) {
    t = Math.round(44100 / fFreq(pos));
    sam = Player.sample(data, length, fPos(pos));

    start = pos;
    for (i = 0; i <= t0; i++) {
      if (i + start < 0) {
        continue;
      }
      if (i + start >= length) {
        break;
      }
      //alert([i,i+start]);
      wave[i + start] += sam[i];
    }
    pos += t;
  }
  return wave;
};


Player.soundItem = {
  vol: 0.3,
  //0~1
  len: 1,
  //sec
  start: 0,
  f: [{
    time: 0,
    f: 440,
  }],
  //[],
  fx: [],
  word: "",
  isChord: false
};
Player.highLightItem = {
  time: 0,
  eleId: 0
};
Player.loadPyTable = function player_loadPyTable() {};
Player.loadSample = function player_loadSample() {
  var request = new XMLHttpRequest();
  request.open('GET', 'data/pianosap.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    var audioData = request.response;
    Player.ctx.decodeAudioData(audioData, function(buffer) {
      Player.pianoSample = buffer;
    }),
    function(e) {
      console.warn("钢琴采样加载失败，将使用合成音效。" + e.err)};
  };
  request.send();
};
Player.main = function player_main() {
  if (!("AudioContext" in window)) {
    UI.statusbar.querySelector("div").innerHTML = "您的浏览器对音频编辑没有足够的编辑功能。";
    return;
  }
  Player.ctx = new AudioContext();
  Player.DC = Player.ctx.createDynamicsCompressor();
  Player.DC.connect(Player.ctx.destination);
  Player.voiceNode = Player.ctx.createGain();
  Player.voiceNode.gain.value = 1;
  Player.target = Player.ctx.destination;
  Player.target = Player.DC;
  var real = new Float32Array(11);
  var imag = new Float32Array(11);
  var ac = Player.ctx;

  real[0] = 0;
  imag[0] = 0;
  real[1] = 0.2;
  imag[1] = 0;
  for (var i = 1; i <= 15; i++) {
    real[i] = 0.2 * Math.pow((15-i) * 0.1, 4);
    imag[i] = 0;
  }
  Player.wave = ac.createPeriodicWave(real, imag, {
    disableNormalization: true
  });
  Player.load1();
  Player.loadSample();
};
Player.fMap = {};
(function fillfMap() {
  var fMap = Player.fMap;
  var p = 1 / 12;
  fMap[6] = 0;
  fMap[7] = 2*p;
  fMap[1] = -9*p;
  fMap[2] = -7*p;
  fMap[3] = -5*p;
  fMap[4] = -4*p;
  fMap[5] = -2*p;
})();
Player.start = function player_start(startTime, tune, len, vol, isChord, word) {
  if (!Player.ctx)return;
  if ((!Player.enableMusic) && (!isChord))return;
  if ((Player.enableVoice && word) && (!isChord) && Player.buffer && Player.buffer.byteLength > 2048)return;
  if ((!Player.enableChord) && (isChord))return;
  if (Player.timeStart + startTime - Player.ctx.currentTime < -0.1){
  // 计时器延误，丢弃。
    return;
  }
  Player.ctx.resume();

  vol = vol * 0.3;
  var gain = Player.ctx.createGain();

  gain.connect(Player.target);

  var osc;
  if (!Player.pianoSample) {
    vol *= 0.2;
    gain.gain.value = 0.001;
    gain.gain.exponentialRampToValueAtTime(vol, Player.timeStart+startTime+0.05);
    gain.gain.exponentialRampToValueAtTime(vol*0.2, Player.timeStart+startTime+len*0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, Player.timeStart+startTime+len);
    osc = Player.ctx.createOscillator();
    //osc.type = "sine";
    osc.setPeriodicWave(Player.wave);
    osc.frequency.value = tune;
  } else {
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(vol*0.4, Player.timeStart+startTime+len*0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, Player.timeStart+startTime+len);
    osc = Player.ctx.createBufferSource();
    osc.buffer = Player.pianoSample;
    osc.playbackRate.value = tune / (440 * Math.pow(2, -9/12));
  }
  osc.connect(gain);
  osc.start(Player.timeStart + startTime);
  osc.stop(Player.timeStart + startTime + len);

  function cancel() {
    try {
      gain.disconnect(Player.target);
    }catch(e) {}
  }
  //setTimeout(cancel,(Player.timeStart + startTime - Player.ctx.currentTime + len) * 1000 + 300);
  return cancel;
};
Player.simplePlay = function player_simplePlay(tune ,octave) {
  if (!Player.ctx)		return;
  if (tune == 0)		return;
  if (!Player.enableSMPlay)	return;
  tune = Player.fMap[tune];
  var f = 440 * Math.pow(2, tune + octave+Music.arpeggio/12);
  Player.start(Player.ctx.currentTime-Player.timeStart, f, 1, 1, false, null);

};
Player.queueHighLight = function fn() {
  var cur = Player.highLight.shift();
  if (document.querySelector(".hl"))
    document.querySelector(".hl").className = document.querySelector(".hl").className.replace(" hl", "");
  if (cur == null) return;
  var dom = UI.dom[Math.max(0, cur.eleId-1)];
  dom.className += " hl";
  function f(d) {
    for (var i = 1; i <= 10; i++) {
      setTimeout(function(d) {
        window.scrollBy(0, d / 10)}, i*100, d);
    }
  }
  document.body.style.scrollBehavior = 'smooth';
  document.body.parentNode.style.scrollBehavior = 'smooth';
  var rect = dom.getBoundingClientRect();
  if (rect.bottom > window.innerHeight - 30) {
    // 太靠底，滚到页面上方
    window.scrollTo(0, document.scrollingElement.scrollTop + rect.top - 40);
  } else if (rect.top < 30) {
    window.scrollTo(0, document.scrollingElement.scrollTop + rect.top - 40);
  }
  document.body.style.scrollBehavior = 'auto';
  document.body.parentNode.style.scrollBehavior = 'auto';

  //console.log(document.querySelectorAll(".yin")[cur.eleId].outerHTML)
  var time = Math.round(Player.ctx.currentTime * 1000);
  while (Player.highLight.length && (Player.highLightStamp+cur.time*1000-time) < -50) {
    cur = Player.highLight.shift();
  }
  setTimeout(fn, Math.max(0, (Player.highLightStamp+cur.time*1000-time)|0));
  //console.log(Player.highLight[0].time)
};


Player.tick = function player_tick(func, time) {
  var cancel = null;
  var rest = [].slice.call(arguments);
  rest.shift();
  rest.shift();

  if (!time) {
    cancel = func.apply(null, rest);
  } else {
    var tid = setTimeout(function() {
      cancel = func.apply(null, rest);
    });
  }

  return function cancelTask() {
    if (cancel) {
      cancel();
    } else {
      clearTimeout(tid);
    }
  };
};

Player.stop = function player_stop() {
  Player.tasking.forEach(function(a) {
    try {
      a()}catch(e) {}});
  Player.highLight = [];
  Player.tasking = [];
  clearInterval(Player.musicTId);
  clearInterval(Player.voiceTId);
};

Player.sing = Player.play = function player_play() {
  Player.timeStart = Player.ctx.currentTime + 0.5;
  Player.stop();
  Player.splitUp();
  var voice = Util.clone(Player.voice);
  var music = Util.clone(Player.music);
  var timeAhead = player_play.timeAhead || 3;
  Player.ctx.resume();

  function taskMusic() {
    var passedTime = Player.ctx.currentTime - Player.timeStart;
    var toTime = passedTime + timeAhead;
    var i = 0;
    var cur;
    while (music.length) {
      cur = music[0];
      if (!cur.f[0] || isNaN(cur.f[0].f)) {
        music.shift();
        return;
      }
      if (cur.start < toTime) {
        //(startTime,tune,len,vol,isChord)
        music.shift();
        Player.tasking.push(Player.tick(Player.start, 0, cur.start, cur.f[0].f, cur.len, cur.vol, cur.isChord, (cur.word && cur.word.trim() != '')));
      } else {
        return;
      }
    }
    if (!voice.length) {
      clearInterval(Player.musicTId);
    }
  }
  function taskVoice() {
    var passedTime = Player.ctx.currentTime - Player.timeStart;
    var toTime = passedTime + timeAhead;
    var i = 0;
    var cur;
    while (voice.length) {
      cur = voice[0];
      if (!cur.f[0] || isNaN(cur.f[0].f)) {
        voice.shift();
        return;
      }
      if (cur.start < toTime) {
        //(sentense,detune,start,len,vol)
        voice.shift();
        Player.tasking.push(Player.tick(Player.manvoice, 0, cur.word, cur.f, cur.start, cur.len, cur.vol,cur));
      } else {
        return;
      }
    }
    if (!voice.length) {
      clearInterval(Player.voiceTId);
    }
  }

  // voice
  Player.musicTId = setInterval(taskMusic, 500);
  taskMusic();
  Player.voiceTId = setInterval(taskVoice, 500);
  taskVoice();
  Player.highLightStamp = Math.round(Player.timeStart * 1000);
  Player.queueHighLight();
};

Player.trace = function player_train(log) {
  //var log = Array.prototype.splice.call(arguments).join(" ");
  if ("UI" in window) {
    UI.statusbar.querySelector("div").innerHTML = log;
  }
  console.log(log);
};

Player.main();

/*
  in: the whole Music.
  out:{
    // Represent a bar
    [
      {
        instument:{
          
        },
        voice:{
          
        },
        chords:{
          
        }
      }
    ]
  }
  May be helpful to more analysis.
*/

Player.flatAndTag = function player_flatAndTag(){
  var bars = Util.clone(Music.flatBar());
  
  /* 平小节 */
  var res = [];
  bars.forEach(function (bar) {
    bar.forEach(function (note) {
      note.note.rawIndex = note.id;
      res.push(note.note);
    });
  });
  return res;
};

Player.splitUp = function player_splitUp_outdated() {
  Music.getLenSectionTempo();
  var sp32b = Music.speedS;
  Player.music = [];
  Player.voice = [];
  Player.highLight = [];
  var curLen = 0;
  var curTime = 0;
  var music = Player.flatAndTag();
  var lenTempo = Music.lenTempo;
  var lenSection = Music.lenSection;
  var time;
  var cItem;
  for (var i = 0; i < music.length; i++) {
    curLen += music[i].length;
    if (i >= 2 && music[i-2].fx.triplets) {
      curLen -= music[i].length;
    }
    if (music[i].fx.triplets || (i >= 1 && music[i-1].fx.triplets) || (i >= 2 && music[i-2].fx.triplets)) {
      time = sp32b * 2 * music[i].length / 3;
    } else {
      time = sp32b * music[i].length;
    }
    if ((i >= 1 && music[i-1].fx.triplets) || (i >= 2 && music[i-2].fx.triplets)) {
      curTime += time;
    } else {
      curTime = (curLen- music[i].length)* sp32b + 0.1;
    }
    // 光标！
    // 光标！
    cItem = Util.clone(Player.highLightItem);
    cItem.time = curTime;
    cItem.eleId = music[i].rawIndex;
    Player.highLight.push(cItem);

    if (music[i].fx.extend) {
      if (i >= 1) {
        if (music[i].pitch +music[i].octave * 13 == music[i-1].pitch +music[i-1].octave * 13) {
          Player.music[Player.music.length-1].len += time;
          Player.voice[Player.voice.length-1].len += time;
          //Player.music[Player.music.length-2].len += time;
        } else {
          var newItem = Util.clone(Player.soundItem);
          newItem.len = time;
          newItem.start = curTime;
          newItem.f[0].f = 440*Math.pow(2, (Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12));
          newItem.word = music[i].word[0];
          if(!newItem.word){
            newItem.word = ' ';
          }
          if(newItem.word && newItem.word.trim() == ''){
            newItem.word = Player.music[Player.music.length-1].word;
          }
          newItem.vol /= 2.5;
          Player.music.push(newItem);
          newItem = Util.clone(newItem);
          //newItem.f[0].f /= 4;
          //Player.music.push(newItem)
        }
        music[i].word = music[i].word.map(function(item) {
          if (item) {
            return item.replace(/\s/g, "");
          } else {
            return "";
          }});
        if (music[i].word[0] == "" || music[i].word[0] == null) {

          if (music[i].pitch +music[i].octave * 13 == music[i-1].pitch +music[i-1].octave * 13) {} else {

            var voicelast = Player.voice[Player.voice.length-1];
            voicelast.len += time;
            voicelast.f.push({
              time: -voicelast.start + curTime,
              f: 440*Math.pow(2, (Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12))
            });
          }
        } else {
          newItem = Util.clone(Player.soundItem);
          newItem.len = time;
          newItem.start = curTime;
          newItem.f[0].f = 440*Math.pow(2, (Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12));
          newItem.word = music[i].word[0];
          Player.voice.push(Util.clone(newItem));
        }
      }


    } else {
      newItem = Util.clone(Player.soundItem);
      newItem.len = time;
      newItem.start = curTime;
      newItem.f[0].f = 440*Math.pow(2, (Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12));
      newItem.word = music[i].word[0];
      newItem.vol /= 2.5;
      Player.music.push(Util.clone(newItem));
      Player.voice.push(Util.clone(newItem));
      newItem = Util.clone(newItem);
      //newItem.f[0].f /= 4;
      //Player.music.push(newItem)

    }
  }

  var chordNotes = Chord.getChord();
  chordNotes.forEach(function (noteary, id) {
    var sttime = lenSection * id;
    var ttlen = lenSection;
    var extend = 1;
    if (id < chordNotes.length-1 && noteary.toString() == chordNotes[id+1].toString()) {
      extend = 4;
    }
    var volBoost = 1.2;
    while (ttlen > 0) {
      noteary.forEach(function (note) {
        var newItem = Util.clone(Player.soundItem);
        newItem.len = (ttlen + extend) * sp32b;
        newItem.start = sttime * sp32b + 0.1;
        newItem.vol = newItem.vol * volBoost /6;
        newItem.f[0].f = 440*Math.pow(2, (Player.fMap[note]-1+Music.arpeggio/12));
        newItem.isChord = true;
        if(id != 0 || String(Music.music[0].pitch) != '0')
          Player.music.push(newItem);
      });
      volBoost = 1;
      sttime += lenTempo;
      ttlen -= lenTempo;
    }

  });
  
  Player.music.sort(function(a, b) {
    return a.start - b.start;
  });
  Player.voice = Util.clone(Player.voice);
  Player.voicePass2();
};

Player.schChord = function(){
  
};

Player.showVoiceWindow = function() {
  PopupWindow.open(voiceWindow);
  b_app.onclick = async function() {
    try {
      b_app.disabled = true;

      if (f_inf.files.length == 0) {
        alert('inf.d?');
        return;
      }
      if (f_voi.files.length == 0) {
        alert('voi.d?');
        return;
      }
      var inf = await new Response(f_inf.files[0]).text();
      var voi = await new Response(f_voi.files[0]).arrayBuffer();
      await Player.storage.setItem('inf.d', inf);
      await Player.storage.setItem('voice.d', voi);
      f_inf.value = '';
      f_voi.value = '';
      await Player.load1();
      PopupWindow.close(voiceWindow);
    }catch(e) {
      console.error(e);
      alert(e);
    }finally {
      b_app.disabled = false;

    }
  };
};

Player.voicePass2 = function(){
  /*  对语音部分的二次处理  */
  /* 0. 统计时长 */
  var times = Player.voice.map(function(data){
    return data.len;
  }).map(function(_,i,a){
    // 中值滤波
    var tmp = [_];
    tmp.push(a[i == 0?1:i-1]);
    tmp.push(a[i == a.length-1?i-1:i+1]);
    return tmp.sort()[1];
  }).sort();
  
  /* 四分位*/
  var q4pos = parseInt(times.length * 3/4);
  for(;q4pos < times.length && times[q4pos]==times[q4pos + 1];q4pos++);
  q4pos = Math.min(times.length-1,q4pos+1);

  Player.voice = Player.voice.filter(function(v){
    if(!v.word){
      return false;
    }
    if(v.word.trim() == ""){
      return false;
    }
    return true;
  }).chainableForEach(function(v,i,ary){
    if(i < ary.length - 1){
      if(v.word.length-1){
        v.isTooLong = true;
      }else if(v.len + v.start + 0.001 < ary[i+1].start){
        v.isTooLong = true;
      }else{
        v.isTooLong = (v.len > times[q4pos]);
      }
    }else{
      v.isTooLong = true;
    }
  }).chainableForEach(function(t,i,a){
    if(i < a.length-1 && a[i+1].isTooLong == true){
      t.isTooLong = false;
    }
  }).chainableForEach(function(t,i,a){
    var m = a[i-1];
    if(i > 0&&!m.isTooLong){
      t.f.unshift({
        /* 上一个音调的中间 */
        time:((m.start + m.len) + (m.start + m.f[m.f.length-1].time))/2 - t.start,
        f:m.f[m.f.length-1].f
      });
    }else{
      /* 音头上拉 */
      t.f.unshift({
        time:-3.3,
        f:t.f[0].f/5*4
      });
    }
  });
};

Player.downloadVoice = async function(){
  var html = `
  <div class="window on destroy" id="voiceDownloadWindow">
		<div class="windowtitle">加载音源文件
		</div>
		<div class="content">
		  正在下载音源数据：<span id="s_progress">N/A / N/A</span>
		  <br>
		  <progress id="p_load" style="width:300px"></progress>
		  <hr>
		  <div style="text-align:right">
		    <button class="close" id="b_cancel" onclick="voiceDownloadWindow.remove();">取消</button>
		  </div>
		</div>
	</div>
  `;
  
  document.body.insertAdjacentHTML('beforeend',html);
  PopupWindow.open(voiceDownloadWindow);
  let inf = await (await fetch('data/inf.d')).text();
  await Player.storage.setItem('inf.d',inf);
  return new Promise(function(ok,fail){
    var xhr = new XMLHttpRequest();
    xhr.onerror = xhr.onabort = function(event){
      voiceDownloadWindow.remove();
      Player.showVoiceWindow();
      fail(new Error('Fetch failed: '+event.type));
    };
    b_cancel.onclick = function(){
      xhr.abort();
    };
    xhr.onprogress = function(event){
      if(event.lengthComputable){
        p_load.value = event.loaded;
        p_load.max = event.total;
        s_progress.innerText = `${(p_load.value/1048576).toFixed(3)}MB / ${(p_load.max/1048576).toFixed(3)}MB`;
      }else{
        s_progress.innerText = `${(event.loaded/1048576).toFixed(3)}MB / 未知(约20MB)`;
      }
    };
    xhr.onload = function(){
      if(xhr.status > 300){
        Player.trace('加载失败');
      }
      voiceDownloadWindow.remove();
      Player.storage.setItem('voice.d',xhr.response)
      .then(function(){
        Player.load1();
      }).catch(fail);
    };
    xhr.responseType = "arraybuffer";
    xhr.open('GET','data/voice.d',true);
    xhr.send();
  });
};

