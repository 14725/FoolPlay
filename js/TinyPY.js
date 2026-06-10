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
	dict: {index:Array.from("吖哎皑毐艾安俺犴卬敖袄岙八妭把坝百败扳阪办邦绑玤包雹宝报卑贝奔本坌祊泵逼荸匕币边贬卞杓表俵憋癿邠摈冰丙并拨伯簸卜逋卟不嚓偲才采菜参残惨灿仓操曹册岑层叉垞衩汊差侪虿辿婵产忏伥肠厂怅抄晁吵车彻抻尘衬柽丞逞秤吃弛尺彳充虫抽仇丑出刍杵亍揣啜川传舛串疮床创吹垂春纯逴惙呲词此次匆从凑徂促汆窜崔漼脆邨搓嵯厝哒达垯呆歹代丹𬘘旦当挡凼刀导到得地灯等邓氐狄诋弟掂典电刁吊爹迭丁酊订丢东董动都抖斗厾毒笃芏耑段队吨盹囤多夺朵剁婀讹厄恩儿尔二乏法帆凡反犯方防仿飞肥朏吠分坟份丰冯讽凤缶夫弗菔㕮父嘎该丐甘秆干冈岗杠皋杲告戈阁哿个根艮庚哽更工巩共勾岣构估古固瓜剐卦乖夬关莞毌光广归宄刽衮呙国果哈咍还海亥顸邗罕汉杭蒿蚝好号诃禾垎黑𬣳亨姮吽弘𫟹侯后乎囫虎互花华化怀欢环寰缓幻肓皇恍㿠灰回虺卉昏浑诨耠佸火或讥及几计加郏甲价戋拣见江讲匠艽角叫阶孑姐介巾仅劲京井净坰冏纠九旧居局咀巨娟卷倦噘孓军俊咔卡开凯忾刊坎看康亢考铐匼可克肯吭空孔𫸩叩刳库夸侉挎㧟块宽匡狂邝亏奎𫠆匮坤悃扩垃旯剌啦来赉兰览烂郎朗埌劳老涝仂了雷耒肋崚堎厘蠡力奁鲢敛练良两亮撩辽钌尥列邻凛吝伶岭令溜刘柳六龙陇剅嵝陋噜卢卤甪驴吕垏娈掠仑啰倮泺麻马蚂吗埋买劢嫚蛮满𬜬邙莽毛卯芼没每妹门呇虻勐孟眯米汨眠丏眄苗杪妙乜灭民皿名暝谟抹牟母木拿乸那乃佴男赧囔馕呶垴闹恁尼你昵拈年捻廿鸟尿陧宁佞忸农奴努怒女恧疟挪诺讴𠙶怄趴杷帕俳哌潘爿判乓彷抛刨泡呸陪沛盆怦芃椪丕皮琵匹屁偏骈谝片剽嫖殍票氕苤姘玭牝乒平钋婆叵迫抔仆匍朴铺七亓乞气掐恰千前浅欠呛强抢炝悄乔巧俏切亲芩锓吣青勍苘庆邛丘囚区劬取去悛全犬劝炔却囷裙蚺冉儴嚷娆人忍刃日戎柔如汝入阮汭闰若仨撒卅塞三伞嗓搔扫埽色杀唼山闪讪伤垧上捎勺少𪨶舌舍申什沈肾升省圣尸十史士手寿书秫属术刷衰帅闩涮双帨顺妁丝巳忪㧐讼嗖叟苏夙狻蒜虽绥岁孙损唆所他鿎拓台太坍坛忐叹汤唐帑烫弢洮特疼剔啼屉天田忝掭佻条朓眺帖厅廷侹通仝统恸头凸图土兔湍团𬯎退吞屯圫驮妥柝挖瓦袜弯丸宛万尢亡网妄危韦伟卫温文刎问翁瓮挝沃幄乌无五兀夕习枲戏呷匣下仙伭冼县乡详享向枭洨小孝些协泄心囟星刑醒兴凶雄诇休朽秀𬣙嘘许旭轩玄选泫削穴雪血勋寻训丫牙哑轧恹延沇厌艳酽央扬仰怏幺爻猺杳药倻爷也业一仪乙乂因吟尹印应迎郢映哟佣喁永用优尤友又纡于与玉鸢元苑曰月晕云允孕匝杂灾宰再糌昝暂牂奘遭早灶则仄贼鄫锃扎札拃乍斋债沾斩占张仉丈钊爪召蜇折者这贞诊圳争峥拯正之执止至中肿仲州妯肘纣朱竹主伫抓专转妆壮隹坠肫准拙汋孜子字宗总纵邹奏租足诅钻缵最尊僔昨左作"), items:"a|ai|ai|ai|ai|an|an|an|ang|ao|ao|ao|ba|ba|ba|ba|bai|bai|ban|ban|ban|bang|bang|bang|bao|bao|bao|bao|bei|bei|ben|ben|ben|beng|beng|bi|bi|bi|bi|bian|bian|bian|biao|biao|biao|bie|bie|bin|bin|bing|bing|bing|bo|bo|bo|bo|bu|bu|bu|ca|cai|cai|cai|cai|can|can|can|can|cang|cao|cao|ce|cen|ceng|cha|cha|cha|cha|chai|chai|chai|chan|chan|chan|chan|chang|chang|chang|chang|chao|chao|chao|che|che|chen|chen|chen|cheng|cheng|cheng|cheng|chi|chi|chi|chi|chong|chong|chou|chou|chou|chu|chu|chu|chu|chuai|chuai|chuan|chuan|chuan|chuan|chuang|chuang|chuang|chui|chui|chun|chun|chuo|chuo|ci|ci|ci|ci|cong|cong|cou|cu|cu|cuan|cuan|cui|cui|cui|cun|cuo|cuo|cuo|da|da|da|dai|dai|dai|dan|dan|dan|dang|dang|dang|dao|dao|dao|de|de|deng|deng|deng|di|di|di|di|dian|dian|dian|diao|diao|die|die|ding|ding|ding|diu|dong|dong|dong|dou|dou|dou|du|du|du|du|duan|duan|dui|dun|dun|dun|duo|duo|duo|duo|e|e|e|en|er|er|er|fa|fa|fan|fan|fan|fan|fang|fang|fang|fei|fei|fei|fei|fen|fen|fen|feng|feng|feng|feng|fou|fu|fu|fu|fu|fu|ga|gai|gai|gan|gan|gan|gang|gang|gang|gao|gao|gao|ge|ge|ge|ge|gen|gen|geng|geng|geng|gong|gong|gong|gou|gou|gou|gu|gu|gu|gua|gua|gua|guai|guai|guan|guan|guan|guang|guang|gui|gui|gui|gun|guo|guo|guo|ha|hai|hai|hai|hai|han|han|han|han|hang|hao|hao|hao|hao|he|he|he|hei|hen|heng|heng|hong|hong|hong|hou|hou|hu|hu|hu|hu|hua|hua|hua|huai|huan|huan|huan|huan|huan|huang|huang|huang|huang|hui|hui|hui|hui|hun|hun|hun|huo|huo|huo|huo|ji|ji|ji|ji|jia|jia|jia|jia|jian|jian|jian|jiang|jiang|jiang|jiao|jiao|jiao|jie|jie|jie|jie|jin|jin|jin|jing|jing|jing|jiong|jiong|jiu|jiu|jiu|ju|ju|ju|ju|juan|juan|juan|jue|jue|jun|jun|ka|ka|kai|kai|kai|kan|kan|kan|kang|kang|kao|kao|ke|ke|ke|ken|keng|kong|kong|kou|kou|ku|ku|kua|kua|kua|kuai|kuai|kuan|kuang|kuang|kuang|kui|kui|kui|kui|kun|kun|kuo|la|la|la|la|lai|lai|lan|lan|lan|lang|lang|lang|lao|lao|lao|le|le|lei|lei|lei|leng|leng|li|li|li|lian|lian|lian|lian|liang|liang|liang|liao|liao|liao|liao|lie|lin|lin|lin|ling|ling|ling|liu|liu|liu|liu|long|long|lou|lou|lou|lu|lu|lu|lu|lv|lv|lv|luan|lve|lun|luo|luo|luo|ma|ma|ma|ma|mai|mai|mai|man|man|man|man|mang|mang|mao|mao|mao|mei|mei|mei|men|men|meng|meng|meng|mi|mi|mi|mian|mian|mian|miao|miao|miao|mie|mie|min|min|ming|ming|mo|mo|mou|mu|mu|na|na|na|nai|nai|nan|nan|nang|nang|nao|nao|nao|nen|ni|ni|ni|nian|nian|nian|nian|niao|niao|nie|ning|ning|niu|nong|nu|nu|nu|nv|nv|nve|nuo|nuo|ou|ou|ou|pa|pa|pa|pai|pai|pan|pan|pan|pang|pang|pao|pao|pao|pei|pei|pei|pen|peng|peng|peng|pi|pi|pi|pi|pi|pian|pian|pian|pian|piao|piao|piao|piao|pie|pie|pin|pin|pin|ping|ping|po|po|po|po|pou|pu|pu|pu|pu|qi|qi|qi|qi|qia|qia|qian|qian|qian|qian|qiang|qiang|qiang|qiang|qiao|qiao|qiao|qiao|qie|qin|qin|qin|qin|qing|qing|qing|qing|qiong|qiu|qiu|qu|qu|qu|qu|quan|quan|quan|quan|que|que|qun|qun|ran|ran|rang|rang|rao|ren|ren|ren|ri|rong|rou|ru|ru|ru|ruan|rui|run|ruo|sa|sa|sa|sai|san|san|sang|sao|sao|sao|se|sha|sha|shan|shan|shan|shang|shang|shang|shao|shao|shao|she|she|she|shen|shen|shen|shen|sheng|sheng|sheng|shi|shi|shi|shi|shou|shou|shu|shu|shu|shu|shua|shuai|shuai|shuan|shuan|shuang|shui|shun|shuo|si|si|song|song|song|sou|sou|su|su|suan|suan|sui|sui|sui|sun|sun|suo|suo|ta|ta|ta|tai|tai|tan|tan|tan|tan|tang|tang|tang|tang|tao|tao|te|teng|ti|ti|ti|tian|tian|tian|tian|tiao|tiao|tiao|tiao|tie|ting|ting|ting|tong|tong|tong|tong|tou|tu|tu|tu|tu|tuan|tuan|tui|tui|tun|tun|tuo|tuo|tuo|tuo|wa|wa|wa|wan|wan|wan|wan|wang|wang|wang|wang|wei|wei|wei|wei|wen|wen|wen|wen|weng|weng|wo|wo|wo|wu|wu|wu|wu|xi|xi|xi|xi|xia|xia|xia|xian|xian|xian|xian|xiang|xiang|xiang|xiang|xiao|xiao|xiao|xiao|xie|xie|xie|xin|xin|xing|xing|xing|xing|xiong|xiong|xiong|xiu|xiu|xiu|xu|xu|xu|xu|xuan|xuan|xuan|xuan|xue|xue|xue|xue|xun|xun|xun|ya|ya|ya|ya|yan|yan|yan|yan|yan|yan|yang|yang|yang|yang|yao|yao|yao|yao|yao|ye|ye|ye|ye|yi|yi|yi|yi|yin|yin|yin|yin|ying|ying|ying|ying|yo|yong|yong|yong|yong|you|you|you|you|yu|yu|yu|yu|yuan|yuan|yuan|yue|yue|yun|yun|yun|yun|za|za|zai|zai|zai|zan|zan|zan|zang|zang|zao|zao|zao|ze|ze|zei|zeng|zeng|zha|zha|zha|zha|zhai|zhai|zhan|zhan|zhan|zhang|zhang|zhang|zhao|zhao|zhao|zhe|zhe|zhe|zhe|zhen|zhen|zhen|zheng|zheng|zheng|zheng|zhi|zhi|zhi|zhi|zhong|zhong|zhong|zhou|zhou|zhou|zhou|zhu|zhu|zhu|zhu|zhua|zhuan|zhuan|zhuang|zhuang|zhui|zhui|zhun|zhun|zhuo|zhuo|zi|zi|zi|zong|zong|zong|zou|zou|zu|zu|zu|zuan|zuan|zui|zun|zun|zuo|zuo|zuo".split('|'),special:function(a,b){var c={};for(var i=0;i<a.length;i++)c[a[i]]=b[i];return c}(Array.from("肮盎凹吧掰白北呗坋甭琫瘪跛醭藏草噌蹭茝耖扯碜宠铳臭闯蠢粗存忖寸脞大捯嘚扽嗲短堆楯摁发珐放粉艴呒旮尕尬改给哏拐逛棍过蛤夯沆痕恨堼硔唝讧齁吼坏嬛嵴麂扛尻壳剋裉硿箜控口苦款夼困喇啷捞勒嘞冷哩俩磏咧拎哢䁖氇卵乱抡𫭢论呣妈孖牤猫么们咪喵蓂酩命谬摸哞某毪囡婻齉孬讷呢馁内能嗯妮娘酿捏您甯凝妞牛弄耨暖喔噢哦拍耪胖喷捧埤品桲剖拤且糗瘸让扰绕惹热扔仍冗肉堧蕤蕊赛桑丧森僧啥傻筛晒裳畬畲谁绳匙收耍甩爽水吮说死嗽俗髓遢胎讨套忑忒熥荑绨体铁餮圢町偷透疃彖推腿娃哇歪崴外蓊我涴写伈湑徐蓿咺呀烻墕滧繇鳐远咋咱驵凿怎谮宅窄着怔拽走攥嘴嘬"),"ang|ang|ao|ba|bai|bai|bei|bei|fen|beng|beng|bie|bo|bu|cang|cao|ceng|ceng|chai|chao|che|chen|chong|chong|chou|chuang|chun|cu|cun|cun|cun|cuo|da|dao|de|den|dia|duan|dui|shun|en|fa|fa|fang|fen|bo|m|ga|ga|ga|gai|ji|gen|guai|guang|gun|guo|ha|hang|hang|hen|hen|heng|gong|hong|hong|hou|hou|huai|xuan|ji|ji|kang|kao|ke|kei|ken|kong|kong|kong|kou|ku|kuan|kuang|kun|la|lang|lao|lei|lei|leng|li|liang|qian|lie|lin|long|lou|lu|luan|luan|lun|lun|lun|m|ma|zi|mang|mao|me|men|mi|miao|mi|ming|ming|miu|mo|mou|mou|mu|nan|nan|nang|nao|ne|ne|nei|nei|neng|ng|ni|niang|niang|nie|nin|ning|ning|niu|niu|nong|nou|nuan|wo|o|o|pai|pang|pang|pen|peng|pi|pin|po|pou|qia|qie|qiu|que|rang|rao|rao|re|re|reng|reng|rong|rou|ruan|rui|rui|sai|sang|sang|sen|seng|sha|sha|shai|shai|shang|yu|she|shui|sheng|shi|shou|shua|shuai|shuang|shui|shun|shuo|si|sou|su|sui|ta|tai|tao|tao|te|tui|teng|ti|ti|ti|tie|tie|ting|ding|tou|tou|tuan|tuan|tui|tui|wa|wa|wai|wai|wai|weng|wo|yuan|xie|xin|xu|xu|xu|xuan|ya|shan|yan|xiao|you|yao|yuan|za|zan|zang|zao|zen|zen|zhai|zhai|zhe|zheng|zhuai|zou|zuan|zui|zuo".split('|'))}, 
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
