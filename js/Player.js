var PinYin = {
	pyrep:{xu:"xv",yu:"yv",yun:"vn",y:"i",w:"u",ui:"uei",iu:"ou",ue:"ve",un:"uen",ie:"iie",zi:"zsi",ci:"csi",si:"ssi"},
	pys: ["a","ai","an","ang","b","c","ch","d","e","ei","en","eng","er","f","g","h","i","ie","in","ing","j","k","l","m","n","o","ong","ou","p","q","ri","s","sh","t","u","ue","v","x","z","zh","si","r"     ,"ao" ,"vn","ve"].sort(function(a,b){return b.length - a.length}),
	shengmu:["b","p","m","f","d","t","l","n","g","k","h","j","q","x","zh","ch","sh","z","c","s"],
	fakeShengMu:[""],
};
PinYin.matchRegExp = /(zh|ch|sh|r|z|c|s|b|p|m|f|d|t|n|l|g|k|h|j|q|x)?(i|u|v)?(i|u|v|ong|eng|ang|en|an|ou|ao|ei|ai|e|o|a)/
PinYin.fixRegExp = /^([jqx])u/
PinYin.getPinYin = function pinyin_getPinYin(oneword){
	var pos = PinYinData.word.indexOf(oneword);
	if(pos === -1){
		return [];
	}
	return PinYin.splitUp(PinYinData.pinyin[pos]);
}
PinYin.voice = function pinyin_voice(sentense,detune,start,len,vol){
	if(!Player.enableVoice)return;
	sentense = sentense.split("").map(function(a){return PinYin.getPinYin(a)});
	
	 
	var d1 = 0.1;
	var curPY = [];
	var n = null,n2=null,n0 = null;
	var ctx = Player.ctx;
	var advance = 0;
	start = Player.timeStart  +start;
	
	
	var detuner = ctx.createOscillator();
	detuner.frequency.value = 5;
	detuner.start(start);
	detuner.stop(start + len);
	var gain_detuner = ctx.createGain();
	gain_detuner.gain.value = 0;
	//console.log(len * 0.8,0.3,len-0.001)
	gain_detuner.gain.linearRampToValueAtTime(0,Math.min(Math.max(start + len * 0.2,0.8),start + len-0.001));
	gain_detuner.gain.linearRampToValueAtTime(30,start + len );
	detuner.connect(gain_detuner);
	

	//return;
	
	for(var i = 0;i<sentense.length;i++){
		curPY = sentense[i];
		n0 = ctx.createGain();
		n0.gain.value = 0.001
		for(var j=0;j<curPY.length;j++){
			n = ctx.createBufferSource();
			if(!Player.pyTable[curPY[j]])	return;
			n.buffer = Player.pyTable[curPY[j]];
			
			if(PinYin.shengmu.indexOf(curPY[j])==-1){
				//n.playbackRate.value = detune[0].f / 440 / 2;
				n.playbackRate.value = detune[0].f / 440;
				gain_detuner.connect(n.detune);
				for(var k=1;k<detune.length;k++){
					//n.playbackRate.setValueAtTime(detune[k-1].f / 440 / 2,detune[k].time + start - 0.05);
					n.playbackRate.setValueAtTime(detune[k-1].f / 440,detune[k].time + start - 0.05);
					//n.playbackRate.exponentialRampToValueAtTime(detune[k].f / 440 / 2,detune[k].time + start+0.05);
					n.playbackRate.exponentialRampToValueAtTime(detune[k].f / 440,detune[k].time + start+0.05);
				}
				n.loop = true;
				n2 = ctx.createGain();
				n2.gain.value = 0.001
				n2.gain.linearRampToValueAtTime(       1,start + i * len + j * d1 + d1 - advance);
				n2.gain.linearRampToValueAtTime(		0.8,start + i * len + j * d1 + len*0.8 - advance);
				n2.gain.linearRampToValueAtTime(	0.001,start + i * len + j * d1 + len - advance);
				n.connect(n2);
				n2.connect(n0);
			}else{
				advance = 0.1;
				n.loop = false; 
				n.connect(n0);
			}
			
			n.start(start + i * len + j * d1 - advance);
			n.stop(start + i * len +len - 0.05);
		}
		n0.gain.exponentialRampToValueAtTime(0.5 * vol,(start + i * len +Math.min(0.4 * len,0.1) ) - advance);
		n0.gain.exponentialRampToValueAtTime(0.3 * vol,(start + i * len +Math.min(0.7 * len,len-0.05)));
		n0.gain.exponentialRampToValueAtTime(0.001 * vol,(start + i * len +1 * len+0.2));
		n0.connect(Player.target);
		(function(n0){
		    setTimeout(function(){n0.disconnect(Player.target);},(start - Player.ctx.currentTime + len) * 1000 + 200);	
		})(n0);
		
	}
}


PinYin.splitUp = function pinyin_splitUp(pinyin){
	var i,ans = [];
	pinyin = pinyin.toLowerCase().replace(PinYin.fixRegExp,"$1v");
	for(i in PinYin.pyrep){
		pinyin = pinyin.replace(i,PinYin.pyrep[i]);
	}
	for(i=0;i<PinYin.pys.length;i++){
		if(pinyin.length == 0)break;
		if(PinYin.pys[i] == pinyin.substr(0,PinYin.pys[i].length)){
			ans.push(PinYin.pys[i]);
			pinyin = pinyin.substr(PinYin.pys[i].length)
			i = -1;
			continue;
		}
	}
	return ans;
}
PinYin.main = function(){
	
}

var Player = {
	ctx :null,
	trans:0,
	music:[],
	voice:[],
	timePassed:0,
	timeStart:0,
	target:null,
	wave:null,
	pyTable:{},
	pianoSample:null,
	
	enableSMPlay:true,
	enableVoice:true,
	enableChord:true,
	enableMusic:true,
};
Player.soundItem = {
	vol:0.3,//0~1
	len:1,//sec 
	start:0,
	f:[{
		time:0,
		f:440,
	}],//[],
	fx:[],
	word:"",
	isChord:false
}
Player.loadPyTable = function player_loadPyTable(){
	var table =PinYin.pys;
	var len = 0,loaded = 0;
	for(var i in table){
		(function(i){
			var request = new XMLHttpRequest();
			request.open('GET', 'data/' +table[i] + '.wav', true);
			request.responseType = 'arraybuffer';
			request.onload = function() {
				var audioData = request.response;
				Player.ctx.decodeAudioData(audioData, function(buffer) {
					Player.pyTable[table[i]] = buffer;
					loaded++;
					Player.trace("正在加载语音合成音源，已完成 " + (loaded * 100 / len).toFixed(2) + "%。" )
				}),
				function(e){console.warn("Error with decoding audio data" + e.err)};
			}
			request.send();
		})(i);
		len++;
	}
}
Player.loadSample = function player_loadSample(){
	var request = new XMLHttpRequest();
	request.open('GET', 'data/pianosap.wav', true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		var audioData = request.response;
		Player.ctx.decodeAudioData(audioData, function(buffer) {
			Player.pianoSample = buffer;
		}),
		function(e){console.warn("钢琴采样加载失败，将使用合成音效。" + e.err)};
	}
	request.send();
}
Player.main = function player_main(){
	if(!("AudioContext" in window)){
		UI.statusbar.querySelector("div").innerHTML = "您的浏览器对音频编辑没有足够的编辑功能。";
		return;
	}
	Player.ctx = new AudioContext();
	Player.DC = Player.ctx.createDynamicsCompressor();
	Player.DC.connect(Player.ctx.destination);
	Player.voiceNode = Player.ctx.createGain();
	Player.voiceNode.gain.value = 1;
	Player.target = Player.ctx.destnation;
	var real = new Float32Array(11);
	var imag = new Float32Array(11);
	var ac = Player.ctx;

	real[0] = 0;
	imag[0] = 0;
	real[1] = 0.2;
	imag[1] = 0;
	for(var i = 1;i<=15;i++){
		real[i] = 0.2 * Math.pow((15-i) * 0.1,4);
		imag[i] = 0;
	}
	Player.wave = ac.createPeriodicWave(real, imag, {disableNormalization: true});
	Player.loadPyTable();
	Player.loadSample();
}
Player.fMap = {};
(function fillfMap(){
	var fMap = Player.fMap;
	var p = 1 / 12
	fMap[6] = 0;
	fMap[7] = 2*p;
	fMap[1] = -9*p;
	fMap[2] = -7*p;
	fMap[3] = -5*p;
	fMap[4] = -4*p;
	fMap[5] = -2*p;
})();
Player.start = function player_start(startTime,tune,len,vol,isChord){
	if(!Player.ctx )return;
	if((!Player.enableMusic) && (!isChord))return;
	if((!Player.enableChord) && (isChord))return;
	Player.ctx.resume();

	vol = vol * 0.3;
	var gain = Player.ctx.createGain()
	
	gain.connect(Player.target)	

	var osc;
	if(!Player.pianoSample){
		gain.gain.value=0.001;
		gain.gain.exponentialRampToValueAtTime(vol,Player.timeStart+startTime+0.05);
		gain.gain.exponentialRampToValueAtTime(vol*0.2,Player.timeStart+startTime+len*0.6);
		gain.gain.exponentialRampToValueAtTime(0.001 ,Player.timeStart+startTime+len);
		osc = Player.ctx.createOscillator();
		//osc.type = "sine";
		osc.setPeriodicWave(Player.wave);
		osc.frequency.value= tune;
	}else{
		gain.gain.value=vol;
		gain.gain.exponentialRampToValueAtTime(vol*0.4,Player.timeStart+startTime+len*0.9);
		gain.gain.exponentialRampToValueAtTime(0.001 ,Player.timeStart+startTime+len);
		osc = Player.ctx.createBufferSource();
		osc.buffer = Player.pianoSample;
		osc.playbackRate.value = tune / (440 * Math.pow(2,-9/12));
	}
	osc.connect(gain);
	osc.start(Player.timeStart + startTime);
	osc.stop(Player.timeStart + startTime + len);
	setTimeout(function(){gain.disconnect(Player.target);},(Player.timeStart + startTime - Player.ctx.currentTime + len) * 1000 + 300);
}
Player.simplePlay = function player_simplePlay(tune ,octave){
	if(!Player.ctx)		return;	
	if(tune == 0)		return;
	if(!Player.enableSMPlay)	return;
	tune = Player.fMap[tune];
	var f = 440 * Math.pow(2,tune + octave+Music.arpeggio/12);
	Player.start(Player.ctx.currentTime-Player.timeStart,f,0.25,1);
	
}
Player.sing = function player_sing(){
	//... player_start(startTime,tune,len,vol){
	Player.timeStart = Player.ctx.currentTime;
	Player.splitUp();
	var voice = Util.clone(Player.voice);
	var music = Util.clone(Player.music);
	Player.ctx.resume();

	//延迟的播放，否则手机会崩
	var cacheNum = 2;
	var cacheStartNum = 2;
	var cacheTime = 250;
	for(var i = 0;i < Math.min(voice.length,cacheStartNum+1);i++){
		var item = voice[i];
		if(item.word == "")continue;
		if(item.word == null)continue;
		PinYin.voice(item.word,item.f,item.start,item.len,item.vol)
	}
	for(var i = cacheStartNum;i < voice.length;i+=cacheNum){
		(function(start){setTimeout(function(){
			Player.ctx.resume();
			var end = Math.min(voice.length - 1,start + cacheNum)
			for(;start <= end;start++){
				var item = voice[start];
				if(item.word == "")continue;
				if(item.word == null)continue;
				PinYin.voice(item.word,item.f,item.start,item.len,item.vol)
			}
		},Math.max(0,voice[i].start * 1000 - cacheTime))})(i)
	}
	for(var i = 0;i < Math.min(music.length,cacheStartNum+1);i++){
		var item = music[i];
		if(isNaN(item.f[0].f))continue;
		Player.start(item.start,item.f[0].f,item.len,item.vol,item.isChord)
	}
	for(var i = cacheStartNum;i < music.length;i+=cacheNum){
		(function(start){setTimeout(function(){
			Player.ctx.resume();
			var end = Math.min(music.length - 1,start + cacheNum)
			for(;start <= end;start++){
				var item = music[start];
				if(isNaN(item.f[0].f))continue;
				Player.start(item.start,item.f[0].f,item.len,item.vol,item.isChord)
			}
		},Math.max(0,music[i].start* 1000 - cacheTime))})(i)
	}
	
}
Player.trace = function player_train( log ){
	//var log = Array.prototype.splice.call(arguments).join(" ");
	if("UI" in window){
		UI.statusbar.querySelector("div").innerHTML = log;
	}
	console.log(log)
}
Player.main();
Player.splitUp = function player_splitUp_outdated(){
	Music.getLenSectionTempo();
	var sp32b = Music.speedS;
	Player.music = [];
	Player.voice = [];
	var curLen = 0;
	var curTime = 0;
	var music = Music.flat();
	var lenTempo = Music.lenTempo;
	var lenSection = Music.lenSection;
	var time;
	for(var i=0;i<music.length;i++){
		curLen += music[i].length;
		if(i>=2 && music[i-2].fx.triplets ){
			curLen -= music[i].length;
		}
		if(music[i].fx.triplets || (i>=1 && music[i-1].fx.triplets)||(i>=2 && music[i-2].fx.triplets)){
			time = sp32b * 2 * music[i].length / 3
		}else{
			time = sp32b * music[i].length
		}
		if((i>=1 && music[i-1].fx.triplets)||(i>=2 && music[i-2].fx.triplets)){
			curTime += time;
		}else{
			curTime = (curLen- music[i].length)* sp32b + 0.1;
		}
		if(music[i].fx.extend){
			if(i >= 1){
				if(music[i].pitch +music[i].octave * 13 == music[i-1].pitch +music[i-1].octave * 13){
					Player.music[Player.music.length-1].len += time;
					Player.music[Player.music.length-2].len += time;
				}else{
					var newItem = Util.clone(Player.soundItem);
					newItem.len = time;
					newItem.start = curTime;
					newItem.f[0].f = 440*Math.pow(2,(Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12))
					newItem.word = music[i].word[0];
					newItem.vol /= 2.5;
					Player.music.push(newItem)
					newItem = Util.clone(newItem);
					newItem.f[0].f /= 4;
					Player.music.push(newItem)
				}
				music[i].word = music[i].word.map(function(item){if(item){return item.replace(/\s/g,"")}else{return ""}})
				if(music[i].word[0] == "" || music[i].word[0] == null){
					Player.voice[Player.voice.length-1].len += time;
					if(music[i].pitch +music[i].octave * 13 == music[i-1].pitch +music[i-1].octave * 13){
						
					}else{
						var voicelast = Player.voice[Player.voice.length-1]
						voicelast.f.push({
							time:-voicelast.start + curTime,
							f:440*Math.pow(2,(Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12))
						})
					}
				}else{
					var newItem = Util.clone(Player.soundItem);
					newItem.len = time;
					newItem.start = curTime
					newItem.f[0].f = 440*Math.pow(2,(Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12))
					newItem.word = music[i].word[0];
					Player.voice.push(newItem)
				}
			}
			
			
		}else{
			var newItem = Util.clone(Player.soundItem);
			newItem.len = time;
			newItem.start = curTime
			newItem.f[0].f = 440*Math.pow(2,(Player.fMap[music[i].pitch]+music[i].octave+Music.arpeggio/12))
			newItem.word = music[i].word[0];
			newItem.vol /= 2.5;
			Player.music.push(newItem);
			Player.voice.push(newItem)
			newItem = Util.clone(newItem);
			newItem.f[0].f /= 4;
			Player.music.push(newItem)
			
		}
	}

	var chordNotes = Chord.getChord();
	chordNotes.forEach(function (noteary,id) {
		var sttime = lenSection * id;
		var ttlen = lenSection;
		var extend = 1;
		if(id < chordNotes.length-1 && noteary.toString() == chordNotes[id+1].toString()){
			extend = 4;
		} 
		var volBoost = 1.2;
		while(ttlen > 0){
			noteary.forEach(function (note){
				var newItem = Util.clone(Player.soundItem);
				newItem.len = (ttlen + extend) * sp32b ;
				newItem.start = sttime * sp32b + 0.1;
				newItem.vol = newItem.vol * volBoost /6;
				newItem.f[0].f = 440*Math.pow(2,(Player.fMap[note]-1+Music.arpeggio/12))
				newItem.isChord = true;
				Player.music.push(newItem);
			});
			volBoost = 1;
			sttime += lenTempo;
			ttlen  -= lenTempo
		}

	});
    Player.music.sort(function(a,b){return a.start - b.start});
}