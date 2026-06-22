// Live system clock in navbar
export function initClock() {
  const clocks = document.querySelectorAll('[id*="clock"]');
  if (clocks.length === 0) return;

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clocks.forEach(clock => {
      const prefix = clock.id === 'nav-clock' ? 'SYS ' : '';
      clock.textContent = `${prefix}${hours}:${minutes}:${seconds}`;
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
}
