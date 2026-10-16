/* ============================================================
   globe3d.js —— 首页"真实地球"：NASA 白天影像 + 江门真实行政边界
   依赖：js/jiangmen-boundary.js（提供 JM_CITY / JM_DISTRICTS 两个数组）
   贴图：images/earth.jpg（等距柱状投影 2048×1024）

   原理（想改代码前先读这段）：
   屏幕圆内的每个像素，都能反算出它对应的"纬度 φ"和"经度偏移 Δλ"。
   这两个值只跟像素位置有关，跟地球当前转到哪一经度无关，
   所以开局预计算一次，之后每一帧只需要：
       贴图列坐标 = (预存的 Δλ 换算列 + 当前中央经线换算列) 取模
   即"整幅贴图横向平移 + 环绕"，因此 40 万像素也能稳定 60 帧。

   转动节奏由"系统时钟"决定：任何时候打开网页，看到的画面都一样，
   地球匀速转一整圈 → 自动把江门转到正对镜头 → 停留几秒 → 再转。
   适合博物馆大屏长时间挂机展示，不需要人操作。
   ============================================================ */

const GLOBE = {
  /* 江门市人民政府驻地（蓬江区）真实坐标 —— 打点就打在这里 */
  lat: 22.5968,
  lon: 113.0786,

  viewLat: 16,      // 观察者纬度：调大→视角北移，调小→南移（改了要刷新才生效）
  spinSec: 30,      // 转一整圈用多少秒
  holdSec: 6,       // 转到江门正面后停留多少秒
  res: 400,         // 内部渲染分辨率：越大越清晰也越吃性能
  brightness: 1.28, // 整体提亮系数，大屏投影建议 1.2~1.5
  graticule: true,  // 是否画经纬网
  districts: true,  // 是否画七个区/市县的内部界线
  linkTo: "jiangmen.html"   // 点击地球后跳转的页面
};

/* ---------- 角度工具 ---------- */
const RAD = Math.PI / 180;
const wrap360 = (d) => ((d % 360) + 360) % 360;

/* ---------- 正射投影：经纬度 → 屏幕（-1..1 归一化，y 向下为正） ---------- */
function project(latDeg, lonDeg, lat0, lon0) {
  const φ = latDeg * RAD, λ = lonDeg * RAD;
  const φ0 = lat0 * RAD, λ0 = lon0 * RAD, dλ = λ - λ0;
  const cosc = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(dλ);
  return {
    x: Math.cos(φ) * Math.sin(dλ),
    y: -(Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(dλ)),
    front: cosc > 0            // cosc>0 表示该点朝向观察者
  };
}

/* ---------- 主流程 ---------- */
const canvas = document.getElementById("globeCanvas");
const stage  = document.querySelector(".globe-stage");
const pin    = document.querySelector(".jm-pin");
const ctx    = canvas.getContext("2d");

canvas.width = canvas.height = GLOBE.res;

const tex = new Image();
tex.src = "images/earth.jpg";

/* 预计算表：贴图取样的列偏移、行号，以及边缘明暗系数 */
let mapX, mapY, shade, inside, texData = null, texW = 0, texH = 0, outImg = null;

tex.onload = () => {
  /* 把贴图读进像素数组，后续逐帧取样最快 */
  const t = document.createElement("canvas");
  t.width = tex.width; t.height = tex.height;
  const tc = t.getContext("2d", { willReadFrequently: true });
  tc.drawImage(tex, 0, 0);
  texData = tc.getImageData(0, 0, t.width, t.height).data;
  texW = t.width; texH = t.height;
  buildLookup();
};

function buildLookup() {
  const N = GLOBE.res, φ0 = GLOBE.viewLat * RAD;
  mapX = new Int32Array(N * N);
  mapY = new Int32Array(N * N);
  shade = new Uint16Array(N * N);
  inside = new Uint8Array(N * N);
  for (let py = 0; py < N; py++) {
    for (let px = 0; px < N; px++) {
      const i = py * N + px;
      const dx = ((px + 0.5) / N) * 2 - 1;
      const dy = ((py + 0.5) / N) * 2 - 1;
      const ρ2 = dx * dx + dy * dy;
      if (ρ2 > 1) continue;            // 圆外不写 → 缓冲里保持透明
      const ρ = Math.sqrt(ρ2), c = Math.asin(ρ);
      const sinc = ρ, cosc = Math.sqrt(1 - ρ2), yUp = -dy;
      /* 反算纬度 φ 与经度偏移 Δλ（都与中央经线无关 → 只需算一次） */
      let sinφ = cosc * Math.sin(φ0) + yUp * sinc * Math.cos(φ0);
      sinφ = Math.max(-1, Math.min(1, sinφ));
      const φ = Math.asin(sinφ);
      const dλ = Math.atan2(dx * sinc, cosc * Math.cos(φ0) - yUp * sinc * Math.sin(φ0));
      mapX[i] = (((dλ + Math.PI) / (2 * Math.PI)) * texW) | 0;
      mapY[i] = (((Math.PI / 2 - φ) / Math.PI) * texH) | 0;
      if (mapY[i] >= texH) mapY[i] = texH - 1;
      /* 边缘压暗做立体感；>255 的部分由 Uint8ClampedArray 自动截顶，等于整体提亮 */
      shade[i] = Math.min(320, ((255 - ρ2 * 62) * GLOBE.brightness) | 0);
      inside[i] = 1;
    }
  }
  outImg = ctx.createImageData(N, N);   // 复用同一块画布缓冲，避免每帧重新分配
}

/* ---------- 时间驱动的中央经线 ----------
   每 (spinSec + holdSec) 秒为一个周期：
   前 spinSec 秒用 smoothstep 匀速转满 360°（起步略慢、收尾略稳），
   后 holdSec 秒停在"江门正对镜头"的位置。
   用 Date.now() 而不是页面加载时刻 → 同一时刻刷新页面画面不变，挂机展示很稳。 */
function centralLon(tSec) {
  const cyc = GLOBE.spinSec + GLOBE.holdSec;
  const k = Math.floor(tSec / cyc);
  const u = Math.min(1, (tSec % cyc) / GLOBE.spinSec);
  const e = u * u * (3 - 2 * u);
  return GLOBE.lon + 360 * (k + e);
}
/* 当前离"正对江门"有多近：1=完全对准，用于聚焦时的高亮强度 */
function focusStrength(lon0) {
  const d = Math.abs(wrap360(lon0 - GLOBE.lon + 180) - 180);
  return Math.max(0, 1 - d / 25);
}

/* ---------- 把一组经纬度环画到球面上（自动裁掉转到背面的部分） ---------- */
function traceRings(rings, lon0) {
  const R = GLOBE.res / 2;
  ctx.beginPath();
  for (const ring of rings) {
    let pen = false;
    for (const [lon, lat] of ring) {
      const p = project(lat, lon, GLOBE.viewLat, lon0);
      if (!p.front) { pen = false; continue; }
      const x = R + p.x * R, y = R + p.y * R;
      pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
    }
  }
}

/* ---------- 江门：真实行政边界 + 市政府驻地打点 ---------- */
function drawJiangmen(lon0, focus) {
  const R = GLOBE.res / 2;
  const p = project(GLOBE.lat, GLOBE.lon, GLOBE.viewLat, lon0);
  if (!p.front) return;                       // 转到背面就不画

  ctx.save();

  /* 市界填充：越对准镜头越亮，做出"聚光灯"效果 */
  traceRings(JM_CITY, lon0);
  ctx.fillStyle = `rgba(201,168,106,${0.10 + 0.22 * focus})`;
  ctx.fill("evenodd");

  /* 区/县市内部界线 */
  if (GLOBE.districts && focus > 0.05) {
    traceRings([].concat(...JM_DISTRICTS.map((d) => d.rings)), lon0);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = `rgba(255,240,210,${0.18 + 0.35 * focus})`;
    ctx.stroke();
  }

  /* 市界描边（金线 + 外发光） */
  traceRings(JM_CITY, lon0);
  ctx.lineWidth = 1.6 + 1.6 * focus;
  ctx.strokeStyle = `rgba(230,196,120,${0.55 + 0.45 * focus})`;
  ctx.shadowColor = "rgba(230,196,120,.85)";
  ctx.shadowBlur = 6 + 14 * focus;
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* 驻地标记点：画得比边界光晕小，金线轮廓才看得见（详图才负责看清细节） */
  const cx = R + p.x * R, cy = R + p.y * R;
  ctx.fillStyle = "#ffd98a"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, cy, 2.4 + 1.2 * focus, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* 页面下方的实时读数：中央经线 + 江门状态 */
const readout = document.getElementById("readout");
function showReadout(lon0, focus) {
  if (!readout) return;
  const c = wrap360(lon0 + 180) - 180;
  const p = project(GLOBE.lat, GLOBE.lon, GLOBE.viewLat, lon0);
  const st = !p.front ? "在地球背面" : focus > 0.9 ? "正对镜头 · 江门" : "自转中";
  readout.textContent =
    `中央经线 ${Math.abs(c).toFixed(1)}°${c >= 0 ? "E" : "W"} · ` +
    `江门 ${GLOBE.lat}°N ${GLOBE.lon}°E · ${st}`;
}

/* 文字标签跟着标记点走（用 DOM 元素，方便中文字体排版） */
let boxW = 0;
function measure() { boxW = canvas.clientWidth; }
addEventListener("resize", measure);

function moveLabel(lon0) {
  const p = project(GLOBE.lat, GLOBE.lon, GLOBE.viewLat, lon0);
  if (!boxW) measure();
  if (!boxW) return;
  /* 朝向我们时才显示；用 left/top 定位到圆心，居中交给 CSS 的 translate(-50%,-50%) */
  pin.classList.toggle("far", !p.front);
  pin.style.left = (boxW / 2 * (1 + p.x)) + "px";
  pin.style.top  = (boxW / 2 * (1 + p.y)) + "px";
}

/* ---------- 右侧"江门详图"：把真实边界放大到看得清 ----------
   地球上看江门只有 5 个像素（城市只有 1.4° 宽），所以另开一块画布，
   以江门市域中心为原点做局部正射投影，画出市界 + 七区县界 + 名称。
   投影仍然是球面正射（不是平面拉直），所以和地球上的位置严格对得上。 */
const mapCanvas = document.getElementById("jmMapCanvas");
const MAP = { res: 520, cx: 0, cy: 0, R: 0, lonSpan: 0, latSpan: 0 };

/* 蓬江、江海、新会三区中心点挤在一起，字会互相压住，这里给一点像素偏移。
   注意：下面所有字号都按"画布 520 / 实际显示约 330"的比例放大约 1.5 倍，
   如果改了 css 里 .jm-map canvas 的 width，字号和这些偏移都要同步调整。 */
const LABEL_NUDGE = { "蓬江区": [-44, -24], "江海区": [36, 24], "新会区": [-10, 42] };

if (mapCanvas) {
  mapCanvas.width = mapCanvas.height = MAP.res;
  /* 先量出市域范围，再反推合适的放大倍数（留 12% 边距） */
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (const ring of JM_CITY) for (const [lon, lat] of ring) {
    if (lon < minX) minX = lon; if (lon > maxX) maxX = lon;
    if (lat < minY) minY = lat; if (lat > maxY) maxY = lat;
  }
  MAP.lonSpan = maxX - minX; MAP.latSpan = maxY - minY;
  MAP.cx = (minX + maxX) / 2; MAP.cy = (minY + maxY) / 2;
  /* 小范围内 project() 近似 x≈Δλ·cosφ、y≈Δφ，据此求能装下整市的球半径 */
  const pad = MAP.res * 0.40;
  MAP.R = Math.min(
    pad / (MAP.lonSpan / 2 * RAD * Math.cos(MAP.cy * RAD)),
    pad / (MAP.latSpan / 2 * RAD)
  );
}

/* 经纬度 → 详图像素坐标 */
function mapXY(lat, lon) {
  const p = project(lat, lon, MAP.cy, MAP.cx);
  return [MAP.res / 2 + p.x * MAP.R, MAP.res / 2 + p.y * MAP.R];
}

function traceMapRings(rings) {
  const mctx = mapCanvas.getContext("2d");
  mctx.beginPath();
  for (const ring of rings) {
    ring.forEach(([lon, lat], i) => {
      const [x, y] = mapXY(lat, lon);
      i ? mctx.lineTo(x, y) : mctx.moveTo(x, y);
    });
    mctx.closePath();
  }
}

/* 详图每帧重绘：地球转到正面时整幅图变亮，转到背面时变暗 */
function drawDetailMap(focus) {
  if (!mapCanvas) return;
  const mctx = mapCanvas.getContext("2d"), S = MAP.res, k = 0.35 + 0.65 * focus;
  mctx.clearRect(0, 0, S, S);

  /* 海面底色 + 经纬格网（每 0.25°） */
  mctx.fillStyle = "#101d2c"; mctx.fillRect(0, 0, S, S);
  mctx.lineWidth = 1; mctx.strokeStyle = "rgba(120,160,200,.10)";
  mctx.beginPath();
  for (let lon = Math.ceil((MAP.cx - 1) * 4) / 4; lon < MAP.cx + 1; lon += 0.25) {
    const a = mapXY(MAP.cy - 1, lon), b = mapXY(MAP.cy + 1, lon);
    mctx.moveTo(a[0], a[1]); mctx.lineTo(b[0], b[1]);
  }
  for (let lat = Math.ceil((MAP.cy - 1) * 4) / 4; lat < MAP.cy + 1; lat += 0.25) {
    const a = mapXY(lat, MAP.cx - 1), b = mapXY(lat, MAP.cx + 1);
    mctx.moveTo(a[0], a[1]); mctx.lineTo(b[0], b[1]);
  }
  mctx.stroke();

  /* 市域填充 */
  traceMapRings(JM_CITY);
  mctx.fillStyle = `rgba(201,168,106,${0.14 * k + 0.05})`;
  mctx.fill("evenodd");

  /* 区县界 + 名称 */
  traceMapRings([].concat(...JM_DISTRICTS.map((d) => d.rings)));
  mctx.lineWidth = 1.4; mctx.strokeStyle = `rgba(255,238,205,${0.35 * k})`; mctx.stroke();
  mctx.textAlign = "center"; mctx.textBaseline = "middle";
  for (const d of JM_DISTRICTS) {
    const [x, y] = mapXY(d.center[1], d.center[0]);
    const n = LABEL_NUDGE[d.name] || [0, 0];   // 三区中心挨太近，手动让开
    mctx.font = "20px 'Songti SC', 'SimSun', serif";
    mctx.fillStyle = `rgba(240,232,215,${0.55 + 0.4 * k})`;
    mctx.fillText(d.name, x + n[0], y + n[1]);
    mctx.fillStyle = `rgba(201,168,106,${0.8 * k})`;
    mctx.beginPath(); mctx.arc(x, y, 3, 0, Math.PI * 2); mctx.fill();
  }

  /* 市界金线 */
  traceMapRings(JM_CITY);
  mctx.lineWidth = 3; mctx.strokeStyle = `rgba(230,196,120,${0.6 + 0.4 * focus})`;
  mctx.shadowColor = "rgba(230,196,120,.7)"; mctx.shadowBlur = 8 + 8 * focus;
  mctx.stroke(); mctx.shadowBlur = 0;

  /* 市政府驻地：呼吸光环 */
  const [sx, sy] = mapXY(GLOBE.lat, GLOBE.lon);
  const pulse = (Date.now() % 2000) / 2000;
  mctx.strokeStyle = `rgba(255,217,138,${(1 - pulse) * 0.8})`;
  mctx.lineWidth = 2;
  mctx.beginPath(); mctx.arc(sx, sy, 7 + pulse * 22, 0, Math.PI * 2); mctx.stroke();
  mctx.fillStyle = "#ffd98a"; mctx.strokeStyle = "#fff"; mctx.lineWidth = 2;
  mctx.beginPath(); mctx.arc(sx, sy, 6.5, 0, Math.PI * 2); mctx.fill(); mctx.stroke();
  mctx.textAlign = "right"; mctx.font = "bold 20px 'Songti SC', 'SimSun', serif";
  mctx.fillStyle = "rgba(255,225,170,.95)";
  mctx.fillText("市政府驻地", sx - 13, sy + 2);
  mctx.textAlign = "center";

  /* 指北针 + 比例尺（1° 纬度 ≈ 111.32 km） */
  const kmPx = MAP.R * RAD / 111.32;                 // 每公里像素数
  const bar = Math.round(20 * kmPx);                 // 取整 20 km
  mctx.strokeStyle = "rgba(233,226,211,.7)"; mctx.lineWidth = 3;
  mctx.beginPath(); mctx.moveTo(26, S - 34); mctx.lineTo(26 + bar, S - 34); mctx.stroke();
  mctx.textAlign = "left"; mctx.font = "17px ui-monospace, Consolas, monospace";
  mctx.fillStyle = "rgba(233,226,211,.7)";
  mctx.fillText("20 km", 26, S - 48);
  mctx.textAlign = "center"; mctx.font = "bold 20px serif";
  mctx.fillStyle = "rgba(233,226,211,.8)";
  mctx.fillText("N", S - 34, 30);
  mctx.strokeStyle = "rgba(233,226,211,.6)"; mctx.lineWidth = 2;
  mctx.beginPath(); mctx.moveTo(S - 34, 76); mctx.lineTo(S - 34, 44);
  mctx.moveTo(S - 40, 52); mctx.lineTo(S - 34, 42); mctx.lineTo(S - 28, 52); mctx.stroke();
}

/* ---------- 每帧 ---------- */
let paused = false;

/* 先画一版详图：地球贴图还没下载完时，右侧这张图就能出来 */
drawDetailMap(0);

function frame() {
  requestAnimationFrame(frame);
  if (!texData || !inside || paused) return;

  /* 系统时钟秒数，减去累计暂停掉的时间 */
  const t = Date.now() / 1000 - pausedOffset;
  const lon0 = centralLon(t);
  const focus = focusStrength(lon0);
  const shift = ((wrap360(lon0) / 360) * texW) | 0;

  const N = GLOBE.res, dst = outImg.data;
  for (let i = 0, n = N * N; i < n; i++) {
    if (!inside[i]) continue;
    let sx = mapX[i] + shift; if (sx >= texW) sx -= texW;
    const s = (mapY[i] * texW + sx) * 4, d = i * 4, sh = shade[i];
    dst[d]     = (texData[s]     * sh) >> 8;
    dst[d + 1] = (texData[s + 1] * sh) >> 8;
    dst[d + 2] = (texData[s + 2] * sh) >> 8;
    dst[d + 3] = 255;
  }
  ctx.putImageData(outImg, 0, 0);

  if (GLOBE.graticule) drawGraticule(lon0);
  drawJiangmen(lon0, focus);
  moveLabel(lon0);
  showReadout(lon0, focus);
  drawDetailMap(project(GLOBE.lat, GLOBE.lon, GLOBE.viewLat, lon0).front ? focus : 0);
}

/* ---------- 经纬网：每 30° 一条，只画朝向我们的那一半 ---------- */
function drawGraticule(lon0) {
  const R = GLOBE.res / 2;
  ctx.save(); ctx.lineWidth = 0.8; ctx.strokeStyle = "rgba(255,255,255,.22)";
  const line = (pts) => {
    let pen = false;
    ctx.beginPath();
    for (const [lat, lon] of pts) {
      const p = project(lat, lon, GLOBE.viewLat, lon0);
      if (!p.front) { pen = false; continue; }
      const x = R + p.x * R, y = R + p.y * R;
      pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
    }
    ctx.stroke();
  };
  for (let lon = -180; lon < 180; lon += 30) {
    const pts = []; for (let lat = -90; lat <= 90; lat += 3) pts.push([lat, lon]);
    line(pts);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = []; for (let lon = -180; lon <= 180; lon += 3) pts.push([lat, lon]);
    line(pts);
  }
  ctx.restore();
}

/* ---------- 交互：悬停暂停、点击跳转 ---------- */
let pausedAt = 0, pausedOffset = 0;
stage.addEventListener("mouseenter", () => { paused = true; pausedAt = Date.now() / 1000; });
/* 记下暂停那一刻累计被"扣掉"的秒数，恢复后地球从停下的地方接着转 */
stage.addEventListener("mouseleave", () => {
  paused = false; pausedOffset += Date.now() / 1000 - pausedAt; pausedAt = 0;
});

canvas.setAttribute("tabindex", "0");
function jump() {
  stage.style.transition = "transform .45s ease-in";
  stage.style.transform = "scale(1.35)";
  setTimeout(() => { location.href = GLOBE.linkTo; }, 380);
}
canvas.addEventListener("click", jump);
canvas.addEventListener("keydown", (e) => { if (e.key === "Enter") jump(); });
/* 详图同样可以点进江门页 */
if (mapCanvas) {
  mapCanvas.setAttribute("tabindex", "0");
  mapCanvas.addEventListener("click", () => { location.href = GLOBE.linkTo; });
  mapCanvas.addEventListener("keydown", (e) => { if (e.key === "Enter") location.href = GLOBE.linkTo; });
}

requestAnimationFrame(frame);
