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
