// js/pages/ai-automation/page-main.js
// Boot sequence — identical pattern to it-support / devops pages
const PAGE_ID = 'ai-automation';

import { injectLayout } from '../../components/shared-layout.js';
injectLayout();

import { initHeroAi }          from './hero-ai.js';
import { initCapabilities }    from './capabilities.js';
import { initAutomationFlow }  from './automation-flow.js';
import { initImpactMetrics }   from './impact-metrics.js';

import { generateNoise }       from '../../core/noise.js';
import { initGrid }            from '../../core/grid.js';
import { initNav }             from '../../components/nav.js';
import { initClock }           from '../../components/clock.js';
import { initCursor }          from '../../core/cursor.js';
import { initButtons }         from '../../components/buttons.js';
import { initStatusBar }       from '../../components/status-bar.js';
import { initCTA }             from '../../sections/cta.js';
import { initFooter }          from '../../sections/footer.js';
import { initScrollIndicator } from '../../core/scroll-indicator.js';
import { registerReveals }     from '../../core/reveals.js';
import { initTransitions }     from '../../core/transitions.js';
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

  safe(() => initHeroAi(tier, isMobile, PREFERS_REDUCED_MOTION), 'hero-ai');

  setTimeout(() => {
    safe(() => initCapabilities(PREFERS_REDUCED_MOTION), 'capabilities');
    safe(() => initAutomationFlow(isMobile, PREFERS_REDUCED_MOTION), 'automation-flow');
    safe(() => initImpactMetrics(PREFERS_REDUCED_MOTION), 'impact-metrics');
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
