/* ============================================================
   fengwu.js —— 「侨都风物」页的全部数据与交互
   ┌─ 1. FOOD / SCENERY：美食与美景图鉴的数据（★ 加条目、改文案、改照片路径都只动这两个数组 ★）
   ├─ 2. QUIZ：侨都知多少小测的题目与答案
   ├─ 3. ROUTES / ROUTE_RULES：路线推荐器（编者写的几天 × 偏好，加上自动规划的分组规则）
   ├─ 4. 渲染：筛选、卡片、详情弹层、"我去过"打卡（存浏览器本地，不需要后端）
   ├─ 5. 小测：即时判分、解析、按分数给称号
   ├─ 6. 长图：canvas 画一张竖版海报，可以下载或在手机上长按保存
   └─ 7. 配置：FENGWU_CFG，样式参数集中在这里
   页面骨架在 fengwu.html，外观在 css/fengwu.css。
   ============================================================ */

/* ------------------------------------------------------------
   1. 图鉴数据
   字段含义：
     id     —— 唯一编号，别改（打卡记录和小测解析都靠它）
     name   —— 名称。下面 3.2「自动规划的规则」按名字里的关键词分组，
               所以改条目名字之前扫一眼 ROUTE_RULES，别让某条玩法突然凑不出站。
     town   —— 区县，必须从下面 FENGWU_TOWNS 里选，筛选才分得开
     line   —— 卡片上的一句话（20 字上下最好）
     detail —— 弹层里的详情，两三句
     tip    —— 实用提示（怎么去、什么时候去、怎么点）
     img    —— ★ 照片路径就写在这一条里，每条都写死，页面不按文件名猜 ★
               美食：填 "images/fengwu/<条目id>.jpg"。那批是 AIGC 水彩插画，图上会自动压「AI 生成示意图」角标。
               美景：填 "images/scenery/<条目id>.jpg"。那批是真实照片，
                     46 条各叫什么名、放了没，清单在 images/scenery/README.md（那份清单不上线）。
               换照片两条路：① 改这一条的 img 路径；② 按原文件名同名覆盖目录里的文件（代码不用动）。
               路径写错或文件不在，这一格就退回描金占位块，不会出破图图标。
               加图或换图之后跑一次 python tools/make-thumbs.py 生成缩略图，再 python tools/sync-deploy.py 同步发布。
               两边都建议 4:3 横构图，宽 800–1200、单张 200KB 以内。
     realImg —— 这条的配图是真实照片就写 realImg: true，角标和 alt 里的「AI 生成示意图」字样自动去掉；
               不写就按 AIGC 示意图标注。现状：美景 46 条全写了（真实照片），美食 28 条全没写（AI 插画）。
   ⚠ 文案口径：这一节是"稳妥概述"，凡是年份、称号、数量、片名这类硬事实，
      旁边都用「待核实」标了出来。评奖前请逐条对官方资料（江门市政府网、
      各区政府网、世界遗产名录等），核实完把注释里的"待核实"去掉。
   ------------------------------------------------------------ */

/* 区县筛选的顺序，"全部"是第 0 项 */
const FENGWU_TOWNS = ["全部", "蓬江", "江海", "新会", "台山", "开平", "鹤山", "恩平"];

const FOOD = [
  {
    id: "pjiang-langua", name: "杜阮凉瓜", town: "蓬江", img: "images/fengwu/pjiang-langua.jpg",
    line: "杜阮镇的凉瓜粒大肉厚，苦味过后有回甘。",
    detail: "杜阮凉瓜（苦瓜）是蓬江区杜阮镇出名的本地蔬菜，瘤粒饱满、肉厚核少，"
          + "本地做法有凉瓜排骨汤、酿凉瓜和冰镇蘸酱，夏天饭馆几乎家家有。",
    tip: "怕苦挑颜色偏浅黄、瘤粒宽的，苦味相对轻一点。"
    // 待核实：是否为国家地理标志产品
  },
  {
    id: "hetang-congcai", name: "荷塘冲菜", town: "蓬江", img: "images/fengwu/hetang-congcai.jpg",
    line: "荷塘镇腌出来的那口脆菜，咸里带酸，配白粥最老实。",
    detail: "冲菜用芥菜一类的青菜晒到半干再腌制，蓬江区荷塘镇一带做得出名，颜色偏黄绿、咬下去脆。家常做法是拿它炒五花肉、蒸肉末，或者切一点进白粥。",
    tip: "腌制品咸，下锅前先用清水冲一遍、菜本身少放盐；当配菜别当主菜。"
    // 待核实：“荷塘冲菜”的特产或非遗称号表述、原料具体是哪种芥菜
  },
  {
    id: "waihai-mian", name: "外海面", town: "江海", img: "images/fengwu/waihai-mian.jpg",
    line: "外海街道压出来的竹升蛋面，细得像线，捞起来不带汤水。",
    detail: "外海面出自江海区外海街道，过去是墟镇面店的手艺：面团用竹升一类工具反复压打，擀薄后切成细面，煮好过冷河再捞，面身爽弹、根根分明。本地吃面讲究汤、面分开，靠的是这一手压面功夫。",
    tip: "面店多半午市最热闹，去晚了容易卖完；想要汤面不糊，点的时候说一句“汁另上”。"
    // 待核实：“外海面”的规范名称、其制作技艺是否列入非遗名录
  },
  {
    id: "gujing-shae", name: "古井烧鹅", town: "新会", img: "images/fengwu/gujing-shae.jpg",
    line: "荔枝木明火烤的脆皮烧鹅，新会酒席上的头一道硬菜。",
    detail: "古井镇靠崖门水道，烧鹅用本地养的肥鹅，腌好后挂进炉里以荔枝木一类硬柴明火烤，"
          + "出来皮脆、肉带汁，斩件时那层油亮的脆皮最见功夫。镇上的烧鹅一条街饭馆连铺，半只一只都点得。",
    tip: "想要烧鹅汁捞饭先问一句有没有；周末中午排队，改晚市或提前一点去。"
    // 待核实：具体燃料与腌料配方、"古井烧鹅"做法的官方表述
  },
  {
    id: "xinhui-chenpi", name: "新会陈皮入馔", town: "新会", img: "images/fengwu/xinhui-chenpi.jpg",
    line: "一瓣陈皮放进汤里、糖水里，柑香把整道菜压住。",
    detail: "新会陈皮是茶枝柑的果皮晒干陈化而成，存放年头越长香气越沉。本地人拿它煲汤、焖肉、"
          + "做陈皮红豆沙，也直接泡水喝；柑香里带一点药香，是侨乡味觉的一张名片。",
    tip: "买整皮去新会的陈皮店或陈皮村；散装、年份说不清的别当“老皮”价钱买。"
    // 待核实：是否为国家地理标志产品、陈化年限的规范说法（站内一律写"三年以上"前先查）
  },
  {
    id: "xinhui-niurouwan", name: "新会牛肉丸", town: "新会", img: "images/fengwu/xinhui-niurouwan.jpg",
    line: "手打出来的牛肉丸，咬开带汁，配一碗粗面就是一顿。",
    detail: "新会一带的牛肉丸靠反复摔打打出弹性，煮好后外皮弹、内里带汁，常见吃法是牛肉丸汤配粗面或河粉，也直接下火锅。",
    tip: "看汤便知丸子好坏：好丸子的汤不该浑浊；打包外卖先问一句是不是现煮。"
    // 待核实：“新会牛肉丸”是否列入地方非遗、手工打制的规范说法
  },
  {
    id: "xinhui-tianshuiluobo", name: "新会甜水萝卜", town: "新会", img: "images/fengwu/xinhui-tianshuiluobo.jpg",
    line: "围垦水田边长的水萝卜，生吃不辣、煲汤带一点甜。",
    detail: "新会一带是冲积平原，水土偏淡，种出来的水萝卜个头大、纤维少，本地人冬天拿它煲汤、焖羊肉、切丝做馅，是时令家常菜。",
    tip: "季节菜，冬天最当造；挑拿在手里沉的，糠心的少。"
    // 待核实：“甜水萝卜”的确切产地（是否指某个镇）、是否地理标志产品
  },
  {
    id: "xinhui-hechong", name: "新会禾虫", town: "新会", img: "images/fengwu/xinhui-hechong.jpg",
    line: "水田里收上来的禾虫，本地人拿它煎蛋、蒸猪肉。",
    detail: "禾虫是稻田里长出的一类环节动物，秋收前后随水从田里收上来。新会一带水田多，本地做法有禾虫煎蛋、禾虫蒸肉、瓦钵焗禾虫，咸鲜里带一点草药气，是季节性的重口好菜。",
    tip: "一年就那一茬，见到再点；吐沙处理不干净会有泥味，挑做得久的店。"
    // 待核实：禾虫在新会的具体产地说法（“南坦禾虫”这类地名要点名才敢写）、当造月份
  },
  {
    id: "xinhui-liangguo", name: "新会陈皮凉果", town: "新会", img: "images/fengwu/xinhui-liangguo.jpg",
    line: "陈皮做的梅、姜、桔饼，侨乡人带出省的手信。",
    detail: "新会除了把陈皮入汤入菜，也拿它做凉果饼食：陈皮梅、陈皮姜、陈皮桔饼一类，甜里带回甘的柑香。过去华侨出洋时带一罐在路上吃，是侨乡手信里常见的一样。",
    tip: "当糖果吃就好；买散装先问一句用的是不是新会皮，两者价钱差得远。"
    // 待核实：陈皮凉果的传统作坊与代表字号（正文一律不写品牌名）
  },
  {
    id: "taishan-huangshanfan", name: "台山黄鳝饭", town: "台山", img: "images/fengwu/taishan-huangshanfan.jpg",
    line: "鳝肉撕成丝和米饭同焗，锅底那层饭焦最抢手。",
    detail: "台山一带的做法：黄鳝蒸熟去骨、撕成丝，与米饭一起回锅焗干水汽，"
          + "饭粒分明又不硬，鳝香吃进米里。镇上饭馆多用当季鳝鱼，一人点一份刚好两人吃。",
    tip: "想要饭焦（锅巴）可以让师傅多焗一会儿；配一碗鲫鱼或猪骨汤不腻。"
  },
  {
    id: "taishan-shenghao", name: "台山生蚝与都斛海鲜", town: "台山", img: "images/fengwu/taishan-shenghao.jpg",
    line: "镇海湾外的咸淡水养出肥蚝，都斛的海鲜摊排成一条街。",
    detail: "台山海岸线长、近海养殖多，生蚝以都斛、川岛一带出名，常见炭烧、蒜蓉蒸和蚝烙三种做法。"
          + "都斛镇上的海鲜市场可以现买、再拿到附近饭馆加工，是本地人吃海鲜的常规操作。",
    tip: "“市场买 + 饭馆加工”先问清加工费；休渔期以养殖和冰鲜为主，别信“今日现捕”。"
    // 待核实：休渔期具体时段（南海伏季休渔通常为 5—8 月，年份会调），以及都斛"海鲜街"的正式名称
  },
  {
    id: "taishan-qingxie", name: "台山青蟹", town: "台山", img: "images/fengwu/taishan-qingxie.jpg",
    line: "咸淡水交汇的海湾养出的青蟹，带膏时最抢手。",
    detail: "台山海岸一带有咸淡水交汇的海湾与围垦水域，青蟹在这一带长大，本地常见做法是姜葱炒、清蒸和煮粥，母蟹带膏的时候更受追捧。",
    tip: "挑蟹腿硬实、拿在手里沉的；休渔期以养殖为主，别信“野生现捞”的说法。"
    // 待核实：台山是否被称为“中国青蟹之乡”、具体海湾与产地名称（正文不写数字与称号）
  },
  {
    id: "taishan-wencun-yusheng", name: "台山鱼生", town: "台山", img: "images/fengwu/taishan-wencun-yusheng.jpg",
    line: "鲜活淡水鱼切到透光，拌十几种配料吃。",
    detail: "台山一带有吃鱼生的老吃法：鲜活淡水鱼放血起肉、片成薄片，拌花生、芝麻、姜丝、柠檬叶丝一类配料，用花生油或酱油提味，吃的是一口鲜和脆。",
    tip: "生食淡水鱼有寄生虫风险，孕妇、小孩、肠胃弱的人别吃；要吃就挑处理规范的老店。"
    // 待核实：“汶村鱼生”这类具体产地说法与技艺是否列入非遗（先只写“台山一带”，不点名）
  },
  {
    id: "guanghai-xianyu", name: "广海咸鱼", town: "台山", img: "images/fengwu/guanghai-xianyu.jpg",
    line: "广海渔港腌晒的咸鱼，咸香重，最下饭。",
    detail: "台山广海镇是老渔港，过去鲜鱼多、冰少，就靠盐腌日晒存下来，咸鱼回来蒸肉、煎香、煲仔饭上放一片，是本地家常味的底子。",
    tip: "咸度不低，蒸之前冲一遍水、整桌菜就少放盐；别当常规菜天天吃。"
    // 待核实：“广海咸鱼”腌制技艺是否列入非遗、常用鱼种的说法
  },
  {
    id: "chuandao-xiajiang", name: "川岛虾酱", town: "台山", img: "images/fengwu/chuandao-xiajiang.jpg",
    line: "小虾加盐捣烂发酵的一勺酱，炒通菜、蒸肉都靠它提味。",
    detail: "川岛一带的渔家把小杂虾加盐捣烂发酵成虾酱，气味冲、咸鲜重，本地常用来炒通菜（蕹菜）、蒸猪肉，或兑进蘸料里。",
    tip: "一次只放半勺，放了它就不再另加盐；开封后冷藏、尽快吃完。"
    // 待核实：虾酱在台山/川岛的具体产地说法，“虾酱”与“虾膏”是否同物
  },
  {
    id: "taishan-manyu", name: "台山鳗鱼", town: "台山", img: "images/fengwu/taishan-manyu.jpg",
    line: "咸淡水养出的鳗鱼，鲜吃之外更多是晒成鳗干。",
    detail: "台山海岸线长、滩涂多，鳗鱼的养殖和捕捞都有规模；除鲜食之外，本地把鳗鱼剖开腌晒成干，蒸来下饭、煲粥提鲜。",
    tip: "鳗干偏咸，蒸之前泡一会儿；买的时候挑肉色透亮的，发暗发黄的别要。"
    // 待核实：“台山鳗鱼”是否为国家地理标志产品（养殖规模等数字一律不写）
  },
  {
    id: "kaiping-magang-e", name: "开平马冈鹅", town: "开平", img: "images/fengwu/kaiping-magang-e.jpg",
    line: "马冈镇的本地鹅，肉紧、皮下脂肪薄，烧卤都撑得住。",
    detail: "马冈鹅是开平马冈镇一带的地方鹅种，当地有烧鹅、白切、醉鹅等做法，"
          + "侨乡村落的宴席和墟镇老店里都常见它。",
    tip: "看碉楼那天把午饭放在马冈镇或赤坎，顺路；晚市去容易售罄。"
    // 待核实：是否为地方畜禽遗传资源、"马冈鹅"名称的官方表述
  },
  {
    id: "kaiping-doufujiao", name: "开平豆腐角", town: "开平", img: "images/fengwu/kaiping-doufujiao.jpg",
    line: "酿过的豆腐煎到两面结壳，老街下午的零嘴。",
    detail: "豆腐角是把豆腐切块、中间酿入鱼胶或肉馅，煎至金黄后再淋汁或略焖，"
          + "外皮带一点脆、里面还是嫩的。开平、台山的老街店铺都做得出来。",
    tip: "刚出锅最好吃；配一碗濑粉或白粥就能当一顿饭。"
  },
  {
    id: "chikan-yazhou", name: "赤坎鸭粥", town: "开平", img: "images/fengwu/chikan-yazhou.jpg",
    line: "鸭汤熬到绵的粥，鸭肉拆件另蘸姜葱。",
    detail: "开平赤坎一带的鸭粥是把鸭煮到刚熟、拆件后铺在粥面上，粥底用鸭汤熬出米浆，鸭肉蘸姜葱吃，鸭骨再回锅继续熬粥。",
    tip: "粥店开得晚的多，去之前先问有没有留鸭；一份粥两个人分刚好。"
    // 待核实：“赤坎鸭粥”是否算赤坎招牌、常见写法（别与“赤坎华侨古镇”混称）
  },
  {
    id: "kaiping-niujiaopi", name: "开平牛脚皮", town: "开平", img: "images/fengwu/kaiping-niujiaopi.jpg",
    line: "牛蹄慢熬到胶质化开，晾凉凝成一块再切件。",
    detail: "牛脚皮是开平一带宴席和小店里的老菜：牛蹄去骨长时间熬煮，胶质溶进汤里，晾凉后自然凝成整块，吃时切件，可以凉拌也可以回锅焖，口感弹而不硬。",
    tip: "冷盘更稳妥，夏天别在室温放太久；牙口不好就挑焖得软一点的。"
    // 待核实：“牛脚皮”在开平的规范写法、常见做法，以及它算不算当地名菜
  },
  {
    id: "heshan-gulao-mian", name: "鹤山古劳蛋面", town: "鹤山", img: "images/fengwu/heshan-gulao-mian.jpg",
    line: "水乡老面店压出来的竹升蛋面，面身细、蛋香重。",
    detail: "古劳镇是珠三角水乡，河涌之间留着不少做面、晒面的老铺。"
          + "竹升压打出来的蛋面爽弹，配腩汁或猪手汁是本地吃法。",
    tip: "逛完古劳水乡再吃一碗，顺路；一份面加一件云吞是常见点法。"
    // 待核实：具体老店名称与"竹升面"工艺的古劳本地说法
  },
  {
    id: "heshan-donggu-jiangyou", name: "鹤山东古酱油", town: "鹤山", img: "images/fengwu/heshan-donggu-jiangyou.jpg",
    line: "鹤山老酱园缸晒出来的酱油，五邑厨房的底味。",
    detail: "东古酱油出自鹤山，走的是缸晒发酵的老路子，本地人蒸鱼、调汤、捞面都用它，也常被当成侨乡味道带出省外。",
    tip: "看标签上“氨基酸态氮”那栏，数值高鲜味相对足；生抽调味、老抽上色，别买混。"
    // 待核实：“东古”字号的创始年份与“中华老字号”称号表述（正文一律不写年份）
  },
  {
    id: "heshan-hongcha", name: "鹤山红茶", town: "鹤山", img: "images/fengwu/heshan-hongcha.jpg",
    line: "珠三角山地做出来的红茶，甜润、带一点薯香。",
    detail: "鹤山在珠三角一带算是有种茶、制红茶传统的产区，山地气候湿润，做出的红茶汤色偏深、口感甜润，本地也拿它入茶点。",
    tip: "第一泡别闷太久；想试先买小样，别一次囤整箱。"
    // 待核实：鹤山种茶历史的年份说法、“鹤山红茶”是否地理标志产品
  },
  {
    id: "enping-lecai", name: "恩平簕菜", town: "恩平", img: "images/fengwu/enping-lecai.jpg",
    line: "带刺的野生藤芽，炒过之后先苦后甘。",
    detail: "簕菜是恩平一带采野生嫩芽入馔的蔬菜，清炒、做汤、焙成簕菜茶都有。"
          + "它的味道是典型的“回甘”，第一次吃的人多半会记住这个口感。",
    tip: "怕苦先从簕菜瘦肉汤开始，比清炒柔和。"
    // 待核实："恩平簕菜"的地理标志或特产称号表述
  },
  {
    id: "enping-lecha", name: "恩平簕菜茶", town: "恩平", img: "images/fengwu/enping-lecha.jpg",
    line: "把簕菜嫩芽焙成茶，苦尽甘来那口回甘还在。",
    detail: "簕菜在恩平除了入菜，也采嫩芽焙制成代用茶，冲出来汤色偏黄绿、入口微苦、回甘明显，本地人夏天和秋冬都有人日常泡着喝。",
    tip: "头泡别闷太久，苦味会重；当普通茶饮喝就好，别信任何“降三高”的功效说法。"
    // 待核实：簕菜茶的生产许可与地方标准说法（正文不得写保健功效）
  },
  {
    id: "enping-laifen", name: "恩平濑粉", town: "恩平", img: "images/fengwu/enping-laifen.jpg",
    line: "米浆漏出来的短粉条，全靠一碗汤头撑着。",
    detail: "濑粉用米浆制成，恩平、开平一带都吃。汤底多用猪骨、虾米、头菜，"
          + "面上撒鸡蛋丝、花生和葱花，粉软汤鲜，是本地常见的早餐。",
    tip: "早市的小店最热闹，现煮现卖；加一份猪手或卤蛋更顶饱。"
  },
  {
    id: "enping-shaobing", name: "恩平烧饼", town: "恩平", img: "images/fengwu/enping-shaobing.jpg",
    line: "炉壁上贴出来的薄饼，芝麻咸香，墟日一袋一袋提。",
    detail: "恩平烧饼是本地墟镇常见的传统饼食：面团包馅或压扁后贴进炉壁烤，出炉薄脆、带芝麻香，逢年过节和走亲戚时买得多。",
    tip: "趁热最脆，回软了干锅小火焙一下；密封能放几天，别冷藏。"
    // 待核实：恩平烧饼的馅料规范说法（甜/咸）、是否列入非遗
  },
  {
    id: "enping-shankengl", name: "恩平山坑螺", town: "恩平", img: "images/fengwu/enping-shankengl.jpg",
    line: "山沟溪坑里的小螺，紫苏辣椒一炒，嗦着吃。",
    detail: "恩平山地溪沟多，山坑螺是当地常见的一道小食：养净吐沙后与紫苏、蒜、辣椒同炒，夜宵摊和农家菜馆都点得到。",
    tip: "一定要炒透、不生食；点之前问清吐沙处理了几次，沙多就换一家。"
    // 待核实：山坑螺的物种与来源（野生采捕可能受限，文案一律不写“野生现捞”）
  }
];

/* ============================================================
   美景 46 条。★ 每条的照片路径就写在这一条的 img 字段里 ★
   img: "images/scenery/<条目id>.jpg" —— 文件都在 images/scenery/ 下、文件名 = 条目 id；
   realImg: true —— 这批是真实照片，所以不压「AI 生成示意图」角标（美食那 28 条不写这个字段）。
   换照片：改这一条的 img，或同名覆盖 images/scenery/ 里的文件；
   改完跑 python tools/make-thumbs.py（缩略图）→ python tools/sync-deploy.py（同步）→ 发布两条链接。
   ============================================================ */
const SCENERY = [
  {
    id: "pjiang-baisha", name: "白沙公园—陈白沙纪念馆", town: "蓬江", img: "images/scenery/pjiang-baisha.jpg", realImg: true,
    line: "为明代学者陈献章留的一座园子，嘉会楼和古榕还在。",
    detail: "陈白沙纪念馆一带以明代学者陈献章（白沙先生）为主题，含白沙祠等建筑，旁边的白沙公园里有嘉会楼与老榕树。"
          + "这一片是江门城区少见的“能坐着看书”的绿地：院子不大，古建树多，讲解牌把白沙先生的生平、茅龙笔书法一路串起来。",
    tip: "和钓台故址可以连着走，两处都在讲同一个人；想了解江门文脉，这一片比任何商场都值得停。"
    // 待核实：纪念馆与公园的开放与闭馆时间、是否免费预约、钓台故址的现存格局
  },
  {
    id: "pjiang-changdi", name: "长堤—启明里", town: "蓬江", img: "images/scenery/pjiang-changdi.jpg", realImg: true,
    line: "骑楼老街加百年侨村，晚上最有生活气。",
    detail: "长堤风貌街沿西江铺开，骑楼、老商号和小吃摊在同一条街上；"
          + "附近的启明里是蓬江的老侨村，青砖民居、窄巷和侨批主题的展陈如今是散步与拍照的地方。",
    tip: "傍晚去最好：先在长堤吃东西，天黑后进启明里看灯。"
    // 待核实：启明里内各馆的正式名称与开放时间
  },
  {
    id: "pjiang-chaolian", name: "潮连公园—洪圣公园", town: "蓬江", img: "images/scenery/pjiang-chaolian.jpg", realImg: true,
    line: "西江边上的岛，两个公园一个靠山一个临水。",
    detail: "潮连是西江中的一座岛，属蓬江区。潮连公园有登山路径和观景台，洪圣公园由原天后庙一带扩建而来，临江视野开阔。"
          + "岛上节奏比城区慢，老村、祠堂和江堤连成一片；傍晚在江边看货船来往是这里最日常的一道景。",
    tip: "过桥进岛单程不算近，安排半天以上才划算；江堤风大，夏天傍晚最舒服。"
    // 待核实：洪圣公园与天后庙的沿革关系、潮连岛上其他古迹的准确名称
  },
  {
    id: "pjiang-chishi", name: "叱石风景区", town: "蓬江", img: "images/scenery/pjiang-chishi.jpg", realImg: true,
    line: "杜阮一带的石山，被列为“岭南百景”，可以坐缆车上山。",
    detail: "叱石在蓬江区杜阮镇，山上有奇石、摩崖题刻和寺观建筑，松林成片，旧时列入“岭南百景”，也进过“新会八景”（作“叱石松涛”）。"
          + "景区设有观光缆车直达山顶，步行上下山则要看体力；天气好时山顶能望到远处的丘陵和水田。",
    tip: "想拍全景就挑晴天的上午；缆车与步行是两种玩法，别把时间都花在排队上。"
    // 待核实：“岭南百景”的说法出处、摩崖题刻与山上寺观的名称与年代、缆车是否仍在运营
  },
  {
    id: "pjiang-donghu", name: "东湖公园", town: "蓬江", img: "images/scenery/pjiang-donghu.jpg", realImg: true,
    line: "市中心的一片活水湖面，园里桥比楼多，傍晚全是散步的人。",
    detail: "东湖公园在江门老城中心，是一座以湖体和绿化为主的老牌公园，园内有若干座桥把水面分成几段。"
          + "对游客来说它更像一个落脚点：看完骑楼街走这里歇脚、绕湖一圈，晚上灯光起来之后是本地人一天里最松的时候。",
    tip: "绕湖一圈几十分钟，不用规划路线；想拍骑楼与湖景同框就别赶时间。"
    // 待核实：建园年份、园内各桥与景点的正式名称（正文一律不写数字）
  },
  {
    id: "pjiang-ganzhichang", name: "江门甘蔗化工厂旧址", town: "蓬江", img: "images/scenery/pjiang-ganzhichang.jpg", realImg: true,
    line: "曾经号称“亚洲第一糖厂”，如今是留下来的工业遗产。",
    detail: "江门甘蔗化工厂是江门近代工业的代表，曾被称为“亚洲第一糖厂”，现列入国家工业遗产名录。"
          + "厂区遗存以工业建筑与构筑物为主，和骑楼街、博物馆一起构成江门另一种“老”：不是侨乡的老，是工厂的老。",
    tip: "对工业建筑有兴趣再专门去；能否进入与开放范围要先查清楚，别白跑。",
    credit: "Lhzss8 · CC BY-SA 4.0", creditFile: "File:江门甘化厂牌坊.jpg"
    // 待核实：建厂年份、“亚洲第一糖厂”的说法出处、列入国家工业遗产的批次与目前开放情况
  },
  {
    id: "pjiang-liangxi", name: "良溪古村", town: "蓬江", img: "images/scenery/pjiang-liangxi.jpg", realImg: true,
    line: "被称为“后珠玑巷”的老村，族谱和祠堂比房子更完整。",
    detail: "良溪古村在蓬江区棠下镇，村中罗氏大宗祠纪念先祖罗贵，砖木结构带岭南做法。"
          + "珠三角不少族谱把南迁路线接到珠玑巷，良溪一带的说法被称为“后珠玑巷”，村里保存了多处古迹与传统习俗。",
    tip: "看祠堂和巷道就够，别指望有景区服务；进村安静些，仍有村民居住。"
    // 待核实：“后珠玑巷”这一说法的来源与提法者、罗贵其人与南迁叙事的史料依据、村中文保级别
  },
  {
    id: "pjiang-qunxing", name: "群星公园", town: "蓬江", img: "images/scenery/pjiang-qunxing.jpg", realImg: true,
    line: "前身是一座水库，现在是中心城区三大“绿肺”之一。",
    detail: "群星公园在蓬江区，由原水库及周边山林改造而来，水面被山体环住，步道绕湖一圈。"
          + "市区里能听到虫鸣的地方不多，这里是常被本地人提起的一个；周末人多，工作日清晨最安静。",
    tip: "环湖步道适合慢跑，别穿皮鞋来；傍晚蚊子活跃。"
    // 待核实：“中心城区三大绿肺”这一说法的出处、公园正式面积与环湖步道长度
  },
  {
    id: "pjiang-ximao", name: "席帽山森林公园", town: "蓬江", img: "images/scenery/pjiang-ximao.jpg", realImg: true,
    line: "城里的一座低山，免费开放，山顶是天然观景台。",
    detail: "席帽山森林公园在蓬江区，山不高、步道成熟，是本地人日常爬山遛弯的地方，山顶能望见城区与西江方向。"
          + "这类“城市山林”没有景区化的设施，好处是随时能去、不用门票；日出日落两个时段人最少。",
    tip: "上下山各二十来分钟，适合行前热身或饭后消食；夜里照明有限，别太晚下山。"
    // 待核实：所属区县与正式名称、山顶观景方向的具体描述
  },
  {
    id: "pjiang-xingguang", name: "星光公园", town: "蓬江", img: "images/scenery/pjiang-xingguang.jpg", realImg: true,
    line: "把五邑籍的演艺名人做成一条可走的名人道。",
    detail: "星光公园以五邑籍演艺、文化界人物为展示主题，是侨乡“名人多”这件事的另一种讲法，和博物馆里的华侨史互为补充。"
          + "园内以雕像、铭牌和绿化为主，适合带小孩边走边认人；对不熟粤语娱乐圈的人来说更像一次散步。",
    tip: "把它当作一条有主题的人行道就好，别按景区预期；讲名人可以接着去五邑华侨华人博物馆。"
    // 待核实：园内展示哪些人物、落成时间与是否收费
  },
  {
    id: "pjiang-xuding", name: "墟顶老街", town: "蓬江", img: "images/scenery/pjiang-xuding.jpg", realImg: true,
    line: "江门最早的那截街市，地名还留着“墟”字。",
    detail: "墟顶一带被视为江门的发源地，旧时街市格局在地名上留了痕迹，和长堤风貌街连成一片。"
          + "这里没有修复一新的门面，多为还在使用的老铺面与窄巷，适合顺着走一段，看地名怎么活下来。",
    tip: "和长堤、启明里一起走最合适；拍照以街巷细节为主，别期待大景。"
    // 待核实：“江门发源地”的提法出处、老街现存建筑年代与保护范围
  },
  {
    id: "pjiang-yuanshanhu", name: "园山湖公园", town: "蓬江", img: "images/scenery/pjiang-yuanshanhu.jpg", realImg: true,
    line: "滨江新区的新湖，晚上有音乐喷泉。",
    detail: "园山湖公园在江门滨江新区，是以水面和绿地为主的新建城市公园，配有音乐喷泉等设施。"
          + "这一片是江门往西江方向扩展的新城区，楼新、路宽，和老城骑楼街是两副面孔；带小孩的家庭常来这里。",
    tip: "喷泉场次以现场公告为准；夏天傍晚去，白天暴晒没什么遮阴。"
    // 待核实：喷泉场次与开放时间、公园正式名称与所在片区边界
  },
  {
    id: "jh-baishuidai", name: "江海白水带", town: "江海", img: "images/scenery/jh-baishuidai.jpg", realImg: true,
    line: "城市东面的山林步道，夏天比城里凉，能望见江门城区。",
    detail: "白水带是江海区的一片城市山林，步道串起树林、溪流与观景处，"
          + "是本地人傍晚跑步、周末带小孩爬山常去的地方。",
    tip: "穿运动鞋，带水；想拍城市傍晚在日落前半小时上山。",
    credit: "鲁昌江 · CC BY-SA 3.0", creditFile: "File:江门江海区的白水带风景区 - panoramio.jpg"
    // 待核实：园内具体景点名（塔、瀑布等）先不写，查到再补进 detail
  },
  {
    id: "jh-changlang", name: "江海长廊生态园", town: "江海", img: "images/scenery/jh-changlang.jpg", realImg: true,
    line: "城里的一片农田乐园，看得到作物也摸得到动物。",
    detail: "长廊生态园在江海区，是集生态观光、农耕体验、动物互动与研学营地为一体的都市农业园区，列为 A 级旅游景区。"
          + "适合带小孩待半天：田块、温室和互动区都在一处，不用长途奔波；对只想看风景的人来说这里偏游乐。",
    tip: "周末和节假日人多，工作日去体验更好；防晒和驱蚊都要带。"
    // 待核实：园区面积、门票与开放区域、评级批次
  },
  {
    id: "jh-yundao", name: "江海云道", town: "江海", img: "images/scenery/jh-yundao.jpg", realImg: true,
    line: "架在半空的一条步道，把四座公园串起来。",
    detail: "江海云道起于釜山天桥一带，是一段架高的步行道，把儿童公园、釜山公园、体育公园、白水带公园连成一线。"
          + "道上设有登山塔等节点，走起来比地面步道多一层视野，是市区里少见的“从树冠高度看公园”的体验。",
    tip: "推婴儿车和轮椅要先确认出入口；雨天桥面滑，不适合带小孩赶时间。"
    // 待核实：云道准确长度、出入口数量与位置、是否全程无障碍
  },
  {
    id: "xinhui-gudou", name: "古兜山海温泉", town: "新会", img: "images/scenery/xinhui-gudou.jpg", realImg: true,
    line: "崖门山海之间的一片度假区，泡汤和看海能同一天。",
    detail: "古兜一带背山面海，温泉度假设施建在山坳与海岸之间，"
          + "本地常把它安排成两天一夜：第一天海边和古镇，第二天上山泡汤。",
    tip: "和崖门、新会陈皮村顺路；节假日池边人多，早场好。",
    credit: "Emitchan · CC BY-SA 3.0", creditFile: "File:GuDouHotSpring.jpg"
    // 待核实："一地两泉"之类的宣传说法不要照抄，只写能证实的地理特征
  },
  {
    id: "xinhui-guifeng", name: "新会圭峰山", town: "新会", img: "images/scenery/xinhui-guifeng.jpg", realImg: true,
    line: "城里就能上山，山腰有寺，山上看得见新会城区。",
    detail: "圭峰山是新会城北的一片山体绿地，林荫步道、山顶观景处和山腰的寺庙组成当地人周末爬山、扫墓、野餐的地方。"
          + "秋天山下是柑田，路上能闻到陈皮季的果香。",
    tip: "傍晚上山看日落最划算；带水，山上小卖部不多。"
    // 待核实：景区级别说法（"国家森林公园"/"省级风景名胜区"分别核实），寺名（一般称玉台寺）
  },
  {
    id: "xinhui-jingmei", name: "京梅功夫侨村", town: "新会", img: "images/scenery/xinhui-jingmei.jpg", realImg: true,
    line: "一个把咏春的说法写进自己村史的古村。",
    detail: "京梅村在新会崖门镇一带，以“功夫侨村”为旅游主题，列为 A 级旅游景区，村内保留祠堂、古井、旧巷与武术相关的展陈。"
          + "这里的看点是村落本身而不是表演：巷道、祠堂和墙上关于咏春的说法，构成侨乡“武术随人出海”的一条证据链。",
    tip: "别把村史说法当成定论，村里讲解与外部研究不完全一致；拍照别进人家厅堂。"
    // 待核实：京梅与咏春源流的关系说法（各地表述不一）、村内文保点名称、评级年份
  },
  {
    id: "xinhui-kuibo", name: "葵博园与葵湖", town: "新会", img: "images/scenery/xinhui-kuibo.jpg", realImg: true,
    line: "新会种葵、做葵扇的老行当，被收进了一座园子。",
    detail: "新会历史上以蒲葵与葵扇为大宗手工业，“葵湖春晓”旧时列进新会八景。圭峰山一带设有葵博园，展示葵树、葵扇工艺与相关科普。"
          + "看点和“寻美江门”非遗那条线是同一件事：从一棵葵树到一把扇子，中间是几道工序和一整个行当。",
    tip: "和圭峰山同一天安排；工艺展示有场次，进门先问时间。"
    // 待核实：葵博园的正式名称、位置与开放情况、“葵湖春晓”所指的具体水面
  },
  {
    id: "xinhui-shibansha", name: "石板沙疍家风情岛", town: "新会", img: "images/scenery/xinhui-shibansha.jpg", realImg: true,
    line: "西江中的一座沙洲岛，水上人家的吃法还留着。",
    detail: "石板沙属新会，是一座江心岛，以疍家（水上人家）风情为旅游主题，列为 A 级旅游景区。"
          + "岛上以河鲜、渔家生活与江岸风光为主，节奏很慢；把它当作“坐船上岛吃一顿”的短途更合适。",
    tip: "看班次再决定去不去，末班船时间要提前确认；周末饭点排队明显。"
    // 待核实：所属镇、上岛码头与班次、是否收门票与岛上项目收费
  },
  {
    id: "xinhui-xiaoniaotiantang", name: "小鸟天堂", town: "新会", img: "images/scenery/xinhui-xiaoniaotiantang.jpg", realImg: true,
    line: "一棵水榕长成一片“林”，巴金把它写进了课文。",
    detail: "天马村河心的一棵水榕独木成林，枝桠伸到水面上，晨昏时白鹭等水鸟归巢绕树飞。"
          + "巴金 1933 年的游记《鸟的天堂》让这里被全国读者记住。",
    tip: "看鸟要赶清晨或傍晚；泛舟和栈道两种玩法，雨天优先栈道。",
    credit: "Memes · CC BY-SA 3.0", creditFile: "File:Banyan in Birdie Heaven.JPG"
    // 待核实：游记发表年份与"写入语文课本"的准确表述
  },
  {
    id: "xinhui-yamen", name: "崖门与宋元崖门海战遗址", town: "新会", img: "images/scenery/xinhui-yamen.jpg", realImg: true,
    line: "珠江水系的一条出海口，最后一次大规模水战发生在这里。",
    detail: "崖门位于新会南部，是潭江等水系汇入崖门海道的海口一带，宋末元军在此与宋室水军决战，是“崖门览胜”所指的景观。"
          + "现在这一带有与水战相关的纪念性建筑和渔港景观，渔港停船密集，傍晚海面光线最好。",
    tip: "遗址与渔港是两件事，别按一个景区的预期去走；看海就要挑天气通透的日子。"
    // 待核实：海战的具体年份与地点范围、现存纪念建筑的名称与建成年代、是否收费
  },
  {
    id: "xinhui-yinhuwan", name: "银湖湾湿地", town: "新会", img: "images/scenery/xinhui-yinhuwan.jpg", realImg: true,
    line: "围垦与潮滩留下的水网，冬天全是鸟。",
    detail: "银湖湾在新会南部沿海，有大片潮滩、鱼塘与红树林复绿地带，是水鸟停歇与觅食的场所，观鸟季以冬季为主。"
          + "这里属于“看之前要先懂一点”的景观：滩涂、水道与鸟群变化多，但没有景区化的观景设施。",
    tip: "退潮时滩涂露出最多，出发前查潮汐；望远镜比相机更值，别开车上堤坝乱停。",
    credit: "海啸123 · CC BY-SA 4.0", creditFile: "File:新会银湖湾湿地.JPG"
    // 待核实：银湖湾湿地的正式名称与保护级别、是否有对公众开放的观鸟点与红树林面积
  },
  {
    id: "xinhui-yutai", name: "圭峰山玉台寺", town: "新会", img: "images/scenery/xinhui-yutai.jpg", realImg: true,
    line: "岭南四大名刹之一，藏在圭峰山半山腰。",
    detail: "玉台寺在新会区北郊圭峰山南半山腰，相传始建于唐代，由僧一行（张遂）开山，历来被誉为岭南四大丛林古刹之一（另三座为韶关南华寺、潮州开元寺、肇庆鼎湖山庆云寺），是五邑一带最大的佛教圣地。"
          + "寺院顺山势而建，规模不算大，胜在林木与山径；旧时殿宇曾在 1939 年前后遭毁，现建筑多为后来修复重建。",
    tip: "和圭峰山一起走，别单独安排；进殿按寺院规矩来，别把这里当摄影棚。",
    credit: "Tim Wu · CC BY-SA 4.0", creditFile: "File:圭峰山玉台寺大雄宝殿 20260218.jpg"
    // 待核实：始建年份与“唐建和间”的原文读法、僧一行开山的说法依据、被毁与重修的具体年代
  },
  {
    id: "xinhui-ziyun", name: "圭峰山紫云观", town: "新会", img: "images/scenery/xinhui-ziyun.jpg", realImg: true,
    line: "山上另一处宗教建筑，是迁址复建的道观。",
    detail: "圭峰山上有两处常被并提的寺观：佛教的玉台寺与道教的紫云观。紫云观为迁址后复建，依山势布局。"
          + "对普通游客来说它更像圭峰山步道上的一个停顿点；有意看宗教建筑的话，和玉台寺连着看能对比两种格局。",
    tip: "别把道观和佛寺的规矩混着来；山上指示牌有限，跟着主路走更省事。"
    // 待核实：紫云观的迁址与复建时间、原址位置、是否常年开放
  },
  {
    id: "taishan-beifeng", name: "北峰山森林公园", town: "台山", img: "images/scenery/taishan-beifeng.jpg", realImg: true,
    line: "台山城区背后的山林，步道和溪谷都在里面。",
    detail: "北峰山森林公园在台山市，以山林、溪谷和徒步线路为主，是本地人爬山溯溪的常去地，也常被排进两日游的第一天。"
          + "这类山林没有标志性大景，好处是凉快、人少、随时可走；雨后溪水大，溯溪要另做安排。",
    tip: "溯溪段要穿能湿的鞋；山里手机信号不稳，别单独走未开发的岔路。"
    // 待核实：主要步道与景点名称（正文不写长度数字）。级别与正式名称已由 2026-10-19 他自己的实拍定下：入口巨石与树干竖牌都写「北峰山国家森林公园」
  },
  {
    id: "taishan-chuandao", name: "台山川岛", town: "台山", img: "images/scenery/taishan-chuandao.jpg", realImg: true,
    line: "南海上两座岛，长沙滩、防护林和海上日出。",
    detail: "上川岛、下川岛都从台山北部的码头坐船上岛，岛上有开阔沙滩、海岸防护林和渔村。"
          + "外海水色比近岸清透，旺季时岛上住宿紧张，赶日落和第二天清晨的海最值。",
    tip: "先看天气预报再决定当天往返还是住一晚；船票和住宿都建议提前订，周末台风季尤甚。"
    // 待核实：登船码头名称与班次、各沙滩是否需要门票
  },
  {
    id: "taishan-fuyue", name: "浮月村洋楼", town: "台山", img: "images/scenery/taishan-fuyue.jpg", realImg: true,
    line: "稻田尽头十几栋风格各异的洋楼，是台山新八景之一。",
    detail: "浮月村在台山市斗山镇，原名浮溪村，因村内十余幢建筑风格各异的华侨洋楼（碉楼）出名，曾评为“台山新八景”之一。"
          + "洋楼多由出洋谋村的华侨回乡所建，部分长期空置；村前是开阔稻田，秋收前后稻色变化最出片。",
    tip: "这是有人住的村子，别翻围栏、别大声；拍稻田要低角度，正午光线最平。",
    credit: "Rzmlvlk · CC0", creditFile: "File:浮月村洋楼 20250719.jpg"
    // 待核实：洋楼准确栋数（报道有 15 座与 20 座两说）、列入市保与省保的年份
  },
  {
    id: "taishan-haikou", name: "海口埠", town: "台山", img: "images/scenery/taishan-haikou.jpg", realImg: true,
    line: "侨批上岸的老码头，如今是一条骑楼街。",
    detail: "海口埠在台山台城一带，曾是潭江水路上的侨乡码头，出洋的人从这里离开、侨汇与家书从这里上岸，列为 A 级旅游景区。"
          + "现存街面以骑楼为主，兼有侨批、华侨历史的展陈；把“下南洋”这件事讲成一个具体的岸，而不是一个抽象名词。",
    tip: "和台山华侨文化博物馆连着看更完整；傍晚江边有风，白天没什么遮阴。"
    // 待核实：海口埠的始建年代、现存骑楼的年代与保护范围。展陈名称已由 2026-10-19 他自己的实拍定下：同一栋骑楼门楣刻「海口埠」、楼下木牌「台山银信博物馆」（银信就是侨批）；正文没写馆名，要不要写进去等他点头
  },
  {
    id: "taishan-meijia", name: "梅家大院", town: "台山", img: "images/scenery/taishan-meijia.jpg", realImg: true,
    line: "骑楼围成一个侨村，广场中间是球场。",
    detail: "端芬镇的梅家大院由华侨集资建于上世纪二三十年代，几十间骑楼围合出一块平整广场，"
          + "走进村要先过一道楼。因为风貌保存完整，多部电影电视剧在这里取过景。",
    tip: "和碉楼线路错开安排；正午暴晒，上午或下午四点后人少光好。",
    credit: "胜利号 · CC0", creditFile: "File:梅家大院 Meijia Courtyard 2024.jpg"
    // 待核实：建成年份、房屋间数、具体取景片名（不确认就别写片名）
  },
  {
    id: "taishan-naqin", name: "那琴半岛海岸", town: "台山", img: "images/scenery/taishan-naqin.jpg", realImg: true,
    line: "花岗岩把海岸雕成一片奇石，栈道贴着山脊走。",
    detail: "台山北陡镇一带的海岸以巨石、礁群出名，长年被海蚀磨出圆润的形状。"
          + "景区把步道修在山脊与礁石之间，退潮时可以走到礁盘边看海蚀形态。",
    tip: "礁石滑，穿防滑鞋；涨退潮时间提前查好，退潮才有礁盘可走。"
    // 待核实：是否收费、开放路段、景区级别（正式名称已按江门市文广旅体局官方页核为「那琴半岛地质海洋公园」，含浪琴湾、庙湾、柑果湾、白马湾、峡湾 5 个海湾、海岸线 6000 多米；级别官方页标 A 级旅游景区、第三方平台标 4A，两边口径不一）
  },
  {
    id: "taishan-wufeng", name: "五丰村东南亚风情区", town: "台山", img: "images/scenery/taishan-wufeng.jpg", realImg: true,
    line: "一个把东南亚归侨生活留在村里的地方。",
    detail: "五丰村在台山市，是东南亚归侨聚居的村落，以“东南亚风情”为旅游主题，列为 A 级旅游景区。"
          + "看点在归侨带来的饮食与居住习惯：南洋风格的房屋、东南亚小吃和村史讲述，是侨乡“人回来”的那一半故事。",
    tip: "吃一趟比看一圈更有意义；进村先问清可参观的范围，别把民居当展厅。"
    // 待核实：五丰村的评级年份与村内可参观项目的正式名称。归侨来源与归属：2026-10-19 他自己的实拍里村牌用中文＋马来文＋越南文三行对照、铜牌顶行「台山市海宴华侨农场」，至少含印尼与越南方向；完整来源构成仍未核实。正文没写这些，要不要补等他点头
  },
  {
    id: "kaiping-chikan", name: "赤坎华侨古镇", town: "开平", img: "images/scenery/kaiping-chikan.jpg", realImg: true,
    line: "潭江边的骑楼长街，老码头与侨商字号都在这条街上。",
    detail: "赤坎镇以骑楼老街出名，廊柱沿街面铺开，过去是侨墟和水路码头，"
          + "华侨把南洋与西式的装饰手法带回这条街。近年按古镇景区整修后开放，街区内有侨批、华侨历史的展陈。",
    tip: "从碉楼回江门顺路停靠最好安排；傍晚江边风大，拍照也柔和。",
    credit: "Stefan Fussan · CC BY-SA 3.0", creditFile: "File:Chikan 0028.jpg"
    // 待核实：整修后的开放范围、门票与展陈名称，老街准确长度（此处不写数字）
  },
  {
    id: "kaiping-dashali", name: "大沙里欢茶谷", town: "开平", img: "images/scenery/kaiping-dashali.jpg", realImg: true,
    line: "茶田坡地上的营地，把采茶做成了能玩的东西。",
    detail: "大沙里在开平市大沙镇一带，以茶田与山地景观为主的旅游区，列为 A 级旅游景区，有茶事体验、露营与亲子项目。"
          + "这一带属于开平的山地片区，和碉楼水乡的平坦视野是两种江门：坡地、水库与茶园。",
    tip: "适合专门安排半天到一天；体验项目要预约，旺季当天到场多半排不上。"
    // 待核实：景区正式名称与经营主体（正文不写品牌宣传语）、可体验项目与门票。2026-10-19 他自己的实拍只确认了园内有一处红字刻「陆羽广场」的树根造型景点，地名与经营主体仍未核实
  },
  {
    id: "kaiping-diaolou", name: "开平碉楼与村落", town: "开平", img: "images/scenery/kaiping-diaolou.jpg", realImg: true,
    line: "水田之间的多层楼群，2007 年列入世界遗产名录。",
    detail: "开平现存碉楼千余座，把中国传统民居的格局和西式柱廊、穹顶、铁艺合在一起，"
          + "多数是清末民初华侨回乡为防盗匪所建。自力村、锦江里、马降龙、立园是最常被走的几处，"
          + "田间的观景台能把楼群和水塘倒影一起收进画面。",
    tip: "只有一天就在自力村和立园里选；夏天傍晚光线最好，但蚊子也最多，带驱蚊。"
    // 待核实：入选年份（2007 第 31 届世界遗产大会）与现存碉楼准确数量
  },
  {
    id: "kaiping-jinjiangli", name: "锦江里与瑞石楼", town: "开平", img: "images/scenery/kaiping-jinjiangli.jpg", realImg: true,
    line: "开平现存最高的碉楼在这个黄氏华侨村里。",
    detail: "锦江里在开平市蚬冈镇，紧靠潭江西岸，是世界文化遗产村落之一。村中瑞石楼楼高约 28 米，被称为“开平碉楼第一楼”，楼层高、外观装饰华美。"
          + "碉楼群四周山峦环抱、田陌纵横，欧式细部集中在这几栋楼上，是看“华侨想把什么盖回家”最直观的一处。",
    tip: "和自力村选一个就够，两个都像；瑞石楼能否登楼要先问。",
    credit: "Mx. Granger · CC0", creditFile: "File:锦江里.jpg"
    // 待核实：瑞石楼准确高度、建成年份与是否开放入内
  },
  {
    id: "kaiping-lichun", name: "立园", town: "开平", img: "images/scenery/kaiping-lichun.jpg", realImg: true,
    line: "华侨给自己造的园林，前园后宅，中西混在一处。",
    detail: "立园在开平市，由华侨叶氏所建，把传统园艺、西洋建筑与江南水乡布局合在一起，是中国园林里少见的混合做法，属开平碉楼与村落世界遗产片区常走的一处。"
          + "园内有大牌坊、桥、堤、亭与居住楼群，装饰细部大量取自西式构件；和自力村的防御性碉楼对照着看，能看出华侨盖楼两种不同的心思。",
    tip: "半天足够；细部多，别只走主路，两侧小径才是看点。",
    credit: "Han Lei · CC BY-SA 3.0", creditFile: "File:开平立园 - panoramio.jpg"
    // 待核实：建园年份与园主姓名（正文只写“叶氏”）、准确保护级别与所属遗产地关系
  },
  {
    id: "kaiping-majianglong", name: "马降龙村落群", town: "开平", img: "images/scenery/kaiping-majianglong.jpg", realImg: true,
    line: "碉楼长在竹林里，是世界遗产的遗产地之一。",
    detail: "马降龙在开平市百合镇一带，由数个自然村连成村落群，碉楼群被竹林与潭江岸线环抱，列入开平碉楼与村落世界文化遗产的遗产地。"
          + "这里比自力村安静，观景台能把竹林、村庄和江面一起收进来；秋天芦苇与竹林的颜色最好看。",
    tip: "想拍全景要走上观景台；村里仍有老人居住，说话轻一点。",
    credit: "Mx. Granger · CC0", creditFile: "File:马降龙 06.jpg"
    // 待核实：马降龙所含自然村数量、观景台位置与是否收费
  },
  {
    id: "heshan-dayanshan", name: "鹤山大雁山森林公园", town: "鹤山", img: "images/scenery/heshan-dayanshan.jpg", realImg: true,
    line: "沙坪城区北边的一座山，被称为“广佛西出第一景”。",
    detail: "大雁山在鹤山市沙坪城区北部，是广东大雁山森林公园的主体，山道、湖景与登高观景是主要内容。"
          + "近年它被当作“千里步道”沿线的招牌景区来推介，周末节假日从广州、佛山自驾来的车不少。",
    tip: "山路有坡度，穿运动鞋；想避开人流就工作日上午到，节假日车常堵在山下。",
    credit: "PQ77wd · CC BY-SA 4.0", creditFile: "File:DaaiNgaanSaan.jpg"
    // 待核实：“广佛西出第一景”的说法出处、园内各景点正式名称、门票与缆车情况
  },
  {
    id: "heshan-gulao", name: "鹤山古劳水乡", town: "鹤山", img: "images/scenery/heshan-gulao.jpg", realImg: true,
    line: "河涌当街巷，船曾经就是门前的路。",
    detail: "古劳镇是珠三角典型的水乡，村落之间河涌交错，榕树、石桥和临水老屋还在。"
          + "这里是咏春宗师梁赞的故里，水乡与拳师两个话题都够走半天。",
    tip: "和一碗古劳蛋面安排在同一趟；泛舟要看水位和天气，雨天在岸上走。",
    credit: "Ballmacy · CC BY-SA 4.0", creditFile: "File:Gulao Water Town.jpg"
    // 待核实：梁赞故里说法、是否开发为景区及收费、泛舟项目现状
  },
  {
    id: "enping-aofeng", name: "鳌峰山公园", town: "恩平", img: "images/scenery/enping-aofeng.jpg", realImg: true,
    line: "城区边上的一座山公园，恩平人爬的山。",
    detail: "鳌峰山在恩平城区一带，是本地人日常登山健身的城市山林，山上有观景与休憩设施。"
          + "这类山没有门票和大景，价值在于能看到恩平城区全貌；傍晚是最好时段。",
    tip: "上下山各半小时以内，适合行前热身；夜间照明有限。"
    // 待核实：公园正式名称与范围、山上各建筑名称。2026-10-19 他自己的实拍只拍到山顶一块蓝底打卡牌（上行「我在恩平等你」、下行「鳌峰山顶 S／N」），山名与"山顶有一处停脚点"算对上，园名与范围仍未核实
  },
  {
    id: "enping-fengru", name: "冯如故里", town: "恩平", img: "images/scenery/enping-fengru.jpg", realImg: true,
    line: "中国飞机设计先驱的出生地，故居和广场都在村里。",
    detail: "冯如故里在恩平市牛江镇一带，保留清代冯如故居与冯如广场，列为爱国主义教育基地。"
          + "首页名人墙上的冯如就出自这里；把故居、村貌与展陈连起来看，能明白“侨乡出飞机师”这件事的来路。",
    tip: "和恩平其他点顺路安排，别专程跑一趟；展陈内容以生平为主，航空技术细节有限。"
    // 待核实：故居具体村落名称、建筑年代与保护级别、广场与展馆的正式名称。2026-10-19 他自己的实拍只拍到景区草坡上一架旧客机打卡装置（顶牌「冯如故里，逐梦蓝天」，另有箭头牌「下一站·飞机山」），故居建筑、广场与展馆都没进画面，所以这三项一个都没答掉
  },
  {
    id: "enping-wenquan", name: "恩平温泉", town: "恩平", img: "images/scenery/enping-wenquan.jpg", realImg: true,
    line: "珠三角少见的温泉带，秋冬泡汤、夏天玩水。",
    detail: "恩平一带温泉资源集中，多家温泉度假酒店依泉眼而建，池群做成山地园林的样子，"
          + "是江门人秋冬周末度假的常规去处。",
    tip: "淡季工作日最舒服；带小孩问清哪些池水温允许、有没有儿童池。"
    // 待核实："中国温泉之乡"称号与获评年份、温泉集中的具体镇
  },
  {
    id: "enping-xiangshui", name: "响水龙潭森林公园", town: "恩平", img: "images/scenery/enping-xiangshui.jpg", realImg: true,
    line: "省级森林公园，溪流一路跌成几处瀑布。",
    detail: "响水龙潭省级森林公园位于恩平大人山脉东南侧，公园内溪流众多、形成多处瀑布，以响水龙潭为代表，“仙人脚印”“鸡公石”等景点另有民间传说。"
          + "恩平不只有温泉，这类山林溪谷是本地人夏天去得最多的地方；雨后水大时瀑布最壮观。",
    tip: "雨后石头滑，别穿拖鞋进溪；水边湿滑，带小孩要盯紧。"
    // 待核实：公园级别与批复名称、各景点名称与位置、是否收费与开放路段
  },
  {
    id: "enping-xiema", name: "歇马举人村", town: "恩平", img: "images/scenery/enping-xiema.jpg", realImg: true,
    line: "一个把“读书”当村业的古村，滨着锦江河。",
    detail: "歇马村在恩平市圣堂镇，滨临锦江河，村史可上溯元代至正年间。该村因明清两代培养出大量科举功名人士而被称为“举人村”，现为中国历史文化名村、A 级旅游景区。"
          + "村内以祠堂、古巷、功名牌匾与家风展陈为主，布局讲究“读书进学”的寓意；对研究侨乡教育传统的人来说信息量比一般古村大。",
    tip: "看门匾和祠堂比看风景有用；村里路窄，开车进村不方便。"
    // 待核实：功名人士与举人准确人数（报道有 670 余名 / 680 余名、举人 285 人等不同说法）、始建年代的具体年号
  },
  {
    id: "enping-yunli", name: "云礼石头村", town: "恩平", img: "images/scenery/enping-yunli.jpg", realImg: true,
    line: "房子、围墙、路面都用石头砌的小村。",
    detail: "云礼石头村在恩平那吉镇一带，因村内民居、围墙与道路大量就地取材用石块砌筑而得名，属小众乡村景观。"
          + "这一带是恩平的山区，村子小而安静，看点就是石头工艺与山村环境；没有景区化服务，期待越少越满意。",
    tip: "山路弯多，雨天别赶夜路；进村是村民生活区，不要随意进宅。"
    // 待核实：村落的准确归属镇名、名称写法（“云礼”是否规范）、有无保护级别与开放情况
  }
];

/* ------------------------------------------------------------
   2. 小测题目
   a = 正确项在 opts 里的下标（从 0 数）；why 是答完显示的解析。
   题目全部能从站内其他页面找到依据，改题时记得同步解析里的说法。
   ------------------------------------------------------------ */
const QUIZ = [
  { q: "“开平碉楼与村落”是哪一年列入世界遗产名录的？",
    opts: ["2005 年", "2007 年", "2010 年", "1996 年"], a: 1,
    why: "2007 年，广东第一个世界遗产项目就在开平（待核实年份请以 UNESCO 名录为准）。" },
  { q: "小鸟天堂是因为哪位作家的散文而被全国读者知道的？",
    opts: ["鲁迅", "巴金", "老舍", "沈从文"], a: 1,
    why: "巴金的游记《鸟的天堂》，写的就是新会天马村那棵独木成林的水榕。" },
  { q: "下面哪一样是新会最出名、还能入菜入汤的特产？",
    opts: ["陈皮", "凉瓜", "簕菜", "马冈鹅"], a: 0,
    why: "新会陈皮；凉瓜出名在蓬江杜阮，簕菜在恩平，马冈鹅在开平。" },
  { q: "黄鳝饭是哪个地方的招牌？",
    opts: ["恩平", "鹤山", "台山", "江海"], a: 2,
    why: "台山黄鳝饭：鳝丝与米饭同焗，饭粒分明。" },
  { q: "江门下辖几个县级行政区（三区四市）？",
    opts: ["5 个", "6 个", "7 个", "8 个"], a: 2,
    why: "蓬江、江海、新会 3 个区，台山、开平、鹤山、恩平 4 个县级市，一共 7 个 —— 首页地球上的边界就是按这 7 块画的。" },
  { q: "江门常见的城市名片叫？",
    opts: ["中国侨都", "中国建筑之乡", "中国温泉之乡", "中国曲艺之乡"], a: 0,
    why: "“中国侨都”，本站的“侨都薪火”就是从这里来的。" },
  { q: "中国第一位飞机设计师、飞行家冯如是哪里人？",
    opts: ["开平", "恩平", "新会", "台山"], a: 1,
    why: "恩平人冯如，首页名人墙里那张戴帽青年照就是他（事迹出处见 js/heroes.js 的注释）。" },
  { q: "赤坎华侨古镇紧挨着哪条江？",
    opts: ["西江", "潭江", "北江", "东江"], a: 1,
    why: "潭江。赤坎过去是靠潭江水路起来的侨墟码头。" }
];

/* ------------------------------------------------------------
   3. 路线推荐器
   键的格式是 "天数-偏好id"，偏好 id 在 ROUTE_PREFS 里定义。
   stops 里只写图鉴的 id，名字、区县、一句话都从 FOOD / SCENERY 取，
   所以改一处文案，路线里跟着变，不会出现两处不一致。
   增删路线 = 增删下面 ROUTES 里的键；缺某个组合时页面改用自动规划补一条，不会空着。
   ------------------------------------------------------------ */
const ROUTE_PREFS = [
  { id: "eat",  name: "吃得地道", line: "按早点、午市、晚市排，一天三顿都不重样。" },
  { id: "sea",  name: "看海吹风", line: "往南走：海岸、岛屿和退潮后的礁盘。" },
  { id: "cul",  name: "世遗与侨乡", line: "碉楼、骑楼、侨村，一条看华侨怎么回乡建东西的线。" },
  { id: "rest", name: "山水温泉", line: "爬山、水乡、泡汤，适合想放松不想赶路的两天。" }
];

const ROUTES = {
  "1-eat":  { line: "一天吃遍新会与台山各一样，路上不折腾。",
              stops: ["xinhui-chenpi", "gujing-shae", "taishan-huangshanfan", "kaiping-doufujiao"] },
  "2-eat":  { line: "两天四顿重点餐，中间各插一个散步的地方。",
              stops: ["enping-laifen", "heshan-gulao", "heshan-gulao-mian", "kaiping-chikan", "taishan-shenghao", "pjiang-langua"] },
  "3-eat":  { line: "三个区县轮着吃，每顿留一样主场。",
              stops: ["pjiang-langua", "xinhui-chenpi", "gujing-shae", "taishan-huangshanfan", "taishan-shenghao", "kaiping-magang-e", "kaiping-doufujiao", "enping-lecai", "enping-laifen"] },

  "1-sea":  { line: "当天往返的海线：早去晚回，只走沙滩与礁石。",
              stops: ["taishan-naqin", "taishan-shenghao"] },
  "2-sea":  { line: "住一晚岛上，第二天清晨的海最值。",
              stops: ["taishan-chuandao", "taishan-naqin", "taishan-shenghao"] },
  "3-sea":  { line: "三天把海岸线走成一条：礁石、岛屿、渔市。",
              stops: ["taishan-naqin", "taishan-chuandao", "taishan-shenghao", "taishan-meijia", "kaiping-chikan"] },

  "1-cul":  { line: "一天看完碉楼和赤坎，两个点都在开平。",
              stops: ["kaiping-diaolou", "kaiping-chikan"] },
  "2-cul":  { line: "开平碉楼加台山侨村，把华侨盖楼这件事看明白。",
              stops: ["kaiping-diaolou", "kaiping-chikan", "taishan-meijia", "pjiang-changdi"] },
  "3-cul":  { line: "三天四地：碉楼、骑楼、水乡、西江边的老街。",
              stops: ["kaiping-diaolou", "kaiping-chikan", "taishan-meijia", "heshan-gulao", "pjiang-changdi", "xinhui-xiaoniaotiantang"] },

  "1-rest": { line: "一天就近：城市山林加一碗水乡面。",
              stops: ["jh-baishuidai", "heshan-gulao-mian"] },
  "2-rest": { line: "两天一夜，上山泡汤，中间吃恩平。",
              stops: ["xinhui-guifeng", "enping-lecai", "enping-wenquan"] },
  "3-rest": { line: "三天慢慢走：山、水、泉各一天。",
              stops: ["xinhui-guifeng", "xinhui-xiaoniaotiantang", "heshan-gulao", "enping-wenquan", "xinhui-gudou"] }
};

/* ------------------------------------------------------------
   3.2 自动规划的规则（自定义天数、或者上面没写的组合，都靠这段凑）
   想改口味只看这里，不用碰下面的渲染代码：
     kinds —— 收美食（food）还是美景（scenery）
     any   —— 条目【名字】里出现任意一个词就收进来，命中几个词就是几分
     not   —— 名字里带这些词的一律不收（用来踢掉"看着像海其实不是海"的）
     add   —— 规则漏掉、但你想要进来的条目 id（add 会盖过 not）
     drop  —— 规则误收、一定要踢掉的条目 id
   为什么只看名字不看简介：简介句子长，"海""园"这种字到处都是，一匹配就误收。
   新加的条目名字里带关键词就自动进池子，不用改代码；进错了往 not / drop 里加一项。
   ------------------------------------------------------------ */
const ROUTE_RULES = {
  eat:  { kinds: ["food"], any: [], not: [], add: [], drop: [] },
  sea:  { kinds: ["scenery"],
          any: ["海岸", "半岛", "川岛", "岛", "沙滩", "礁", "湾", "渔", "埠"],
          not: [], add: ["xinhui-yinhuwan"], drop: [] },
  cul:  { kinds: ["scenery"],
          any: ["碉楼", "侨", "古镇", "洋楼", "大院", "村", "里", "寺", "观", "遗址", "旧址", "纪念馆", "故居", "园", "老街", "堤"],
          not: ["公园", "生态园"], add: ["pjiang-baisha"], drop: ["kaiping-dashali"] },
  rest: { kinds: ["scenery"],
          any: ["山", "温泉", "湿地", "森林", "公园", "绿廊", "云道", "湖", "水乡", "谷", "潭", "带", "天堂", "风景区", "长廊"],
          not: ["洋楼", "古镇", "川岛"], add: [], drop: [] }   /* 川岛名字里有"山"，但不是爬山的那种 */
};

/* 自动规划的口味参数 */
const ROUTE_PLAN_CFG = {
  daysMin: 0.5,          // 自定义天数最少填半天
  daysMax: 7,            // 最多七天，再多这站的图鉴就不够排了
  paceMin: 2,            // 每天最少几站
  paceMax: 5,            // 每天最多几站
  pace: 3,               // 默认每天三站：吃一顿、看两处，不算赶
  maxStops: 12,          // 一条自动路线最多几站
  startTowns: ["蓬江", "江海"]   // 第一站优先市区的站，到了就能开走
};

/* 称号：按答对题数给，从高到低匹配 */
const QUIZ_RANKS = [
  { min: 8, name: "侨都风物通", line: "八题全对，这条街巷你闭着眼都能走。" },
  { min: 6, name: "街巷熟客",   line: "再去两三个地方，就能自称熟客了。" },
  { min: 4, name: "初识侨都",   line: "一半靠猜也到了这个分，出发吧。" },
  { min: 0, name: "路边看看",   line: "先从上面这页图鉴挑三个地方开始。" }
];

/* ------------------------------------------------------------
   7. 配置（想改这些参数看这里，不用翻到底下）
   ------------------------------------------------------------ */
const FENGWU_CFG = {
  maxWish: 24,          // 长图里"心愿"最多几个字
  posterW: 750,         // 分享长图宽
  posterH: 1334,        // 分享长图高（约 9:16，手机上长按保存刚好）
  posterLine: "世界那么大 江门这么美 欢迎常来江门",  // 长图底部那行标语（原来放的是网址）
  storageCheckin: "xunmei-fengwu-checkin",   // localStorage 键：我去过的地方
  storageQuizBest: "xunmei-fengwu-quiz-best" // localStorage 键：小测历史最高分
};

/* ============================================================
   下面是渲染逻辑，一般不用改
   ============================================================ */

/* ---------- 工具：按 id 找条目（美食、美景都找） ---------- */
function findFengwu(id) {
  return FOOD.concat(SCENERY).find((x) => x.id === id) || null;
}

/* ---------- 本地打卡记录（不联网，只存这台手机/电脑） ---------- */
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v === null ? fallback : v; }
  catch (e) { return fallback; }   // 隐私模式或 file:// 下 localStorage 可能不可用，打卡记不住也不影响浏览
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch (e) {}
}
function loadCheckins() {
  try { return JSON.parse(lsGet(FENGWU_CFG.storageCheckin, "[]")) || []; }
  catch (e) { return []; }
}
function saveCheckin(id, on) {
  const list = loadCheckins();
  const i = list.indexOf(id);
  if (on && i < 0) list.push(id);
  if (!on && i >= 0) list.splice(i, 1);
  lsSet(FENGWU_CFG.storageCheckin, JSON.stringify(list));
  return list;
}

/* ---------- 照片：路径全部写死在上面两个数组的 img 字段里，这里只负责把路径变成 <img> ---------- */
/* ★ 想改某条照片的位置，去 FOOD / SCENERY 里改那一条的 img，这一段不用动。
   规则只有两条：卡片（kind="thumb"）先拉 thumb/ 下的同名缩略图、拉不到再退原图；
   详情弹层（kind="full"）只拉原图。缩略图由 tools/make-thumbs.py 生成（512×384 的 4:3）。
   卡片那格只有 146~217 CSS px 宽，直接塞原图（一张 160~200 KB）慢到看不出照片。 */

/* 原图路径 → 同名缩略图路径：images/fengwu/x.jpg → images/fengwu/thumb/x.jpg */
function thumbPath(src) {
  return src.replace(/^(.*\/)([^/]+)$/, "$1thumb/$2");
}

/* 这一条能试的路径，全部由条目自己的 img 推出来（不再按文件名猜）：
   kind="thumb" → [缩略图, 原图]；kind="full" → [原图]；img 没写 → []（这一格显示描金占位块）。
   加载失败时 sceneryImgFail() 按这个顺序往下退一格，退完还没有就撤掉 <img>。 */
function imgCandidates(item, kind) {
  const out = [];
  if (item.img) {
    if (kind === "thumb") out.push(thumbPath(item.img));
    out.push(item.img);
  }
  return out;
}

/* 真正写进 <img src=""> 的那一个路径：取上面列表的第一个；img 没写就返回空串 */
function imgOf(item, kind) {
  return imgCandidates(item, kind)[0] || "";
}

function sceneryImgFail(el) {
  const item = findFengwu(el.dataset.fwimg);
  if (!item) return;
  const list = imgCandidates(item, el.dataset.fwkind || "full");
  const next = (+el.dataset.retry || 0) + 1;
  if (next < list.length) {
    el.dataset.retry = next;
    el.src = list[next];
    return;
  }
  /* 全都没有：撤掉 <img>，底下垫着的描金占位块就露出来，AI 角标也一起撤 */
  const box = el.parentNode;
  el.remove();
  const tag = box.querySelector(".fw-ai");
  if (tag) tag.remove();
}

/* 卡片和详情里的 <img> 生成之后要绑一次失败回调（error 事件不往上冒，用不了事件委托）。 */
function bindSceneryImgs(root) {
  root.querySelectorAll("img[data-fwimg]").forEach((el) => {
    el.addEventListener("error", () => sceneryImgFail(el));
    if (el.complete && el.naturalWidth === 0) sceneryImgFail(el);
  });
}

/* ---------- 照片的来源说明：只写在代码里，页面上什么都不显示 ---------- */
/* 条目给了 credit（摄影者 · 许可证）的，照片取自维基共享资源等自由版权图库：
   在 <img> 前面写一段「照片来自网络素材」的 HTML 注释，页面上什么都不显示，
   查看网页源码能看到，逐条清单在 images/scenery/README.md（那份清单不上线）。
   没给 credit 的是本站实拍，不写这段注释 —— 那句话对实拍照片是假的。
   ★ 那句话与格式只改下面 netComment() 一处。 */
/* 注释里不能出现连续两个减号，文件名里真有就换成一个 */
function netComment(item) {
  if (!item.credit) return "";
  const f = String(item.creditFile || "").replace(/-{2,}/g, "-");
  return `<!-- 照片来自网络素材 · 摄影 ${item.credit}${f ? " · commons.wikimedia.org/wiki/" + f : ""} -->`;
}

/* ---------- 配图来源角标 ---------- */
/* 美食那批配图是 AIGC 生成的水彩插画，图上必须写明来源，不冒充实拍；
   美景那批是真实照片，条目里都写了 realImg: true，所以不压角标。
   ★ 只认 realImg 这一个字段：真实照片就在条目里加，AI 图就别加。 */
function imgBadge(item) {
  return item.realImg
    ? { alt: "", tag: "" }
    : { alt: "（AI 生成示意图）", tag: '<span class="fw-ai">AI 生成示意图</span>' };
}

/* ---------- 一张卡（图 + 名字 + 区县 + 一句话） ---------- */
function cardHTML(item, kind) {
  const checked = loadCheckins().indexOf(item.id) >= 0;
  const b = imgBadge(item);
  /* 卡片用缩略图；缩略图没生成就自动退回原图 */
  const src = imgOf(item, "thumb");
  const auto = src ? ` data-fwimg="${item.id}" data-fwkind="thumb"` : "";
  /* 照片还没到之前先垫着描金占位块，照片铺上来就把它盖住 —— 慢网下不会只剩一片黑 */
  const ph = `<span class="fw-ph" aria-hidden="true">${item.name.slice(0, 1)}</span>`;
  const media = src
    ? `<div class="fw-media">${netComment(item)}${ph}<img src="${src}" alt="${item.name}${b.alt}" loading="lazy" decoding="async"${auto}><span class="fw-tag">${kind}</span>${b.tag}</div>`
    : `<div class="fw-media">${ph}<span class="fw-tag">${kind}</span></div>`;
  return `<button type="button" class="fw-card reveal${checked ? " checked" : ""}" data-fwid="${item.id}"
            aria-label="看${item.name}的详细介绍">
            ${media}
            <b class="fw-name">${item.name}</b>
            <span class="fw-town">${item.town}</span>
            <p class="fw-line">${item.line}</p>
            ${checked ? '<span class="fw-checked">我去过</span>' : ""}
          </button>`;
}

/* ---------- 筛选状态 ---------- */
const state = { kind: "food", town: "全部", kw: "" };

function renderCards() {
  const grid = document.querySelector("#fwGrid");
  if (!grid) return;
  const src = state.kind === "food" ? FOOD : SCENERY;
  const list = src.filter((x) =>
    (state.town === "全部" || x.town === state.town) &&
    (!state.kw || (x.name + x.line + x.town).indexOf(state.kw) >= 0));
  grid.innerHTML = list.length
    ? list.map((x) => cardHTML(x, state.kind === "food" ? "食" : "景")).join("")
    : `<p class="fw-empty">这个筛选下暂时没有条目 —— 换个区县，或把关键词清空。</p>`;
  observeReveal(grid);
  bindSceneryImgs(grid);
  const count = document.querySelector("#fwCount");
  if (count) count.textContent = `共 ${list.length} 条`;
}

/* ---------- 详情弹层 ---------- */
function openDetail(id) {
  const item = findFengwu(id);
  const modal = document.querySelector("#fwModal");
  if (!item || !modal) return;
  const checked = loadCheckins().indexOf(id) >= 0;
  const b = imgBadge(item);
  /* 详情这一格大，用原图；512 像素的缩略图铺不满 */
  const src = imgOf(item, "full");
  const auto = src ? ` data-fwimg="${item.id}" data-fwkind="full"` : "";
  const ph = `<span class="fw-ph big" aria-hidden="true">${item.name.slice(0, 1)}</span>`;
  const body = modal.querySelector(".fw-modal-body");
  body.innerHTML =
    `<h2>${item.name}</h2>` +
    `<p class="fw-m-town">${item.town} · ${FOOD.indexOf(item) >= 0 ? "侨都之味" : "侨都之景"}</p>` +
    `<div class="fw-m-media">${netComment(item)}${ph}${src ? `<img src="${src}" alt="${item.name}${b.alt}"${auto}>${b.tag}` : ""}</div>` +
    `<p class="fw-m-detail">${item.detail}</p>` +
    `<p class="fw-m-tip"><b>怎么去 / 怎么吃</b>${item.tip}</p>` +
    `<button type="button" class="btn fw-checkin${checked ? " on" : ""}" data-checkin="${id}">${checked ? "已打卡 ✓" : "我去过"}</button>`;
  bindSceneryImgs(body);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close").focus();
}

function closeModal() {
  const modal = document.querySelector("#fwModal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

/* ---------- 小测 ---------- */
const answers = {};   // { 题目下标: 所选下标 }

function renderQuiz() {
  const box = document.querySelector("#quizBox");
  if (!box) return;
  box.innerHTML = QUIZ.map((q, qi) => `
    <div class="q-item" data-q="${qi}">
      <p class="q-text"><span class="q-no">${String(qi + 1).padStart(2, "0")}</span>${q.q}</p>
      <div class="q-opts">
        ${q.opts.map((o, oi) => `<button type="button" class="q-opt" data-q="${qi}" data-o="${oi}">${o}</button>`).join("")}
      </div>
      <p class="q-why" hidden></p>
    </div>`).join("");
  updateQuizBar();
}

function answerOne(qi, oi) {
  if (answers[qi] !== undefined) return;   // 一题只给一次机会
  answers[qi] = oi;
  const item = document.querySelector(`.q-item[data-q="${qi}"]`);
  const right = QUIZ[qi].a;
  item.querySelectorAll(".q-opt").forEach((b, i) => {
    b.disabled = true;
    if (i === right) b.classList.add("right");
    else if (i === oi) b.classList.add("wrong");
  });
  const why = item.querySelector(".q-why");
  why.textContent = (oi === right ? "答对了。" : "正确答案在上面标出来了。") + " " + QUIZ[qi].why;
  why.hidden = false;
  updateQuizBar();
}

function score() {
  return Object.keys(answers).filter((k) => QUIZ[k].a === answers[k]).length;
}

function updateQuizBar() {
  const done = Object.keys(answers).length;
  const bar = document.querySelector("#quizBar");
  if (!bar) return;
  const best = Number(lsGet(FENGWU_CFG.storageQuizBest, "0"));
  if (done < QUIZ.length) {
    bar.innerHTML = `<span>已答 ${done} / ${QUIZ.length}</span>` +
      `<span class="quiz-score">目前答对 ${score()}</span>` +
      (best ? `<span class="quiz-best">历史最好 ${best} 题</span>` : "");
    return;
  }
  const s = score();
  const rank = QUIZ_RANKS.find((r) => s >= r.min);
  if (s > best) lsSet(FENGWU_CFG.storageQuizBest, String(s));
  bar.innerHTML = `<span class="quiz-final">得分 ${s} / ${QUIZ.length} · ${rank.name}</span>` +
    `<span class="quiz-rankline">${rank.line}</span>` +
    `<button type="button" class="btn" data-action="quiz-reset">重新作答</button>`;
}

/* ---------- 路线推荐：编者固定路线 + 自动规划 ---------- */

/* 界面上的三个临时状态：用哪种给法（hand 编者 / auto 自动）、"换一条"换了几次、
   哪些站的详细介绍是展开着的。不写 localStorage —— 刷新就回默认，
   免得下次进来看到一条自己没选过的计划。 */
const rtState = { mode: "hand", offset: 0, open: [] };

/* 编者在固定路线里选过的站。自动规划给它们加一档权重，
   这样默认的自动路线至少和手写路线口味一致，而不是按 id 排序瞎选。 */
const CURATED_IDS = {};
Object.keys(ROUTES).forEach((k) => {
  ROUTES[k].stops.forEach((id) => { CURATED_IDS[id] = (CURATED_IDS[id] || 0) + 1; });
});

/* 图鉴里的条目算不算这条玩法：命中几个关键词就是几分，命中 not 直接出局 */
function ruleScore(item, rule) {
  const kind = FOOD.indexOf(item) >= 0 ? "food" : "scenery";
  if (rule.kinds.indexOf(kind) < 0) return 0;
  if ((rule.not || []).some((w) => item.name.indexOf(w) >= 0)) return 0;
  if (!rule.any || !rule.any.length) return 1;          // 像"吃得地道"这种整类都收
  return rule.any.reduce((s, w) => s + (item.name.indexOf(w) >= 0 ? 1 : 0), 0);
}

/* 把某条玩法能收的条目全捞出来，add / drop 在这一步修正，最后按分数排好。
   同分时按图鉴里的先后（蓬江→江海→新会→台山→开平→鹤山→恩平）排，
   不按 id 字母序 —— 那样会让"恩平"这种拼音靠前的区县白插队。 */
function candidatesFor(prefId) {
  const rule = ROUTE_RULES[prefId];
  const all = FOOD.concat(SCENERY);
  const out = [];
  if (!rule) return out;
  all.forEach((item, ix) => {
    const s = ruleScore(item, rule);
    if (s > 0) out.push({ item, score: s, ix, viaKind: !(rule.any || []).length, bonus: CURATED_IDS[item.id] ? 1 : 0 });
  });
  (rule.add || []).forEach((id) => {
    const ix = all.findIndex((x) => x.id === id);
    const it = ix >= 0 ? all[ix] : null;
    if (it && !out.some((c) => c.item.id === id)) out.push({ item: it, ix, score: 1, viaKind: false, bonus: CURATED_IDS[id] ? 1 : 0 });
  });
  (rule.drop || []).forEach((id) => {
    const i = out.findIndex((c) => c.item.id === id);
    if (i >= 0) out.splice(i, 1);
  });
  return out.sort((a, b) => (b.score + b.bonus) - (a.score + a.bonus) || a.ix - b.ix);
}

/* 同一区县尽量连着走：第一站优先市区的站，之后留在当前区县直到走完，
   再换到"剩下的站最多"的那个区县。纯排序规则，不涉及车程数字。 */
function clusterOrder(picked) {
  const rest = picked.slice();
  const out = [];
  const head = rest.findIndex((c) => ROUTE_PLAN_CFG.startTowns.indexOf(c.item.town) >= 0);
  out.push(rest.splice(head >= 0 ? head : 0, 1)[0]);
  while (rest.length) {
    const town = out[out.length - 1].item.town;
    let j = rest.findIndex((c) => c.item.town === town);
    if (j < 0) {
      const left = {};
      rest.forEach((c) => { left[c.item.town] = (left[c.item.town] || 0) + 1; });
      const busiest = rest.reduce((m, c) => (left[c.item.town] > left[m.item.town] ? c : m), rest[0]);
      j = rest.findIndex((c) => c.item.town === busiest.item.town);
    }
    out.push(rest.splice(j, 1)[0]);
  }
  return out;
}

/* 天数 × 每天几站 = 要排几站，再从捞好的池子里取；offset 每加一次，往后挪一站重来 */
function planStops(prefId, days, pace, offset) {
  const cands = candidatesFor(prefId);
  const want = Math.max(2, Math.min(ROUTE_PLAN_CFG.maxStops, Math.round(days * pace)));
  const take = Math.min(want, cands.length);
  if (!take) return { list: [], want, got: 0 };
  const rot = (((offset || 0) * take) % cands.length + cands.length) % cands.length;
  const picked = [];
  for (let i = 0; i < take; i++) picked.push(cands[(rot + i) % cands.length]);
  return { list: clusterOrder(picked), want, got: take };
}

/* 一行"为什么"：先说为什么排在这个位置，再说凭什么是它。
   只讲路线逻辑，不编车程时间和门票价格 —— 那些以现场为准。 */
function stopWhy(c, i, list, pref, isAuto) {
  const cur = c.item;
  const prev = i ? list[i - 1].item : null;
  let where;
  if (!prev) {
    where = ROUTE_PLAN_CFG.startTowns.indexOf(cur.town) >= 0
      ? `${cur.town}在市区，到了就能开走，不用一早就赶路`
      : `这一段从${cur.town}起头`;
  } else if (prev.town === cur.town) {
    where = `和上一站同在${cur.town}，连着走省一段车程`;
  } else {
    where = `从${prev.town}换到${cur.town}，这一带的站排在一起`;
  }
  const why = [];
  if (c.bonus && !c.viaKind) why.push("编者在固定路线里也选了它");
  if (c.viaKind) why.push(`${FOOD.indexOf(cur) >= 0 ? "美食" : "美景"}这一整类都算「${pref.name}」`);
  else if (c.score > 1) why.push(`名字里带这条玩法的 ${c.score} 个关键词`);
  else if (c.score === 1 && isAuto) why.push(`名字对得上「${pref.name}」`);
  const head = isAuto ? "自动排在第" : "编者排在第";
  return `${head}${i + 1}站：${where}${why.length ? "；选它：" + why.join("、") : ""}。`;
}

/* 一站 = 编号 + 站名（点开弹层）+ 一句话 + 推荐理由 + 就地展开的详细介绍 */
function rtStopHTML(c, i, list, pref, isAuto) {
  const it = c.item;
  const opened = rtState.open.indexOf(it.id) >= 0;
  return `<div class="rt-stop${opened ? " open" : ""}">
            <span class="rt-no">${i + 1}</span>
            <div class="rt-body">
              <button type="button" class="rt-name" data-fwid="${it.id}">${it.name}</button>
              <p class="rt-meta">${it.town} · ${FOOD.indexOf(it) >= 0 ? "吃这一站" : "看这一站"} · ${it.line}</p>
              <p class="rt-why">${stopWhy(c, i, list, pref, isAuto)}</p>
              <button type="button" class="rt-more" data-rtmore="${it.id}">${opened ? "收起介绍" : "看详细介绍"}</button>
              <div class="rt-detail"${opened ? "" : " hidden"}>
                <p>${it.detail}</p>
                <p class="rt-tip"><b>怎么去 / 怎么玩</b>${it.tip}</p>
              </div>
            </div>
          </div>`;
}

/* 按"一天几站"切段，每段给一行天头。
   自动规划用输入框里的每天几站；编者路线按总站数平摊到那几天，
   免得一条一天的路线被切成"第 1 天 / 第 2 天"。 */
function rtDaysHTML(list, pref, perDay, isAuto) {
  const groups = [];
  list.forEach((c, i) => {
    const d = Math.floor(i / perDay);
    if (!groups[d]) groups[d] = [];
    groups[d].push(c);
  });
  return groups.map((g, gi) => {
    const towns = [];
    g.forEach((c) => { if (towns.indexOf(c.item.town) < 0) towns.push(c.item.town); });
    return `<p class="rt-day">第 ${gi + 1} 天<span>${towns.join("、")} · ${g.length} 站</span></p>` +
      g.map((c) => rtStopHTML(c, list.indexOf(c), list, pref, isAuto)).join("");
  }).join("");
}

/* 自定义天数那两个输入框，读出来并夹到合法范围 */
function readCustomPlan() {
  const cfg = ROUTE_PLAN_CFG;
  const dEl = document.querySelector("#rtDays");
  const pEl = document.querySelector("#rtPace");
  let days = Number(dEl && dEl.value);
  let pace = Number(pEl && pEl.value);
  if (!(days > 0)) days = 2;
  if (!(pace > 0)) pace = cfg.pace;
  days = Math.min(cfg.daysMax, Math.max(cfg.daysMin, days));
  pace = Math.min(cfg.paceMax, Math.max(cfg.paceMin, Math.round(pace)));
  return { days, pace };
}

function daysLabel(days) {
  return days < 1 ? "半天" : `${days} 天`;
}

function renderRoutes() {
  const dayChip = document.querySelector(".fw-day-chip.on");
  const prefChip = document.querySelector(".fw-pref-chip.on");
  const box = document.querySelector("#routeOut");
  const customRow = document.querySelector("#routeCustom");
  if (!dayChip || !prefChip || !box) return;

  const pref = ROUTE_PREFS.find((p) => p.id === prefChip.dataset.pref);
  const isCustom = dayChip.dataset.days === "x";
  if (customRow) customRow.hidden = !isCustom;

  const plan = isCustom ? readCustomPlan() : { days: Number(dayChip.dataset.days), pace: ROUTE_PLAN_CFG.pace };
  const curated = rtState.mode === "hand" ? ROUTES[`${plan.days}-${pref.id}`] : null;
  const title = `${daysLabel(plan.days)} · ${pref.name}`;

  let list, line, extra = "", isAuto;
  if (curated) {
    // 编者自己写的路线：不再重复标"编者也选了它"（这句对固定路线本身是废话）
    list = curated.stops.map(findFengwu).filter(Boolean).map((item) => ({ item, score: 0, bonus: 0, viaKind: false }));
    line = curated.line;
    isAuto = false;
  } else {
    const r = planStops(pref.id, plan.days, plan.pace, rtState.offset);
    list = r.list;
    line = pref.line;
    isAuto = true;
    if (rtState.mode === "hand") extra = `「${title}」这条编者没写固定路线，下面这条是按规则自动凑的。`;
    if (r.got < r.want) extra += ` 想排 ${r.want} 站，可这条玩法在图鉴里只有 ${r.got} 处对得上，剩下 ${r.want - r.got} 个位置空着，不硬塞。`;
  }

  if (!list.length) {
    box.innerHTML = `<p class="fw-empty">「${title}」凑不出站来 —— 这条玩法在图鉴里一处都没匹配上，
      去 js/fengwu.js 的 <code>ROUTE_RULES["${pref.id}"]</code> 里加个关键词。</p>`;
    return;
  }

  const perDay = curated ? Math.ceil(list.length / plan.days) : plan.pace;
  const noteLead = isAuto
    ? "这条是页面按「同一区县连着走」的规则从上面图鉴里凑的，不是实地踩线过的路线；"
    : "这条是编者写的玩法建议，";
  box.innerHTML =
    `<p class="rt-line"><b>${title}</b>${line}</p>` +
    (extra ? `<p class="rt-extra">${extra.trim()}</p>` : "") +
    rtDaysHTML(list, pref, perDay, isAuto) +
    (isAuto ? `<div class="rt-bar"><button type="button" class="btn" data-action="rt-shuffle">换一条</button>
        <span>换一次往后挪 ${list.length} 站，把池子里下一批地方排进来</span></div>` : "") +
    `<p class="rt-note">${noteLead}
      车程、门票、开放时间和潮汐都以现场为准。点站名出弹层，点「看详细介绍」就地展开。</p>`;
}

/* ---------- 分享长图：canvas 画一张竖版海报 ---------- */
function fillPosterSelect() {
  const sel = document.querySelector("#posterPick");
  if (!sel) return;
  const group = (label, list) =>
    `<optgroup label="${label}">` + list.map((x) => `<option value="${x.id}">${x.name}（${x.town}）</option>`).join("") + `</optgroup>`;
  sel.innerHTML = group("美食", FOOD) + group("美景", SCENERY);
}

/* 手动折行：canvas 没有自动换行，按字数逐字累加量宽度 */
function wrapText(ctx, text, maxW) {
  const lines = [];
  let cur = "";
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; }
    else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawPoster() {
  const cv = document.querySelector("#posterCanvas");
  if (!cv) return;
  const W = FENGWU_CFG.posterW, H = FENGWU_CFG.posterH;
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const pick = document.querySelector("#posterPick");
  const wishEl = document.querySelector("#posterWish");
  const item = findFengwu(pick ? pick.value : "") || FOOD[0];
  const wishRaw = wishEl ? (wishEl.value || "").trim() : "";
  const wish = (wishRaw || "我想去看看").slice(0, FENGWU_CFG.maxWish);
  const kind = FOOD.indexOf(item) >= 0 ? "侨都之味" : "侨都之景";

  /* 1. 底色：深夜空蓝的一层渐变，和站内配色一致 */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1d2a3d"); bg.addColorStop(1, "#16202e");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  /* 2. 描金细框 */
  ctx.strokeStyle = "rgba(201,168,106,.55)"; ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  /* 3. 顶部小字 + 大标题 */
  ctx.fillStyle = "rgba(233,226,211,.72)";
  ctx.font = '30px "Microsoft YaHei", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("寻美江门 · 侨都薪火", W / 2, 118);

  ctx.fillStyle = "#c9a86a";
  ctx.font = '32px "Microsoft YaHei", sans-serif';
  ctx.fillText(kind, W / 2, 176);

  ctx.fillStyle = "#f6efe2";
  ctx.font = '700 76px "STZhongsong", "SimSun", serif';
  const nameLines = wrapText(ctx, item.name, W - 120);
  let y = 272;
  nameLines.forEach((ln) => { ctx.fillText(ln, W / 2, y); y += 92; });

  ctx.fillStyle = "rgba(201,168,106,.85)";
  ctx.font = '30px "Microsoft YaHei", sans-serif';
  ctx.fillText(item.town, W / 2, y + 6);
  y += 70;

  /* 4. 中间一条装饰线 */
  ctx.strokeStyle = "rgba(201,168,106,.4)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - 110, y); ctx.lineTo(W / 2 + 110, y); ctx.stroke();
  y += 66;

  /* 5. 详情正文 */
  ctx.fillStyle = "rgba(233,226,211,.9)";
  ctx.font = '33px "Microsoft YaHei", sans-serif';
  ctx.textAlign = "left";
  wrapText(ctx, item.detail, W - 170).slice(0, 8).forEach((ln) => { ctx.fillText(ln, 85, y); y += 56; });

  /* 6. 心愿句（用户输入，写在框里） */
  y += 26;
  ctx.textAlign = "center";
  ctx.fillStyle = "#a63a2b";
  ctx.fillRect(70, y, W - 140, 150);
  ctx.fillStyle = "#f6efe2";
  ctx.font = '700 46px "STZhongsong", "SimSun", serif';
  wrapText(ctx, "「" + wish + "」", W - 200).slice(0, 2).forEach((ln, i) => {
    ctx.fillText(ln, W / 2, y + (i ? 76 : 122 - 46));
  });
  y += 150 + 60;

  /* 7. 底部：标语与日期 */
  const now = new Date();
  ctx.fillStyle = "rgba(201,168,106,.8)";
  ctx.font = '700 30px "STZhongsong", "SimSun", serif';
  ctx.fillText(FENGWU_CFG.posterLine, W / 2, H - 118);
  ctx.fillStyle = "rgba(233,226,211,.5)";
  ctx.font = '24px "Microsoft YaHei", sans-serif';
  ctx.fillText(`寻美江门 · ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`, W / 2, H - 74);

  /* 画完把 canvas 露出来，同时给下载按钮挂上当前的文件名 */
  const wrap = document.querySelector("#posterOut");
  if (wrap) wrap.hidden = false;
  const dl = document.querySelector("#posterDl");
  if (dl) {
    dl.setAttribute("download", `侨都风物-${item.name}.png`);
    /* 把画好的 canvas 直接变成 dataURL 给下载链接用；电脑上点"保存长图"，
       手机上长按上面那张预览图保存（浏览器不允许 a[download] 在长按时生效）。 */
    try { dl.href = cv.toDataURL("image/png"); } catch (e) {}
  }
  const tip = document.querySelector("#posterTip");
  if (tip) tip.textContent = "手机上长按上面这张图可以保存；电脑点“保存长图”。";
}

/* ---------- 滚动入场：本页的卡片是动态生成的，所以要自己观察 ---------- */
function observeReveal(scope) {
  const els = (scope || document).querySelectorAll(".reveal:not(.in)");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

/* ---------- 打卡总数（页脚小字，让"看过多少处"有反馈） ---------- */
function updateCheckinCount() {
  const box = document.querySelector("#checkinCount");
  if (!box) return;
  const n = loadCheckins().length;
  box.textContent = n ? `你已经打卡 ${n} 处 · 再挑一个地方出发` : "点卡片看详情，进去按一下“我去过”，这台手机会记住";
}

/* ============================================================
   事件绑定（用委托：卡片和弹层里的按钮都是后生成的）
   ============================================================ */
document.addEventListener("click", (e) => {
  /* 分类切换 */
  const tab = e.target.closest("[data-kind]");
  if (tab) {
    state.kind = tab.dataset.kind;
    document.querySelectorAll(".fw-tab").forEach((t) => t.classList.toggle("on", t === tab));
    renderCards();
    return;
  }
  /* 区县筛选 */
  const chip = e.target.closest("[data-town]");
  if (chip) {
    state.town = chip.dataset.town;
    document.querySelectorAll(".fw-town-chip").forEach((c) => c.classList.toggle("on", c === chip));
    renderCards();
    return;
  }
  /* 打卡按钮（在弹层里） */
  const ci = e.target.closest("[data-checkin]");
  if (ci) {
    const on = !loadCheckins().includes(ci.dataset.checkin);
    saveCheckin(ci.dataset.checkin, on);
    ci.classList.toggle("on", on);
    ci.textContent = on ? "已打卡 ✓" : "我去过";
    const card = document.querySelector(`.fw-card[data-fwid="${ci.dataset.checkin}"]`);
    if (card) card.classList.toggle("checked", on);
    updateCheckinCount();
    return;
  }
  /* 打开详情（卡片、路线里的站点都走这里） */
  const open = e.target.closest("[data-fwid]");
  if (open) { openDetail(open.dataset.fwid); return; }
  /* 关闭详情 */
  const modal = document.querySelector("#fwModal");
  if (modal && !modal.hidden && (e.target === modal || e.target.closest(".modal-close"))) { closeModal(); return; }

  /* 小测选项 */
  const opt = e.target.closest(".q-opt");
  if (opt && !opt.disabled) { answerOne(Number(opt.dataset.q), Number(opt.dataset.o)); return; }
  if (e.target.closest('[data-action="quiz-reset"]')) {
    Object.keys(answers).forEach((k) => delete answers[k]);
    renderQuiz();
    return;
  }
  /* 路线：天数 / 偏好（两个都即时重画，不用按"生成"才更新） */
  const day = e.target.closest(".fw-day-chip");
  if (day) {
    document.querySelectorAll(".fw-day-chip").forEach((c) => c.classList.toggle("on", c === day));
    rtState.offset = 0;
    renderRoutes();
    return;
  }
  const pref = e.target.closest(".fw-pref-chip");
  if (pref) {
    document.querySelectorAll(".fw-pref-chip").forEach((c) => c.classList.toggle("on", c === pref));
    rtState.offset = 0;
    renderRoutes();
    return;
  }
  /* 路线：编者给的还是自动凑的 */
  const mode = e.target.closest(".fw-mode-chip");
  if (mode) {
    rtState.mode = mode.dataset.mode;
    rtState.offset = 0;
    document.querySelectorAll(".fw-mode-chip").forEach((c) => c.classList.toggle("on", c === mode));
    renderRoutes();
    return;
  }
  /* 路线：换一条（把候选池往后挪一批） */
  if (e.target.closest('[data-action="rt-shuffle"]')) {
    rtState.offset += 1;
    renderRoutes();
    return;
  }
  /* 路线：就地展开/收起某一站的详细介绍 */
  const more = e.target.closest("[data-rtmore]");
  if (more) {
    const id = more.dataset.rtmore;
    const at = rtState.open.indexOf(id);
    if (at >= 0) rtState.open.splice(at, 1);
    else rtState.open.push(id);
    renderRoutes();
    return;
  }
  /* 长图 */
  if (e.target.closest("#posterGo")) { drawPoster(); return; }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  /* 详情打开时按回车不算关闭，其它键不动 —— 保持和首页名人弹层一样的手感 */
});

/* 关键词搜索：输入即筛，不用回车 */
const kwInput = document.querySelector("#fwSearch");
if (kwInput) {
  kwInput.addEventListener("input", () => { state.kw = kwInput.value.trim(); renderCards(); });
}

/* 自定义天数、每天几站：输入即重画；离开输入框时把越界的数字修正回范围内 */
["#rtDays", "#rtPace"].forEach((sel) => {
  const el = document.querySelector(sel);
  if (!el) return;
  el.addEventListener("input", renderRoutes);
  el.addEventListener("change", () => {
    const p = readCustomPlan();
    el.value = el === document.querySelector("#rtDays") ? p.days : p.pace;
  });
});

/* 选地点 → 长图区跟着预选好，但要点"生成"才画 */
const pickSel = document.querySelector("#posterPick");
if (pickSel) pickSel.addEventListener("change", () => { if (!document.querySelector("#posterOut").hidden) drawPoster(); });

/* 美景照片预热：页面闲下来之后先把头几张缩略图拉下来，不抢美食首屏的带宽。
   缩略图 URL 由那一条的 img 经 thumbPath() 推出来，和卡片里写的完全一样，拉过一次卡片就直接命中缓存。 */
function warmSceneryImgs() {
  SCENERY.slice(0, 4).forEach((it) => {
    const src = imgOf(it, "thumb");
    if (!src) return;
    const l = document.createElement("link");
    l.rel = "preload";
    l.as = "image";
    l.href = src;
    document.head.appendChild(l);
  });
}
if ("requestIdleCallback" in window) requestIdleCallback(warmSceneryImgs, { timeout: 2500 });
else setTimeout(warmSceneryImgs, 1200);

/* ---------- 启动 ---------- */
fillPosterSelect();
renderCards();
renderQuiz();
updateCheckinCount();
/* 路线默认选中"1 天 + 吃得地道"，进页面就能看到一条成品，不是一片空白 */
const firstDay = document.querySelector('.fw-day-chip[data-days="1"]');
if (firstDay) document.querySelectorAll(".fw-day-chip").forEach((c) => c.classList.toggle("on", c === firstDay));
const firstPref = document.querySelector('.fw-pref-chip[data-pref="eat"]');
if (firstPref) document.querySelectorAll(".fw-pref-chip").forEach((c) => c.classList.toggle("on", c === firstPref));
renderRoutes();
