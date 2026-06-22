// js/components/status-bar.js
export function initStatusBar() {
  const statusBar = document.getElementById('status-bar');
  if (!statusBar) return;

  const clockEl = document.getElementById('status-clock');
  
  // 1. Live Clock logic
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  updateClock();
  setInterval(updateClock, 1000);

  // 2. Entry animation
  // prompt specifies: "Slides down into view 0.3s after preloader exits"
  // Since we don't have a preloader, we'll wait 0.3s after initialization.
  setTimeout(() => {
    statusBar.classList.add('visible');
  }, 300);

  // 3. Scroll behavior
  // prompt specifies: "On scroll >200px: collapses to 0px height with 0.2s transition"
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      statusBar.classList.add('collapsed');
    } else {
      statusBar.classList.remove('collapsed');
    }
  }, { passive: true });
}
