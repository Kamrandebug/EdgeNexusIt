// js/pages/cyber-security/page-main.js
// v2 — passes tier/fineHover/reducedMotion to all section inits
const PAGE_ID = 'cyber-security';

import { injectLayout } from '../../components/shared-layout.js';
injectLayout();

import { initHeroCybersec } from './hero-cybersec.js';
import { initPerimeter }    from './perimeter.js';
import { initKillchain }    from './killchain.js';
import { initIncidentResponse } from './incident-response.js';

import { initNav }            from '../../components/nav.js';
import { initClock }          from '../../components/clock.js';
import { initButtons }        from '../../components/buttons.js';
import { initCursor }         from '../../core/cursor.js';
import { generateNoise }      from '../../core/noise.js';
import { initGrid }           from '../../core/grid.js';
import { registerReveals }    from '../../core/reveals.js';
import { initTransitions }    from '../../core/transitions.js';
import { initScrollIndicator } from '../../core/scroll-indicator.js';
import { auditPerformance, tier as perfTier } from '../../core/performance.js';
import { initCTA }            from '../../sections/cta.js';
import { initFooter }         from '../../sections/footer.js';

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
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const tier = perfTier || 'high';
  const isMobile = window.innerWidth <= 768;

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

  // Card transition
  const fromCard = sessionStorage.getItem('edgenexus_from_card');
  sessionStorage.removeItem('edgenexus_from_card');
  if (fromCard) {
    let r;
    try { r = JSON.parse(fromCard).rect; } catch (e) { r = null; }
    const d = document.createElement('div');
    Object.assign(d.style, {
      position: 'fixed', inset: '0', background: '#060810', zIndex: '99999', pointerEvents: 'none',
      clipPath: r ? `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px)` : 'inset(50% 50% 50% 50%)',
    });
    document.body.appendChild(d);
    gsap.to(d, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.out', onComplete: () => d.remove() });
  }

  const ctx = { tier, fineHover, reducedMotion: PREFERS_REDUCED_MOTION, isMobile };

  safe(generateNoise, 'noise');
  safe(initGrid, 'grid');
  safe(initNav, 'nav');
  safe(initClock, 'clock');
  safe(initCursor, 'cursor');
  safe(initButtons, 'buttons');

  safe(() => initHeroCybersec(ctx), 'hero-cybersec');

  setTimeout(() => {
    safe(() => initPerimeter(ctx), 'perimeter');
    safe(() => initKillchain(ctx), 'killchain');
    safe(() => initIncidentResponse(ctx), 'incident-response');
    safe(initCTA, 'cta');
    safe(initFooter, 'footer');
    safe(initScrollIndicator, 'scrollIndicator');
    safe(registerReveals, 'reveals');
    safe(initTransitions, 'transitions');
  }, 100);

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(generateNoise, 250); });

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
    window.scrollTo(0, 0);
    safe(auditPerformance, 'performance');
  });
});
