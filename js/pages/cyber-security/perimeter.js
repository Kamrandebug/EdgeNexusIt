// js/pages/cyber-security/perimeter.js
// v3 — radar scope with 6 defense-layer blips, sweep-pass triggers, hover interactions

export function initPerimeter({ tier = 'high', fineHover = true, reducedMotion = false, isMobile = false } = {}) {
  const canvas = document.getElementById('perimeter-canvas');
  if (!canvas) return;

  const section = document.querySelector('.section-perimeter');
  const tooltip = document.getElementById('perimeter-tooltip');
  const prefersReducedMotion = reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const style = getComputedStyle(document.documentElement);
  const ACCENT = style.getPropertyValue('--accent').trim() || '#00aaff';
  const ACCENT_STRONG = style.getPropertyValue('--accent-strong')?.trim() || '#33bbff';
  const ACCENT_BORDER = style.getPropertyValue('--accent-border')?.trim() || 'rgba(0,170,255,0.3)';
  const BH = style.getPropertyValue('--bh').trim() || 'rgba(255,255,255,0.06)';
  const BG = style.getPropertyValue('--bg').trim() || '#020508';
  const T1 = style.getPropertyValue('--t1').trim() || '#e2e8f0';
  const T2 = style.getPropertyValue('--t2').trim() || 'rgba(226,232,240,0.6)';
  const T3 = style.getPropertyValue('--t3').trim() || 'rgba(226,232,240,0.25)';

  const ctx = canvas.getContext('2d');
  let w, h, cx, cy, sweepAngle = 0, animationId;
  let isVisible = true;
  let hoveredLayer = -1;

  // ── 6 Defense layers with fixed positions ──
  const layers = [
    { name: 'IDENTITY & ACCESS',     stat: '847 ENDPOINTS MONITORED',  band: 0, angle: Math.PI * 0.15, lastPassed: -1, isLit: false },
    { name: 'ENDPOINT DEFENSE',      stat: '0 OPEN PORTS',            band: 0, angle: Math.PI * 0.85, lastPassed: -1, isLit: false },
    { name: 'NETWORK PERIMETER',     stat: '12 POLICIES ACTIVE',      band: 1, angle: Math.PI * 0.30, lastPassed: -1, isLit: false },
    { name: 'CLOUD POSTURE',         stat: '99.8% COMPLIANT',         band: 1, angle: Math.PI * 1.30, lastPassed: -1, isLit: false },
    { name: 'DATA PROTECTION',       stat: '3.2TB ENCRYPTED',         band: 2, angle: Math.PI * 0.45, lastPassed: -1, isLit: false },
    { name: 'THREAT INTELLIGENCE',   stat: '1,204 IOCS ACTIVE',       band: 2, angle: Math.PI * 1.70, lastPassed: -1, isLit: false },
  ];

  const BAND_RADII = [0.25, 0.50, 0.75]; // fractions of canvas half-size
  const BLIP_RADIUS = 3;

  // ── Hover state per blip ──
  const blipState = layers.map(() => ({ glow: 0, glowVel: 0, }));

  // ── Resize with responsive capping ──
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const maxSize = 480;
    const parent = canvas.parentElement;
    const available = Math.min(parent.clientWidth, maxSize);
    const size = Math.max(available, 200);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = size; h = size; cx = size / 2; cy = size / 2;
  }

  // Debounced resize listener
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  function getBlipPos(layer, radius) {
    const r = radius * BAND_RADII[layer.band];
    return { x: cx + Math.cos(layer.angle) * r, y: cy + Math.sin(layer.angle) * r };
  }

  // ── Sweep-pass detection ──
  const SWEEP_WIDTH = 0.042; // ~15° in radians

  function checkSweepPass(now) {
    layers.forEach((layer, i) => {
      // Normalize angles for comparison
      let sweepNorm = sweepAngle % (2 * Math.PI);
      if (sweepNorm < 0) sweepNorm += 2 * Math.PI;
      let blipAngle = layer.angle % (2 * Math.PI);
      if (blipAngle < 0) blipAngle += 2 * Math.PI;

      // Check if leading edge just crossed blip angle
      const diff = blipAngle - sweepNorm;
      const wrapped = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;

      if (Math.abs(wrapped) < SWEEP_WIDTH * 0.6 && !layer.isLit && layer.lastPassed !== Math.floor(now / 100)) {
        layer.isLit = true;
        layer.lastPassed = Math.floor(now / 100);
        blipState[i].glow = 1;
        blipState[i].glowVel = -0.004;

        // Trigger blip animation — brighten and expand momentarily
        setTimeout(() => { layer.isLit = false; }, 500);
      }

      // Decay glow
      if (blipState[i].glow > 0 && hoveredLayer !== i) {
        blipState[i].glow = Math.max(0, blipState[i].glow - 0.008);
      }
    });
  }

  // ── Draw ──
  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    const maxR = Math.min(cx, cy) * 0.9;

    // Range rings
    [0.25, 0.5, 0.75, 1.0].forEach((f, i) => {
      const r = maxR * f;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i === 3 ? 'rgba(255,255,255,0.03)' : BH;
      ctx.lineWidth = i === 3 ? 0.5 : 1;
      // Pulse the outermost ring
      if (i === 3) {
        const pulse = Math.sin(now / 900) * 0.3 + 0.7;
        ctx.globalAlpha = pulse * 0.4;
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Radial spokes
    for (let a = 0; a < 12; a++) {
      const angle = (a / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = BH;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Sweep wedge
    if (!prefersReducedMotion) {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.7, 'rgba(0,170,255,0.04)');
      grad.addColorStop(0.95, 'rgba(0,170,255,0.12)');
      grad.addColorStop(1, 'rgba(0,170,255,0.18)');

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngle - SWEEP_WIDTH);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, 0, SWEEP_WIDTH * 2.5);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Leading edge line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = ACCENT_STRONG;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Blips
    layers.forEach((layer, i) => {
      const pos = getBlipPos(layer, maxR);
      const isHovered = i === hoveredLayer;
      const glow = blipState[i].glow;

      // Connecting line for hover
      if (isHovered) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = ACCENT_BORDER;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Blip dot
      const r = isHovered ? BLIP_RADIUS * 2 : BLIP_RADIUS * (1 + glow * 0.6);
      const alpha = isHovered ? 1 : Math.min(1, 0.6 + glow * 0.4);
      const fill = isHovered ? ACCENT_STRONG : (glow > 0.1 ? ACCENT : 'var(--accent-dim)');
      const cssColor = isHovered ? ACCENT_STRONG : (glow > 0.1 ? ACCENT : 'rgba(0,170,255,0.3)');

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = cssColor;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Small ring around hovered blip
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = ACCENT_BORDER;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Center node
    const heartbeat = Math.sin(now / 900) * 0.03 + 1;
    const ha = Math.sin(now / 900) * 0.075 + 0.925;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(heartbeat, heartbeat);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = ACCENT;
    ctx.shadowColor = 'rgba(0,170,255,0.15)';
    ctx.shadowBlur = 16;
    ctx.globalAlpha = ha * 0.2;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.fillStyle = BG;
    ctx.font = 'bold 8px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOUR', 0, -5);
    ctx.fillText('BUSINESS', 0, 6);
    ctx.restore();
  }

  // ── Animation loop ──
  function animate(now) {
    if (!isVisible) { animationId = null; return; }
    if (!prefersReducedMotion) {
      sweepAngle += (2 * Math.PI / 6000) * 16.67; // ~6s per full rotation at 60fps
      checkSweepPass(now);
    }
    draw(now);
    animationId = requestAnimationFrame(animate);
  }

  // ── Hover on defense cards ──
  function getLayerIndexFromCard(el) {
    return parseInt(el?.dataset?.layer, 10);
  }

  function addDefenseCardListeners() {
    document.querySelectorAll('.defense-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const idx = getLayerIndexFromCard(card);
        if (idx >= 0 && idx < layers.length) {
          hoveredLayer = idx;
          blipState[idx].glow = 1;
          canvas.style.cursor = 'pointer';
        }
      });
      card.addEventListener('mouseleave', () => {
        const idx = getLayerIndexFromCard(card);
        if (idx >= 0 && idx < layers.length) {
          hoveredLayer = -1;
          canvas.style.cursor = 'default';
        }
      });
    });
  }

  // ── Canvas hover via tooltip fallback ──
  function getHoveredLayer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left, my = clientY - rect.top;
    const maxR = Math.min(cx, cy) * 0.9;
    let closest = -1, closestDist = 30;
    layers.forEach((layer, i) => {
      const pos = getBlipPos(layer, maxR);
      const d = Math.hypot(mx - pos.x, my - pos.y);
      if (d < closestDist) { closestDist = d; closest = i; }
    });
    return closest;
  }

  if (fineHover) {
    canvas.addEventListener('mousemove', (e) => {
      const idx = getHoveredLayer(e.clientX, e.clientY);
      if (idx !== hoveredLayer) {
        hoveredLayer = idx >= 0 ? idx : -1;
        canvas.style.cursor = hoveredLayer >= 0 ? 'pointer' : 'default';
        if (tooltip) {
          if (hoveredLayer >= 0) {
            tooltip.textContent = `${layers[hoveredLayer].name} // ${layers[hoveredLayer].stat}`;
            tooltip.classList.add('visible');
          } else {
            tooltip.classList.remove('visible');
          }
        }
      }
    });
    canvas.addEventListener('mouseleave', () => {
      hoveredLayer = -1;
      canvas.style.cursor = 'default';
      if (tooltip) tooltip.classList.remove('visible');
    });
  }

  // ── Visibility tracking ──
  if (section) {
    new IntersectionObserver(([e]) => {
      isVisible = e.isIntersecting;
      if (isVisible && !animationId) animationId = requestAnimationFrame(animate);
    }, { threshold: 0 }).observe(section);
  }

  // ── Init ──
  function init() {
    resize();
    window.addEventListener('resize', resize);
    addDefenseCardListeners();

    gsap.fromTo(canvas, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 80%', once: true }
    });

    animationId = requestAnimationFrame(animate);
  }

  init();
}
