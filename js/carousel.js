/* ============================================================
   carousel.js —— 轮播图逻辑（自动播放 + 箭头 + 圆点 + 触摸滑动）
   在 .carousel 上加 data-interval="5000" 可改自动切换间隔（毫秒）。
   ============================================================ */

function initCarousel(root) {
  const track   = root.querySelector(".carousel-track");
  const slides  = [...root.querySelectorAll(".slide")];
  const dotsBox = root.querySelector(".dots");
  const prog    = root.querySelector(".progress");
  const interval = parseInt(root.dataset.interval || "5000", 10); // 每张停留时长
  let index = 0, timer = null;

  // 根据幻灯片数量自动生成圆点
  dotsBox.innerHTML = slides.map(() => `<i></i>`).join("");
  const dots = [...dotsBox.children];

  /** 跳到第 i 张（循环） */
  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle("on", k === index));
    restartProgress();
  }

  /** 重置底部进度条动画 */
  function restartProgress() {
    if (!prog) return;
    prog.classList.remove("run");
    void prog.offsetWidth;                       // 强制重排以重新触发动画
    prog.style.setProperty("--dur", interval + "ms");
    prog.classList.add("run");
  }

  /** 自动轮播：暂停/恢复 */
  function play()  { stop(); timer = setInterval(() => go(index + 1), interval); }
  function stop()  { if (timer) clearInterval(timer); timer = null; }

  // 事件绑定：箭头、圆点、悬停暂停、触摸滑动
  root.querySelector(".arrow.prev")?.addEventListener("click", () => { go(index - 1); play(); });
  root.querySelector(".arrow.next")?.addEventListener("click", () => { go(index + 1); play(); });
  dots.forEach((d, k) => d.addEventListener("click", () => { go(k); play(); }));
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", play);

  let startX = null;
  root.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));  // 滑动超过 40px 才切换
    startX = null; play();
  }, { passive: true });

  go(0); play();
}

// 页面里所有 .carousel 自动初始化
document.querySelectorAll(".carousel").forEach(initCarousel);
