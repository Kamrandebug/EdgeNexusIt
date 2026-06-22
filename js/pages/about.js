const PAGE_ID = 'about';

import { injectLayout } from '../components/shared-layout.js';
injectLayout();

import { initNav } from '../components/nav.js';
import { initClock } from '../components/clock.js';
import { initCursor } from '../core/cursor.js';
import { generateNoise } from '../core/noise.js';
import { initGrid } from '../core/grid.js';
import { initButtons } from '../components/buttons.js';
import { initScrollIndicator } from '../core/scroll-indicator.js';
import { registerReveals } from '../core/reveals.js';
import { initTransitions } from '../core/transitions.js';
import { auditPerformance } from '../core/performance.js';
import { initFooter } from '../sections/footer.js';
import { initCTA } from '../sections/cta.js';

if (window.gsap && window.ScrollTrigger && window.ScrollToPlugin) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}
if (window.gsap) {
  gsap.ticker.lagSmoothing(0);
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) gsap.ticker.fps(30);
}

const safe = (fn, name) => { try { fn(); } catch (e) { console.warn('[about]', name, e); } };

window.addEventListener('load', () => {
  if (!window.gsap) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Ensure everything is visible FIRST (no blank state) ─────
  document.querySelectorAll('.about-metric-card, .about-value, .about-cinema, .terminal, .about-hero-scroll').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.visibility = 'visible';
    el.style.clipPath = 'none';
  });

  if (reducedMotion) {
    gsap.globalTimeline.timeScale(1000);
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
    safe(initNav, 'nav'); safe(initClock, 'clock'); safe(initButtons, 'buttons');
    window.scrollTo(0, 0); return;
  }
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  safe(generateNoise, 'noise');
  safe(initGrid, 'grid');
  safe(initNav, 'nav');
  safe(initClock, 'clock');
  safe(initCursor, 'cursor');
  safe(initButtons, 'buttons');
  safe(initCTA, 'cta');

  // ── HERO ENTRY (no from() on scroll — inline timeline) ────
  const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  heroTl.from('.about-eyebrow', { opacity: 0, y: 20, duration: 0.6, delay: 0.2 })
    .from('.about-headline', { opacity: 0, y: 80, scale: 0.95, duration: 1.2 }, '-=0.3')
    .from('.about-sub', { opacity: 0, y: 30, duration: 0.8 }, '-=0.6')
    .from('.about-stat', { opacity: 0, y: 40, duration: 0.8, stagger: 0.15 }, '-=0.4');

  // ── Stat counters on scroll ──────────────────────────────
  statsLoop();
  function statsLoop() {
    const stats = document.querySelectorAll('.about-stat-value');
    if (!stats.length) return;
    stats.forEach(el => {
      const target = parseFloat(el.dataset.target);
      gsap.fromTo(el, { textContent: '0' }, {
        textContent: target,
        duration: 2.5,
        ease: 'power2.out',
        snap: { textContent: target >= 100 ? 1 : 0.01 },
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ── Scroll-triggered reveals (once revealed, stay visible) ────
  function fadeInBatch(selector, opts = {}) {
    ScrollTrigger.batch(selector, {
      start: 'top 88%',
      ...opts,
      onEnter: batch => gsap.fromTo(batch,
        { opacity: 0, y: 30, scale: opts.scale || 1 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
      ),
      onEnterBack: batch => gsap.fromTo(batch,
        { opacity: 0, y: -20, scale: opts.scale || 1 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
      )
    });
  }
  fadeInBatch('.about-metric-card');

  // ── VALUES HORIZONTAL SCROLL CAROUSEL ────────────
  function initValuesCarousel() {
    const container = document.getElementById('values-container');
    const cards = container?.querySelectorAll('.about-value');
    if (!container || !cards?.length) return;

    const VAL_DEPTH = [
      { scale: 1.00, opacity: 1,   y: 0,  filter: 'blur(0px)' },
      { scale: 0.88, opacity: 0.6, y: 14, filter: 'blur(0px)' },
      { scale: 0.75, opacity: 0.3, y: 22, filter: 'blur(1px)' },
    ];

    function applyDepth(progress) {
      const activeIdx = Math.round(progress * (cards.length - 1));
      cards.forEach((card, i) => {
        const dist = Math.abs(i - activeIdx);
        const state = dist >= 2 ? VAL_DEPTH[2] : VAL_DEPTH[dist];
        card.classList.toggle('is-active', dist === 0);
        gsap.to(card, { ...state, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
    }

    ScrollTrigger.matchMedia({
      "(min-width: 769px)": function() {
        gsap.set(container, { clearProps: 'x' });
        const getStartX = () => {
          const section = document.getElementById('about-values');
          const vpW = section.clientWidth;
          return vpW / 2 - (40 + (cards[0].offsetWidth || 320) / 2);
        };
        const getEndX = () => {
          const vpW = cards[0].closest('#about-values').clientWidth;
          const offset = vpW / 2 - (40 + (cards[0].offsetWidth || 320) / 2);
          return offset - (cards.length - 1) * ((cards[0].offsetWidth || 320) + 20);
        };
        gsap.fromTo(container,
          { x: () => getStartX() },
          {
            x: () => getEndX(),
            ease: 'none',
            scrollTrigger: {
              trigger: '#about-values',
              start: 'top top',
              end: `+=${(cards.length - 1) * 500}`,
              pin: true,
              scrub: 1.0,
              id: 'values-pin',
              anticipatePin: 1,
              invalidateOnRefresh: true,
              snap: { snapTo: 1 / (cards.length - 1), duration: { min: 0.2, max: 0.4 }, delay: 0.05, ease: 'power2.out' },
              onUpdate: self => applyDepth(self.progress),
            }
          }
        );
        requestAnimationFrame(() => applyDepth(0));
      },
      "(max-width: 768px)": function() {
        gsap.set(container, { clearProps: 'x' });
        const track = container.closest('.values-track') || container.parentElement;
        track.style.overflowX = 'auto';
        container.style.scrollSnapType = 'x mandatory';
        container.style.scrollBehavior = 'smooth';
        cards.forEach(c => c.style.scrollSnapAlign = 'start');
        // Simple scroll-based depth on mobile
        let rafId;
        const onScroll = () => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            const section = document.getElementById('about-values');
            const rect = section.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            let closest = 0, minDist = Infinity;
            cards.forEach((card, i) => {
              const r = card.getBoundingClientRect();
              const d = Math.abs(r.left + r.width / 2 - center);
              if (d < minDist) { minDist = d; closest = i; }
            });
            applyDepth(closest / (cards.length - 1));
          });
        };
        track.addEventListener('scroll', onScroll, { passive: true });
        requestAnimationFrame(() => applyDepth(0));
      }
    });
  }
  initValuesCarousel();

  // ── HIRE OUR EXPERTS ──────────────────────────────────
  initExpertsSection();

  // ── HIRE OUR EXPERTS SECTION ────────────────────────────
  function initExpertsSection() {
    const section = document.getElementById('about-experts');
    if (!section) return;
    const eyebrow = section.querySelector('.about-experts__eyebrow');
    const divider = section.querySelector('.about-experts__divider');
    const title = section.querySelector('.about-experts__title');
    const subtitle = section.querySelector('.about-experts__subtitle');
    const cards = section.querySelectorAll('.expert-card');
    const filters = section.querySelectorAll('.experts-filter');
    const hireLinks = section.querySelectorAll('.js-hire-now');

    if (typeof gsap !== 'undefined' && gsap.to) {
      gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 85%', once: true } });
      gsap.to(divider, { scaleX: 1, duration: 0.8, ease: 'expo.out', delay: 0.1, scrollTrigger: { trigger: section, start: 'top 85%', once: true } });
      gsap.fromTo([title, subtitle], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12, delay: 0.15, scrollTrigger: { trigger: section, start: 'top 85%', once: true } });
      gsap.fromTo(cards, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08, scrollTrigger: { trigger: section.querySelector('.about-experts__track'), start: 'top 88%', once: true } });
    } else {
      [eyebrow, divider, title, subtitle, ...cards].forEach(el => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
      if (divider) divider.style.transform = 'scaleX(1)';
    }

    // Filter tabs
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(f => { f.classList.remove('experts-filter--active'); f.setAttribute('aria-selected', 'false'); });
        btn.classList.add('experts-filter--active');
        btn.setAttribute('aria-selected', 'true');
        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const category = card.dataset.category;
          const show = (filter === 'all') || (category === filter);
          if (typeof gsap !== 'undefined' && gsap.to) {
            if (show) {
              card.removeAttribute('hidden');
              gsap.fromTo(card, { opacity: 0, scale: 0.96, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' });
            } else {
              gsap.to(card, { opacity: 0, scale: 0.95, y: 8, duration: 0.2, ease: 'power2.in', onComplete: () => card.setAttribute('hidden', '') });
            }
          } else {
            if (show) { card.removeAttribute('hidden'); card.style.opacity = '1'; card.style.transform = 'none'; }
            else { card.setAttribute('hidden', ''); }
          }
        });
      });
    });

    // Hire Now smooth-scroll
    hireLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector('#cta');
        if (!target) return;
        if (typeof gsap !== 'undefined' && gsap.to && typeof ScrollToPlugin !== 'undefined') {
          gsap.to(window, { duration: 1.1, scrollTo: { y: target, offsetY: 56 }, ease: 'expo.inOut' });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── Hero particle canvas ──────────────────────────────
  const canvas = document.getElementById('about-hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3
    }));
    function animateDots() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0 || d.x > canvas.width) d.dx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.dy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 170, 255, 0.25)';
        ctx.fill();
      });
      dots.forEach((a, i) => {
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 170, 255, ${(1 - d / 150) * 0.08})`;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animateDots);
    }
    animateDots();
  }

  setTimeout(() => {
    safe(initFooter, 'footer');
    safe(initScrollIndicator, 'scrollIndicator');
    safe(registerReveals, 'reveals');
    safe(initTransitions, 'transitions');
  }, 100);

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
    window.scrollTo(0, 0);
    safe(auditPerformance, 'performance');
  });
});
