/* ============================================================
   heroes.js —— 首页"江门历代名人"：背景照片带 + 3D 环廊 + 点击弹介绍
   1) HEROES 数组：唯一需要修改的地方（照片文件名 + 介绍文案）
   2) 背景照片带：把同一批照片虚化后铺在地球后面
   3) 3D 环廊：11 位名人围成一圈，自动旋转，可拖动 / 按钮 / 方向键
   4) 点击卡片：先转到正位，再弹出介绍

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
    id: "chen-tiejun", name: "陈铁军", years: "1904—1928",
    place: "生于佛山 · 祖籍台山三合", role: "革命烈士",
    file: "images/照片/历代名人/chen-tiejun.jpg",
    quote: "为革命而死，我们感到无限光荣",
    intro: "佛山人，广东大学（今中山大学）预科学生，为追求革命与富裕家庭决裂。"
         + "她与周文雍以“夫妻”身份作掩护从事地下工作，1928 年一同被捕。"
         + "行刑前她高呼“为革命而死，我们感到无限光荣”。"
         + "陈铁军祖籍台山三合，“刑场上的婚礼”是江门红色记忆的一部分。"
  },
  {
    id: "lin-jilu", name: "林基路", years: "1916—1943",
    place: "台山四九", role: "革命烈士 · 新疆学院教务长",
    file: "images/照片/历代名人/lin-jilu.jpg",
    quote: "坚定信念，贞守立场",
    intro: "台山人，1938 年受党中央派遣赴新疆工作，先后担任新疆学院教务长、阿克苏地区教育局局长、库车县县长等职。"
         + "1943 年被军阀盛世才秘密杀害于迪化，年仅 27 岁；狱中写下《囚徒歌》，"
         + "成为一代代青年的精神教材。"
  }
];

/* ---------- 配置：想改样式参数看这里 ---------- */
const HERO_CFG = {
  montageSelector: "#heroMontage", // 背景照片带容器
  modalSelector: "#heroModal",     // 点击后弹出介绍的浮层
  stageSelector: "#ringStage",     // 3D 环廊舞台
  ringSelector: "#heroRing",       // 3D 环廊的旋转环
  countSelector: "#ringCount",     // “3 / 11”计数
  prevSelector: "#ringPrev",       // 上一位
  nextSelector: "#ringNext",       // 下一位
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

/* ---------- 2. 3D 环廊：人物围成一圈，自动旋转 + 拖动 / 按钮 / 方向键 ----------
   结构：.ring-stage（透视） > .ring（preserve-3d，整体 rotateY） > 若干 .ring-card。
   每张卡片先 rotateY(等分角) 再 translateZ(半径)，就像围着圆桌摆座位。
   转到正对镜头的那张加 .is-front：放大提亮，计数同步成“3 / 11”。 */
function renderRing() {
  const stage = document.querySelector(HERO_CFG.stageSelector);
  const ring = document.querySelector(HERO_CFG.ringSelector);
  if (!stage || !ring) return;

  const n = HEROES.length;
  const step = 360 / n;
  /* 半径按卡片实际宽度算：卡片半宽 + 侧缝，除以 tan(半张角) 正好相邻不重叠。
     卡片宽度由 CSS 写死（桌面 180 / 手机 118），这里只量不算死。
     窗口跨断点缩放（如手机横屏）会改卡片宽度，所以半径在 resize 时重算。 */
  function measureRadius() {
    const probe = document.createElement("div");
    probe.className = "ring-card";
    probe.style.cssText = "position:absolute;visibility:hidden;";
    ring.append(probe);
    const cardW = probe.getBoundingClientRect().width || 180;
    probe.remove();
    ring.style.setProperty("--ring-r",
      Math.round((cardW / 2 + 26) / Math.tan(Math.PI / n)) + "px");
  }
  measureRadius();
  window.addEventListener("resize", measureRadius);

  HEROES.forEach((h, i) => {
    const card = document.createElement("div");
    card.className = "ring-card";
    card.style.transform = `rotateY(${i * step}deg) translateZ(var(--ring-r))`;
    const face = document.createElement("button");
    face.type = "button";
    face.className = "ring-face";
    face.dataset.hero = h.id;
    face.setAttribute("aria-label", `查看 ${h.name} 的介绍`);
    face.innerHTML =
      `<span class="idx">${String(i + 1).padStart(2, "0")}</span>` +
      `<h3>${h.name}</h3>` +
      `<p class="meta">${h.years} · ${h.place}</p>`;
    face.prepend(makePhoto(h, `${h.name}（${h.years}）`));
    /* 点任意一张：先把它转到正位，介绍由 document 委托统一弹出 */
    face.addEventListener("click", () => goto(i));
    card.append(face);
    ring.append(card);
  });

  /* —— 旋转状态 —— */
  let angle = 0;              // 环当前角度（度，越大越向右转）
  let front = 0;              // 正对镜头的人物下标（paint 里按角度推，自转时也跟着走）
  const cards = ring.querySelectorAll(".ring-card");
  const count = document.querySelector(HERO_CFG.countSelector);
  const modalBox = document.querySelector(HERO_CFG.modalSelector);

  function paint() {
    ring.style.transform = `rotateY(${angle}deg)`;
    front = ((Math.round(-angle / step) % n) + n) % n;
    cards.forEach((card, i) => {
      /* 这张牌相对镜头的角度：转到 ±半张角 以内就算正对 */
      let rel = (i * step + angle) % 360;
      if (rel > 180) rel -= 360;
      if (rel < -180) rel += 360;
      card.classList.toggle("is-front", Math.abs(rel) < step / 2);
    });
    if (count) count.textContent = `${front + 1} / ${n}`;
  }

  /* 转到第 i 张，走最近的方向；手动操作后停一会儿再恢复自转 */
  function goto(i) {
    idle();
    const target = -(((i % n) + n) % n) * step;
    /* 把当前角度折到 target 附近 ±180 以内，避免倒转一大圈 */
    let diff = (target - angle) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    angle += diff;
    paint();
  }

  document.querySelector(HERO_CFG.prevSelector)
    ?.addEventListener("click", () => goto(front - 1));
  document.querySelector(HERO_CFG.nextSelector)
    ?.addEventListener("click", () => goto(front + 1));
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goto(front - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goto(front + 1); }
  });

  /* —— 拖动旋转：按下跟手，松手吸附到最近一张 ——
     拖过 8px 就判定为拖动，松手那一次 click 会被拦掉，
     否则会"转了一下又弹出介绍"。
     注意：setPointerCapture 只能在确认拖动之后再调 —— 一按下就抓指针
     会把这次点击劫持到舞台上，卡片按钮永远收不到 click，
     介绍就弹不出来了。 */
  let dragging = false, moved = false, startX = 0, startAngle = 0, radius = 0;
  stage.addEventListener("pointerdown", (e) => {
    dragging = true; moved = false;
    startX = e.clientX; startAngle = angle;
    radius = parseFloat(getComputedStyle(ring).getPropertyValue("--ring-r")) || 300;
    stage.classList.add("dragging");   /* 按住时关掉过渡，环才跟手 */
    idle();
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 8) {
      moved = true;
      stage.setPointerCapture(e.pointerId);   /* 拖出舞台也要继续跟手 */
    }
    /* 整个环宽 2πr 对应 360°，横向拖 1px 转的角度 = 360 / (2πr) */
    angle = startAngle + dx * 360 / (2 * Math.PI * radius);
    paint();
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("dragging");
    /* 吸附：离镜头最近的一张成为正位 */
    goto(Math.round(-angle / step));
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("click", (e) => {
    if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);

  /* —— 自动旋转：没人碰时环自己慢慢转 ——
     鼠标悬停、按住拖动、介绍弹层打开时暂停，手动操作停 4 秒后继续；
     系统开了"减弱动态效果"就不自转。 */
  const AUTO_SPEED = 5;              // 度/秒，一圈约 72 秒
  const AUTO_IDLE_MS = 4000;         // 手动操作后停多久恢复自转
  const autoOK = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let hovering = false, resumeAt = 0, lastT = 0;
  function idle(ms = AUTO_IDLE_MS) {
    resumeAt = performance.now() + ms;
    stage.classList.remove("auto");   /* 恢复 .6s 过渡，按钮/点击的旋转才有动画 */
  }
  stage.addEventListener("pointerenter", () => { hovering = true; stage.classList.remove("auto"); });
  stage.addEventListener("pointerleave", () => { hovering = false; idle(1500); });
  function tick(t) {
    requestAnimationFrame(tick);
    if (!autoOK || hovering) { lastT = 0; return; }
    if (dragging || (modalBox && !modalBox.hidden) || t < resumeAt) { lastT = 0; return; }
    if (!lastT) lastT = t;
    stage.classList.add("auto");      /* 自转时不要 .6s 过渡，否则环永远在追目标 */
    angle += AUTO_SPEED * (t - lastT) / 1000;
    lastT = t;
    paint();
  }
  requestAnimationFrame(tick);

  paint();
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

/* 事件委托：背景照片和环廊卡片共用一套点击逻辑 */
document.addEventListener("click", (e) => {
  const cell = e.target.closest("[data-hero]");
  if (cell) { openModal(cell.dataset.hero); return; }
  const modal = document.querySelector(HERO_CFG.modalSelector);
  /* 点遮罩空白处、点关闭按钮都收起 */
  if (modal && !modal.hidden &&
      (e.target === modal || e.target.closest(".modal-close"))) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

renderMontage();
renderRing();
