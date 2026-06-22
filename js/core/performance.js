// js/core/performance.js
// Device capability detection & tier assignment
// Source of truth for breakpoint/tier — import from here, don't re-implement.

// ── Static flags (snapshot at load) ─────────────────────────────────────
export const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;

// ── Breakpoint & tier resolution ───────────────────────────────────────
function getBreakpoint() {
  const w = window.innerWidth;
  if (w <= 480) return 'mobile-sm';
  if (w <= 768) return 'mobile';
  if (w <= 1024) return 'tablet';
  if (w <= 1439) return 'desktop';
  return 'desktop-lg';
}

function getTier(bp, rm, hh) {
  if (rm) return 'low';
  if (bp === 'mobile' || bp === 'mobile-sm') return 'low';
  if (bp === 'tablet') return 'mid';
  return hh ? 'high' : 'mid';
}

export let breakpoint = getBreakpoint();
export let tier = getTier(breakpoint, reducedMotion, hasHover);

// ── Legacy flags (backward compat — still used across codebase) ────────
export const flags = {
  isMobile:      breakpoint === 'mobile' || breakpoint === 'mobile-sm',
  isSmallMobile: breakpoint === 'mobile-sm',
  isTouch:       !hasHover,
  isReducedMotion: reducedMotion,
  isLowMemory,
};

// ── Re-evaluate on resize/orientation change (debounced) ────────────────
const listeners = new Set();
export function onTierChange(fn) { listeners.add(fn); }

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newBp = getBreakpoint();
    const newTier = getTier(newBp, reducedMotion, hasHover);
    if (newBp !== breakpoint || newTier !== tier) {
      breakpoint = newBp;
      tier = newTier;
      flags.isMobile = newBp === 'mobile' || newBp === 'mobile-sm';
      flags.isSmallMobile = newBp === 'mobile-sm';
      window.dispatchEvent(new CustomEvent('tierchange', { detail: { breakpoint, tier } }));
      listeners.forEach(fn => fn({ breakpoint, tier }));
    }
    ScrollTrigger.refresh(true);
  }, 250);
}, { passive: true });

// ── FPS capping per tier ─────────────────────────────────────────────
let fpsTarget = tier === 'low' ? 30 : tier === 'mid' ? 40 : 60;
export let frameInterval = 1000 / fpsTarget;

export function getFpsTarget() { return fpsTarget; }

// Allow GSAP to skip frames instead of catching up
if (window.gsap) {
  gsap.ticker.lagSmoothing(0);
}

window.addEventListener('tierchange', (e) => {
  const t = e.detail.tier;
  fpsTarget = t === 'low' ? 30 : t === 'mid' ? 40 : 60;
  frameInterval = 1000 / fpsTarget;
});
export function auditPerformance() {
  const { isMobile, isReducedMotion, isLowMemory } = flags;

  // 1. Disable all animations if user prefers reduced motion
  if (isReducedMotion) {
    gsap.globalTimeline.timeScale(1000); // Skip all timelines
    gsap.set('.reveal-clip',    { clipPath: 'none' });
    gsap.set('.reveal-fade',    { opacity: 1, y: 0 });
    gsap.set('.reveal',         { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 1 });
    gsap.set('.divider',        { width: 60 });
    ScrollTrigger.getAll().forEach(t => t.kill());
    // Hide DOM tree canvas (Web Dev hero)
    const domCanvas = document.getElementById('dom-tree-canvas');
    if (domCanvas) domCanvas.style.display = 'none';
  }

  // 2. Disable Three.js canvas on low-end devices (keep hero-canvas visible as requested)
  if (isLowMemory) {
    // Also hide DOM tree canvas (Web Dev hero) on low-memory devices
    const domCanvas = document.getElementById('dom-tree-canvas');
    if (domCanvas) domCanvas.style.display = 'none';
  }

  // 3. Disable pin sections on mobile (prevents iOS rubber-band conflicts)
  if (isMobile) {
    ScrollTrigger.getAll()
      .filter(t => t.vars?.pin)
      .forEach(t => t.kill());
  }
}
