import { flags } from '../core/performance.js';

// js/sections/services.js
export function initServices() {
  const section   = document.getElementById('services');
  const container = document.querySelector('.services-container');
  if (!section || !container) return;

  const cards = Array.from(container.querySelectorAll('.service-card'));

  // ── Mobile handling: horizontal scroll with depth states ──────────
  if (flags.isMobile) {
    const section = document.getElementById('services');
    const container = document.querySelector('.services-container');
    // Move parent to allow scroll
    const track = container?.closest('.services-track') || container?.parentElement;
    if (track) track.style.overflowX = 'auto';
    container.style.scrollSnapType = 'x mandatory';
    container.style.scrollBehavior = 'smooth';
    cards.forEach(c => c.style.scrollSnapAlign = 'start');
    // Depth on scroll
    let lastActiveIdx = -1;
    function applyDepthMobile(progress) {
      const activeIdx = Math.round(progress * (cards.length - 1));
      if (activeIdx === lastActiveIdx) return;
      lastActiveIdx = activeIdx;
      cards.forEach((card, i) => {
        const isActive = i === activeIdx;
        if (isActive) {
          card.classList.add('is-active');
          gsap.to(card, { scale: 1.05, opacity: 1, filter: 'brightness(1) blur(0px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        } else {
          card.classList.remove('is-active');
          gsap.to(card, { scale: 1.0, opacity: 0.45, filter: 'brightness(0.7) blur(0px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        }
      });
    }
    let rafId;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        let closest = 0, minDist = Infinity;
        cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - center);
          if (d < minDist) { minDist = d; closest = i; }
        });
        applyDepthMobile(closest / (cards.length - 1));
      });
    };
    const scrollEl = track;
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(() => applyDepthMobile(0));
    initNavigation(cards);
    return;
  }

  // Wire up click navigation on all devices (desktop, tablet)
  initNavigation(cards);

  // Inject vertical scanline element into each card for activation sweep
  cards.forEach(card => {
    const vline = document.createElement('div');
    vline.className = 'card-scanline-v';
    card.appendChild(vline);
  });

  let lastActiveIdx = -1;

  // ── Apply depth, opacity, scale, and active class ───────────────────
  function applyDepth(progress) {
    const activeIdx = Math.round(progress * (cards.length - 1));
    
    if (activeIdx === lastActiveIdx) return;
    lastActiveIdx = activeIdx;

    cards.forEach((card, i) => {
      const isActive = i === activeIdx;
      
      if (isActive) {
        card.classList.add('is-active');
        gsap.to(card, {
          scale: 1.05,
          opacity: 1,
          filter: 'brightness(1) blur(0px)',
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        card.classList.remove('is-active');
        gsap.to(card, {
          scale: 1.0,
          opacity: 0.45,
          filter: 'brightness(0.7) blur(0px)',
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });
  }

  // ── Horizontal scroll: desktop uses GSAP pin, ≤1024px uses CSS scroll-snap ──
  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": function() {
      // Clear container x first
      gsap.set(container, { clearProps: 'x' });
      
      // Calculate scroll limits
      const cardWidth = cards[0].offsetWidth || 380;
      const gap = 20;
      const paddingLeft = 40;
      
      const getStartX = () => {
        const viewportWidth = section.clientWidth;
        return viewportWidth / 2 - (paddingLeft + cardWidth / 2);
      };
      
      const getEndX = () => {
        const viewportWidth = section.clientWidth;
        const offset = viewportWidth / 2 - (paddingLeft + cardWidth / 2);
        return offset - (cards.length - 1) * (cardWidth + gap);
      };

      gsap.fromTo(container, 
        { x: () => getStartX() },
        {
          x: () => getEndX(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${(cards.length - 1) * 600}`, // 600px of scroll per card
            pin: true,
            scrub: 1.0,
            id: 'services-pin',
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / (cards.length - 1),
              duration: { min: 0.2, max: 0.4 },
              delay: 0.05,
              ease: 'power2.out'
            },
            onUpdate(self) {
              applyDepth(self.progress);
            },
          }
        }
      );

      // Initialise depth at scroll start
      requestAnimationFrame(() => applyDepth(0));
    },

    "(max-width: 1024px)": function() {
      // CSS scroll-snap carousel — no GSAP pin. Container stays in-flow.
      // Cards scroll horizontally with snap. Content-based entry reveal via ScrollTrigger.
      gsap.set(container, { clearProps: 'x' }); // Release any GSAP transform
      container.style.width = '100%';
      container.style.overflowX = 'auto';
      container.style.scrollSnapType = 'x mandatory';
      container.style.scrollBehavior = 'smooth';
      cards.forEach(c => c.style.scrollSnapAlign = 'start');

      // Activate closest card on scroll
      let carouselRAF;
      const onCarouselScroll = () => {
        if (carouselRAF) cancelAnimationFrame(carouselRAF);
        carouselRAF = requestAnimationFrame(() => {
          const containerRect = section.getBoundingClientRect();
          const center = containerRect.left + containerRect.width / 2;
          let closestIdx = 0;
          let closestDist = Infinity;
          cards.forEach((card, i) => {
            const r = card.getBoundingClientRect();
            const cardCenter = r.left + r.width / 2;
            const dist = Math.abs(cardCenter - center);
            if (dist < closestDist) { closestDist = dist; closestIdx = i; }
          });
          applyDepth(closestIdx / (cards.length - 1));
        });
      };
      container.addEventListener('scroll', onCarouselScroll, { passive: true });

      // Fire once to set initial state
      requestAnimationFrame(() => applyDepth(0));
    }
  });

  // ── Mouse glow tracking ──────────────────────
  const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isHoverCapable) {
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width)  * 100}%`);
        card.style.setProperty('--my', `${((e.clientY - r.top)  / r.height) * 100}%`);
      }, { passive: true });
    });
  }
}

function initNavigation(cards) {
  // ── Service card navigation ─────────────────────────────────────
  cards.forEach((card, idx) => {
    const btn = card.querySelector('.explore-btn');
    const hasPage = !!SERVICE_PAGES[idx];

    if (!hasPage) {
      card.style.cursor = 'default';
      if (btn) {
        btn.style.cursor = 'default';
        btn.innerHTML = 'COMING SOON';
        btn.style.opacity = '0.5';
      }
      const hint = card.querySelector('.card-hint');
      if (hint) hint.innerHTML = 'COMING SOON';
    }

    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToService(card);
      });
    }

    card.addEventListener('click', () => {
      navigateToService(card);
    });
  });
}

// ── Depth state definitions ─────────────────────────────────────────────
const DEPTH_STATES = [
  // 0: active
  { scale: 1.00, opacity: 1,   y: 0,  filter: 'blur(0px)' },
  // 1: adjacent
  { scale: 0.88, opacity: 0.6, y: 14, filter: 'blur(0px)' },
  // 2: far
  { scale: 0.75, opacity: 0.3, y: 22, filter: 'blur(1px)' },
];

const DEPTH_STATES_TABLET = [
  { scale: 1.00, opacity: 1,   y: 0,  filter: 'blur(0px)' },
  { scale: 0.90, opacity: 0.6, y: 12, filter: 'blur(0px)' },
  { scale: 0.80, opacity: 0.3, y: 18, filter: 'blur(1px)' },
];

// ── Service navigation ─────────────────────────────────────────────────
const SERVICE_PAGES = {
  0: 'services/msp.html',
  1: 'services/devops.html',
  2: 'services/cyber-security.html',
  3: 'services/it-support.html',
  4: 'services/staff-augmentation.html',
};

function navigateToService(card) {
  const cards = Array.from(document.querySelectorAll('.service-card'));
  const idx   = cards.indexOf(card);
  if (idx === -1) return;

  const url = SERVICE_PAGES[idx];
  if (!url) {
    console.log(`Service ${idx + 1} is under development.`);
    return;
  }

  // Store card position for transition
  sessionStorage.setItem('edgenexus_from_card', JSON.stringify({
    index: idx,
    rect: card.getBoundingClientRect(),
  }));

  window.location.href = url;
}
