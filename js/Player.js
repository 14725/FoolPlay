// jshint maxerr:9999

/* Array.flat/flatmap的填补*/
(function() {
	Array.prototype.flat || Object.defineProperty(Array.prototype, "flat", {
		configurable: !0,
		value: function r() {
			var t = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
			return t ? Array.prototype.reduce.call(this, function(a, e) {
				return Array.isArray(e) ? a.push.apply(a, r.call(e, t - 1)) : a.push(e),
				a;
			}, []) : Array.prototype.slice.call(this);
		},
		writable: !0
	}),
	Array.prototype.flatMap || Object.defineProperty(Array.prototype, "flatMap", {
		configurable: !0,
		value: function(r) {
			return Array.prototype.map.apply(this, arguments).flat();
		},
		writable: !0
	});
}
)();
/* Chainable Array ForEach */
Object.defineProperty(Array.prototype, 'chainableForEach', {
	value: function(...rest) {
		this.forEach.apply(this, rest);
		return this;
	}
});
/* Smooth scroll */
(function() {
	try {
		window.scrollTo({
			left: self.pageXOffset
		});
		return;
	} catch (e) {}
	var rawScrollTo = window.scrollTo.bind(window);
	var timer = 0;
	var tLeft, tTop;
	function t() {
		var lastY = self.pageYOffset;
		rawScrollTo(self.pageXOffset * 0.9 + tLeft * 0.1, lastY * 0.9 + tTop * 0.1);
		if (Math.abs(lastY - self.pageYOffset) < 2) {
			rawScrollTo(tLeft, tTop);
			timer = 0;
		} else {
			timer = requestAnimationFrame(t);
		}
	}
	window.scrollTo = function scrollTo_Hacked(a, b) {
		if (b !== undefined) {
			scrollTo_Hacked({
				left: a,
				top: b
			})
		} else {
			a.left || (a.left = self.pageXOffset);
			a.top || (a.top = self.pageYOffset);
			if (a.behavior == 'smooth') {
				tLeft = a.left;
				tTop = a.top;
				if (!timer) {
					timer = requestAnimationFrame(t);
				}
			} else {
				cancelAnimationFrame(timer);
				rawScrollTo(a.left, a.top);
			}
		}
	}
	;
}
)();

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
	isMan: false,
	data: null,
	meta: null,

	enableSMPlay: true,
	enableVoice: true,
	enableChord: true,
	enableMusic: true,

	everStopped: false,

	tasking: [],

	storage: yuxStorage
};
Player.meta = {};
Player.anoMeta = {};
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
	data: null /* TODO:是什么呢 */
};
Player.manvoice = function player_manvoice(sentense, detune, start, len, vol, raw) {
	//前置条件检测
	if (1) {
		if (!Player.enableVoice)
			return;
		if (!sentense)
			return;
		if (!Player.meta && Object.keys(Player.anoMeta).length == 0) {
			Player.trace('音源尚未加载。');
			return;
		}
		if (Player.timeStart + start - Player.ctx.currentTime < -1) {
			// 计时器延误，丢弃。
			return;
		}

		pinyin = (sentense.replace(/[^a-z]/ig, '').toLowerCase()in Player.anoMeta) ? sentense.replace(/[^a-z]/ig, '').toLowerCase() : sentense.split("").map(function(a) {
			return Pinyin.convertToPinyin(a, '', true)
		})[0];
		if (!pinyin)
			return;
		pinyin = pinyin.replace(/[^a-z]/ig, '').toLowerCase();
		if (!(pinyin in Player.meta) && !(pinyin in Player.anoMeta)) {
			Player.trace('未知拼音：' + sentense + ': ' + pinyin);
			return;
		}
	}
	var shouldC = false;
	var l = len * 44100;
	var advance = 0.01;
	var bestVoice = null;
	var bestFreq = +9999;
	var avgFreq = 0;
	var freqList = [];
	//频率滑动表
	var fTime = function(x) {
		return x
	};

	/* 平均频率 */
	detune.forEach(function(f, i, a) {
		if (f.time < 0)
			return;
		var nextT = a[i + 1] ? a[i + 1].time : len;
		avgFreq += f.f * (nextT - f.time);
	});
	avgFreq /= len;
	if (Player.anoMeta[pinyin]) {
		bestVoice = Player.anoMeta[pinyin];
	} else {
		Player.meta[pinyin].forEach(function(a) {
			if (Math.abs(a.freq - avgFreq) < bestFreq) {
				bestVoice = a;
				bestFreq = Math.abs(a.freq - avgFreq);
			}
		});
	}
	//延长处理
	if (!raw.isTooLong || sentense == '啦') {
		shouldC = true;
	}
	//advance = l/44100 * (bestVoice.consonant / bestVoice.length * 2);

	advance = bestVoice.consonant / 44100;
	var late = (bestVoice.length / 2 - bestVoice.vowel) / 44100;

	l += advance * 44100;
	if (shouldC)
		l += late * 44100;
	else
		l -= Math.min(late * 44100, (len - detune[detune.length - 1].time) / 2)

	// 计算时间变形
	var fTime = Player.getF(/*console.log*/
	([[0, 0], [advance * 44100, l * (bestVoice.consonant / bestVoice.length * 2)], [l - late * 44100, l * ((bestVoice.vowel) / bestVoice.length * 2)], [l, l]]));
	// 计算频率函数
	//maxGap = 0.001;
	freqList = detune.map(function(d, id, ary) {
		var gap;
		if (id == 0) {
			return [[(d.time + advance) * 44100, Math.log(d.f)]];
		}
		gap = Math.min(ary[id].time - ary[id - 1].time, (ary[id + 1] == null ? 999 : ary[id + 1].time) - ary[id].time) / 2.3;
		gap = Math.min(gap,0.3);
		if (gap < 0.05)
			gap *= 2;
		return [[(d.time + advance - gap) * 44100, Math.log(detune[id - 1].f)], [(d.time + advance + gap) * 44100, Math.log(d.f)]];
	}).flat();
	if (Player.isMan) {

		freqList.forEach(function(a) {
			a[1] -= Math.log(2);
		});
	}
	var ffreq = Player.getF(freqList);

	var buf1 = Player.transform(bestVoice, l, fTime, function(x) {
		return Math.exp(ffreq(x))
	});
	var ctx = Player.ctx;
	var n = ctx.createBufferSource();
	var g = ctx.createGain();
	var st = start;
	g.gain.value = vol;
	g.gain.linearRampToValueAtTime(0.0001, Player.timeStart + 0);
	g.gain.linearRampToValueAtTime(0.1, Player.timeStart + start - advance);
	g.gain.linearRampToValueAtTime(vol, Player.timeStart + start);
	g.gain.linearRampToValueAtTime(vol, Player.timeStart + start - advance + (l - bestVoice.consonant) / 44100 - 0.1);
	g.gain.linearRampToValueAtTime(0.0001, Player.timeStart + start - advance + l / 44100);

	n.buffer = Player.convertBuffer(buf1);
	n.connect(g);
	g.connect(Player.target);
	//n.connect(Player.target)
	n.start(Player.timeStart + Math.max(0, start - advance));
	return (function() {
		g.disconnect(Player.target);
	}
	);
}
;
/* 海宁窗 {n} = [0, 1] */
Player.hann = function hann(n) {
	return (1 + Math.cos(2 * Math.PI * (n - 0.5))) / 2;
}
;
/* 初始化数据 */
Player.load1 = async function() {
	try {
		Player.trace('加载音源：加载数据。');

		Player.buffer = null;

		Player.buffer = await Player.storage.getItem('voice.d');
		if (!Player.buffer) {
			Player.trace('加载音源：从网络下载音源...');
			await Player.downloadVoice();
			Player.buffer = await Player.storage.getItem('voice.d');
			return;
		}
		await Player.load2();
	} catch (e) {
		console.error(e);
		Player.trace(String(e));
	}
}
;
Player.load2 = function() {
	Player.trace('加载音源：加载记录表。');
	var meta = {};
	return (async function() {

		var text = await Player.storage.getItem('inf.d');
		var table = text.split('\n');
		Player.isMan = (table[0].slice(0, 3) == 'man');
		/* 去除版本号和一些信息 */
		table.shift();
		table.shift();
		/* 还原袅袅音源记录表 */
		table = table.map((line)=>(atob(line).trim().split(/\s+/g)));
		/* 转换为对象 */
		table.forEach((a)=>(a[0] = a[0].split('_')[0].replace(/\d/ig, '')));
		table.forEach(function(line) {

			var item = Object.assign({}, itemT);
			Object.seal(item);

			Object.keys(item).forEach(function(key, i) {
				item[key] = parseFloat(line[i + 1]);
			});
			item.data = new Int16Array(Player.buffer,item.fileStart,item.length / 2);
			if (item.data.length > 44100 / item.freq) {
				if (!(line[0]in meta)) {
					meta[line[0]] = [];
				}
				meta[line[0]].push(item);
			}
		});
		Player.meta = meta;
		Player.trace('加载音源：完成。');

	}
	)().catch((e)=>{
		console.error(e);
		throw e;
	}
	);
}
;
Player.convertBuffer = function player_convertBuffer(buffer) {
	var ctx = Player.ctx;
	ctx.resume();
	var temp = new Float32Array(buffer.length);
	var audioBuffer = ctx.createBuffer(1, buffer.length, 44100);
	var i;
	var l;
	for (i = 0,
	l = buffer.length; i < l; ++i) {
		temp[i] = buffer[i] / 32768;
	}
	audioBuffer.copyToChannel(temp, 0);
	return audioBuffer;
}

/* 线性插值，用点列表生成连续函数 */
Player.getF = function getF(points) {
	points = Util.clone(points);
	return function(x) {
		if (x < points[0][0]) {
			return points[0][1];
		}
		if (x >= points[points.length - 1][0]) {
			return points[points.length - 1][1];
		}
		var d;
		for (d = 0; points[d][0] <= x; d++)
			;
		var x1 = points[d - 1][0]
		  , y1 = points[d - 1][1]
		  , k = (points[d][1] - points[d - 1][1])
		  , p = (x - x1) / (points[d][0] - points[d - 1][0]);
		return y1 + k * p;
	}
	;
}
;

/* 取样，并且“加窗” */
Player.sample = function player_sample(data, total, now) {
	var t = 44100 / data.freq;
	if (t > data.data.length) {
		throw new Error("频率过低：声音周期不能比声音片段更长。");
	}
	//test
	var pos = now * (data.data.length - t) / total;
	var pos1, pos2, k;
	pos1 = Math.floor(pos / t) * t;
	pos2 = Math.ceil(pos / t) * t;
	if (Math.abs(pos1 - pos2) < 1) {
		k = 1;
	} else {
		k = (pos - pos1) / (pos2 - pos1);
	}
	t = Math.round(t);
	pos1 = Math.max(0, Math.min(Math.round(pos1), data.data.length - t));
	pos2 = Math.max(0, Math.min(Math.round(pos2), data.data.length - t));
	var example = new Int16Array(t);

	/* 数据拷贝 -- F**k */
	for (i = 0; i < t; i++) {
		example[i] = (k * data.data[pos2 + i] + (1 - k) * data.data[pos1 + i]) * Player.hann(i / t);
	}
	return example;
}
;

Player.transform = function player_transform(data, length, fPos, fFreq) {
	var wave = new Int16Array(length);
	//alert(sample(data,99999,40000));//return [];
	/* 原始周期 */
	var t0 = data.freq;
	/* 一个周期的波形 */
	var sam = null;
	/* 实时周期 */
	var t = 0;
	var pos = 0;
	var start, end, i;
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
}
;

Player.soundItem = {
	vol: 1,
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
Player.loadPyTable = function player_loadPyTable() {}
;
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
			console.warn("钢琴采样加载失败，将使用合成音效。" + e.err)
		}
		;
	}
	;
	request.send();
}
;
Player.main = function player_main() {
	if (!("AudioContext"in window)) {
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
		real[i] = 0.2 * Math.pow((15 - i) * 0.1, 4);
		imag[i] = 0;
	}
	Player.wave = ac.createPeriodicWave(real, imag, {
		disableNormalization: true
	});
	Player.load1();
	Player.loadSample();
}
;
Player.fMap = {};
(function fillfMap() {
	var fMap = Player.fMap;
	var p = 1 / 12;
	fMap[6] = 0;
	fMap[7] = 2 * p;
	fMap[1] = -9 * p;
	fMap[2] = -7 * p;
	fMap[3] = -5 * p;
	fMap[4] = -4 * p;
	fMap[5] = -2 * p;
}
)();
Player.start = function player_start(startTime, tune, len, vol, isChord, word) {
	if (!Player.ctx)
		return;
	if ((!Player.enableMusic) && (!isChord))
		return;
	if ((Player.enableVoice && word) && (!isChord) && Player.buffer && Player.buffer.byteLength > 2048)
		return;
	if ((!Player.enableChord) && (isChord))
		return;
	if (Player.timeStart + startTime - Player.ctx.currentTime < -0.1) {
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
		gain.gain.exponentialRampToValueAtTime(vol, Player.timeStart + startTime + 0.02);
		gain.gain.exponentialRampToValueAtTime(vol * 0.2, Player.timeStart + startTime + len * 0.8);
		gain.gain.linearRampToValueAtTime(0.001, Player.timeStart + startTime + len);
		osc = Player.ctx.createOscillator();
		//osc.type = "sine";
		osc.setPeriodicWave(Player.wave);
		osc.frequency.value = tune;
	} else {
		gain.gain.value = vol;
		gain.gain.exponentialRampToValueAtTime(vol * 0.4, Player.timeStart + startTime + len * 0.9);
		gain.gain.exponentialRampToValueAtTime(0.001, Player.timeStart + startTime + len);
		osc = Player.ctx.createBufferSource();
		osc.buffer = Player.pianoSample;
		osc.playbackRate.value = tune / (440 * Math.pow(2, -9 / 12));
	}
	osc.connect(gain);
	osc.start(Player.timeStart + startTime);
	osc.stop(Player.timeStart + startTime + len);

	function cancel() {
		try {
			gain.disconnect(Player.target);
		} catch (e) {}
	}
	//setTimeout(cancel,(Player.timeStart + startTime - Player.ctx.currentTime + len) * 1000 + 300);
	return cancel;
}
;
Player.simplePlay = function player_simplePlay(tune, octave) {
	if (!Player.ctx)
		return;
	if (tune == 0)
		return;
	if (!Player.enableSMPlay)
		return;
	tune = Player.fMap[tune];
	var f = 440 * Math.pow(2, tune + octave + Music.arpeggio / 12);
	Player.start(Player.ctx.currentTime - Player.timeStart, f, 1, 1, false, null);

}
;
Player.queueHighLight = function fn() {
	var cur = Player.highLight.shift();
	if (document.querySelector(".hl"))
		document.querySelector(".hl").className = document.querySelector(".hl").className.replace(" hl", "");
	if (cur == null)
		return;
	var dom = UI.dom[Math.max(0, cur.eleId - 1)];
	dom.className += " hl";

	var rect = dom.getBoundingClientRect();
	if (rect.bottom > window.innerHeight - 30 || rect.top < 40) {
		window.scrollTo({
			top: window.pageYOffset + rect.top - 40,
			behavior: 'smooth'
		});
	}

	var time = Math.round(Player.ctx.currentTime * 1000);
	while (Player.highLight.length && (Player.highLightStamp + cur.time * 1000 - time) < -50) {
		cur = Player.highLight.shift();
	}
	Player.highLightTid = setTimeout(fn, Math.max(0, (Player.highLightStamp + cur.time * 1000 - time) | 0));
}
;

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
	}
	;
}
;

Player.stop = function player_stop() {
	Player.everStopped = true;
	Player.tasking.forEach(function(a) {
		try {
			a()
		} catch (e) {}
	});
	Player.highLight = [];
	Player.tasking = [];
	clearInterval(Player.musicTId);
	clearInterval(Player.voiceTId);
	clearTimeout(Player.highLightTid);
	var hl = document.querySelector(".hl")
	if (hl)
		hl.className = hl.className.replace('hl', '').replace(/\s\s+/, ' ');

}
;

Player.play = async function player_play(ignoreEnglish) {
	Player.timeStart = Player.ctx.currentTime + 0.5;
	Player.stop();
	Player.splitUp();
	Player.everStopped = false;
	var stop = false;
	Player.ctx.resume();
	if (!ignoreEnglish && Transplant && Transplant.ok) {
		var tip = PopupWindow.alert('正在合成英语中...<br>从状态栏看合成进度<br>或者关闭这个对话框强制播放。');
		tip.onclick = function(event) {
			if (event.target.nodeName == 'BUTTON') {
				Player.play(true);
				stop = true;
			}
		}
		await Transplant.addAllVoice();
		tip.remove();
		if (!stop && !Player.everStopped)
			Player.play(true);
		return;
	} else {}
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
				Player.tasking.push(Player.tick(Player.manvoice, 0, cur.word, cur.f, cur.start, cur.len, cur.vol, cur));
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
}
;

Player.trace = function player_train(log) {
	//var log = Array.prototype.splice.call(arguments).join(" ");
	if ("UI"in window) {
		UI.statusbar.querySelector("div").innerHTML = log;
	}
	console.log(log);
}
;

Player.main();

Player.flatAndTag = function player_flatAndTag() {
	var bars = Util.clone(Music.flatBar());

	/* 猜测强音 */
	bars.forEach(function(bar, h) {
		var last;
		if (h > 0) {
			last = bars[h - 1];
			last = last[last.length - 1].note;
		}
		bar.forEach(function(note, i) {
			note = note.note;
			if (note.fx.triplets) {
				bar[i + 2].note.length = note.length = bar[i + 1].note.length = note.length * 2 / 3;
				note.fx.triplets = false;
			}
		});
		var start = 0;
		bar.forEach(function(note, i) {
			note = note.note;
			note.level = 1;
			if (start % Music.lenTempo == 0) {
				note.level = 2;
			}
			/* 正规节奏 */
			if (Music.tempo[1] % 6 == 0) {
				/* 三复拍子的次强拍 */
				if (start % (Music.lenSection * 3 / Music.tempo[1]) == 0) {
					note.level = 3;
				}
			} else if (Music.tempo[1] % 4 == 0) {
				/* 二复拍子的次强拍 */
				if (start % (Music.lenSection * 2 / Music.tempo[1]) == 0) {
					note.level = 3;
				}
			}
			if (start == 0) {
				/* 首拍应该是强拍 */
				note.level = 4;
			}

			/* 非正规节奏 */
			/* 我不太看得懂强弱规则，默认不能整除自己的拍子为非正规 */
			if ((note.length % 1 == 0) && (start % note.length != 0)) {
				note.level = 4;
			}
			start += note.length;
			/* 三连音走浮点运算，会有精度问题， */
			if (Math.abs(start - Math.round(start)) < 0.001) {
				start = Math.round(start);
			}
		});
	});

	/* 平小节 */
	var res = [];
	bars.forEach(function(bar) {
		bar.forEach(function(note) {
			note.note.rawIndex = note.id;
			res.push(note.note);
		});
	});
	return res;
}
;
Player.level2vol = function player_level2vol(level) {
	return level / 8 + 0.25;
}
Player.splitUp = function player_splitUp() {
	/* 清空数据 */
	Player.music = [];
	Player.voice = [];
	Player.highLight = [];

	/* 计算音乐信息 */
	Music.getLenSectionTempo();
	var sp32b = Music.speedS;
	var curLen = 0;
	var curTime = 0;
	var music = Player.flatAndTag();
	var lenTempo = Music.lenTempo;
	var lenSection = Music.lenSection;

	function jian2p(i) {
		if (i == 0)
			return NaN;
		return [0, 2, 4, 5, 7, 9, 11][i - 1];
	}
	var time;
	var cItem;
	var f;
	var last;

	/* 光标！ */
	for (var i = 0; i < music.length; i++) {
		curLen += music[i].length;
		time = sp32b * music[i].length;
		curTime = (curLen - music[i].length) * sp32b + 0.1;
		// 光标！
		// 光标！
		cItem = Util.clone(Player.highLightItem);
		cItem.time = curTime;
		cItem.eleId = music[i].rawIndex;
		Player.highLight.push(cItem);
	}

	curLen = curTime = 0;
	/* 乐器旋律 */
	for (i = 0; i < music.length; i++) {
		curLen += music[i].length;
		time = sp32b * music[i].length;
		curTime = (curLen - music[i].length) * sp32b + 0.1;
		/* {vol,len:秒,start:秒,
      f: [{time,f: 440,}],fx: [],
      word: "",isChord: false
     }*/
		music[i].word && (music[i].word = music[i].word[0]);
		f = jian2p(music[i].pitch) + 12 * music[i].octave + (+Music.arpeggio) - jian2p(6);
		if (isNaN(f))
			continue;
		f = 440 * Math.pow(2, f / 12);
		cItem = Util.templateClone({
			vol: Player.level2vol(music[i].level),
			len: music[i].length * sp32b,
			start: curTime,
			f: [{
				time: 0,
				f: f
			}],
			word: music[i].word || '',
			isChord: false,
		}, Player.soundItem);
		if (music[i].fx.extend) {
			/* 如果延长？ */
			last = Player.music[Player.music.length - 1];
			/* 1. 是延长线 */
			if (Math.abs(cItem.f[0].f - last.f[0].f) < 0.0001) {
				last.len += cItem.len;
				last.vol = Math.max(last.vol, cItem.vol);
			}/* 2. 是圆滑线 */
			else {
				last.vol = Math.max(last.vol, cItem.vol);
				last.len += cItem.len / 10;
				if (!cItem.word.trim()) {
					cItem.word = last.word;
				}
				Player.music.push(cItem);
			}
		} else {
			Player.music.push(cItem);
		}
	}

	curLen = curTime = 0;
	/* 人声 */
	for (i = 0; i < music.length; i++) {
		curLen += music[i].length;
		time = sp32b * music[i].length;
		curTime = (curLen - music[i].length) * sp32b + 0.1;
		/* {vol,len:秒,start:秒,
      f: [{time,f: 440,}],fx: [],
      word: "",isChord: false
     }*/
		Array.isArray(music[i].word) && (music[i].word = music[i].word[0]);
		f = jian2p(music[i].pitch) + 12 * music[i].octave + (+Music.arpeggio) - jian2p(6);
		if (isNaN(f))
			continue;
		f = 440 * Math.pow(2, f / 12);
		cItem = Util.templateClone({
			vol: Player.level2vol(music[i].level),
			len: music[i].length * sp32b,
			start: curTime,
			f: [{
				time: 0,
				f: f
			}],
			word: (music[i].word || '').trim(),
			isChord: false,
		}, Player.soundItem);
		if (music[i].fx.extend && !cItem.word) {
			/* 如果延长？ 如果有歌词就不算延长*/
			last = Player.voice[Player.voice.length - 1];
			/* 1. 是延长线 */
			if (Math.abs(cItem.f[0].f - last.f[last.f.length - 1].f) < 0.0000001) {
				last.len += cItem.len;
				last.vol = Math.max(last.vol, cItem.vol);
			}/* 2. 是圆滑线 */
			else {
				last.len += cItem.len;
				last.vol = Math.max(last.vol, cItem.vol);
				last.f.push({
					time: cItem.start - last.start,
					f: cItem.f[0].f
				});
			}
		} else {
			Player.voice.push(cItem);
		}
	}

	var chordNotes = Chord.getChord().flat();
	console.log('chordNotes', chordNotes)
	var sttime = 0;
	chordNotes.forEach(function(noteary, id) {
		var ttlen = noteary.len;
		;console.log(noteary)
		noteary = noteary.chordnotes
		var extend = 1;
		/*if (id < chordNotes.length-1 && noteary.toString() == chordNotes[id+1].toString()) {
      extend = 4;
    }*/
		var volBoost = 1.2;
		while (ttlen > 0) {
			noteary.forEach(function(note) {
				var newItem = Util.clone(Player.soundItem);
				newItem.len = (ttlen + extend) * sp32b;
				newItem.start = sttime * sp32b + 0.1;
				newItem.vol = Player.level2vol(volBoost > 0 ? 4 : 1) / 5;
				newItem.f[0].f = 440 * Math.pow(2, (Player.fMap[note] - 1 + Music.arpeggio / 12));
				newItem.isChord = true;
				if (id != 0 || String(Music.music[0].pitch) != '0')
					Player.music.push(newItem);
			});
			volBoost = 1;
			sttime += lenTempo;
			ttlen -= lenTempo;
		}
		sttime += ttlen;
	});

	Player.music.sort(function(a, b) {
		return a.start - b.start;
	});
	Player.voice = Util.clone(Player.voice);
	Player.voicePass2();
}
;

Player.showVoiceWindow = function() {
	PopupWindow.open(voiceWindow);
	Array.from(voiceWindow.querySelectorAll('.append-yes')).forEach(function(a) {
		a.classList.remove('append-yes');
	})
	c_man.checked = false;
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
			if (c_man.checked) {
				inf = 'man' + inf;
			}
			await Player.storage.setItem('inf.d', inf);
			await Player.storage.setItem('voice.d', voi);
			f_inf.value = '';
			f_voi.value = '';
			await Player.load1();
			PopupWindow.close(voiceWindow);
		} catch (e) {
			console.error(e);
			alert(e);
		} finally {
			b_app.disabled = false;

		}
	}
	;
}
;

Player.voicePass2 = function() {
	/*  对语音部分的二次处理  */
	/* 0. 统计时长 */
	var times = Player.voice.map(function(data) {
		return data.len;
	}).map(function(_, i, a) {
		// 中值滤波
		var tmp = [_];
		tmp.push(a[i == 0 ? 1 : i - 1]);
		tmp.push(a[i == a.length - 1 ? i - 1 : i + 1]);
		return tmp.sort()[1];
	}).sort();

	/* 四分位*/
	var q4pos = parseInt(times.length * 3 / 4);
	for (; q4pos < times.length && times[q4pos] == times[q4pos + 1]; q4pos++)
		;
	q4pos = Math.min(times.length - 1, q4pos + 1);

	Player.voice = Player.voice.filter(function(v) {
		if (!v.word) {
			return false;
		}
		if (v.word.trim() == "") {
			return false;
		}
		return true;
	}).chainableForEach(function(v, i, ary) {
		if (i < ary.length - 1) {
			if (v.word.length - 1) {
				v.isTooLong = true;
			} else if (v.len + v.start + 0.001 < ary[i + 1].start) {
				v.isTooLong = true;
			} else {
				v.isTooLong = (v.len > times[q4pos]);
			}
		} else {
			v.isTooLong = true;
		}
	}).chainableForEach(function(t, i, a) {
		if (i < a.length - 1 && a[i + 1].isTooLong == true) {
			t.isTooLong = false;
		}
	}).chainableForEach(function(t, i, a) {
		var m = a[i - 1];
		var n = a[i + 1];
		if (i > 0 && !m.isTooLong) {
			t.f[0].time = 0.2;
			if (t.f[1] && t.f[1].time > t.f[0].time) {
				t.f[0].time = t.f[1].time / 1.2;
			}
			t.f.unshift({
				/* 上一个音调的中间 */
				//time:((m.start + m.len) + (m.start + m.f[m.f.length-1].time))/2 - t.start,
				time: -0.4,
				f: m.f[m.f.length - 1].f
			});
		} else {
			/* 音头上拉 */
			t.f.unshift({
				time: -8.3,
				f: t.f[0].f / 5 * 4
			});
		}
		if (!t.isTooLong && n) {
			/*t.f.push({
				time: Math.max(t.len - 0.2, t.f[t.f.length - 1].time + 0.05),
				f: t.f[t.f.length - 1].f
			});*/
			t.f.push({
				time: n.start - t.start,
				f: n.f[0].f
			});
		}
	});
}
;

Player.downloadVoice = async function() {
	var pro = PopupWindow.progress();
	pro.text('正在加载音源...');
	let inf = await (await fetch('data/inf.d')).text();
	await Player.storage.setItem('inf.d', inf);
	return new Promise(function(ok, fail) {
		var xhr = new XMLHttpRequest();
		xhr.onerror = xhr.onabort = function(event) {
			pro.close();
			Player.showVoiceWindow();
			fail(new Error('Fetch failed: ' + event.type));
		}
		;
		pro.oncancel(function() {
			xhr.abort();
		});
		xhr.onprogress = function(event) {
			if (event.lengthComputable) {
				pro.max(event.total).progress(event.loaded).progressText(`${(event.total / 1048576).toFixed(3)}MB / ${(event.loaded / 1048576).toFixed(3)}MB`);
			} else {
				pro.progressText(`${(event.loaded / 1048576).toFixed(3)}MB / 未知(约20MB)`);
			}
		}
		;
		xhr.onload = function() {
			if (xhr.status > 300) {
				Player.trace('加载失败');
			}
			pro.close();
			Player.storage.setItem('voice.d', xhr.response).then(function() {
				Player.load1();
			}).catch(fail);
		}
		;
		xhr.responseType = "arraybuffer";
		xhr.open('GET', 'data/voice.png', true);
		xhr.send();
	}
	);
}
;

/* Hacking file - render offline*/

Player.saveWav = async function player_play() {
	Player.stop();
	var pro = PopupWindow.progress();
	pro.text('正在合成人声');
	Player.splitUp();
	Player._oldctx = Player.ctx;
	Player._oldtar = Player.target;
	var ctx = Player.ctx = new OfflineAudioContext(1,44100 * (Player.music[Player.music.length - 1].start + 5),44100);
	Player.target = Player.ctx.destination;
	Player.ctx.resume = function() {}
	Player.timeStart = Player.ctx.currentTime + 0.5;
	Player.stop();
	var voice = Util.clone(Player.voice);
	var music = Util.clone(Player.music);
	var timeAhead = player_play.timeAhead || 3;
	var cancelFns = [];
	var stopped = false;
	pro.oncancel(cancelAll);
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
			//(startTime,tune,len,vol,isChord)
			music.shift();
			cancelFns.push(Player.start(cur.start, cur.f[0].f, cur.len, cur.vol, cur.isChord, (cur.word && cur.word.trim() != '')));
		}
	}
	async function taskVoice() {
		var passedTime = Player.ctx.currentTime - Player.timeStart;
		var toTime = passedTime + timeAhead;
		var i = 0;
		var cur;
		while (voice.length) {
			pro.text('合成人声中：剩余：').progressText(voice.length + '项。');
			(Math.random() > 0.8) && await Util.tick();
			cur = voice[0];
			if (!cur.f[0] || isNaN(cur.f[0].f)) {
				voice.shift();
				return;
			}
			//(sentense,detune,start,len,vol)
			voice.shift();
			if (stopped)
				return;
			cancelFns.push(Player.manvoice(cur.word, cur.f, cur.start, cur.len, cur.vol, cur));
		}
	}
	function cancelAll() {
		/* 技术上，在OfflineAudioContext开始后就无法停止了。 尽可能减少计算让它快点跑完 */
		pro.text('正在取消...');
		Player.target = ctx.destination;
		cancelFns.forEach(function(a) {
			try {
				a()
			} catch (e) {
				console.error(e)
			}
		});
		Player.target = Player._oldtar;
		stopped = true;
		pro.noCancel();
		if (!rpro) {
			pro.close();
		}
	}

	// voice
	taskMusic();
	await taskVoice();
	if (stopped)
		return;
	window.data = null;
	(async function(ctx, pro) {
		pro.text('正在连接：').max(ctx.length / 44100);
		while (!window.data) {
			await Util.tick(100);
			pro.progress(ctx.currentTime).progressText((ctx.currentTime / ctx.length * 44100 * 100).toFixed(2) + '%');
		}
		pro.close();
		cancelFns = [];
	}
	)(Player.ctx, pro);
	var rpro = Player.ctx.startRendering();
	Player.ctx = Player._oldctx;
	Player.target = Player._oldtar;
	var data = await rpro;
	pro.close();
	window.data = true;
	if (stopped)
		return;
	Util.saveAs(Player.bufferToWave(data), 'audio/wav', Music.title + '.wav');

}
;
Player.bufferToWave = function bufferToWave(abuffer, len) {
	var numOfChan = abuffer.numberOfChannels, length = abuffer.length * numOfChan * 2 + 44, buffer = new ArrayBuffer(length), view = new DataView(buffer), channels = [], i, sample, offset = 0, pos = 0;

	// write WAVE header
	// "RIFF"
	setUint32(0x46464952);
	// file length - 8
	setUint32(length - 8);
	// "WAVE"
	setUint32(0x45564157);
	// "fmt " chunk
	setUint32(0x20746d66);
	// length = 16
	setUint32(16);
	// PCM (uncompressed)
	setUint16(1);
	setUint16(numOfChan);
	setUint32(abuffer.sampleRate);
	// avg. bytes/sec
	setUint32(abuffer.sampleRate * 2 * numOfChan);
	// block-align
	setUint16(numOfChan * 2);
	// 16-bit (hardcoded in this demo)
	setUint16(16);
	// "data" - chunk
	setUint32(0x61746164);
	// chunk length
	setUint32(length - pos - 4);

	// write interleaved data
	for (i = 0; i < abuffer.numberOfChannels; i++)
		channels.push(abuffer.getChannelData(i));

	while (pos < length) {
		// interleave channels
		for (i = 0; i < numOfChan; i++) {
			// clamp
			sample = Math.max(-1, Math.min(1, channels[i][offset]));
			// scale to 16-bit signed int
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
			// write 16-bit sample
			view.setInt16(pos, sample, true);
			pos += 2;
		}
		// next source sample
		offset++;
	}

	// create Blob
	return new Blob([buffer],{
		type: "audio/wav"
	});

	function setUint16(data) {
		view.setUint16(pos, data, true);
		pos += 2;
	}

	function setUint32(data) {
		view.setUint32(pos, data, true);
		pos += 4;
	}
};