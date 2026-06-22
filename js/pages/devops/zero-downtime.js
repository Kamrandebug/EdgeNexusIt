// js/pages/devops/zero-downtime.js
// ─────────────────────────────────────────────────────
// Power-on card sequences + animated SVG triggers for DevOps ZDT
// Uses GSAP 3.12.2 + ScrollTrigger (globally registered)
// ─────────────────────────────────────────────────────

import { hasHover } from '../../core/performance.js';

export function initZeroDowntime() {
  const section = document.querySelector('.section-zero-downtime');
  if (!section) return;

  const cards = section.querySelectorAll('.zdt-card');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Animated SVGs: ScrollTrigger play ──────────────
  const animatedSvgs = section.querySelectorAll('.zdt-animated');
  animatedSvgs.forEach(svg => {
    ScrollTrigger.create({
      trigger: svg.closest('.zdt-card'),
      start: 'top 75%',
      toggleActions: 'play none none none',
      onEnter: () => {
        svg.classList.add('playing');
      },
      onLeave: () => {
        svg.classList.remove('playing');
      },
      onEnterBack: () => {
        svg.classList.add('playing');
      },
      onLeaveBack: () => {
        svg.classList.remove('playing');
      },
    });
  });

  // ── Title underline scroll animation ──────────────
  const accentLine = section.querySelector('.title-underline-accent');
  if (accentLine) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'top 40%',
      onEnter: () => {
        gsap.to(accentLine, {
          scaleX: 1,
          duration: 1.2,
          ease: 'expo.out',
        });
      },
      once: true,
    });
  }

  // ── Card entry animations ─────────────────────────
  cards.forEach((card, i) => {
    const flash = document.createElement('div');
    flash.className = 'zdt-flash';
    Object.assign(flash.style, {
      position: 'absolute',
      inset: '0',
      background: 'rgba(255,255,255,0)',
      pointerEvents: 'none',
      zIndex: '0',
    });
    card.style.position = 'relative';
    card.appendChild(flash);

    const flashKeyframes = [
      { background: 'rgba(255,255,255,0)', offset: 0 },
      { background: 'rgba(255,255,255,0.06)', offset: 0.5 },
      { background: 'rgba(255,255,255,0)', offset: 1 },
    ];
    const flashTiming = { duration: 120, iterations: 1, fill: 'forwards' };

    const iconWrap = card.querySelector('.zdt-card__icon-wrap');
    const eyebrow = card.querySelector('.zdt-card__eyebrow');
    const title = card.querySelector('.zdt-card__title');
    const desc = card.querySelector('.zdt-card__desc');

    // Initial states
    gsap.set(card, { opacity: 0, y: 30 });
    gsap.set(iconWrap, { scale: 0, rotation: -12 });
    gsap.set(eyebrow, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(title, { y: 16, opacity: 0 });
    gsap.set(desc, { y: 8, opacity: 0 });

    const cardDelay = i * 0.1;

    if (!prefersReducedMotion) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          const tl = gsap.timeline({ delay: cardDelay });

          tl
            .to(card, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
            .call(() => { flash.animate(flashKeyframes, flashTiming); })
            .to(iconWrap, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.2)' }, '+=0.06')
            .to(eyebrow, { clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'power2.out' }, '+=0.15')
            .to(title, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, '+=0.07')
            .to(desc, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1');
        },
        onLeaveBack: () => {
          gsap.set(card, { opacity: 0, y: 30 });
          gsap.set(iconWrap, { scale: 0, rotation: -12 });
          gsap.set(eyebrow, { clipPath: 'inset(0 100% 0 0)' });
          gsap.set(title, { y: 16, opacity: 0 });
          gsap.set(desc, { y: 8, opacity: 0 });
        },
      });
    } else {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.to(card, { opacity: 1, y: 0, duration: 0.1, delay: cardDelay });
          gsap.set([iconWrap, eyebrow, title, desc], { clearProps: 'all' });
        },
      });
    }

    // Hover effects (only on hover-capable devices)
    if (hasHover) {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          borderColor: 'var(--accent-border)',
          backgroundColor: 'var(--accent-glow)',
          duration: 0.2,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          borderColor: 'var(--bc)',
          backgroundColor: 'var(--panel)',
          duration: 0.2,
          ease: 'power2.out',
        });
      });
    }
  });
}
