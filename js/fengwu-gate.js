/* ============================================================
   fengwu-gate.js —— 「侨都风物」开场闸门
   ★★ 2026-10-18 起开场已撤：fengwu.html 不再引用本文件，打开那一页直接显示正片。
      本文件与 css/gate.css 整套留着没删，恢复方法写在下面最后一条。 ★★
   闸门原来的样子：每次打开这一页（含刷新）都先问一句「你准备好认识侨都之乡了吗？」，两条路：
     · 我准备好了 → 没有门，改成舞台聚光灯：顶上五个灯口往下扫五束光，从不同角度
                    收在「进入侨都风物 / 先不进去」那两个按钮上，按钮背后浮出一团光斑，
                    随后浮出「欢迎您了解侨都之乡」。
     · 让我等等   → 六张 AIGC 侨乡插画横着排成一圈（中间那张正对、两边歪着往后收），
                    每 5 秒自己转一张、转完接着循环，中间那张配一句鼓励语，随时能回去看灯。
   ★ 要改的东西全在本文件顶部四个块里：
       GATE_CFG 节奏与开关 / GATE_COPY 文案 / GATE_LAMPS 五个灯口位置 / GATE_SCENES 六张画与鼓励语
     图片路径也只写在这里（css/gate.css 里没有任何 url()）；打灯那一屏不铺图，
     束的角度与长短由 layoutSpots() 按按钮位置现算，斜多少度、粗细、快慢在 css/gate.css 第 3 节。
   ★ 想恢复开场：fengwu.html 里补三处 —— head 加 <link ... css/gate.css>、
     body 开头加回 id="fwGate" 那一坨骨架、末尾加回 <script ... js/fengwu-gate.js>。
     三处的原文在 git 提交 d5d39fc 里：git show d5d39fc:fengwu.html
   本页没有后端：闸门的状态只在当前这一次页面里，不做任何记录，所以刷新一定会再出现。
   ============================================================ */

/* ---------- 1. 节奏与开关（毫秒） ---------- */
const GATE_CFG = {
  openDelay: 240,             /* 点「我准备好了」到灯开始扫（CSS 里的延迟从这一刻起算） */
  welcomeDelay: 1300,         /* 灯开始扫到欢迎语与按钮浮出：五束最晚一束 .3s 起、1.5s 收住 */
  autoNext: 5000,             /* 「让我等等」几秒转一张，一直转下去（六张转完接着第二轮） */
  skipOnHash: true            /* 链接里带 #（比如从别处跳到某一节）时直接放行 */
};

/* ---------- 2. 闸门上的固定文案 ---------- */
const GATE_COPY = {
  waitLead: "不急 · 先看几张画里的侨乡",
  waitTag: "AI 生成插画 · 不是实景照片",
  waitFoot: "画一圈每隔几秒自己转一张，点下面的圆点可以直接跳到那一张。"
};

/* ---------- 3. 五个灯口在视口宽度的哪个百分比上 ----------
   束的斜度和长短不用写死：layoutSpots() 会量出按钮此刻在视口哪儿，反算每束该斜多少度、打多长，
   所以窗口大小一变，五束还是收在那两个按钮上。这里只决定灯口横向站在哪儿。
   ★ 改了这里要同步改 fengwu.html 里五个 .sp-beam / .sp-lamp 的 --x，两边一一对应。 */
const GATE_LAMPS = [6, 26, 50, 74, 94];

/* ---------- 4. 「让我等等」那六张：img 路径 / alt 读屏 / word 鼓励语 / sub 补一句 ----------
   word 是给人打气的话，sub 只描述画里画了什么，都不当实景介绍用。
   ★ 打灯那一屏现在不铺图（纯 CSS 的光），所以六张画是这个文件里唯一的图片路径。 */
const GATE_SCENES = [
  { img: "images/gate/s1-diaolou.jpg", alt: "画里的碉楼与稻田",
    word: "不急，灯一直给你亮着。", sub: "田中间那几座楼，是侨乡最认得出的样子。" },
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
  const panes = { ask: $("gtAsk"), spot: $("gtSpot"), wait: $("gtWait") };
  const stage = $("spStage");
  const gwImgs = $("gwImgs");
  const gwDots = $("gwDots");
  const gwWord = $("gwWord");
  const gwSub = $("gwSub");
  const live = $("gtLive");

  const RM = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const ms = function (v) { return RM ? 0 : v; };

  const st = { pane: "ask", idx: 0, timer: 0, built: false, imgs: [], dots: [] };

  /* ---- 闸门上的小字（画的路径在 GATE_SCENES 里，由 buildWait() 挂上去） ---- */
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

  /* ---- 五束光要对准按钮：按钮此刻在视口哪儿跟窗口大小有关，所以角度和束长现量现算。
         灯口挂在视口顶上（CSS 里 top: -5vh），从灯口到按钮中心连线就是这束该走的方向；
         CSS 的 rotate 顺时针为正、而"往右倒"要负，所以角度取负。束长取到按钮再放 24%，
         光才会盖过按钮那一团而不是停在其上边缘。 ---- */
  function layoutSpots() {
    const box = panes.spot.querySelector(".gt-btns");
    const beams = stage.querySelectorAll(".sp-beam");
    if (!box || !beams.length) return;
    const de = document.documentElement;
    const vw = window.innerWidth || de.clientWidth;
    const vh = window.innerHeight || de.clientHeight;
    const r = box.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    stage.style.setProperty("--fx", (cx / vw * 100).toFixed(1) + "%");
    stage.style.setProperty("--fy", (cy / vh * 100).toFixed(1) + "%");
    GATE_LAMPS.forEach(function (p, i) {
      const beam = beams[i];
      if (!beam) return;
      const dx = cx - p / 100 * vw, dy = cy + 0.05 * vh;
      beam.style.setProperty("--r", (-Math.atan2(dx, dy) * 180 / Math.PI).toFixed(1) + "deg");
      beam.style.setProperty("--len", (Math.sqrt(dx * dx + dy * dy) * 1.24).toFixed(0) + "px");
    });
  }

  /* ---- 第一支：五束聚光灯从不同角度扫下来，收在按钮那一团上 ---- */
  function runSpot() {
    show("spot");
    panes.spot.classList.remove("lit");
    stage.classList.remove("open");
    layoutSpots();
    void stage.offsetWidth;                /* 强制回流：第二次进来时动画要能从起始态重放 */
    live.textContent = "聚光灯正在打下来。";
    setTimeout(function () {
      stage.classList.add("open");         /* 每束几点起、扫多快，全在 CSS 的延迟里 */
    }, ms(GATE_CFG.openDelay));
    setTimeout(function () {
      panes.spot.classList.add("lit");     /* 欢迎语 + 两个按钮 + 它们背后那团光一起浮上来 */
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

  /* 横着的一圈：先算这张"隔几张"（d），再换成带符号的位移（右边为正、左边为负），
     最后按位移取位 —— 0 是中间那张（.c），±1 是紧挨着露边的两张（.r1/.l1），
     ±2 是更外圈那两张（.r2/.l2），再往外就是转到背面去的（.off，透明地停在中间那张背后）。
     每次 idx+1，全体往左挪一位，看上去就是那一圈画在慢慢转。
     站位长什么样（歪多少度、隔多远、淡多少）全在 css/gate.css 第 4 节，这里只管排位。 */
  function ringClass(d, n) {
    const back = Math.ceil(n / 2) - 1;         /* 一边最多露几张：六张 → 2 */
    const o = d > back ? d - n : d;            /* 变成带符号的位移 */
    if (o === 0) return "c";
    const k = Math.abs(o);
    return k > back ? "off" : (o > 0 ? "r" : "l") + k;
  }

  /* ★ 六张正好排满 .c/.r1/.r2/.off/.l2/.l1。要是 GATE_SCENES 加到七张以上，
       css/gate.css 第 4 节得补上 .r3/.l3 的站位，多出来的那张才会有位置；
       没补的话它会按 .gw-img 的默认态收在背面，看不见也不会把这一屏顶高。 */

  function scene(i) {
    const n = GATE_SCENES.length;
    st.idx = (i + n) % n;
    st.imgs.forEach(function (el, k) {
      const d = (k - st.idx + n) % n;
      el.className = "gw-img " + ringClass(d, n);
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
      if (a === "ready") runSpot();
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

  /* 窗口一变大变小（转手机、拖窗口、手机地址栏收起）就重新量一次，五束才不会打偏 */
  window.addEventListener("resize", function () {
    if (st.pane === "spot") layoutSpots();
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
