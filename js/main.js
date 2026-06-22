// js/main.js
const PAGE_ID = 'index';

import { injectLayout }  from './components/shared-layout.js';
injectLayout();

import { generateNoise } from './core/noise.js';
import { initGrid }       from './core/grid.js';
import { initCursor }     from './core/cursor.js';
import { initScrollIndicator } from './core/scroll-indicator.js';
import { auditPerformance } from './core/performance.js';
import { registerReveals } from './core/reveals.js';
import { initTransitions } from './core/transitions.js';
import { initPreloader }  from './components/preloader.js';
import { initNav }        from './components/nav.js';
import { initClock }      from './components/clock.js';
import { initButtons }    from './components/buttons.js';
import { initHero }       from './sections/hero.js';
import { initServices }   from './sections/services.js';
import { initProcess }    from './sections/process.js';
import { initSOC }        from './sections/soc.js';
import { initCTA }        from './sections/cta.js';
import { initFooter }     from './sections/footer.js';

// Register plugins immediately for module-level usage
if (window.gsap && window.ScrollTrigger && window.ScrollToPlugin) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

// GSAP tweaks: disable lag-smoothing catch-up, cap tick rate on low tiers
if (window.gsap) {
  gsap.ticker.lagSmoothing(0);
  const isWeak = navigator.deviceMemory && navigator.deviceMemory <= 2;
  if (isWeak) gsap.ticker.fps(30);
}

// ── Global reduced-motion kill switch ──────────────────────────────
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.__reducedMotion = PREFERS_REDUCED_MOTION;

if (PREFERS_REDUCED_MOTION && window.gsap) {
  gsap.globalTimeline.timeScale(1000); // Skip all animations instantly
  // Set all reveal elements to their final visible state
  document.querySelectorAll('.reveal-clip, .reveal-fade, .reveal').forEach(el => {
    el.style.opacity = '1';
    el.style.clipPath = 'none';
    el.style.transform = 'none';
  });
  // Kill all existing ScrollTrigger instances
  if (window.ScrollTrigger) {
    ScrollTrigger.getAll().forEach(t => t.kill());
  }
}

window.addEventListener('load', () => {
  // Guard: bail gracefully if critical CDNs failed to load
  if (!window.gsap) {
    console.warn('[EdgeNexus] GSAP not loaded — skipping all animations');
    document.getElementById('preloader')?.style.setProperty('display', 'none');
    document.querySelectorAll('.reveal-clip, .reveal-fade').forEach(el => {
      el.style.opacity = '1';
      if (el.style.clipPath) el.style.clipPath = 'none';
    });
    return;
  }

  // If reduced-motion already handled, init core systems but skip animations
  if (PREFERS_REDUCED_MOTION) {
    document.getElementById('preloader')?.style.setProperty('display', 'none');
    document.querySelectorAll('.reveal-clip, .reveal-fade').forEach(el => {
      el.style.opacity = '1';
      el.style.clipPath = 'none';
    });
    // Still init nav, clock, cursor (non-animated)
    const safe = (fn, name) => { try { fn(); } catch (e) { console.warn(`[EdgeNexus] ${name} failed:`, e); } };
    safe(initNav, 'nav');
    safe(initClock, 'clock');
    safe(initButtons, 'buttons');
    // Hide preloader, show content immediately
    document.getElementById('preloader')?.style.setProperty('display', 'none');
    window.scrollTo(0, 0);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Defensive wrapper for module-level init (pre-preloader)
  const safe = (fn, name) => { try { fn(); } catch (e) { console.warn(`[EdgeNexus] ${name} failed:`, e); } };

  // Initialize background systems immediately
  safe(generateNoise, 'noise');
  safe(initGrid, 'grid');
  safe(initHero, 'hero'); // Prepare canvas and bridge

  initPreloader(() => {
    // Defensive: wrap each module so one failure doesn't kill the rest
    safe(initNav, 'nav');
    safe(initClock, 'clock');
    safe(initCursor, 'cursor');
    safe(initButtons, 'buttons');
    safe(initServices, 'services');
    safe(initProcess, 'process');
    safe(initSOC, 'soc');
    safe(initCTA, 'CTA');
    safe(initFooter, 'footer');
    safe(initScrollIndicator, 'scrollIndicator');

    // Reveal system (skips hero)
    safe(registerReveals, 'reveals');

    // Interstitial atmosphere zones
    safe(initTransitions, 'transitions');

    // Resize handler for responsive updates
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        generateNoise();
        ScrollTrigger.refresh(true);
      }, 250);
    });

    // Refresh after fonts ready
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
      window.scrollTo(0, 0);
      safe(auditPerformance, 'performance');
    });
  });
});
