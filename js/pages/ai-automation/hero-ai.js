/**
 * hero-ai.js — 3D Brain Hologram (Complete Rewrite)
 * 
 * Called from: js/pages/ai-automation/page-main.js
 * Signature:   initHeroAi(tier, isMobile, reducedMotion)
 */

export function initHeroAi(tier, isMobile, reducedMotion) {

  /* ── Reduced motion fallback ── */
  if (reducedMotion) {
    document.querySelectorAll('.hero-ai-eyebrow, .headline-word, .hero-ai-body, .hero-ai-ctas, .hero-ai-panel-label')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none'; });
    const visual = document.querySelector('.hero-ai-visual');
    if (visual) visual.style.opacity = '1';
  }

  /* ── Config ── */
  const CFG = {
    high: { particles: 3200 },
    mid:  { particles: 2000 },
    low:  { particles: 1200 },
  }[tier] || { particles: 2000 };

  /* ── Brain Silhouette Polygon ── */
  const BRAIN_SILHOUETTE = [
    [ 0.00,  1.00], [ 0.18,  0.98], [ 0.42,  0.88], [ 0.60,  0.72],
    [ 0.68,  0.50], [ 0.72,  0.25], [ 0.74,  0.00], [ 0.76, -0.10],
    [ 0.70, -0.25], [ 0.60, -0.38], [ 0.40, -0.50], [ 0.22, -0.60],
    [ 0.12, -0.72], [ 0.06, -0.85], [ 0.00, -0.90], [-0.06, -0.85],
    [-0.12, -0.72], [-0.22, -0.60], [-0.40, -0.50], [-0.60, -0.38],
    [-0.70, -0.25], [-0.76, -0.10], [-0.74,  0.00], [-0.72,  0.25],
    [-0.68,  0.50], [-0.60,  0.72], [-0.42,  0.88], [-0.18,  0.98],
  ];

  /* ── Point-in-Polygon ── */
  function isInsideBrain(px, py) {
    let inside = false;
    for (let i = 0, j = BRAIN_SILHOUETTE.length - 1; i < BRAIN_SILHOUETTE.length; j = i++) {
      const [xi, yi] = BRAIN_SILHOUETTE[i];
      const [xj, yj] = BRAIN_SILHOUETTE[j];
      const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /* ── Canvas Setup ── */
  const canvas = document.getElementById('canvas-brain-particle');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, cx, cy, R, holo_cy;
  let rafId;
  let time = 0;
  let rotY = 0;
  let resizeTimer;

  // Mouse Parallax
  let mouseX = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  });

  const brainState = { riseProgress: 0 };
  let particles = [];
  
  // Typed arrays for fast sorting
  let rzArray;
  let indicesArray;

  function lerpColor(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return [r, g, b];
  }

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const rw = rect.width || 500;
    const rh = rect.height || 500;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    canvas.width = rw * dpr;
    canvas.height = rh * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    w = rw; 
    h = rh;
    cx = w / 2;
    cy = h * 0.42;
    R = Math.min(w, h) * 0.32;
    holo_cy = cy + R * 1.05;

    buildParticles();
  }

  function buildParticles() {
    particles = [];
    const N = CFG.particles;
    let attempts = 0;
    let rejectedCount = 0;

    const c1 = [232, 244, 255]; // #e8f4ff (bright white-blue)
    const c2 = [96, 184, 255];  // #60b8ff
    const c3 = [26, 106, 255];  // #1a6aff
    const c4 = [10, 31, 92];    // #0a1f5c (deep navy)

    while (particles.length < N && attempts < N * 10) {
      attempts++;
      const nx = (Math.random() * 2 - 1);
      const ny = (Math.random() * 2 - 1);

      const inside = isInsideBrain(nx, ny);

      let finalNx = nx;
      let finalNy = ny;
      let isHalo = false;

      if (!inside) {
        rejectedCount++;
        // Scatter halo: keep every 5th rejected edge point
        if (rejectedCount % 5 === 0) {
          const scale = 1.1 + Math.random() * 0.2; // 110-130%
          finalNx *= scale;
          finalNy *= scale;
          isHalo = true;
        } else {
          continue;
        }
      }

      // Central fissure: 80% rejection if near midline
      if (!isHalo && Math.abs(finalNx) < 0.035 && Math.random() < 0.8) {
        continue;
      }

      // 3D depth
      const distSq = finalNx * finalNx + finalNy * finalNy;
      const nzBase = Math.sqrt(Math.max(0, 1 - distSq));
      let finalNz = nzBase * (0.8 + Math.random() * 0.2);
      
      // Mirror to back hemisphere half the time
      if (Math.random() < 0.5) finalNz = -finalNz;

      // Color gradient based on ny
      let rgb;
      if (finalNy > 0.5) {
        rgb = c1;
      } else if (finalNy > 0.0) {
        rgb = lerpColor(c2, c1, finalNy / 0.5);
      } else if (finalNy > -0.4) {
        rgb = lerpColor(c3, c2, (finalNy + 0.4) / 0.4);
      } else {
        rgb = lerpColor(c4, c3, Math.max(0, (finalNy + 1.0) / 0.6));
      }

      particles.push({
        nx: finalNx,
        ny: finalNy,
        nz: finalNz,
        r: rgb[0], g: rgb[1], b: rgb[2],
        phase: Math.random() * Math.PI * 2,
        riseOffset: Math.random() * 0.5 // stagger entry
      });
    }

    rzArray = new Float32Array(particles.length);
    indicesArray = new Int32Array(particles.length);
    for (let i = 0; i < particles.length; i++) indicesArray[i] = i;
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    time += 0.016;

    if (!reducedMotion) {
      rotY += 0.003;
    }
    const currentRotY = rotY + mouseX * 0.08;
    const cosR = Math.cos(currentRotY);
    const sinR = Math.sin(currentRotY);

    const rp = brainState.riseProgress;

    /* ── 1. Draw Hologram Base ── */
    const ringScale = 1 + 0.04 * Math.sin(time * 1.8);
    const rings = [
      { ry: R * 0.08, alpha: 0.7, width: 1.5 },
      { ry: R * 0.14, alpha: 0.45, width: 1.0 },
      { ry: R * 0.20, alpha: 0.25, width: 0.7 },
    ];

    // Base Rings
    rings.forEach(ring => {
      const rx = ring.ry * 3.2 * ringScale;
      const ry = ring.ry * ringScale;
      ctx.beginPath();
      ctx.ellipse(cx, holo_cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 180, 255, ${ring.alpha * rp})`;
      ctx.lineWidth = ring.width;
      ctx.stroke();
    });

    // Outer glow cone
    const outerRx = rings[0].ry * 3.2 * 0.6;
    const gradient = ctx.createLinearGradient(cx, holo_cy, cx, cy - R * 0.3);
    gradient.addColorStop(0, `rgba(0, 140, 255, ${0.35 * rp})`);
    gradient.addColorStop(1, 'rgba(0, 140, 255, 0.00)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(cx - outerRx, holo_cy);
    ctx.lineTo(cx + outerRx, holo_cy);
    ctx.lineTo(cx, cy - R * 0.3);
    ctx.fill();

    // Inner bright cone
    const innerRx = rings[0].ry * 3.2 * 0.18;
    const gradient2 = ctx.createLinearGradient(cx, holo_cy, cx, cy - R * 0.3);
    gradient2.addColorStop(0, `rgba(120, 220, 255, ${0.55 * rp})`);
    gradient2.addColorStop(1, 'rgba(120, 220, 255, 0.00)');
    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.moveTo(cx - innerRx, holo_cy);
    ctx.lineTo(cx + innerRx, holo_cy);
    ctx.lineTo(cx, cy - R * 0.3);
    ctx.fill();

    // Core line
    ctx.strokeStyle = `rgba(180, 235, 255, ${0.9 * rp})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, holo_cy);
    ctx.lineTo(cx, cy + R * 0.8);
    ctx.stroke();

    /* ── 2. Calculate and Sort Particles ── */
    const numParticles = particles.length;
    for (let i = 0; i < numParticles; i++) {
      const p = particles[i];
      // Note: rx used for X, rz used for Z
      rzArray[i] = p.nx * sinR + p.nz * cosR;
    }

    // Sort indices based on rzArray (back-to-front)
    indicesArray.sort((a, b) => rzArray[a] - rzArray[b]);

    /* ── 3. Draw Particles ── */
    for (let i = 0; i < numParticles; i++) {
      const idx = indicesArray[i];
      const p = particles[idx];
      const rz = rzArray[idx];
      const rx = p.nx * cosR - p.nz * sinR;

      // target positions
      const targetX = cx + rx * R;
      // ny is UP in our model, so subtract from cy to go up in screen coords
      const targetY = cy - p.ny * R;

      // Staggered rise progress per particle
      let pRp = (rp - p.riseOffset * 0.3) / 0.7;
      pRp = Math.max(0, Math.min(1, pRp));
      
      if (pRp <= 0) continue;

      // Float animation
      const floatY = Math.sin(time + p.phase) * 3;

      // Interpolate from holo base to target
      const sx = cx + (targetX - cx) * pRp;
      const sy = holo_cy + (targetY + floatY - holo_cy) * pRp;

      // Depth based on current rotated Z
      // rz goes from roughly -1 (back) to +1 (front)
      const currentDepth = (rz + 1) / 2; 

      // Size = lerp(6.5, 0.8, depth) -> 0.8 at back (depth=0), 6.5 at front (depth=1)
      const drawSize = 0.8 + currentDepth * 5.7;
      // Alpha = lerp(0.95, 0.35, depth) -> 0.35 at back (depth=0), 0.95 at front (depth=1)
      const alpha = (0.35 + currentDepth * 0.60) * pRp;

      ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
      ctx.fillRect(sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
    }

    /* ── 4. Scan Ring (Foreground) ── */
    if (!reducedMotion) {
      const scanPeriod = 3.5;
      const scanProgress = (time % scanPeriod) / scanPeriod;
      const scanY = holo_cy - scanProgress * (holo_cy - (cy - R));
      const scanRx = rings[0].ry * 3.2 * (1.0 - 0.7 * scanProgress); 
      const scanRy = scanRx / 3.2;
      
      let scanAlpha = 0;
      if (scanProgress < 0.2) scanAlpha = scanProgress / 0.2 * 0.6;
      else if (scanProgress > 0.8) scanAlpha = (1 - scanProgress) / 0.2 * 0.6;
      else scanAlpha = 0.6;
      
      ctx.beginPath();
      ctx.ellipse(cx, scanY, scanRx, scanRy, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 230, 255, ${scanAlpha * rp})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    rafId = requestAnimationFrame(render);
  }

  function initEntry() {
    const visual = document.querySelector('.hero-ai-visual');
    const label = document.querySelector('.hero-ai-panel-label');
    const eyebrow = document.querySelector('.hero-ai-eyebrow');
    const words = document.querySelectorAll('.hero-ai-headline .headline-word');
    const accentLn = document.querySelector('.hero-ai-accent-line');
    const body = document.querySelector('.hero-ai-body');
    const ctas = document.querySelector('.hero-ai-ctas');

    if (visual) gsap.set(visual, { opacity: 0 });

    const tl = gsap.timeline({ delay: 0.10 });
    tl.to('body', { '--scanline-opacity': 0.10, duration: 0.3, ease: 'none' }, 0.0);
    
    tl.call(() => {
      sizeCanvas();
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(sizeCanvas, 200);
      }, { passive: true });
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(render);
    }, null, 0.08);

    tl.to(visual, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.15);
    
    if (eyebrow) tl.to(eyebrow, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out' }, 0.80);
    if (words.length) tl.to(words, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'expo.out', stagger: 0.20 }, 1.05);
    if (accentLn) tl.to(accentLn, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 1.55);
    if (body) tl.to(body, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.75);
    if (ctas) tl.to(ctas, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.88);
    if (label) tl.to(label, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.98);

    gsap.timeline({ delay: 0.4 })
      .to(brainState, {
        riseProgress: 1,
        duration: 1.8,
        ease: 'power2.out'
      });
  }

  function initPin() {
    if (!window.ScrollTrigger) return;
    ScrollTrigger.create({
      trigger: '#hero-ai',
      start: 'top top',
      end: isMobile ? '+=80%' : '+=120%',
      pin: true,
      scrub: 1,
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
