/**
 * hero-ai.js — AI Automation Hero — "Brain.png + Ambient Canvas"
 *
 * Sub-systems:
 *  1. Ambient canvas — stars, particles, scan sweep line drawn on top of
 *     the Brain.png image (which is rendered via an <img> tag).
 *  2. Entry choreography — GSAP timeline reveals brain PNG, then ambient FX.
 *  3. Hero pin — ScrollTrigger pin with exit scrub after 0.7
 *
 * Tier gating:
 *   high: 40 stars, 24 particles
 *   mid:  20 stars, 12 particles
 *   low:  10 stars, 0 particles
 */

export function initHeroAI(tier = 'high', isMobile = false, reducedMotion = false) {
  const hero = document.getElementById('hero-ai');
  if (!hero) return;

/* ═══════════════════════════════════════════════════════════════
   AMBIENT CANVAS — Stars + Particles + Scan Sweep Line
   The brain itself is rendered by the <img id="brain-img"> tag.
   This canvas draws only atmospheric FX on top of the PNG.
═══════════════════════════════════════════════════════════════ */
function initAmbientCanvas(tier) {
  const canvas = document.getElementById('canvas-ambient');
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  let w, h;
  let time = 0;
  let isRunning = false;
  let rafId = null;
  let stars = [];
  let particles = [];
  let resizeTimeout = null;
  let sweepPhase = 0;

  // ── Tier config ──────────────────────────────────────────────
  const STAR_CT     = tier === 'high' ? 40 : (tier === 'mid' ? 20 : 10);
  const PARTICLE_CT = tier === 'high' ? 24 : (tier === 'mid' ? 12 : 0);

  // ════════════════════════════════════════════════════════════
  //  CANVAS SIZING
  // ════════════════════════════════════════════════════════════
  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const rw = rect.width  || canvas.parentElement?.offsetWidth  || 400;
    const rh = rect.height || canvas.parentElement?.offsetHeight || 500;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = rw * dpr;
    canvas.height = rh * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    w = rw; h = rh;
    initStars();
    initParticles();
  }

  // ── Star field (upper panel area only) ───────────────────────
  function initStars() {
    stars = Array.from({ length: STAR_CT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.55, // upper 55% of panel
      r: Math.random() * 1.3 + 0.4,
      phase: Math.random() * Math.PI * 2,
      freq: Math.random() * 2.0 + 0.8,
    }));
  }
  function drawStars() {
    for (const s of stars) {
      const a = 0.25 + 0.25 * Math.sin(time * s.freq + s.phase);
      ctx.fillStyle = `rgba(160, 210, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Ambient particles (drift around brain zone) ──────────────
  function initParticles() {
    if (PARTICLE_CT === 0) { particles = []; return; }
    particles = Array.from({ length: PARTICLE_CT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.5,
      phase: Math.random() * Math.PI * 2,
      freq: Math.random() * 1.5 + 0.5,
    }));
  }
  function drawParticles() {
    if (!particles.length) return;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      const a = 0.25 + 0.20 * Math.sin(time * p.freq + p.phase);
      ctx.fillStyle = `rgba(0, 200, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Connection lines (tier ≥ mid) ──────────────────────────
    if (PARTICLE_CT < 3) return;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const alpha = (1 - dist / 80) * 0.15;
          ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // ── Scan sweep line (rises through brain zone every ~2.2s) ──
  function drawScanSweep() {
    sweepPhase += 0.016 * 0.45; // 1 full cycle ≈ 2.2s
    const sweepNorm = (sweepPhase % 1); // 0 → 1

    // Sweep rises from 20% to 80% of panel height
    const sweepY = h * (0.20 + sweepNorm * 0.60);
    const sweepAlpha = Math.sin(sweepNorm * Math.PI) * 0.40; // fade in/out

    const halfSpan = w * 0.28;
    const sweepX1 = w * 0.50 - halfSpan;
    const sweepX2 = w * 0.50 + halfSpan;

    const sweepGrd = ctx.createLinearGradient(sweepX1, sweepY, sweepX2, sweepY);
    sweepGrd.addColorStop(0.0,  `rgba(0, 230, 255, 0)`);
    sweepGrd.addColorStop(0.15, `rgba(0, 230, 255, ${sweepAlpha})`);
    sweepGrd.addColorStop(0.50, `rgba(80, 240, 255, ${sweepAlpha * 1.3})`);
    sweepGrd.addColorStop(0.85, `rgba(0, 230, 255, ${sweepAlpha})`);
    sweepGrd.addColorStop(1.0,  `rgba(0, 230, 255, 0)`);

    ctx.strokeStyle = sweepGrd;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(sweepX1, sweepY);
    ctx.lineTo(sweepX2, sweepY);
    ctx.stroke();
  }

  // ── Main render loop ─────────────────────────────────────────
  function render() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, w, h);   // transparent clear — PNG shows through

    time += 0.016;

    drawStars();
    drawParticles();
    drawScanSweep();

    rafId = requestAnimationFrame(render);
  }

  // ── IntersectionObserver (off-screen pause) ──────────────────
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

  // ── Debounced resize ─────────────────────────────────────────
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { sizeCanvas(); }, 200);
  }

  // ── Public API ───────────────────────────────────────────────
  return {
    start() {
      sizeCanvas();
      observer.observe(canvas);
      window.addEventListener('resize', onResize, { passive: true });
    },
    stop() {
      isRunning = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    },
  };
}

  // ════════════════════════════════════════════════════════════
  //  ENTRY CHOREOGRAPHY + HERO PIN
  // ════════════════════════════════════════════════════════════
  function initHeroEntry() {
    // 1. Init ambient canvas (stars + particles + scan sweep)
    const ambient = initAmbientCanvas(tier);
    if (ambient) ambient.start();

    // 2. Get references for entry timeline
    const hologramPanel  = document.querySelector('.hero-ai-hologram-panel');
    const hologramLabel  = document.querySelector('.hero-ai-hologram-label');
    const brainImg       = document.getElementById('brain-img');
    const ambientCanvas  = document.getElementById('canvas-ambient');

    // 3. Set initial states
    if (hologramPanel) gsap.set(hologramPanel, { opacity: 0 });
    if (brainImg)      gsap.set(brainImg,      { opacity: 0, y: 30 });
    if (ambientCanvas) gsap.set(ambientCanvas, { opacity: 0 });

    // 4. Entry timeline
    const tlEntry = gsap.timeline({ delay: 0.1 });

    // t=0.00 — Scanline
    tlEntry.to('body', {
      '--scanline-opacity': 0.12,
      duration: 0.3,
      ease: 'none',
    }, 0.0);

    // t=0.10 — Panel fades in
    tlEntry.to(hologramPanel, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    }, 0.10);

    // t=0.25 — Brain PNG rises up and fades in
    tlEntry.to(brainImg, {
      opacity: 1,
      y: 0,
      duration: 0.90,
      ease: 'power3.out',
    }, 0.25);

    // t=0.45 — Ambient canvas fades in (after brain is visible)
    tlEntry.to(ambientCanvas, {
      opacity: 1,
      duration: 0.60,
      ease: 'power2.out',
    }, 0.45);

    // t=0.80 — Eyebrow text (clip reveal)
    tlEntry.fromTo('.hero-ai-eyebrow',
      { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'power2.out' }, 0.80);

    // t=1.10 — 3-word headline slam
    tlEntry.fromTo('.headline-word.word-1', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 1.10);
    tlEntry.fromTo('.headline-word.word-2', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 1.30);
    tlEntry.fromTo('.headline-word.word-3', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 1.50);

    // t=1.45 — Accent underline draw
    tlEntry.to('.headline-accent::after', { scaleX: 1, duration: 0.4, ease: 'expo.out' }, 1.45);
    tlEntry.to('.headline-accent', { textShadow: '0 0 24px rgba(0,170,255,0.4)', duration: 0.4 }, 1.45);

    // t=1.75 — Body text + CTAs fade
    tlEntry.to('.hero-ai-body', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.75);
    tlEntry.to('.hero-ai-ctas', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.95);

    // t=1.90 — Panel label fades in
    if (hologramLabel) {
      tlEntry.to(hologramLabel, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, 1.90);
    }

    // Hero pin — exit scrub after 0.7
    ScrollTrigger.create({
      trigger: '#hero-ai',
      start: 'top top',
      end: isMobile ? '+=80%' : '+=120%',
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        if (self.progress > 0.7) {
          const p = (self.progress - 0.7) / 0.3;
          gsap.to('.hero-ai-copy, .hero-ai-brain-wrap, .hero-ai-wheel-wrap, .hero-ai-hologram-panel', {
            opacity: 1 - p,
            y: -80 * p,
            overwrite: 'auto',
            duration: 0,
          });
        } else {
          gsap.to('.hero-ai-copy, .hero-ai-brain-wrap, .hero-ai-wheel-wrap, .hero-ai-hologram-panel', {
            opacity: 1, y: 0, overwrite: 'auto', duration: 0,
          });
        }
      },
    });
  }

  // ════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════

  if (reducedMotion) {
    // Reveal everything statically, no canvases / loops
    document.querySelectorAll('.hero-ai-eyebrow, .headline-word, .hero-ai-body, .hero-ai-ctas, .hero-ai-hologram-label')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none'; });
    const brainImg = document.getElementById('brain-img');
    if (brainImg) { brainImg.style.opacity = '1'; brainImg.style.transform = 'none'; }
    const ambientCanvas = document.getElementById('canvas-ambient');
    if (ambientCanvas) ambientCanvas.style.opacity = '0';
    return;
  }

  // Entry choreography + pin (GSAP must be loaded)
  if (window.gsap && window.ScrollTrigger) {
    initHeroEntry();
  }
}
