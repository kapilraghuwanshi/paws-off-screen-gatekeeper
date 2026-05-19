/* ===== Matrix Rain ===== */
(function initMatrix() {
  const canvas = document.getElementById("matrix-rain");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const chars = "01アイウエオカキクケコ🐶🐾PAWSOFF";
  const fontSize = 14;
  let columns, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -100);
  }

  function draw() {
    ctx.fillStyle = "rgba(10, 10, 10, 0.06)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < columns; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
})();

/* ===== Typing animation ===== */
(function initTyping() {
  const el = document.getElementById("typed-command");
  if (!el) return;
  const text = "pawsoff --deploy --puppy 🐶";
  let i = 0;
  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 70 + Math.random() * 50);
    }
  }
  setTimeout(type, 1200);
})();

/* ===== Countdown demo ===== */
(function initCountdown() {
  const el = document.querySelector(".countdown-demo");
  if (!el) return;
  let seconds = 29 * 60 + 41;
  setInterval(() => {
    seconds = seconds > 0 ? seconds - 1 : 1800;
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    el.textContent = `${m}:${s}`;
  }, 1000);
})();

/* ===== Copy buttons ===== */
document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = "✓ COPIED TO CLIPBOARD";
      button.style.background = "#28ca42";
      setTimeout(() => {
        button.textContent = original;
        button.style.background = "";
      }, 2000);
    } catch {
      button.textContent = "⚠ SELECT MANUALLY";
      setTimeout(() => {
        button.textContent = original;
      }, 2000);
    }
  });
});
