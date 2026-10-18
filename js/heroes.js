/* ============================================================
   heroes.js —— 首页"江门历代名人"英雄墙
   1) HEROES 数组：唯一需要修改的地方（照片文件名 + 介绍文案）
   2) 背景照片带：把同一批照片虚化后铺在地球后面
   3) 英雄墙：首页下方的一排人物卡，点一下弹出完整介绍

   照片怎么放：把真实照片按下面 file 字段的名字放进 images/照片/历代名人/
   例如 images/照片/历代名人/liang-qichao.jpg —— 文件名对上就自动显示，
   没有照片时卡片会显示"姓名 + 待补照片"的占位样式，不会破版。
   尺寸建议：竖构图 3:4，如 900×1200，JPG 质量 82，单张 300KB 以内。
   ============================================================ */

const HEROES = [
  {
    id: "chen-baihua", name: "陈白沙", years: "1428—1500",
    place: "新会白沙里", role: "明代大儒 · 江门学派开创者",
    file: "images/照片/历代名人/chen-baihua.jpg",
    quote: "以虚而无，自然为宗",
    intro: "名陈献章，明代思想家、教育家、书法家。在白沙村设帐讲学十余年，开创"
         + "“江门学派”，是岭南地区唯一入祀孔庙的学者，江门也因此被称作“白沙故里”。"
         + "他用圭峰山的茅草制笔作书，世称“茅龙笔”，字势苍劲奇崛，别开生面。"
  },
  {
    id: "wu-tingfang", name: "伍廷芳", years: "1842—1922",
    place: "新会", role: "外交家 · 法学家",
    file: "images/照片/历代名人/wu-tingfang.jpg",
    quote: "法者，国之权衡",
    intro: "生于新会，早年赴英国学习法学，是清末最出色的涉外法政人才之一。"
         + "与沈家本一同主持修订刑律，奏请废除凌迟、缘坐等酷刑；先后出任驻美、"
         + "驻西班牙、驻秘鲁公使，民国后任司法总长、外交总长，并曾代理非常大总统府外交总长。"
  },
  {
    /* 陈宜禧生卒年有两说：1850—1927（多数侨务资料）与 1844.6—1929.5（台山斗山镇政府文史稿）。
       这里暂取 1850—1927；要改就改下面 years，题材页 qiaobao.html 的信封正文刻意没写年份。 */
    id: "chen-yixi", name: "陈宜禧", years: "1850—1927",
    place: "台山斗山", role: "侨领 · 新宁铁路主持者",
    file: "images/照片/历代名人/chen-yixi.jpg",
    quote: "以中国人之资本，筑中国人之铁路",
    intro: "台山斗山人，16 岁赴美在铁路做工、后在西雅图经商。"
         + "1904 年回乡，立下“不用洋人、不借外债、不招洋股”的规矩，主持修建新宁铁路——"
         + "中国人自行设计、集资兴办的第一条民营铁路。铁路 1906 年破土，1909 年斗山至公益段先行通车，"
         + "1920 年全线贯通 133 公里，把公益、台城、斗山连成一体，也第一次把侨乡带进了近代化。"
  },
  {
    id: "liang-qichao", name: "梁启超", years: "1873—1929",
    place: "新会茶坑", role: "维新领袖 · 学者",
    file: "images/照片/历代名人/liang-qichao.jpg",
    quote: "少年强，则国强",
    intro: "戊戌变法领袖，与康有为并称“康梁”。变法失败后流亡海外，办报著文，"
         + "以一支笔影响了整整一代中国人，《少年中国说》中“少年强则国强”成为几代青年的自勉之语。"
         + "晚年任清华国学研究院导师，在史学、佛学、文学各领域著述宏富，遗著合编为《饮冰室合集》。"
         + "梁氏一族后来走出建筑学家梁思成、考古学家梁思永、目录学家梁思庄，一门三杰，皆以“中国”为念。"
  },
  {
    id: "chen-shaobai", name: "陈少白", years: "1869—1934",
    place: "新会外海", role: "辛亥元老 · 报人",
    file: "images/照片/历代名人/chen-shaobai.jpg",
    quote: "革命非报馆不能鼓吹",
    intro: "新会外海人，兴中会早期会员，与孙中山、尢列、杨鹤龄并称“四大寇”。"
         + "1900 年在香港创办《中国日报》，以报纸为武器鼓吹革命；"
         + "辛亥光复后任广东都督府外交司司长，1921 年又出任香山县改名后的中山县首任县长。"
  },
  {
    id: "siu-mei-tong", name: "司徒美堂", years: "1868—1955",
    place: "开平赤坎", role: "美洲侨领 · 致公党创始人之一",
    file: "images/照片/历代名人/siu-mei-tong.jpg",
    quote: "我还是一个地道的中国人",
    intro: "开平赤坎镇中股村牛路里人，约 12 岁随乡人赴美国旧金山谋生，"
         + "1885 年加入洪门致公堂，后成为全美洪门领袖、美洲华侨领袖。"
         + "1937 年全面抗战爆发后，他联合纽约 54 个侨团发起“纽约华侨抗日救国筹饷总会”，"
         + "发动旅美侨胞募捐，该会募得达 1400 万美元。"
         + "1949 年应邀出席中国人民政治协商会议第一届全体会议。"
  },
  {
    id: "feng-ru", name: "冯如", years: "1884—1912",
    place: "恩平", role: "中国第一位飞机设计师、飞行家",
    file: "images/照片/历代名人/feng-ru.jpg",
    quote: "勿因吾毙而阻其进取心",
    intro: "恩平人，少年随舅父赴美，在机器厂里自学成材。1909 年在美国奥克兰试飞自制飞机成功，"
         + "比莱特兄弟首飞只晚六年。1911 年携两架飞机回国投身辛亥革命，创建中国第一支飞机制造队。"
         + "1912 年在广州燕塘飞行表演中失事殉职，年仅 28 岁，遗言“勿因吾毙而阻其进取心”。"
  },
  {
    id: "chen-yuan", name: "陈垣", years: "1880—1971",
    place: "新会", role: "史学大家 · 教育家",
    file: "images/照片/历代名人/chen-yuan.jpg",
    quote: "纪律自律，刻苦治学",
    intro: "新会人，著名历史学家、教育家，在宗教史、元史、校勘学与避讳学上均有开创性贡献，"
         + "著有《元西域人华化考》《校勘学释例》《史讳举例》《通鉴胡注表微》。"
         + "长期执掌北京师范大学，书斋名“励耘书屋”；弟子启功终生以“励耘师”称之。"
  },
  {
    id: "zhou-wenyong", name: "周文雍", years: "1905—1928",
    place: "开平", role: "广州起义工人赤卫队总指挥",
    file: "images/照片/历代名人/zhou-wenyong.jpg",
    quote: "头可断，肢可折，革命精神不可灭",
    intro: "开平人，1927 年参加广州起义，任工人赤卫队总指挥。1928 年被捕，"
         + "在广州红花岗就义，年仅 23 岁。临刑前他写下绝笔诗，与同赴刑场的陈铁军当众宣布结婚，"
         + "留下“刑场上的婚礼”这一革命爱情传奇。"
  },
  {
    id: "chen-tiejun", name: "陈铁军", years: "1914—1928",
    place: "佛山 · 与周文雍并肩就义", role: "革命烈士",
    file: "images/照片/历代名人/chen-tiejun.jpg",
    quote: "为革命而死，我们感到无限光荣",
    intro: "佛山人，广东大学（今中山大学）预科学生，为追求革命与富裕家庭决裂。"
         + "她与周文雍以“夫妻”身份作掩护从事地下工作，1928 年一同被捕。"
         + "行刑前她高呼“为革命而死，我们感到无限光荣”。"
         + "她虽非江门籍，却因“刑场上的婚礼”成为江门红色记忆不可分割的一部分。"
  },
  {
    id: "lin-jilu", name: "林基路", years: "1916—1943",
    place: "台山四九", role: "革命烈士 · 新疆学院教务长",
    file: "images/照片/历代名人/lin-jilu.jpg",
    quote: "坚定信念，贞守立场",
    intro: "台山人，少年家贫失学，靠自学考入上海大夏大学，后赴苏联留学。"
         + "1942 年受党派遣赴新疆工作，任新疆学院教务长，与毛泽民等共同整顿教学、提倡实干。"
         + "1943 年被军阀盛世才秘密杀害于迪化，年仅 27 岁；狱中写下《囚徒歌》，"
         + "成为一代代青年的精神教材。"
  }
];

/* ---------- 配置：想改样式参数看这里 ---------- */
const HERO_CFG = {
  gridSelector: "#heroWall",       // 英雄墙容器（index.html 里）
  montageSelector: "#heroMontage", // 背景照片带容器
  modalSelector: "#heroModal",     // 点击后弹出介绍的浮层
  montageRows: 3,                  // 背景铺几行照片（行越多越满，也更抢眼）
  driftSec: [150, 190, 230]        // 每行横移一圈用多少秒（数字越大越慢）
};

/* ---------- 通用：造一张"照片 + 占位"的图 ---------- */
function makePhoto(h, altText) {
  const wrap = document.createElement("div");
  wrap.className = "photo";
  const img = document.createElement("img");
  img.src = h.file;
  img.alt = altText;
  img.loading = "lazy";
  img.decoding = "async";
  /* 照片还没放进来时，隐藏破图、露出下面的姓名占位块 */
  img.addEventListener("error", () => wrap.classList.add("no-photo"));
  img.addEventListener("load", () => wrap.classList.remove("no-photo"));
  const ph = document.createElement("div");
  ph.className = "photo-ph";
  ph.innerHTML = `<b>${h.name}</b><span>待补照片</span>`;
  wrap.append(ph, img);
  return wrap;
}

/* ---------- 1. 背景照片带：虚化的照片分行铺在地球后面 ---------- */
function renderMontage() {
  const box = document.querySelector(HERO_CFG.montageSelector);
  if (!box) return;
  const dur = HERO_CFG.driftSec;
  for (let r = 0; r < HERO_CFG.montageRows; r++) {
    const row = document.createElement("div");
    row.className = "montage-row";
    /* 一行就是一条"轨道"：把同一批照片首尾相接放两份，
       配合 CSS 里 translateX(-50%) 就能无缝循环横移 */
    const track = document.createElement("div");
    track.className = "montage-track";
    track.style.animationDuration = dur[r % dur.length] + "s";
    if (r % 2 === 1) track.classList.add("reverse");   // 单数行反向，看着更活
    /* 每行从不同的人开始，三行就不会完全重样 */
    for (let dup = 0; dup < 2; dup++) {
      for (let i = 0; i < HEROES.length; i++) {
        const h = HEROES[(i + r * 3) % HEROES.length];
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "montage-cell";
        cell.dataset.hero = h.id;
        cell.setAttribute("aria-label", `查看 ${h.name} 的介绍`);
        cell.append(makePhoto(h, `${h.name}（${h.years}）`));
        track.append(cell);
      }
    }
    row.append(track);
    box.append(row);
  }
}

/* ---------- 2. 英雄墙 ---------- */
function renderWall() {
  const grid = document.querySelector(HERO_CFG.gridSelector);
  if (!grid) return;
  HEROES.forEach((h, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "hero-card reveal";
    card.dataset.hero = h.id;
    card.innerHTML =
      `<span class="idx">${String(i + 1).padStart(2, "0")}</span>` +
      `<h3>${h.name}</h3>` +
      `<p class="meta">${h.years} · ${h.place}</p>` +
      `<p class="role">${h.role}</p>`;
    card.prepend(makePhoto(h, `${h.name}（${h.years}）`));
    grid.append(card);
  });
}

/* ---------- 3. 点击弹出介绍 ---------- */
function findHero(id) { return HEROES.find((h) => h.id === id); }

let lastFocus = null;
function openModal(id) {
  const modal = document.querySelector(HERO_CFG.modalSelector);
  const h = findHero(id);
  if (!modal || !h) return;
  modal.querySelector(".modal-body").innerHTML =
    `<h2>${h.name}<small>${h.years}</small></h2>` +
    `<p class="m-role">${h.role} · ${h.place}</p>` +
    `<div class="m-photo"></div>` +
    `<blockquote>「${h.quote}」</blockquote>` +
    `<p class="m-intro">${h.intro}</p>`;
  modal.querySelector(".m-photo").append(makePhoto(h, `${h.name}（${h.years}）`));
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close").focus();
}

function closeModal() {
  const modal = document.querySelector(HERO_CFG.modalSelector);
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  if (lastFocus) lastFocus.focus();
}

/* 事件委托：背景照片和英雄卡共用一套点击逻辑 */
document.addEventListener("click", (e) => {
  const cell = e.target.closest("[data-hero]");
  if (cell) { openModal(cell.dataset.hero); return; }
  const modal = document.querySelector(HERO_CFG.modalSelector);
  /* 点遮罩空白处、点关闭按钮都收起 */
  if (modal && !modal.hidden &&
      (e.target === modal || e.target.closest(".modal-close"))) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- 4. 卡片滚动入场 ----------
   .reveal 的样式在 css/base.css 里，这里自己观察：
   首页没有引入 common.js，所以入场动画由本文件负责。 */
function observeReveal() {
  const cards = document.querySelectorAll("#heroWall .reveal");
  if (!("IntersectionObserver" in window)) {
    cards.forEach((el) => el.classList.add("in"));   // 老浏览器直接显示
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  cards.forEach((el) => io.observe(el));
}

renderMontage();
renderWall();
observeReveal();
