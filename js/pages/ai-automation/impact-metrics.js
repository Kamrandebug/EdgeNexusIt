/**
 * impact-metrics.js — The Numbers Don't Lie
 *  (a) 4 drum-counter stat cards (matches it-support/sla-stats.js pattern)
 *  (b) Live oscilloscope activity chart (3 stacked bezier random-walk lines)
 *
 * Drum data-target holds the raw numeric string WITHOUT a decimal point.
 * data-decimals controls how many decimals; data-display holds the visual
 * string (e.g. "97.3"). Each digit = 1.1em tall (matches CSS).
 */

export function initImpactMetrics(reducedMotion = false) {
  const section = document.getElementById('impact-metrics');
  if (!section) return;

  const counters = Array.from(section.querySelectorAll('.drum-counter'));
  initDrumCounters(counters, reducedMotion);
  initActivityChart(reducedMotion);
}

// ════════════════════════════════════════════════════════════════
//  DRUM COUNTERS
// ════════════════════════════════════════════════════════════════
function initDrumCounters(counters, reducedMotion) {
  if (!counters.length) return;

  // Build drum columns from data attributes
  counters.forEach(counter => {
    const targetStr = counter.getAttribute('data-target') || '0';
    const decimals  = parseInt(counter.getAttribute('data-decimals') || '0', 10);
    const display   = counter.getAttribute('data-display') || targetStr;
    const digitsEl  = counter.querySelector('.drum-digits');
    if (!digitsEl) return;

    const digitChars = decimals > 0 ? display.replace('.', '').split('') : targetStr.split('');

    digitsEl.innerHTML = '';
    digitChars.forEach(ch => {
      if (ch === '.') {
        const dot = document.createElement('span');
        dot.className = 'drum-suffix';
        dot.style.cssText = 'font-size:0.5em;align-self:center;margin:0 2px;color:var(--t2);';
        dot.textContent = '.';
        digitsEl.appendChild(dot);
        return;
      }
      const place = document.createElement('span');
      place.className = 'drum-place';
      const col = document.createElement('span');
      col.className = 'drum-column';
      for (let d = 0; d <= 9; d++) {
        const item = document.createElement('span');
        item.className = 'drum-digit-item';
        item.textContent = d;
        col.appendChild(item);
      }
      place.appendChild(col);
      digitsEl.appendChild(place);
    });
  });

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    counters.forEach(c => snapDrumFinal(c));
    document.querySelectorAll('.metric-card').forEach(c => {
      c.style.opacity = '1'; c.style.transform = 'none'; c.classList.add('revealed');
    });
    return;
  }

  // Trigger on scroll
  ScrollTrigger.create({
    trigger: '#impact-metrics',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      document.querySelectorAll('.metric-card').forEach((card, i) => {
        gsap.to(card, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: i * 0.1, overwrite: 'auto',
          onComplete: () => card.classList.add('revealed'),
        });
      });
      counters.forEach((counter, idx) => startDrumRoll(counter, idx * 0.15));
    },
  });
}

function startDrumRoll(counter, delay) {
  const targetStr = counter.getAttribute('data-target') || '0';
  const decimals  = parseInt(counter.getAttribute('data-decimals') || '0', 10);
  const display   = counter.getAttribute('data-display') || targetStr;
  const digitChars = decimals > 0 ? display.replace('.', '').split('') : targetStr.split('');

  const places = Array.from(counter.querySelectorAll('.drum-place'));
  // Map digit chars (skipping dots) to places in order
  const targetDigits = digitChars.filter(c => c !== '.');

  for (let i = places.length - 1; i >= 0; i--) {
    const place = places[i];
    const col = place.querySelector('.drum-column');
    if (!col) continue;
    const digit = parseInt(targetDigits[i] || '0', 10);
    const placeFromRight = places.length - 1 - i;
    const duration = 0.55 + placeFromRight * 0.2;
    const finalY = -digit * 1.1;
    gsap.to(col, {
      y: finalY + 'em',
      duration,
      ease: 'power3.out',
      delay: delay + (places.length - 1 - i) * 0.05,
      overwrite: 'auto',
    });
  }
}

function snapDrumFinal(counter) {
  const targetStr = counter.getAttribute('data-target') || '0';
  const decimals  = parseInt(counter.getAttribute('data-decimals') || '0', 10);
  const display   = counter.getAttribute('data-display') || targetStr;
  const digitChars = decimals > 0 ? display.replace('.', '').split('') : targetStr.split('');
  const targetDigits = digitChars.filter(c => c !== '.');
  const places = Array.from(counter.querySelectorAll('.drum-place'));
  places.forEach((place, i) => {
    const col = place.querySelector('.drum-column');
    if (!col) return;
    const digit = parseInt(targetDigits[i] || '0', 10);
    col.style.transform = `translateY(${-digit * 1.1}em)`;
  });
}

// ════════════════════════════════════════════════════════════════
//  ACTIVITY CHART — 3 stacked oscilloscope lines
// ════════════════════════════════════════════════════════════════
function initActivityChart(reducedMotion) {
  const canvas = document.getElementById('ai-activity-chart');
  if (!canvas) return;

  const colors = ['#00aaff', '#ff6b00', '#ff2d55'];
  const labels = ['INFERENCE', 'TRAINING', 'DEPLOYMENT'];
  const POINT_COUNT = 60;
  const series = colors.map(() => Array.from({ length: POINT_COUNT }, () => 0.4 + Math.random() * 0.3));

  let ctx, w, h;
  let raf = null;
  let tickTimer = null;
  let visible = false;

  function sizeChart() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width || canvas.offsetWidth || 600;
    h = rect.height || 120;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    canvas.style.height = h + 'px';
    ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function newDatapoint() {
    series.forEach((line, idx) => {
      const last = line[line.length - 1];
      const drift = (Math.random() - 0.5) * 0.18;
      let next = last + drift;
      // each series has a slight bias / band
      const center = 0.35 + idx * 0.18;
      next = Math.max(0.08, Math.min(0.92, next + (center - next) * 0.05));
      line.push(next);
      line.shift();
    });
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // Faint grid
    ctx.strokeStyle = 'rgba(0,170,255,0.06)';
    ctx.lineWidth = 1;
    for (let gy = 0; gy <= h; gy += h / 4) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    colors.forEach((color, idx) => {
      const line = series[idx];
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      line.forEach((v, i) => {
        const x = (i / (POINT_COUNT - 1)) * w;
        const y = h - v * h;
        if (i === 0) ctx.moveTo(x, y);
        else {
          // smooth via simple midpoint
          const prevX = ((i - 1) / (POINT_COUNT - 1)) * w;
          const prevY = h - line[i - 1] * h;
          const mx = (prevX + x) / 2;
          const my = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, mx, my);
        }
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    raf = null;
  }

  function loop() {
    if (!visible) { raf = null; return; }
    draw();
    raf = requestAnimationFrame(loop);
  }

  sizeChart();

  if (reducedMotion) {
    draw(); // static single frame
    return;
  }

  // New datapoint every 800ms
  tickTimer = setInterval(() => { if (visible) newDatapoint(); }, 800);

  // Off-screen pause
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      visible = en.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
  }, { rootMargin: '100px' });
  obs.observe(canvas);

  // Debounced resize
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { sizeChart(); if (visible) draw(); }, 200);
  });

  // Kick off
  visible = true;
  raf = requestAnimationFrame(loop);
}
