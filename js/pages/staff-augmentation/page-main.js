const PAGE_ID = 'staff-augmentation';

import { injectLayout } from '../../components/shared-layout.js';
injectLayout();

import { generateNoise } from '../../core/noise.js';
import { initGrid } from '../../core/grid.js';
import { initNav } from '../../components/nav.js';
import { initClock } from '../../components/clock.js';
import { initButtons } from '../../components/buttons.js';
import { initCursor } from '../../core/cursor.js';
import { initCTA } from '../../sections/cta.js';
import { initFooter } from '../../sections/footer.js';
import { initScrollIndicator } from '../../core/scroll-indicator.js';
import { registerReveals } from '../../core/reveals.js';
import { initTransitions } from '../../core/transitions.js';
import { auditPerformance } from '../../core/performance.js';
import { initHeroStaffAug } from './hero-staffaug.js';

if (window.gsap && window.ScrollTrigger && window.ScrollToPlugin) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}
if (window.gsap) {
  gsap.ticker.lagSmoothing(0);
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) gsap.ticker.fps(30);
}
const safe = (fn, name) => { try { fn(); } catch (e) { console.warn('[staffaug]', name, e); } };

window.addEventListener('load', () => {
  if (!window.gsap) {
    document.querySelectorAll('.reveal-clip,.reveal-fade').forEach(el => { el.style.opacity='1'; if(el.style.clipPath)el.style.clipPath='none'; });
    return;
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    gsap.globalTimeline.timeScale(1000);
    document.querySelectorAll('.reveal-clip,.reveal-fade,.reveal').forEach(el => { el.style.opacity='1'; el.style.clipPath='none'; el.style.transform='none'; });
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
    safe(initNav,'nav'); safe(initClock,'clock'); safe(initButtons,'buttons');
    window.scrollTo(0,0); return;
  }
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  document.querySelector('.hero-staffaug')?.classList.add('is-ready');

  const fromCardData = sessionStorage.getItem('edgenexus_from_card');
  sessionStorage.removeItem('edgenexus_from_card');
  if (fromCardData) {
    let fromRect;
    try { fromRect = JSON.parse(fromCardData).rect; } catch (e) { fromRect = null; }
    const reveal = document.createElement('div');
    Object.assign(reveal.style, { position:'fixed', inset:'0', background:'#060810', zIndex:'99999', pointerEvents:'none',
      clipPath: fromRect ? 'inset('+fromRect.top+'px '+(window.innerWidth-fromRect.right)+'px '+(window.innerHeight-fromRect.bottom)+'px '+fromRect.left+'px)' : 'inset(50% 50% 50% 50%)' });
    document.body.appendChild(reveal);
    gsap.to(reveal, { clipPath:'inset(0% 0% 0% 0%)', duration:0.5, ease:'expo.out', onComplete:()=>reveal.remove() });
  }

  safe(generateNoise,'noise'); safe(initGrid,'grid'); safe(initNav,'nav');
  safe(initClock,'clock'); safe(initButtons,'buttons'); safe(initCursor,'cursor'); safe(initHeroStaffAug,'hero-staffaug');

  setTimeout(() => {
    safe(initCTA,'cta'); safe(initFooter,'footer');
    safe(initScrollIndicator,'scrollIndicator'); safe(registerReveals,'reveals'); safe(initTransitions,'transitions');
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { generateNoise(); ScrollTrigger.refresh(true); }, 250);
    });
    document.fonts.ready.then(() => { ScrollTrigger.refresh(); window.scrollTo(0,0); safe(auditPerformance,'performance'); });
  }, 100);
});
