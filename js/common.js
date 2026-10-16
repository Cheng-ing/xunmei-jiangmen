/* ============================================================
   common.js —— 全站通用脚本
   1) renderEnvelopes()：把文案数组渲染成"可撕开的信封"
   2) 滚动入场动画（配合 .reveal 类）
   3) 工具条：全部拆开 / 还原
   文案请在各页面底部内联的 <script>（page-data.js）里修改。
   ============================================================ */

/**
 * 渲染信封列表
 * @param {string} selector  容器选择器，如 '#envGrid'
 * @param {Array}  letters   每项 { seal:火漆字, title:信标题, body:正文, sign:落款 }
 */

/* 窄屏（手机上那套布局）判断：信封展开后的行为要跟着屏幕变。
   720 这个数和 css/envelope.css 第 8 节的断点是一致的，改要一起改。 */
const isNarrow = () => window.matchMedia("(max-width: 720px)").matches;

function renderEnvelopes(selector, letters) {
  const box = document.querySelector(selector);
  if (!box || !Array.isArray(letters)) return;

  box.innerHTML = letters.map((m) => `
    <!-- 一封可撕开的信：点击任意位置撕开 -->
    <div class="envelope" role="button" tabindex="0" aria-label="撕开这封信">
      <div class="envelope-back"></div>
      <div class="letter">
        <h4>${m.title}</h4>
        <p>${m.body}</p>
        ${m.sign ? `<div class="sign">${m.sign}</div>` : ""}
      </div>
      <div class="envelope-front"></div>
      <div class="wax-seal">${m.seal || "启"}</div>
      <div class="torn-strip"></div>
      <div class="env-tip">点击撕开</div>
    </div>`).join("");

  // 绑定点击 / 键盘（回车、空格）拆开
  box.querySelectorAll(".envelope").forEach((env) => {
    const toggle = () => {
      env.classList.toggle("opened");
      const tip = env.querySelector(".env-tip");
      if (tip) tip.textContent = env.classList.contains("opened") ? "点击还原" : "点击撕开";
      /* 手机上信纸是在信封下方展开的，展开位置可能已经偏出屏幕，
         所以展开后把这一封信滚到屏幕上方；桌面端升起效果在原位，不需要。 */
      if (env.classList.contains("opened") && isNarrow()) {
        setTimeout(() => env.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    };
    env.addEventListener("click", toggle);
    env.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

/** 工具条按钮：data-action = open-all | close-all */
document.querySelectorAll(".env-tools .btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const open = btn.dataset.action === "open-all";
    document.querySelectorAll(".envelope").forEach((e) => e.classList.toggle("opened", open));
  });
});

/* ---------- 滚动入场：给 .reveal 元素进入视口时加 .in ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- 窄屏导航：一排链接横向滑动，把当前页那颗先滑到看得见的位置 ----------
   用 scrollLeft 而不是 scrollIntoView，后者会顺手把整张页面也往下滚。
   不判断屏幕宽度，只看这排链接是不是真的放不下（scrollWidth > clientWidth）——
   放得下时它本来就不需要滚。导航的断点在 css/base.css 第 8 节（900px）。 */
const activeLink = document.querySelector(".site-nav a.nav-link.active");
if (activeLink) {
  const row = activeLink.closest("ul");
  if (row && row.scrollWidth > row.clientWidth) {
    row.scrollLeft = Math.max(0, activeLink.offsetLeft - (row.clientWidth - activeLink.offsetWidth) / 2);
  }
}
