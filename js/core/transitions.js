// js/core/transitions.js
// Atmospheric interstitial zones between sections.
// All effects are additive overlays — no existing section DOM is modified.

export function initTransitions() {
  createHeroToServices();
  createServicesToProcess();
  createProcessToSOC();
  createSOCTOCTA();
}

// ── 1. Hero → Services ────────────────────────────────────────────────
// A hairline rule draws left→right across the full viewport width (0.6s).
function createHeroToServices() {
  const services = document.getElementById('services');
  if (!services) return;

  const rule = document.createElement('div');
  Object.assign(rule.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '0%',
    height:        '1px',
    background:    'rgba(0, 170, 255, 0.18)',
    boxShadow:     '0 0 6px rgba(0, 170, 255, 0.25)',
    pointerEvents: 'none',
    zIndex:        '998',
    opacity:       '0',
  });
  document.body.appendChild(rule);

  ScrollTrigger.create({
    trigger: services,
    start:   'top 100%',
    onEnter() {
      gsap.killTweensOf(rule);
      gsap.set(rule, { opacity: 1, width: '0%' });
      gsap.to(rule, {
        width: '100%',
        duration: 0.6,
        ease: 'expo.out',
        onComplete() {
          gsap.to(rule, { opacity: 0, duration: 0.5, delay: 0.15 });
        },
      });
    },
    onEnterBack() {
      gsap.killTweensOf(rule);
      gsap.set(rule, { opacity: 0 });
    },
  });
}

// ── 2. Services → Process ─────────────────────────────────────────────
// Blueprint-blue vertical scan line sweeps left→right (200ms, expo).
function createServicesToProcess() {
  const process = document.getElementById('process');
  if (!process) return;

  const scan = document.createElement('div');
  Object.assign(scan.style, {
    position:      'fixed',
    top:           '0',
    left:          '-4px',
    width:         '3px',
    height:        '100vh',
    background:    'rgba(0, 170, 255, 0.55)',
    boxShadow:     '0 0 14px rgba(0, 170, 255, 0.9)',
    pointerEvents: 'none',
    zIndex:        '998',
    opacity:       '0',
  });
  document.body.appendChild(scan);

  ScrollTrigger.create({
    trigger: process,
    start:   'top 100%',
    onEnter() {
      gsap.killTweensOf(scan);
      gsap.set(scan, { opacity: 1, left: '-4px' });
      gsap.to(scan, {
        left:     '100vw',
        duration: 0.22,
        ease:     'none',
        onComplete() { gsap.set(scan, { opacity: 0 }); },
      });
    },
    onEnterBack() {
      gsap.killTweensOf(scan);
      gsap.set(scan, { opacity: 0 });
    },
  });
}

// ── 3. Process → SOC ────────────────────────────────────────────────
// Power surge: fullscreen blackout (120ms) → hold (80ms) → flash → fade.
// Fires once, slightly before the SOC counter trigger (top 65%).
function createProcessToSOC() {
  const soc = document.getElementById('soc');
  if (!soc) return;

  let triggered = false;

  ScrollTrigger.create({
    trigger: soc,
    start:   'top 90%',
    onEnter() {
      if (triggered) return;
      triggered = true;

      const veil = document.createElement('div');
      Object.assign(veil.style, {
        position:      'fixed',
        inset:         '0',
        background:    '#000',
        pointerEvents: 'none',
        zIndex:        '500',
        opacity:       '0',
      });
      document.body.appendChild(veil);

      gsap.timeline()
        .to(veil, { opacity: 1,   duration: 0.12, ease: 'power2.in'  })
        .to(veil, { opacity: 0,   duration: 0,    delay: 0.08        }) // hard cut
        .to(veil, { opacity: 0.3, duration: 0.05                     }) // flash
        .to(veil, { opacity: 0,   duration: 0.22, ease: 'power2.out' })
        .call(() => veil.remove());
    },
  });
}

// ── 4. SOC → CTA ───────────────────────────────────────────────────
// Grid fades to near-invisible as CTA enters; restores on exit.
// Background subtly darkens (#060810 → #030406).
function createSOCTOCTA() {
  const cta  = document.getElementById('cta');
  const grid = document.getElementById('grid-overlay');
  if (!cta) return;

  ScrollTrigger.create({
    trigger: cta,
    start:   'top 80%',
    onEnter() {
      if (grid) gsap.to(grid, { opacity: 0.12, duration: 1.1, ease: 'power2.inOut' });
      gsap.to(document.body, {
        backgroundColor: '#030406',
        duration: 1.4,
        ease: 'power1.inOut',
      });
    },
    onLeaveBack() {
      if (grid) gsap.to(grid, { opacity: 1, duration: 0.7, ease: 'power1.out' });
      gsap.to(document.body, {
        backgroundColor: '#060810',
        duration: 0.8,
        ease: 'power1.out',
      });
    },
    onLeave() {
      // Scrolled past CTA into footer — restore
      if (grid) gsap.to(grid, { opacity: 1, duration: 0.7, ease: 'power1.out' });
    },
  });
}
