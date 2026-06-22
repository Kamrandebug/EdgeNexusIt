// js/core/reveals.js
export function registerReveals() {
  const EASE = 'expo.out';

  // ── Clip reveals ──────────────────────────────────────────
  document.querySelectorAll('.reveal-clip:not([id^="hero"] *)').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: el.classList.contains('text-display') ? 0.8 : 0.5,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        },
      }
    );
  });

  // ── Fade reveals ──────────────────────────────────────────
  document.querySelectorAll('.reveal-fade:not(.reveal-group *):not([id^="hero"] *)').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        },
      }
    );
  });

  // ── Stagger groups ────────────────────────────────────────
  document.querySelectorAll('.reveal-group:not([id^="hero"] *)').forEach(group => {
    const children = group.querySelectorAll('.reveal-fade, .reveal-clip');
    gsap.fromTo(children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: {
          trigger: group,
          start: 'top 75%',
          once: true,
        },
      }
    );
  });

  // ── Divider reveals ───────────────────────────────────────
  document.querySelectorAll('.divider.reveal-divider:not([id^="hero"] *)').forEach(el => {
    gsap.to(el, {
      width: 60,
      duration: 0.5,
      ease: EASE,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  });
}
