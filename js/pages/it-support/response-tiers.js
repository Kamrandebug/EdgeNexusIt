/**
 * response-tiers.js — Response tier cards with magnetic cursor field
 *
 * Animations:
 *  1. Card reveal on scroll
 *  2. Magnetic cursor field (gsap.quickTo per card)
 */

export function initResponseTiers(isMobile = false, reducedMotion = false) {

  /* ─── Card entry reveal ─────────────────────────────── */
  ScrollTrigger.create({
    trigger: '#response-tiers',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to('.tier-card', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1
      });
    }
  });

  /* ─── Magnetic field ────────────────────────────────── */
  if (isMobile || reducedMotion) return;

  const zone = document.getElementById('tiers-magnetic-zone');
  if (!zone) return;

  const cards = Array.from(zone.querySelectorAll('.tier-card'));
  const STRENGTH = 0.14;
  const FALLOFF = 380;
  const SPRING_DURATION = 0.4;
  const SPRING_EASE = 'power2.out';
  const RETURN_DURATION = 0.8;
  const RETURN_EASE = 'elastic.out(1, 0.4)';

  const quickSetters = cards.map(card => ({
    x: gsap.quickTo(card, 'x', { duration: SPRING_DURATION, ease: SPRING_EASE }),
    y: gsap.quickTo(card, 'y', { duration: SPRING_DURATION, ease: SPRING_EASE })
  }));

  let rafPending = false;
  let lastMouseX = 0, lastMouseY = 0;

  zone.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = lastMouseX - cx;
        const dy = lastMouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - dist / FALLOFF);
        quickSetters[i].x(dx * force * STRENGTH);
        quickSetters[i].y(dy * force * STRENGTH);
      });
    });
  });

  zone.addEventListener('mouseleave', () => {
    cards.forEach((card, i) => {
      gsap.to(card, {
        x: 0, y: 0,
        duration: RETURN_DURATION,
        ease: RETURN_EASE,
        overwrite: 'auto'
      });
    });
  });

  cards.forEach(card => {
    card.addEventListener('blur', () => {
      gsap.to(card, { x: 0, y: 0, duration: RETURN_DURATION, ease: RETURN_EASE });
    });
  });
}
