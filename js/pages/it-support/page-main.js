// js/pages/it-support/page-main.js
// Boot sequence — identical pattern to devops page
const PAGE_ID = 'it-support';

import { injectLayout } from '../../components/shared-layout.js';
injectLayout();

import { initHeroItsupport } from './hero-itsupport.js';
import { initSlaStats }      from './sla-stats.js';
import { initResponseTiers } from './response-tiers.js';
import { initTeamBench }     from './team-bench.js';

import { generateNoise }      from '../../core/noise.js';
import { initGrid }           from '../../core/grid.js';
import { initNav }            from '../../components/nav.js';
import { initClock }          from '../../components/clock.js';
import { initCursor }         from '../../core/cursor.js';
import { initButtons }        from '../../components/buttons.js';
import { initStatusBar }      from '../../components/status-bar.js';
import { initCTA }            from '../../sections/cta.js';
import { initFooter }         from '../../sections/footer.js';
import { initScrollIndicator } from '../../core/scroll-indicator.js';
import { registerReveals }    from '../../core/reveals.js';
import { initTransitions }    from '../../core/transitions.js';
import { auditPerformance, tier as perfTier } from '../../core/performance.js';

if (window.gsap && window.ScrollTrigger && window.ScrollToPlugin) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}
if (window.gsap) {
  gsap.ticker.lagSmoothing(0);
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) gsap.ticker.fps(30);
}

window.addEventListener('load', () => {
  if (!window.gsap) {
    document.querySelectorAll('.reveal-clip, .reveal-fade').forEach(el => {
      el.style.opacity = '1';
      if (el.style.clipPath) el.style.clipPath = 'none';
    });
    return;
  }

  const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__reducedMotion = PREFERS_REDUCED_MOTION;
  const tier = perfTier || 'high';
  const isMobile = window.innerWidth <= 768 || !window.matchMedia('(hover: hover)').matches;

  if (PREFERS_REDUCED_MOTION) {
    gsap.globalTimeline.timeScale(1000);
    document.querySelectorAll('.reveal-clip, .reveal-fade, .reveal').forEach(el => {
      el.style.opacity = '1'; el.style.clipPath = 'none'; el.style.transform = 'none';
    });
    ScrollTrigger.getAll().forEach(t => t.kill());
    const s = (fn, n) => { try { fn(); } catch (e) { console.warn('[EdgeNexus]', n, e); } };
    s(initNav, 'nav'); s(initClock, 'clock'); s(initButtons, 'buttons');
    window.scrollTo(0, 0);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const safe = (fn, name) => { try { fn(); } catch (e) { console.warn(`[EdgeNexus] ${name} failed:`, e); } };

  safe(generateNoise, 'noise');
  safe(initGrid, 'grid');
  safe(initNav, 'nav');
  safe(initClock, 'clock');
  safe(initCursor, 'cursor');
  safe(initButtons, 'buttons');

  safe(() => initHeroItsupport(tier, isMobile, PREFERS_REDUCED_MOTION), 'hero-itsupport');

  setTimeout(() => {
    safe(() => initSlaStats(PREFERS_REDUCED_MOTION), 'sla-stats');
    safe(() => initResponseTiers(isMobile, PREFERS_REDUCED_MOTION), 'response-tiers');
    safe(() => initTeamBench(isMobile, PREFERS_REDUCED_MOTION), 'team-bench');
    safe(initCTA, 'cta');
    safe(initFooter, 'footer');
    safe(initScrollIndicator, 'scrollIndicator');
    safe(registerReveals, 'reveals');
    safe(initTransitions, 'transitions');
    safe(initStatusBar, 'statusBar');
    safe(initClock, 'clock');
  }, 100);

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
    window.scrollTo(0, 0);
    safe(auditPerformance, 'performance');
  });
});
