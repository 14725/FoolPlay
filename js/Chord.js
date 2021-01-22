/* 自动和弦程序 */
    var c = function(...args) {
        c._last || (c._last = "clog");
        return c[c._last](...args)
    };
    for (let i in console) {
        window[i] = c[i] = function(...args) {
            console[i](...args);
            c._last = i;
            return c;
        }
    }
    c.cout = cout = c.clog = clog = log;
    c.cerr = cerr = error;
    c.toString = function() {
        return "控制台函数封装";
    }

    
function oldChord() {
	var graph = {
		Am: ["Am", "Em", "G"],
		C: ["C", "Dm", "F", "G", "G7", "空"],
		Dm: ["Am", "Dm"],
		Em: ["Dm", "Em", "G"],
		F: ["Am", "C", "Em", "F"],
		G: ["C", "Dm", "G"],
		G7: ["C", "Dm", "F", "G7"],
		空: ["C", "G", "Am"]
	};
	graph = {
		Am: ["Am", "Dm", "F", "空"],
		C: ["C", "F", "G", "G7", "空"],
		Dm: ["C", "Dm", "Em", "G", "G7"],
		Em: ["Am", "Em", "F"],
		F: ["C", "F", "G7"],
		G: ["Am", "C", "Em", "G", "空"],
		G7: ["C", "G7"],
		空: ["C"]
	}

	var val = {
		C: [1, 3, 5],
		Dm: [2, 4, 6],
		Em: [3, 5, 7],
		F: [4, 6, 1],
		G: [5, 7, 2],
		Am: [6, 1, 3],
		G7: [5, 7, 2, 4],
		空: [0],
	};
	bars = Music.sections;
	bars.forEach(function (bar, id) {
		bar.data = {};
		for (var i = 0; i <= 7; i++) {
			bar.data[i] = 0;
		}
	});
	bars.forEach(function (bar, id) {
		var clen = 0;
		bar.forEach(function (noteWarp, id) {
			let note = noteWarp.note,
				present = bar.data,
				len = note.length;
			if (clen < Music.lenTempo) {
				present[note.pitch] += 4;
			}
			clen += len;
			present[note.pitch] += note.length;
		});
	});
	bars.forEach(function (bar) {
		var tmp = {};
		for (var i in val) {
			if (!(i in tmp)) {
				tmp[i] = 0;
			}
			val[i].forEach(function (note, id) {
				tmp[i] += (bar.data[note])* (i.indexOf('m') == -1 ? 1 : 1 );
				//tmp[i] += (bar.data[note])* mode2[i];
			});
		}
		bar.data = tmp;
	});
	bars.reverse().forEach(function (bar, id) {
		if (id === 0) {
			bar.data = {
				C: { val: 1, from: null },
				Dm: { val: 0, from: null },
				Em: { val: 0, from: null },
				F: { val: 0, from: null },
				G: { val: 0, from: null },
				Am: { val: 0, from: null },
				G7: { val: 0, from: null },
				空: { val: 0, from: null },
			};
			return;
		}
		var tmp = {};
		var past = bars[id - 1].data;
		var t;
		for (var i in graph) {
			tmp[i] = { val: 0, from: null };
		}
		for (i in graph) {
			graph[i].forEach(function (j) {
				var t = { val: bar.data[i] + past[j].val, from: j };
				if (t.val > tmp[i].val || (t.val == tmp[i].val && Math.random() > 0.5)) {
					tmp[i] = t;
				}
			});
		}
		bar.data = tmp;
	});
	bars.reverse();
	var past = 'C';
	var res = [];
	bars.forEach(function (bar, id) {
		var data = bar.data;
		if (id === 0) {
			for (var i in data) {
				if (data[i].val > data[past].val) {
					past = i;
				}
			}
			res.push(past);
			return;
		}
		res.push(past = bars[id - 1].data[past].from);
	});
	var doms = document.querySelectorAll('.measure');
	res.forEach(function (it, id) {
		var ele = document.createElement('div');
		ele.style.position = 'absolute';
		ele.style.marginTop = '-0.8em';
		ele.innerText = it;
		doms[id].insertBefore(ele, doms[id].firstChild.nextSibling);
	});
};


function Chord(id,level){
	//UI.render.atOnce();
	Music.getLenSectionTempo();
	if(id == 1)	oldChord();	
	if(id == 2) 和弦标注(level);
	UI.layout();
}
const WeightAddOnStarts = 4;			//对第一拍的音的附加权值
const 限时 				= 50000;			//单位：毫秒
const 环境容量 = 100;
const 生育迭代次数 = 100;
const 变异迭代次数 = 50;
const 和弦表 = ("CDEFGAB").split("");
function 和弦标注(todo){
	var 结果
	if(todo != 1){
		结果 = 和弦计算();
		document.querySelectorAll(".status").forEach((a) => {a.remove();})
		document.querySelectorAll(".chord_it").forEach((a) => {a.remove()})
	}else{
		let data = 确定每小节();
		if(data[data.length-1][1] > data[data.length-1][6]){
            vec = vecM;
		}else if(data[data.length-1][1] < data[data.length-1][6]){
			vec = vecm;
		}else{
			vec = vecw;
		}
		结果 = compute(确定每小节())
	}
	//var 结果 = compute(确定每小节());

	var doms = document.querySelectorAll('.measure');
	var ele;
	结果.forEach(function (it, id) {
		ele = document.createElement('div');
		ele.style.position = 'absolute';
		ele.style.marginTop = '-0.8em';
		ele.innerText = it;
		ele.className = "chord_it"
		doms[id].insertBefore(ele, doms[id].firstChild.nextSibling);
	});
	ele.parentNode.scrollIntoViewIfNeeded(true);
}

function 确定每小节(){
	var tmp = [];								//和弦列表
	Music.sections.forEach(function (bar, idbar) {
		tmp[idbar] = [0,0,0,0,0,0,0,0];
		var clen = 0;
		bar.forEach(function (noteWarp) {
			let note = noteWarp.note,
				present = tmp[idbar],
				len = note.length;
			if (clen < Music.lenTempo) {
				present[note.pitch] += WeightAddOnStarts;
			}
			clen += len;
			present[note.pitch] += note.length;
		});
	});
	return tmp;
}
function 和弦计算(){
	var sec = chordinput.value.toUpperCase().replace(/[^A-G]/g,"").replace(/[A-G]/g," $&").replace(/\s+/g," ").trim();
	sec = sec.split(" ").slice(0,Music.sections.length);
	chordinput.value = sec.join(" ");
	return sec;
}
function 转换为C调(){
	
	var list = "CDEFGAB".split("");
	var d = list.indexOf(document.querySelector(".arpeggio").selectedOptions[0].innerHTML.replace(/[^A-G]/g,""));
	
	var sec = chordinput.value.toUpperCase().replace(/[^A-G]/g,"").replace(/[A-G]/g," $&").replace(/\s+/g," ").trim();
	sec = sec.split(" ").slice(0,Music.sections.length);
	sec = sec.map((item) => {  return list[(list.indexOf(item)-d+list.length) % list.length];  })
	chordinput.value = sec.join(" ");
	Chord(2);
}
var funDownload = function (content, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
};
function 输出(){
	var c = 和弦计算();
	var b = 确定每小节();
	var texts = [],text = "";
	texts.push(c.length);
	for(var i = 0; i < c.length; i++){
		b[i].unshift(c[i]);
		texts.push(b[i].join(" "));
	}
	text = texts.map((a) => (""+a+"\r\n")).join("");
	funDownload(text,Music.title + ".in")
}
//小调
var vecm = {"noteToChord":{"C":[0.06682162427696613,0.15987846440782924,0.22670919623433183,0.8884765591519372,0.022832682798348693,0.9841988612835452,0.39912290278665863,0.2526665664853643],"D":[0.7056067314970312,0.3159252477961235,0.6692271320389316,0.6764998743853997,0.9579843169436604,0.7123790212863748,0.30188171974846306,0.1434307049801028],"E":[0.689443313497475,0.6788847269635282,0.43676565738680906,0.9772843009955979,0.021551613360160354,0.9929168411355744,0.7857430279260578,0.5548755732645165],"F":[0.0901877386904878,0.900441496477114,0.9915849917360332,0.6527870154464497,0.3501815749345145,0.44330329077448033,0.9999089906579344,0.1661917198205599],"G":[0.2090502925928198,0.008112187663012508,0.7125382821911306,0.659690802159336,0.5348141202611831,0.38588669787499286,0.7677022895901996,0.46199380061018847],"A":[0.8408764739610418,0.8577611775613289,0.18351015637138982,0.6693838881894207,0.6585108997099656,0.014969490005902059,0.9261078007309411,0.015010330208816626],"B":[0.10077982596665445,0.8030263757624367,0.4798817058200284,0.3587900609105543,0.035351544223797195,0.6058297686348869,0.3118211436881417,0.39186967256180977]},"chordToChord":{"C":{"C":0.8382415296257175,"D":0.49264787599829263,"E":0.0597526679881413,"F":0.4984289607827105,"G":0.6196185302724712,"A":0.6902761060980428,"B":0.9555596340296794},"D":{"C":0.7000563005110902,"D":0.6857780069289114,"E":0.8204323671031399,"F":0.5791606395284219,"G":0.2029394836020558,"A":0.9002486938285073,"B":0.6235907923045594},"E":{"C":0.33588739671478984,"D":0.5109043504245382,"E":0.7137913480436433,"F":0.2400106093371556,"G":0.48225792382331306,"A":0.6056336933326376,"B":0.6739167882773276},"F":{"C":0.6287371608637333,"D":0.20788426514141478,"E":0.9183829749231772,"F":0.2984964865153508,"G":0.5005973182408086,"A":0.5916983541889836,"B":0.26403367554607504},"G":{"C":0.8831385162990065,"D":0.8492816957170534,"E":0.13161643831369296,"F":0.46057153608052187,"G":0.6859596289698667,"A":0.6054483822385615,"B":0.3819305389705797},"A":{"C":0.9151520084152482,"D":0.7336556131308907,"E":0.8046180682567647,"F":0.23401443594462668,"G":0.9403133252914864,"A":0.9385956924342043,"B":0.6098185227957257},"B":{"C":0.5404343791985033,"D":0.030892568550605477,"E":0.8563889713395172,"F":0.23126926099329068,"G":0.27399554747968397,"A":0.32555479152217925,"B":0.5454267715931557}}}
//大调
var vecM = {"noteToChord":{"C":[0.7733748637466707,0.7106264239350736,0,0.8191271016104575,0.21596487482778115,0.6937827405090768,0.06869292685964143,0.014899425740178763],"D":[0.6973581386687451,0.3803761493048917,0.4327101957204,0.25674785167077063,0.6462716455448485,0.025984923847987902,0.08407262665867433,0.25401576207608567],"E":[0.15770355469324582,0.2154960837329151,0.5612087774730098,0.7803483638278933,0.6911138755973835,0.6604111136819856,0.5017151782727914,0.08782073299391792],"F":[0.7318588765546991,0.5638449737371402,0.03575284013118219,0.6802924885023734,0.77750878693459,0.26926101753879694,0.87347303778749,0.3502774585278659],"G":[0.013827151525341197,0.06819477799688516,0.8009797610051463,0.29138562058541156,0.8354354474178328,0.9362796666360206,0.07463600375948445,0.7825849845506427],"A":[0.9263592836303239,0.5799044713760776,0.16915841286392566,0.9366998551434755,0.5494426102620591,0.3003131079665373,0.918219109948388,0.13878155270379933],"B":[0.08629712377684187,0.5509840101423853,0.4549988462430584,0.23590549799851224,0.6010976790684182,0.37696422781978667,0.02065067800392128,0.47862655125795606]},"chordToChord":{"C":{"C":1,"D":0.8276423069561938,"E":0.44645019731328883,"F":0.9937391949642677,"G":0.7884453747894449,"A":0.861153906506502,"B":0.8024205643692061},"D":{"C":0.5996475246215032,"D":0.26040677090989245,"E":0.6367329181377244,"F":0.6968342114589035,"G":0.9562773087379597,"A":0.9769112232157312,"B":0.5299840901641116},"E":{"C":0.2710341286476234,"D":0.43147725366137424,"E":0.6130103296265302,"F":0.783594717885121,"G":0.7468477900781033,"A":0.19069232878746634,"B":0.42776981219297444},"F":{"C":0.7355555503264036,"D":0.7778747382381296,"E":0.14177143000505074,"F":0.9204395832599453,"G":0.6785159732596325,"A":0.4495031417165778,"B":0.9885812427874299},"G":{"C":0.9498809069922414,"D":0.8906635353381247,"E":0.8223573748660982,"F":0.32254663952266177,"G":0.7300917241337741,"A":0.25534038145131077,"B":0.5953363479950511},"A":{"C":0.684784124903923,"D":0.9503559857659294,"E":0.3744461680759088,"F":0.9072986142021597,"G":0.6875325122367391,"A":0.45827241948955283,"B":0.36834083628952113},"B":{"C":0.0878961792506921,"D":0.2319660981982322,"E":0.8378954134136211,"F":0.02786782910565481,"G":0.09965542533651346,"A":0.8050511953701668,"B":0.4878492075732205}}}
//万能
var vecw = {"noteToChord":{"C":[0.9872336155582087,0.5462001145504141,0.12111907428129642,0.8569782259444645,0.0523273357440619,0.6771562413729888,0.10778831868526882,0.0034080737415373985],"D":[0.6412318173604747,0.5126336532666473,0.7555219260259162,0.5610439573100623,0.9507563431450936,0.4100913657077372,0.02245934442958147,0.23511273863633605],"E":[0.5971348741027396,0.572137069471939,0.03719275385305404,0.8699848508074564,0.29757703734734897,0.4372622439472642,0.22327838682318824,0.7513342489914494],"F":[0.25465171260879305,0.5180406015966943,0.44705816429452994,0.2270351660610964,0.7827118594262403,0.32215311058402407,0.9868532391288389,0.5536385392029017],"G":[0.5863514704540891,0.017596602321438407,0.9479104167092155,0.013321268433008626,0.4420774650319865,0.7994770917201113,0.4800984978806646,0.974613273586749],"A":[0.44574388502180184,0.6358118878855497,0.2078021298691548,0.3100131043040176,0.22692062438530444,0.0755363045893571,0.89947784101039,0.435363841524981],"B":[0.9134289705210953,0.3691734318931799,0.8597021958762954,0.328075392418711,0.15051263013324148,0.12046784826508174,0.17676060470606125,0.7340254848559259]},"chordToChord":{"C":{"C":0.8639298706397688,"D":0.9116229785256988,"E":0.7892886294323285,"F":0.7889017331398229,"G":0.8185402594802729,"A":0.7288080946328115,"B":0.29238604758911857},"D":{"C":0.4094579142031004,"D":0.4492161804756749,"E":0.24940700076481145,"F":0.10823640212301489,"G":0.5386355699146304,"A":0.0011588703158329494,"B":0.5665921199465798},"E":{"C":0.30194805794551893,"D":0.9137372708372604,"E":0.7969792844757946,"F":0.3645339580405116,"G":0.17938005555136344,"A":0.8222514370005365,"B":0.44811870248617236},"F":{"C":0.7777064285046931,"D":0.9422389868925926,"E":0.6070077640451363,"F":0.18494329985357982,"G":0.8333890498749328,"A":0.43588273152184903,"B":0.4021564735297882},"G":{"C":0.8860964154015754,"D":0.7612859413444477,"E":0.7263095797931396,"F":0.5582799269731643,"G":0.7766603357170416,"A":0.7361679896483667,"B":0.4854238356331068},"A":{"C":0.8138544545486479,"D":0.10969490951652498,"E":0.8977218687192525,"F":0.8591441763599006,"G":0.5428021360118606,"A":0.9446189743523715,"B":0.5760201321560651},"B":{"C":0.2971140145520649,"D":0.1282046356005988,"E":0.2564873592095501,"F":0.10648800329166819,"G":0.7531111156260206,"A":0.24825042782820983,"B":0.4439472027238323}}}
var vec = vecw;

function compute(obj) {
	var bars = obj;
	var tmp = [];
	for(let i in bars){tmp[i] = {"prev":{},"C":0,"D":0,"E":0,"F":0,"G":0,"A":0,"B":0}};
	for(let i = 0; i < tmp.length; i++){
		for(let j in 和弦表){
			j = 和弦表[j];
			for(let k = 0; k < bars[i].length; k++){
				try{
				    tmp[i][j] += vec.noteToChord[j][k] * bars[i][k];
				}catch(e){cerr("i:",i)("j:",j)("k:",k)("vec.noteToChord:",vec.noteToChord);throw e;}
			}
		}
	}
	// Make Connections
	for(let i = 1; i < tmp.length; i++){
		for(let k in 和弦表){
			k = 和弦表[k];
			let maxval = 0;
			for(let j in 和弦表){
				j = 和弦表[j];
				// j      k
				// G  ->  C
				let tmpval = tmp[i-1][j] + tmp[i][k] * vec.chordToChord[j][k];
				if(tmpval > maxval){
					maxval = tmpval;
					tmp[i].prev[k] = j;
				}
			}
			tmp[i][k] = maxval;
		}
	}
	// Go back to see the result
	var maxback, maxval = 0, res = [];
	for(let k in 和弦表){
		k = 和弦表[k];
		if(tmp[tmp.length-1][k] > maxval){
			maxback = k;
			maxval = tmp[tmp.length-1][k];
		}
	}
	for(let i = tmp.length-1; i>=0; i--){
		res.unshift(maxback);
		maxback = tmp[i].prev[maxback];
	}
	return res;
}

//var Chord = {};
Chord.getChord = function(){
	var barlist = 确定每小节();
	// 选择大小调模式
	if(barlist[barlist.length-1][1] > barlist[barlist.length-1][6]){
		vec = vecM;    // 1比6多用大调
	}else if(barlist[barlist.length-1][1] < barlist[barlist.length-1][6]){
		vec = vecm;
	}else{
		vec = vecw;    // 不明音乐。如果是民族音乐呢？（常见5结尾）
	}
	var tmp = compute(barlist);
	var chords = {
		C:[1,3,5],
		D:[2,4,6],
		E:[3,5,7],
		F:[1,4,6],
		G:[2,5,7],
		A:[1,3,6],
		B:[2,4,7],
	};
	var res = [];
	tmp.forEach(function (chordkey,position){
        res[position] = Util.clone(chords[chordkey]);
        var maxval = 0,maxpos = -1;
        res[position].forEach(function (note,index) {
        	if(barlist[position][note] > maxval){
        		maxval = barlist[position][note];
        		maxpos = index;
        	}
        });
        if(maxpos != -1)        res[position].splice(maxpos,1);
	});
	return res;
}