// js/pages/msp/hero-msp.js
// MSP Infrastructure Topology Canvas: CORE → DC → Endpoint hierarchy
// + entry choreography + glitch + metric counters

import { flags, breakpoint } from '../../core/performance.js';

// ─── TOPOLOGY NODES ──────────────────────────────────────────────────
let canvas, ctx;
let animId;
let netVisible = false;
let entryStartTime = 0;
let dashOffset = 0;
let activeConnection = null;
let activeConnTimer = 0;
let activeConnPacket = 0;

// Core packet state
let corePacket = null;
let corePacketTimer = 0;

// Status ticker
const TICKER_MESSAGES = [
  '// ALL SYSTEMS NOMINAL',
  '// MONITORING 1,709 NODES',
  '// UPTIME: 99.99%',
  '// THREAT LEVEL: LOW',
  '// LATENCY: 2.1ms',
];
let tickerMsgIdx = 0;
let tickerCharIdx = 0;
let tickerHoldTimer = 0;
let tickerFadeIn = 0;
let tickerCurrent = '';

// Pre-calculated node positions (updated on resize, read every frame)
const pos = { core: null, dc: [], endpoints: [] };

// Entry scale states (0→1 animated)
let nodeScales = {
  core: 0,
  dc: [0, 0, 0],
  endpoints: [0, 0, 0, 0, 0, 0],
  connectionsCore: [0, 0, 0],
  connectionsDC: [0, 0, 0, 0, 0, 0],
  tickerVisible: false,
};

let pulsePhases = [0, 0.8, 1.6]; // DC glow phases

// ─── ENTRY POINT ─────────────────────────────────────────────────────
export function initHeroMSP() {
  canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resizeCanvas();
  initResizeObserver();

  // Reset state
  dashOffset = 0;
  corePacket = null;
  corePacketTimer = 0;
  activeConnection = null;
  activeConnTimer = 0;
  tickerMsgIdx = 0;
  tickerCharIdx = 0;
  tickerHoldTimer = 0;
  tickerFadeIn = 0;
  tickerCurrent = '';

  // Canvas invisible until entry timeline reveals it
  canvas.style.opacity = '0';
  animId = requestAnimationFrame(drawLoop);

  // Entry choreography timeline
  runEntryTimeline();
}

// ─── CANVAS RESIZE ───────────────────────────────────────────────────
function resizeCanvas() {
  const panel = document.querySelector('.topology-panel');
  if (!panel) return;
  canvas.width  = panel.offsetWidth;
  canvas.height = panel.offsetHeight;
  calcPositions();
}

function calcPositions() {
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) return;
  pos.core = { x: w * 0.5, y: h * 0.18 };
  pos.dc = [
    { x: w * 0.22, y: h * 0.44 },
    { x: w * 0.5,  y: h * 0.44 },
    { x: w * 0.78, y: h * 0.44 },
  ];
  pos.endpoints = [
    { x: w * 0.12, y: h * 0.72, dc: 0, color: 'cyan' },
    { x: w * 0.32, y: h * 0.72, dc: 0, color: 'cyan' },
    { x: w * 0.4,  y: h * 0.72, dc: 1, color: 'cyan' },
    { x: w * 0.6,  y: h * 0.72, dc: 1, color: 'cyan' },
    { x: w * 0.68, y: h * 0.72, dc: 2, color: 'cyan' },
    { x: w * 0.88, y: h * 0.72, dc: 2, color: 'red' },
  ];
}

function initResizeObserver() {
  const panel = document.querySelector('.topology-panel');
  if (!panel) return;
  const ro = new ResizeObserver(() => {
    resizeCanvas();
  });
  ro.observe(panel);
}

// ─── DRAW LOOP ──────────────────────────────────────────────────────
let mspSectionVisible = true;
let mspPageHidden = false;
let mspWasOffscreen = false;
document.addEventListener('visibilitychange', () => {
  mspPageHidden = document.hidden;
});
function mspIsActive() { return !mspPageHidden && mspSectionVisible; }

const mspSection = document.getElementById('hero-msp');
if (mspSection) {
  const io = new IntersectionObserver(([entry]) => {
    const entering = entry.isIntersecting && mspWasOffscreen;
    mspWasOffscreen = !entry.isIntersecting;
    mspSectionVisible = entry.isIntersecting;
    // On re-entry, force panel/canvas visible if topology already started
    if (entering && netVisible) {
      const panel = document.querySelector('.topology-panel');
      const cnv = document.getElementById('network-canvas');
      if (panel) { panel.style.visibility = 'visible'; panel.style.opacity = '1'; }
      if (cnv) cnv.style.opacity = '1';
      entryStartTime = 0; // Reset timer so animations don't jump
    }
  }, { threshold: 0.05 });
  io.observe(mspSection);
}

function drawLoop(timestamp) {
  if (!ctx) { animId = requestAnimationFrame(drawLoop); return; }
  // Skip frames when tab is hidden or section is off-screen — skip heavy updates
  if (!mspIsActive()) {
    animId = requestAnimationFrame(drawLoop);
    return;
  }
  if (!entryStartTime) entryStartTime = timestamp;
  const elapsed = (timestamp - entryStartTime) / 1000;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (!netVisible) { animId = requestAnimationFrame(drawLoop); return; }

  // Status ticker bar
  drawStatusTicker(w, h, timestamp);

  // Animate dash offset for flowing lines
  dashOffset += 0.5;

  // ── CORE → DC connections ──────────────────────────────────────────
  pos.dc.forEach((dc, i) => {
    drawDashedLine(pos.core.x, pos.core.y, dc.x, dc.y, nodeScales.connectionsCore[i]);
  });

  // ── DC → endpoint connections ──────────────────────────────────────
  pos.endpoints.forEach((ep, i) => {
    const dc = pos.dc[ep.dc];
    drawDashedLine(dc.x, dc.y, ep.x, ep.y, nodeScales.connectionsDC[i]);
  });

  // Active connection highlight
  if (activeConnection !== null) {
    const ep = pos.endpoints[activeConnection.epIdx];
    const dc = pos.dc[ep.dc];
    const t = Math.min(activeConnTimer / 1000, 1);

    const px = dc.x + (ep.x - dc.x) * t;
    const py = dc.y + (ep.y - dc.y) * t;

    ctx.beginPath();
    ctx.moveTo(dc.x, dc.y);
    ctx.lineTo(ep.x, ep.y);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.setLineDash([6, 4]);

    // Bright packet dot
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.fill();
  }

  // ── CORE packet ────────────────────────────────────────────────────
  if (corePacket !== null) {
    const t = Math.min(corePacketTimer / 900, 1);
    const dc = pos.dc[corePacket.dcIdx];
    const px = pos.core.x + (dc.x - pos.core.x) * t;
    const py = pos.core.y + (dc.y - pos.core.y) * t;

    // Trailing fade
    for (let i = 0; i < 6; i++) {
      const tt = Math.max(0, t - i * 0.06);
      if (tt <= 0) continue;
      const tx = pos.core.x + (dc.x - pos.core.x) * tt;
      const ty = pos.core.y + (dc.y - pos.core.y) * tt;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${(0.5 - i * 0.075).toFixed(2)})`;
      ctx.fill();
    }
    // Core dot
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();
  }

  // ── CORE NODE (hexagon) ────────────────────────────────────────────
  if (nodeScales.core > 0) {
    const hexR = 28 * nodeScales.core;
    const hexRotation = (elapsed * (Math.PI * 2 / 8)) % (Math.PI * 2);

    // Outer ring (opposite direction, half speed)
    ctx.beginPath();
    ctx.arc(pos.core.x, pos.core.y, 44 * nodeScales.core, 0, Math.PI * 2);
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([6, 4]);

    // Hexagon
    drawHexagon(pos.core.x, pos.core.y, hexR, hexRotation);

    // Label
    ctx.fillStyle = '#00d4ff';
    ctx.font = `${10 * nodeScales.core}px "DM Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('CORE', pos.core.x, pos.core.y + hexR + 16);
  }

  // ── DC NODES (rounded rectangles) ──────────────────────────────────
  pos.dc.forEach((dc, i) => {
    const s = nodeScales.dc[i];
    if (s <= 0) return;

    const rw = 52 * s;
    const rh = 34 * s;

    // Breathing glow
    const glow = 0.5 + Math.sin(elapsed * (Math.PI * 2 / 2.4) + pulsePhases[i]) * 0.5;
    if (glow > 0.1) {
      ctx.save();
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 12 * glow;
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1.5;
      roundedRect(dc.x - rw / 2, dc.y - rh / 2, rw, rh, 4);
      ctx.stroke();
      ctx.restore();
    }

    // Fill
    const fillAlpha = dc.dcFlash > 0 ? 0.35 : 0.06;
    ctx.fillStyle = `rgba(0, 212, 255, ${fillAlpha})`;
    roundedRect(dc.x - rw / 2, dc.y - rh / 2, rw, rh, 4);
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 1.5;
    roundedRect(dc.x - rw / 2, dc.y - rh / 2, rw, rh, 4);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#00d4ff';
    ctx.font = `9px "DM Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`DC-0${i + 1}`, dc.x, dc.y + 3);

    // Status dot
    const dotColor = i === 2 ? '#f59e0b' : '#22c55e';
    ctx.beginPath();
    ctx.arc(dc.x + rw / 2 - 8, dc.y - rh / 2 + 8, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();

    if (dc.dcFlash > 0) dc.dcFlash--;
  });

  // ── ENDPOINT NODES (small circles) ─────────────────────────────────
  pos.endpoints.forEach((ep, i) => {
    const s = nodeScales.endpoints[i];
    if (s <= 0) return;

    const color = ep.color === 'red' ? '#ef4444' : '#00d4ff';
    const fillAlpha = ep.color === 'red' ? 0.25 : 0.15;

    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 6 * s, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', `, ${fillAlpha})`).replace('rgb', 'rgba');
    if (color.startsWith('#')) {
      ctx.fillStyle = color === '#ef4444' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 212, 255, 0.15)';
    }
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 6 * s, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // ─── Timers ────────────────────────────────────────────────────────
  // Core packet timer
  if (corePacket !== null) {
    corePacketTimer += 16;
    if (corePacketTimer >= 900) {
      // Flash DC
      const dc = pos.dc[corePacket.dcIdx];
      dc.dcFlash = 9; // ~150ms at 60fps
      corePacket = null;
      corePacketTimer = 0;
    }
  }

  // Active connection timer
  if (activeConnection !== null) {
    activeConnTimer += 16;
    if (activeConnTimer >= 1000) {
      activeConnection = null;
      activeConnTimer = 0;
    }
  }

  animId = requestAnimationFrame(drawLoop);
}

// ─── DRAW HELPERS ────────────────────────────────────────────────────
function drawDashedLine(x1, y1, x2, y2, scale) {
  if (scale <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.lineDashOffset = -dashOffset;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawHexagon(cx, cy, r, rotation) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(0, 212, 255, 0.08)';
  ctx.fill();
  ctx.restore();
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── STATUS TICKER ──────────────────────────────────────────────────
function drawStatusTicker(w, h, timestamp) {
  if (!nodeScales.tickerVisible) return;
  const tickerY = h - 28;

  // Background
  ctx.fillStyle = 'rgba(0, 212, 255, 0.04)';
  ctx.fillRect(0, tickerY, w, 28);

  // Top border
  ctx.beginPath();
  ctx.moveTo(0, tickerY);
  ctx.lineTo(w, tickerY);
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Typewriter logic
  const fullText = TICKER_MESSAGES[tickerMsgIdx];
  if (tickerCharIdx < fullText.length && Math.floor(timestamp) % 100 < 60) {
    tickerFadeIn = Math.min(1, tickerFadeIn + 0.05);
    tickerCurrent = fullText.substring(0, tickerCharIdx + 1);
    if (Math.floor(timestamp / 50) % 2 === 0 && timestamp % 50 < 25) {
      tickerCharIdx++;
    }
  } else {
    tickerFadeIn = Math.min(1, tickerFadeIn + 0.05);
  }

  if (tickerCharIdx >= fullText.length) {
    tickerHoldTimer += 16;
    if (tickerHoldTimer > 2400) {
      tickerMsgIdx = (tickerMsgIdx + 1) % TICKER_MESSAGES.length;
      tickerCharIdx = 0;
      tickerHoldTimer = 0;
      tickerFadeIn = 0;
      tickerCurrent = '';
    }
  }

  ctx.fillStyle = `rgba(0, 212, 255, ${tickerFadeIn.toFixed(2)})`;
  ctx.font = '9px "DM Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(tickerCurrent, 14, tickerY + 18);

  // Cursor blink
  if (Math.floor(timestamp / 400) % 2 === 0 && tickerCharIdx < fullText.length) {
    const textWidth = ctx.measureText(tickerCurrent).width;
    ctx.fillStyle = `rgba(0, 212, 255, ${tickerFadeIn.toFixed(2)})`;
    ctx.fillText('|', 14 + textWidth + 1, tickerY + 18);
  }
}

// ─── ENTRY CHOREOGRAPHY ─────────────────────────────────────────────
function runEntryTimeline() {
  const heroCopy     = document.querySelector('.hero-msp-copy');
  const eyebrowEl    = heroCopy?.querySelector('.hero-eyebrow');
  const headlineEl   = heroCopy?.querySelector('.hero-msp-headline');
  const bodyEl       = heroCopy?.querySelector('.hero-msp-body');
  const ctaGroup     = heroCopy?.querySelector('.hero-cta-group');
  const canvasPanel  = document.querySelector('.topology-panel');

  if (!heroCopy) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // t=0.00  Scanline sweep (0.5s)
  tl.call(() => {
    const scan = document.createElement('div');
    Object.assign(scan.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '1px',
      background: '#00d4ff', zIndex: '10', pointerEvents: 'none',
    });
    heroCopy.style.position = heroCopy.style.position || 'relative';
    heroCopy.appendChild(scan);
    gsap.to(scan, {
      top: '100%', duration: 0.5, ease: 'none',
      onComplete: () => gsap.to(scan, { autoAlpha: 0, duration: 0.1, onComplete: () => scan.remove() }),
    });
  });

  // t=0.10  Grid flicker
  tl.call(() => {
    const grid = document.getElementById('grid-overlay');
    if (!grid) return;
    gsap.timeline()
      .to(grid, { opacity: 0.4, duration: 0.05 })
      .to(grid, { opacity: 0, duration: 0.05 })
      .to(grid, { opacity: 0.6, duration: 0.06 })
      .to(grid, { opacity: 0, duration: 0.06 })
      .to(grid, { opacity: 1, duration: 0.08 });
  }, '+=0.10');

  // t=0.35  Eyebrow: x:-30→0
  if (eyebrowEl) {
    gsap.set(eyebrowEl, { autoAlpha: 0 });
    tl.fromTo(eyebrowEl, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, '+=0.25');
  }

  // t=0.55  Headline: word-by-word with glitch
  if (headlineEl) {
    const wordSpans = headlineEl.querySelectorAll('.word');
    gsap.set(wordSpans, { autoAlpha: 0 });

    tl.fromTo(wordSpans,
      { y: 50, scaleY: 1.3, autoAlpha: 0, transformOrigin: 'bottom' },
      {
        y: 0, scaleY: 1, autoAlpha: 1,
        duration: 0.6,
        stagger: 0.10,
        ease: 'power4.out',
        onComplete() { glitchWord(this.targets()[0]); },
      },
      '+=0.20'
    );
  }

  // t=1.10  Body text
  if (bodyEl) {
    gsap.set(bodyEl, { autoAlpha: 0 });
    tl.fromTo(bodyEl,
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5 },
      '+=0.55'
    );
  }

  // t=1.35  Buttons
  if (ctaGroup) {
    const btns = ctaGroup.querySelectorAll('.btn');
    gsap.set(btns, { autoAlpha: 0 });
    tl.fromTo(btns,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.10, ease: 'back.out(1.4)' },
      '+=0.25'
    );
  }

  // ── Topology timeline runs in parallel with copy ─────
  if (canvasPanel) {
    gsap.set(canvasPanel, { autoAlpha: 0, scale: 0.96 });
    // Start topology at t=0.25 so it animates in alongside the copy/eyebrow
    const topoTl = gsap.timeline({ delay: 0.25, defaults: { ease: 'expo.out' } });
    topoTl
      .to(canvasPanel, { autoAlpha: 1, scale: 1, duration: 0.7 })
      .call(startTopologyEntry, null, '+=0.10');
  }

  // CTA buttons smooth scroll
  if (ctaGroup) {
    const primaryBtn = ctaGroup.querySelector('.btn-primary');
    const ghostBtn = ctaGroup.querySelector('.btn-ghost');
    if (primaryBtn) {
      primaryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        gsap.to(window, { scrollTo: { y: '#cta-msp', offsetY: 64 }, duration: 1, ease: 'expo.inOut' });
      });
    }
    if (ghostBtn) {
      ghostBtn.addEventListener('click', (e) => {
        e.preventDefault();
        gsap.to(window, { scrollTo: { y: '#sla', offsetY: 64 }, duration: 1, ease: 'expo.inOut' });
      });
    }
  }

  initScrollParallax();
}

// ─── TOPOLOGY STAGED ENTRY ───────────────────────────────────────────
function startTopologyEntry() {
  netVisible = true;
  canvas.style.opacity = '1';
  entryStartTime = performance.now();

  // t=0.0  CORE scales in
  gsap.to(nodeScales, {
    core: 1,
    duration: 0.4,
    ease: 'back.out(1.7)',
    onComplete() {
      // t=0.4  Core→DC connections draw
      gsap.to(nodeScales.connectionsCore, {
        0: 1, 1: 1, 2: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete() {
          // t=0.9  DC nodes scale in
          gsap.to(nodeScales.dc, {
            0: 1, 1: 1, 2: 1,
            duration: 0.35,
            stagger: 0.12,
            ease: 'back.out(1.6)',
            onComplete() {
              // t=1.3  DC→endpoint connections draw
              gsap.to(nodeScales.connectionsDC, {
                0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
                duration: 0.4,
                stagger: 0.08,
                ease: 'power2.out',
                onComplete() {
                  // t=1.7  Endpoints scale in
                  gsap.to(nodeScales.endpoints, {
                    0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
                    duration: 0.3,
                    stagger: 0.06,
                    ease: 'back.out(1.6)',
                    onComplete() {
                      // t=2.0  Ticker
                      nodeScales.tickerVisible = true;

                      // t=2.2  Start continuous animations
                      setTimeout(() => {
                        scheduleCorePacket();
                        scheduleActiveConnection();
                      }, 200);
                    },
                  });
                },
              });
            },
          });
        },
      });
    },
  });
}

// ─── CONTINUOUS ANIMATIONS ───────────────────────────────────────────
function scheduleCorePacket() {
  if (!netVisible) return;
  corePacket = { dcIdx: Math.floor(Math.random() * 3) };
  corePacketTimer = 0;
  setTimeout(scheduleCorePacket, 2200);
}

function scheduleActiveConnection() {
  if (!netVisible) return;
  const epIdx = Math.floor(Math.random() * 6);
  activeConnection = { epIdx };
  activeConnTimer = 0;
  setTimeout(scheduleActiveConnection, 3000);
}

// ─── GLITCH EFFECT ──────────────────────────────────────────────────
function glitchWord(span) {
  if (flags.isReducedMotion) return;
  const original = span.textContent.trim();
  if (!original) return;
  const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&';
  let glitched = '';
  for (let i = 0; i < original.length; i++) {
    glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
  }
  span.textContent = glitched;
  setTimeout(() => { span.textContent = original; }, 60);
}

// ─── SCROLL PARALLAX (desktop only — no parallax on ≤1024px) ────────
function initScrollParallax() {
  // Don't run parallax on tablet/mobile — it's a continuous RAF loop
  if (window.innerWidth <= 1024) return;
  const col = document.querySelector('.hero-msp-topology-col');
  if (!col) return;

  // Convert to scroll-driven to avoid a perpetual RAF loop that can't be killed
  // Fallback: use a scroll event listener with passive true + RAF throttle
  let tickPending = false;
  function onScroll() {
    if (tickPending) return;
    tickPending = true;
    requestAnimationFrame(() => {
      tickPending = false;
      if (!mspIsActive()) return;
      const sy = window.scrollY * -0.25;
      col.style.transform = `translateY(${sy}px)`;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}
