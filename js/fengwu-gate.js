/* ============================================================
   fengwu-gate.js —— 「侨都风物」开场闸门
   每次打开这一页（含刷新）都先问一句「你准备好认识侨都之乡了吗？」，两条路：
     · 我准备好了 → 两扇木门缓缓滑开，露出画里的厅堂；厅堂里那束光从小小一条
                    慢慢涨满、浮出光束，然后浮出「欢迎您了解侨都之乡 · 进入侨都风物」。
     · 让我等等   → 六张 AIGC 侨乡插画叠成一摞，每 5 秒换一张、换完接着循环，
                    每张配一句鼓励语，随时能回去开门。
   ★ 要改的东西全在本文件顶部四个块里：
       GATE_CFG 节奏与开关 / GATE_COPY 文案 / GATE_IMGS 大门那三张图 / GATE_SCENES 六张画与鼓励语
     图片路径也只写在这里（css/gate.css 里没有任何 url()）。
   ★ 想整块关掉闸门：删掉 fengwu.html 里 id="fwGate" 那一坨 + 两行引用
     （css/gate.css 与 js/fengwu-gate.js），页面就回到直接显示内容。
   本页没有后端：闸门的状态只在当前这一次页面里，不做任何记录，所以刷新一定会再出现。
   ============================================================ */

/* ---------- 1. 节奏与开关（毫秒） ---------- */
const GATE_CFG = {
  openDelay: 240,             /* 点「我准备好了」到门开始动（CSS 里的延迟从这一刻起算） */
  welcomeDelay: 3600,         /* 门开始动到欢迎语浮出：门 2.8s/.25s、光 2.4s/.8s、光束 1.5s/2.4s */
  autoNext: 5000,             /* 「让我等等」几秒换一张，一直换下去 */
  stackBack: 2,               /* 一摞画在最前面那张后面露几张（改 1 就只露一张边） */
  skipOnHash: true            /* 链接里带 #（比如从别处跳到某一节）时直接放行 */
};

/* ---------- 2. 闸门上的固定文案 ---------- */
const GATE_COPY = {
  doorNote: "门与厅堂都是画出来的示意场景，不是江门市博物馆实景。",
  waitLead: "不急 · 先看几张画里的侨乡",
  waitTag: "AI 生成插画 · 不是实景照片",
  waitFoot: "每隔几秒自动换一张，点下面的圆点可以直接跳。"
};

/* ---------- 3. 大门用的三张图（同一张源图裁出来的才能对齐） ----------
   full/door = 那扇门（整幅 + 门洞裁切，两扇木门用裁切那份拼）；hall = 门里的厅堂。
   换 full 或 door 都要回 css/gate.css 第 3 节重新量门洞。 */
const GATE_IMGS = {
  full: "images/gate/gate.jpg",
  door: "images/gate/gate-door.jpg",
  hall: "images/gate/gate-hall.jpg"
};

/* ---------- 4. 「让我等等」那六张：img 路径 / alt 读屏 / word 鼓励语 / sub 补一句 ----------
   word 是给人打气的话，sub 只描述画里画了什么，都不当实景介绍用。 */
const GATE_SCENES = [
  { img: "images/gate/s1-diaolou.jpg", alt: "画里的碉楼与稻田",
    word: "不急，门一直开着。", sub: "田中间那几座楼，是侨乡最认得出的样子。" },
  { img: "images/gate/s2-qilou.jpg", alt: "画里的骑楼老街黄昏",
    word: "看累了就歇一会儿。", sub: "骑楼底下的灯刚亮，街上还没有人。" },
  { img: "images/gate/s3-coast.jpg", alt: "画里的海岸、渔船与远岬",
    word: "海很大，慢慢走也走得完。", sub: "台山一带的海岸，画的是示意图。" },
  { img: "images/gate/s4-water.jpg", alt: "画里的水乡、石桥与鱼塘",
    word: "绕点路也不要紧。", sub: "水网、鱼塘、一座老石桥。" },
  { img: "images/gate/s5-temple.jpg", alt: "画里的山林古寺与石阶",
    word: "山里的风会替你安静一下。", sub: "石阶、树影、一缕香。" },
  { img: "images/gate/s6-banyan.jpg", alt: "画里的水上大榕树与白鹭",
    word: "剩下的，等你自己去看。", sub: "大榕树站在水里，鸟从顶上飞过。" }
];

/* ============================================================
   以下是流程，改文案不用动到这里
   ============================================================ */
(function () {
  "use strict";

  const gate = document.getElementById("fwGate");
  if (!gate) return;                       /* 页面没放闸门那一坨就整个不跑 */

  const $ = function (id) { return document.getElementById(id); };
  const panes = { ask: $("gtAsk"), door: $("gtDoor"), wait: $("gtWait") };
  const stage = $("gtStage");
  const gwImgs = $("gwImgs");
  const gwDots = $("gwDots");
  const gwWord = $("gwWord");
  const gwSub = $("gwSub");
  const live = $("gtLive");

  const RM = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const ms = function (v) { return RM ? 0 : v; };

  const st = { pane: "ask", idx: 0, timer: 0, built: false, imgs: [], dots: [] };

  /* ---- 图片路径由这里挂上去：CSS 里不留 url()，换图只改上面 ---- */
  function bg(id, path) {
    const el = $(id);
    if (el) el.style.backgroundImage = 'url("' + path + '")';
    new Image().src = path;
  }
  bg("gtPhoto", GATE_IMGS.full);
  bg("gtHall", GATE_IMGS.hall);
  ["gtLeafL", "gtLeafR"].forEach(function (id) {
    const el = $(id);
    el.style.backgroundImage = 'url("' + GATE_IMGS.door + '")';
  });
  new Image().src = GATE_IMGS.door;

  $("gtDoorNote").textContent = GATE_COPY.doorNote;
  $("gwLead").textContent = GATE_COPY.waitLead;
  $("gwTag").textContent = GATE_COPY.waitTag;
  $("gwFoot").textContent = GATE_COPY.waitFoot;

  function show(name) {
    st.pane = name;
    Object.keys(panes).forEach(function (k) { panes[k].classList.toggle("on", k === name); });
  }

  /* ---- 进入正片：撤掉遮罩与滚动锁（不记任何东西，刷新一定还会问一次） ---- */
  function enter() {
    stopTimer();
    gate.classList.add("gone");
    document.documentElement.classList.remove("gate-lock");
    live.textContent = "已进入侨都风物。";
    setTimeout(function () {
      gate.hidden = true;
      const top = $("fwTop");
      if (top) { try { top.focus({ preventScroll: true }); } catch (e) { top.focus(); } }
    }, ms(760) + 30);
  }

  /* ---- 第一支：一道门滑开，厅堂里那束光慢慢涨满 ---- */
  function runDoor() {
    show("door");
    panes.door.classList.remove("lit");
    stage.classList.remove("open");
    void stage.offsetWidth;                /* 强制回流：第二次进来时动画要能从关闭态重放 */
    live.textContent = "大门正在打开。";
    setTimeout(function () {
      stage.classList.add("open");         /* 滑多远、光几秒起、涨多大，全在 CSS 的延迟里 */
    }, ms(GATE_CFG.openDelay));
    setTimeout(function () {
      panes.door.classList.add("lit");
      live.textContent = "欢迎您了解侨都之乡，按回车可以进入。";
      const b = $("gtEnter");
      if (b) b.focus();
    }, ms(GATE_CFG.welcomeDelay));
  }

  /* ---- 第二支：先看画 ---- */
  function buildWait() {
    if (st.built) return;
    st.built = true;
    GATE_SCENES.forEach(function (s, i) {
      const img = document.createElement("img");
      img.className = "gw-img";
      img.alt = s.alt;
      img.decoding = "async";
      img.src = s.img;                     /* 只有点了「让我等等」才会走到这里，六张画不抢首屏 */
      gwImgs.appendChild(img);
      st.imgs.push(img);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gw-dot";
      dot.dataset.scene = i;
      dot.setAttribute("aria-label", "看第 " + (i + 1) + " 张：" + s.alt);
      gwDots.appendChild(dot);
      st.dots.push(dot);
    });
  }

  /* 换画时把 .pop 重新挂一次，鼓励语才会再抬一下（同一帧内先摘后加 + 强制回流） */
  function pop(el) {
    if (!el || RM) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  /* 一摞画：按"离当前这张隔几张"给深度 —— 0 是最前面那张（.on），
     1..stackBack 是后面露边的两张（.d1/.d2），再往后的收起来。
     换一张时深度全体往前挪一位，视觉上就是后面那张顶上来。 */
  function scene(i) {
    st.idx = (i + GATE_SCENES.length) % GATE_SCENES.length;
    st.imgs.forEach(function (el, k) {
      const d = (k - st.idx + GATE_SCENES.length) % GATE_SCENES.length;
      el.className = "gw-img " + (d === 0 ? "on" : d <= GATE_CFG.stackBack ? "d" + d : "far");
      el.setAttribute("aria-hidden", d === 0 ? "false" : "true");
    });
    st.dots.forEach(function (el, k) { el.classList.toggle("on", k === st.idx); });
    gwWord.textContent = GATE_SCENES[st.idx].word;
    gwSub.textContent = GATE_SCENES[st.idx].sub;
    pop(gwWord); pop(gwSub);
    live.textContent = "第 " + (st.idx + 1) + " 张，共 " + GATE_SCENES.length + " 张：" + GATE_SCENES[st.idx].word;
  }

  function stopTimer() { if (st.timer) { clearInterval(st.timer); st.timer = 0; } }
  function startTimer() {
    stopTimer();
    st.timer = setInterval(function () { scene(st.idx + 1); }, GATE_CFG.autoNext);
  }

  function openWait() {
    buildWait();
    show("wait");
    scene(st.idx);
    startTimer();
  }

  /* ---- 事件：闸门内部所有点击都走这一个委托 ---- */
  gate.addEventListener("click", function (e) {
    const act = e.target.closest("[data-gate]");
    if (act) {
      const a = act.dataset.gate;
      if (a === "ready") runDoor();
      else if (a === "wait") openWait();
      else if (a === "enter" || a === "skip") enter();
      else if (a === "ask") { stopTimer(); show("ask"); }
      return;
    }
    const dot = e.target.closest("[data-scene]");
    if (dot) { scene(+dot.dataset.scene); startTimer(); }
  });

  /* 切到别的标签页时先停一下，回来接着轮播（手放在画上不再打断，六张画一直轮） */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopTimer();
    else if (st.pane === "wait") startTimer();
  });

  /* Esc = 跳过闸门，别把人关在门口 */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !gate.classList.contains("gone")) enter();
  });

  /* ---- 开场：只有链接里带 # 的深链才放行，其余每次打开（含刷新）都先问一句 ---- */
  const skip = !!(GATE_CFG.skipOnHash && location.hash);

  if (skip) {
    gate.hidden = true;
  } else {
    document.documentElement.classList.add("gate-lock");
    show("ask");
  }
})();
