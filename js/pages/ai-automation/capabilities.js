/**
 * capabilities.js — AI Capabilities Section
 * 6 capability cards: scroll reveal batch + magnetic hover (cards 01/02/06).
 */

export function initCapabilities(reducedMotion = false) {
  const cards = document.querySelectorAll('.cap-card');
  if (!cards.length) return;

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    cards.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
    return;
  }

  // ── Scroll reveal (batched, both directions) ───────────────
  ScrollTrigger.batch('.cap-card', {
    start: 'top 85%',
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: true }
    ),
    onEnterBack: els => gsap.fromTo(els,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', overwrite: true }
    ),
  });

  // Set initial hidden state (GSAP owns reveal)
  gsap.set('.cap-card', { opacity: 0, y: 40, scale: 0.96 });

  // ── Magnetic hover on cards 01, 02, 06 ─────────────────────
  const magneticSelectors = ['01', '02', '06'];
  const isTouch = !window.matchMedia('(hover: hover)').matches;

  if (!isTouch) {
    cards.forEach(card => {
      const idx = card.getAttribute('data-cap');
      if (!magneticSelectors.includes(idx)) return;

      const xTo = gsap.quickTo(card, 'x', { duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      const FALLOFF = 380; // px
      const STRENGTH = 0.14;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - dist / FALLOFF);
        xTo(dx * STRENGTH * force);
        yTo(dy * STRENGTH * force);
      });

      card.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }
}
