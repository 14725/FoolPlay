//Errors ->Move into "edit.htm"
//Shim
HTMLElement.prototype.matchesSelector = function() {
	var body = HTMLElement.prototype;
	return body.webkitMatchesSelector || body.msMatchesSelector || body.mozMatchesSelector || body.oMatchesSelector;
}();

//Utils
Util = {
	_orglisteners:[],
	_patchedlisteners:[],
};
Util.clone=function util_clone(a){
	//深复制对象
	//我不想管那一堆对象，当然，环我也不管，省事。:)
	var b;
	if(a.constructor == Array){
		b = [];
	}else{
		b = {};
	}
	for(var i in a){
		if(a[i]==null)break;
		if(a[i].constructor == Object || a[i].constructor == Array){
			b[i] = Util.clone(a[i]);
		}else{
			b[i] = a[i];
		}
	}
	return b;
};
Util.throttle=function util_throttle(func,that,delay){
	//节流，节流函数最快只能执行10Hz，不能保证实时性和被执行，但可能多余，否则导致页面锁定的情况。。
	if(!!delay)delay = 100;
	var _delay = 100;
	if(typeof delay == "function"){
		setInterval(function(){_delay = delay()},1000);
	}else{
		_delay = delay;
	}
	var timer = -1;
	
	if(that==null)
		that = null;
	var callit = function(){
		timer = -1;
		func.apply(that,Array.prototype.slice.call(arguments));
	};
	function throttledFunc(){
		if(timer == -1){
			//callit()
			timer = setTimeout(callit,_delay);
		}
	};
	throttledFunc.atOnce = callit;
	return  throttledFunc;
};
Util.css=function util_css(list,obj){
	var ary = Array.prototype.slice.call(list);
	for(var i in ary){
		for(var j in obj){
			ary[i].style[j] = obj[j];
		}
	}
};
Util.live=function util_live(eventName,parent,selector,listener){
	function patchedListener(event){
		var tmpEle = event.target;
		var ifMatched = false;
		while(tmpEle != parent && tmpEle != null){
			if(tmpEle.matchesSelector(selector)){
				ifMatched = true;
				break;
			}
			tmpEle = tmpEle.parentNode;
		}
		if(!ifMatched){
			return;
		}
		var fakeEvent = Util.clone(event);
		fakeEvent.target = tmpEle;
		fakeEvent.oriEvent = event;
		var rtn = listener(fakeEvent);
		if(rtn === false){
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
		}
	}
	parent.addEventListener(eventName,patchedListener);
};
Util.die=function util_die(eventName,parent,selector,listener){
	throw new Error("Util.die功能尚未实现");
};
Util.templateClone = function util_templateClone(raw,template){
	//目前浅复制
	var ans = {};
	for(var i in template){
		ans[i] = raw[i];
	}
	return ans;
};
Util.onCJKInput = function hack_composition(ele,listener){
	var isTyping = false;
	function inputListener(event){
		setTimeout(function(){
			if(!isTyping){
				listener(event);
			}
		},0)
	}
	function compositionListener(event){
		isTyping = (event.type.toLowerCase() == "compositionstart");
	}
	ele.addEventListener("input",inputListener);
	ele.addEventListener("compositionstart",compositionListener);
	ele.addEventListener("compositionend",compositionListener);
};
Util.queries = function queryString() {
	var str = location.href
	/* 检查URL参数 https://zhuanlan.zhihu.com/p/257077535 */
	var params = str.split('?')[1];
	if(params == null)    return {};
	var param = params.split('&');
	var obj = {};
	for (var i = 0; i < param.length; i++) {
		var paramsA = param[i].split('=');
		var key = decodeURIComponent(paramsA[0].split("+").join("%20"));
		var value = decodeURIComponent(paramsA[1].split("+").join("%20"));

		if (obj[key]) {
			/* 处理数组 */
			obj[key] = obj[key].join ? obj[key] : [obj[key]];
			obj[key].push(value);
		} else {
			obj[key] = value;
		}
	}
	return obj;
};

Util.copy = function util_copy(e) {
    let transfer = document.createElement('input');
    document.body.appendChild(transfer);
    transfer.value = e;  // 这里表示想要复制的内容
    transfer.focus();
    transfer.select();
    if (!document.execCommand('copy')) {
        PopupWindow.alert("错误：不能复制文本。")
    }
    transfer.blur();
    console.log('复制成功');
    document.body.removeChild(transfer);
    
}


var PopupWindow = {
	_windowDragging:null,
	_windowDraggingY:null,
	_windowDraggingX:null,
};
PopupWindow.open = function popupWindow_open(dom){
	dom.style.display = "block";
	var _rect = dom.getBoundingClientRect();
	dom.style.top = (window.innerHeight - (_rect.bottom-_rect.top))/2 + "px";
	dom.style.left = (window.innerWidth - (_rect.right-_rect.left))/2 + "px";
};
PopupWindow.close = function popupWindow_close(dom){
	dom.style.display = "none";
	if(dom.className.indexOf("destroy") > -1){
		dom.parentElement.removeChild(dom);
	}
};
PopupWindow.alert = function popupWindow_alert(msg){
	dom = document.createElement("div");
	dom.id = "PopupWindowAlert";
	dom.className = "window destroy on";
	dom.innerHTML = '<div class="windowtitle">来自网页的消息<button class="close"><b>×</b></button></div><div class="content"><div class="msg"></div><center><button onclick="PopupWindow.close(this.parentElement.parentElement.parentElement)">知道了</button></center></div>';
	dom.querySelector(".msg").innerHTML = msg.split("\n").join("<br>");
	document.body.appendChild(dom);
	PopupWindow.open(dom);
};
PopupWindow.main = function popupWindow_main(){
	Util.live("mousedown",document,".window .windowtitle",function set_flags(event){
		var onlist = Array.prototype.slice.call(document.querySelectorAll(".window.on"));
		onlist.forEach(function(item){
			item.classList.remove("on");
		});
		var _rect = event.target.parentNode.getBoundingClientRect();
		PopupWindow._windowDragging = event.target.parentNode;
		
		PopupWindow._windowDraggingX = event.clientX - PopupWindow._windowDragging.getBoundingClientRect().left;
		PopupWindow._windowDraggingY = event.clientY - PopupWindow._windowDragging.getBoundingClientRect().top;
	});
	Util.live("mousedown",document,".window",function set_flags(event){
		var onlist = Array.prototype.slice.call(document.querySelectorAll(".window.on"));
		onlist.forEach(function(item){
			item.classList.remove("on");
		});
		event.target.classList.add("on");
	});
	Util.live("click",document,".window .windowtitle .close",function set_flags(event){
		PopupWindow.close(event.target.parentNode.parentNode);
	});
	document.addEventListener("mousemove",function do_drag(){
		if(PopupWindow._windowDragging){
			var _rect = PopupWindow._windowDragging.getBoundingClientRect();
			PopupWindow._windowDragging.style.top = Math.min(Math.max(event.clientY - PopupWindow._windowDraggingY,0),window.innerHeight - (_rect.bottom-_rect.top)) + 'px';
			PopupWindow._windowDragging.style.left = Math.min(Math.max(event.clientX - PopupWindow._windowDraggingX,0),window.innerWidth - (_rect.right-_rect.left)) + 'px';
		}
	});
	document.addEventListener("mouseup",function clear_flag(){
		PopupWindow._windowDragging = null;
	});
};
PopupWindow.main();

//Music
var Music = {
	title:"",
	author:"",
	music:[],
	tempo:[4,4],
	speed:120,
	arpeggio:0,
	setting:{},
	loops:[],//{2:{do,loop,coda,segno,ds,dc,house:[]}}
	lenTempo:0,
	lenSection:0,
	sections:[],
	speedS:0,
};
Music.MusicNote = function(){//返回一个 MusicNote， 一个集合（假构造函数）
	return {
		pitch:1,
		octave:0,
		length:32,
		word:[],
		fx:{}
	};
};
Music.getLenSectionTempo = function music_getLenSectionTempo(){//功能：更新小节/节拍的长度
	Music.lenSection = 32/Music.tempo[0]*Music.tempo[1];
	Music.lenTempo = Music.lenSection/Music.tempo[1];
	if(Music.tempo[1]>3 && Music.tempo[1] % 3 == 0){
		Music.lenTempo *= 3;
	}
	Music.speedS = 60 / Music.speed / Music.lenTempo;
};
Music.indexNoteInSection = function music_indexNoteInSection(id){//根据音符确定小节
	var ans = -1;
	if(id < 0 && id > Music.music.length)
		return ans;
	for(var i = 0;i < Music.sections.length;i++){
		if(Music.sections[i][0].id > id){
			ans = i-1;
			return ans;
		}
	}
	if(Music.sections[i-1][0].id <= id)
		ans = i-1;
	return ans;
}
Music.split = function music_splitIntoMeasures(){//功能：把连续的音符序列分解为节拍
	//使用已刷新的数据
	Music.getLenSectionTempo();
	var leftThisSection = Music.lenSection;
	var i;
	var curLen = 0;
	var sections = Music.sections = [];
	var thisSection = [];
	for(i = 0;i < Music.music.length;i++){
		thisSection.push({note:Music.music[i],id:i});
		curLen += Music.music[i].length;
		if( Music.music[i].fx.triplets ){
			if(
				(i < Music.music.length-2) 
				&& (Music.music[i+1].length == Music.music[i+2].length) 
				&& (Music.music[i+2].length == Music.music[i].length) 
				&& ((Music.lenSection - curLen >=  Music.music[i].length))
			){
				curLen -= Music.music[i].length;
			}else{
				delete Music.music[i].fx.triplets;
			}
		}
		if(curLen == Music.lenSection){
			thisSection.attr = Music.loops[sections.length];
			sections.push(thisSection);
			thisSection = [];
			curLen = 0;
		}else if(curLen > Music.lenSection){
			UI.statusbar.querySelector("div").innerText = "警告：歌谱出现问题，不能按照小节渲染，请关注并修正歌谱。";
		}
	}
	if(thisSection.length > 0)
		sections.push(thisSection);
	
};
Music.flat = function music_flat(){//功能：返回去除反复记号的乐谱
	// Just Dummy now... TODO
	return Util.clone(Music.music)
}
//UI 
var UI = {
	container:document.querySelector(".container"),
	editbox:document.querySelector(".editbox"),
	IMETip:document.querySelector("#imetip"),
	statusbar:document.querySelector(".status"),
	coverOn:document.querySelector("#coverOn"),
	titleBox:document.querySelector(".title"),
	arpeggioBox:document.querySelector(".arpeggio"),
	speedBox:document.querySelector("#speed"),
	tempo0Box:document.querySelector(".tempo0"),
	tempo1Box:document.querySelector(".tempo1"),
	openBox:document.querySelector("#openFile"),
	contextMenu:document.querySelector("#contextMenu"),
	speedLabel:document.querySelector('#speedLabel'),
	authorArea:document.querySelector('.author'),
	//selStart:-1,
	//selEnd:-1,
	from:-1,
	author:-1,
	get selStart(){
		return this.from;
	},
	set selStart(v){
		this.from = v;
	},
	get selEnd(){
		return this.author;
	},
	set selEnd(v){
		this.author = v;
	},
	isMouseDown:false,
	domsAreas:-1,
	clipboard:[],
	domList:Array.prototype.slice.call(document.querySelectorAll(".note")),
	defaultLength:8,
	isShiftDown:false,
	openFailedCount:0,
	oldSelStart:0,
	lastClickedNotePos:null,
	editingLynicLine:-1,
	caretStyle:null,
	ciheight:0,
	yinheight:0,
	shouldScroll:true,
};
UI.render = Util.throttle(function ui_render(){//功能：刷新歌谱的主要内容，会继续调用 UI.layout
	

	//准备进行处理，更新节拍数据
	Music.getLenSectionTempo();
	UI.statusbar.querySelector("div").innerText = "就绪";
	
	//刷新速度前面的标签
	var syms = {"4":"♪", "12":"♪.", "8":"♩", "24":"♩." };
	var speedText = syms[ "" + Music.lenTempo ];
	//防止未知节拍查不到数据
	if( !speedText )	speedText = '速度';
	UI.speedLabel.innerText = speedText + '=';
	
	//开始拼接HTML
	var html = [];
	var leftThisSection = Music.lenSection;
	var i;
	var curLen = 0;
	var sectionsHTML = [];
	var thisSectionHTML = [];
	Music.split();

	
	sectionsHTML = Music.sections.map(function(item,id){
		var curLen = 0;
		var thisSectionHTML = [];
		var startHTML = "<div class=\"measure %CLASS%\"><div class=\"sectionLine\"></div>";
		var endHTML = "<div class=\"sectionLine\"></div></div>";
		var className = [];
		//对每一个音符拼接HTML，并统计时间长度，以便宽松按节拍添加空格
		for(i = 0;i < item.length;i++){
			thisSectionHTML.push(UI.getHTMLforNote(item[i].note,item[i].id));
			curLen += item[i].note.length;
			if( item[i].note.fx.triplets ){
				if(
					(i < item[i].note.length-2) 
					&& (item[i+1].note.length == item[i+2].note.length) 
					&& (item[i+2].note.length == item[i].note.length) 
					&& ((Music.lenSection - curLen >=  item[i].note.length))
				){
					curLen -= item[i].note.length;
				}
			}
			if(curLen % Music.lenTempo == 0 && curLen != Music.lenSection){
				thisSectionHTML.push("<div class=\"space\"></div>");
			}
		}
		//处理反复记号显示
		if(item.attr){
			(["do","loop","ds","dc","coda","segno"]).forEach(function(n){
				if(item.attr[n])	className.push(n)
			});
		}
		//添加类名，并且拼接HTML
		startHTML = startHTML.replace("%CLASS%",className.join(" "));
		return startHTML +  thisSectionHTML.join("") + endHTML;
	})
	//TODO: 部分替换，并测量性能
	html.push(sectionsHTML.join(" ") );
	UI.container.innerHTML = html.join("");
	if(UI.shouldScroll)
	    UI.throttledLayout();
	else
	    UI.layout();
},null,function(){return Music.music.length;});

UI.layout = function ui_layout(){//功能：读取浏览器对歌谱的布局，
	//重绘光标
	[].slice.call(UI.coverOn.querySelectorAll(".cline")).forEach(function(a){a.parentNode.removeChild(a)});
	//定位
	//	获取全部的DOM元素列表
	var list = UI.domList = Array.prototype.slice.call(document.querySelectorAll(".note"));
	var rect;
	UI.domsAreas = [];
	list.forEach(function(dom){
		//去除选择态
		var id= parseInt(dom.dataset.id);
		//获取对应的ID
		if(!UI.domsAreas[id]){
			//不存在：添加这个音符的区域
			UI.domsAreas[id] = {
				x:dom.offsetLeft,
				y:dom.offsetTop,
				width:dom.offsetWidth,
				height:dom.offsetHeight,
				midX:dom.offsetLeft + dom.offsetWidth / 2,
				midY:dom.offsetTop + dom.offsetHeight / 2
			}
		}else{
			//存在：与上一个合并
			UI.domsAreas[id].width = dom.offsetLeft + dom.offsetWidth - UI.domsAreas[id].x
		}
	})
	//获取音符实际占用的高度
	if(UI.yinheight == 0 && UI.domList[0]) UI.yinheight = parseFloat( getComputedStyle( UI.domList[0].querySelector(".acnote")).height);
	//获取歌词区域的高度
	if((UI.ciheight == 0 || isNaN(UI.ciheight)) && UI.domList[0]) UI.ciheight = parseFloat( getComputedStyle( UI.domList[0].querySelector(".geci")).height);

	// ??
	UI.redraw()
	//特殊标记
	Music.music.forEach(function(note,id){
		if(id==0)return;
		if(note.fx.extend)	UI.appendCLine(id-1,id)										//延音线
		if(note.fx.triplets && id < Music.music.length - 2)	UI.appendCLine(id,id+2,"3")	//三连音符号
	})
	//房子的绘制
	Music.sections.forEach(function(item){
		if(item.attr && "house" in item.attr){
			UI.appendCLine(item[0].id,item[item.length-1].id,item.attr.house.join(","),true)
		}
	})	
}
UI.throttledLayout = UI.layout;
UI.redraw = function ui_redraw(){
	var temp,isreved = false;
	
	var yinheight,ciheight;
	//清除选择态
	Array.prototype.slice.call(document.querySelectorAll(".selected")).forEach(function(dom){
		dom.className = dom.className.replace("selected","").replace("  "," ")
	})
	//限制选区范围到合理位置：
	//setStart	: 选取开始的音符的左边，约定-1为没有选区;
	//selEnd	: 选取结束的音符的右边，约定最左边为-1;
	if(UI.selStart < -1)	UI.selStart = -1;
	if(UI.selStart >= Music.music.length)	UI.selStart = Music.music.length - 1;
	if(UI.selEnd < -1)	UI.selEnd = -1;
	if(UI.selEnd >= Music.music.length)	UI.selEnd = Music.music.length - 1;
	//显示光标
	caret.style.display = "block";
	if(UI.selStart != -1){
		//UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = "0";
		//有选择区域：绘制选择拖蓝
		if(UI.selStart > UI.selEnd){
			//确保选区头部 < 尾部
			temp = UI.selStart;	UI.selStart = UI.selEnd; UI.selEnd = temp;
			isreved = true;
		}
		UI.domList.forEach(function(dom,index){
			if(index < id)	return;
			var id= parseInt(dom.dataset.id);
			if(id >= UI.selStart && id <= UI.selEnd){
				if(UI.editingLynicLine == -1){
					dom.className += " selected"
				}else{
					if(dom.children.length > UI.editingLynicLine+1)
						dom.children[UI.editingLynicLine+1].className += " selected";
				}
			}
		});
		//隐藏光标
		caret.style.display = "none";
	}
		
		
	if(Music.music.length == 0){
		UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = "0";
		caret.style.height = "40px";
	}else{
		yinheight = 40;
		ciheight = UI.ciheight;
		UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = "0";
		if(UI.selEnd != -1){
			UI.IMETip.style.left = UI.editbox.style.left = caret.style.left = UI.domsAreas[UI.selEnd].x + UI.domsAreas[UI.selEnd].width + "px"
		}
		if(UI.editingLynicLine == -1){
			//在音符级别
			UI.IMETip.style.top = UI.editbox.style.top = caret.style.top = (UI.selEnd == -1 ? 0 : UI.domsAreas[UI.selEnd].y) + "px";
			caret.style.height = yinheight + "px";
		}else{
			//在歌词级别
				UI.IMETip.style.top = UI.editbox.style.top = caret.style.top = (
				UI.domsAreas[Math.max(UI.selEnd,0)].y + UI.yinheight + 
					ciheight * UI.editingLynicLine 
				) + 
			"px";
			caret.style.height = ciheight + "px";
		}
	}	
	if(isreved){
		temp = UI.selStart;	UI.selStart = UI.selEnd; UI.selEnd = temp;
	}
	if(UI.shouldScroll)    UI.autoScroll();
}
UI.autoScroll = function ui_autoScroll(){
	//Scroll
	var containerTop = UI.container.offsetTop - window.pageYOffset;
	var statusbarTop = UI.statusbar.getBoundingClientRect().top
	if(Music.music.length){
		if(UI.selEnd > -1){
			if(UI.domsAreas[UI.selEnd].y + UI.domsAreas[UI.selEnd].height + containerTop > statusbarTop){
				//窗口边缘下面
				UI.domList.every(function(item,index){
					if(index < UI.selEnd)	return true;
					if(item.dataset.id == UI.selEnd){
						item.scrollIntoView(false);
						window.scrollBy(0,+30);
						return false;
					}
					return true;
				});
			}else if(UI.domsAreas[UI.selEnd].y + containerTop < 30){
				//窗口边缘上面
				if(UI.domsAreas[UI.selEnd].y == 0){
					window.scroll(0,0);
					return;
				}
				UI.domList.every(function(item, index){
					if(index < UI.selEnd)	return true;
					if(item.dataset.id == UI.selEnd){
						item.scrollIntoView(true);
						window.scrollBy(0,-30);
						return false;
					}
					return true;
				})
			}
		}else if(UI.selEnd == -1){
			//无选择, 光标在最上面
			window.scroll(0,0);
		}
	}
};
UI.appendCLine = function ui_appendCLine(pid,nid,word,ishouse){
	if(word == null)	word="";
	var className = ishouse ? "house" : "cline";
	var parea = UI.domsAreas[pid];
	var narea = UI.domsAreas[nid];
	if(parea.y == narea.y){
		clinedom = document.createElement("div");
		clinedom.innerText = word;
		clinedom.className = className;
		clinedom.style.left = (ishouse?parea.x:parea.midX)+"px";
		clinedom.style.top = (parea.y)+"px";
		clinedom.style.width = narea.x - parea.x + (ishouse?narea.width:0) + "px";
		UI.coverOn.appendChild(clinedom);
	}else{
		clinedom = document.createElement("div");
		clinedom.className = className;
		clinedom.style.left = (parea.midX)+"px";
		clinedom.style.top = (parea.y)+"px";
		clinedom.style.width = (parea.width) +"px";
		if(!ishouse)
			clinedom.style.borderRadius = "10px 0 0 0"
		UI.coverOn.appendChild(clinedom);
		if(ishouse)	return;
		clinedom = document.createElement("div");
		clinedom.className = "cline";
		clinedom.style.left = (narea.midX-5)+"px";
		clinedom.style.top = (narea.y)+"px";
		clinedom.style.width = "5px"
		clinedom.style.borderRadius = "0 10px 0 0"
		UI.coverOn.appendChild(clinedom);
	}
	
}
UI.getHTMLforNote = function ui_getHTMLforNote(note,id){
	var html = "";
	var className = "";
	var appendedHTML = "";    
	note.pitch = parseInt(note.pitch);
	if(note.pitch == null)
		note.pitch = 1;
	text = (note.pitch = Math.max(Math.min(note.pitch ,7),0)).toString();
	var addTimeLine = note.pitch=="0"?"0":"–"
	switch(note.length){
		case 2:	className += "f16";break;
		case 3:	//	1.
				//	==
			className += "f16";
			appendedHTML += UI.getHTMLUnit(className,"·",note.word,id);
			break;
		case 4:	className += "f8";break;
		case 6:	//	1.
				//	--
			className += "f8";
			appendedHTML += UI.getHTMLUnit(className,"·",[],id);
			break;
		case 8:	break;
		case 12://	1.
			appendedHTML += UI.getHTMLUnit(className,"·",[],id);
			break;
		case 16://	1-
			appendedHTML += UI.getHTMLUnit(className,addTimeLine,[],id);
			break;
		case 24://	1--
			appendedHTML += UI.getHTMLUnit(className,addTimeLine,[],id);
			appendedHTML += UI.getHTMLUnit(className,addTimeLine,[],id);
			break;
		case 32://	1---
			appendedHTML += UI.getHTMLUnit(className,addTimeLine,[],id);
			appendedHTML += UI.getHTMLUnit(className,addTimeLine,[],id);
			appendedHTML += UI.getHTMLUnit(className,addTimeLine,[],id);
			break;
		default:
			note.length = 8;
			break;
	}
	switch(note.octave){
		case 1:className += " hasupo ";break;
		case -1:className += " hasdo ";break;
	}
	html = UI.getHTMLUnit(className,note.pitch,note.word,id) + appendedHTML;
	return html;
}
UI.getHTMLUnit = function ui_getHTMLUnit(classes,pitch,word,id){
	var regp = /(，|。|？|：|！|“|”|、|；)/g
	return ('<div class="note $classes" data-id="$id"><div class="acnote"><div class="upo"></div><div class="yin">$pitch</div><div class="minusline"></div><div class="downo"></div></div><div class="geci">$word</div></div>')
		.split("$classes").join(classes)
		.split("$pitch").join(pitch)
		.split("$word").join(word.join("</div><div class=\"geci\">")
		.replace(regp,"<span style='position:absolute;'>$1</span>"))//移除标点符号空间
		.split("$id").join(id);
}
UI.switchLine = function ui_switchLine(up){
	if(UI.selEnd == -1){
		UI.selEnd = 0;
		UI.switchLine(up);
		UI.selEnd = -1;
		UI.redraw();
		return;
	};
	var oldscrPos = document.documentElement.scrollTop || document.body.scrollTop;
	var oldelePos = UI.domsAreas[UI.selEnd].y ;
	var changed = false;
	if(up){
		if(UI.editingLynicLine <= 0){

			UI.editingLynicLine = 0;
		}
		Music.music.forEach(function(item){
			var words = item.word;
			var word = "";
			for(var i = words.length;i>=UI.editingLynicLine;i--){
				word = words[i];
				if(word == null){
					word = words[i] = "";
					changed = true;
				}	
				if(word.replace(/\s/gi,"") == ""){
					words.length = Math.max(words.length-1,0);
					changed = true;
				}else{
					break;
				}
			}
		});
		UI.editingLynicLine--;
		
	}else{
		UI.editingLynicLine++;
		Music.music.forEach(function(item){
			var words = item.word;
			var word = "";
			for(var i = 0;i<=UI.editingLynicLine;i++){
				word = words[i];
				changed = true;
				if(word == null){
					words[i] = "";
				}
			}
		});
	}
	UI.shouldScroll = false;
	if(changed)    UI.render.atOnce();
	else            UI.layout();
	UI.shouldScroll = true;
	var scrPos = Math.max(document.documentElement.scrollTop || document.body.scrollTop);
	var elePos = UI.domsAreas[UI.selEnd].y;
	if((up && elePos < oldelePos) || (!up && elePos > oldelePos)){
		window.scrollBy(0,+(elePos-oldelePos))
	}
}
UI.onKeyDown = function ui_onKeyDown(event){
	var cancel = true;
	var start,end;
	start	= Math.min(UI.selStart,UI.selEnd);
	end		= Math.max(UI.selStart,UI.selEnd);
	//if(UI.selStart == UI.selEnd && UI.selEnd == -1)
	//	UI.selEnd = 0;
	if(event.keyCode==13){
		UI.switchLine();
		UI.onChangeListener(event);
		return;
	}
	
	
	
	switch(event.keyCode){
		
		//现在删除的行为有些复杂，所以暂时注释掉。
		//Delete
		case 8://Backspace
			if(UI.editbox.value != ""){
				UI.refreshIME("");
			}
			if(Music.music.length == 0)return;
			if(UI.selEnd == -1)return;
			if(UI.selStart <= -1){//没有选择
				if(UI.editingLynicLine == -1){
					if(Music.music[UI.selEnd].length % 3 ==0)
						Music.music[UI.selEnd].length = Music.music[UI.selEnd].length / 3 * 2;
					else if(Music.music[UI.selEnd].length > UI.defaultLength)
						Music.music[UI.selEnd].length -= UI.defaultLength;
					else{
						UI.selStart = UI.selEnd;
						UI.insertEdit([]);
					}
				}else{
					UI.spliceWord(UI.selEnd,1,"");
					UI.selEnd--;
				}
			}else{
				if(UI.editingLynicLine == -1){
					UI.insertEdit([]);
				}else{
					UI.spliceWord(start,end-start +1 ,"");
					UI.selStart = -1;
					UI.selEnd 	= start - 1;
				}
			}
			UI.render();
			break; 
		case 46://Delete
			if(UI.editbox.value != ""){
				UI.refreshIME("");
			}
			if(UI.selStart <= -1)
				UI.selEnd++;
			if(Music.music.length == 0)return;
			if(start <= -1){
				UI.selStart = UI.selEnd;
				if(UI.editingLynicLine == -1){
					UI.insertEdit([]);
				}else{
					UI.spliceWord(end+1,1 ,"");
					UI.selStart = -1;
					UI.selEnd 	= end;
					UI.render();
				}
			}else{
				if(UI.editingLynicLine == -1){
					UI.insertEdit([]);
				}else{
					UI.spliceWord(start ,end - start + 1 ,"");
					UI.selStart = -1;
					UI.selEnd 	= end;
					UI.render();
				}
			}

			break;
			
		//Select
		
		case 37:// " <- "
			UI.refreshIME("");
			if(Music.music.length == 0)return;
			if(!event.shiftKey){
				UI.selStart = -1;
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd;
				UI.selEnd ++;
			}
			UI.selEnd--;
			UI.redraw();
			break;
		case 39:// " -> "
			UI.refreshIME("");
			if(Music.music.length == 0)return;
			if(!event.shiftKey){
				if(UI.selStart != -1){
					UI.selEnd--;
				}
				UI.selStart = -1;
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd + 1;
			}
			UI.selEnd++;
			UI.redraw();
			break;
		case 38:// " /|\"
				// "  | "
			if(Music.music.length == 0)return;
			if(!event.shiftKey){
				if(event.ctrlKey){
					UI.switchLine(true);
					break;
				}else{
					UI.selStart = -1;
					if(UI.selStart != -1){
						UI.selStart--;
					}
				}
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd;
				UI.selEnd++;
			}
			if(UI.selEnd != -1){
				if(UI.selEnd == Music.music.length)	UI.selEnd--;
				UI.selEnd = UI.getClosestNoteIn(UI.domsAreas[UI.selEnd].midX,UI.domsAreas[UI.selEnd].midY - 60);
			}
			UI.refreshIME("");
			UI.redraw();
			break;
		case 40:// "  |	"
				// " \|/"
			if(Music.music.length == 0)return;
			if(!event.shiftKey){
				if(event.ctrlKey){
					UI.switchLine();
					break;
				}else{
					UI.selStart = -1;
					if(UI.selStart != -1){
						//UI.selStart++;
					}
				}
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd;
				UI.selStart++;
			}
			if(UI.selEnd != -1){
				UI.selEnd = UI.getClosestNoteIn(UI.domsAreas[UI.selEnd].midX,UI.domsAreas[UI.selEnd].midY + 60);
			}
			UI.refreshIME("");
			UI.redraw();
			break;
			
		case 65://（Ctrl+）A 
			UI.refreshIME("");
			if(Music.music.length == 0)return;
			if(event.ctrlKey){
				UI.selStart = 0;
				UI.selEnd = Infinity;
				UI.redraw();
			}else{
				cancel = false;
			}
			break;
		case 35://End
			UI.refreshIME("");
			if(Music.music.length == 0)return;
			if(UI.selEnd == -1){
				UI.selEnd = 0;
			}
			if(!event.shiftKey){
				UI.selStart = -1;
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd + 1
			}
			UI.selEnd = Music.music.length - 1;
			UI.refreshIME("");
			UI.redraw();
			break;
		case 36://Home
			UI.refreshIME("");
			if(Music.music.length == 0)return;
			if(UI.selEnd == -1){
				UI.selEnd = 0;
			}
			if(!event.shiftKey){
				UI.selStart = -1;
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd 
			}
			UI.selEnd = 0;
			UI.redraw();
			UI.selEnd = -1;
			UI.redraw();
			break;
		case 33://Page UP
			UI.refreshIME("");
			if(Music.music.length == 0)return;
			if(!event.shiftKey){
				UI.selStart = -1;
				if(UI.selStart != -1){
					//UI.selStart++;
				}
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd;
				UI.selStart++;
			}
			if(UI.selEnd != -1){
				UI.selEnd = UI.getClosestNoteIn(UI.domsAreas[UI.selEnd].midX,UI.domsAreas[UI.selEnd].midY - window.innerHeight - 100);
			}
			UI.redraw();
			break;
		case 34://Page Down
			UI.refreshIME("");
			if(Music.music.length == 0)return;
			if(!event.shiftKey){
				UI.selStart = -1;
				if(UI.selStart != -1){
					//UI.selStart++;
				}
			}else if(UI.selStart == -1){
				UI.selStart = UI.selEnd;
				UI.selStart++;
			}
			if(UI.selEnd != -1){
				UI.selEnd = UI.getClosestNoteIn(UI.domsAreas[UI.selEnd].midX,UI.domsAreas[UI.selEnd].midY + window.innerHeight - 100);
			}
			UI.redraw();
			break;
		case 88 ://(Ctrl+)X
		case 67://(Ctrl+)C
			if(Music.music.length == 0)return;
			if(event.ctrlKey){
				UI.copy();
				if(event.keyCode == 88){
					UI.insertEdit([]);
				}
			}else{
				cancel = false;
			}
			break;
		case 86://(Ctrl+)V
			if(event.ctrlKey && UI.editingLynicLine == -1)
				UI.paste();
			else
				cancel = false;
			break;
		//快捷键
		case 78://(Ctrl+)N
			if(event.ctrlKey)
				void(window.open(location.href,'_blank','toolbar=no'))
			else
				cancel = false;
			break
		case 79://(Ctrl+)O
			if(event.ctrlKey)
				UI.open()
			else
				cancel = false;
			break;
		case 83://(Ctrl+)O
			if(event.ctrlKey)
				UI.saveAs()
			else
				cancel = false;
			break;
		case 27://Esc
			UI.refreshIME("");
			break;
		default:
			cancel = false;
			break;
		
	}
	
	if(cancel){
		event.preventDefault();
		event.stopImmediatePropagation();
		event.stopPropagation();
	}
}

UI.refreshIME = function ui_refresh_IME(value){
	if(value != null)	UI.editbox.value = value;
	UI.IMETip.innerText = UI.editbox.value;
}

UI.onInput = function(event){
	//歌谱的输入方法
	UI.refreshIME();
	if(UI.editingLynicLine != -1)
	{
		//UI.refreshIME("");
		return;
	}
	var content = event.target.value;
	if(content == "")return;
	if(true){//转时值对应表
		var extendTable = {};
		extendTable[2] = 4;
		extendTable[4] = 8;
		extendTable[8] = 16;
		extendTable[16] = 24;
		extendTable[24] = 32;
		var shortenTable = {};
		shortenTable[32] = 24;
		shortenTable[24] = 16;
		shortenTable[16] = 8 ;
		shortenTable[8 ] = 4 ;
		shortenTable[4 ] = 2 ;
		var postTable = {};
		postTable[2 ] = 3 ;
		postTable[3 ] = 2 ;
		postTable[4 ] = 6 ;
		postTable[6 ] = 4 ;
		postTable[8 ] = 12;
		postTable[12] = 8 ;
		postTable[16] = 24;
		postTable[24] = 16;
		var conventTable = {
			"-":extendTable,
			"/":shortenTable,
			"、":shortenTable,
			"=":shortenTable,
			".":postTable,
			"。":postTable
		}
	}
	var note;
	content = content.split("……").join("…").split("'").join("").toLowerCase().split("");
	for(var i = 0;i<content.length;i++){
		var oneChar = content[i];
		var diffFrom;
		if(Music.music[UI.selEnd] != null){
			diffFrom = note = Music.music[UI.selEnd].pitch;
			diffFrom += Music.music[UI.selEnd].octave  * 8;
		}
		switch(oneChar){
			case "0":
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
				note = Music.MusicNote();
				note.pitch = parseInt(oneChar);
				note.length = UI.defaultLength;
				if(note.pitch != 0){
					diffFrom -= note.pitch;
					if(diffFrom >= 5){
						note.octave = 1;
					}else if(diffFrom <= -5){
						note.octave = -1;
					}
				}
				UI.insertEdit([note]);
				Player.simplePlay(note.pitch,note.octave);
				
				UI.refreshIME("");
				break;
			case "-":
			case "/":
			case "、":
			case "=":
			case ".":
			case "。":
				if(Music.music[UI.selEnd] != null){
					note = Music.music[UI.selEnd];
					if(conventTable[oneChar][note.length]){
						note.length = conventTable[oneChar][note.length];
						UI.render();
					}
				}
				UI.refreshIME("");
				
				break;
			case "*":
				if(Music.music[UI.selEnd] != null){
					note = Music.music[UI.selEnd];
					if(note.octave == 1)    note.octave = 0;
					else                     note.octave = 1;
					UI.render();
				}
				Player.simplePlay(note.pitch,note.octave);
				UI.refreshIME("");
				break;
			case "+":
				if(Music.music[UI.selEnd] != null){
					note = Music.music[UI.selEnd];
					if(note.octave == -1)    note.octave = 0;
					else                     note.octave = -1;
					UI.render();
					Player.simplePlay(note.pitch,note.octave);
				}
				UI.refreshIME("");
				break;
			case "`":
			case "~":
			case "·":
				if(Music.music[UI.selEnd] != null){
					note = Music.MusicNote();
					note.pitch = Music.music[UI.selEnd].pitch;
					note.octave = Music.music[UI.selEnd].octave;
					note.length = UI.defaultLength;
					note.fx.extend = true;
					UI.insertEdit([note])
				}
				event.target.value = "";
				
				break;
			case "^":
			case "…":
				if(Music.music[UI.selEnd] != null){
					note = Music.music[UI.selEnd];
					note.fx.extend = !note.fx.extend;
					UI.render();
				}
				event.target.value = "";
				
				break;
			case ":":
			case "：":
				var sid = Music.indexNoteInSection(UI.selEnd);
				if(sid == -1)	sid = 0;
				if(Music.loops[sid] == null)
					Music.loops[sid] = {};
				if(!Music.loops[sid].loop && !Music.loops[sid].do){
					Music.loops[sid].loop = true;
				}else if(Music.loops[sid].loop && !Music.loops[sid].do){
					Music.loops[sid].do = true;
				}else if(Music.loops[sid].loop && Music.loops[sid].do){
					Music.loops[sid].loop = false;
				}else if(!Music.loops[sid].loop && Music.loops[sid].do){
					Music.loops[sid].do = false;
				}
				event.target.value = "";
				
				UI.render();
				break;
			case "d":
			case "s":
			case "e":
			case "c":
			case "o":

				var cmd = content[i-1] +  content[i];
				var sid = Music.indexNoteInSection(UI.selEnd);
				var map = {ds:"ds",dc:"dc",co:"coda",se:"segno"}
				if(sid == -1)	sid = 0;
				cmd = cmd.toLowerCase();
				if(map[cmd] != null ){
					if(Music.loops[sid] == null)
						Music.loops[sid] = {};
					Music.loops[sid][map[cmd]] = !Music.loops[sid][map[cmd]] ;
					UI.render();
					event.target.readonly = "readonly";
					event.target.value = "";
					event.target.readonly = "";
				}
				
				break;
			case "|":
				var reg = /\|-(\d).*/;
				var lopId = reg.exec(content.join(""));
				if(lopId == null)	return;
				lopId = lopId[1]
				if(lopId == null)	return;
				var sid = Music.indexNoteInSection(UI.selEnd);
				if(sid == -1)		sid = 0;
				if(Music.loops[sid] == null)	Music.loops[sid] = {};
				if(lopId == 0){
					delete Music.loops[sid].house;
				}else{
					Music.loops[sid].house = [lopId];
				}
				
				UI.layout();	
				event.target.value = "";
				content.shift();content.shift();
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				break;
			default:
				//event.target.value = "";

		}
	}
	event.target.value = event.target.value.replace(/[^ds|\-0-9]/g,"");
	UI.refreshIME();
}
UI.onChangeListener = function ui_onChangeListener(event){
	var content = event.target.value;
	if(content == "")return;
	if(content.length > 10){
		content = content.replace(/\s/ig,"");
	}
	var start,end;
	start					= Math.min(UI.selStart,UI.selEnd);
	end						= Math.max(UI.selStart,UI.selEnd);
	var howmany,index;
	if(start == -1)	howmany = 0,				index = end+1;
	else 			howmany = end - start + 1,	index = start+1;
	if(UI.editingLynicLine == -1)				UI.editingLynicLine = 0;	
	UI.spliceWord(index,howmany,content)
	UI.selStart  = 	-1;
	UI.selEnd 	+= 	content.length;
	UI.refreshIME("");
	UI.render();
}

UI.insertEdit = function ui_insertEdit(notes){
	var isreved;
	if(UI.selStart > UI.selEnd){
		temp = UI.selStart;
		UI.selStart = UI.selEnd;
		UI.selEnd = temp;
		isreved = true;
	}
	notes = notes.slice();
	if(UI.selStart == -1){
		if(UI.selEnd == -1){
			Music.music = [].concat(notes,Music.music.slice())
		}else{
			Music.music = [].concat(Music.music.slice(0,UI.selEnd+1),notes,Music.music.slice(UI.selEnd+1))
		}
	}else{
		Music.music = [].concat(Music.music.slice(0,UI.selStart),notes,Music.music.slice(UI.selEnd+1))
	}
	if(UI.selStart == -1){
		UI.selEnd = UI.selEnd + notes.length;
	}else{
		UI.selEnd = UI.selStart + notes.length - 1;
		UI.selStart = -1;
	}
	UI.render();
}
UI.spliceWord = function ui_spliceWord(index,howmany,str){
	var items = [];
	var pushingSymbol = "";
	var char;
	var symbols = "，。；【】、！￥…（）—：“”’‘《》？";
	var isPushing = true;
	if(str != "" && symbols.indexOf(str.charAt(0)) >= 0 && index >= 0){
		UI.spliceWord(index-1,howmany+1,Music.music[index-1].word[UI.editingLynicLine]+str);
		return;
	}
	//准备插入
	for(var i = 0;i < str.length;i++){
		char = str.charAt(i);
		if(symbols.indexOf(char) >= 0){
			if(isPushing){
				pushingSymbol += char;
			}else{
				items[items.length-1] += char;
			}
		}else{
			isPushing = false;
			items.push(char);
		}
	}
	for(i = index + howmany; i < Music.music.length;i++){
		items.push(Music.music[i].word[UI.editingLynicLine]);
	}
	for(i = 0 ;i<Music.music.length - index && i < items.length;i++){
		Music.music[i + index].word[UI.editingLynicLine] = items[i]
	}

	for(i +=index + items.length ;i<Music.music.length;i++){
		Music.music[i].word[UI.editingLynicLine] = "";
	}
}
UI.getClosestNote = function ui_getClosestNote(clientX,clientY){
	var containerRect = UI.container.getBoundingClientRect();
	clientX -= containerRect.left;
	clientY -= containerRect.top;
	return UI.getClosestNoteIn(clientX,clientY)
}
UI.getClosestNoteIn = function ui_getClosestNoteIn(x,y)/*:ID*/{
	var minid = 0;
	var minDis = 99999999999999;
	var tempDis = 0;
	UI.domsAreas.forEach(function(rect,id){
		tempDis = Math.abs(rect.midX - x)  + Math.abs(rect.midY - y) * 100000;
		if(tempDis < minDis){
			minid = id;
			minDis = tempDis;
		}
	});
	return minid;
}
UI.cut = function ui_cut(){
	UI.copy();
	UI.insertEdit([]);
}
UI.copy = function ui_copy(){
	var isreved;
	if(UI.selStart > UI.selEnd){
		temp = UI.selStart;
		UI.selStart = UI.selEnd;
		UI.selEnd = temp;
		isreved = true;
	}
	if(UI.selStart == -1){
		return;
	}
	UI.clipboard = Util.clone(Music.music.slice(UI.selStart,UI.selEnd+ 1))
	if(isreved){
		temp = UI.selStart;
		UI.selStart = UI.selEnd;
		UI.selEnd = temp;
	}
}
UI.paste = function ui_paste(){
	if(UI.clipboard.length == 0)	return;
	UI.insertEdit(Util.clone(UI.clipboard))
}
UI.open = function ui_open(){
	UI.openBox.click();
}
UI.openListener = function ui_openListener(me){
	if(!me.files){
		throw "您的浏览器不支持打开本地文件。";
		return;
	}
	if (me.files && me.files[0]) {
		var reader = new FileReader();
		reader.readAsText(me.files[0]);
		reader.onload = function(){
			UI.openFile(reader.result)
		}
		openFailedCount = 0;
	}else{
		if(++openFailedCount > 1){
			PopupWindow.alert("您已经连续两次没有选择文件，如果你无法打开，或许你该换个浏览器。");
		}
	}
}
UI.openFile = function ui_openFile(datastr){
	try{
		if(datastr.indexOf("<script>") > 0){
			datastr = datastr.split("<script>")[1].split("</script>")[0];
		}
		var data = JSON.parse(datastr);
		if(data['music'] == null){
			PopupWindow.alert("这个文件里存的东西我用不了，抱歉。");
			return;
		}
		data.music = data.music.map(function(item){
			if(typeof item.word == "string"){
				item.word = item.word.split("")
			}
			return item;
		})
		for(var i in data){
			Music[i] = data[i]
		}
		UI.render();
		UI.authorArea.value = Music.author;
		document.title = Music.title+ ' - 傻瓜弹曲';
		UI.titleBox.value = Music.title;
		UI.arpeggioBox.value = Music.arpeggio;
		UI.tempo0Box.value = Music.tempo[0];
		UI.tempo1Box.value = Music.tempo[1];
		UI.speedBox.value = Music.speed;
	}catch(e){
		PopupWindow.alert("这个文件里存的东西我用不了，抱歉。")
		//throw e;
	}
	
}
UI.outString = function ui_tostring(){
	var temp = {
		title:"",
		author:"",
		music:[],
		tempo:[4,4],
		speed:120,
		arpeggio:0,
		setting:{},
		loops:[],
	}
	if(Music.title.replace(/\s/g,"") == "")	Music.title = "未命名歌曲";
	var content = Util.templateClone(Music,temp);
	return JSON.stringify(content, null, "\t");
}
UI.saveAs = function ui_saveAs(){
	if(Music.title.replace(/\s/g,"") == "")	Music.title = "未命名歌曲";
	var a = document.createElement("a");
	a.style.display="none"
	a.download = Music.title + ".htm";
	a.href = location.href;
	a.href = "./caller.htm";
	var content;
	try{
		localStorage.saved=content;
	}catch(e){
		console.warn("localStorage 拒绝访问。这应该不是什么天大的事情。");
		console.warn(e);
	}
	content = '<meta charset="utf-8" /><noscript>本文件是傻瓜弹曲文件，请进入<a href="%self%">傻瓜弹曲</a>，并从那里打开文档。</noscript><iframe src="%url%" id="i" width="600" height="400" onload="l()" frameborder="0"></iframe><script>%data%</script><script>function l(){document.querySelector("#i").contentWindow.postMessage(JSON.parse(document.querySelector("script").innerText),"*")}</script>';
	content = content.replace("%self%",location.href).replace("%url%",a.href).replace("%data%",UI.outString());
	var blob = new Blob([content], {type : 'text/html'});
	if('msSaveOrOpenBlob' in navigator){
		window.navigator.msSaveOrOpenBlob(blob, a.download);
	}else{
		var url = window.URL.createObjectURL(blob);
		a.href = url;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}
UI.onContextMenu = function ui_onContextMenu(event){
	var winwidth = window.innerWidth;
	var winheight = window.innerHeight;
	var rect = UI.contextMenu.getBoundingClientRect();
	UI.contextMenu.style.left = Math.min(innerWidth-(rect.right-rect.left),event.clientX)+"px"
	UI.contextMenu.style.top = Math.min(innerHeight-(rect.bottom-rect.top),event.clientY)+"px"
	UI.contextMenu.style.display = "block";
	event.preventDefault();
}
UI.setEditor = function ui_setEditor(){
	document.addEventListener("keydown",function(event){UI.isShiftDown = event.shiftKey})
	document.addEventListener("keyup",function(event){UI.isShiftDown = event.shiftKey})
	document.addEventListener("mousedown",function ui_capture_mouse(event){if(event.button == 0)UI.isSelectMouseDown = true;})
	document.addEventListener("mouseup",function ui_release_mouse(){UI.isSelectMouseDown = false;})
	document.addEventListener("mousedown",function ui_mousedown_to_(event){
		if(Music.music.length == 0){return;}
		if(!UI.container.contains(event.target) && event.target!=document.documentElement&& event.target!=document.body){
			return;
		}
		if(event.button >= 1){
			return
		}
		UI.lastClickedNotePos = [event.clientX,event.clientY];
		if(UI.isShiftDown){
			UI.selStart = UI.oldSelStart
		}else{
			UI.oldSelStart  = UI.selStart = UI.selEnd = UI.getClosestNote(event.clientX,event.clientY);
			var heightYin 	= 40;
			var eleArea		= document.querySelector(".geci").getBoundingClientRect();
			var heightWord 	= eleArea.bottom - eleArea.top;
			var h			= event.clientY - UI.domsAreas[UI.selEnd].y - UI.container.getBoundingClientRect().top;
			if(h > heightYin){
				UI.editingLynicLine = parseInt((h-heightYin) / heightWord);
				UI.redraw();
			}else{
				UI.editingLynicLine = -1;
			}
		}
		UI.editbox.focus();
		UI.editbox.value = "";
		UI.refreshIME();
		//setTimeout(function(){ UI.redraw()},0);
	})
	document.addEventListener("mousemove",function ui_selecter(event){
		if(!UI.container.contains(event.target) && event.target!=document.documentElement&& event.target!=document.body){
			return;
		}
		if(UI.isSelectMouseDown){
			var myid = UI.getClosestNote(event.clientX,event.clientY);
			UI.selEnd = myid;
			if(event.clientY < 10){window.scrollBy(0,-10)}
			if(event.clientY > UI.statusbar.getBoundingClientRect().top-10){window.scrollBy(0,10)}
			UI.redraw();
		}
	})
	document.addEventListener("click",function ui_click_focus_textbox(event){
		if(!UI.container.contains(event.target) && event.target!=document.documentElement&& event.target!=document.body){
			return;
		}
		UI.editbox.focus();
	})
	document.addEventListener("mouseup",function ui_move_caret(event){
		if(UI.lastClickedNotePos == null)return;
		if(Math.abs(UI.lastClickedNotePos[0] - event.clientX) + Math.abs(UI.lastClickedNotePos[1] - event.clientY) > 10)return;
		if(event.button >= 1)return;
		if(!Music.music.length)return;
		var myid = UI.getClosestNote(event.clientX,event.clientY);
		var rect = UI.domsAreas[myid]
		var mid = rect.x + rect.width /2;
		if(mid + UI.container.getBoundingClientRect().left > event.clientX){
			UI.selEnd = myid - 1;
		}else{
			UI.selEnd = myid
		}
		UI.selStart = -1;
		if(UI.isShiftDown) UI.selStart = UI.oldSelStart;
		UI.redraw();
	})
	UI.container.addEventListener("contextmenu",UI.onContextMenu)
	document.addEventListener("click",function ui_click_to_hide_menu(){setTimeout(function(){UI.contextMenu.style.display = "none"},1)})
	document.oncontextmenu = function ui_to_disable_native_menu(){return event.target.matchesSelector("input,textarea");}
	UI.editbox.addEventListener("keydown",UI.onKeyDown)
	Util.onCJKInput(UI.editbox,UI.onInput)
	UI.editbox.addEventListener("focus",function show_caret(){
		UI.caretStyle.innerHTML = "";
	})
	UI.editbox.addEventListener("blur",function show_caret(){
		UI.caretStyle.innerHTML = "#caret{display:none!important}";
	})
	Util.onCJKInput(UI.editbox,function input_lynic(e){
		if(UI.editingLynicLine > -1){
			UI.onChangeListener(e)
		}
	});
	
	
	//FUCK~~~
	//FIXME
	setInterval(function(){UI.refreshIME();},100);
}
UI.writeBack = function ui_write_back(){
	/* 把音乐的基本参数从对话框写到Music对象里面 */
	UI.titleBox.value = Music.title;
	UI.arpeggioBox.value = Music.arpeggio;
	UI.tempo0Box.value = Music.tempo[0];
	UI.tempo1Box.value = Music.tempo[1];
	UI.speedBox.value = Music.speed;
	switch(Music.tempo[0]){
		case 2:
		case 4:
		case 8:
			break;
		default:
			Music.tempo[0] = 4;
			UI.statusbar.querySelector("div").innerText = "暂不支持其他拍号，将自动设置为4。";
	}
	switch(Music.tempo[1]){
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
	document.querySelector(".tempo0").value = Music.tempo[0];
	document.querySelector(".tempo1").value = Music.tempo[1];
}

UI.main = function ui_main(){
	window.addEventListener("beforeprint",function print_relayout(event){
		document.body.className += " print";
		UI.container.getBoundingClientRect();
		UI.layout();
		UI.container.getBoundingClientRect();
	});
	window.addEventListener("afterprint",function print_relayout(event){
		document.body.className = document.body.className.replace("print","").replace("  "," ")
		UI.container.getBoundingClientRect();
		UI.layout();
		UI.container.getBoundingClientRect();
	});
	var width = 0;
	window.addEventListener("resize",function(){
		var oldScroll = UI.shouldScroll;
		UI.shouldScroll  = false;
	    if(!(width == window.innerWidth) && !(width > 1000 && window.innerWidth > 1000)){
	    	UI.layout();
            width = window.innerWidth;
	    }
	    UI.shouldScroll  = oldScroll;
	});
	width = window.innerWidth;
	//动态隐藏光标，防止引起混乱。
	UI.caretStyle = document.createElement("style");
	UI.caretStyle.innerHTML = "#caret{display:none!important}";
	document.head.appendChild(UI.caretStyle);
	if(location.pathname.split("/").reverse()[0].split(".")[0] == "edit")
		UI.setEditor();
	UI.render();
	
	window.addEventListener("error",function(event){
		PopupWindow.alert("程序出现错误，请保存文件并且查看控制台。")
	})
	
	//All is inited；
	//打开指定文件
	var file = Util.queries().music
	if(file && file.length > 0 ){
		//网络示例文件专属！
		var factFile = "music/" + file + ".json"
		var request = new XMLHttpRequest();
		request.open('GET', factFile, true);
		request.onload = function(){
			UI.openFile(request.responseText);
		}
		request.send();
	}else{
		//只要不是示例文件！
		try{
			if(localStorage.open != null){
				//alert(localStorage.open);
				UI.openFile(localStorage.open);
				localStorage.removeItem("open");
			}else if(localStorage.saved!=null){
				UI.openFile(localStorage.saved);
			}
			setInterval(function autosave(){
				var content = UI.outString();
				localStorage.saved=content;
			},1000)
		}catch(e){
			console.warn("貌似Edge浏览器的安全限制阻止了本地储存的使用。这会导致自动保存功能失效。")
		}
	}
}

UI.main();

