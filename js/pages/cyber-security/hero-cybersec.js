/**
 * hero-cybersec.js — v4 Attack Surface Map Hero
 *
 * Animations:
 *  1. Entry choreography (scanline → eyebrow → headline words → stat → body → CTAs → panel)
 *  2. Attack vector counter (count-up 0→2,847 via GSAP, then periodic +1 increments)
 *  3. Hex grid canvas (Canvas 2D — hexagonal attack surface map with pulsing threats)
 *  4. Hero pin exit (scrub-driven scroll exit via ScrollTrigger)
 *
 * FIX 2026-06-17 — Canvas blank on mobile (iOS/Android) + intermittent desktop.
 * Root: canvas sized while GSAP panel was hidden (offsetWidth=0); IntersectionObserver
 * firing before first draw; missing DPR cap; no orientation-change resize handler.
 * Fixes: sizeCanvas() uses getBoundingClientRect + DPR cap; RAF starts immediately
 * with hasDrawnOnce guard; debounced resize handler; CSS opacity rule fixed.
 */

export function initHeroCybersec({ tier = 'high', fineHover = true, reducedMotion = false, isMobile = false } = {}) {

  /* ─── 0. CONSTANTS ─────────────────────────────────────────────── */

  const ACCENT = 'rgba(0, 170, 255,';
  const HEX_W = 32;
  const HEX_H = 28;
  const HEX_GAP_X = 4;
  const HEX_GAP_Y = 3;

  const LEVELS = {
    CLEAR: { alpha: 0.06, pulse: false },
    LOW: { alpha: 0.22, pulse: false },
    MEDIUM: { alpha: 0.45, pulse: false },
    HIGH: { alpha: 0.70, pulse: false },
    CRITICAL: { alpha: 0.95, pulse: true },
    ACTIVE: { alpha: 1.0, pulse: true },
    SCANNING: { alpha: 0.04, pulse: true },
  };

  const HEX_LAYOUT = [
    ['CLEAR', 'LOW', 'MEDIUM', 'LOW', 'CLEAR', 'LOW'],
    ['LOW', 'MEDIUM', 'HIGH', 'ACTIVE', 'MEDIUM', 'LOW', 'CLEAR'],
    ['CLEAR', 'MEDIUM', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    ['LOW', 'HIGH', 'ACTIVE', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    ['CLEAR', 'MEDIUM', 'HIGH', 'MEDIUM', 'ACTIVE', 'LOW'],
    ['SCANNING', 'LOW', 'MEDIUM', 'LOW', 'MEDIUM', 'SCANNING', 'CLEAR'],
    ['CLEAR', 'SCANNING', 'LOW', 'SCANNING', 'LOW', 'CLEAR'],
  ];

  /* ─── 1. CANVAS SETUP ──────────────────────────────────────────── */

  const canvas = document.getElementById('surface-hex-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  function hexPath(ctx, cx, cy, w, h) {
    const hw = w / 2, hh = h / 2, q = h / 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx + hw, cy - q);
    ctx.lineTo(cx + hw, cy + q);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - hw, cy + q);
    ctx.lineTo(cx - hw, cy - q);
    ctx.closePath();
  }

  let hexCells = [];

  function buildCells(canvasW, hw = HEX_W, hh = HEX_H, gx = HEX_GAP_X, gy = HEX_GAP_Y) {
    hexCells = [];
    const rowH = hh + gy;
    const colW = hw + gx;

    HEX_LAYOUT.forEach((row, ri) => {
      const isOffset = ri % 2 === 1;
      const rowX0 = isOffset
        ? (canvasW / 2) - ((row.length / 2) * colW) + (colW / 2)
        : (canvasW / 2) - ((row.length / 2) * colW) + (hw / 2) + (gx / 2);

      row.forEach((levelKey, ci) => {
        hexCells.push({
          cx: rowX0 + ci * colW,
          cy: 20 + ri * rowH + hh / 2,
          hw: hw,
          hh: hh,
          level: levelKey,
          baseAlpha: LEVELS[levelKey].alpha,
          pulse: LEVELS[levelKey].pulse,
          t: Math.random() * Math.PI * 2,
          scanFlash: 0,
        });
      });
    });
  }

  /* ─── 2. CANVAS SIZING (runs BEFORE GSAP timeline) ───────────── */

  function sizeCanvas() {
    // Use getBoundingClientRect for layout-accurate width — works even if
    // parent has CSS opacity:0 or transforms (unlike offsetWidth/clientWidth)
    const rect = wrap.getBoundingClientRect();
    const vw = window.innerWidth;
    let cssW = rect.width || wrap.clientWidth || 0;
    // Fallback if both are 0 (layout not applied yet)
    if (cssW <= 0) cssW = Math.min(vw - 32, 568);

    // Scale hex size down on small screens
    const hexScale = vw <= 375 ? 0.55
                   : vw <= 480 ? 0.65
                   : vw <= 640 ? 0.75
                   : 1.0;

    const scaledHexW = Math.floor(HEX_W * hexScale);
    const scaledHexH = Math.floor(HEX_H * hexScale);
    const scaledGapX = Math.max(2, Math.floor(HEX_GAP_X * hexScale));
    const scaledGapY = Math.max(2, Math.floor(HEX_GAP_Y * hexScale));

    const rows = HEX_LAYOUT.length;
    // Canvas height = hex grid rows only — NOT rect.height (which may include
    // padding/layout stretch). The hex grid has a known number of rows.
    const cssH = rows * (scaledHexH + scaledGapY) + 40;

    // DPR scaling, capped at 2× to avoid memory pressure on high-DPI mobile
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset before re-scaling
    ctx.scale(dpr, dpr);
    buildCells(cssW, scaledHexW, scaledHexH, scaledGapX, scaledGapY);
  }

  /* ─── 3. HEX GRID ANIMATION LOOP ─────────────────────────────── */

  let hasDrawnOnce = false;
  let rafId = null;
  let lastTime = performance.now();
  let scanPulseTimer = 0;

  function drawStaticGrid() {
    const dprScale = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dprScale;
    const h = canvas.height / dprScale;
    ctx.clearRect(0, 0, w, h);
    hexCells.forEach(cell => {
      hexPath(ctx, cell.cx, cell.cy, cell.hw || HEX_W, cell.hh || HEX_H);
      ctx.fillStyle = `${ACCENT} ${cell.baseAlpha})`;
      ctx.fill();
    });
  }

  function tick(now) {
    const dt = now - lastTime;
    lastTime = now;

    const dprScale = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dprScale;
    const h = canvas.height / dprScale;
    ctx.clearRect(0, 0, w, h);

    scanPulseTimer -= dt;
    if (scanPulseTimer <= 0) {
      const candidates = hexCells.filter(c => !c.pulse && c.level !== 'CLEAR');
      if (candidates.length) {
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        target.scanFlash = 0.35;
      }
      scanPulseTimer = 300 + Math.random() * 500;
    }

    hexCells.forEach(cell => {
      cell.t += (dt / 1000) * (cell.level === 'ACTIVE' ? 4.5 : 2.5);
      let alpha = cell.baseAlpha;
      if (cell.pulse) {
        alpha += Math.sin(cell.t) * 0.20;
        alpha = Math.max(0.05, Math.min(1.0, alpha));
      }
      if (cell.scanFlash > 0) {
        alpha += cell.scanFlash;
        cell.scanFlash = Math.max(0, cell.scanFlash - dt * 0.001);
      }
      const cellW = cell.hw || HEX_W;
      const cellH = cell.hh || HEX_H;
      hexPath(ctx, cell.cx, cell.cy, cellW, cellH);
      ctx.fillStyle = `${ACCENT} ${alpha.toFixed(3)})`;
      ctx.fill();

      if ((cell.level === 'CRITICAL' || cell.level === 'ACTIVE') && alpha > 0.5) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 200, 255, 0.5)';
        ctx.shadowBlur = 10;
        hexPath(ctx, cell.cx, cell.cy, cellW, cellH);
        ctx.fillStyle = `rgba(0, 220, 255, ${(alpha * 0.3).toFixed(3)})`;
        ctx.fill();
        ctx.restore();
      }
    });

    // After first successful draw, attach IntersectionObserver for pause/resume
    if (!hasDrawnOnce) {
      hasDrawnOnce = true;
      attachVisibilityPause();
    }

    rafId = requestAnimationFrame(tick);
  }

  function startHexRaf() {
    if (rafId) return; // already running
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  /* ─── IntersectionObserver — only attached AFTER first draw ──── */

  const heroEl = document.getElementById('hero-cybersec');

  function attachVisibilityPause() {
    if (!heroEl || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          startHexRaf();
        } else {
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }
      });
    }, { rootMargin: '200px', threshold: 0.1 });
    io.observe(heroEl);
  }

  /* ─── SIZE CANVAS + START DRAWING IMMEDIATELY ────────────────── */
  /*     This runs BEFORE the GSAP entry timeline, so the canvas is  */
  /*     already drawing even though the panel is still fading in.   */

  sizeCanvas();

  if (tier === 'low' || reducedMotion) {
    drawStaticGrid();
  } else {
    startHexRaf();
  }

  /* ─── BLUE BORDER SVG (hand-drawn loop path) ─────────────────── */

  let borderSvg = wrap.querySelector('.surface-border-svg');
  if (!borderSvg) {
    borderSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    borderSvg.setAttribute('class', 'surface-border-svg');
    borderSvg.setAttribute('viewBox', '0 0 200 200');
    borderSvg.setAttribute('preserveAspectRatio', 'none');
    borderSvg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;overflow:visible;';
    // Use a single hand-drawn style path around the perimeter
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 2,2 L 198,2 L 198,198 L 2,198 Z');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(0, 170, 255, 0.35)');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-dasharray', '784');
    path.setAttribute('stroke-dashoffset', '0');
    path.setAttribute('class', 'surface-border-path');
    borderSvg.appendChild(path);
    wrap.appendChild(borderSvg);
  }

  /* ─── 4. ENTRY CHOREOGRAPHY ─────────────────────────────────────── */

  // Entry choreography — use fromTo() in timeline so elements stay visible if anything fails
  if (reducedMotion) {
    gsap.set([
      '.hero-headline-cs .hw',
      '.hero-body-cs', '.hero-cta-row', '.hero-cybersec-panel',
    ], { opacity: 1, y: 0, x: 0 });
    // Visibility guard for reduced motion too
    gsap.set('.hero-cybersec-panel', { opacity: 1, visibility: 'visible' });
    gsap.set('#surface-hex-canvas', { opacity: 1 });
    return;
  }

  const tl = gsap.timeline({ delay: 0.05 });

  // Safety: Ensure visibility even if timeline is interrupted
  gsap.set('.hero-cybersec-panel', { opacity: 1, visibility: 'visible', x: 0 });
  gsap.set('#surface-hex-canvas', { opacity: 1 });

  // Step 0: Scanline sweep
  tl.to({ v: 0 }, {
    v: 1, duration: 0.4, ease: 'power2.out',
    onUpdate: function () {
      document.documentElement.style.setProperty('--scanline-opacity', (this.targets()[0].v * 0.08).toString());
    },
    onComplete: () => {
      gsap.to({ v: 0.08 }, {
        v: 0, duration: 0.6,
        onUpdate: function () {
          document.documentElement.style.setProperty('--scanline-opacity', this.targets()[0].v.toString());
        },
      });
    },
  });

  // Step 1: Headline word stagger
  tl.fromTo('.hero-headline-cs .hw', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out', stagger: 0.08 }, 0.1);
  // Step 2: Body
  tl.fromTo('.hero-body-cs', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.65);
  // Step 5: CTA row
  tl.fromTo('.hero-cta-row', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.95);
  // Step 6: Panel slide in — canvas is ALREADY drawing underneath at this point
  const panelX = window.innerWidth <= 768 ? 0 : 40;
  tl.fromTo('.hero-cybersec-panel', { opacity: 0, x: panelX }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 0.5);

  // Step 7: Blue border dashoffset animation (infinite loop)
  gsap.to('.surface-border-path', {
    strokeDashoffset: -784,
    duration: 4,
    ease: 'none',
    repeat: -1,
  });

  // Step 8: Hex pulse opacity loop via GSAP for safety (augments rAF canvas loop)
  // Force visibility after entry
  tl.call(() => {
    gsap.set('.hero-cybersec-panel', { opacity: 1, visibility: 'visible' });
    gsap.set('#surface-hex-canvas', { opacity: 1 });
  });

  /* ─── 5. CTA BUTTON WIRING ──────────────────────────────────────── */

  document.getElementById('cs-cta-audit')?.addEventListener('click', () => {
    const t = document.getElementById('cta-cybersec') || document.querySelector('.cta');
    if (t) gsap.to(window, { scrollTo: { y: t, offsetY: 56 }, duration: 1.0, ease: 'expo.inOut' });
  });
  document.getElementById('cs-cta-surface')?.addEventListener('click', () => {
    const t = document.getElementById('perimeter');
    if (t) gsap.to(window, { scrollTo: { y: t, offsetY: 56 }, duration: 1.0, ease: 'expo.inOut' });
  });

  /* ─── 6. HERO PIN EXIT ──────────────────────────────────────────── */

  // Use a standard GSAP scrub tween instead of onUpdate set() to avoid conflicts
  ScrollTrigger.matchMedia({
    "(min-width: 769px)": () => {
      gsap.to('.hero-cybersec-inner', {
        y: -80, opacity: 0, duration: 0.4, ease: 'power2.in',
        scrollTrigger: {
          trigger: '#hero-cybersec', start: 'top top', end: '+=120%',
          pin: true, scrub: 1, anticipatePin: 1,
          toggleActions: 'play none none none',
        },
      });
    },
    "(max-width: 768px)": () => {
      // No pinning on small mobile to avoid "invisible" jump/scroll issues
      gsap.to('.hero-cybersec-inner', {
        opacity: 0, y: -20,
        scrollTrigger: {
          trigger: '#hero-cybersec',
          start: 'bottom 90%',
          end: 'bottom 20%',
          scrub: true
        }
      });
    },
  });

  /* ─── 7. DEBOUNCED RESIZE HANDLER (orientation + desktop) ──────── */

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasRafRunning = rafId !== null;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      sizeCanvas();
      if (tier === 'low' || reducedMotion) {
        drawStaticGrid();
      } else if (wasRafRunning) {
        startHexRaf();
      }
    }, 120);
  }, { passive: true });

  // ResizeObserver — catches CSS-driven layout shifts that window.resize misses
  const ro = new ResizeObserver(() => {
    sizeCanvas();
    // If RAF is already running, the next tick() frame picks up the new size automatically.
    // For low-tier static, redraw once at the new size.
    if (tier === 'low' || reducedMotion) {
      drawStaticGrid();
    }
  });
  ro.observe(wrap);

} /* end initHeroCybersec */
