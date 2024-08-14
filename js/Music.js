/*
The file is a part of Foolplay（傻瓜弹曲）
Foolplay is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
// jshint maxerr:9999

//Errors ->Move into "edit.htm"
//Shim
HTMLElement.prototype.matchesSelector = function() {
	var body = HTMLElement.prototype;
	/* Now the `matches` are pretty good. */
	return body.webkitMatchesSelector || body.msMatchesSelector || body.mozMatchesSelector || body.oMatchesSelector || body.matches;
}();

//Utils
Util = {
	_orglisteners: [],
	_patchedlisteners: [],
};
Util.tick = function(time=0) {
	return new Promise(function(ok) {
		setTimeout(ok, time);
	}
	);
}
Util.clone = function util_clone(a) {
	//深复制对象
	//我不想管那一堆对象，当然，环我也不管，省事。:)
	var b;
	if (Array.isArray(a)) {
		b = [];
	} else {
		b = {};
	}
	for (var i in a) {
		if(i == "undefined-undefined") debugger;
		if (a[i] == null)
			continue;
		/* 原型攻击防护 */
		if (i in {})
			continue;
		if (Array.isArray(a) && i in [])
			continue;
		if (a[i].constructor == Object || Array.isArray(a[i])) {
			b[i] = Util.clone(a[i]);
		} else {
			b[i] = a[i];
		}
	}
	return b;
}
Util.throttle = function util_throttle(func, that, delay) {
	//节流，节流函数最快只能执行10Hz，不能保证实时性和被执行，但可能多余，否则导致页面锁定的情况。。
	if (!!delay)
		delay = 100;
	var _delay = 100;
	if (typeof delay == "function") {
		setInterval(function() {
			_delay = delay();
		}, 1000);
	} else {
		_delay = delay;
	}
	var timer = -1;

	if (that == null)
		that = null;
	var callit = function() {
		timer = -1;
		func.apply(that, Array.prototype.slice.call(arguments));
	};

	function throttledFunc() {
		if (timer == -1) {
			//callit()
			timer = setTimeout(callit, _delay);
		}
	}
	throttledFunc.atOnce = callit;
	return throttledFunc;
}
Util.css = function util_css(list, obj) {
	var ary = Array.prototype.slice.call(list);
	for (var i in ary) {
		for (var j in obj) {
			ary[i].style[j] = obj[j];
		}
	}
}
Util.live = function util_live(eventName, parent, selector, listener) {
	function patchedListener(event) {
		var tmpEle = event.target;
		var ifMatched = false;
		while (tmpEle != parent && tmpEle != null) {
			if (tmpEle.matchesSelector(selector)) {
				ifMatched = true;
				break;
			}
			tmpEle = tmpEle.parentNode;
		}
		if (!ifMatched) {
			return;
		}
		var fakeEvent = Util.clone(event);
		fakeEvent.target = tmpEle;
		fakeEvent.oriEvent = event;
		var rtn = listener(fakeEvent);
		if (rtn === false) {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
		}
	}
	parent.addEventListener(eventName, patchedListener);
}
Util.templateClone = function util_templateClone(raw, template) {
	//目前浅复制
	var ans = Util.clone(template)
	for (var i in template) {
		if (i in raw)
			ans[i] = raw[i];
	}
	return ans;
}
Util.onCJKInput = function hack_composition(ele, listener) {
	var isTyping = false;

	function inputListener(event) {
		setTimeout(function() {
			if (!isTyping) {
				listener(event);
			}
		}, 0);
	}

	function compositionListener(event) {
		isTyping = (event.type.toLowerCase() == "compositionstart");
	}
	ele.addEventListener("input", inputListener);
	ele.addEventListener("compositionstart", compositionListener);
	ele.addEventListener("compositionend", compositionListener);
}
Util.queries = function queryString() {
	var str = location.href;
	/* 检查URL参数 https://zhuanlan.zhihu.com/p/257077535 */
	var params = str.split('?')[1];
	if (!params) {
		str = str.replace('#', '?');
		params = str.split('?')[1];
		if (!params) {
			return {};
		}
	}
	var param = params.replace(/#.*/, '').split('&');
	var obj = {};
	for (var i = 0; i < param.length; i++) {
		var paramsA = param[i].split('=');
		var key = decodeURIComponent(paramsA[0].split("+").join("%20"));
		var value = decodeURIComponent((paramsA[1] || "").split("+").join("%20"));

		if (obj[key]) {
			/* 处理数组 */
			obj[key] = obj[key].join ? obj[key] : [obj[key]];
			obj[key].push(value);
		} else {
			obj[key] = value;
		}
	}
	return obj;
}
Util.copy = function util_copy(e) {
	let transfer = document.createElement('input');
	document.body.appendChild(transfer);
	transfer.value = e;
	// 这里表示想要复制的内容
	transfer.focus();
	transfer.select();
	if (!document.execCommand('copy')) {
		PopupWindow.alert("错误：不能复制文本。");
	}
	transfer.blur();
	console.log('复制成功');
	document.body.removeChild(transfer);
}
Util.t2h = function util_t2h(str) {
	var d = util_t2h.d;
	if (!d) {
		d = util_t2h.d = document.createElement('div');
	}
	d.textContent = str;
	return d.innerHTML;
}
Util.saveAs = function util_saveAs(content, mine, fileName) {
	var url;
	var blob;
	/* 不使用文件本身的 MIME 以防触发浏览器特殊机制（如Chrome 会把网页 “打包”为MHTML 并破坏追加的脚本区域） */
	if (mine.indexOf('html') > -1) {
		mine = 'application/octet-stream';
	}
	try {
		blob = new File([content],fileName,{
			type: mine
		});
	} catch (e) {
		blob = new Blob([content],{
			type: mine
		});
	}
	url = URL.createObjectURL(blob);
	setTimeout(function() {
		URL.revokeObjectURL(url)
	}, 40 * 1000);
	
	var link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
Util.htmlNoId = function util_htmlNoId(html) {
	var data = Object.create(null);
	var temp = document.createElement('template');
	temp.innerHTML = html.trim();
	var cxt = temp.content;
	cxt.normalize();
	var elesWithId = Array.from(cxt.querySelectorAll('[id]'));
	elesWithId.forEach(function(ele) {
		data[ele.id] = ele;
		ele.removeAttribute('id');
	});
	return {
		ele: cxt.childNodes.length == 1 ? cxt.children[0] : cxt,
		ids: data
	}
}

var PopupWindow = {
	_windowDragging: null,
	_windowDraggingY: null,
	_windowDraggingX: null,
};
PopupWindow.open = function popupWindow_open(dom) {
	dom.style.display = "block";
	var _rect = dom.getBoundingClientRect();
	dom.style.top = (window.innerHeight - (_rect.bottom - _rect.top)) / 2 + "px";
	dom.style.left = (window.innerWidth - (_rect.right - _rect.left)) / 2 + "px";
}
PopupWindow.close = function popupWindow_close(dom) {
	dom.style.display = "none";
	if (dom.className.indexOf("destroy") > -1 && dom.parentElement) {
		dom.parentElement.removeChild(dom);
	}
}
PopupWindow.alert = function popupWindow_alert(msg) {
	var dom = document.createElement("div");
	dom.className = "window destroy on";
	dom.innerHTML = '<div class="windowtitle">来自网页的消息<button class="close"><b>×</b></button></div><div class="content"><div class="msg"></div><center><button onclick="PopupWindow.close(this.parentElement.parentElement.parentElement)">知道了</button></center></div>';
	dom.querySelector(".msg").innerHTML = msg.split("\n").join("<br>");
	document.body.appendChild(dom);
	PopupWindow.open(dom);
	return dom;
}
PopupWindow.progress = function popupWindow_progress() {
	var obj = Util.htmlNoId(`
  <div class="window destroy on">
  <div class="windowtitle">进度<button class="cancel"><b>×</b></button></div>
  <div class="content">
  <span id="s_tip">正在处理中</span>
  <span id="s_progress">N/A / N/A</span>
  <br><progress id="p_load" style="width:300px"></progress>
  <hr>
  <div style="text-align: right">
  <button class="cancel" >取消</button>
  </div>
  </div>
  </div>`);
	var dom = obj.ele;
	Util.live('click', dom, '.cancel', function() {
		try {
			oncl();
		} catch (e) {
			throw e;
		} finally {
			rtn.noCancel();
		}
	});
	var oncl;
	document.body.appendChild(dom);
	PopupWindow.open(dom);
	var rtn = {
		ele: dom,
		noCancel: function() {
			Array.from(dom.querySelectorAll('.cancel')).forEach(function(a) {
				a.disabled = true;
				;
			})
			return this;
		},
		okToCancel: function() {
			Array.from(dom.querySelectorAll('.cancel')).forEach(function(a) {
				a.disabled = false;
			});
			return this;
		},
		text: function(a) {
			obj.ids.s_tip.innerText = a;
			return this;
		},
		progressText: function(a) {
			obj.ids.s_progress.innerText = a;
			return this;
		},
		max: function(a) {
			obj.ids.p_load.max = a;
			return this;
		},
		progress: function(a) {
			obj.ids.p_load.value = a;
			return this;
		},
		oncancel: function(a) {
			oncl = a;
			this.okToCancel();
			return this;
		},
		close: function() {
			oncl = null;
			PopupWindow.close(this.ele);
		}
	};
	rtn.noCancel();
	return rtn;
}
PopupWindow.main = function popupWindow_main() {
	/* 实践证明，这个程序没有非模式窗口的必要性 */
	Util.live("mousedown", document, ".window .windowtitle", function set_flags(event) {
		//var onlist = Array.prototype.slice.call(document.querySelectorAll(".window.on"));
		//onlist.forEach(function (item) {
		//item.classList.remove("on");
		//});
		var _rect = event.target.parentNode.getBoundingClientRect();
		PopupWindow._windowDragging = event.target.parentNode;

		PopupWindow._windowDraggingX = event.clientX - PopupWindow._windowDragging.getBoundingClientRect().left;
		PopupWindow._windowDraggingY = event.clientY - PopupWindow._windowDragging.getBoundingClientRect().top;
	});
	//Util.live("mousedown", document, ".window", function set_flags(event) {
	//var onlist = Array.prototype.slice.call(document.querySelectorAll(".window.on"));
	//onlist.forEach(function (item) {
	//item.classList.remove("on");
	//});
	//event.target.classList.add("on");
	//});
	Util.live("click", document, ".window .windowtitle .close", function set_flags(event) {
		PopupWindow.close(event.target.parentNode.parentNode);
	});
	document.addEventListener("mousemove", function do_drag() {
		if (PopupWindow._windowDragging) {
			var _rect = PopupWindow._windowDragging.getBoundingClientRect();
			PopupWindow._windowDragging.style.top = Math.min(Math.max(event.clientY - PopupWindow._windowDraggingY, 0), window.innerHeight - (_rect.bottom - _rect.top)) + 'px';
			PopupWindow._windowDragging.style.left = Math.min(Math.max(event.clientX - PopupWindow._windowDraggingX, 0), window.innerWidth - (_rect.right - _rect.left)) + 'px';
		}
	});
	document.addEventListener("mouseup", function clear_flag() {
		PopupWindow._windowDragging = null;
	});
}
PopupWindow.main();

//Music
var Music = {
	title: "",
	author: "",
	music: [],
	tempo: [4, 4],
	speed: 120,
	arpeggio: 0,
	setting: {},
	loops: [],
	//{2:{do,loop,coda,segno,ds,dc,house:[]}}
	lenTempo: 0,
	lenSection: 0,
	sections: [],
	speedS: 0,
};
Music.MusicNote = function() {
	//返回一个 MusicNote， 一个集合（假构造函数）
	return {
		pitch: 1,    /* 0, 1, 2, 3, 4, 5, 6, 7 */
		shift: null,    /* -1, 0, 1 */ /* 还去管更离谱的吗？我不管无调音乐！ */
		octave: 0,   /* -1, 0, 1 */
		length: 32,  /* 个 三十二分音符 */
		word: [],    
		pinyin: [],
		fx: {},
	};
}
Music.getLenSectionTempo = function music_getLenSectionTempo() {
	//功能：更新小节/节拍的长度
	Music.lenSection = 32 / Music.tempo[0] * Music.tempo[1];
	Music.lenTempo = Music.lenSection / Music.tempo[1];
	if (Music.tempo[1] > 3 && Music.tempo[1] % 3 == 0) {
		Music.lenTempo *= 3;
	}
	Music.speedS = 60 / Music.speed / Music.lenTempo;
}
Music.indexNoteInSection = function music_indexNoteInSection(id) {
	//根据音符确定小节
	var ans = -1;
	if (id < 0 && id > Music.music.length)
		return ans;
	for (var i = 0; i < Music.sections.length; i++) {
		if (Music.sections[i][0].id > id) {
			ans = i - 1;
			return ans;
		}
	}
	if (Music.sections[i - 1][0].id <= id)
		ans = i - 1;
	return ans;
}
Music.split = function music_split() {
	//功能：把连续的音符序列分解为节拍
	//使用已刷新的数据
	Music.getLenSectionTempo();
	var leftThisSection = Music.lenSection;
	var i;
	var curLen = 0;
	var sections = Music.sections = [];
	var thisSection = [];
	for (i = 0; i < Music.music.length; i++) {
		thisSection.push({
			note: Music.music[i],
			id: i
		});
		curLen += Music.music[i].length;
		if (Music.music[i].fx.triplets) {
			if ((i < Music.music.length - 2) && (Music.music[i + 1].length == Music.music[i + 2].length) && (Music.music[i + 2].length == Music.music[i].length) && ((Music.lenSection - curLen >= Music.music[i].length))) {
				curLen -= Music.music[i].length;
			} else {
				delete Music.music[i].fx.triplets;
			}
		}
		if (curLen == Music.lenSection) {
			thisSection.attr = Music.loops[sections.length];
			sections.push(thisSection);
			thisSection = [];
			curLen = 0;
		} else if (curLen > Music.lenSection) {
			UI.statusbar.querySelector("div").innerText = "警告：歌谱出现问题，不能按照小节渲染，请关注并修正歌谱。";
		}
	}
	if (thisSection.length > 0)
		sections.push(thisSection);

}
/* 最大的 Fuck！ */
Music.flatBar = function(){
	/* 目前没有机制保证 loop 过长 */
	/* 0. 确定 Loop 存在*/
	if(Music.loops.length > Music.sections.length){
		Music.loops.length = Music.sections.length;
	}
	var loops = Util.clone(Music.loops);
	var sections = Util.clone(Music.sections);
	/* 1. 拆分符号 */
	var lists = loops.map(function(item,id){
		if(!item)  return [];
		var list = [];
		if(item.do)
			list.push({id:id, action:'do'});
		if(item.house && item.house.length)
			list.push({id:id, action:'house', data:item.house});
		if(item.loop)
			list.push({id:id, action:'loop'});
		return list;
	}).flat();
	if(lists.length == 0) return sections;
	if(lists[0].action != 'do'){
		lists.unshift({id:0, action:'do'});
	}
	//console.log(lists);
	/* 2. 划分循环 */
	var loopParas = [{type: 'normal', start:0, end:0}];
	//var check = deadProtect(lists.length);
	var i ;
	loop:
	for(i = 0; i< lists.length;){
		//check();
		//console.log(i,lists,Util.clone(loopParas));
		//console.log(loopParas[loopParas.length-1].type,lists[i].action);
		switch(loopParas[loopParas.length-1].type){
			case 'normal':
				switch(lists[i].action){
					case 'do':
						loopParas[loopParas.length-1].end = lists[i].id;
						if(lists[i+2] && lists[i+1].action == 'house'
						&& lists[i+2].action == 'loop'){
							loopParas.push({
								type: 'houseLoop',
								start: lists[i].id,
								end:   lists[i+1].id-1,
								houses:[]
							});
							i++;
						} else if (lists[i+1] && lists[i+1].action == 'loop'){
							loopParas[loopParas.length-1].end = lists[i].id;
							loopParas.push({
								type: 'loop',
								start: lists[i].id,
								end:   lists[i+1].id,
								houses:[]
							});
							i++;
						} else {
							console.warn('错误：不能识别的符号组合（可识别房子:|| 或 :||）\
是不是在房子后漏了反复记号？解析停止。\n' + 
						'    小节：' + (lists[i].id+1) + '；内部标签：' + lists[i].action
						+'；状态：' + loopParas[loopParas.length-1].type);
							i++;
							break loop;
						}
						break;
					case 'loop':
					case 'house':
						console.warn('错误：不能识别的序列（在非反复片段末尾遇见不是\
||: 的符号），请检查您的乐谱。目前不支持嵌套反复。解析停止。\n' + 
						'    小节：' + (lists[i].id+1) + '；内部标签：' + lists[i].action
						+'；状态：' + loopParas[loopParas.length-1].type);
						i++;
						break;
					default: 
						throw Error('错误：未识别的符号。');
				}
				break;
			case 'loop':
				switch(lists[i].action){
					case 'loop':
						loopParas[loopParas.length-1].end = lists[i].id+1; /* 包括自身 */
						if(lists[i+1] && lists[i+1].action == 'do'){
							loopParas.push({
								type: 'normal',
								start: lists[i].id+1,
								end:   lists[i+1].id,
								houses:[]
							});
							i++;
						} else if(!lists[i+1]){
							i++;/* 什么也不用做。 乐曲结束了。 但是此处不应该warn。*/
						} else {
							console.warn('错误：不能识别的符号组合（循环外面必须用 ||: 开头）\
是不是在房子后漏了反复记号？解析停止。\n' + 
						'    小节：' + (lists[i].id+1) + '；内部标签：' + lists[i].action
						+'；状态：' + loopParas[loopParas.length-1].type);
							i++;
							break loop;
						}
						break;
					case 'do':
						console.warn('错误：不能识别的序列（在反复片段中遇见不是\
		反复开始符号），请检查您的乐谱。解析停止。\n' + 
						'    小节：' + (lists[i].id+1) + '；内部标签：' + lists[i].action
						+'；状态：' + loopParas[loopParas.length-1].type);
						i++;
						break;
					case 'house':
						console.warn('错误：不能识别的序列（在反复片段外遇见不是\
		反复开始符号的符号而非房子），请检查您的乐谱。解析停止。\n' + 
						'    小节：' + (lists[i].id+1) + '；内部标签：' + lists[i].action
						+'；状态：' + loopParas[loopParas.length-1].type);
						i++;
						break;
					default: 
						throw Error('错误：未识别的符号。')
				}
				break;
			case 'houseLoop':
				switch(lists[i].action){
					case 'house':
						if(lists[i+1] && lists[i+1].action != 'loop'){
							/* 房子的末尾未必是反复记号：没有必要限制范围。 */
							lists.splice(i+1,0,{id:lists[i+1].id-1, action:'loop'});
						}
						if(lists[i+1] && lists[i+1].action == 'loop'){
							loopParas[loopParas.length-1].end = lists[i+1].id+1;
							loopParas[loopParas.length - 1].houses[lists[i].data[0]-1] = {
								start: lists[i].id, end: lists[i+1].id+1
							} ;
							i+=2;
						} else if(!lists[i+1]){
							i++;/* 什么也不用做。 乐曲结束了。 但是此处不应该warn。*/
						} else {
							console.warn('错误：不能识别的符号组合（可识别房子:||）\
是不是在房子后漏了反复记号？解析停止。\n' + 
						'    小节：' + (lists[i].id+1) + '；内部标签：' + lists[i].action
						+'；状态：' + loopParas[loopParas.length-1].type);
							i++;
							break loop;
						}
						break;
					case 'do':
						loopParas.push({
							type: 'normal',
							start: lists[i-1].id+1,
							end:   lists[i].id,
							houses:[]
						});
						
						break;
					case 'loop':
						console.warn('错误：不能识别的序列（在非反复片段末尾遇见不是\
||: 的符号），请检查您的乐谱。目前不支持嵌套反复。解析停止。\n' + 
						'    小节：' + (lists[i].id+1) + '；内部标签：' + lists[i].action
						+'；状态：' + loopParas[loopParas.length-1].type);
						i++;
						break;
					default: 
						throw Error('错误：未识别的符号。');
				}
				break;
			default: /* 永远不会发生 */
				throw Error('错误：循环标记类型：' + loopParas[loopParas.length-1].type 
				            + '不受支持。');
		}
	}
	/* 最后一段在循环外面，我们把它解出来 */
	if(loopParas[loopParas.length-1].end != sections.length){
		loopParas.push({
			type: 'normal', 
			start: loopParas[loopParas.length-1].end, 
			end: sections.length
		});
	}
	/* 3. 展开 */
	//console.log(loopParas);
	return loopParas.map(function(item){

		var ary = [];
		var maxLen = sections.slice(item.start, item.end).reduce(function f(to,cur){
			////console.log(cur);
			if(Array.isArray(cur)){
				return Math.max(to,cur.reduce(f,0));
			}
			return Math.max(to,((cur.note&&cur.note.word)||[]).length);
		},0);
		var limit = maxLen - 1;
		if(maxLen <= 1){
			limit = 0;
			maxLen = 2;
		}
		//console.log(item,maxLen,limit)
		if(item.type == 'normal'){
			ary.push(sections.slice(item.start, item.end).map(function(item){
				return Music.flatOneBar(item,0);
			}));
		} else if(item.type == 'loop'){
			for(var i = 0; i<maxLen; i++){
				ary.push(sections.slice(item.start, item.end).map(function(item){
					return Music.flatOneBar(item,Math.min(limit,i));
				}));
			}
		} else if(item.type == 'houseLoop'){
			for(var i = 0; i<item.houses.length; i++){
				ary.push(sections.slice(item.start, item.houses[0].start).map(function(item){
					return Music.flatOneBar(item,Math.min(limit,i));
				}));
				ary.push(sections.slice(item.houses[i].start, item.houses[i].end).map(function(item){
					return Music.flatOneBar(item,0);
				}));
			}
		} else {
			console.error('loopParas', loopParas, 'item', item);
			throw Error('错误：不支持的片段类型。');
		}
		return ary;
	}).flat(2);
};
Music.flat = function music_flat() {
	var res = [];
	var bars = Music.flatBar();
	bars.forEach(function(bar) {
		bar.forEach(function(note) {
			note.note.rawIndex = note.id;
			res.push(note.note);
		});
	});
	return res;
}
Music.flatOneBar = function music_flatOneBar(bar, line) {
	var rtn = Util.clone(bar);
	function makeOk(tmp){
		if (!tmp)
			return [];
		if (tmp[line])
			return [tmp[line]];
		else
			return [];
	}
	rtn.forEach(function(n) {
		n.note.word = makeOk(n.note.word);
		n.note.pinyin = makeOk(n.note.pinyin);
	});
	return rtn;
}
/**
 * 根据上一个音状态决定这个音的变音记号标注
 * 返回 null 为不标注
 * 注：副作用：会给没有标注升降的音符标注升降
 * 注：副作用：修改 status 对象
 * @param {Number} status 上一个音的升降情况
 * @param {Object} note   音
 * @returns {Number|null}
 */
Music.checkShift = function music_checkShift(status, note){
	/* 检查不合法值 */
	var key = "" + note.pitch + "-" + note.octave;
	if(status[key] == null){
		status[key] = 0;
	}
	switch(note.shift){
		case 1: case 2: case -1: case -2: case 0: break;
		default: note.shift = status[key];
	}
	/* 休止符怎么能有升号呢？ */
	if(parseInt(note.pitch) == 0){
		note.shift = 0;
		return null;
	}
	if(status[key] == note.shift){
		return null;
	} else {
		status[key] = note.shift;
		return note.shift;
	}
}

//*/
//UI
var UI = {
	container: document.querySelector(".container"),
	editbox: document.querySelector(".editbox"),
	IMETip: document.querySelector("#imetip"),
	statusbar: document.querySelector(".status"),
	coverOn: document.querySelector("#coverOn"),
	titleBox: document.querySelector(".title"),
	arpeggioBox: document.querySelector(".arpeggio"),
	speedBox: document.querySelector("#speed"),
	tempo0Box: document.querySelector(".tempo0"),
	tempo1Box: document.querySelector(".tempo1"),
	openBox: document.querySelector("#openFile"),
	contextMenu: document.querySelector("#contextMenu"),
	speedLabel: document.querySelector('#speedLabel'),
	authorArea: document.querySelector('.author'),
	//selStart:-1,
	//selEnd:-1,
	from: -1,
	author: -1,
	// 注： 这些都是指选择的元素序号。其中 from = author 为空选
	// from <- [0, length]    author <- [0,length]
	get selStart() {
		return Math.min(this.from, this.author);
	},
	set selStart(v) {
		if (this.from > this.author) {
			this.author = v;
		} else {
			this.from = v;
		}
	},
	get selEnd() {
		return Math.max(this.from, this.author);
	},
	set selEnd(v) {
		if (this.from <= this.author) {
			this.author = v;
		} else {
			this.from = v;
		}
	},
	isMouseDown: false,
	domsAreas: -1,
	posAreas: -1,
	clipboard: [],
	domList: Array.prototype.slice.call(document.querySelectorAll(".note")),
	defaultLength: 8,
	isShiftDown: false,
	openFailedCount: 0,
	_oldSelStart: 0,
	get oldSelStart() {
		console.warn("oldSelStart 已经停用. 请使用UI.from 或者 UI.author.");
		return this._oldSelStart;
	},
	set oldSelStart(v) {
		console.warn("oldSelStart 已经停用. 请使用UI.from 或者 UI.author.");
		this._oldSelStart = v;
	},
	lastClickedNotePos: null,
	editingLynicLine: -1,
	caretStyle: null,
	ciheight: 0,
	ciCalculated: false,
	yinheight: 0,
	// 在不知道具体渲染情况下的一个预设估计值，渲染后将得到数值
	shouldScroll: true
};
UI.render = Util.throttle(function ui_render() {
	//功能：刷新歌谱的主要内容，会继续调用 UI.layout

	//准备进行处理，更新节拍数据
	Music.getLenSectionTempo();
	UI.statusbar.querySelector("div").innerText = "就绪";

	//刷新速度前面的标签
	var syms = {
		"4": "♪",
		"12": "♪.",
		"8": "♩",
		"24": "♩."
	};
	var speedText = syms["" + Music.lenTempo];
	//防止未知节拍查不到数据
	if (!speedText)
		speedText = '速度';
	UI.speedLabel.innerText = speedText + '=';

	//开始拼接HTML
	var html = [];
	var leftThisSection = Music.lenSection;
	var i;
	var curLen = 0;
	var sectionsHTML = [];
	var thisSectionHTML = [];
	Music.split();

	sectionsHTML = Music.sections.map(function(item, id) {
		var curLen = 0;
		var thisSectionHTML = [];
		var startHTML = "<div class=\"measure %CLASS%\"><div class=\"sectionLine\"></div>";
		var endHTML = "<div class=\"sectionLine\"></div></div>";
		var className = [];
		var inTriplets = 0;
		var shiftState = {}; /* 跟踪临时小节的升降状态 */

		//对每一个音符拼接HTML，并统计时间长度，以便宽松按节拍添加空格
		Music.music.forEach(function(a) {
			if (String(a.pitch) == '0') {
				a.octave = 0;
			}
		});
		for (i = 0; i < item.length; i++) {
			thisSectionHTML.push(UI.getHTMLforNote(
				item[i].note, 
				item[i].id, 
				Music.checkShift(shiftState, item[i].note)
			));
			curLen += item[i].note.length;
			if (item[i].note.fx.triplets) {
				if ((i < item[i].note.length - 2) && (item[i + 1].note.length == item[i + 2].note.length) && (item[i + 2].note.length == item[i].note.length) && ((Music.lenSection - curLen >= item[i].note.length))) {
					curLen -= item[i].note.length;
				}
				inTriplets = 3;
			}
			if (curLen % Music.lenTempo == 0 && curLen != Music.lenSection && --inTriplets < 0) {
				thisSectionHTML.push("<div class=\"space\"></div>");
			}
		}
		//处理反复记号显示
		if (item.attr) {
			(["do", "loop", "ds", "dc", "coda", "segno"]).forEach(function(n) {
				if (item.attr[n])
					className.push(n);
			});
		}
		//添加类名，并且拼接HTML
		startHTML = startHTML.replace("%CLASS%", className.join(" "));
		return startHTML + thisSectionHTML.join("") + endHTML;
	});
	//TODO: 部分替换，并测量性能
	html.push(sectionsHTML.join(" "));
	UI.container.innerHTML = html.join("");
	if (UI.shouldScroll)
		UI.throttledLayout();
	else
		UI.layout();
}, null, function() {
	return Music.music.length;
});
UI.layout = function ui_layout() {
	//功能：读取浏览器对歌谱的布局，
	//重绘光标
	[].slice.call(UI.coverOn.querySelectorAll(".cline,.house")).forEach(function(a) {
		a.parentNode.removeChild(a);
	});
	//定位
	//	获取全部的DOM元素列表
	var list = UI.domList = Array.prototype.slice.call(document.querySelectorAll(".note"));
	var rect;
	UI.domsAreas = [];
	UI.dom = [];
	list.forEach(function(dom) {
		//去除选择态
		var id = parseInt(dom.dataset.id);
		//获取对应的ID
		if (!UI.dom[id])
			UI.dom[id] = dom;
		if (!UI.domsAreas[id]) {
			//不存在：添加这个音符的区域
			UI.domsAreas[id] = {
				x: dom.offsetLeft,
				y: dom.offsetTop,
				width: dom.offsetWidth,
				height: dom.offsetHeight,
				midX: dom.offsetLeft + dom.offsetWidth / 2,
				midY: dom.offsetTop + dom.offsetHeight / 2,
				id: id
			}
		} else {
			//存在：与上一个合并
			UI.domsAreas[id].width = dom.offsetLeft + dom.offsetWidth - UI.domsAreas[id].x;
		}
	});
	var extraPosAreas = [];
	//获取每一个“位置”的描述。这一描述将用于计算光标相关位置
	UI.posAreas = UI.domsAreas.map(function(noteArea, i , areas){
		var res = {
			x: noteArea.x, 
			y: noteArea.y,
			width: 0,
			height: noteArea.height, 
			midX: noteArea.x, 
			midY: noteArea.y,
			id: noteArea.id
		};
		if(areas[i+1] && areas[i+1].y != noteArea.y){
			extraPosAreas.push({
				x: noteArea.x + noteArea.width, 
				y: noteArea.y,
				width: 0,
				height: noteArea.height, 
				midX: noteArea.x + noteArea.width, 
				midY: noteArea.y,
				id: noteArea.id+1
			})
		}
		return res;
	});
	if(UI.domsAreas.length){
		UI.posAreas.push({
			x: UI.domsAreas[UI.domsAreas.length - 1].x + UI.domsAreas[UI.domsAreas.length - 1].width, 
			y: UI.domsAreas[UI.domsAreas.length - 1].y,
			width: 0,
			height: UI.domsAreas[UI.domsAreas.length - 1].height, 
			midX: UI.domsAreas[UI.domsAreas.length - 1].x + UI.domsAreas[UI.domsAreas.length - 1].width, 
			midY: UI.domsAreas[UI.domsAreas.length - 1].y,
			id: UI.domsAreas[UI.domsAreas.length - 1].id+1
		});
	} else {
		UI.posAreas.push({
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			midX: 0,
			midY: 0,
			id: 0
		});
	}
	UI.posAreas = UI.posAreas.concat(extraPosAreas);
	var oneOfWordElement = document.querySelector(".geci");
	//获取音符实际占用的高度
	if (UI.yinheight == 0 && UI.domList[0])
		UI.yinheight = parseFloat(getComputedStyle(UI.domList[0].querySelector(".acnote")).height);
	//获取歌词区域的高度
	if (!UI.ciCalculated){
		if(oneOfWordElement){
			UI.ciheight = parseFloat(getComputedStyle(oneOfWordElement).height);
			UI.ciCalculated = true;
		} else {
			UI.ciheight = parseFloat(getComputedStyle(document.body).fontSize) * 1.2;
		}
		
		
	}
		

	// ??
	UI.redraw();
	//特殊标记
	Music.music.forEach(function(note, id) {
		if (id == 0)
			return;
		if (note.fx.extend)
			UI.appendCLine(id - 1, id);
		//延音线
		if (note.fx.triplets && id < Music.music.length - 2)
			UI.appendCLine(id, id + 2, "3");
		//三连音符号
	});
	//房子的绘制
	Music.sections.forEach(function(item) {
		if (item.attr && "house"in item.attr) {
			UI.appendCLine(item[0].id, item[item.length - 1].id, item.attr.house.join(","), true);
		}
	});
}
UI.throttledLayout = UI.layout;
UI.redraw = function ui_redraw() {
	var temp, isreved = false;

	var yinheight, ciheight;
	//清除选择态
	Array.prototype.slice.call(document.querySelectorAll(".selected")).forEach(function(dom) {
		dom.className = dom.className.replace("selected", "").replace("  ", " ");
	});
	//限制选区范围到合理位置：
	// *** 旧代码 ***
	//setStart	: 选取开始的音符的左边，约定-1为没有选区;
	//selEnd	: 选取结束的音符的右边，约定最左边为-1;
	// 注： 这些都是指选择的元素序号。其中 from = author 为空选
	// from <- [0, length]    author <- [0,length]
	if (UI.from <= 0)
		UI.from = 0;
	if (UI.from >= Music.music.length)
		UI.from = Music.music.length;
	if (UI.author <= 0)
		UI.author = 0;
	if (UI.author >= Music.music.length)
		UI.author = Music.music.length;
	//显示光标
	caret.style.display = "block";
	if (UI.from != UI.author) {
		//UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = "0";
		//有选择区域：绘制选择拖蓝
		UI.domList.forEach(function(dom, index) {
			if (index < id)
				return;
			var id = parseInt(dom.dataset.id);
			if (id >= UI.selStart && id < UI.selEnd) {
				if (UI.editingLynicLine == -1) {
					dom.className += " selected";
				} else {
					if (dom.children.length > UI.editingLynicLine + 1)
						dom.children[UI.editingLynicLine + 1].className += " selected";
				}
			}
		});
		//隐藏光标
		caret.style.display = "none";
	}
	if (UI.author > 0 && UI.domsAreas[UI.author] && UI.domsAreas[UI.author].x <= 5) {
		anoCaret.style.display = "block";
		anoCaret.style.left = UI.domsAreas[Math.min(UI.author - 1, Music.music.length - 1)].x + UI.domsAreas[UI.author - 1].width + "px"
		if (UI.editingLynicLine == -1) {
			//在音符级别
			anoCaret.style.top = UI.domsAreas[Math.min(UI.author - 1, Music.music.length - 1)].y + "px";
			anoCaret.style.height = UI.yinheight + "px";
		} else {
			//在歌词级别
			anoCaret.style.top = (UI.domsAreas[Math.min(UI.author - 1, Music.music.length - 1)].y + UI.yinheight + UI.ciheight * UI.editingLynicLine) + "px";
			anoCaret.style.height = UI.ciheight + "px";
		}
	} else {
		anoCaret.style.display = "none";
	}

	if (Music.music.length == 0) {
		UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = "0";
		caret.style.height = UI.yinheight + "px";
	} else {
		yinheight = UI.yinheight;
		ciheight = UI.ciheight;
		UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = "0";
		if (UI.author != UI.domsAreas.length) {
			UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = UI.domsAreas[UI.author].x + "px";
		} else {
			UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = UI.domsAreas[UI.author - 1].x + UI.domsAreas[UI.author - 1].width + "px";
		}
		if (UI.editingLynicLine == -1) {
			//在音符级别
			UI.IMETip.style.top = UI.editbox.style.top = caret.style.top = UI.domsAreas[Math.min(UI.author, Music.music.length - 1)].y + "px";
			caret.style.height = yinheight + "px";
		} else {
			//在歌词级别
			UI.IMETip.style.top = UI.editbox.style.top = caret.style.top = (UI.domsAreas[Math.min(UI.author, Music.music.length - 1)].y + UI.yinheight + ciheight * UI.editingLynicLine) + "px";
			caret.style.height = ciheight + "px";
		}
	}
	if (UI.shouldScroll)
		UI.autoScroll();
}
UI.autoScroll = function ui_autoScroll() {
	//Scroll
	var containerTop = UI.container.offsetTop - window.pageYOffset;
	var statusbarTop = UI.statusbar.getBoundingClientRect().top;
	var author = Math.min(UI.author, Music.music.length - 1);
	if (Music.music.length) {
		/*if (UI.domsAreas[author].y == 0) {
			window.scroll(0, 0);
			return;
		}*/
		UI.domList.every(function(item, index) {
			if (item.dataset.id == author) {
				if (UI.domsAreas[author].y + UI.domsAreas[author].height + containerTop > statusbarTop) {
					//窗口边缘下面
					item.scrollIntoView(false);
					window.scrollBy(0, +30);
				} else if (UI.domsAreas[author].y + containerTop < 30) {
					//窗口边缘上面
					item.scrollIntoView(true);
					window.scrollBy(0, -30);
				}
				return false;
			}
			return true;
		});
	}
}
UI.appendCLine = function ui_appendCLine(pid, nid, word, ishouse) {
	if (word == null)
		word = "";
	var className = ishouse ? "house" : "cline";
	var parea = UI.domsAreas[pid];
	var narea = UI.domsAreas[nid];
	if (parea.y == narea.y) {
		clinedom = document.createElement("div");
		clinedom.innerText = word;
		clinedom.className = className;
		clinedom.style.left = (ishouse ? parea.x : parea.midX) + "px";
		clinedom.style.top = (parea.y) + "px";
		//clinedom.style.width = narea.x - parea.x + (ishouse ? narea.width : 0) + "px";
		if(ishouse){
		  clinedom.style.width=(narea.x - parea.x+narea.width)+"px"
		}else{
		  clinedom.style.width = (narea.midX - parea.midX) + "px";
		}
		UI.coverOn.appendChild(clinedom);
	} else {
		clinedom = document.createElement("div");
		clinedom.className = className;
		clinedom.style.left = (parea.midX) + "px";
		clinedom.style.top = (parea.y) + "px";
		clinedom.style.width = (parea.width) + "px";
		if (!ishouse)
			clinedom.style.borderRadius = "10px 0 0 0";
		UI.coverOn.appendChild(clinedom);
		if (ishouse)
			return;
		clinedom = document.createElement("div");
		clinedom.className = "cline";
		clinedom.style.left = (narea.midX - 5) + "px";
		clinedom.style.top = (narea.y) + "px";
		clinedom.style.width = "5px";
		clinedom.style.borderRadius = "0 10px 0 0";
		UI.coverOn.appendChild(clinedom);
	}

}
UI.getHTMLforNote = function ui_getHTMLforNote(note, id, shift) {
	/* 应不应该显示升降号不能由音符音高本身决定 */
	var html = "";
	var className = "";
	var appendedHTML = "";
	var words = (note.word || []).slice();
	/*var pinyin = (note.pinyin || []).slice()
	words = words.map(function(w,i){
		var p = pinyin[i] || '';
		if(!w) w = '';
		return w + p;
	});*/
	note.pitch = parseInt(note.pitch);
	if (note.pitch == null)
		note.pitch = 1;
	text = (note.pitch = Math.max(Math.min(note.pitch, 7), 0)).toString();
	var addTimeLine = note.pitch == "0" ? "0" : "–";
	switch (note.length) {
	case 2:
		className += "f16";
		break;
	case 3:
		//	1.
		//	==
		className += "f16";
		appendedHTML += UI.getHTMLUnit(className, "·", [], id);
		break;
	case 4:
		className += "f8";
		break;
	case 6:
		//	1.
		//	--
		className += "f8";
		appendedHTML += UI.getHTMLUnit(className, "·", [], id);
		break;
	case 8:
		break;
	case 12:
		//	1.
		appendedHTML += UI.getHTMLUnit(className, "·", [], id);
		break;
	case 16:
		//	1-
		appendedHTML += UI.getHTMLUnit(className, addTimeLine, [], id);
		break;
	case 24:
		//	1--
		appendedHTML += UI.getHTMLUnit(className, addTimeLine, [], id);
		appendedHTML += UI.getHTMLUnit(className, addTimeLine, [], id);
		break;
	case 32:
		//	1---
		appendedHTML += UI.getHTMLUnit(className, addTimeLine, [], id);
		appendedHTML += UI.getHTMLUnit(className, addTimeLine, [], id);
		appendedHTML += UI.getHTMLUnit(className, addTimeLine, [], id);
		break;
	default:
		note.length = 8;
		break;
	}
	switch (note.octave) {
	case 1:
		className += " hasupo ";
		break;
	case -1:
		className += " hasdo ";
		break;
	}
	//html = UI.getHTMLUnit(className, note.pitch, note.word, id) + appendedHTML;
	html = UI.getHTMLUnit(className, note.pitch, words, id, shift) + appendedHTML;
	return html;
}
UI.getHTMLUnit = function ui_getHTMLUnit(classes, pitch, _word, id, shift) {
	var word = new Array(_word.length).fill("");
	_word.forEach(function(c,i){word[i] = c});
	var regp = /([,.?!，。？：！“”、；])/g;
	var pitchHTML;
	
	switch(shift){
		case 1:
			pitchHTML = "<sup>♯</sup>";
			break;
		case -1:
			pitchHTML = "<sup>♭</sup>";
			break;
		/* 如果后人要实现重升重降, 须注意字体问题 */
		case 2:
			pitchHTML = "<sup>×</sup>";
			break;
		case -2:
			pitchHTML = "<sup>♭♭</sup>";
			break;
		case 0:
			pitchHTML = "<sup>♮</sup>";
			break;
		default:
			pitchHTML = "";
			/* 置为其他值不显示符号 */
	}
	pitchHTML += Util.t2h(pitch);
	return (`
<div class="note $classes" data-id="$id">
	<div class="acnote">
		<div class="upo"></div>
		<div class="yin">$pitch</div>
		<div class="minusline"></div>
		<div class="downo"></div>
	</div>
	$word
</div>`).split("$classes").join(classes)
		.split("$pitch").join(pitchHTML)
		.split("$word").join(
			word.map(Util.t2h)
				.map(function(a){return a.trim()||'&nbsp;'})
				.map(function(a){return '<div class="geci">' + a + '</div>'})
				.join("")
				.replace(regp, "<span style='position:absolute;'>$1</span>"))//移除标点符号空间
	.split("$id").join(id);
}
UI.switchLine = function ui_switchLine(up) {
	if (UI.author >= Music.music.length) {
		UI.author = Music.music.length - 1;
		UI.switchLine(up);
		UI.author = Music.music.length;
		UI.redraw();
		return;
	}
	var oldscrPos = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
	var oldelePos = UI.dom[UI.author].getBoundingClientRect().top;
	var changed = false;
	if (up) {
		if (UI.editingLynicLine <= 0) {

			UI.editingLynicLine = 0;
		}
		Music.music.forEach(function(item) {
			var words = item.word;
			var word = "";
			for (var i = words.length; i >= UI.editingLynicLine; i--) {
				word = words[i];
				if (word == null) {
					word = words[i] = "";
					changed = true;
				}
				if (word.replace(/\s/gi, "") == "") {
					words.length = Math.max(words.length - 1, 0);
					changed = true;
				} else {
					break;
				}
			}
		});
		UI.editingLynicLine--;

	} else {
		UI.editingLynicLine++;
		Music.music.forEach(function(item) {
			var words = item.word;
			var word = "";
			for (var i = 0; i <= UI.editingLynicLine; i++) {
				word = words[i];
				changed = true;
				if (word == null) {
					words[i] = "";
				}
			}
		});
	}
	UI.shouldScroll = false;
	if (changed)
		UI.render.atOnce();
	UI.layout();
	UI.shouldScroll = true;
	var scrPos = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
	var elePos = UI.dom[UI.author].getBoundingClientRect().top;
	if (true) {
		window.scrollTo(0, oldscrPos);
		window.scrollBy(0, -oldelePos + elePos);
	}
}
UI.onKeyDown = function ui_onKeyDown(event) {
	// TODO: Fix the Keyboard after UI.insertEdit([]);
	var cancel = true;
	var start, end;
	start = UI.selStart;
	end = UI.selEnd - 1;
	var rect;
	//if(UI.selStart == UI.selEnd && UI.selEnd == -1)
	//	UI.selEnd = 0;
	if (event.keyCode == 13) {
		UI.switchLine();event.target.value = "";
		//UI.onChangeListener(event);
		return;
	}

	switch (event.keyCode) {

		//现在删除的行为有些复杂，所以暂时注释掉。
		//Delete
	case 46:
		//Delete
		if (UI.from == UI.author) {
			UI.from = ++UI.author;
		}
		// No break, let it fall down;
	case 8:
		//Backspace
		if (UI.editbox.value != "") {
			UI.refreshIME("");
		}
		if (Music.music.length == 0)
			return;

		if (UI.from == UI.author) {
			//最开始
			if (UI.author == 0)
				return;
			//没有选择
			if (UI.editingLynicLine == -1) {
				if (event.keyCode != 46 && Music.music[UI.author - 1].length % 3 == 0)
					Music.music[UI.author - 1].length = Music.music[UI.author - 1].length / 3 * 2;
				else if (event.keyCode != 46 && Music.music[UI.author - 1].length > UI.defaultLength)
					Music.music[UI.author - 1].length -= UI.defaultLength;
				else {
					UI.from = UI.author - 1;
					//UI.author;
					UI.insertEdit([]);
					UI.author = UI.from;
				}
			} else {
				UI.spliceWord(UI.author - 1, 1, "");
				UI.from = UI.author = UI.selStart - 1;
			}
		} else {
			if (UI.editingLynicLine == -1) {
				UI.insertEdit([]);
				UI.author = UI.from = UI.selStart;
			} else {
				UI.spliceWord(UI.selStart, UI.selEnd - UI.selStart, "");
				UI.from = UI.author = UI.selStart;
			}
		}
		UI.render();
		break;

		//Select

	case 37:
		// " <- "
		UI.refreshIME("");
		if (Music.music.length == 0)
			return;
		if (!event.shiftKey) {
			// 未按 Shift 清除选择态
			UI.from = UI.author - 1;
		}
		UI.author--;
		UI.redraw();
		break;
	case 39:
		// " -> "
		UI.refreshIME("");
		if (Music.music.length == 0)
			return;
		if (!event.shiftKey) {
			// 未按 Shift 清除选择态
			UI.from = UI.author + 1;
		}
		UI.author++;
		UI.redraw();
		break;
	case 38:
		// " /|\"
		// "  | "
		if (Music.music.length == 0)
			return;
		if (!event.shiftKey) {
			if (event.ctrlKey) {
				UI.switchLine(true);
				break;
			}
		}
		if (UI.author == Music.music.length)
			UI.author--;
		rect = UI.posAreas[Math.min(UI.author, Music.music.length)];
		UI.author = UI.getClosestNoteIn(rect.x, rect.midY - rect.height, true);
		if (!event.shiftKey) {
			UI.from = UI.author;
		}
		UI.refreshIME("");
		UI.redraw();
		break;
	case 40:
		// "  |	"
		// " \|/"
		if (Music.music.length == 0)
			return;
		if (!event.shiftKey) {
			if (event.ctrlKey) {
				UI.switchLine();
				break;
			}
		}
		rect = UI.posAreas[Math.min(UI.author, Music.music.length)];
		UI.author = UI.getClosestNoteIn(rect.x, rect.midY + rect.height + 40, true);
		if (!event.shiftKey) {
			UI.from = UI.author;
		}
		UI.refreshIME("");
		UI.redraw();
		break;

	case 65:
		//（Ctrl+）A
		UI.refreshIME("");
		if (Music.music.length == 0)
			return;
		if (event.ctrlKey) {
			UI.selStart = 0;
			UI.selEnd = Infinity;
			UI.redraw();
		} else {
			cancel = false;
		}
		break;
	case 35:
		//End
		UI.refreshIME("");
		if (Music.music.length == 0)
			return;
		if (!event.shiftKey) {
			UI.from = Music.music.length;
		}
		UI.author = Music.music.length;
		UI.refreshIME("");
		UI.redraw();
		break;
	case 36:
		//Home
		UI.refreshIME("");
		if (Music.music.length == 0)
			return;
		if (!event.shiftKey) {
			UI.from = 0;
		}
		UI.author = 0;
		UI.redraw();
		break;
	case 33:
		//Page UP
		UI.refreshIME("");
		if (Music.music.length == 0)
			return;

		rect = UI.posAreas[Math.min(UI.author, Music.music.length)];
		UI.author = UI.getClosestNoteIn(rect.x, rect.midY - window.innerHeight + 100, true);
		if (!event.shiftKey) {
			UI.from = UI.author;
		}

		UI.redraw();
		break;
	case 34:
		//Page Down
		UI.refreshIME("");
		if (Music.music.length == 0)
			return;

		rect = UI.posAreas[Math.min(UI.author, Music.music.length)];
		UI.author = UI.getClosestNoteIn(rect.x, rect.midY + window.innerHeight - 100, true);
		if (!event.shiftKey) {
			UI.from = UI.author;
		}

		UI.redraw();
		break;
	case 88:
		//(Ctrl+)X
	case 67:
		//(Ctrl+)C
		if (Music.music.length == 0)
			return;
		if (event.ctrlKey) {
			UI.copy();
			if (event.keyCode == 88) {
				UI.insertEdit([]);
				UI.from = UI.author = UI.selStart;
				UI.redraw();
			}
		} else {
			cancel = false;
		}
		break;
	case 86:
		//(Ctrl+)V
		if (event.ctrlKey && UI.editingLynicLine == -1) {
			UI.paste();
			UI.from = UI.author = UI.selStart + UI.clipboard.length;
		} else {
			cancel = false;
		}
		break;
	case 27:
		//Esc
		UI.refreshIME("");
		break;
	default:
		cancel = false;
		break;

	}

	if (cancel) {
		event.preventDefault();
		event.stopImmediatePropagation();
		event.stopPropagation();
	}
}
//全局快捷键！！！！
UI.onGlobalKeyDown = function(event) {
	var cancel = true;
	var start, end;
	start = Math.min(UI.selStart, UI.selEnd);
	end = Math.max(UI.selStart, UI.selEnd);
	//if(UI.selStart == UI.selEnd && UI.selEnd == -1)
	//	UI.selEnd = 0;

	switch (event.keyCode) {
		//快捷键
	case 78:
		//(Ctrl+)N
		if (event.ctrlKey)
			UI.new();
		else
			cancel = false;
		break;
	case 79:
		//(Ctrl+)O
		if (event.ctrlKey)
			UI.open();
		else
			cancel = false;
		break;
	case 83:
		//(Ctrl+)S
		if (event.ctrlKey)
			UI.saveAs();
		else
			cancel = false;
		break;
	default:
		cancel = false;
		break;

	}

	if (cancel) {
		event.preventDefault();
		event.stopImmediatePropagation();
		event.stopPropagation();
	}
}
UI.refreshIME = function ui_refreshIME(value) {
	if (value != null)
		UI.editbox.value = value;
	UI.IMETip.innerText = UI.editbox.value;
}
/**
 * @callback mapTSFn
 * @param {Object} note      音符，传引用，可修改
 * @param {Boolean} isSingle 是光标吗？
 * @param {Number} id        第几个？
 */
/**
 * 对选区内每一项元素执行这一操作
 * @param {mapTSFn} fn
 */
UI.mapThroughSelection = function ui_mapThroughSelection(fn){
	var start = UI.selStart, end = UI.selEnd, isSingle = false;
	if(UI.selStart == UI.selEnd /* 没有选择 */){
		isSingle = true;
		start = Math.max(0, end - 1);
	}
	for(var i = start; i < end; i++){
		fn(Music.music[i], isSingle, i);
	}
}
UI.onInput = function ui_onInput(event) {
	//歌谱的输入方法
	//TODO: Check this after the UI.insertEdit
	UI.refreshIME();
	if (UI.editingLynicLine != -1) {
		//UI.refreshIME("");
		return;
	}
	var content = event.target.value;
	if (content == "")
		return;
	/* 转时值对应表 */{
		var extendTable = {};
		extendTable[2] = 4;		extendTable[4] = 8;		extendTable[8] = 16;	
		extendTable[16] = 24;	extendTable[24] = 32;
		var shortenTable = {};
		shortenTable[32] = 24;	shortenTable[24] = 16;	shortenTable[16] = 8;
		shortenTable[8] = 4;	shortenTable[4] = 2;
		var postTable = {};
		postTable[2] = 3;		postTable[3] = 2;		postTable[4] = 6;
		postTable[6] = 4;		postTable[8] = 12;		postTable[12] = 8;
		postTable[16] = 24;		postTable[24] = 16;
		var conventTable = {
			"-": extendTable,
			"/": shortenTable,
			"、": shortenTable,
			"=": shortenTable,
			".": postTable,
			"。": postTable
		};
	}
	var note, changedRender = false, changedLayout = false, changedRedraw = false;
	content = content.split("……").join("…").split("'").join("").toLowerCase().split("");
	for (var i = 0; i < content.length; i++) {
		var oneChar = content[i];
		var diffFrom;
		if (Music.music[UI.selEnd - 1] != null) {
			diffFrom = note = Music.music[UI.selEnd - 1].pitch;
			diffFrom += Music.music[UI.selEnd - 1].octave * 8;
		}
		switch (oneChar) {
		case "0":
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			note = Music.MusicNote();
			note.pitch = parseInt(oneChar);
			if (note.pitch > 7) {
				note.pitch -= 7;
			}
			note.length = UI.defaultLength;
			if (note.pitch != 0) {
				diffFrom -= note.pitch;
				if (diffFrom >= 5) {
					note.octave = 1;
				} else if (diffFrom <= -5) {
					note.octave = -1;
				}
			}

			UI.insertEdit([note]);
			if (UI.from == UI.author) {
				UI.from = ++UI.author;
			}
			UI.render.atOnce();
			Player.simplePlay(note.pitch, note.octave, note.shift);

			UI.refreshIME("");
			break;
		case "-":
		case "/":
		case "、":
		case "=":
		case ".":
		case "。":
			UI.mapThroughSelection(function(note){
				if (conventTable[oneChar][note.length]) {
					note.length = conventTable[oneChar][note.length];
					changedRender = true;
				}
			})
			UI.refreshIME("");
			break;
		case "*":
			UI.mapThroughSelection(function(note, isSingle){
				if (note.octave == 1)
					note.octave = 0;
				else
					note.octave++;
				changedRender = true;
				if(isSingle) Player.simplePlay(note.pitch, note.octave);
			});
			UI.refreshIME("");
			break;
		case "+":
		case "!":
		case "！":
			UI.mapThroughSelection(function(note, isSingle){
				if (note.octave == -1)
					note.octave = 0;
				else
					note.octave--;
				changedRender = true;
				if(isSingle) Player.simplePlay(note.pitch, note.octave);
			});
			UI.refreshIME("");
			break;
		case "`":
		case "~":
		case "·":  /* 延长声音！ */
			if (Music.music[UI.selEnd - 1] != null) {
				note = Music.MusicNote();
				note.pitch = Music.music[UI.selEnd - 1].pitch;
				note.octave = Music.music[UI.selEnd - 1].octave;
				note.length = UI.defaultLength;
				note.fx.extend = true;
				UI.insertEdit([note]);
				UI.from++;
				UI.author++;
			}
			event.target.value = "";

			break;
		case "^":
		case "…":  /* 连接连音符！ */
			UI.mapThroughSelection(function(note, isSingle, i){
				if(!isSingle && i == UI.selStart) return;
				if(isSingle  && UI.selEnd == 1) return;
				note.fx.extend = !note.fx.extend;
				changedRender = true;
			});
			event.target.value = "";

			break;
		case ":":
		case "：":
			var sid = Music.indexNoteInSection(UI.selEnd);
			if (sid == -1) sid = 0;
			var sid2 = Music.indexNoteInSection(UI.selStart);
			if (sid2 == -1) sid2 = 0;
			Music.loops[sid] == null && (Music.loops[sid] = {});
			Music.loops[sid2] == null && (Music.loops[sid2] = {});
			if(UI.selEnd == UI.selStart || sid == sid2){
				sid = Music.indexNoteInSection(UI.selEnd - 1);
				if (sid == -1)
					sid = 0;
				if (!Music.loops[sid].loop && !Music.loops[sid].do) {
					Music.loops[sid].loop = true;
				} else if (Music.loops[sid].loop && !Music.loops[sid].do) {
					Music.loops[sid].do = true;
				} else if (Music.loops[sid].loop && Music.loops[sid].do) {
					Music.loops[sid].loop = false;
				} else if (!Music.loops[sid].loop && Music.loops[sid].do) {
					Music.loops[sid].do = false;
				}
			} else {
				if(!Music.loops[sid].loop || !Music.loops[sid2].do){
					Music.loops[sid].loop = Music.loops[sid2].do = true;
				} else {
					Music.loops[sid].loop = Music.loops[sid2].do = false;
				}
			}
			
			event.target.value = "";

			UI.render();
			break;
		case "d":
		case "s":
		case "e":
		case "c":
		case "o":

			var cmd = content[i - 1] + content[i];
			var sid = Music.indexNoteInSection(UI.selEnd - 1);
			var map = {
				ds: "ds",
				dc: "dc",
				co: "coda",
				se: "segno"
			};
			if (sid == -1)
				sid = 0;
			cmd = cmd.toLowerCase();
			if (map[cmd] != null) {
				if (Music.loops[sid] == null)
					Music.loops[sid] = {};
				Music.loops[sid][map[cmd]] = !Music.loops[sid][map[cmd]];
				UI.render();
				event.target.readonly = "readonly";
				event.target.value = "";
				event.target.readonly = "";
			}

			break;
		case "|":
			var reg = /\|-(\d).*/;
			var lopId = reg.exec(content.join(""));
			if (lopId == null)
				return;
			lopId = lopId[1];
			if (lopId == null)
				return;
			var sid = Music.indexNoteInSection(UI.selEnd - 1);
			if (sid == -1)
				sid = 0;
			if (Music.loops[sid] == null)
				Music.loops[sid] = {};
			if (lopId == 0) {
				delete Music.loops[sid].house;
			} else {
				Music.loops[sid].house = [lopId];
			}

			UI.layout();
			event.target.value = "";
			content.shift();
			content.shift();
			break;
		case "b": /* 降记号！ */
			UI.mapThroughSelection(function(note){
				if(note.shift == 0) note.shift = -1;
				else note.shift = 0;
				changedRender = true;
				Player.simplePlay(note.pitch, note.octave, note.shift);
			});
			break;
		case "#": /* 升记号 */
			UI.mapThroughSelection(function(note){
				if(note.shift == 0) note.shift = 1;
				else note.shift = 0;
				changedRender = true;
				Player.simplePlay(note.pitch, note.octave, note.shift);
			});
			break;
		default:
			//event.target.value = "";

		}
	}
	if(changedRender){
		UI.render();
	} else if(changedLayout){
		UI.layout();
	} else if(changedRedraw){
		UI.redraw();
	}
	event.target.value = event.target.value.replace(/[^ds|\-0-9]/g, "");
	UI.refreshIME();
}
UI.onChangeListener = function ui_onChangeListener(event) {
	//TODO: Check this after spliceWord
	var content = event.target.value;
	if (content == "")
		return;
	if (content.length > 10) {
		content = content.replace(/\s/ig, "");
	}
	var start, end;
	start = UI.selStart;
	end = UI.selEnd;
	var howmany, index;
	if (start == end)
		howmany = 0,
		index = end;
	else
		howmany = end - start,
		index = start;
	if (UI.editingLynicLine == -1)
		UI.editingLynicLine = 0;
	console.log('content', content)
	UI.spliceWord(index, howmany, content);
	UI.selStart = UI.selEnd = content.length + start - (content.match(UI.symbols) ? content.match(UI.symbols).length : 0);
	UI.refreshIME("");
	UI.render();
}
UI.insertEdit = function ui_insertEdit(notes) {
	notes = notes.slice();
	Music.music = [].concat(Music.music.slice(0, UI.selStart), notes, Music.music.slice(UI.selEnd));
	UI.render();
}
UI.symbols = /[-abcdefghijklmnopqrstuvwxyz,.!'?，。；【】、！￥…（）—：“”’‘《》？]/ig;
// TODO: 重新编写这个方法
UI.spliceWord = function ui_spliceWord(index, howmany /* 删除计数 */ , str) {
	var items = [];
	var pushingSymbol = "";
	var char;
	var symbols = UI.symbols;
	var isPushing = true;
	var add = 0;
	if (str != "" && symbols.test(str.charAt(0)) && index >= 0) {
		UI.spliceWord(index - 1, howmany + 1, (Music.music[index - 1].word[UI.editingLynicLine] || ' ') + str);
		return;
	}
	// 分词
	for (var i = 0; i < str.length; i++) {
		char = str.charAt(i);
		console.log('char ', char);
		symbols.lastIndex = 0;
		if (symbols.test(char)) {
			if (items[items.length - 1] == null) {
				items[items.length - 1] = '';
			}
			console.log('append')
			items[items.length - 1] += char;
		} else {
			console.log('push')
			items.push(char);
		}
	}
	// 执行删除
	add = items.length;
	for (i = index + howmany; i < Music.music.length; i++) {
		items.push(Music.music[i].word[UI.editingLynicLine] || '');
		if (items[items.length - 1] == null) {
			items[items.length - 1] = '';
		}

	}
	// 执行添加
	for (i = 0; i < Music.music.length - index && i < items.length; i++) {
		Music.music[i + index].word[UI.editingLynicLine] = items[i];
	}
	// 清除后续空格
	for (i = index + items.length; i < Music.music.length; i++) {
		Music.music[i].word[UI.editingLynicLine] = "";
	}
	
	/* 至于拼音...平移就好。 */
	add -= howmany;
	for(i = 0; i < Music.music.length; i++){
		if(!Music.music[i].pinyin){
			Music.music[i].pinyin = [];
		}
	}
	if(add < 0){
		for(i = index + add; i <Music.music.length; i++){
			if(i + add < 0)continue
			Music.music[i+add].pinyin[UI.editingLynicLine] = Music.music[i].pinyin[UI.editingLynicLine];
		}
		for(i = Music.music.length + add; i < Music.music.length; i++){
			Music.music[i].pinyin[UI.editingLynicLine] = '';
		}
	} else if(add > 0){
		for(i = Music.music.length - 1; i >= index+add; i--){
			Music.music[i].pinyin[UI.editingLynicLine] = Music.music[i-add].pinyin[UI.editingLynicLine];
		}
		for(i = index; i < index+add && i < Music.music.length; i++){
			Music.music[i].pinyin[UI.editingLynicLine]='';
		}
	}
}
UI.getClosestNote = function ui_getClosestNote(clientX, clientY, toPosition) {
	var containerRect = UI.container.getBoundingClientRect();
	return UI.getClosestNoteIn(clientX - containerRect.left, clientY - containerRect.top, toPosition);
}
/**
 UI.getClosestNoteIn
 @param {Number} x 相对于画布横坐标
 @param {Number} y 相对于画布纵坐标
 @param {Boolean} toPosition 寻找一个位置还是一个音符？
 @returns {Number} 
 如果 toPosition == false, 找到的音符在数组中的下标；
 如果 toPosition == ture, 找到的位置。与 UI.from 遵守同一规则
 */
UI.getClosestNoteIn = function ui_getClosestNoteIn(x, y, toPosition){
	function getYDist(y, area){
		var top = area.y, bottom = area.y + area.height;
		if(y >= top && y <= bottom){
			return 0;
		} else if (y < top){
			return top - y;
		} else if(y > bottom){
			return y - bottom;
		} else {
			throw new Error("错误：试图检测一个不合常理的区域。");
		}
	}
	function getXDict(x, area){
		return Math.abs(x - area.midX);
	}
	function getDist(x, y, area){
		return getXDict(x, area) + getYDist(y, area) * 1e6;
	}
	var areas;
	var tmpArea;
	if(toPosition){
		areas = UI.posAreas;
	} else {
		areas = UI.domsAreas;
	}
	var minDis = 1e20, curDis, minId = -1;
	for(var i = 0; i < areas.length; i++){
		curDis = getDist(x, y, areas[i]);
		if(curDis < minDis){
			minDis = curDis;
			minId = areas[i].id;if(isNaN(minId)) debugger;
		}
	}
	return minId;
}

UI.delete = function ui_delete() {
	if (UI.editingLynicLine == -1) {
		UI.insertEdit([]);
	} else {
		UI.spliceWord(UI.selStart, UI.selEnd - UI.selStart, '');
		UI.render();
	}
}
UI.cut = function ui_cut() {
	UI.copy();
	UI.delete();
}
UI.copy = function ui_copy() {
	if (UI.editingLynicLine == -1) {
		UI.clipboard = Util.clone(Music.music.slice(UI.selStart, UI.selEnd));
	} else {
		var list = Music.music.slice(UI.selStart, UI.selEnd);
		list = list.map(function(a) {
			if (a.pitch == 0) {
				return '\n';
			}
			return a.word[UI.editingLynicLine] || '';
		}).join('').split(' ').join('');
		Util.copy(list);
	}
}
UI.paste = function ui_paste() {
	if (UI.editingLynicLine == -1) {
		if (UI.clipboard.length == 0)
			return;
		UI.insertEdit(Util.clone(UI.clipboard));
	} else {
		if (navigator.clipboard && navigator.clipboard.readText) {
			navigator.clipboard.readText().then(function(str) {
				return str;
			}, function(err) {
				return prompt('请在此处粘贴您的内容并点击确认。');
			}).then(function(str) {
				if (str) {
					UI.spliceWord(UI.selStart, UI.selEnd - UI.selStart - 1, str);
					UI.render();
				}
			});
		} else {
			var str = prompt('您要在这里插入？');
			if (str) {
				UI.spliceWord(UI.selStart, UI.selEnd - UI.selStart - 1, str);
				UI.render();
			}
		}

	}
}
UI.open = function ui_open() {
	UI.openBox.parentNode.reset();
	var file = Util.queries().music;

	if (file && file.length > 0) {
		PopupWindow.alert("请点击“新建”来开一个新窗口，而不是在这里直接打开。这是示例页面，您的数据可能会丢失。");
	} else {
		UI.openBox.click();
	}

}
UI.openListener = function ui_openListener(me) {
	if (!me.files) {
		throw "您的浏览器不支持打开本地文件。";
	}
	if (me.files && me.files[0]) {
		var reader = new FileReader();
		reader.readAsText(me.files[0]);
		reader.onload = function() {
			UI.openFile(reader.result);
		}
		;
		openFailedCount = 0;
	} else {
		if (++openFailedCount > 1) {
			PopupWindow.alert("您已经连续两次没有选择文件，如果你无法打开，或许你该换个浏览器。");
		}
	}
}
UI.openFile = function ui_openFile(datastr) {
	try {
		if (datastr.indexOf("<scr" + "ipt>") > 0) {
			datastr = datastr.split("<scr" + "ipt>")[1].split("</scr" + "ipt>")[0];
		}
		var data = JSON.parse(datastr);
		if (data.music == null) {
			PopupWindow.alert("这个文件里存的东西我用不了，抱歉。");
			return;
		}
		data.music = data.music.map(function(item) {
			if (typeof item.word == "string") {
				item.word = item.word.split("");
			}
			return item;
		});
		for (var i in data) {
			Music[i] = data[i];
		}
		if(window.Player)window.Player.highLight=[];
		UI.render();
		UI.authorArea.value = Music.author;
		document.title = Music.title + ' - 傻瓜弹曲';
		UI.titleBox.value = Music.title;
		UI.arpeggioBox.value = Music.arpeggio;
		UI.tempo0Box.value = Music.tempo[0];
		UI.tempo1Box.value = Music.tempo[1];
		UI.speedBox.value = Music.speed;
	} catch (e) {
		PopupWindow.alert("这个文件里存的东西我用不了，抱歉。");
		console.error(e);
	}

}
UI.outString = function ui_tostring() {
	var temp = {
		title: "",
		author: "",
		music: [],
		tempo: [4, 4],
		speed: 120,
		arpeggio: 0,
		setting: {},
		loops: [],
	};
	if (Music.title.replace(/\s/g, "") == "")
		Music.title = "未命名歌曲";
	var content = Util.templateClone(Music, temp);
	/* 在保存之前清理多余的属性 */
	/* TODO: 日后不添加这些属性 */
	content.music.forEach(function(a) {
		delete a.rawIndex;
		while (a.word.length > 0) {
			if (!a.word[a.word.length - 1]) {
				a.word.pop();
			} else if (a.word[a.word.length - 1].trim() == '') {
				a.word.pop();
			} else {
				break;
			}
		}
	});
	return JSON.stringify(content);
}
UI.saveAs = function ui_saveAs() {
	if (Music.title.replace(/\s/g, "") == "")
		Music.title = "未命名歌曲";
	var a = document.createElement("a");
	a.style.display = "none";
	a.download = Music.title + ".htm";
	a.href = location.href;
	//a.href = "./caller.htm";
	var content;
	try {
		localStorage.saved = content;
	} catch (e) {
		console.warn("localStorage 拒绝访问。这应该不是什么天大的事情。");
		console.warn(e);
	}
	content = "<!DOCTYPE html>\n<meta charset=\"utf-8\"/>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<style>\n*{\n  text-align: center;\n}\nbody{\n  max-width:500px;\n  margin:auto;\n  padding:5px;\n}\nh1{\n  font-weight: 300;\n}\na {\n  display:inline-block;\n  background: #3498db;\n  background-image: linear-gradient(to bottom, #3498db, #2980b9);\n  border-radius: 999px;\n  text-shadow: 1px 1px 3px #666666;\n  box-shadow: 0px 1px 3px #666666;\n  color: white;\n  font-size: 20px;\n  padding: 10px 20px 10px 20px;\n  border: solid #1f628d 2px;\n  text-decoration: none!important;\n}\na:hover {\n  background: #3cb0fd;\n  background-image: linear-gradient(to bottom, #3cb0fd, #3498db);\n}\nli{\n  font-size: small;\n  color:gray;\n  text-align: left;\n}\n</style>\n<p>本文件是“傻瓜弹曲”的歌谱文件，它记录着一首歌，名叫：</p>\n<h1>%title%</h1>\n<a href=\"%url%#data=%tdata%\">点击此处查看歌谱</a>\n<br>\n<br>\n<hr>\n<ol>\n  <li>如果弹出“打开方式”对话框，请选择浏览器。</li>\n  <li>如果上面的按钮不能正常工作，请换用“浏览器”、“HTML 查看器”等打开本文件，或者在傻瓜弹曲网站（%url%）中，文件 -> 打开。</li>\n</ol>\n<scr" + "ipt>%data%</scr" + "ipt>";
	content = content.replace(/%url%/g, a.href.split('#')[0].split('?')[0]).replace("%data%", UI.outString()).replace("%title%", Music.title).replace("%tdata%", encodeURIComponent(UI.outString()));
	Util.saveAs(content, 'text/html', a.download);
}
UI.new = function ui_new(action) {
	var file = Util.queries().music;
	if (action == "force") {
		localStorage.open = 'new';
		window.open(location.href.split('?')[0].split('#')[0], '_self', 'toolbar=no');
		return;
	} else if (action == "view") {
		window.open(location.href.split('?')[0].split('#')[0], '_blank', 'toolbar=no');
		return;
	}
	if (file && file.length > 0) {
		dom = document.createElement("div");
		dom.className = "window destroy on";
		dom.innerHTML = '<div class="windowtitle">' + '来自网页的消息 <button class="close"><b>×</b></button>' + '</div>' + '<div class="content">' + '<div class="msg">' + '<p>您现在正在查看示例页面。</p>' + '<ul>' + '<li>' + '<a href="javascript:;" onclick="UI.new(this.className)" class="force">继续新建文件</a><br>' + '- 您未保存的数据将会丢失' + '</li>' + '<li>' + '<a href="javascript:;" onclick="UI.new(this.className)"  class="view">检查您未保存的文件</a><br>' + '</li>' + '</ul>' + '</div>' + '<center>' + '<button onclick="PopupWindow.close(this.parentElement.parentElement.parentElement)">' + '知道了' + '</button>' + '</center>' + '</div>';
		//dom.querySelector(".msg").innerHTML = msg.split("\n").join("<br>");
		document.body.appendChild(dom);
		PopupWindow.open(dom);
	} else {
		confirm('确认放弃未保存的修改并清空文档？') && UI.new("force");
	}
}
UI.onContextMenu = function ui_onContextMenu(event) {
	var winwidth = window.innerWidth;
	var winheight = window.innerHeight;
	UI.contextMenu.style.display = "block";

	var rect = UI.contextMenu.getBoundingClientRect();
	UI.contextMenu.style.left = Math.min(innerWidth - (rect.right - rect.left), event.clientX) + "px";
	UI.contextMenu.style.top = Math.min(innerHeight - (rect.bottom - rect.top), event.clientY) + "px";
	event.preventDefault();
}
UI.setEditor = function ui_setEditor() {
	/* Shift 状态处理 */
	/* 一些移动设备在选择的时候发送如下序列： */
	/* 
		按下 Shift 键，
		按下 方向 键 （ShiftKey 不真！）。
		松开 Shift 键，

 		事实上这个 Bug 影响了浏览器原生行为
	*/
	document.addEventListener("keydown", function(event) {
		UI.isShiftDown = event.shiftKey;
	});
	document.addEventListener("keyup", function(event) {
		UI.isShiftDown = event.shiftKey;
	});

	/* 鼠标拖选处理——记录拖选状态 */
	document.addEventListener("mousedown", function ui_capture_mouse(event) {
		if (event.button == 0)
			UI.isSelectMouseDown = true;
	});
	document.addEventListener("mouseup", function ui_release_mouse() {
		UI.isSelectMouseDown = false;
	});

	/* 鼠标拖选处理——计算位置 */
	document.addEventListener("mousedown", function ui_mousedown_to_(event) {
		if (Music.music.length == 0) {
			return;
		}
		if (!UI.container.contains(event.target) && event.target != document.documentElement && event.target != document.body) {
			return;
		}
		if (event.button >= 1) {
			return;
		}
		UI.lastClickedNotePos = [event.clientX, event.clientY];
		if (UI.isShiftDown) {//UI.from = UI.oldSelStart
		} else {
			//UI.oldSelStart = UI.from = UI.author = UI.getClosestNote(event.clientX, event.clientY, true);
			UI.from = UI.author = UI.getClosestNote(event.clientX, event.clientY, true);
			//UI.from = UI.author = UI.getClosestNote(event.clientX, event.clientY);
			var heightYin = UI.yinheight || 28;
			//var eleArea = document.querySelector(".geci").getBoundingClientRect();
			var heightWord = UI.ciheight;
			var author = Math.min(UI.author, Music.music.length - 1)
			var h = event.clientY - UI.domsAreas[author].y - UI.container.getBoundingClientRect().top;
			/* 特殊情况：如果光标在最后一列，会定位到下面一行的音，从而 h < 0 */
			if(h < 0 && author > 0){
				h = event.clientY - UI.domsAreas[author - 1].y - UI.container.getBoundingClientRect().top;
			}
			if(h < 0) h = 0;
			if (h > heightYin && Music.music[author]) {
				UI.editingLynicLine = Math.min(parseInt((h - heightYin) / heightWord)
				, UI.domsAreas[author].y==UI.domsAreas[UI.domsAreas.length-1].y ? Math.max(UI.editingLynicLine,Music.music[author].word.length) : 999
				);
				UI.redraw();
			} else {
				UI.editingLynicLine = -1;
			}
		}
		UI.editbox.focus();
		UI.editbox.value = "";
		UI.refreshIME();
		//setTimeout(function(){ UI.redraw()},0);
	});
	document.addEventListener("mousemove", function ui_selecter(event) {
		if (!UI.container.contains(event.target) && event.target != document.documentElement && event.target != document.body) {
			return;
		}
		if (UI.isSelectMouseDown) {
			var myid = UI.getClosestNote(event.clientX, event.clientY, true);
			//debugger;
			UI.author = myid;
			if (event.clientY < 10) {
				window.scrollBy(0, -10);
			}
			if (event.clientY > UI.statusbar.getBoundingClientRect().top - 10) {
				window.scrollBy(0, 10);
			}
			UI.redraw();
		}
	});
	document.addEventListener("click", function ui_click_focus_textbox(event) {
		if (!UI.container.contains(event.target) && event.target != document.documentElement && event.target != document.body) {
			return;
		}
		UI.editbox.focus();
	});
	document.addEventListener("mouseup", function ui_move_caret(event) {
		if (UI.lastClickedNotePos == null)
			return;
		if (Math.abs(UI.lastClickedNotePos[0] - event.clientX) + Math.abs(UI.lastClickedNotePos[1] - event.clientY) > 10)
			return;
		//if (event.button >= 1)
		//	return;
		if (!Music.music.length)
			return;
		var myid = UI.getClosestNote(event.clientX, event.clientY, true);
		//var rect = UI.domsAreas[Math.min(myid]
		//var mid = rect.x + rect.width /2;
		//if(mid + UI.container.getBoundingClientRect().left > event.clientX){
		//	UI.author = myid;
		//}else{
		//	UI.author = myid+1;
		//}
		//UI.from = UI.author;

		if (UI.isShiftDown) {
			UI.author = myid;
		} else {
			UI.from = UI.author = myid;
		}
		UI.redraw();
	});
	UI.container.addEventListener("contextmenu", UI.onContextMenu);
	document.addEventListener("click", function ui_click_to_hide_menu() {
		setTimeout(function() {
			UI.contextMenu.style.display = "none";
		}, 1);
	});
	document.oncontextmenu = function ui_to_disable_native_menu() {
		return event.target.matchesSelector("input,textarea");
	}
	;
	UI.editbox.addEventListener("keydown", UI.onKeyDown);
	UI.editbox.addEventListener("input", function(){
		UI.refreshIME();
	});
	document.addEventListener("keydown", UI.onGlobalKeyDown);
	Util.onCJKInput(UI.editbox, UI.onInput);
	UI.editbox.addEventListener("focus", function show_caret() {
		UI.caretStyle.innerHTML = "";
	});
	UI.editbox.addEventListener("blur", function hide_caret() {
		UI.caretStyle.innerHTML = ".caret{display:none!important}";
	});
	Util.onCJKInput(UI.editbox, function input_lynic(e) {
		if (UI.editingLynicLine > -1) {
			UI.onChangeListener(e);
		}
	});

	//FUCK~~~
	//FIXME
	//setInterval(function(){UI.refreshIME();},100);
}
UI.writeBack = function ui_write_back() {
	/* 把音乐的基本参数从对话框写到Music对象里面 */
	UI.titleBox.value = Music.title;
	UI.arpeggioBox.value = Music.arpeggio;
	UI.tempo0Box.value = Music.tempo[0];
	UI.tempo1Box.value = Music.tempo[1];
	UI.speedBox.value = Music.speed;
	switch (Music.tempo[0]) {
	case 2:
	case 4:
	case 8:
		break;
	default:
		Music.tempo[0] = 4;
		UI.statusbar.querySelector("div").innerText = "暂不支持其他拍号，将自动设置为4。";
	}
	switch (Music.tempo[1]) {
	case 1:
	case 2:
	case 3:
	case 4:
	case 6:
	case 8:
	case 12:
		break;
	default:
		Music.tempo[1] = 4;
		UI.statusbar.querySelector("div").innerText = "暂不支持其他拍号，将自动设置为4。";
	}
	if(Music.loops.length > Music.sections.length){
		Music.loops.length = Music.sections.length
	}

	document.querySelector(".tempo0").value = Music.tempo[0];
	document.querySelector(".tempo1").value = Music.tempo[1];
}
UI.main = function ui_main() {
	window.addEventListener("beforeprint", function print_relayout(event) {
		document.body.className += " print";
		UI.container.getBoundingClientRect();
		UI.layout();
		UI.container.getBoundingClientRect();
	});
	window.addEventListener("afterprint", function print_relayout(event) {
		document.body.className = document.body.className.replace("print", "").replace("  ", " ");
		UI.container.getBoundingClientRect();
		UI.layout();
		UI.container.getBoundingClientRect();
	});
	var width = 0;
	window.addEventListener("resize", function() {
		var oldScroll = UI.shouldScroll;
		UI.shouldScroll = false;
		if (!(width == window.innerWidth) && !(width > 1000 && window.innerWidth > 1000)) {
			UI.layout();
			width = window.innerWidth;
		}
		UI.shouldScroll = oldScroll;
	});
	width = window.innerWidth;
	//动态隐藏光标，防止引起混乱。
	UI.caretStyle = document.createElement("style");
	UI.caretStyle.innerHTML = ".caret{display:none!important}";
	document.head.appendChild(UI.caretStyle);
	UI.setEditor();
	UI.render();

	/* 提升菜单栏触摸效果的Hack */
	Array.from(document.querySelectorAll('.line > .item')).forEach(function(ele) {
		ele.onclick = function() {}
		;
	});

	/*window.addEventListener("error", function (event) {
    PopupWindow.alert("程序出现错误，请保存文件并且查看控制台。");
  });*/
	window.addEventListener('load', function fn() {
		/*.TODO: 查找bug的真正原因 */
		try {
			UI.layout();
		} catch (e) {
			setTimeout(fn, 500);
			console.error(e);
		}
	});
	//All is inited；
	//打开指定文件
	var q = Util.queries();
	var file = q.music;
	if (file && file.length > 0) {
		//网络示例文件专属！
		var factFile = "music/" + file + ".json";
		var request = new XMLHttpRequest();
		request.open('GET', factFile, true);
		request.onload = function() {
			UI.openFile(request.responseText);
		}
		;
		request.send();
	} else {
		//只要不是示例文件！
		try {
			if (localStorage.open != null) {
				if (localStorage.open != 'new')
					UI.openFile(localStorage.open);
				localStorage.removeItem("open");
			} else if (q.data) {
				UI.openFile(decodeURIComponent(q.data));
				/* 减少特定情况下的浏览器卡死 */
				/* 希望能缓解历史记录混乱 */
				location.replace('#id-nonsense-' + (Math.random() * 100000).toFixed());
			} else if (localStorage.saved != null) {
				UI.openFile(localStorage.saved);
			}
			setInterval(function autosave() {
				var content = UI.outString();
				localStorage.saved = content;
			}, 1000);
		} catch (e) {
			console.error(e)
			console.warn("本地储存不能工作，为使程序运行，已创建假本地储存。");
			window.localStorage = {};
			localStorage.setItem = localStorage.removeItem = function() {}
			;
		}
	}
	try {
		//不在局域网环境下注册。
		if ((!(/(localhost|(\d{1,3}\.){3})/.test(location.host))) || location.hash.indexOf('test') > 0)
			navigator.serviceWorker.register('SerWork.js', {
				scope: './'
			}).then(function(r) {
				r.update()
			});
	} catch (e) {
		console.error(e);
	}

}
UI.about = function ui_about(url) {
	var ele = `<iframe src="${Util.t2h(url)}" style="width:calc(100vw - 4.3em);height:calc(100vh - 9.5em);max-width:30em; max-height: 20em;"></iframe>`;
	var dg = PopupWindow.alert(ele);
	var fr = dg.querySelector('iframe');
	fr.onload = function() {
		try {
			var list = fr.contentDocument.querySelectorAll('a:not(.nohack)');
			if (!list)
				return;
			Array.from(list).forEach(function(a) {
				if (a.hostname == location.hostname) {
					a.target = '_parent';
					a.onclick = function() {
						location.href = a.href;
						PopupWindow.alert('正在跳转中...')
						location.reload();
					}
				} else if (a.href.toLowerCase().indexOf('javascript:') != 0) {
					a.target = '_blank';
					a.onclick = function() {
						return confirm(`该网址“${Util.t2h(a.innerText)}”（${Util.t2h(a.href)}）不属于本网站，确定访问？`);
					}
				}
			});
		} catch (e) {
			console.log(e)
		}
	}
}
UI.editPinyinGUI = function ui_editPinyinGUI(id){
	var note = Music.music[id];
	var editAry ;
	console.log(Util.clone(note))
	if(!note.word) note.word = [];
	console.log(note.word,note)
	editAry = note.word.map(function(a,i){
		if(!a) return null;
		if(!a.trim || !(a.trim())) return null;
		if(!Pinyin.isHanzi(a.charAt(0))) return null;
		if(!note.pinyin)note.pinyin=[];
		console.log(note.pinyin)
		return {
			id: i,
			word: a,
			pinyin: note.pinyin[i] || ''
		}
	}).filter(function(a){
		return !!a;
	});
	var html = editAry.map(function(a){
		return '<tr><td>第'+(a.id+1)+'行</td><td>'+Util.t2h(a.word)+'</td><td><input type="text" maxlength="6" size="7" style="font-family: monospace" autocorrect="off" value="'+a.pinyin+'" autocapitalize="none" placeholder="'+Pinyin.getChar(a.word)+'" pattern="[a-z]*"></td></td></tr>';
	});
	html ='<div class="window on destroy"><div class="windowtitle">修改拼音</div><div class="content"><table>' + html + '</table><center><button id="ok">确定</button></center></div></div>';
	var a = Util.htmlNoId(html), dom=a.ele;
	document.body.appendChild(dom);
	PopupWindow.open(dom);
	a.ids.ok.onclick = function(){
		var list = Array.from(dom.querySelectorAll('input'));
		list.forEach(function(ip,i){
			Music.music[id].pinyin[editAry[i].id] = ip.value.toLowerCase().replace(/[^a-z]/g,'');
		})
		PopupWindow.close(dom);
	}
}
UI.releaseDownload = function(){
	window.data = null;
	PopupWindow.close(showDownloadWindow);
}
UI.tryDownload = function(){
	Util.saveAs(Player.bufferToWave(window.data), 'audio/wav', Music.title + '.wav');
}
UI.main();
