# PRODUCTION PROMPT — EdgeNexus IT
## Batch 22 — Brain Shape Fix (Silhouette-Masked Particle System)
### File: `batch22-brain-shape-fix.md`

---

## PROBLEM WITH BATCH 21 OUTPUT

The IDE generated a **perfect sphere** because Fibonacci sphere gives uniform
distribution on a ball. The brain shape was never actually enforced.

**Root cause:** Ellipsoid scaling alone does NOT create a brain shape.
You need a 2D brain silhouette mask that particles must fall inside.

## SOLUTION

Use a **2D brain silhouette outline** defined as bezier control points.
For each particle:
1. Pick a random point inside the 2D brain outline (rejection sampling)
2. Give it a random Z depth (-1 to +1)
3. Scale XY position by `sqrt(1 - z²)` so it stays inside the brain
   volume when projected from the side — this creates the 3D roundness
   while keeping the brain outline shape.

This guarantees the brain shape from EVERY rotation angle because the
silhouette IS the brain shape, not an approximation.

---

## ⚠️ STRICT RULES

1. Read ALL THREE target files before writing anything.
2. DO NOT touch anything outside the three target files.
3. DO NOT modify Capabilities, Automation Flow, Impact Metrics, CTA, Footer.
4. Pure Canvas 2D only. No new CDNs.
5. This is a SURGICAL REPLACEMENT of `hero-ai.js` only.
   The HTML and CSS from Batch 21 are ALREADY CORRECT — do not rewrite them.
   Only change what is listed in SECTION 3 (JS changes).

---

## TARGET FILES

```
K:\EdgeNexusIt\services\ai-automation.html        ← verify canvas ID only
K:\EdgeNexusIt\styles\pages\ai-automation\hero-ai.css  ← verify only, no change
K:\EdgeNexusIt\js\pages\ai-automation\hero-ai.js  ← FULL REWRITE
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
styles/pages/ai-automation/hero-ai.css       ← already correct from Batch 21
services/ai-automation.html                   ← already correct from Batch 21
js/components/shared-layout.js
styles/tokens.css
All other pages
```

---

## SECTION 1 — VERIFY HTML (no change needed)

Confirm `services/ai-automation.html` still has:
- `<canvas id="canvas-brain-particle">` inside `.hero-ai-visual`
- `.hero-ai-copy` with the copy content
- `.hero-ai-inner` 2-col grid wrapper

If Batch 21 HTML is already in place → do nothing to the HTML.

---

## SECTION 2 — VERIFY CSS (no change needed)

Confirm `hero-ai.css` still has:
- `.hero-ai-inner` with `grid-template-columns: 40fr 60fr`
- `.hero-ai-visual` with `aspect-ratio: 1 / 1`

If Batch 21 CSS is already in place → do nothing to the CSS.

---

## SECTION 3 — JS FULL REWRITE (`hero-ai.js`)

Complete file replacement. Export: `export function initHeroAi(tier, isMobile, reducedMotion)`

### CRITICAL VISUAL SPEC — READ CAREFULLY

```
TARGET IMAGE ANALYSIS (image 2 — what we want):

BRAIN SHAPE:
  - NOT a sphere. Has a clear brain silhouette visible from the front.
  - Top: wide, rounded dome (frontal + parietal lobes)
  - Bottom-left: tapers down (temporal lobe)
  - Bottom-right: slight flare then narrow (occipital + brainstem)
  - The bottom is NARROWER than the top — like a real brain
  - Right edge has a slight bump (parietal bulge)

PARTICLE APPEARANCE:
  - LARGE particles: 2px–6px squares. NOT tiny 1px dots.
  - Top/front particles: BRIGHT WHITE or very light cyan (#e0f4ff, #ffffff)
  - Mid particles: medium blue-white (#a0d0ff)
  - Back/deep particles: dark blue (#2050a0), very small
  - The TOP of the brain is THE BRIGHTEST (as if lit from above)
  - The BOTTOM is darker / more blue
  - This vertical light gradient is CRITICAL to make it look like image 2

PARTICLE DENSITY:
  - Center/interior: DENSE — particles close together, many visible
  - Edge: SPARSE — particles thin out, some float outside the silhouette
    giving the "cloud" / "exploding" effect at the edges
  - About 20% of particles are "escaped" edge particles slightly outside
    the brain outline — these are small and faint (the scattered dust effect)

PLATFORM (already working from Batch 21, keep same logic):
  - 3 concentric ellipse rings
  - Center node
  - Tick marks

BEAM (improve from Batch 21):
  - Should be BRIGHTER and more visible
  - Wider at base (platform), narrow at brain bottom
  - Add a soft inner bright core line
  - Add outer soft glow around the cone

WHAT WAS WRONG IN BATCH 21:
  - Perfect sphere (Fibonacci uniform sphere = ball shape)
  - Particles too small (1-2px) — barely visible
  - No vertical brightness gradient (all uniform brightness)
  - No brain silhouette shape — just a round ball
  - Beam too faint
```

---

### BRAIN SILHOUETTE — HOW TO BUILD IT

**Step 1: Define 2D brain outline as normalized bezier path**

The brain outline in normalized coords (0,0 = center, radius = 1.0):
These points define the OUTER BOUNDARY of the brain silhouette.

```javascript
// Brain silhouette as closed polygon (normalized, Y up = negative)
// This defines the 2D brain shape when viewed from front
// Scale by brainR to get screen coords
const BRAIN_OUTLINE = [
  // Starting at top-center, going clockwise
  // [x, y] normalized where 0,0 = brain center, ±1 = edge
  [ 0.00, -0.92],  // top center
  [ 0.28, -0.95],  // upper right frontal dome
  [ 0.60, -0.82],  // right parietal
  [ 0.88, -0.55],  // right temporal upper
  [ 0.92, -0.15],  // widest right point
  [ 0.82,  0.20],  // right temporal lower
  [ 0.58,  0.48],  // right temporal bottom
  [ 0.28,  0.58],  // bottom right
  [ 0.05,  0.62],  // bottom center-right (brainstem area)
  [-0.05,  0.62],  // bottom center-left
  [-0.28,  0.52],  // bottom left
  [-0.55,  0.38],  // left temporal bottom
  [-0.80,  0.12],  // left temporal lower
  [-0.92, -0.18],  // widest left point
  [-0.88, -0.50],  // left temporal upper
  [-0.65, -0.78],  // left parietal
  [-0.32, -0.92],  // upper left frontal
  [ 0.00, -0.92],  // back to start
];
```

**Step 2: Point-in-polygon test**

```javascript
// Returns true if point (px, py) is inside the brain outline polygon
// Uses ray-casting algorithm
function isInsideBrain(px, py, outline) {
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const xi = outline[i][0], yi = outline[i][1];
    const xj = outline[j][0], yj = outline[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
```

**Step 3: Build particles using silhouette mask**

```javascript
function buildParticles(brainR, cx, brainCY) {
  particles = [];
  const N = CFG.particles;

  // Bounding box of brain outline (in normalized coords)
  const minX = -0.95, maxX = 0.95;
  const minY = -0.98, maxY = 0.65;
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  let attempts = 0;
  const maxAttempts = N * 8;

  while (particles.length < N && attempts < maxAttempts) {
    attempts++;

    // Random normalized 2D point
    const nx = minX + Math.random() * rangeX;
    const ny = minY + Math.random() * rangeY;

    // Check if inside brain silhouette
    if (!isInsideBrain(nx, ny, BRAIN_OUTLINE)) continue;

    // Random Z depth (-1 to +1)
    // Scale XY by sqrt(1 - z²) so the 3D volume looks round from side
    const z3d = (Math.random() * 2 - 1);
    const zScale = Math.sqrt(Math.max(0, 1 - z3d * z3d));

    // Normalized distance from center (for density/size effects)
    const distFromCenter = Math.sqrt(nx * nx + ny * ny);
    const isEdgeParticle  = distFromCenter > 0.72;
    const isEscaped       = isEdgeParticle && Math.random() < 0.25;

    // Vertical position for brightness gradient
    // ny: -0.98 (top) to +0.65 (bottom) — top should be brightest
    const verticalT = (ny - minY) / rangeY;  // 0=top, 1=bottom

    // Particle size: larger in front, smaller in back
    // Also larger at top (prominent lobes) smaller at bottom
    const frontness = (z3d + 1) / 2;  // 0=back, 1=front
    let size;
    if (isEscaped) {
      size = Math.random() * 1.5 + 0.5;  // escaped: tiny
    } else if (frontness > 0.7) {
      size = Math.random() * 3.5 + 1.5;  // front: large
    } else if (frontness > 0.3) {
      size = Math.random() * 2.5 + 1.0;  // mid: medium
    } else {
      size = Math.random() * 1.5 + 0.5;  // back: small
    }

    // Color based on vertical position + depth:
    // Top-front = bright white
    // Mid = cyan-white
    // Bottom or back = dark blue
    let r, g, b;
    if (verticalT < 0.25 && frontness > 0.5) {
      // Top bright: near white
      r = 220 + Math.floor(Math.random() * 35);
      g = 235 + Math.floor(Math.random() * 20);
      b = 255;
    } else if (verticalT < 0.55) {
      // Mid: light cyan-white
      r = 140 + Math.floor((1 - verticalT) * 80);
      g = 185 + Math.floor((1 - verticalT) * 50);
      b = 255;
    } else {
      // Bottom: blue
      r = 40  + Math.floor(Math.random() * 60);
      g = 80  + Math.floor(Math.random() * 80);
      b = 200 + Math.floor(Math.random() * 55);
    }

    // Random spawn point for entry animation (outside brain, random direction)
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist  = (Math.random() * 0.6 + 1.3) * brainR;

    particles.push({
      // 2D silhouette position (normalized)
      nx2d: nx,
      ny2d: ny,
      // 3D depth
      z3d,
      zScale,
      // Escape offset (for edge-scattered particles)
      escapeX: isEscaped ? (Math.random() - 0.5) * 0.25 : 0,
      escapeY: isEscaped ? (Math.random() - 0.5) * 0.20 : 0,
      // Appearance
      size,
      r, g, b,
      // Animation
      phase:  Math.random() * Math.PI * 2,
      freq:   Math.random() * 0.8 + 0.3,
      // Entry spawn (screen-space offset)
      spawnX: Math.cos(spawnAngle) * spawnDist,
      spawnY: Math.sin(spawnAngle) * spawnDist,
    });
  }
}
```

**Step 4: Project and draw**

```javascript
function drawBrain(floatOffset) {
  const cosR = Math.cos(rotAngle);
  const sinR = Math.sin(rotAngle);
  const ep   = Math.min(1, entryProgress);

  // Project all particles
  const projected = particles.map(p => {
    // Apply Y-axis rotation to the 2D silhouette coords + Z depth
    // The particle's XY in 3D space = (nx2d * zScale, ny2d, z3d)
    // After Y-rotation:
    const x3d =  p.nx2d * p.zScale;
    const z3d =  p.z3d;
    const xRot = x3d * cosR + z3d * sinR;
    const zRot = -x3d * sinR + z3d * cosR;

    // Screen position
    const sx = cx + xRot * brainR;
    const sy = (brainCY + floatOffset) + p.ny2d * brainR;

    // Entry lerp
    const finalX = sx;
    const finalY = sy;
    const startX = cx  + p.spawnX;
    const startY = (brainCY + floatOffset) + p.spawnY;
    const lerpX  = startX + (finalX - startX) * ep;
    const lerpY  = startY + (finalY - startY) * ep;

    return { sx: lerpX, sy: lerpY, zRot, p };
  });

  // Sort back-to-front
  projected.sort((a, b) => a.zRot - b.zRot);

  // Draw
  projected.forEach(({ sx, sy, zRot, p }) => {
    // Depth alpha: back particles are dimmer and smaller
    const depthFactor = (zRot + 1) / 2;   // 0=back, 1=front
    const depthAlpha  = 0.15 + 0.82 * depthFactor;

    // Shimmer
    const shimmer = 0.08 * Math.sin(time * p.freq + p.phase);

    // Final alpha
    const alpha = Math.max(0, Math.min(1, depthAlpha + shimmer)) * ep;
    if (alpha < 0.06) return;

    // Size also scales with depth
    const drawSize = Math.max(0.4, p.size * (0.4 + 0.6 * depthFactor));

    ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
    ctx.fillRect(sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
  });
}
```

---

### COMPLETE JS FILE:

```javascript
/**
 * hero-ai.js — Particle Brain (Silhouette-Masked)
 * Brain shape enforced by 2D polygon mask + Z-depth for 3D roundness
 *
 * Called from: js/pages/ai-automation/page-main.js
 * Signature:   initHeroAi(tier, isMobile, reducedMotion)
 */

export function initHeroAi(tier, isMobile, reducedMotion) {

  /* ── Tier config ── */
  const CFG = {
    high: { particles: 6000, rotSpeed: 0.005, floatAmp: 10 },
    mid:  { particles: 4000, rotSpeed: 0.004, floatAmp:  9 },
    low:  { particles: 2200, rotSpeed: 0.003, floatAmp:  8 },
  }[tier] || { particles: 4000, rotSpeed: 0.004, floatAmp: 9 };

  /* ── Brain silhouette polygon (normalized coords, Y-up = negative) ── */
  const BRAIN_OUTLINE = [
    [ 0.00, -0.92], [ 0.28, -0.95], [ 0.60, -0.82],
    [ 0.88, -0.55], [ 0.92, -0.15], [ 0.82,  0.20],
    [ 0.58,  0.48], [ 0.28,  0.58], [ 0.05,  0.62],
    [-0.05,  0.62], [-0.28,  0.52], [-0.55,  0.38],
    [-0.80,  0.12], [-0.92, -0.18], [-0.88, -0.50],
    [-0.65, -0.78], [-0.32, -0.92], [ 0.00, -0.92],
  ];

  /* ── Point-in-polygon (ray casting) ── */
  function isInsideBrain(px, py) {
    let inside = false;
    const ol = BRAIN_OUTLINE;
    for (let i = 0, j = ol.length - 1; i < ol.length; j = i++) {
      const [xi, yi] = ol[i]; const [xj, yj] = ol[j];
      if (((yi > py) !== (yj > py)) &&
          (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  /* ── Canvas ── */
  const canvas = document.getElementById('canvas-brain-particle');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, cx, platformY, brainCY, brainR;
  let isRunning = false;
  let rafId = null;
  let time = 0;
  let rotAngle = 0;
  let resizeTimer = null;
  let entryProgress = 0;
  const ENTRY_SPEED = 0.012;

  let particles = [];
  let stars     = [];
  let ringAngle = 0;

  /* ── Size canvas ── */
  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const rw   = rect.width  || canvas.parentElement?.offsetWidth  || 500;
    const rh   = rect.height || canvas.parentElement?.offsetHeight || 500;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = rw * dpr;
    canvas.height = rh * dpr;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    w = rw; h = rh; cx = w / 2;
    platformY = h * 0.80;
    brainCY   = h * 0.38;
    brainR    = Math.min(w, h) * 0.33;
    buildParticles();
    buildStars();
  }

  /* ── Build particles using brain silhouette mask ── */
  function buildParticles() {
    particles = [];
    const N = CFG.particles;
    const minX = -0.95, maxX = 0.95;
    const minY = -0.98, maxY = 0.65;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    let attempts = 0;
    while (particles.length < N && attempts < N * 10) {
      attempts++;
      const nx = minX + Math.random() * rangeX;
      const ny = minY + Math.random() * rangeY;
      if (!isInsideBrain(nx, ny)) continue;

      const z3d    = Math.random() * 2 - 1;
      const zScale = Math.sqrt(Math.max(0, 1 - z3d * z3d));

      const distFromCenter = Math.sqrt(nx * nx + ny * ny);
      const isEdge         = distFromCenter > 0.70;
      const isEscaped      = isEdge && Math.random() < 0.22;

      const verticalT  = (ny - minY) / rangeY;  // 0=top bright, 1=bottom dark
      const frontness  = (z3d + 1) / 2;

      // Particle size: larger for front/top particles
      let size;
      if      (isEscaped)        size = Math.random() * 1.4 + 0.4;
      else if (frontness > 0.65) size = Math.random() * 4.0 + 2.0;
      else if (frontness > 0.30) size = Math.random() * 2.8 + 1.0;
      else                       size = Math.random() * 1.4 + 0.4;

      // Color: vertical gradient (top = white, bottom = dark blue)
      let r, g, b;
      if (verticalT < 0.20 && frontness > 0.45) {
        // Top bright white
        r = 215 + Math.floor(Math.random() * 40);
        g = 232 + Math.floor(Math.random() * 23);
        b = 255;
      } else if (verticalT < 0.50) {
        // Mid cyan-white
        const mix = verticalT / 0.50;
        r = Math.floor(215 - mix * 140);
        g = Math.floor(232 - mix * 120);
        b = 255;
      } else {
        // Bottom blue
        r = Math.floor(30  + Math.random() * 60);
        g = Math.floor(60  + Math.random() * 90);
        b = Math.floor(180 + Math.random() * 75);
      }

      const spawnAngle = Math.random() * Math.PI * 2;
      const spawnDist  = (Math.random() * 0.5 + 1.3) * brainR;

      particles.push({
        nx2d: nx + (isEscaped ? (Math.random()-0.5)*0.20 : 0),
        ny2d: ny + (isEscaped ? (Math.random()-0.5)*0.15 : 0),
        z3d, zScale,
        size, r, g, b,
        phase: Math.random() * Math.PI * 2,
        freq:  Math.random() * 0.9 + 0.3,
        spawnX: Math.cos(spawnAngle) * spawnDist,
        spawnY: Math.sin(spawnAngle) * spawnDist,
      });
    }
  }

  /* ── Stars ── */
  function buildStars() {
    stars = [];
    const count = isMobile ? 18 : 38;
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * w,
        y:     Math.random() * h * 0.70,
        r:     Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        freq:  Math.random() * 0.7 + 0.25,
      });
    }
  }

  function drawStars() {
    stars.forEach(s => {
      const a = 0.10 + 0.20 * Math.sin(time * s.freq + s.phase);
      ctx.fillStyle = `rgba(200, 225, 255, ${Math.max(0, a)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ── Light beam ── */
  function drawLightBeam(floatOffset) {
    const beamTop    = brainCY + floatOffset + brainR * 0.52;
    const beamBottom = platformY;
    const topHW      = w * 0.035;
    const bottomHW   = w * 0.14;

    // Outer soft glow (wide, very transparent)
    const outerGrd = ctx.createLinearGradient(cx, beamTop, cx, beamBottom);
    outerGrd.addColorStop(0.0, 'rgba(0, 200, 255, 0.00)');
    outerGrd.addColorStop(0.4, 'rgba(0, 180, 255, 0.04)');
    outerGrd.addColorStop(1.0, 'rgba(0, 160, 255, 0.10)');
    ctx.fillStyle = outerGrd;
    ctx.beginPath();
    ctx.moveTo(cx - topHW * 2.5, beamTop);
    ctx.lineTo(cx + topHW * 2.5, beamTop);
    ctx.lineTo(cx + bottomHW * 1.5, beamBottom);
    ctx.lineTo(cx - bottomHW * 1.5, beamBottom);
    ctx.closePath();
    ctx.fill();

    // Inner cone (brighter)
    const innerGrd = ctx.createLinearGradient(cx, beamTop, cx, beamBottom);
    innerGrd.addColorStop(0.0, 'rgba(140, 230, 255, 0.00)');
    innerGrd.addColorStop(0.3, 'rgba(80,  215, 255, 0.08)');
    innerGrd.addColorStop(0.7, 'rgba(40,  200, 255, 0.18)');
    innerGrd.addColorStop(1.0, 'rgba(20,  190, 255, 0.32)');
    ctx.fillStyle = innerGrd;
    ctx.beginPath();
    ctx.moveTo(cx - topHW,    beamTop);
    ctx.lineTo(cx + topHW,    beamTop);
    ctx.lineTo(cx + bottomHW, beamBottom);
    ctx.lineTo(cx - bottomHW, beamBottom);
    ctx.closePath();
    ctx.fill();

    // Central bright core line
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 240, 255, 0.55)';
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = 'rgba(0, 230, 255, 0.8)';
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.moveTo(cx, beamTop);
    ctx.lineTo(cx, beamBottom);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* ── Platform rings ── */
  function drawPlatform() {
    ringAngle += 0.0035;
    const rings = [
      { xR: w * 0.13, alpha: 0.95, lw: 2.5, ticks: 24,  dir:  1 },
      { xR: w * 0.23, alpha: 0.60, lw: 1.6, ticks: 36,  dir: -1 },
      { xR: w * 0.35, alpha: 0.32, lw: 1.0, ticks:  0,  dir:  1 },
    ];
    rings.forEach(r => { r.yR = r.xR * 0.20; });

    // Dark disc
    ctx.save();
    ctx.fillStyle = 'rgba(6, 14, 32, 0.60)';
    ctx.beginPath();
    ctx.ellipse(cx, platformY, rings[2].xR, rings[2].yR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    rings.forEach((ring, ri) => {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 215, 255, ${ring.alpha})`;
      ctx.lineWidth   = ring.lw;
      ctx.shadowColor = `rgba(0, 215, 255, ${ring.alpha * 0.6})`;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.ellipse(cx, platformY, ring.xR, ring.yR, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (ring.ticks > 0) {
        ctx.strokeStyle = `rgba(0, 220, 255, ${ring.alpha * 0.55})`;
        ctx.lineWidth   = 0.8;
        for (let t = 0; t < ring.ticks; t++) {
          const a   = (Math.PI * 2 / ring.ticks) * t + ringAngle * ring.dir;
          const inX = cx + Math.cos(a) * (ring.xR - 5);
          const inY = platformY + Math.sin(a) * (ring.yR - 5 * 0.20);
          const oX  = cx + Math.cos(a) * (ring.xR + 4);
          const oY  = platformY + Math.sin(a) * (ring.yR + 4 * 0.20);
          ctx.beginPath(); ctx.moveTo(inX, inY); ctx.lineTo(oX, oY); ctx.stroke();
        }
      }
      ctx.restore();
    });

    // Center glow node
    const pulse = 0.12 * Math.sin(time * 2.4);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 240, 255, 0.95)';
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = `rgba(80, 230, 255, ${0.88 + pulse})`;
    ctx.beginPath();
    ctx.arc(cx, platformY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* ── Draw brain particle cloud ── */
  function drawBrain(floatOffset) {
    const cosR = Math.cos(rotAngle);
    const sinR = Math.sin(rotAngle);
    const ep   = Math.min(1, entryProgress);

    const projected = particles.map(p => {
      // 3D coords: X and Z rotated around Y-axis
      const x3d  = p.nx2d * p.zScale;
      const xRot =  x3d * cosR + p.z3d * sinR;
      const zRot = -x3d * sinR + p.z3d * cosR;

      const sx = cx + xRot * brainR;
      const sy = (brainCY + floatOffset) + p.ny2d * brainR;

      // Entry lerp
      const startX = cx  + p.spawnX;
      const startY = brainCY + floatOffset + p.spawnY;
      const lerpX  = startX + (sx - startX) * ep;
      const lerpY  = startY + (sy - startY) * ep;

      return { sx: lerpX, sy: lerpY, zRot, p };
    });

    // Back-to-front sort
    projected.sort((a, b) => a.zRot - b.zRot);

    projected.forEach(({ sx, sy, zRot, p }) => {
      const depthFactor = (zRot + 1) / 2;
      const depthAlpha  = 0.12 + 0.85 * depthFactor;
      const shimmer     = 0.07 * Math.sin(time * p.freq + p.phase);
      const alpha       = Math.max(0, Math.min(1, depthAlpha + shimmer)) * ep;
      if (alpha < 0.05) return;

      const drawSize = Math.max(0.5, p.size * (0.35 + 0.65 * depthFactor));
      ctx.fillStyle  = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
      ctx.fillRect(sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
    });
  }

  /* ── Render loop ── */
  function render() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, w, h);
    time     += 0.016;
    rotAngle += CFG.rotSpeed;
    if (entryProgress < 1) entryProgress = Math.min(1, entryProgress + ENTRY_SPEED);

    const floatOffset = Math.sin(time * 0.60) * CFG.floatAmp;

    drawStars();
    drawLightBeam(floatOffset);
    drawBrain(floatOffset);
    drawPlatform();

    rafId = requestAnimationFrame(render);
  }

  /* ── IntersectionObserver ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!isRunning) { isRunning = true; render(); }
      } else {
        isRunning = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    });
  }, { rootMargin: '200px' });

  /* ── Resize ── */
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeCanvas, 200);
  }

  /* ── GSAP Entry ── */
  function initEntry() {
    const visual   = document.querySelector('.hero-ai-visual');
    const label    = document.querySelector('.hero-ai-panel-label');
    const eyebrow  = document.querySelector('.hero-ai-eyebrow');
    const words    = document.querySelectorAll('.hero-ai-headline .headline-word');
    const accentLn = document.querySelector('.hero-ai-accent-line');
    const body     = document.querySelector('.hero-ai-body');
    const ctas     = document.querySelector('.hero-ai-ctas');

    if (visual) gsap.set(visual, { opacity: 0 });

    const tl = gsap.timeline({ delay: 0.10 });

    tl.to('body', { '--scanline-opacity': 0.10, duration: 0.3, ease: 'none' }, 0.0);
    tl.call(() => {
      sizeCanvas();
      observer.observe(canvas);
      window.addEventListener('resize', onResize, { passive: true });
    }, null, 0.08);
    tl.to(visual, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.15);
    if (eyebrow) tl.to(eyebrow, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out' }, 0.80);
    if (words.length) tl.to(words, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'expo.out', stagger: 0.20 }, 1.05);
    if (accentLn) tl.to(accentLn, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 1.55);
    if (body) tl.to(body, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.75);
    if (ctas) tl.to(ctas, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.88);
    if (label) tl.to(label, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.98);
  }

  /* ── Hero pin ── */
  function initPin() {
    ScrollTrigger.create({
      trigger: '#hero-ai',
      start:   'top top',
      end:     isMobile ? '+=80%' : '+=120%',
      pin:     true,
      scrub:   1,
      onUpdate(self) {
        const inner = document.querySelector('.hero-ai-inner');
        if (!inner) return;
        if (self.progress > 0.70) {
          const t = (self.progress - 0.70) / 0.30;
          gsap.set(inner, { opacity: 1 - t, y: -t * 60 });
        } else {
          gsap.set(inner, { opacity: 1, y: 0 });
        }
      },
    });
  }

  initEntry();
  initPin();
}
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Brain is clearly **brain-shaped** (not a sphere) — wider top, narrower bottom
- [ ] Top particles are **bright white** — bottom particles are **dark blue**
- [ ] Particles are **visible squares** 2–6px (not tiny 1px dots)
- [ ] Edge particles are **scattered/escaped** slightly outside the outline
- [ ] Light beam is **visible and bright** (two-layer: outer glow + inner core)
- [ ] Platform rings prominent with tick marks and center glow
- [ ] Brain **rotates slowly** on Y-axis (silhouette changes as it rotates)
- [ ] Entry: particles **fly in** from scattered positions → form brain shape
- [ ] Float: brain + beam move **together** up/down
- [ ] Hero pin working, all other sections untouched
- [ ] No `console.error` on load

---

*End of prompt — EdgeNexus IT Batch 22 | Brain Silhouette Fix | Author: Claude Sonnet 4.6*
