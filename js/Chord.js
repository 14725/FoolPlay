/* 自动和弦程序 */


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
            vec = vecw;
		}else if(data[data.length-1][1] < data[data.length-1][6]){
			vec = vecw;
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
//var vecM = {"noteToChord":{"C":[0.7733748637466707,0.7106264239350736,0,0.8191271016104575,0.21596487482778115,0.6937827405090768,0.06869292685964143,0.014899425740178763],"D":[0.6973581386687451,0.3803761493048917,0.4327101957204,0.25674785167077063,0.6462716455448485,0.025984923847987902,0.08407262665867433,0.25401576207608567],"E":[0.15770355469324582,0.2154960837329151,0.5612087774730098,0.7803483638278933,0.6911138755973835,0.6604111136819856,0.5017151782727914,0.08782073299391792],"F":[0.7318588765546991,0.5638449737371402,0.03575284013118219,0.6802924885023734,0.77750878693459,0.26926101753879694,0.87347303778749,0.3502774585278659],"G":[0.013827151525341197,0.06819477799688516,0.8009797610051463,0.29138562058541156,0.8354354474178328,0.9362796666360206,0.07463600375948445,0.7825849845506427],"A":[0.9263592836303239,0.5799044713760776,0.16915841286392566,0.9366998551434755,0.5494426102620591,0.3003131079665373,0.918219109948388,0.13878155270379933],"B":[0.08629712377684187,0.5509840101423853,0.4549988462430584,0.23590549799851224,0.6010976790684182,0.37696422781978667,0.02065067800392128,0.47862655125795606]},"chordToChord":{"C":{"C":1,"D":0.8276423069561938,"E":0.44645019731328883,"F":0.9937391949642677,"G":0.7884453747894449,"A":0.861153906506502,"B":0.8024205643692061},"D":{"C":0.5996475246215032,"D":0.26040677090989245,"E":0.6367329181377244,"F":0.6968342114589035,"G":0.9562773087379597,"A":0.9769112232157312,"B":0.5299840901641116},"E":{"C":0.2710341286476234,"D":0.43147725366137424,"E":0.6130103296265302,"F":0.783594717885121,"G":0.7468477900781033,"A":0.19069232878746634,"B":0.42776981219297444},"F":{"C":0.7355555503264036,"D":0.7778747382381296,"E":0.14177143000505074,"F":0.9204395832599453,"G":0.6785159732596325,"A":0.4495031417165778,"B":0.9885812427874299},"G":{"C":0.9498809069922414,"D":0.8906635353381247,"E":0.8223573748660982,"F":0.32254663952266177,"G":0.7300917241337741,"A":0.25534038145131077,"B":0.5953363479950511},"A":{"C":0.684784124903923,"D":0.9503559857659294,"E":0.3744461680759088,"F":0.9072986142021597,"G":0.6875325122367391,"A":0.45827241948955283,"B":0.36834083628952113},"B":{"C":0.0878961792506921,"D":0.2319660981982322,"E":0.8378954134136211,"F":0.02786782910565481,"G":0.09965542533651346,"A":0.8050511953701668,"B":0.4878492075732205}}}
var vecM = {"noteToChord":{"C":[0.533778500399656,0.7315164961129517,0.40955377419137673,0.8130194097590477,0.2376514578983846,0.5153625903071146,0.16153577251956808,0.4151919043070582],"D":[0.334338377129676,0.5009809896809293,0.7955654725992779,0.6410816450659881,0.9573690245006664,0.1233168912219759,0.4359143422733917,0.07626925344477015],"E":[0.23039339528423117,0.20185250683067046,0.35389079240767735,0.11359020390338563,0.23307158921389862,0.5312348896685904,0.7030048386649397,0.07348549278807837],"F":[0.6449767433505329,0.1318322148009068,0.37813290627277624,0.7020344467908111,0.9861209899147108,0.5158657488722271,0.9520378101790329,0.9000670493574867],"G":[0.35949355289914936,0.12901372987235807,0.8961641532803956,0.13100977205344422,0.8365163274621302,0.5812184934468668,0.278315458013896,0.8121451884990853],"A":[0.4567491231778168,0.5144894680205766,0.13164049740831682,0.43594598863618594,0.737890626501837,0.019884186516696437,0.9924912749417406,0.037165327319947705],"B":[0.18515247264620613,0.06930355496412537,0.9825140283228598,0.17763103741292915,0.4415837285565801,0.15168782335603717,0.1096931535584187,0.21334061178262273]},"chordToChord":{"C":{"C":0.8745424675677527,"D":0.8677394432100112,"E":0.9638963064290332,"F":0.37653009719198877,"G":0.9006414843913223,"A":0.9619468942947698,"B":0.21588091214272492},"D":{"C":0.5496843786012777,"D":0.6712864036002664,"E":0.9422578926670379,"F":0.3867356749289795,"G":0.934928704933065,"A":0.8290292887079788,"B":0.5459807675369562},"E":{"C":0.2864680071465246,"D":0.9039345598750403,"E":0.6729889328085769,"F":0.33817188130673537,"G":0.45955724324782254,"A":0.3256554242618389,"B":0.589218753533059},"F":{"C":0.2129051497605393,"D":0.22901263859821355,"E":0.8084954238679756,"F":0.7572106939620307,"G":0.6831547516575245,"A":0.8053810756901034,"B":0.8410554251014908},"G":{"C":0.9573228756155804,"D":0.47118559247863323,"E":0.5679842214961524,"F":0.3271317408171027,"G":0.8683425353774102,"A":0.6266961427801953,"B":0.6885989224603677},"A":{"C":0.8167684703756019,"D":0.879756249682945,"E":0.550639876439573,"F":0.7865251685188956,"G":0.9474739528056066,"A":0.03514074184747007,"B":0.07424461644193779},"B":{"C":0.3698664428990315,"D":0.9587693751347723,"E":0.9020691335604665,"F":0.9330376231865428,"G":0.0736929511603932,"A":0.2155919532584745,"B":0.10495662797735436}}};
//万能
//var vecw = {"noteToChord":{"C":[0.9872336155582087,0.5462001145504141,0.12111907428129642,0.8569782259444645,0.0523273357440619,0.6771562413729888,0.10778831868526882,0.0034080737415373985],"D":[0.6412318173604747,0.5126336532666473,0.7555219260259162,0.5610439573100623,0.9507563431450936,0.4100913657077372,0.02245934442958147,0.23511273863633605],"E":[0.5971348741027396,0.572137069471939,0.03719275385305404,0.8699848508074564,0.29757703734734897,0.4372622439472642,0.22327838682318824,0.7513342489914494],"F":[0.25465171260879305,0.5180406015966943,0.44705816429452994,0.2270351660610964,0.7827118594262403,0.32215311058402407,0.9868532391288389,0.5536385392029017],"G":[0.5863514704540891,0.017596602321438407,0.9479104167092155,0.013321268433008626,0.4420774650319865,0.7994770917201113,0.4800984978806646,0.974613273586749],"A":[0.44574388502180184,0.6358118878855497,0.2078021298691548,0.3100131043040176,0.22692062438530444,0.0755363045893571,0.89947784101039,0.435363841524981],"B":[0.9134289705210953,0.3691734318931799,0.8597021958762954,0.328075392418711,0.15051263013324148,0.12046784826508174,0.17676060470606125,0.7340254848559259]},"chordToChord":{"C":{"C":0.8639298706397688,"D":0.9116229785256988,"E":0.7892886294323285,"F":0.7889017331398229,"G":0.8185402594802729,"A":0.7288080946328115,"B":0.29238604758911857},"D":{"C":0.4094579142031004,"D":0.4492161804756749,"E":0.24940700076481145,"F":0.10823640212301489,"G":0.5386355699146304,"A":0.0011588703158329494,"B":0.5665921199465798},"E":{"C":0.30194805794551893,"D":0.9137372708372604,"E":0.7969792844757946,"F":0.3645339580405116,"G":0.17938005555136344,"A":0.8222514370005365,"B":0.44811870248617236},"F":{"C":0.7777064285046931,"D":0.9422389868925926,"E":0.6070077640451363,"F":0.18494329985357982,"G":0.8333890498749328,"A":0.43588273152184903,"B":0.4021564735297882},"G":{"C":0.8860964154015754,"D":0.7612859413444477,"E":0.7263095797931396,"F":0.5582799269731643,"G":0.7766603357170416,"A":0.7361679896483667,"B":0.4854238356331068},"A":{"C":0.8138544545486479,"D":0.10969490951652498,"E":0.8977218687192525,"F":0.8591441763599006,"G":0.5428021360118606,"A":0.9446189743523715,"B":0.5760201321560651},"B":{"C":0.2971140145520649,"D":0.1282046356005988,"E":0.2564873592095501,"F":0.10648800329166819,"G":0.7531111156260206,"A":0.24825042782820983,"B":0.4439472027238323}}}
//var vecw = {"noteToChord":{"C":[0.4533342913878291,0.8961004880353378,0.1801770624210648,0.8502092072430418,0.049279402552585116,0.9678346441243968,0.07843215591292856,0.42196711218172367],"D":[0.2060029634660041,0.26351048224420404,0.7864616758367704,0.8715461199652008,0.9568410634855089,0.16214605524293058,0.11614549922179163,0.009801489512485384],"E":[0.7966924068273922,0.4295098962786912,0.27361051293156513,0.163559399239525,0.24013315112619926,0.0873027449739674,0.05849085271575971,0.3164579812142141],"F":[0.36112780185049753,0.5722196335269758,0.17606687255284492,0.2990344262083282,0.8881181559762561,0.5789237958755938,0.5894711407440467,0.33257989846138103],"G":[0.5460679875883387,0.1300404741917751,0.5854833740903453,0.3715189447314169,0.7023788889724527,0.8888224434875809,0.03661924600034494,0.8947343072478511],"A":[0.5994060591596241,0.9442137347869461,0.3073954239241068,0.9838561361813101,0.14319186244111481,0.14683461465321823,0.802346250714546,0.956902963733697],"B":[0.003854749350292508,0.7534612847714738,0.544998510792114,0.0899310756889914,0.6261212338951678,0.3889553139148562,0.09427474222839116,0.17759625166408743]},"chordToChord":{"C":{"C":0.7988970047633699,"D":0.2560566017886916,"E":0.09045745946223183,"F":0.7303690396472002,"G":0.6797010524705427,"A":0.14639523994303816,"B":0.4290923604056889},"D":{"C":0.5224307915904733,"D":0.39367705137257336,"E":0.5235302678829039,"F":0.910350518522997,"G":0.9401266810198683,"A":0.30028271317242194,"B":0.3657365509225723},"E":{"C":0.8790000624167897,"D":0.7252853340371759,"E":0.4003805347985605,"F":0.6683392761786193,"G":0.5144979518218566,"A":0.6954258816921113,"B":0.4061780512358968},"F":{"C":0.906221475377732,"D":0.6004881716937438,"E":0.4639747588990466,"F":0.6111051295427654,"G":0.8712863845018606,"A":0.3907650496054549,"B":0.6453148422431062},"G":{"C":0.9904933344271971,"D":0.6631750738619522,"E":0.6673837191305367,"F":0.5298875065275555,"G":0.9209853142526868,"A":0.8074397028028278,"B":0.15515356613815084},"A":{"C":0.3695055858447829,"D":0.41946739762794993,"E":0.28248845594201466,"F":0.7223027449487016,"G":0.6297057133858612,"A":0.6891937058152069,"B":0.4054764533662143},"B":{"C":0.5247920011423375,"D":0.14967303785362618,"E":0.44269683093475165,"F":0.34133232798626767,"G":0.9466158812915686,"A":0.43398876004178644,"B":0.4293774799763084}}};
//var vecw = {"noteToChord":{"C":[0.8383665766703781,0.6043916498431319,0.07575752328839958,0.8413214236939237,0.46966364042348085,0.3844806195241586,0.17003887981723764,0.029721855328885605],"D":[0.6726581127919669,0.3106046476323233,0.27821757246845324,0.6269573666361234,0.8460631886588004,0.9350635275413957,0.06836449765532904,0.20852686050075864],"E":[0.660379996344745,0.22757882497361395,0.5675166007477664,0.9535723744368962,0.3852031420488544,0.20135466921942013,0.08353823889930578,0.05806501584138113],"F":[0.6394583216439451,0.6093070003860794,0.586711470002508,0.16711769605833782,0.8075585897440063,0.41790107486502004,0.909578975667795,0.3032538557579807],"G":[0.6280800228095629,0.14940096765866356,0.9190478043052555,0.5438772769134383,0.6608937724037709,0.8092463837744779,0.48981138765086096,0.7842596584825832],"A":[0.93675798046877,0.5023365492757568,0.12035829445688173,0.3827777893745983,0.3916378246361436,0.1612358510283729,0.9949103318473174,0.44745020496458676],"B":[0.35658620351236303,0.5639962339279163,0.7964357213287301,0.8450588673008055,0.8592116280546624,0.47624037611848036,0.4956748860134481,0.14929735135401523]},"chordToChord":{"C":{"C":0.9871856945762212,"D":0.6555690292119527,"E":0.6761054732456593,"F":0.9748794997055584,"G":0.9651054733438751,"A":0.7929990765227852,"B":0.005519581343978885},"D":{"C":0.7139502253112062,"D":0.6605833398523344,"E":0.9903633982202527,"F":0.13336085543164722,"G":0.7109300393149827,"A":0.5983981268386473,"B":0.5774704653961489},"E":{"C":0.4643890357258882,"D":0.31605960570756,"E":0.8226353394292785,"F":0.2502637517978208,"G":0.38380332305562037,"A":0.930945068945594,"B":0.14211112314058338},"F":{"C":0.9206208854541258,"D":0.08912758415415034,"E":0.7939284935988182,"F":0.8722932139275523,"G":0.8551397029049965,"A":0.555114046191022,"B":0.6196278507121534},"G":{"C":0.9091442533007261,"D":0.6461455440959649,"E":0.9063009047007171,"F":0.649889995893389,"G":0.8113801370506575,"A":0.8655696397259276,"B":0.33269758105572783},"A":{"C":0.8199412788052141,"D":0.25421469702128396,"E":0.9096863628016835,"F":0.9312717426098012,"G":0.625360129962634,"A":0.9674749367438897,"B":0.3720007365845339},"B":{"C":0.7666838950456523,"D":0.6902490240547268,"E":0.23857745516833528,"F":0.23336018116525148,"G":0.7766196720971479,"A":0.27837530470311633,"B":0.06162230319036355}}};
//var vecw = {"noteToChord":{"C":[0.8383665766703781,0.6043916498431319,0.07575752328839958,0.8413214236939237,0.46966364042348085,0.3844806195241586,0.027154074256435123,0.029721855328885605],"D":[0.6726581127919669,0.3106046476323233,0.27922655021627085,0.6269573666361234,0.8460631886588004,0.9350635275413957,0.06836449765532904,0.7058404815141512],"E":[0.6082102997035759,0.22757882497361395,0.5675166007477664,0.9535723744368962,0.3534632572858929,0.20135466921942013,0.08353823889930578,0.05806501584138113],"F":[0.76323350695865,0.6093070003860794,0.586711470002508,0.16711769605833782,0.8075585897440063,0.41790107486502004,0.909578975667795,0.3032538557579807],"G":[0.6280800228095629,0.13221426722965224,0.9190478043052555,0.5438772769134383,0.6608937724037709,0.8092463837744779,0.48981138765086096,0.7255376411708703],"A":[0.93675798046877,0.5023365492757568,0.12035829445688173,0.3827777893745983,0.3916378246361436,0.1612358510283729,0.9949103318473174,0.44745020496458676],"B":[0.35184378254962956,0.5680560770015832,0.8671414136183906,0.8411661815534344,0.8592116280546624,0.47624037611848036,0.02279662024766838,0.9018715552874998]},"chordToChord":{"C":{"C":0.9871856945762212,"D":0.3701988935563858,"E":0.2649537533639996,"F":0.9748794997055584,"G":0.9651054733438751,"A":0.7929990765227852,"B":0.0015664749145664738},"D":{"C":0.7223311315007994,"D":0.641038641725288,"E":0.9903633982202527,"F":0.13336085543164722,"G":0.7109300393149827,"A":0.5983981268386473,"B":0.5774704653961489},"E":{"C":0.4689832659530666,"D":0.31605960570756,"E":0.8202037887728563,"F":0.2502637517978208,"G":0.4594096849213878,"A":0.930945068945594,"B":0.14211112314058338},"F":{"C":0.9206208854541258,"D":0.08912758415415034,"E":0.7939284935988182,"F":0.8984031565270363,"G":0.8551397029049965,"A":0.6875866513448894,"B":0.6196278507121534},"G":{"C":0.9091442533007261,"D":0.6461455440959649,"E":0.9063009047007171,"F":0.649889995893389,"G":0.8146105561199861,"A":0.8655696397259276,"B":0.5119555917979595},"A":{"C":0.8199412788052141,"D":0.25421469702128396,"E":0.9096863628016835,"F":0.9312717426098012,"G":0.627788850922121,"A":0.9699522378286161,"B":0.3720007365845339},"B":{"C":0.7698574303905599,"D":0.6902490240547268,"E":0.23857745516833528,"F":0.8439966018317888,"G":0.7766196720971479,"A":0.27837530470311633,"B":0.05994090303057033}}};
//var vecw = {"noteToChord":{"C":[0.9872336155582087,0.5462001145504141,0.12111907428129642,0.8558542933927165,0.0523273357440619,0.6771562413729888,0.10778831868526882,0.0034080737415373985],"D":[0.0719712082398114,0.5126336532666473,0.7533406943559483,0.5637114982708148,0.9507563431450936,0.20899745069403064,0.4051285464247276,0.2377469444649528],"E":[0.5971348741027396,0.572137069471939,0.03719275385305404,0.8699848508074564,0.29757703734734897,0.4372622439472642,0.039683659008314276,0.7513342489914494],"F":[0.7227227899021358,0.5175985665964374,0.44705816429452994,0.22996397285982406,0.7825443697106041,0.5370466296971832,0.9868532391288389,0.5543363235690614],"G":[0.9075146518922035,0.017596602321438407,0.9403716804013065,0.015521245217495754,0.4420774650319865,0.7994770917201113,0.47526166830697486,0.974613273586749],"A":[0.9443991540843439,0.6320620068462942,0.2078021298691548,0.3174747131593858,0.22692062438530444,0.0961898239567032,0.89947784101039,0.435363841524981],"B":[0.9134289705210953,0.21613418526526806,0.8609016430446363,0.03552527191151866,0.8398357158078713,0.4331525750994205,0.44908611465411097,0.47828929986836144]},"chordToChord":{"C":{"C":0.8644446718411547,"D":0.9092088126126266,"E":0.8462076400253222,"F":0.7932091276740304,"G":0.8185402594802729,"A":0.7269049595611728,"B":0.7554833437081758},"D":{"C":0.4083198458625781,"D":0.44487001939051185,"E":0.2450745939178729,"F":0.10460490164068481,"G":0.5386355699146304,"A":0,"B":0.6457398489654775},"E":{"C":0.30194805794551893,"D":0.9137372708372604,"E":0.7969792844757946,"F":0.4350896437140226,"G":0.038206575641226426,"A":0.8222514370005365,"B":0.4431373880098845},"F":{"C":0.7777064285046931,"D":0.934241116572455,"E":0.16236389405963747,"F":0.1855007565227183,"G":0.8333890498749328,"A":0.43588273152184903,"B":0.4021564735297882},"G":{"C":0.8860964154015754,"D":0.7612859413444477,"E":0.4609801217192324,"F":0.5616681757770018,"G":0.7719653411444635,"A":0.7322610654985947,"B":0.3551150590123753},"A":{"C":0.8138544545486479,"D":0.8593439764288205,"E":0.8977218687192525,"F":0.8591441763599006,"G":0.5428021360118606,"A":0.9446189743523715,"B":0.7421196148590838},"B":{"C":0.2971140145520649,"D":0.1282046356005988,"E":0.15117104129253933,"F":0.09863631896115135,"G":0.7707571542101033,"A":0.5535591821036905,"B":0.44530124702294827}}};
var vecw = {noteToChord:{C:[0,1,0,1,0,1,0,0],D:[0,0,1,0,1,0,1,0],E:[0,0,0,1,0,1,0,1],F:[0,1,0,0,1,0,1,0],G:[0,0,1,0,0,1,0,1],A:[0,1,0,1,0,0,1,0],B:[0,0,1,0,1,0,0,1]},chordToChord:{C:{C:0.9117787894846079,D:0.0382383687582345,E:0.6767487284648094,F:0.5250415680972348,G:0.9143671686094578,A:0.7914710059250949,B:0.07975015314103984},D:{C:0.8114496388019052,D:0.8081559359265341,E:0.8400155064418713,F:0.5412932263173675,G:0.8938640070648131,A:0.7898143684930086,B:0.12340434263058286},E:{C:0.27794228299937057,D:0.6911620499353022,E:0.8094942754705181,F:0.6164758479132048,G:0.6225427303176126,A:0.3317074902751536,B:0.045998163968236874},F:{C:0.8855335343218353,D:0.905184533953884,E:0.5849875398415363,F:0.6155992673233941,G:0.9860161697743457,A:0.7431808724363902,B:0.8145680015789807},G:{C:0.9163930363375381,D:0.3431192241951286,E:0.8593546406966358,F:0.6274618320723613,G:0.8040026366863117,A:0.7806662809242505,B:0.618720958517009},A:{C:0.4778298673227063,D:0.7703557151876366,E:0.9593646420743888,F:0.8958285881020552,G:0.7003931606556157,A:0.9259135909783132,B:0.8782943100860323},B:{C:0,D:0.32056900601502597,E:0.21262657037927343,F:0.24113015764962006,G:0.3020558510426497,A:0.04005999941212325,B:0.3592573714296745}}};
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
		//作弊！！
		if(bars[bars.length-1][1] > bars[bars.length-1][6]){
			k = "C";    // 1比6多用大调
		}else if(bars[bars.length-1][1] < bars[bars.length-1][6]){
			K = "A";
		}
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
		vec = vecw;    // 1比6多用大调
	}else if(barlist[barlist.length-1][1] < barlist[barlist.length-1][6]){
		vec = vecw;
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
        //if(maxpos != -1)        res[position].splice(maxpos,1);
	});
	return res;
}