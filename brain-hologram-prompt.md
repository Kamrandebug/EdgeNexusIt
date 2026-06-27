# Batch 23 — Production Claude Code Prompt
# File: `js/sections/hero-ai.js` — 3D Brain Hologram (Complete Rewrite)

---

## CONTEXT

File to rewrite: `js/sections/hero-ai.js`
Page: `services/ai-automation.html`
Canvas ID: `#canvas-brain` (already exists in HTML — DO NOT touch HTML or CSS)
Project stack: Vanilla JS ES Modules, GSAP 3.12.2, Canvas 2D API
Design tokens: `--accent` = `#00aaff`, void BG = `#060810`

Previous attempts FAILED because:
- Batch 21: Fibonacci sphere → perfect ball (no brain shape)
- Batch 22: 27-point polygon + rejection sampling → still reads as blob, not brain

---

## OBJECTIVE

Replace the entire `hero-ai.js` brain canvas with a Canvas 2D particle system
that renders an **unmistakably recognizable human brain** rising from a holographic
projection base — matching the visual in Image 1 (the reference screenshot).

---

## BRAIN SHAPE SPECIFICATION

### Anatomy to hit (all normalized to canvas center, Y-up):

The brain must have these **anatomically correct** proportions:

```
           ┌──────────────────────┐
          /    LEFT    |    RIGHT   \     ← cerebral cortex dome (wide, rounded)
         |  hemisphere | hemisphere  |   ← ~70% of total height
         |_____________|_____________|   ← central longitudinal fissure (vertical midline gap)
          \   temporal  temporal   /    ← temporal lobe bulges (widest point ~45% down)
           \_   lobe   / lobe   _/      ← protrude OUTWARD past cortex dome
              \_______/\_______/        ← slight inward curve between lobes
                  |___|                 ← brainstem taper (narrow, bottom 15%)
```

### Exact silhouette polygon (26 points, normalized -1..+1 space, Y+ = up):

```javascript
const BRAIN_SILHOUETTE = [
  // Starting from top-center, going clockwise
  [ 0.00,  1.00],  // apex center
  [ 0.18,  0.98],  // right cortex top
  [ 0.42,  0.88],  // right cortex dome shoulder
  [ 0.60,  0.72],  // right cortex outer
  [ 0.68,  0.50],  // right cortex mid
  [ 0.72,  0.25],  // right cortex lower
  [ 0.74,  0.00],  // right temporal lobe top (widest)
  [ 0.76, -0.10],  // right temporal lobe peak ← PROTRUDES most
  [ 0.70, -0.25],  // right temporal lobe bottom bulge
  [ 0.60, -0.38],  // right temporal-parietal junction
  [ 0.40, -0.50],  // right inferior margin
  [ 0.22, -0.60],  // right brainstem join
  [ 0.12, -0.72],  // right brainstem
  [ 0.06, -0.85],  // right brainstem base
  [ 0.00, -0.90],  // brainstem bottom center
  [-0.06, -0.85],  // left brainstem base
  [-0.12, -0.72],  // left brainstem
  [-0.22, -0.60],  // left brainstem join
  [-0.40, -0.50],  // left inferior margin
  [-0.60, -0.38],  // left temporal-parietal junction
  [-0.70, -0.25],  // left temporal lobe bottom bulge
  [-0.76, -0.10],  // left temporal lobe peak ← PROTRUDES most
  [-0.74,  0.00],  // left temporal lobe top (widest)
  [-0.72,  0.25],  // left cortex lower
  [-0.68,  0.50],  // left cortex mid
  [-0.60,  0.72],  // left cortex outer
  [-0.42,  0.88],  // left cortex dome shoulder
  [-0.18,  0.98],  // left cortex top
];
```

**This polygon MUST be used verbatim as the rejection mask.**

---

## PARTICLE SYSTEM SPECIFICATION

### Counts (tier-gated, same tier system already in the file):
- HIGH tier: 3200 particles
- MID tier: 2000 particles
- LOW tier: 1200 particles

### Particle placement algorithm:
1. Generate random point `(nx, ny)` in `[-1, +1]²`
2. Run **point-in-polygon ray-cast** against `BRAIN_SILHOUETTE` — reject if outside
3. **Central fissure**: points within `|nx| < 0.035` have 80% chance of rejection
   (creates visible midline gap = two hemispheres)
4. **3D depth**: assign `nz = sqrt(max(0, 1 - nx² - ny²)) * (0.8 + Math.random()*0.2)`
   (front face of a hemisphere)
5. **Scatter halo**: for every 5th rejected edge point, keep it at 110–130% radius
   (scattered particles outside the silhouette, like Image 1)

### Particle visual:
- Size = lerp(6.5, 0.8, depth) where depth = `(nz + 1) / 2`
  (front particles large squares, back particles tiny)
- Shape: `fillRect` — axis-aligned squares, NOT circles
- Color gradient (Y position, top-to-bottom):
  ```
  ny > 0.5  → #e8f4ff  (bright white-blue, cortex top)
  ny > 0.0  → lerp(#e8f4ff, #60b8ff)
  ny > -0.4 → lerp(#60b8ff, #1a6aff)
  ny ≤ -0.4 → lerp(#1a6aff, #0a1f5c)  (deep navy, brainstem)
  ```
- Alpha = lerp(0.95, 0.35, depth) — front opaque, back faded

### Rotation:
- Continuous Y-axis rotation: `rotY += 0.003` per frame (rad)
- Apply rotation per particle:
  ```javascript
  const cosR = Math.cos(rotY), sinR = Math.sin(rotY);
  const rx = p.nx * cosR - p.nz * sinR;
  const rz = p.nx * sinR + p.nz * cosR;
  // Use rx for screen X, rz for depth sorting
  ```
- Sort particles back-to-front by `rz` each frame (painter's algorithm)
- Mouse parallax: add `mouse.x * 0.08` to rotY offset (existing mouse system reuse)

---

## HOLOGRAM BASE SPECIFICATION

Three concentric ellipses below the brain + light cone rising from center:

### Canvas layout:
- Brain center: `(cx, cy)` where `cy = canvas.height * 0.42` (slightly above center)
- Brain radius: `R = Math.min(canvas.width, canvas.height) * 0.32`
- Hologram base center: `(cx, cy + R * 1.05)` — directly below brain

### Rings (draw BEFORE particles — behind brain):
```javascript
// 3 rings, each an ellipse (width:height = 3:1 to look like floor projection)
rings = [
  { ry: R * 0.08, alpha: 0.7, width: 1.5 },
  { ry: R * 0.14, alpha: 0.45, width: 1.0 },
  { ry: R * 0.20, alpha: 0.25, width: 0.7 },
];
// Each ring rx = ry * 3.2
// Color: strokeStyle = `rgba(0, 180, 255, alpha)`
// Animate: rings pulse scale ±4% with sin(time * 1.8)
```

### Light cone (draw BEFORE particles):
```javascript
// Outer glow cone
gradient = ctx.createLinearGradient(cx, holo_cy, cx, cy - R * 0.3);
gradient.addColorStop(0, 'rgba(0, 140, 255, 0.35)');
gradient.addColorStop(1, 'rgba(0, 140, 255, 0.00)');
// Cone width at base = ring[0].rx * 0.6
// Draw as filled triangle path

// Inner bright cone (narrower, brighter)
gradient2 = ...addColorStop(0, 'rgba(120, 220, 255, 0.55)') → transparent
// Width = ring[0].rx * 0.18

// Core line (1px bright white-blue vertical line, base → brain bottom)
ctx.strokeStyle = 'rgba(180, 235, 255, 0.9)';
ctx.lineWidth = 1;
```

### Scan ring (animated, draws AFTER particles — in front):
```javascript
// Single ellipse ring that travels up through the brain volume
// y oscillates: holo_cy → (cy - R) over 3.5 seconds, then resets
// At each y, rx = ring[0].rx * lerp(1.0, 0.3, progress)
// Alpha fades: 0 → 0.6 → 0 (fade in/out as it sweeps through)
// Color: rgba(0, 230, 255, alpha)
```

---

## ENTRY ANIMATION (GSAP timeline — matches existing page choreography)

```javascript
// Particles start at y = holo_cy (all flat at hologram base)
// On init, each particle has a `riseProgress = 0`
// GSAP timeline (fires after existing scanline entry):

gsap.timeline({ delay: 0.3 })
  .to(brainState, {
    riseProgress: 1,
    duration: 1.8,
    ease: 'power2.out',
    onUpdate: () => {
      // Each particle interpolates from (holo_cy) to its final (cy + nz*R) position
      // using riseProgress as lerp factor
    }
  });

// Particles materialize: alpha starts at 0, reaches full alpha during rise
// Stagger per-particle based on distance from base (bottom particles rise first)
```

---

## IMPLEMENTATION RULES

1. **ONLY edit `js/sections/hero-ai.js`** — zero changes to HTML, CSS, or any other file
2. The existing `export function initHeroBrain(canvas, tier, mouse)` signature is preserved
3. The existing RAF loop (`let raf; function tick() { raf = requestAnimationFrame(tick); ... }`)
   pattern is preserved — reuse it, don't introduce a second RAF
4. All GSAP imports come from the existing `import gsap from 'gsap'` at file top
5. The `BRAIN_SILHOUETTE` array must be copy-pasted verbatim — do NOT regenerate it
6. Point-in-polygon function: standard ray-cast, no external libs
7. Canvas is already sized by the calling page — do NOT call `resizeCanvas()` in this module
8. Depth sort: create a typed Float32Array for rz values and sort indices array for performance
9. The scan ring and hologram rings must animate on every frame tick — no `setInterval`
10. On `window.matchMedia('(prefers-reduced-motion: reduce)')` → disable rotation + scan ring,
    keep static brain visible

---

## EXPECTED VISUAL RESULT

When done, the canvas must show:
- An **unmistakably brain-shaped** cluster of bright square pixels — wider dome on top,
  two temporal lobe bumps on each side at mid-height, narrowing to a brainstem at bottom
- The brain **slowly rotates** on its Y axis, revealing its 3D roundness
- It appears to **rise from** (and be sustained by) a holographic blue projection ring
  and light cone at the bottom
- Particle colors go bright white-blue at top → deep navy at brainstem
- The whole thing reads like Image 1 (the reference) — not like a blob or sphere

Deliver the complete rewritten `hero-ai.js` file. No partial diffs.
