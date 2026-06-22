// js/pages/msp/sla.js
// ─────────────────────────────────────────────────────
// Cinematic scroll animations for SLA ARCHITECTURE section
// Uses GSAP 3.12.2 + ScrollTrigger (globally registered)
// ─────────────────────────────────────────────────────

import { hasHover } from '../../core/performance.js';

export function initSLA() {

  const section = document.querySelector('.sla-section');
  if (!section) return;

  const tiers    = section.querySelectorAll('[data-sla-tier]');
  const fills    = section.querySelectorAll('.sla-bar-fill');
  const title    = section.querySelector('.sla-title');
  const sub      = section.querySelector('.sla-sub');
  const stats    = section.querySelectorAll('.sla-stat');
  const statVals = section.querySelectorAll('[data-count-target]');

  // Set initial states
  gsap.set(title, { clipPath: 'inset(0 100% 0 0)', opacity: 0 });
  gsap.set(sub,   { opacity: 0, y: 20 });
  gsap.set(tiers, { opacity: 0 });
  fills.forEach(f => gsap.set(f, { width: '0%' }));
  gsap.set(stats, { opacity: 0, y: 24 });

  // ── 1. HEADER ────────────────────────────────────────
  const headerTl = gsap.timeline({
    scrollTrigger: {
      trigger: section.querySelector('.sla-header'),
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    }
  });
  headerTl
    .to(title, { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 1.0, ease: 'power4.out' })
    .to(sub,   { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5');

  // ── 2. TIER ROWS — STAGGERED ENTRANCE + BAR DRAW ─────
  // Each tier:
  //   a) Row fades in and slides from left (x:-30)
  //   b) After row is visible, bar fill animates width 0 → data-width%
  //   c) P1 gets continuous ripple ping after entering
  // All bidirectional

  tiers.forEach((tier, i) => {
    const fill      = tier.querySelector('.sla-bar-fill');
    const targetW   = fill.dataset.width + '%';
    const badge     = tier.querySelector('.sla-badge');
    const tierTime  = tier.querySelector('.sla-time');
    const isP1      = tier.classList.contains('p1');

    gsap.set(badge,    { scale: 0.7, opacity: 0 });
    gsap.set(tierTime, { opacity: 0 });

    const tierTl = gsap.timeline({
      scrollTrigger: {
        trigger: tier,
        start: 'top 84%',
        toggleActions: 'play none none reverse',
        onLeaveBack: () => {
          // Reset bar width on scroll-up
          gsap.set(fill, { width: '0%' });
          gsap.set(badge, { scale: 0.7, opacity: 0 });
          gsap.set(tierTime, { opacity: 0 });
          gsap.set(tier, { opacity: 0 });
        }
      }
    });

    tierTl
      // Row slide in
      .fromTo(tier,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.55, ease: 'expo.out' },
        i * 0.1   // stagger start offset
      )
      // Badge slam
      .to(badge,
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.6)' },
        '<0.1'
      )
      // Bar fill draws left → right
      .to(fill,
        { width: targetW, duration: 0.9, ease: 'expo.out' },
        '<0.15'
      )
      // Time value fades in
      .to(tierTime,
        { opacity: 1, duration: 0.5, ease: 'power2.out' },
        '<0.3'
      );

    // ── P1 CONTINUOUS RIPPLE PING ─────────────────────
    // After P1 enters, inject a ripple ring every 2.5s
    if (isP1) {
      let rippleInterval = null;

      ScrollTrigger.create({
        trigger: tier,
        start: 'top 84%',
        onEnter: () => {
          // Create ripple element once
          const ripple = document.createElement('span');
          ripple.classList.add('sla-p1-ripple');
          ripple.style.cssText = `
            position:absolute; left:0; top:0; right:0; bottom:0;
            border:1px solid rgba(255,60,60,0.5);
            pointer-events:none; opacity:0;
          `;
          tier.querySelector('.sla-bar-wrap').appendChild(ripple);

          const fireRipple = () => {
            gsap.fromTo(ripple,
              { scale: 1, opacity: 0.6 },
              { scale: 1.04, opacity: 0, duration: 1.2, ease: 'power2.out' }
            );
          };

          fireRipple();
          rippleInterval = setInterval(fireRipple, 2500);
        },
        onLeaveBack: () => {
          if (rippleInterval) { clearInterval(rippleInterval); rippleInterval = null; }
          const ripple = tier.querySelector('.sla-p1-ripple');
          if (ripple) ripple.remove();
        }
      });
    }
  });

  // ── 3. TIER HOVER — SCANLINE SWEEP (hover-capable only) ──
  // On mouseenter: a 1px scan line sweeps top→bottom of the bar
  if (hasHover) {
  tiers.forEach(tier => {
    const barWrap = tier.querySelector('.sla-bar-wrap');
    let scanEl = null;

      tier.addEventListener('mouseenter', () => {
        if (!scanEl) {
          scanEl = document.createElement('span');
          scanEl.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:1px;
            background:rgba(255,255,255,0.35); pointer-events:none;
          `;
          barWrap.appendChild(scanEl);
        }
        gsap.fromTo(scanEl,
          { top: 0, opacity: 0.8 },
          { top: '100%', opacity: 0, duration: 0.55, ease: 'expo.out' }
        );
      });
    });
  }

  // ── 4. STAT STRIP ENTRANCE ────────────────────────────
  // Stats stagger up from below once tiers have all entered
  gsap.to(stats, {
    opacity: 1, y: 0,
    duration: 0.65,
    ease: 'expo.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: section.querySelector('.sla-stats'),
      start: 'top 88%',
      toggleActions: 'play none none reverse'
    }
  });

  // ── 5. UPTIME COUNTER ROLL-UP ─────────────────────────
  // [data-count-target="99.98"] rolls from 0 → 99.98
  statVals.forEach(el => {
    const target = parseFloat(el.dataset.countTarget);
    const suffix = el.dataset.countSuffix || '';

    gsap.fromTo({ val: 0 },
      { val: 0 },
      {
        val: target,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = this.targets()[0].val.toFixed(2) + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}