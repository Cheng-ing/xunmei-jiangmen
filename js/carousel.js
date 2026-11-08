/* 轮播间隔在各页面 .carousel 的 data-interval 中修改。 */
function initCarousel(root) {
  const track = root.querySelector(".carousel-track");
  const slides = [...root.querySelectorAll(".slide")];
  const dotsBox = root.querySelector(".dots");
  const prog = root.querySelector(".progress");
  const interval = parseInt(root.dataset.interval || "5000", 10);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0, timer = null, hovered = false, focused = false, touching = false;
  let touchStart = null;

  dotsBox.innerHTML = slides.map((_, i) => `<button type="button" aria-label="第 ${i + 1} 张"></button>`).join("");
  const dots = [...dotsBox.children];

  function stop() {
    clearInterval(timer);
    timer = null;
    prog?.classList.remove("run");
  }

  function play() {
    stop();
    if (hovered || focused || touching || document.hidden || reducedMotion.matches) return;
    if (prog) {
      void prog.offsetWidth;
      prog.style.setProperty("--dur", interval + "ms");
      prog.classList.add("run");
    }
    timer = setInterval(() => go(index + 1), interval);
  }

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, k) => {
      dot.classList.toggle("on", k === index);
      dot.setAttribute("aria-current", String(k === index));
    });
    // 当前图片先发起请求，避免滑到懒加载图片时仍是空白。
    const image = slides[index].querySelector("img");
    if (image) image.loading = "eager";
    play();
  }

  root.querySelector(".arrow.prev")?.addEventListener("click", () => go(index - 1));
  root.querySelector(".arrow.next")?.addEventListener("click", () => go(index + 1));
  dots.forEach((dot, k) => dot.addEventListener("click", () => go(k)));
  root.addEventListener("mouseenter", () => { hovered = true; stop(); });
  root.addEventListener("mouseleave", () => { hovered = false; play(); });
  root.addEventListener("focusin", () => { focused = true; stop(); });
  root.addEventListener("focusout", (event) => {
    focused = root.contains(event.relatedTarget);
    play();
  });
  document.addEventListener("visibilitychange", play);
  reducedMotion.addEventListener("change", play);

  root.addEventListener("touchstart", (event) => {
    touching = true;
    touchStart = event.touches.length === 1 ? [event.touches[0].clientX, event.touches[0].clientY] : null;
    stop();
  }, { passive: true });
  root.addEventListener("touchend", (event) => {
    if (touchStart && event.touches.length === 0) {
      const dx = event.changedTouches[0].clientX - touchStart[0];
      const dy = event.changedTouches[0].clientY - touchStart[1];
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    }
    touchStart = null;
    touching = event.touches.length > 0;
    play();
  }, { passive: true });
  root.addEventListener("touchcancel", () => { touchStart = null; touching = false; play(); }, { passive: true });
  go(0);
}

document.querySelectorAll(".carousel").forEach(initCarousel);
