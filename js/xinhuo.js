/* ============================================================
   xinhuo.js —— 模范人物页底部的"薪火相传"
   写一句话 → 点亮一盏灯 → 逐条存进浏览器本地（localStorage），零后端。
   每点亮一次，就在页面里的弹窗中把这盏灯下的话按时间倒序列出来；
   列表高度固定，条数再多也只在框里滚动，不会把整页撑长。
   不读取也不发送任何服务器数据；换浏览器、清缓存后灯会回到熄灭状态。
   想改存储键名，只改下面的 XINHUO_KEY；想改一句话的字数上限，改 XINHUO_MAX。
   ============================================================ */

const XINHUO_KEY = "xunmei-xinhuo";
const XINHUO_MAX = 40;

const xinhuoForm = document.getElementById("xinhuoForm");
const xinhuoText = document.getElementById("xinhuoText");
const xinhuoLamp = document.getElementById("xinhuoLamp");
const xinhuoStatus = document.getElementById("xinhuoStatus");
const xinhuoView = document.getElementById("xinhuoView");
const xinhuoModal = document.getElementById("xinhuoModal");
const xinhuoModalClose = document.getElementById("xinhuoModalClose");
const xinhuoModalSub = document.getElementById("xinhuoModalSub");
const xinhuoList = document.getElementById("xinhuoList");
const xinhuoSubmit = xinhuoForm ? xinhuoForm.querySelector('button[type="submit"]') : null;

let lastFocus = null;

/* 读出全部留言，最新的排在最前。旧版本只存过一句话（单个对象），这里一并认。 */
function readEntries() {
  try {
    const raw = localStorage.getItem(XINHUO_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    const list = Array.isArray(data) ? data : [data];
    return list.filter(item => item && typeof item.text === "string" && typeof item.at === "number");
  } catch (err) {
    return [];
  }
}

/* 写入成功返回 true；浏览器禁用本地存储时返回 false（灯照样能亮，只是刷新后不保留） */
function saveEntries(entries) {
  try {
    localStorage.setItem(XINHUO_KEY, JSON.stringify(entries));
    return true;
  } catch (err) {
    return false;
  }
}

function formatDay(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

/* 把灯、按钮和"看看留言"入口同步到当前的条数 */
function syncState(entries) {
  const count = entries.length;
  xinhuoLamp.classList.toggle("lit", count > 0);
  xinhuoSubmit.textContent = count > 0 ? "再留一句" : "点亮这盏灯";
  xinhuoView.hidden = count === 0;
  xinhuoView.textContent = `看看这盏灯下的 ${count} 句话`;
  xinhuoStatus.classList.toggle("ok", count > 0);
}

function renderList(entries, newAt) {
  xinhuoList.innerHTML = "";
  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "xinhuo-empty";
    empty.textContent = "这盏灯下还没有留言。";
    xinhuoList.appendChild(empty);
    return;
  }
  entries.forEach(item => {
    const li = document.createElement("li");
    if (item.at === newAt) li.className = "is-new";   // 刚写下的这条从下方浮出来
    const text = document.createElement("p");
    text.textContent = item.text;
    const day = document.createElement("span");
    day.textContent = formatDay(item.at);
    li.append(text, day);
    xinhuoList.appendChild(li);
  });
}

function openModal(entries, newAt) {
  renderList(entries, newAt);
  xinhuoModalSub.textContent = `这台设备上一共留下 ${entries.length} 句话。`;
  lastFocus = document.activeElement;
  xinhuoModal.hidden = false;
  document.body.classList.add("modal-open");
  xinhuoList.scrollTop = 0;
  xinhuoModalClose.focus();
}

function closeModal() {
  if (xinhuoModal.hidden) return;
  xinhuoModal.hidden = true;
  document.body.classList.remove("modal-open");
  const target = lastFocus && lastFocus !== document.body ? lastFocus : xinhuoView;
  if (target && typeof target.focus === "function") target.focus();
}

if (xinhuoForm) {
  /* 打开页面：把这盏灯下已经留下的话接回来 */
  const saved = readEntries();
  syncState(saved);
  if (saved.length) {
    xinhuoStatus.textContent = `灯已点亮 · 这台设备上一共留下 ${saved.length} 句话。`;
  }

  xinhuoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = xinhuoText.value.trim().slice(0, XINHUO_MAX);
    if (!text) {
      xinhuoStatus.textContent = "先写一句话，再点亮这盏灯。";
      xinhuoStatus.classList.remove("ok");
      xinhuoText.focus();
      return;
    }
    const entries = readEntries();
    const item = { text: text, at: Date.now() };
    entries.unshift(item);
    const ok = saveEntries(entries);
    xinhuoText.value = "";
    syncState(entries);
    xinhuoStatus.textContent = ok
      ? `灯已点亮 · 第 ${entries.length} 句话已留下，只存在这台设备上。`
      : "灯已点亮 · 浏览器禁止本地存储，这次点亮只在当前页面有效。";
    openModal(entries, item.at);
  });

  xinhuoView.addEventListener("click", () => {
    openModal(readEntries(), null);
  });

  xinhuoModal.querySelectorAll("[data-xinhuo-close]").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}
