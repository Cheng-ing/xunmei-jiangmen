/* ============================================================
   xinhuo.js —— 模范人物页底部的"薪火相传"
   写一句话 → 点亮一盏灯 → 存在浏览器本地（localStorage），零后端。
   不读取也不发送任何服务器数据；换浏览器、清缓存后灯会回到熄灭状态。
   想改存储键名，只改下面的 XINHUO_KEY。
   ============================================================ */

const XINHUO_KEY = "xunmei-xinhuo";

const xinhuoForm = document.getElementById("xinhuoForm");
const xinhuoText = document.getElementById("xinhuoText");
const xinhuoLamp = document.getElementById("xinhuoLamp");
const xinhuoStatus = document.getElementById("xinhuoStatus");
const xinhuoReset = document.getElementById("xinhuoReset");
const xinhuoSubmit = xinhuoForm ? xinhuoForm.querySelector('button[type="submit"]') : null;

/* 读出本机存的那句话；读不到或格式不对都当没点过灯 */
function readXinhuo() {
  try {
    const raw = localStorage.getItem(XINHUO_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.text !== "string" || typeof data.at !== "number") return null;
    return data;
  } catch (err) {
    return null;
  }
}

/* 写入成功返回 true；浏览器禁用本地存储时返回 false（灯照样能亮，只是刷新后不保留） */
function saveXinhuo(text) {
  try {
    localStorage.setItem(XINHUO_KEY, JSON.stringify({ text: text, at: Date.now() }));
    return true;
  } catch (err) {
    return false;
  }
}

function clearXinhuo() {
  try { localStorage.removeItem(XINHUO_KEY); } catch (err) { /* 存不了也就没得清 */ }
}

function formatDay(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function showLit(data) {
  xinhuoLamp.classList.add("lit");
  xinhuoSubmit.textContent = "重新点亮";
  xinhuoReset.hidden = false;
  const day = formatDay(data.at);
  xinhuoStatus.textContent = `灯已点亮${day ? " · " + day : ""} · 这句话只留在这台设备的浏览器里。`;
  xinhuoStatus.classList.add("ok");
}

function showUnlit() {
  xinhuoLamp.classList.remove("lit");
  xinhuoSubmit.textContent = "点亮这盏灯";
  xinhuoReset.hidden = true;
  xinhuoStatus.textContent = "";
  xinhuoStatus.classList.remove("ok");
}

if (xinhuoForm) {
  /* 打开页面：上次点过灯就把灯和那句话接回来 */
  const saved = readXinhuo();
  if (saved) {
    xinhuoText.value = saved.text;
    showLit(saved);
  }

  xinhuoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = xinhuoText.value.trim().slice(0, 40);
    xinhuoText.value = text;
    const ok = saveXinhuo(text);
    showLit({ text: text, at: Date.now() });
    if (!ok) {
      xinhuoStatus.textContent = "灯已点亮 · 浏览器禁止本地存储，这次点亮只在当前页面有效。";
    }
  });

  xinhuoReset.addEventListener("click", () => {
    clearXinhuo();
    xinhuoText.value = "";
    showUnlit();
    xinhuoText.focus();
  });
}
