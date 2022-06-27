/*Generated Script*/
/**
 * small-pinyin, GPLv3.
 * @copyright asdfqw
 * @see https://gitee.com/asdfqw/small-pinyin/
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 */
var Pinyin = {
	/** 
	 * 内部排序函数，默认为(new Intl.Collator(...).compare)
	 * @private
	 * @param {string} a
	 * @param {string} b
	 * @return {number}
	 */
	_compare: new Intl.Collator('zh-Hans-CN-u-co-pinyin').compare, 
	
	/**
	 * @private
	 * @param {string} char 已确认为中文的单个字符
	 * @return {string} 拼音
	 */
	_getChar: function(char){
		var dict    = this.dict,
		    index   = dict.index,
		    items   = dict.items,
		    special = dict.special,
		    spitem = special[char],
		    cmp     = this._compare;
		/* 1. 检查是否有特例 */
		if(spitem !== undefined && spitem !== null){
			return spitem;
		}
		/* 2. 查顺序表 -- 一个写坏了的二分 */
		/* 查找索引中第一个比所查大的项目，向后退一格就是最小 */
		var left = 0, right = index.length, mid;
		while(left !== right){
			mid = Math.floor((left + right) / 2);
			if(cmp(index[mid],char) <= 0){
				/* +--------+--------+------+ */
				/* L        M        C      R */
				/* xxxxxxxxxx???????????????? */
				left = mid+1;
			} else {
				right = mid;
			}
		}
		return items[left-1];
	},
	dict: {index:Array.from("阿哎安肮凹八霸白扳邦谤包卑奔坌祊逼边杓蔈熛憋蹩邠冰拨卜嚓偲参掺粲仓操册岑噌叉差辿伥畅抄车抻柽吃茌充瘳出俶揣川遄疮吹槌春逴惙呲瓷匆凑粗蔟汆崔邨搓脞耷靼呆丹当刀盗嘚灯氐甸刁爹迭丁腚丢东都厾黩耑堆镦多堕婀崿恩儿咡发帆翻方纺飞分丰缶夫菔抚嘎该甘秆冈皋戈疙根庚工勾估瓜剐乖关光归瑰轨贵衮呙哈咍顸汉夯航蒿诃黑痕亨吽鸿齁乎斛花怀欢寰肓灰翚昏耠获讥姞加戋江艽阶巾京坰纠居椐焗娟噘橛军咔开刊闶尻匼肯吭空抠刳夸蒯宽匡亏馗坤扩垃来兰啷捞潦涝仂勒崚哩娌奁鲢良撩咧拎伶溜龙剅噜驴娈掠抡罗麻吗埋嫚鳗牤猫没门闷虻咪眠勉喵乜民皿名暝摸哞毪拿乃囡囔孬讷馁恁妮拈撵娘鸟捏宁妞农奴女疟挪噢讴趴拍潘乓逄抛呸喷怦丕枇偏剽氕姘乒萍钋剖仆七杞气掐千前呛悄且亲青邛丘区悛缺囷蚺儴娆惹人扔日茸柔如堧蕤闰若仨塞三桑搔涩杀山善伤捎奢畲申升尸媞收书刷衰闩双水吮说丝忪嗖苏狻虽睢孙唆他獭胎坍汤唐弢特螣剔天佻帖厅烃通偷凸湍推褪托挖歪弯尪危猥温翁挝幄乌夕虾仙县馅乡枭些心星凶休吁轩削勋獯丫押恹艳央幺猺鳐倻馌一漪因应哟佣优尤纡圉聿豫鸢曰晕匝灾糌牂遭则贼怎鄫扎斋沾瞻张钊蜇着贞镇争政之咫中仲州朱抓专妆隹肫卓孜宗邹租钻嘴尊昨䝙𬶨"), items:"a|ai|an|ang|ao|ba|ba|bai|ban|bang|bang|bao|bei|ben|ben|beng|bi|bian|biao|piao|biao|bie|bie|bin|bing|bo|bu|ca|cai|can|chan|can|cang|cao|ce|cen|ceng|cha|chai|chan|chang|chang|chao|che|chen|cheng|chi|chi|chong|chou|chu|chu|chuai|chuan|chuan|chuang|chui|chui|chun|chuo|chuo|ci|ci|cong|cou|cu|cu|cuan|cui|cun|cuo|cuo|da|da|dai|dan|dang|dao|dao|de|deng|di|dian|diao|die|die|ding|ding|diu|dong|dou|du|du|duan|dui|dun|duo|duo|e|e|en|er|er|fa|fan|fan|fang|fang|fei|fen|feng|fou|fu|fu|fu|ga|gai|gan|gan|gang|gao|ge|ge|gen|geng|gong|gou|gu|gua|gua|guai|guan|guang|gui|gui|gui|gui|gun|guo|ha|hai|han|han|hang|hang|hao|he|hei|hen|heng|hong|hong|hou|hu|hu|hua|huai|huan|huan|huang|hui|hui|hun|huo|huo|ji|ji|jia|jian|jiang|jiao|jie|jin|jing|jiong|jiu|ju|ju|ju|juan|jue|jue|jun|ka|kai|kan|kang|kao|ke|ken|keng|kong|kou|ku|kua|kuai|kuan|kuang|kui|kui|kun|kuo|la|lai|lan|lang|lao|liao|lao|le|lei|leng|li|li|lian|lian|liang|liao|lie|lin|ling|liu|long|lou|lu|l|luan|lve|lun|luo|ma|ma|mai|man|man|mang|mao|mei|men|men|meng|mi|mian|mian|miao|mie|min|min|ming|ming|mo|mou|mu|na|nai|nan|nang|nao|ne|nei|nen|ni|nian|nian|niang|niao|nie|ning|niu|nong|nu|n|nve|nuo|o|ou|pa|pai|pan|pang|pang|pao|pei|pen|peng|pi|pi|pian|piao|pie|pin|ping|ping|po|pou|pu|qi|qi|qi|qia|qian|qian|qiang|qiao|qie|qin|qing|qiong|qiu|qu|quan|que|qun|ran|rang|rao|re|ren|reng|ri|rong|rou|ru|ruan|rui|run|ruo|sa|sai|san|sang|sao|se|sha|shan|shan|shang|shao|she|she|shen|sheng|shi|shi|shou|shu|shua|shuai|shuan|shuang|shui|shun|shuo|si|song|sou|su|suan|sui|sui|sun|suo|ta|ta|tai|tan|tang|tang|tao|te|teng|ti|tian|tiao|tie|ting|ting|tong|tou|tu|tuan|tui|tun|tuo|wa|wai|wan|wang|wei|wei|wen|weng|wo|wo|wu|xi|xia|xian|xian|xian|xiang|xiao|xie|xin|xing|xiong|xiu|xu|xuan|xue|xun|xun|ya|ya|yan|yan|yang|yao|yao|yao|ye|ye|yi|yi|yin|ying|yo|yong|you|you|yu|yu|yu|yu|yuan|yue|yun|za|zai|zan|zang|zao|ze|zei|zen|zeng|zha|zhai|zhan|zhan|zhang|zhao|zhe|zhuo|zhen|zhen|zheng|zheng|zhi|zhi|zhong|zhong|zhou|zhu|zhua|zhuan|zhuang|zhui|zhun|zhuo|zi|zong|zou|zu|zuan|zui|zun|zuo|chu|ji".split('|'),special:function(a,b){var c={};for(var i=0;i<a.length;i++)c[a[i]]=b[i];return c}(Array.from("嗄啊鲌掰擘棓陂坋咇梣玚坻埫铳抽婤柷欻嘬踹圌椎婼堲酢酂阘焘扽嗲铤碡楯柁阏佴蕃彷艴呒旮呷扞纥给唝聒傀硅廆氿炔阚珩硔隺嬛珲砉诘菹桔噱剋龈裉隗肋峛俩磏呣妈孖嬷唛蹒么亹黾碈蓂谬嗯能辗您耨暖喔厖芘淜呇綮孅癿芎色洓森僧筛酾晒掞畬谁豉葰溚饧忑忒町钭透妧腕硊涴伣硍窨吖烻滧繇堨腋楪欹尢峿圫薁嶦瑱帧茋穜拽漴撞鿍鿎鿏㑇㑊㕮㘎㙍㙘㙦㛃㛚㛹㟃㠇㠓㤘㥄㧐㧑㧟㫰㬊㬎㬚㭎㭕㮾㰀㳇㳘㳚㴔㵐㶲㸆㸌㺄㻬㽏㿠䁖䂮䃅䃎䅟䌹䎃䎖䏝䏡䏲䐃䓖䓛䓨䓫䓬䗖䗛䗪䗴䜣䢼䣘䥽䦃䲟䲠䲢䴓䴔䴕䴖䴗䴘䴙䶮𠅤𠙶𠳐𡎚𡐓𣗋𣲗𣲘𣸣𤧛𤩽𤫉𥔲𥕢𥖨𥻗𦈡𦒍𦙶𦝼𦭜𦰡𧿹𨐈𨙸𨚕𨟠𨭉𨱇𨱏𨱑𨱔𨺙𩽾𩾃𩾌𪟝𪣻𪤗𪨰𪨶𪩘𪾢𫄧𫄨𫄷𫄸𫇭𫌀𫍣𫍯𫍲𫍽𫐄𫐐𫐓𫑡𫓧𫓯𫓶𫓹𫔍𫔎𫔶𫖮𫖯𫖳𫗧𫗴𫘜𫘝𫘦𫘧𫘨𫘪𫘬𫚕𫚖𫚭𫛭𫞩𫟅𫟦𫟹𫟼𫠆𫠊𫠜𫢸𫫇𫭟𫭢𫭼𫮃𫰛𫵷𫶇𫷷𫸩𬀩𬀪𬂩𬃊𬇕𬇙𬇹𬉼𬊈𬊤𬌗𬍛𬍡𬍤𬒈𬒔𬒗𬕂𬘓𬘘𬘡𬘩𬘫𬘬𬘭𬘯𬙂𬙊𬙋𬜬𬜯𬞟𬟁𬟽𬣙𬣞𬣡𬣳𬤇𬤊𬤝𬨂𬨎𬩽𬪩𬬩𬬭𬬮𬬱𬬸𬬹𬬻𬬿𬭁𬭊𬭎𬭚𬭛𬭤𬭩𬭬𬭯𬭳𬭶𬭸𬭼𬮱𬮿𬯀𬯎𬱖𬱟𬳵𬳶𬳽𬳿𬴂𬴃𬴊𬶋𬶍𬶏𬶐𬶟𬶠𬶮𬷕𬸘𬸚𬸣𬸦𬸪𬹼𬺈祢"),"sha|a|bo|bai|bo|bei|pi|fen|bi|qin|yang|di|tang|chong|chou|zhou|zhu|xu|zuo|chuai|chui|zhui|ruo|ji|zuo|zan|ta|tao|den|dia|ting|zhou|shun|tuo|yan|nai|bo|pang|bo|m|ga|xia|han|he|ji|hong|guo|kui|gui|wei|jiu|que|kan|heng|gong|he|xuan|hun|hua|jie|zu|jie|xue|kei|yin|ken|wei|lei|lie|liang|qian|m|ma|zi|mo|mai|pan|me|wei|min|hun|mi|miu|ng|neng|zhan|nin|nou|nuan|wo|mang|bi|peng|men|qing|xian|bie|xiong|shai|qi|sen|seng|shai|shi|shai|yan|yu|shui|chi|suo|da|xing|te|tui|ding|dou|tou|yuan|wan|hui|yuan|qian|yin|yin|a|shan|xiao|you|e|ye|die|qi|wang|wu|tuo|ao|shan|tian|zhen|di|tong|zhuai|shuang|zhuang|gang|ta|mai|zhou|yi|fu|han|duo|yao|xie|jie|tong|pian|si|jiu|meng|zhou|ling|song|hui|kuai|lang|huan|xian|che|gang|qu|lang|li|fu|chong|xu|ji|jue|yong|kao|huo|yu|tu|gan|huang|lou|lve|di|zha|can|jiong|ran|zeng|zhuan|shi|ti|jun|qiong|qu|ying|qi|zhuo|di|xiu|zhe|ting|xin|gong|tang|po|zhuo|yin|chun|teng|shi|jiao|lie|jing|ju|ti|pi|yan|xi|ou|bang|pian|kang|dang|wei|wu|fen|di|huan|xie|e|cao|zao|cha|xu|tong|gu|l|zhi|nuo|mu|guang|qi|bian|quan|ban|qiu|da|huang|zun|ni|an|mian|kang|ji|lou|liao|qu|she|yan|xian|yan|chi|yi|xun|wei|ji|tong|xian|xiao|xuan|yue|ni|rou|meng|fu|ji|xuan|ji|fan|jue|nie|yi|fu|yun|su|zhan|wen|jue|tao|lu|ti|yuan|xi|shi|ci|lie|kuang|men|liang|sui|hong|da|kui|xuan|ni|dan|e|qu|lun|lao|shan|xing|li|die|xin|kou|wei|xian|jia|zhi|wan|bei|guo|ou|xun|chan|he|li|dang|xun|que|geng|lan|long|xun|dan|yin|ting|huan|qian|chen|zhun|yan|mo|xiang|man|liang|pin|yi|dong|xu|zhu|jian|hen|yin|shi|hui|qi|you|xun|nong|yi|lun|chang|jin|shu|shen|lu|zhao|mu|du|hong|chun|bo|hou|weng|hui|pie|xi|hei|lin|sui|yin|gai|ji|tui|di|wei|pi|jiong|shen|tu|fei|huo|lin|ju|tuo|wei|zhao|la|lian|xi|bu|yan|yue|xian|zhuo|fan|xie|yi|ni".split('|'))}, 
	/**
	 * 获取单字符拼音
	 * @param {string} char 单个字符
	 * @return {string|null} 拼音 若不是汉字则 null
	 */
	isHanzi: function(char){
		return (/[\u4e00-\u9fd5]/.test(char));
	},
	getChar: function(char){
		if(this.isHanzi(char)){
			return this._getChar(char) || null;
		} else {
			return null;
		}
	},
	/**
	 * 获取拼音串
	 * @param {string} char 单个字符
	 * @return {string} 拼音，非汉字原样输出
	 */
	pinyin: function(str){
		var that = this;
		return Array.from(str).map(function(a){
			var tmp = that.getChar(a);
			return tmp ? tmp + ' ' : a;
		}).join('');
	},
};

//export Pinyin