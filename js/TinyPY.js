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
	dict: {index:Array.from("阿哎嗳嫒安肮凹袄八罷白扳邦谤包卑奔坌祊逼边杓蔈標憋蹩邠賓冰拨逋埗嚓偲参掺粲仓操冊岑噌叉拆辿伥畅抄车抻柽吃茌充瘳出俶揣川遄疮吹槌春逴惙呲瓷匆凑粗蔟汆崔邨搓脞耷哒靼呆带丹当忉盗嘚灯氐甸刁爹迭丁腚丟东都厾獨耑堆镦多堕婀崿诶恩陑咡发帆翻方纺飞分丰缶夫菔嘎该甘秆冈皋戈疙给根庚工勾咕毂瓜剐乖关光归硅瑰轨贵衮呙哈咍顸汉夯航蒿诃黑痕亨吽鸿齁乎斛花怀欢寰肓灰揮浍昏耠获讥姞蹐加戋江艽阶巾京坰纠居椐娟噘橛军珺咔开刊闶尻匼肯墾吭空抠刳夸蒯宽匡亏馗坤扩垃来兰啷捞潦涝仂勒崚哩娌俩奁鲢殓良撩咧拎伶溜龙剅噜驴旅娈掠抡罗麻罵埋嫚饅牤猫么沒门闷虻咪泌眠勉喵乜民皿名暝谬摸哞毪拿呐乃囡囔孬讷馁恁妮拈撵娘鸟捏宁妞农奴女疟挪喔讴趴拍潘乓逄抛呸喷怦丕枇偏剽氕姘乒萍钋剖仆七耆杞气掐千前呛悄且亲青邛丘区祛悛缺囷蚺儴娆惹人韌扔日茸柔如堧蕤闰若撒塞三桑搔涩杀篩山善伤捎奢畲申燊升尸媞收书刷衰闩双誰吮说丝忪嗖苏狻虽睢孙唆他獭挞胎坍汤唐弢特螣剔天佻帖厅烃通偷凸湍推吞托挖歪弯萬尪危猥温翁挝幄乌夕虾仙县馅乡枭些心星凶休吁轩削勋獯丫押恹艳央幺猺謠倻腋業一漪因应哟佣优尤纡圉聿豫鸢曰晕匝災糌牂遭则贼怎鄫扎斋沾氈张钊蜇贞镇争政之咫中仲州朱抓专妆隹肫卓孜宗邹租钻嘴尊昨䝙𬶨"), items:"a|ai|ai|ai|an|ang|ao|ao|ba|ba|bai|ban|bang|bang|bao|bei|ben|ben|beng|bi|bian|biao|piao|biao|bie|bie|bin|bin|bing|bo|bu|bu|ca|cai|can|chan|can|cang|cao|ce|cen|ceng|cha|chai|chan|chang|chang|chao|che|chen|cheng|chi|chi|chong|chou|chu|chu|chuai|chuan|chuan|chuang|chui|chui|chun|chuo|chuo|ci|ci|cong|cou|cu|cu|cuan|cui|cun|cuo|cuo|da|da|da|dai|dai|dan|dang|dao|dao|de|deng|di|dian|diao|die|die|ding|ding|diu|dong|dou|du|du|duan|dui|dun|duo|duo|e|e|ei|en|er|er|fa|fan|fan|fang|fang|fei|fen|feng|fou|fu|fu|ga|gai|gan|gan|gang|gao|ge|ge|gei|gen|geng|gong|gou|gu|gu|gua|gua|guai|guan|guang|gui|gui|gui|gui|gui|gun|guo|ha|hai|han|han|hang|hang|hao|he|hei|hen|heng|hong|hong|hou|hu|hu|hua|huai|huan|huan|huang|hui|hui|hui|hun|huo|huo|ji|ji|ji|jia|jian|jiang|jiao|jie|jin|jing|jiong|jiu|ju|ju|juan|jue|jue|jun|jun|ka|kai|kan|kang|kao|ke|ken|ken|keng|kong|kou|ku|kua|kuai|kuan|kuang|kui|kui|kun|kuo|la|lai|lan|lang|lao|liao|lao|le|lei|leng|li|li|lia|lian|lian|lian|liang|liao|lie|lin|ling|liu|long|lou|lu|lv|lv|luan|lve|lun|luo|ma|ma|mai|man|man|mang|mao|me|mei|men|men|meng|mi|mi|mian|mian|miao|mie|min|min|ming|ming|miu|mo|mou|mu|na|na|nai|nan|nang|nao|ne|nei|nen|ni|nian|nian|niang|niao|nie|ning|niu|nong|nu|nv|nve|nuo|o|ou|pa|pai|pan|pang|pang|pao|pei|pen|peng|pi|pi|pian|piao|pie|pin|ping|ping|po|pou|pu|qi|qi|qi|qi|qia|qian|qian|qiang|qiao|qie|qin|qing|qiong|qiu|qu|qu|quan|que|qun|ran|rang|rao|re|ren|ren|reng|ri|rong|rou|ru|ruan|rui|run|ruo|sa|sai|san|sang|sao|se|sha|shai|shan|shan|shang|shao|she|she|shen|shen|sheng|shi|shi|shou|shu|shua|shuai|shuan|shuang|shui|shun|shuo|si|song|sou|su|suan|sui|sui|sun|suo|ta|ta|ta|tai|tan|tang|tang|tao|te|teng|ti|tian|tiao|tie|ting|ting|tong|tou|tu|tuan|tui|tun|tuo|wa|wai|wan|wan|wang|wei|wei|wen|weng|wo|wo|wu|xi|xia|xian|xian|xian|xiang|xiao|xie|xin|xing|xiong|xiu|xu|xuan|xue|xun|xun|ya|ya|yan|yan|yang|yao|yao|yao|ye|ye|ye|yi|yi|yin|ying|yo|yong|you|you|yu|yu|yu|yu|yuan|yue|yun|za|zai|zan|zang|zao|ze|zei|zen|zeng|zha|zhai|zhan|zhan|zhang|zhao|zhe|zhen|zhen|zheng|zheng|zhi|zhi|zhong|zhong|zhou|zhu|zhua|zhuan|zhuang|zhui|zhun|zhuo|zi|zong|zou|zu|zuan|zui|zun|zuo|chu|ji".split('|'),special:function(a,b){var c={};for(var i=0;i<a.length;i++)c[a[i]]=b[i];return c}(Array.from("嗄啊欸嗌拗耙鲅鲌掰擘棓陂坋咇槟埔梣玚坻埫铳抽婤柷欻啜嘬踹圌椎婼茈茨堲酢酂沓阘骀刀叨焘扽嗲铤碡楯頓柁阏儿而兒佴蕃彷艴旮呷扞纥唝貢估呱鹄聒傀廆氿炔阚珩硔隺嬛珲哕砉诘藉菹噱焌剋龈隗肋峛磏浰捋呣妈孖媽嬷唛蹒亹宓黾碈蓂嗯吶能辗您耨暖厖芘淜桲曝俟呇綮孅癿芎岨葚仨挲色洓森僧筛酾掞畬谁棽豉葰溚拓饧忑忒町钭透妧硊涴伣硍窨吖烻滧繇堨楪欹尢峿圫薁嶦著瑱帧茋穜拽漴撞鿍鿎鿏㑇㑊㕮㘎㙍㙘㙦㛃㛚㛹㟃㠇㠓㤘㥄㧐㧑㧟㫰㬊㬎㬚㭎㭕㮾㰀㳇㳘㳚㴔㵐㶲㸆㸌㺄㻬㽏㿠䁖䂮䃅䃎䅟䌹䎃䎖䏝䏡䏲䐃䓖䓛䓨䓫䓬䗖䗛䗪䗴䜣䢼䣘䥽䦃䲟䲠䲢䴓䴔䴕䴖䴗䴘䴙䶮𠅤𠙶𠳐𡎚𡐓𣗋𣲗𣲘𣸣𤧛𤩽𤫉𥔲𥕢𥖨𥻗𦈡𦒍𦙶𦝼𦭜𦰡𧿹𨐈𨙸𨚕𨟠𨭉𨱇𨱏𨱑𨱔𨺙𩽾𩾃𩾌𪟝𪣻𪤗𪨰𪨶𪩘𪾢𫄧𫄨𫄷𫄸𫇭𫌀𫍣𫍯𫍲𫍽𫐄𫐐𫐓𫑡𫓧𫓯𫓶𫓹𫔍𫔎𫔶𫖮𫖯𫖳𫗧𫗴𫘜𫘝𫘦𫘧𫘨𫘪𫘬𫚕𫚖𫚭𫛭𫞩𫟅𫟦𫟹𫟼𫠆𫠊𫠜𫢸𫫇𫭟𫭢𫭼𫮃𫰛𫵷𫶇𫷷𫸩𬀩𬀪𬂩𬃊𬇕𬇙𬇹𬉼𬊈𬊤𬌗𬍛𬍡𬍤𬒈𬒔𬒗𬕂𬘓𬘘𬘡𬘩𬘫𬘬𬘭𬘯𬙂𬙊𬙋𬜬𬜯𬞟𬟁𬟽𬣙𬣞𬣡𬣳𬤇𬤊𬤝𬨂𬨎𬩽𬪩𬬩𬬭𬬮𬬱𬬸𬬹𬬻𬬿𬭁𬭊𬭎𬭚𬭛𬭤𬭩𬭬𬭯𬭳𬭶𬭸𬭼𬮱𬮿𬯀𬯎𬱖𬱟𬳵𬳶𬳽𬳿𬴂𬴃𬴊𬶋𬶍𬶏𬶐𬶟𬶠𬶮𬷕𬸘𬸚𬸣𬸦𬸪𬹼𬺈地"),"sha|a|ei|yi|niu|pa|ba|bo|bai|bo|bei|pi|fen|bi|bing|pu|chen|yang|di|tang|chong|chou|zhou|zhu|xu|chuo|zuo|chuai|chui|zhui|ruo|zi|ci|ji|zuo|zan|ta|ta|tai|dao|tao|tao|den|dia|ting|zhou|shun|dun|tuo|yan|er|er|er|nai|bo|pang|bo|ga|xia|han|he|hong|gong|gu|gua|hu|guo|kui|wei|jiu|que|kan|heng|gong|he|xuan|hun|yue|hua|jie|jie|zu|xue|qu|kei|yin|wei|lei|lie|qian|li|luo|m|ma|zi|ma|mo|mai|pan|wei|fu|min|hun|mi|n|ne|neng|zhan|nin|nou|nuan|mang|bi|peng|bo|bao|si|men|qing|xian|bie|xiong|ju|shen|sa|suo|se|qi|sen|seng|shai|shi|yan|yu|shui|chen|chi|jun|da|tuo|xing|te|tui|ding|dou|tou|yuan|hui|yuan|qian|yin|yin|a|shan|xiao|you|e|die|qi|wang|wu|tuo|ao|shan|zhu|tian|zhen|di|tong|zhuai|chong|zhuang|gang|ta|mai|zhou|yi|fu|han|duo|yao|xie|jie|tong|pian|si|jiu|meng|zhou|ling|song|hui|kuai|lang|huan|xian|che|gang|qu|lang|li|fu|chong|xu|ji|jue|yong|kao|huo|yu|tu|gan|huang|lou|lve|di|zha|can|jiong|ran|zeng|zhuan|shi|ti|jun|qiong|qu|ying|qi|zhuo|di|xiu|zhe|ting|xin|gong|tang|po|zhuo|yin|chun|teng|shi|jiao|lie|jing|ju|ti|pi|yan|xi|ou|bang|pian|kang|dang|wei|wu|fen|di|huan|xie|e|cao|zao|cha|xu|tong|gu|lv|zhi|nuo|mu|guang|qi|bian|quan|ban|qiu|da|huang|zun|ni|an|mian|kang|ji|lou|liao|qu|she|yan|xian|yan|chi|yi|xun|wei|ji|tong|xian|xiao|xuan|yue|ni|rou|meng|fu|ji|xuan|ji|fan|jue|nie|yi|fu|yun|su|zhan|wen|jue|tao|lu|ti|yuan|xi|shi|ci|lie|kuang|men|liang|sui|hong|da|kui|xuan|ni|dan|e|qu|lun|lao|shan|xing|li|die|xin|kou|wei|xian|jia|zhi|wan|bei|guo|ou|xun|chan|he|li|dang|xun|que|geng|lan|long|xun|dan|yin|ting|huan|qian|chen|zhun|yan|mo|xiang|man|liang|pin|yi|dong|xu|zhu|jian|hen|yin|shi|hui|qi|you|xun|nong|yi|lun|chang|jin|shu|shen|lu|zhao|mu|du|hong|chun|bo|hou|weng|hui|pie|xi|hei|lin|sui|yin|gai|ji|tui|di|wei|pi|jiong|shen|tu|fei|huo|lin|ju|tuo|wei|zhao|la|lian|xi|bu|yan|yue|xian|zhuo|fan|xie|yi|di".split('|'))}, 
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