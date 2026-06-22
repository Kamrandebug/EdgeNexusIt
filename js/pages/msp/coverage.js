// js/pages/msp/coverage.js
// ─────────────────────────────────────────────────────
// Cinematic scroll animations for THE COVERAGE section
// Uses GSAP 3.12.2 + ScrollTrigger (globally registered)
// ─────────────────────────────────────────────────────

import { hasHover } from '../../core/performance.js';

export function initCoverage() {

  const section   = document.querySelector('.cov-section');
  if (!section) return;

  const featured  = section.querySelector('.cov-featured');
  const miniCards = section.querySelectorAll('.cov-mini');
  const barCards  = section.querySelectorAll('.cov-bar, .cov-noc');
  const header    = section.querySelector('.cov-header');
  const title     = section.querySelector('.cov-title');
  const sub       = section.querySelector('.cov-sub');

  // ── 1. HEADER ENTRANCE ──────────────────────────────
  // Eyebrow + divider handled by global reveals.js
  // Animate title and subtitle via GSAP ScrollTrigger
  gsap.fromTo(title,
    { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    {
      clipPath: 'inset(0 0% 0 0)', opacity: 1,
      duration: 1.0, ease: 'power4.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
  gsap.fromTo(sub,
    { opacity: 0, y: 20 },
    {
      opacity: 1, y: 0,
      duration: 0.8, ease: 'power2.out', delay: 0.2,
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );

  // ── 2. FEATURED CARD ENTRANCE ────────────────────────
  // Power-on sequence: flash → content reveal
  // Step 1: brief bg flash
  // Step 2: left-edge accent bar draws right (scaleX 0→1)
  // Step 3: number + icon slam in
  // Step 4: title clip reveal
  // Step 5: body + tag fade up

  const featTl = gsap.timeline({
    scrollTrigger: {
      trigger: featured,
      start: 'top 78%',
      toggleActions: 'play none none reverse'
    }
  });

  // Set initial state
  gsap.set(featured, { opacity: 0 });
  gsap.set(featured.querySelector('.cov-feat-num'),   { opacity: 0 });
  gsap.set(featured.querySelector('.cov-feat-icon'),  { scale: 0, opacity: 0 });
  gsap.set(featured.querySelector('.cov-feat-title'), { clipPath: 'inset(0 100% 0 0)', opacity: 0 });
  gsap.set(featured.querySelector('.cov-feat-body'),  { opacity: 0, y: 16 });
  gsap.set(featured.querySelector('.cov-feat-tag'),   { opacity: 0, y: 10 });

  featTl
    // Flash: card background pulse
    .to(featured, { opacity: 1, duration: 0.05, ease: 'none' })
    .to(featured, { background: 'rgba(0,170,255,0.06)', duration: 0.14, ease: 'power2.in' })
    .to(featured, { background: 'var(--panel)', duration: 0.14, ease: 'power2.out' })
    // Number label
    .to(featured.querySelector('.cov-feat-num'),
      { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.1')
    // Icon slam with back.out overshoot
    .fromTo(featured.querySelector('.cov-feat-icon'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.6)' }, '-=0.2')
    // Title clip reveal
    .to(featured.querySelector('.cov-feat-title'),
      { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.6, ease: 'expo.out' }, '-=0.1')
    // Body lift + tag
    .to(featured.querySelector('.cov-feat-body'),
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(featured.querySelector('.cov-feat-tag'),
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');

  // ── 3. MINI CARDS — BIDIRECTIONAL STAGGER REVEAL ─────
  // Cards enter from alternating sides (left col from left, right col from right)
  // On scroll-up: reverse in same direction

  miniCards.forEach((card, i) => {
    const isRight = i % 2 === 1;  // right column
    const xFrom   = isRight ? 40 : -40;

    gsap.set(card, { opacity: 0, x: xFrom });

    gsap.to(card, {
      opacity: 1, x: 0,
      duration: 0.65,
      ease: 'expo.out',
      delay: i * 0.08,   // stagger
      scrollTrigger: {
        trigger: card,
        start: 'top 82%',
        toggleActions: 'play none none reverse'
      }
    });

    // Icon glow ignite on hover (only hover-capable)
    if (hasHover) {
      const icon = card.querySelector('.cov-mini-icon svg');
      card.addEventListener('mouseenter', () => {
        gsap.to(icon, { filter: 'drop-shadow(0 0 6px rgba(0,170,255,0.6))', duration: 0.3 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(icon, { filter: 'none', duration: 0.4 });
      });
    }
  });

  // Sibling dim on hover (same behavior as services.js) — hover-capable only
  if (hasHover) {
    miniCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const siblings = [...miniCards].filter(c => c !== card);
        gsap.to(siblings, { opacity: 0.4, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(miniCards, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  // ── 4. BOTTOM BAR CARDS — SLIDE UP WITH STAGGER ──────
  // Both bar cards rise from y:30 with a stagger of 0.12s

  gsap.set(barCards, { opacity: 0, y: 30 });

  gsap.to(barCards, {
    opacity: 1, y: 0,
    duration: 0.7,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: section.querySelector('.cov-bottom'),
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });

  // ── 5. CORNER BRACKET EFFECT ON FEATURED HOVER ───────
  // Inject four 1px bracket pseudo-elements via class toggle
  // (add .is-hovered class and handle in CSS) — hover-capable only
  if (hasHover) {
    featured.addEventListener('mouseenter', () => featured.classList.add('is-hovered'));
    featured.addEventListener('mouseleave', () => featured.classList.remove('is-hovered'));
  }

  // ── 6. NOC LIVE COUNTER FLUCTUATION ──────────────────
  // Subtle live endpoint count randomisation every 4s
  const nocCount  = section.querySelector('.cov-noc-count');
  const nocAlerts = section.querySelector('.cov-noc-alerts');
  if (nocCount) {
    setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
      const current = parseInt(nocCount.textContent, 10);
      nocCount.textContent = Math.max(840, Math.min(860, current + delta));
    }, 4000);
  }
}