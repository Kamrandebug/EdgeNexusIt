// js/pages/devops/page-main.js
// Bootstrapper for DevOps & Cloud Automation page
const PAGE_ID = 'devops';

import { injectLayout } from '../../components/shared-layout.js';
injectLayout();

import { initHeroDevops } from './hero-devops.js';
import { initPipeline }   from './pipeline.js';
import { initStackInterop } from './stack-interop.js';
import { initZeroDowntime } from './zero-downtime.js';

// Core modules
import { initNav }            from '../../components/nav.js';
import { initClock }          from '../../components/clock.js';
import { initButtons }        from '../../components/buttons.js';
import { initCursor }         from '../../core/cursor.js';
import { generateNoise }      from '../../core/noise.js';
import { initGrid }           from '../../core/grid.js';
import { registerReveals }    from '../../core/reveals.js';
import { initTransitions }    from '../../core/transitions.js';
import { initScrollIndicator } from '../../core/scroll-indicator.js';
import { auditPerformance }   from '../../core/performance.js';

// Section modules
import { initCTA }            from '../../sections/cta.js';
import { initFooter }         from '../../sections/footer.js';

// Register plugins immediately
if (window.gsap && window.ScrollTrigger && window.ScrollToPlugin) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

// GSAP tweaks: disable lag-smoothing catch-up, cap tick rate on low tiers
if (window.gsap) {
  gsap.ticker.lagSmoothing(0);
  const isWeak = navigator.deviceMemory && navigator.deviceMemory <= 2;
  if (isWeak) gsap.ticker.fps(30);
}

window.addEventListener('load', () => {
  // Guard: bail gracefully if critical CDNs failed to load
  if (!window.gsap) {
    console.warn('[EdgeNexus] GSAP not loaded — skipping all animations');
    document.querySelectorAll('.reveal-clip, .reveal-fade').forEach(el => {
      el.style.opacity = '1';
      if (el.style.clipPath) el.style.clipPath = 'none';
    });
    return;
  }

  // ── Global reduced-motion kill switch ────────────────────────
  const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__reducedMotion = PREFERS_REDUCED_MOTION;

  if (PREFERS_REDUCED_MOTION) {
    gsap.globalTimeline.timeScale(1000);
    document.querySelectorAll('.reveal-clip, .reveal-fade, .reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.clipPath = 'none';
      el.style.transform = 'none';
    });
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
    const rmSafe = (fn, name) => { try { fn(); } catch (e) { console.warn(`[EdgeNexus] ${name} failed:`, e); } };
    rmSafe(initNav, 'nav');
    rmSafe(initClock, 'clock');
    rmSafe(initButtons, 'buttons');
    window.scrollTo(0, 0);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Defensive wrapper
  const safe = (fn, name) => { try { fn(); } catch (e) { console.warn(`[EdgeNexus] ${name} failed:`, e); } };

  // ── Read transition flag from main site ──────────────
  const fromCardData = sessionStorage.getItem('edgenexus_from_card');
  sessionStorage.removeItem('edgenexus_from_card');

  // ── Boot flash (or card transition) ───────────────────
  if (fromCardData) {
    let fromRect;
    try { fromRect = JSON.parse(fromCardData).rect; } catch (e) { fromRect = null; }

    const reveal = document.createElement('div');
    Object.assign(reveal.style, {
      position: 'fixed', inset: '0', background: '#060810',
      zIndex: '99999', pointerEvents: 'none',
      clipPath: fromRect
        ? `inset(${fromRect.top}px ${window.innerWidth - fromRect.right}px ${window.innerHeight - fromRect.bottom}px ${fromRect.left}px)`
        : 'inset(50% 50% 50% 50%)',
    });
    document.body.appendChild(reveal);

    gsap.to(reveal, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.5,
      ease: 'expo.out',
      onComplete: () => reveal.remove(),
    });
  }

  // ── Background systems ───────────────────────────────
  safe(generateNoise, 'noise');
  safe(initGrid, 'grid');

  // ── Nav + shared components ──────────────────────────
  safe(initNav, 'nav');
  safe(initClock, 'clock');
  safe(initCursor, 'cursor');
  safe(initButtons, 'buttons');

  // ── Hero ─────────────────────────────────────────────
  safe(initHeroDevops, 'hero-devops');

  // ── Scroll-triggered sections (deferred 100ms) ──────
  setTimeout(() => {
    safe(initStackInterop, 'stack-interop');
    safe(initPipeline, 'pipeline');
    safe(initZeroDowntime, 'zero-downtime');
    safe(initCTA, 'cta');
    safe(initFooter, 'footer');
    safe(initScrollIndicator, 'scrollIndicator');
    safe(registerReveals, 'reveals');
    safe(initTransitions, 'transitions');
  }, 100);

  // ── Fonts + resize ───────────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      generateNoise();
    }, 250);
  });

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
    window.scrollTo(0, 0);
    safe(auditPerformance, 'performance');
  });
});
