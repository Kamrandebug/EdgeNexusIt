/**
 * hero-itsupport.js — IT Support Hero
 *
 * Animations:
 *  1. Split-flap character reveal headline
 *  2. Canvas noise flow field background
 *  3. Blur -> sharp focus pull with ScrollTrigger
 *  4. Live ticket timers
 *  5. Entry choreography timeline + hero pin
 */

export function initHeroItsupport(tier = 'high', isMobile = false, reducedMotion = false) {

  /* ─── A) SPLIT-FLAP CHARACTER REVEAL ─────────────────── */

  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&/\\|';
  const FLIP_INTERVAL = 38;
  const FLIPS_PER_CHAR = 12;
  const CHAR_STAGGER = 55;

  let splitFlapResolve = null;

  function initSplitFlap() {
    return new Promise((resolve) => {
      splitFlapResolve = resolve;
      const lines = document.querySelectorAll('.flap-line');

      if (reducedMotion) {
        lines.forEach(line => {
          const text = line.getAttribute('data-text') || '';
          line.textContent = text;
        });
        resolve();
        return;
      }

      lines.forEach((line, lineIdx) => {
        const text = line.getAttribute('data-text') || '';
        line.innerHTML = '';

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === ' ') {
            const sp = document.createElement('span');
            sp.className = 'flap-space';
            sp.style.width = '0.28em';
            sp.style.display = 'inline-block';
            line.appendChild(sp);
            continue;
          }

          const charSpan = document.createElement('span');
          charSpan.className = 'flap-char';
          const inner = document.createElement('span');
          inner.className = 'flap-char-inner';
          inner.textContent = ch;
          charSpan.appendChild(inner);
          line.appendChild(charSpan);
        }
      });

      // Pre-measure character widths
      const allChars = document.querySelectorAll('.flap-char');
      allChars.forEach(el => {
        const inner = el.querySelector('.flap-char-inner');
        const w = inner.offsetWidth;
        el.style.width = w + 'px';
      });
    });
  }

  function startSplitFlap() {
    if (reducedMotion) return;
    const allChars = document.querySelectorAll('.flap-char');
    const totalChars = allChars.length;
    let settledCount = 0;

    allChars.forEach((charEl, idx) => {
      const inner = charEl.querySelector('.flap-char-inner');
      const finalChar = inner.textContent;
      let flips = 0;
      let intervalId;

      setTimeout(() => {
        intervalId = setInterval(() => {
          const randChar = CHARSET[Math.floor(Math.random() * CHARSET.length)];
          inner.textContent = randChar;
          flips++;

          if (flips >= FLIPS_PER_CHAR) {
            clearInterval(intervalId);
            inner.textContent = finalChar;
            inner.classList.add('settled');
            settledCount++;
            if (settledCount >= totalChars) {
              if (splitFlapResolve) splitFlapResolve();
            }
          }
        }, FLIP_INTERVAL);
      }, idx * CHAR_STAGGER);
    });
  }

  /* ─── B) NOISE FLOW FIELD ────────────────────────────── */

  const flowCanvas = document.getElementById('flow-field-canvas');
  let flowCtx = null;
  let flowRafId = null;
  let noiseGrid = [];
  let particles = [];
  let flowW = 0, flowH = 0;
  let noiseResizeTimer = null;

  function initNoiseFlowField() {
    if (!flowCanvas) return;
    flowCtx = flowCanvas.getContext('2d');

    const parent = flowCanvas.parentElement;
    flowW = parent.clientWidth;
    flowH = parent.clientHeight;
    flowCanvas.width = flowW;
    flowCanvas.height = flowH;

    // Build noise grid (cell size 20px)
    const cols = Math.ceil(flowW / 20) + 1;
    const rows = Math.ceil(flowH / 20) + 1;
    noiseGrid = [];
    for (let r = 0; r < rows; r++) {
      noiseGrid[r] = [];
      for (let c = 0; c < cols; c++) {
        noiseGrid[r][c] = Math.random() * Math.PI * 2;
      }
    }

    // Particle counts per tier
    const count = reducedMotion ? 0
                 : tier === 'high' ? 180
                 : tier === 'mid' ? 90
                 : 40;

    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(resetParticle({}));
    }

    if (reducedMotion) {
      drawStaticFlow();
      return;
    }

    // RAF loop
    if (flowRafId) cancelAnimationFrame(flowRafId);
    flowRafId = requestAnimationFrame(tickFlow);
  }

  function resetParticle(p) {
    p.x = Math.random() * flowW;
    p.y = Math.random() * flowH;
    p.speed = 0.6 + Math.random() * 0.8;
    p.life = 0;
    p.maxLife = 60 + Math.random() * 80;
    p.alpha = 0;
    p.size = 0.8 + Math.random() * 0.7;
    return p;
  }

  function sampleNoise(x, y) {
    const cell = 20;
    const cols = Math.ceil(flowW / cell) + 1;
    const c = x / cell;
    const r = y / cell;
    const c0 = Math.floor(c);
    const r0 = Math.floor(r);
    const c1 = Math.min(c0 + 1, cols - 1);
    const r1 = Math.min(r0 + 1, noiseGrid.length - 1);
    const fx = c - c0;
    const fy = r - r0;

    function lerp(a, b, t) { return a + (b - a) * t; }
    const top = lerp(noiseGrid[r0]?.[c0] || 0, noiseGrid[r0]?.[c1] || 0, fx);
    const bot = lerp(noiseGrid[r1]?.[c0] || 0, noiseGrid[r1]?.[c1] || 0, fx);
    return lerp(top, bot, fy);
  }

  function drawStaticFlow() {
    if (!flowCtx) return;
    flowCtx.clearRect(0, 0, flowW, flowH);
    // Draw subtle dots at grid intersections
    const cell = 20;
    flowCtx.fillStyle = 'rgba(0,170,255,0.04)';
    for (let x = 0; x < flowW; x += cell) {
      for (let y = 0; y < flowH; y += cell) {
        flowCtx.beginPath();
        flowCtx.arc(x, y, 0.5, 0, Math.PI * 2);
        flowCtx.fill();
      }
    }
  }

  function tickFlow() {
    if (!flowCtx) return;
    flowCtx.fillStyle = 'rgba(2,5,8, 0.15)';
    flowCtx.fillRect(0, 0, flowW, flowH);

    // Slowly drift noise angles
    noiseGrid.forEach(row => {
      row.forEach((val, i) => {
        row[i] += 0.003;
      });
    });

    particles.forEach(p => {
      const angle = sampleNoise(p.x, p.y);
      p.x += Math.cos(angle) * p.speed;
      p.y += Math.sin(angle) * p.speed;
      p.life++;
      p.alpha = Math.min(p.life / 20, 1, (p.maxLife - p.life) / 20) * 0.7;

      if (p.x < 0) p.x = flowW;
      if (p.x > flowW) p.x = 0;
      if (p.y < 0) p.y = flowH;
      if (p.y > flowH) p.y = 0;

      if (p.life >= p.maxLife) resetParticle(p);

      flowCtx.fillStyle = `rgba(0,170,255,${p.alpha})`;
      flowCtx.beginPath();
      flowCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      flowCtx.fill();
    });

    flowRafId = requestAnimationFrame(tickFlow);
  }

  /* ─── C) FOCUS PULL (blur → sharp) ──────────────────── */

  function initFocusPull() {
    const panel = document.getElementById('itsupport-panel');
    if (!panel) return;

    if (reducedMotion) {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
      panel.style.filter = 'blur(0px)';
      const bar = document.getElementById('response-bar');
      if (bar) bar.style.width = '72%';
      return;
    }

    ScrollTrigger.create({
      trigger: '#hero-itsupport',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(panel, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        setTimeout(() => panel.classList.add('focused'), 200);
        gsap.to('#response-bar', { width: '72%', duration: 1.4, ease: 'expo.out', delay: 0.8 });
      }
    });
  }

  /* ─── D) TICKET TIMERS ──────────────────────────────── */

  let timerInterval = null;
  let ticketSectionObserver = null;

  function initTicketTimers() {
    const timers = document.querySelectorAll('.ticket-timer[data-seconds]');
    if (!timers.length) return;

    if (reducedMotion) return;

    timerInterval = setInterval(() => {
      timers.forEach(el => {
        if (el.closest('.ticket-resolved')) return;
        let sec = parseInt(el.getAttribute('data-seconds'), 10);
        sec++;
        el.setAttribute('data-seconds', sec);
        const mins = Math.floor(sec / 60);
        const remaining = sec % 60;
        el.textContent = mins + ':' + String(remaining).padStart(2, '0');

        // P0 overdue urgency
        const row = el.closest('.ticket-row');
        if (row && row.dataset.severity === 'p0' && sec > 300) {
          row.classList.add('overdue');
        }
      });
    }, 1000);

    // Pause timers when section off-screen
    const hero = document.getElementById('hero-itsupport');
    if (hero) {
      ticketSectionObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting && timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          } else if (e.isIntersecting && !timerInterval) {
            timerInterval = setInterval(() => {
              document.querySelectorAll('.ticket-timer[data-seconds]').forEach(el => {
                if (el.closest('.ticket-resolved')) return;
                let sec = parseInt(el.getAttribute('data-seconds'), 10);
                sec++;
                el.setAttribute('data-seconds', sec);
                const mins = Math.floor(sec / 60);
                const remaining = sec % 60;
                el.textContent = mins + ':' + String(remaining).padStart(2, '0');
              });
            }, 1000);
          }
        });
      }, { rootMargin: '200px' });
      ticketSectionObserver.observe(hero);
    }
  }

  /* ─── E) ENTRY CHOREOGRAPHY + HERO PIN ─────────────── */

  function initHeroEntry() {
    const tl = gsap.timeline({ paused: true });

    // t=0.03: scanline fade in
    tl.to('body', { '--scanline-opacity': 1, duration: 0.4, ease: 'power2.out' }, 0.03);

    // t=0.15: eyebrow fade in
    tl.to('.hero-eyebrow', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.15);

    // t=0.35: trigger split-flap
    tl.add(() => startSplitFlap(), 0.35);

    // t=1.8: body text
    tl.to('.hero-body', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.8);

    // t=2.1: CTA buttons
    tl.to('.hero-cta-row', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 2.1);

    tl.play();

    // Hero pin: ScrollTrigger
    ScrollTrigger.create({
      trigger: '#hero-itsupport',
      start: 'top top',
      end: isMobile ? '+=80%' : '+=120%',
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      toggleActions: 'play none none none',
      onUpdate: (self) => {
        if (self.progress > 0.7) {
          const p = (self.progress - 0.7) / 0.3;
          gsap.to('.hero-itsupport-copy', {
            opacity: 1 - p,
            y: -80 * p,
            overwrite: 'auto'
          });
        } else {
          gsap.to('.hero-itsupport-copy', {
            opacity: 1,
            y: 0,
            overwrite: 'auto'
          });
        }
      }
    });
  }

  /* ─── INIT ──────────────────────────────────────────── */

  const splitFlapPromise = initSplitFlap();
  splitFlapPromise.then(() => {
    // Split-flap settled — body and CTAs already handled in timeline
  });

  initNoiseFlowField();
  initFocusPull();
  initTicketTimers();

  if (reducedMotion) {
    gsap.set('.hero-eyebrow', { opacity: 1 });
    gsap.set('.hero-body', { opacity: 1, y: 0 });
    gsap.set('.hero-cta-row', { opacity: 1, y: 0 });
    return;
  }

  initHeroEntry();

  // Visibility guard
  gsap.set('.hero-itsupport-panel', { opacity: 1, visibility: 'visible' });
  gsap.set('#flow-field-canvas', { opacity: 1 });

  // Resize handler
  window.addEventListener('resize', () => {
    clearTimeout(noiseResizeTimer);
    noiseResizeTimer = setTimeout(() => {
      const parent = flowCanvas?.parentElement;
      if (parent && flowCanvas) {
        flowW = parent.clientWidth;
        flowH = parent.clientHeight;
        flowCanvas.width = flowW;
        flowCanvas.height = flowH;
        const cols = Math.ceil(flowW / 20) + 1;
        const rows = Math.ceil(flowH / 20) + 1;
        noiseGrid = [];
        for (let r = 0; r < rows; r++) {
          noiseGrid[r] = [];
          for (let c = 0; c < cols; c++) {
            noiseGrid[r][c] = Math.random() * Math.PI * 2;
          }
        }
      }
    }, 250);
  });
}
