# PRODUCTION PROMPT — EdgeNexus IT
## Batch 21 — Particle Brain Hero (2-Column, Reference-Matched)
### File: `batch21-particle-brain-2col.md`

---

## CONTEXT — WHAT THE OWNER WANTS

Reference screenshot provided. The owner wants:
- **2-column layout**: copy LEFT (40%), single brain panel RIGHT (60%)
- **NO wheel canvas. NO 3-column grid. NO HUD. NO convergence ray.**
- The brain is a **particle cloud shaped like a brain silhouette** —
  thousands of tiny square/dot particles densely packed in the center,
  diffuse/scattered at the edges, slowly rotating on Y-axis.
- A **holographic platform base** at the bottom of the panel:
  2–3 concentric glowing cyan rings on a dark circular disc.
- A **light beam cone** (cyan/white) shooting upward from the platform
  center into the bottom of the brain.
- The brain **floats** above the platform, connected only by the beam.
- Label: "NEURAL · HOLOGRAM" at bottom center of the panel.
- Dark space background with sparse white stars.

This replaces ALL previous hero-ai canvas work (3-col, neurons, wheel).

---

## ⚠️ STRICT RULES

1. Read ALL three target files completely before writing anything.
2. DO NOT touch anything outside the three target files.
3. DO NOT modify Capabilities, Automation Flow, Impact Metrics, CTA, Footer.
4. Pure Canvas 2D only. No Three.js, no D3, no new CDNs.
5. Preserve all CSS tokens. No hardcoded colors that have token equivalents.
6. No preloader on this page. Boots on `window load` (page-main.js handles that).
7. Production is live — code must be crash-safe and responsive.

---

## TARGET FILES

```
K:\EdgeNexusIt\services\ai-automation.html
K:\EdgeNexusIt\styles\pages\ai-automation\hero-ai.css
K:\EdgeNexusIt\js\pages\ai-automation\hero-ai.js
```

---

## DO NOT TOUCH

```
js/pages/ai-automation/page-main.js
js/pages/ai-automation/capabilities.js
js/pages/ai-automation/automation-flow.js
js/pages/ai-automation/impact-metrics.js
styles/pages/ai-automation/capabilities.css
styles/pages/ai-automation/automation-flow.css
styles/pages/ai-automation/impact-metrics.css
js/components/shared-layout.js
js/sections/cta.js
styles/tokens.css
All other pages
```

---

## SECTION 1 — HTML (`services/ai-automation.html`)

### Remove completely from hero:
- All old canvas panel divs (brain, wheel, hologram)
- All old canvas elements (`#canvas-brain`, `#canvas-wheel`, `#canvas-ambient`)
- Convergence ray div
- Any `<img>` tags (Brain.png references)
- The 3-column wrapper structure

### New hero HTML — EXACT STRUCTURE:

```html
<section id="hero-ai" class="hero-ai" aria-label="AI Automation Hero">
  <div class="hero-ai-inner">

    <!-- LEFT: Copy block — preserve ALL inner content exactly as-is -->
    <div class="hero-ai-copy">
      <!-- Keep eyebrow, h1, p, CTAs exactly as they currently are. DO NOT CHANGE. -->
    </div>

    <!-- RIGHT: Single particle brain panel -->
    <div class="hero-ai-visual" aria-hidden="true">
      <canvas id="canvas-brain-particle"></canvas>
      <span class="hero-ai-panel-label">NEURAL · HOLOGRAM</span>
    </div>

  </div>
</section>
```

---

## SECTION 2 — CSS (`hero-ai.css`)

Full file rewrite. Replace entire content with:

```css
/* ============================================================
   HERO AI — Particle Brain  (2-column)
   copy LEFT | particle brain canvas RIGHT
   ============================================================ */

.hero-ai {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: var(--nh);
  background: var(--bg, #000);
}

/* ── 2-column grid ─────────────────────────────────────────── */
.hero-ai-inner {
  width: 100%;
  max-width: var(--cw, 1440px);
  margin: 0 auto;
  padding: 0 clamp(24px, 4vw, 64px);
  display: grid;
  grid-template-columns: 40fr 60fr;
  align-items: center;
  gap: clamp(24px, 4vw, 60px);
  min-height: 88vh;
}

/* ── Copy (left) ────────────────────────────────────────────── */
.hero-ai-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(14px, 2vw, 26px);
}

/* ── Visual panel (right) ───────────────────────────────────── */
.hero-ai-visual {
  position: relative;
  width: 100%;
  /* Square container so canvas fills correctly */
  aspect-ratio: 1 / 1;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-ai-visual canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* ── Panel label ────────────────────────────────────────────── */
.hero-ai-panel-label {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: rgba(0, 180, 255, 0.50);
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  z-index: 3;
}

/* ── Copy text styles ───────────────────────────────────────── */
.hero-ai-eyebrow {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: clamp(10px, 1.1vw, 13px);
  letter-spacing: 0.20em;
  color: var(--accent, #00aaff);
  text-transform: uppercase;
  clip-path: inset(0 100% 0 0);
}

.hero-ai-headline {
  font-family: var(--font-display, 'Outfit', sans-serif);
  font-size: clamp(40px, 6.5vw, 90px);
  font-weight: 900;
  line-height: 1.0;
  letter-spacing: -0.025em;
  color: var(--t1, #fff);
  display: flex;
  flex-direction: column;
}

.hero-ai-headline .headline-word {
  display: block;
  clip-path: inset(0 100% 0 0);
}

.hero-ai-headline .headline-accent {
  color: var(--accent, #00aaff);
  text-shadow:
    0 0 20px rgba(0, 170, 255, 0.45),
    0 0 60px rgba(0, 170, 255, 0.20);
}

.hero-ai-accent-line {
  width: 100%;
  max-width: 200px;
  height: 2px;
  background: linear-gradient(to right, var(--accent, #00aaff), transparent);
  transform-origin: left center;
  transform: scaleX(0);
}

.hero-ai-body {
  font-size: clamp(13px, 1.3vw, 16px);
  line-height: 1.65;
  color: var(--t2, rgba(255,255,255,0.60));
  max-width: 360px;
  opacity: 0;
}

.hero-ai-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  opacity: 0;
}

/* ── Ambient right-side atmosphere ──────────────────────────── */
.hero-ai::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 65%; height: 100%;
  background: radial-gradient(
    ellipse 55% 60% at 72% 48%,
    rgba(0, 120, 255, 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

/* ── RESPONSIVE ─────────────────────────────────────────────── */

@media (max-width: 1200px) {
  .hero-ai-inner { grid-template-columns: 42fr 58fr; }
}

@media (max-width: 900px) {
  .hero-ai-inner {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    min-height: unset;
    padding-top: 32px;
    padding-bottom: 48px;
    gap: 24px;
  }
  .hero-ai-copy   { order: 1; }
  .hero-ai-visual { order: 2; aspect-ratio: 1/1; max-height: 60vw; min-height: 280px; }
}

@media (max-width: 640px) {
  .hero-ai-inner  { padding: 0 20px; padding-top: 24px; padding-bottom: 40px; }
  .hero-ai-visual { max-height: 80vw; min-height: 240px; }
  .hero-ai-headline { font-size: clamp(34px, 9vw, 58px); }
}

@media (max-width: 380px) {
  .hero-ai-visual { max-height: 260px; min-height: 200px; }
}

/* ── Reduced motion ─────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .hero-ai-visual canvas { opacity: 0.6; }
}
```

---

## SECTION 3 — JS (`hero-ai.js`)

Full file rewrite. Export: `export function initHeroAi(tier, isMobile, reducedMotion)`

---

### VISUAL SPEC — READ THIS BEFORE CODING THE CANVAS

```
WHAT THE CANVAS MUST RENDER (matching reference image):

┌─────────────────────────────────────────────────────────┐
│                    CANVAS (square)                       │
│                                                         │
│   ·  ·  ·  *  ·  *    ← sparse white star particles    │
│  *     ·      ·                                         │
│                                                         │
│         ░░▒▒███████▒▒░░                                 │
│       ░▒████████████████▒░    ← BRAIN PARTICLE CLOUD   │
│      ▒███████████████████▒     thousands of tiny dots   │
│     ▒██████████████████████     dense center            │
│      ▒███████████████████▒     diffuse edges            │
│       ░▒████████████████▒░     slowly rotates Y-axis   │
│         ░░▒▒███████▒▒░░        floats up/down           │
│               │                                         │
│           ░░░░│░░░░            ← LIGHT BEAM CONE        │
│         ░░░░░░│░░░░░░           white-cyan cone         │
│       ░░░░░░░░│░░░░░░░░         wider at platform       │
│     ░░░░░░░░░░│░░░░░░░░░░       narrower at brain       │
│   ────────────●────────────  ← PLATFORM CENTER          │
│   ════════════════════════   ← RING 1 (bright cyan)     │
│     ══════════════════════   ← RING 2 (medium cyan)     │
│       ════════════════════   ← RING 3 (dim cyan)        │
│                                                         │
│              NEURAL · HOLOGRAM                          │
└─────────────────────────────────────────────────────────┘

BRAIN PARTICLE SYSTEM:
  - 4000–6000 particles total (tier: high=6000, mid=4000, low=2000)
  - Each particle placed on a 3D brain-shaped volume:
      * The brain volume is an ELLIPSOID: wider than tall, roughly 1.45:1 ratio
      * Particles denser toward the center of the ellipsoid
      * Outer shell particles are sparse and smaller
  - Y-axis rotation: rotAngle increments each frame
    Project: x2d = cx + particle.x * cos(rotAngle) - particle.z * sin(rotAngle)
             y2d = cy + particle.y (no Y-axis change during Y-rotation)
  - PARTICLE APPEARANCE:
      * Shape: tiny squares (ctx.fillRect) 1–2.5px wide — this gives the
               "digital/pixel" feel from the reference image, not round dots
      * Color: mostly white/light cyan (#d0eeff to #ffffff)
      * Alpha: based on distance from center (outer = more transparent)
               + depth (z-depth: front particles = brighter, back = dimmer)
               + individual shimmer (Math.sin(time + particle.phase))
      * Outer edge particles: smaller, more alpha variation (more "scattered" look)
  - SLOW Y-ROTATION: 0.004–0.006 rad/frame (tier-based)
  - FLOAT: whole brain group offset by Math.sin(time * 0.6) * floatAmp (8–12px)
  - ENTRY ANIMATION: particles fly in from random positions over 1.2s
    (each particle lerps from a random spawn point to its final brain position)

BRAIN SHAPE — HOW TO DEFINE THE ELLIPSOID:
  Use a rejection-sampling or Fibonacci approach to fill a 3D ellipsoid.
  The brain silhouette in the reference has:
  - Wider horizontally (left-right): scale X by 1.0
  - Slightly shorter vertically: scale Y by 0.72
  - Depth (Z): scale Z by 0.80
  - Slight upward bulge: the top of the brain is more rounded
  - Bottom is flatter (brainstem region)
  To simulate the "brain shape" vs a perfect sphere:
  Apply a subtle sinusoidal surface perturbation:
    r_perturbed = r_base * (1 + 0.08 * sin(4 * theta) * cos(2 * phi))
  where theta = azimuthal angle, phi = polar angle.
  This adds the natural brain "lobe" irregularity.

LIGHT BEAM CONE:
  - Origin: platform center (bottom-center of canvas, ~82% down)
  - Points upward to: bottom of brain cloud (~55% down)
  - Shape: triangle/trapezoid — narrow at brain bottom, wide at platform
  - Rendered as: ctx.createLinearGradient (top→bottom)
    Top (brain bottom): rgba(180, 240, 255, 0.0)  ← fully transparent at brain
    Middle:             rgba(100, 220, 255, 0.08) ← faint glow mid
    Bottom (platform):  rgba(60, 200, 255, 0.18)  ← brighter at source
  - Also add a central bright line: 1px white line from platform to brain
    with ctx.shadowBlur = 8, rgba(255,255,255,0.4)
  - Beam width at platform: 30% of canvas width
  - Beam width at brain:    8% of canvas width (tapers to point)
  - Draw as a filled quadrilateral (beginPath, moveTo 4 corners, fill)

PLATFORM RINGS:
  - Platform is a flat ellipse at y ≈ 82% of canvas height
  - 3 concentric rings (ellipses, not circles — foreshortened to look 3D)
  - Each ring: ellipse with xRadius proportional to ring size,
               yRadius = xRadius * 0.22 (flat perspective)
  - Ring 1 (innermost):  xR = 12% canvas width,  strokeStyle rgba(0,220,255,0.90), lineWidth 2.5
  - Ring 2 (middle):     xR = 22% canvas width,  strokeStyle rgba(0,200,255,0.60), lineWidth 1.5
  - Ring 3 (outermost):  xR = 34% canvas width,  strokeStyle rgba(0,180,255,0.35), lineWidth 1.0
  - All rings have a slow clockwise rotation (tick marks move)
  - Inner ring has tick marks: 24 small lines radiating outward
  - Middle ring: 36 tick marks
  - Platform disc fill: very dark circle, rgba(10, 20, 40, 0.6), same xR as ring 3
  - Platform center node: small bright cyan circle r=4px at platform center

STARS:
  - 30–50 tiny white dots scattered in upper 70% of canvas
  - Alpha: 0.1–0.4, size: 0.5–1.5px
  - Twinkle: slow Math.sin oscillation per star, period 2–4s

RENDERING ORDER (back to front):
  1. clearRect (full clear each frame — no ghosting)
  2. Stars
  3. Light beam cone
  4. Brain particles (sorted by Z depth, back rendered first)
  5. Platform disc + rings + center node
  6. Any outer glow/atmosphere

TIER CONFIG:
  high: { particles: 6000, rotSpeed: 0.005, floatAmp: 10 }
  mid:  { particles: 4000, rotSpeed: 0.004, floatAmp:  9 }
  low:  { particles: 2000, rotSpeed: 0.003, floatAmp:  8 }
```

---

### FULL JS FILE:

```javascript
/**
 * hero-ai.js — Particle Brain Hero
 * Single canvas: particle brain cloud + platform rings + light beam
 *
 * Called from: js/pages/ai-automation/page-main.js
 * Signature:   initHeroAi(tier, isMobile, reducedMotion)
 */

export function initHeroAi(tier, isMobile, reducedMotion) {

  /* ── Tier config ── */
  const CFG = {
    high: { particles: 6000, rotSpeed: 0.005, floatAmp: 10, ringTicks: true  },
    mid:  { particles: 4000, rotSpeed: 0.004, floatAmp:  9, ringTicks: true  },
    low:  { particles: 2000, rotSpeed: 0.003, floatAmp:  8, ringTicks: false },
  }[tier] || { particles: 4000, rotSpeed: 0.004, floatAmp: 9, ringTicks: true };

  /* ── Canvas setup ── */
  const canvas = document.getElementById('canvas-brain-particle');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, cx, platformY, brainCY, brainR;
  let isRunning = false;
  let rafId = null;
  let time = 0;
  let rotAngle = 0;
  let resizeTimer = null;

  /* ── Particle storage ── */
  let particles = [];   // brain cloud particles
  let stars     = [];   // background stars
  let ringAngle = 0;    // platform ring rotation

  /* ── Entry animation state ── */
  let entryProgress = 0;  // 0→1 over ~75 frames (1.25s at 60fps)
  const ENTRY_SPEED = 0.013;

  /* ─────────────────────────────────────────────────────────
     CANVAS SIZING
  ───────────────────────────────────────────────────────── */
  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const rw   = rect.width  || canvas.parentElement?.offsetWidth  || 500;
    const rh   = rect.height || canvas.parentElement?.offsetHeight || 500;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = rw * dpr;
    canvas.height = rh * dpr;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    w = rw;
    h = rh;
    cx = w / 2;

    /* Platform sits at ~80% height */
    platformY = h * 0.80;

    /* Brain center: roughly 38% from top, floats above platform */
    brainCY   = h * 0.38;

    /* Brain radius: ~32% of the shorter dimension */
    brainR = Math.min(w, h) * 0.32;

    buildParticles();
    buildStars();
  }

  /* ─────────────────────────────────────────────────────────
     BUILD BRAIN PARTICLES
     Fibonacci sphere with ellipsoid scaling + surface perturbation
  ───────────────────────────────────────────────────────── */
  function buildParticles() {
    particles = [];
    const N       = CFG.particles;
    const golden  = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
      /* Fibonacci sphere distribution */
      const y3d   = 1 - (i / (N - 1)) * 2;              // -1 to 1
      const rxy   = Math.sqrt(Math.max(0, 1 - y3d * y3d));
      const theta = golden * i;                           // azimuthal

      /* Surface perturbation — gives organic brain lobe shape */
      const phi   = Math.acos(Math.max(-1, Math.min(1, y3d))); // polar
      const perturbation = 1 + 0.08 * Math.sin(4 * theta) * Math.cos(2 * phi)
                             + 0.04 * Math.sin(2 * theta) * Math.sin(3 * phi);

      /* Raw sphere coords */
      let x3 = rxy * Math.cos(theta) * perturbation;
      let y3 = y3d * perturbation;
      let z3 = rxy * Math.sin(theta) * perturbation;

      /* Ellipsoid scaling: wider than tall, slightly flat */
      x3 *= 1.00;
      y3 *= 0.72;   /* shorter vertically */
      z3 *= 0.80;   /* slightly less deep */

      /* Radial density: bias toward surface (shell particles)
         but also keep some interior fill for volume */
      const radialNorm = Math.sqrt(x3*x3 + y3*y3 + z3*z3);

      /* Particle properties */
      const distFromCenter = radialNorm;   /* 0=center, ~1=surface */
      const isEdge = distFromCenter > 0.75;

      /* Random spawn point for entry animation */
      const spawnAngle = Math.random() * Math.PI * 2;
      const spawnDist  = (Math.random() * 0.5 + 1.2) * brainR;

      particles.push({
        /* 3D brain position (normalized, will be scaled by brainR) */
        x3d: x3, y3d: y3d, z3d: z3,

        /* Entry spawn (screen-space offset from brain center) */
        spawnX: Math.cos(spawnAngle) * spawnDist,
        spawnY: Math.sin(spawnAngle) * spawnDist,

        /* Appearance */
        size:    isEdge
                 ? (Math.random() * 1.0 + 0.4)   /* edge: smaller, scattered */
                 : (Math.random() * 1.6 + 0.6),  /* interior: slightly larger */
        phase:   Math.random() * Math.PI * 2,
        freq:    Math.random() * 1.2 + 0.5,
        depth:   z3,  /* cached for sorting — updated each frame */

        /* Color variant: mostly white-cyan */
        colorR:  Math.floor(180 + Math.random() * 75),  /* 180–255 */
        colorG:  Math.floor(210 + Math.random() * 45),  /* 210–255 */
        colorB:  255,
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     BUILD BACKGROUND STARS
  ───────────────────────────────────────────────────────── */
  function buildStars() {
    stars = [];
    const count = isMobile ? 20 : 40;
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * w,
        y:     Math.random() * h * 0.72,   /* upper 72% only */
        r:     Math.random() * 1.0 + 0.4,
        phase: Math.random() * Math.PI * 2,
        freq:  Math.random() * 0.8 + 0.3,
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     DRAW STARS
  ───────────────────────────────────────────────────────── */
  function drawStars() {
    stars.forEach(s => {
      const alpha = 0.12 + 0.22 * Math.sin(time * s.freq + s.phase);
      ctx.fillStyle = `rgba(210, 230, 255, ${Math.max(0, alpha)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ─────────────────────────────────────────────────────────
     DRAW LIGHT BEAM CONE
     Trapezoid from platform center upward to brain bottom
  ───────────────────────────────────────────────────────── */
  function drawLightBeam(floatOffset) {
    const beamTop    = brainCY + brainR * 0.55 + floatOffset; /* brain bottom */
    const beamBottom = platformY;

    /* Beam half-widths */
    const topHW    = w * 0.04;   /* narrow at brain */
    const bottomHW = w * 0.16;   /* wide at platform */

    /* Filled trapezoid */
    const beamGrd = ctx.createLinearGradient(cx, beamTop, cx, beamBottom);
    beamGrd.addColorStop(0.0,  'rgba(160, 230, 255, 0.00)');
    beamGrd.addColorStop(0.25, 'rgba(100, 215, 255, 0.05)');
    beamGrd.addColorStop(0.65, 'rgba(60,  200, 255, 0.10)');
    beamGrd.addColorStop(1.0,  'rgba(40,  190, 255, 0.20)');

    ctx.fillStyle = beamGrd;
    ctx.beginPath();
    ctx.moveTo(cx - topHW,    beamTop);
    ctx.lineTo(cx + topHW,    beamTop);
    ctx.lineTo(cx + bottomHW, beamBottom);
    ctx.lineTo(cx - bottomHW, beamBottom);
    ctx.closePath();
    ctx.fill();

    /* Central bright axis line */
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 240, 255, 0.35)';
    ctx.lineWidth   = 1;
    ctx.shadowColor = 'rgba(0, 220, 255, 0.6)';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(cx, beamTop);
    ctx.lineTo(cx, beamBottom);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────
     DRAW PLATFORM
     Elliptical disc + 3 concentric rings + center node
  ───────────────────────────────────────────────────────── */
  function drawPlatform() {
    ringAngle += 0.004;   /* slow ring rotation */

    /* Ring definitions [xRadius as fraction of w, alpha, lineWidth, ticks] */
    const rings = [
      { xR: w * 0.12, yR: null, alpha: 0.90, lw: 2.2, ticks: 24 },
      { xR: w * 0.22, yR: null, alpha: 0.55, lw: 1.4, ticks: 36 },
      { xR: w * 0.34, yR: null, alpha: 0.28, lw: 0.9, ticks: 0  },
    ];
    /* yRadius = xRadius * 0.22 for 3D flat perspective */
    rings.forEach(r => { r.yR = r.xR * 0.22; });

    /* Platform disc fill */
    ctx.save();
    ctx.fillStyle = 'rgba(8, 16, 35, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, platformY, rings[2].xR, rings[2].yR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* Rings */
    rings.forEach((ring, ri) => {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 210, 255, ${ring.alpha})`;
      ctx.lineWidth   = ring.lw;
      ctx.shadowColor = `rgba(0, 210, 255, ${ring.alpha * 0.5})`;
      ctx.shadowBlur  = 5;
      ctx.beginPath();
      ctx.ellipse(cx, platformY, ring.xR, ring.yR, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* Tick marks on rings 0 and 1 */
      if (CFG.ringTicks && ring.ticks > 0) {
        ctx.strokeStyle = `rgba(0, 220, 255, ${ring.alpha * 0.60})`;
        ctx.lineWidth   = 0.7;
        for (let t = 0; t < ring.ticks; t++) {
          const angle = (Math.PI * 2 / ring.ticks) * t + ringAngle * (ri === 0 ? 1 : -0.7);
          const cosA  = Math.cos(angle);
          const sinA  = Math.sin(angle);
          const inX   = cx + cosA * (ring.xR - 5);
          const inY   = platformY + sinA * (ring.yR - 5 * 0.22);
          const outX  = cx + cosA * (ring.xR + 4);
          const outY  = platformY + sinA * (ring.yR + 4 * 0.22);
          ctx.beginPath();
          ctx.moveTo(inX,  inY);
          ctx.lineTo(outX, outY);
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    /* Center node — small bright cyan circle */
    const pulse = 0.10 * Math.sin(time * 2.5);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 230, 255, 0.9)';
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = `rgba(100, 230, 255, ${0.85 + pulse})`;
    ctx.beginPath();
    ctx.arc(cx, platformY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────
     DRAW BRAIN PARTICLE CLOUD
  ───────────────────────────────────────────────────────── */
  function drawBrain(floatOffset) {
    const cosR = Math.cos(rotAngle);
    const sinR = Math.sin(rotAngle);
    const ep   = Math.min(1, entryProgress);

    /* Project particles and store screen coords */
    const projected = particles.map(p => {
      /* Y-axis rotation */
      const x3 =  p.x3d * cosR + p.z3d * sinR;
      const z3 = -p.x3d * sinR + p.z3d * cosR;
      const y3 =  p.y3d;

      /* Scale to screen */
      const sx = cx  + x3 * brainR;
      const sy = (brainCY + floatOffset) + y3 * brainR;

      /* Entry lerp: particles fly in from spawn point */
      const lerpX = cx  + p.spawnX + (sx - (cx  + p.spawnX)) * ep;
      const lerpY = (brainCY + floatOffset) + p.spawnY +
                    (sy - ((brainCY + floatOffset) + p.spawnY)) * ep;

      return { sx: lerpX, sy: lerpY, z3, p };
    });

    /* Sort back-to-front by Z depth */
    projected.sort((a, b) => a.z3 - b.z3);

    /* Draw each particle as a tiny square */
    projected.forEach(({ sx, sy, z3, p }) => {
      /* Depth alpha: front = bright, back = dim */
      const depthAlpha = 0.25 + 0.70 * ((z3 + 1) / 2);

      /* Shimmer oscillation */
      const shimmer = 0.12 * Math.sin(time * p.freq + p.phase);

      /* Distance from brain center (for edge fade) */
      const dist3D = Math.sqrt(p.x3d * p.x3d + p.y3d * p.y3d + p.z3d * p.z3d);
      const edgeFade = Math.max(0.10, 1 - Math.max(0, dist3D - 0.7) * 1.8);

      const alpha = Math.max(0, Math.min(1, depthAlpha * edgeFade + shimmer)) * ep;

      if (alpha < 0.04) return;   /* skip invisible particles */

      ctx.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${alpha})`;

      /* Tiny square — this gives the digital/voxel look from the reference */
      const s = p.size;
      ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
    });
  }

  /* ─────────────────────────────────────────────────────────
     MAIN RENDER LOOP
  ───────────────────────────────────────────────────────── */
  function render() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, w, h);

    time      += 0.016;
    rotAngle  += CFG.rotSpeed;

    /* Entry progress */
    if (entryProgress < 1) entryProgress = Math.min(1, entryProgress + ENTRY_SPEED);

    /* Float offset — whole brain + beam move together */
    const floatOffset = Math.sin(time * 0.60) * CFG.floatAmp;

    /* DRAW ORDER: back to front */
    drawStars();
    drawLightBeam(floatOffset);
    drawBrain(floatOffset);
    drawPlatform();

    rafId = requestAnimationFrame(render);
  }

  /* ─────────────────────────────────────────────────────────
     INTERSECTION OBSERVER — pause off-screen
  ───────────────────────────────────────────────────────── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!isRunning) { isRunning = true; render(); }
      } else {
        isRunning = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    });
  }, { rootMargin: '200px' });

  /* ─────────────────────────────────────────────────────────
     RESIZE HANDLER
  ───────────────────────────────────────────────────────── */
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeCanvas, 200);
  }

  /* ─────────────────────────────────────────────────────────
     GSAP ENTRY CHOREOGRAPHY
  ───────────────────────────────────────────────────────── */
  function initEntry() {
    const visual    = document.querySelector('.hero-ai-visual');
    const label     = document.querySelector('.hero-ai-panel-label');
    const eyebrow   = document.querySelector('.hero-ai-eyebrow');
    const words     = document.querySelectorAll('.hero-ai-headline .headline-word');
    const accentLn  = document.querySelector('.hero-ai-accent-line');
    const body      = document.querySelector('.hero-ai-body');
    const ctas      = document.querySelector('.hero-ai-ctas');

    /* Initial states */
    if (visual) gsap.set(visual, { opacity: 0 });

    const tl = gsap.timeline({ delay: 0.10 });

    /* Scanline on */
    tl.to('body', { '--scanline-opacity': 0.10, duration: 0.3, ease: 'none' }, 0.0);

    /* Canvas panel fades in */
    tl.to(visual, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.15);

    /* Start canvas render at same time */
    tl.call(() => {
      sizeCanvas();
      observer.observe(canvas);
      window.addEventListener('resize', onResize, { passive: true });
    }, null, 0.10);

    /* Eyebrow clips in */
    if (eyebrow) {
      tl.to(eyebrow, {
        clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out',
      }, 0.75);
    }

    /* 3-word headline slams */
    if (words.length) {
      tl.to(words, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.55,
        ease: 'expo.out',
        stagger: 0.20,
      }, 1.00);
    }

    /* Accent underline draws */
    if (accentLn) {
      tl.to(accentLn, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 1.50);
    }

    /* Body + CTAs */
    if (body) tl.to(body, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.70);
    if (ctas) tl.to(ctas, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.82);

    /* Panel label */
    if (label) tl.to(label, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.95);
  }

  /* ─────────────────────────────────────────────────────────
     HERO PIN SCROLL TRIGGER
  ───────────────────────────────────────────────────────── */
  function initPin() {
    const endStr = isMobile ? '+=80%' : '+=120%';
    ScrollTrigger.create({
      trigger: '#hero-ai',
      start:   'top top',
      end:     endStr,
      pin:     true,
      scrub:   1,
      onUpdate(self) {
        if (self.progress > 0.70) {
          const t     = (self.progress - 0.70) / 0.30;
          const inner = document.querySelector('.hero-ai-inner');
          if (inner) gsap.set(inner, { opacity: 1 - t, y: -t * 60 });
        } else {
          const inner = document.querySelector('.hero-ai-inner');
          if (inner) gsap.set(inner, { opacity: 1, y: 0 });
        }
      },
    });
  }

  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  initEntry();
  initPin();
}
```

---

## SECTION 4 — REPORT.MD UPDATE

Add this line at the TOP of the Change Log table:

```
| 2026-06-26 | **Batch 21 — Particle Brain 2-Column Hero** — Owner rejected 3-column layout and neuron-graph brain. New design matches reference screenshot: 2-column (copy left 40%, brain right 60%), single canvas panel, no wheel/HUD/convergence ray. Brain is a 6000/4000/2000 tier-gated particle cloud (tiny square pixels, not round dots) shaped on a Fibonacci-sphere ellipsoid (1.0×0.72×0.80 scaling) with surface perturbation for organic brain lobe shape. Particles sorted and rendered back-to-front with depth alpha, edge fade, and shimmer oscillation. Full Y-axis rotation, floating animation (sin wave), entry fly-in from spawn points. Platform: 3 concentric foreshortened ellipse rings with tick marks, center glow node. Light beam: filled trapezoid gradient from platform to brain bottom. CSS: 2-col grid (40/60), aspect-ratio 1/1 panel, 4 responsive breakpoints. GSAP: scanline → panel fade → particles fly in → eyebrow → headline slam → underline → body → CTAs → label. Hero pin unchanged (120% / 80% mobile). `hero-ai.js`, `hero-ai.css`, `ai-automation.html` all rewritten. All other files untouched. |
```

---

## ✅ FINAL VERIFICATION CHECKLIST

- [ ] `ai-automation.html` — 2-col layout. `<canvas id="canvas-brain-particle">` inside `.hero-ai-visual`. No old canvas IDs. No `<img>` tags in hero.
- [ ] `hero-ai.css` — 2-col grid (40fr/60fr). `.hero-ai-visual` with `aspect-ratio: 1/1`. 4 responsive breakpoints. No old 3-col rules.
- [ ] `hero-ai.js` — Exports `initHeroAi`. `buildParticles()` with Fibonacci sphere + ellipsoid + surface perturbation. `drawBrain()` using `fillRect` squares sorted by Z. `drawLightBeam()` trapezoid gradient. `drawPlatform()` 3 ellipse rings. GSAP entry timeline. Hero pin ScrollTrigger.
- [ ] Particle brain visible on load — brain-shaped cloud of white/cyan square particles slowly rotating
- [ ] Light beam cone visible rising from platform to brain
- [ ] 3 platform rings visible, outermost with tick marks
- [ ] Platform center node glowing
- [ ] Entry animation: particles fly in from scattered positions → converge to brain shape over ~1.2s
- [ ] Floating: whole brain + beam moves up and down slowly together
- [ ] Stars visible in dark background (upper area)
- [ ] Hero pin working
- [ ] No `console.error` on page load
- [ ] Canvas DPR scaling correct (sharp on retina)
- [ ] Mobile: stacked layout — copy top, brain panel bottom (≤900px)
- [ ] All other page sections untouched (Capabilities, Automation Flow, Metrics, CTA)
- [ ] `report.md` updated

---

*End of prompt — EdgeNexus IT Batch 21 | Particle Brain 2-Col Hero | Author: Claude Sonnet 4.6*
