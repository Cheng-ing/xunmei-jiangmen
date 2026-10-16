/* ============================================================
   fengwu.js —— 「侨都风物」页的全部数据与交互
   ┌─ 1. FOOD / SCENERY：美食与美景图鉴的数据（★ 想加条目、改文案只动这两个数组 ★）
   ├─ 2. QUIZ：侨都知多少小测的题目与答案
   ├─ 3. ROUTES：路线推荐器的规则（几天 × 什么偏好 → 走哪几站）
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
     name   —— 名称
     town   —— 区县，必须从下面 FENGWU_TOWNS 里选，筛选才分得开
     line   —— 卡片上的一句话（20 字上下最好）
     detail —— 弹层里的详情，两三句
     tip    —— 实用提示（怎么去、什么时候去、怎么点）
     img    —— 配图路径，留空 "" 就显示占位块；
               想加图：把图放进 images/fengwu/ 再在这里填 "images/fengwu/xxx.jpg"，
               建议 4:3 横构图，宽 1200 左右，JPG 质量 85、单张 250KB 以内。
   ⚠ 文案口径：这一节是"稳妥概述"，凡是年份、称号、数量、片名这类硬事实，
      旁边都用「待核实」标了出来。评奖前请逐条对官方资料（江门市政府网、
      各区政府网、世界遗产名录等），核实完把注释里的"待核实"去掉。
   ------------------------------------------------------------ */

/* 区县筛选的顺序，"全部"是第 0 项 */
const FENGWU_TOWNS = ["全部", "蓬江", "江海", "新会", "台山", "开平", "鹤山", "恩平"];

const FOOD = [
  {
    id: "gujing-shae", name: "古井烧鹅", town: "新会", img: "",
    line: "荔枝木明火烤的脆皮烧鹅，新会酒席上的头一道硬菜。",
    detail: "古井镇靠崖门水道，烧鹅用本地养的肥鹅，腌好后挂进炉里以荔枝木一类硬柴明火烤，"
          + "出来皮脆、肉带汁，斩件时那层油亮的脆皮最见功夫。镇上的烧鹅一条街饭馆连铺，半只一只都点得。",
    tip: "想要烧鹅汁捞饭先问一句有没有；周末中午排队，改晚市或提前一点去。"
    // 待核实：具体燃料与腌料配方、"古井烧鹅"做法的官方表述
  },
  {
    id: "xinhui-chenpi", name: "新会陈皮入馔", town: "新会", img: "",
    line: "一瓣陈皮放进汤里、糖水里，柑香把整道菜压住。",
    detail: "新会陈皮是茶枝柑的果皮晒干陈化而成，存放年头越长香气越沉。本地人拿它煲汤、焖肉、"
          + "做陈皮红豆沙，也直接泡水喝；柑香里带一点药香，是侨乡味觉的一张名片。",
    tip: "买整皮去新会的陈皮店或陈皮村；散装、年份说不清的别当“老皮”价钱买。"
    // 待核实：是否为国家地理标志产品、陈化年限的规范说法（站内一律写"三年以上"前先查）
  },
  {
    id: "taishan-huangshanfan", name: "台山黄鳝饭", town: "台山", img: "",
    line: "鳝肉撕成丝和米饭同焗，锅底那层饭焦最抢手。",
    detail: "台山一带的做法：黄鳝蒸熟去骨、撕成丝，与米饭一起回锅焗干水汽，"
          + "饭粒分明又不硬，鳝香吃进米里。镇上饭馆多用当季鳝鱼，一人点一份刚好两人吃。",
    tip: "想要饭焦（锅巴）可以让师傅多焗一会儿；配一碗鲫鱼或猪骨汤不腻。"
  },
  {
    id: "taishan-shenghao", name: "台山生蚝与都斛海鲜", town: "台山", img: "",
    line: "镇海湾外的咸淡水养出肥蚝，都斛的海鲜摊排成一条街。",
    detail: "台山海岸线长、近海养殖多，生蚝以都斛、川岛一带出名，常见炭烧、蒜蓉蒸和蚝烙三种做法。"
          + "都斛镇上的海鲜市场可以现买、再拿到附近饭馆加工，是本地人吃海鲜的常规操作。",
    tip: "“市场买 + 饭馆加工”先问清加工费；休渔期以养殖和冰鲜为主，别信“今日现捕”。"
    // 待核实：休渔期具体时段（南海伏季休渔通常为 5—8 月，年份会调），以及都斛"海鲜街"的正式名称
  },
  {
    id: "kaiping-magang-e", name: "开平马冈鹅", town: "开平", img: "",
    line: "马冈镇的本地鹅，肉紧、皮下脂肪薄，烧卤都撑得住。",
    detail: "马冈鹅是开平马冈镇一带的地方鹅种，当地有烧鹅、白切、醉鹅等做法，"
          + "侨乡村落的宴席和墟镇老店里都常见它。",
    tip: "看碉楼那天把午饭放在马冈镇或赤坎，顺路；晚市去容易售罄。"
    // 待核实：是否为地方畜禽遗传资源、"马冈鹅"名称的官方表述
  },
  {
    id: "kaiping-doufujiao", name: "开平豆腐角", town: "开平", img: "",
    line: "酿过的豆腐煎到两面结壳，老街下午的零嘴。",
    detail: "豆腐角是把豆腐切块、中间酿入鱼胶或肉馅，煎至金黄后再淋汁或略焖，"
          + "外皮带一点脆、里面还是嫩的。开平、台山的老街店铺都做得出来。",
    tip: "刚出锅最好吃；配一碗濑粉或白粥就能当一顿饭。"
  },
  {
    id: "enping-lecai", name: "恩平簕菜", town: "恩平", img: "",
    line: "带刺的野生藤芽，炒过之后先苦后甘。",
    detail: "簕菜是恩平一带采野生嫩芽入馔的蔬菜，清炒、做汤、焙成簕菜茶都有。"
          + "它的味道是典型的“回甘”，第一次吃的人多半会记住这个口感。",
    tip: "怕苦先从簕菜瘦肉汤开始，比清炒柔和。"
    // 待核实："恩平簕菜"的地理标志或特产称号表述
  },
  {
    id: "enping-laifen", name: "恩平濑粉", town: "恩平", img: "",
    line: "米浆漏出来的短粉条，全靠一碗汤头撑着。",
    detail: "濑粉用米浆制成，恩平、开平一带都吃。汤底多用猪骨、虾米、头菜，"
          + "面上撒鸡蛋丝、花生和葱花，粉软汤鲜，是本地常见的早餐。",
    tip: "早市的小店最热闹，现煮现卖；加一份猪手或卤蛋更顶饱。"
  },
  {
    id: "heshan-gulao-mian", name: "鹤山古劳蛋面", town: "鹤山", img: "",
    line: "水乡老面店压出来的竹升蛋面，面身细、蛋香重。",
    detail: "古劳镇是珠三角水乡，河涌之间留着不少做面、晒面的老铺。"
          + "竹升压打出来的蛋面爽弹，配腩汁或猪手汁是本地吃法。",
    tip: "逛完古劳水乡再吃一碗，顺路；一份面加一件云吞是常见点法。"
    // 待核实：具体老店名称与"竹升面"工艺的古劳本地说法
  },
  {
    id: "pjiang-langua", name: "杜阮凉瓜", town: "蓬江", img: "",
    line: "杜阮镇的凉瓜粒大肉厚，苦味过后有回甘。",
    detail: "杜阮凉瓜（苦瓜）是蓬江区杜阮镇出名的本地蔬菜，瘤粒饱满、肉厚核少，"
          + "本地做法有凉瓜排骨汤、酿凉瓜和冰镇蘸酱，夏天饭馆几乎家家有。",
    tip: "怕苦挑颜色偏浅黄、瘤粒宽的，苦味相对轻一点。"
    // 待核实：是否为国家地理标志产品
  }
];

const SCENERY = [
  {
    id: "kaiping-diaolou", name: "开平碉楼与村落", town: "开平", img: "",
    line: "水田之间的多层楼群，2007 年列入世界遗产名录。",
    detail: "开平现存碉楼千余座，把中国传统民居的格局和西式柱廊、穹顶、铁艺合在一起，"
          + "多数是清末民初华侨回乡为防盗匪所建。自力村、锦江里、马降龙、立园是最常被走的几处，"
          + "田间的观景台能把楼群和水塘倒影一起收进画面。",
    tip: "只有一天就在自力村和立园里选；夏天傍晚光线最好，但蚊子也最多，带驱蚊。"
    // 待核实：入选年份（2007 第 31 届世界遗产大会）与现存碉楼准确数量
  },
  {
    id: "kaiping-chikan", name: "赤坎华侨古镇", town: "开平", img: "",
    line: "潭江边的骑楼长街，老码头与侨商字号都在这条街上。",
    detail: "赤坎镇以骑楼老街出名，廊柱沿街面铺开，过去是侨墟和水路码头，"
          + "华侨把南洋与西式的装饰手法带回这条街。近年按古镇景区整修后开放，街区内有侨批、华侨历史的展陈。",
    tip: "从碉楼回江门顺路停靠最好安排；傍晚江边风大，拍照也柔和。"
    // 待核实：整修后的开放范围、门票与展陈名称，老街准确长度（此处不写数字）
  },
  {
    id: "taishan-chuandao", name: "台山川岛", town: "台山", img: "",
    line: "南海上两座岛，长沙滩、防护林和海上日出。",
    detail: "上川岛、下川岛都从台山北部的码头坐船上岛，岛上有开阔沙滩、海岸防护林和渔村。"
          + "外海水色比近岸清透，旺季时岛上住宿紧张，赶日落和第二天清晨的海最值。",
    tip: "先看天气预报再决定当天往返还是住一晚；船票和住宿都建议提前订，周末台风季尤甚。"
    // 待核实：登船码头名称与班次、各沙滩是否需要门票
  },
  {
    id: "taishan-naqin", name: "那琴半岛海岸", town: "台山", img: "",
    line: "花岗岩把海岸雕成一片奇石，栈道贴着山脊走。",
    detail: "台山北陡镇一带的海岸以巨石、礁群出名，长年被海蚀磨出圆润的形状。"
          + "景区把步道修在山脊与礁石之间，退潮时可以走到礁盘边看海蚀形态。",
    tip: "礁石滑，穿防滑鞋；涨退潮时间提前查好，退潮才有礁盘可走。"
    // 待核实：景区正式名称、是否收费、开放路段
  },
  {
    id: "taishan-meijia", name: "梅家大院", town: "台山", img: "",
    line: "骑楼围成一个侨村，广场中间是球场。",
    detail: "端芬镇的梅家大院由华侨集资建于上世纪二三十年代，几十间骑楼围合出一块平整广场，"
          + "走进村要先过一道楼。因为风貌保存完整，多部电影电视剧在这里取过景。",
    tip: "和碉楼线路错开安排；正午暴晒，上午或下午四点后人少光好。"
    // 待核实：建成年份、房屋间数、具体取景片名（不确认就别写片名）
  },
  {
    id: "enping-wenquan", name: "恩平温泉", town: "恩平", img: "",
    line: "珠三角少见的温泉带，秋冬泡汤、夏天玩水。",
    detail: "恩平一带温泉资源集中，多家温泉度假酒店依泉眼而建，池群做成山地园林的样子，"
          + "是江门人秋冬周末度假的常规去处。",
    tip: "淡季工作日最舒服；带小孩问清哪些池水温允许、有没有儿童池。"
    // 待核实："中国温泉之乡"称号与获评年份、温泉集中的具体镇
  },
  {
    id: "xinhui-guifeng", name: "新会圭峰山", town: "新会", img: "",
    line: "城里就能上山，山腰有寺，山上看得见新会城区。",
    detail: "圭峰山是新会城北的一片山体绿地，林荫步道、山顶观景处和山腰的寺庙组成当地人周末爬山、扫墓、野餐的地方。"
          + "秋天山下是柑田，路上能闻到陈皮季的果香。",
    tip: "傍晚上山看日落最划算；带水，山上小卖部不多。"
    // 待核实：景区级别说法（"国家森林公园"/"省级风景名胜区"分别核实），寺名（一般称玉台寺）
  },
  {
    id: "xinhui-xiaoniaotiantang", name: "小鸟天堂", town: "新会", img: "",
    line: "一棵水榕长成一片“林”，巴金把它写进了课文。",
    detail: "天马村河心的一棵水榕独木成林，枝桠伸到水面上，晨昏时白鹭等水鸟归巢绕树飞。"
          + "巴金 1933 年的游记《鸟的天堂》让这里被全国读者记住。",
    tip: "看鸟要赶清晨或傍晚；泛舟和栈道两种玩法，雨天优先栈道。"
    // 待核实：游记发表年份与"写入语文课本"的准确表述
  },
  {
    id: "xinhui-gudou", name: "古兜山海温泉", town: "新会", img: "",
    line: "崖门山海之间的一片度假区，泡汤和看海能同一天。",
    detail: "古兜一带背山面海，温泉度假设施建在山坳与海岸之间，"
          + "本地常把它安排成两天一夜：第一天海边和古镇，第二天上山泡汤。",
    tip: "和崖门、新会陈皮村顺路；节假日池边人多，早场好。"
    // 待核实："一地两泉"之类的宣传说法不要照抄，只写能证实的地理特征
  },
  {
    id: "pjiang-changdi", name: "长堤—启明里", town: "蓬江", img: "",
    line: "骑楼老街加百年侨村，晚上最有生活气。",
    detail: "长堤风貌街沿西江铺开，骑楼、老商号和小吃摊在同一条街上；"
          + "附近的启明里是蓬江的老侨村，青砖民居、窄巷和侨批主题的展陈如今是散步与拍照的地方。",
    tip: "傍晚去最好：先在长堤吃东西，天黑后进启明里看灯。"
    // 待核实：启明里内各馆的正式名称与开放时间
  },
  {
    id: "jh-baishuidai", name: "江海白水带", town: "江海", img: "",
    line: "城市东面的山林步道，夏天比城里凉，能望见江门城区。",
    detail: "白水带是江海区的一片城市山林，步道串起树林、溪流与观景处，"
          + "是本地人傍晚跑步、周末带小孩爬山常去的地方。",
    tip: "穿运动鞋，带水；想拍城市傍晚在日落前半小时上山。"
    // 待核实：园内具体景点名（塔、瀑布等）先不写，查到再补进 detail
  },
  {
    id: "heshan-gulao", name: "鹤山古劳水乡", town: "鹤山", img: "",
    line: "河涌当街巷，船曾经就是门前的路。",
    detail: "古劳镇是珠三角典型的水乡，村落之间河涌交错，榕树、石桥和临水老屋还在。"
          + "这里是咏春宗师梁赞的故里，水乡与拳师两个话题都够走半天。",
    tip: "和一碗古劳蛋面安排在同一趟；泛舟要看水位和天气，雨天在岸上走。"
    // 待核实：梁赞故里说法、是否开发为景区及收费、泛舟项目现状
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
   增删路线 = 增删这里的键；缺某个组合时页面会提示"这条还没配"。
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

/* ---------- 一张卡（图 + 名字 + 区县 + 一句话） ---------- */
function cardHTML(item, kind) {
  const checked = loadCheckins().indexOf(item.id) >= 0;
  /* 没配图的条目不生成 <img>，直接留占位块，页面不会出破图图标 */
  const media = item.img
    ? `<div class="fw-media has-img"><img src="${item.img}" alt="${item.name}" loading="lazy" decoding="async"><span class="fw-tag">${kind}</span></div>`
    : `<div class="fw-media"><span class="fw-ph" aria-hidden="true">${item.name.slice(0, 1)}</span><span class="fw-tag">${kind}</span></div>`;
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
  const count = document.querySelector("#fwCount");
  if (count) count.textContent = `共 ${list.length} 条`;
}

/* ---------- 详情弹层 ---------- */
function openDetail(id) {
  const item = findFengwu(id);
  const modal = document.querySelector("#fwModal");
  if (!item || !modal) return;
  const checked = loadCheckins().indexOf(id) >= 0;
  modal.querySelector(".fw-modal-body").innerHTML =
    `<h2>${item.name}</h2>` +
    `<p class="fw-m-town">${item.town} · ${FOOD.indexOf(item) >= 0 ? "侨都之味" : "侨都之景"}</p>` +
    `<div class="fw-m-media">${item.img ? `<img src="${item.img}" alt="${item.name}">` : `<span class="fw-ph big">${item.name.slice(0, 1)}</span>`}</div>` +
    `<p class="fw-m-detail">${item.detail}</p>` +
    `<p class="fw-m-tip"><b>怎么去 / 怎么吃</b>${item.tip}</p>` +
    `<button type="button" class="btn fw-checkin${checked ? " on" : ""}" data-checkin="${id}">${checked ? "已打卡 ✓" : "我去过"}</button>`;
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

/* ---------- 路线推荐 ---------- */
function renderRoutes() {
  const dayChip = document.querySelector(".fw-day-chip.on");
  const prefChip = document.querySelector(".fw-pref-chip.on");
  const box = document.querySelector("#routeOut");
  if (!dayChip || !prefChip || !box) return;
  const days = dayChip.dataset.days;
  const prefMeta = ROUTE_PREFS.find((p) => p.id === prefChip.dataset.pref);
  const route = ROUTES[`${days}-${prefMeta.id}`];
  if (!route) {
    box.innerHTML = `<p class="fw-empty">这条「${days} 天 · ${prefMeta.name}」还没配路线。
      想补就在 js/fengwu.js 的 <code>ROUTES["${days}-${prefMeta.id}"]</code> 里加一站站名单。</p>`;
    return;
  }
  box.innerHTML =
    `<p class="rt-line"><b>${days} 天 · ${prefMeta.name}</b>${route.line}</p>` +
    route.stops.map((id, i) => {
      const it = findFengwu(id);
      if (!it) return "";   // id 写错了就不显示，别让页面报错
      return `<button type="button" class="rt-stop" data-fwid="${id}">
                <span class="rt-no">${i + 1}</span>
                <span class="rt-body"><b>${it.name}</b><span>${it.town} · ${it.line}</span></span>
              </button>`;
    }).join("") +
    `<p class="rt-note">上面的顺序只是玩法建议，具体车程和开放时间请以现场为准；
      点任意一站可以看详细介绍。</p>`;
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
    renderRoutes();
    return;
  }
  const pref = e.target.closest(".fw-pref-chip");
  if (pref) {
    document.querySelectorAll(".fw-pref-chip").forEach((c) => c.classList.toggle("on", c === pref));
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

/* 选地点 → 长图区跟着预选好，但要点"生成"才画 */
const pickSel = document.querySelector("#posterPick");
if (pickSel) pickSel.addEventListener("change", () => { if (!document.querySelector("#posterOut").hidden) drawPoster(); });

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
