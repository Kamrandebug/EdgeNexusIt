/* ============================================================
   PROCESS — Split Panel: sticky left + scrolling right cards
   Fully responsive: mobile-sm → mobile → tablet → desktop → desktop-lg
   ============================================================ */

import { onTierChange } from '../core/performance.js';

export function initProcess() {
  const section   = document.getElementById('process');
  const cards     = [...document.querySelectorAll('.process-card')];
  const nodes     = [...document.querySelectorAll('.pipeline-node')];
  const fillLine  = document.getElementById('pipeline-fill');

  if (!section || !cards.length || !nodes.length) return;

  const mobileBp  = window.matchMedia('(max-width: 768px)');
  let isMobile    = mobileBp.matches;
  let scrollBound = false;
  let scrollHandler = null;
  let mobileSTs   = [];

  /* ── 1. Entry animation for left panel (eyebrow + headline + track) ── */
  const leftInner = section.querySelector('.process-left-inner');

  gsap.set(leftInner, { opacity: 0, y: 30 });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(leftInner, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    },
  });

  /* ── 2. Card reveal — each card fades in as it enters viewport ── */
  if (!isMobile) {
    cards.forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
          });
        },
      });
    });
  }

  /* ── 3. Active node + fill line ── */

  function getActiveCard() {
    if (!cards.length) return 0;
    const mid = window.innerHeight / 2;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardMid = rect.top + rect.height / 2;
      const dist = Math.abs(cardMid - mid);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function updatePipeline(activeIdx) {
    nodes.forEach((node, i) => {
      node.classList.remove('active', 'done');
      if (i < activeIdx) node.classList.add('done');
      if (i === activeIdx) node.classList.add('active');
    });

    const progress = nodes.length > 1 ? activeIdx / (nodes.length - 1) : 0;

    if (isMobile) {
      // Horizontal line on mobile — animate scaleX
      gsap.to(fillLine, {
        scaleX: progress,
        scaleY: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      // Vertical line on desktop — animate scaleY
      gsap.to(fillLine, {
        scaleY: progress,
        scaleX: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    cards.forEach((card, i) => {
      card.classList.toggle('active', i === activeIdx);
    });
  }

  // Desktop scroll listener (throttled)
  function createScrollHandler() {
    let ticking = false;
    return function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          updatePipeline(getActiveCard());
        }
        ticking = false;
      });
    };
  }

  // Kill all mobile ScrollTriggers
  function killMobileTriggers() {
    mobileSTs.forEach(st => st.kill());
    mobileSTs = [];
  }

  // Setup mobile: node activations via ScrollTrigger on each card
  function setupMobile() {
    killMobileTriggers();
    cards.forEach((card, i) => {
      const st = ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        once: true,
        onEnter: () => updatePipeline(i),
      });
      mobileSTs.push(st);
    });
  }

  // Setup desktop: scroll-driven pipeline
  function setupDesktop() {
    killMobileTriggers();
    if (!scrollBound) {
      scrollHandler = createScrollHandler();
      window.addEventListener('scroll', scrollHandler, { passive: true });
      scrollBound = true;
    }
    // refresh initial state
    updatePipeline(getActiveCard());
  }

  // Tear down desktop scroll listener
  function teardownDesktop() {
    if (scrollBound && scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollBound = false;
      scrollHandler = null;
    }
  }

  // ── Setup based on current mode ──
  function applyMode() {
    if (isMobile) {
      teardownDesktop();
      setupMobile();
    } else {
      killMobileTriggers();
      setupDesktop();
    }
  }

  applyMode();

  // ── Watch for resize / orientation changes ──
  mobileBp.addEventListener('change', (e) => {
    isMobile = e.matches;
    applyMode();

    // Refresh cards visibility — mobile shows all, desktop uses reveal
    if (isMobile) {
      gsap.set(cards, { opacity: 1, y: 0, clearProps: 'all' });
    }
  });

  // Also listen to tier changes (catches resize debounced)
  onTierChange(() => {
    if (isMobile !== mobileBp.matches) {
      isMobile = mobileBp.matches;
      applyMode();
    }
  });
}
