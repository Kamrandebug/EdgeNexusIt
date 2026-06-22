// js/pages/cyber-security/killchain.js
// v3 — forensic waveform (replaces intercept glitch with clamped waveform + flatline)

function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

function generateWaveformSamples() {
  const rng = seededRandom(42);
  const samples = new Array(120);
  for (let i = 0; i < 120; i++) {
    let amp;
    if (i < 25) {
      // RECON: ±4px
      amp = (rng() * 2 - 1) * 4;
    } else if (i < 49) {
      // DELIVERY: ±8px
      amp = (rng() * 2 - 1) * 8;
    } else if (i < 97) {
      // EXPLOIT (49-72) + INTERCEPT (73-96): ±18px jagged
      amp = (rng() * 2 - 1) * 18;
    } else {
      // CONTAINED (97-119): settled, covered by flatline
      amp = (rng() * 2 - 1) * 4;
    }
    samples[i] = amp;
  }
  return samples;
}

function createWaveformSVG(section, wrapper) {
  if (!wrapper) return null;
  const width = wrapper.offsetWidth || 1200;
  const samples = generateWaveformSamples();
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'waveform-svg');
  svg.setAttribute('viewBox', `0 0 ${width} 120`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:120px;pointer-events:none;overflow:visible;z-index:1';

  const baseline = 60;

  // --- Base jagged polyline ---
  const basePoints = samples.map((amp, i) => {
    const x = (i / 119) * width;
    return `${x.toFixed(1)},${(baseline + amp).toFixed(1)}`;
  }).join(' ');

  const basePoly = document.createElementNS(NS, 'polyline');
  basePoly.setAttribute('class', 'waveform-base');
  basePoly.setAttribute('points', basePoints);
  basePoly.setAttribute('stroke', 'var(--accent-border)');
  basePoly.setAttribute('stroke-width', '1.5');
  basePoly.setAttribute('fill', 'none');

  // --- Flatline overlay polyline ---
  const flatlinePoints = samples.map((_, i) => {
    const x = (i / 119) * width;
    return `${x.toFixed(1)},${baseline}`;
  }).join(' ');

  const flatPoly = document.createElementNS(NS, 'polyline');
  flatPoly.setAttribute('class', 'waveform-flatline');
  flatPoly.setAttribute('points', flatlinePoints);
  flatPoly.setAttribute('stroke', 'var(--accent)');
  flatPoly.setAttribute('stroke-width', '1.5');
  flatPoly.setAttribute('fill', 'none');
  flatPoly.style.clipPath = 'inset(0 100% 0 0)';

  // --- Clamp brackets (positioned at INTERCEPT start = sample 73) ---
  const bracketX = (73 / 119) * width;
  const bracketArm = 8;
  const bracketLeg = 8;

  function makeBracket(className, armDir, yOff) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', className);
    const p = document.createElementNS(NS, 'path');
    const startY = baseline + yOff;
    // arm extends right from bracketX, leg extends vertically
    // Top: ┐ — arm goes right, leg goes down
    // Bottom: ┘ — arm goes right, leg goes up
    const armEndX = bracketX + (armDir > 0 ? bracketArm : -bracketArm);
    const legEndY = startY + bracketLeg * armDir;
    p.setAttribute('d', `M${bracketX},${startY} L${armEndX},${startY} L${armEndX},${legEndY}`);
    p.setAttribute('stroke', 'var(--accent)');
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('fill', 'none');
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    g.appendChild(p);
    return g;
  }

  const topBracket = makeBracket('clamp-bracket clamp-bracket-top', 1, 28);
  const bottomBracket = makeBracket('clamp-bracket clamp-bracket-bottom', 1, -28);

  svg.appendChild(basePoly);
  svg.appendChild(flatPoly);
  svg.appendChild(topBracket);
  svg.appendChild(bottomBracket);
  wrapper.appendChild(svg);

  return { flatPoly, topBracket, bottomBracket, bracketX, baseline };
}

export function initKillchain({ tier = 'high', reducedMotion = false, isMobile = false } = {}) {
  const section = document.getElementById('killchain');
  if (!section) return;

  const trackNodes = section.querySelectorAll('.track-node');
  const trackDots = section.querySelectorAll('.track-dot');
  const stagePanels = section.querySelectorAll('.stage-panel');
  const prefersReducedMotion = reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentStage = -1;
  let rawScrollProgress = 0;

  // Create waveform SVG (decorative background for all viewports)
  const trackWrapper = section.querySelector('.killchain-track-wrapper');
  const waveformState = createWaveformSVG(section, trackWrapper);
  const flatPoly = waveformState?.flatPoly || null;
  const topBracket = waveformState?.topBracket || null;
  const bottomBracket = waveformState?.bottomBracket || null;

  function updateFlatlineClip(rawProgress) {
    if (!flatPoly) return;
    // stages 3-4 span progress 0.6->1.0
    const p3_start = 0.6;
    const p3_end = 1.0;
    if (rawProgress < p3_start) {
      flatPoly.style.clipPath = 'inset(0 100% 0 0)';
    } else {
      const sub = Math.min(1, Math.max(0, (rawProgress - p3_start) / (p3_end - p3_start)));
      // clip from right: 100% -> 0%
      const clipPct = 100 - sub * 100;
      flatPoly.style.clipPath = `inset(0 ${clipPct.toFixed(1)}% 0 0)`;
    }
  }

  // --- Reduced-motion: trigger all panels once, show waveform in complete state ---
  if (prefersReducedMotion) {
    stagePanels.forEach(p => {
      p.removeAttribute('hidden');
      ScrollTrigger.create({ trigger: p, start: 'top 80%', onEnter: () => { cmdType(p); barAnim(p); }, once: true });
    });
    if (flatPoly) flatPoly.style.clipPath = 'inset(0 0% 0 0)';
    if (topBracket) gsap.set(topBracket, { opacity: 1, y: 0 });
    if (bottomBracket) gsap.set(bottomBracket, { opacity: 1, y: 0 });
    return;
  }

  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": () => {
      gsap.to('.track-line-fill', {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: '#killchain', start: 'top top', end: isMobile ? '+=150%' : '+=250%', pin: true, scrub: 1,
          onUpdate: (s) => {
            rawScrollProgress = s.progress;
            const stage = Math.min(4, Math.floor(s.progress * 5));
            activateStage(stage);
            updateFlatlineClip(s.progress);
          }
        }
      });
    },
    "(min-width: 769px) and (max-width: 1024px)": () => {
      // Tablet: individual panel ScrollTriggers, no scrub
      if (flatPoly) flatPoly.style.clipPath = 'inset(0 100% 0 0)';
      stagePanels.forEach(p => {
        p.removeAttribute('hidden');
        ScrollTrigger.create({ trigger: p, start: 'top 80%', onEnter: () => {
          const si = Array.from(p.parentElement.children).indexOf(p);
          trackNodes.forEach((n, i) => n.classList.toggle('active', i === si));
          cmdType(p); barAnim(p);
        }, once: true });
      });
    },
    "(max-width: 768px)": () => {
      // Mobile: vertical stack fallback
      if (flatPoly) flatPoly.style.clipPath = 'inset(0 100% 0 0)';
      stagePanels.forEach(p => {
        p.removeAttribute('hidden');
        gsap.set(p, { opacity: 0, y: 20, visibility: 'visible' });
        ScrollTrigger.create({
          trigger: p, start: 'top 85%', onEnter: () => {
            gsap.to(p, { opacity: 1, y: 0, visibility: 'visible', duration: 0.5, ease: 'expo.out' });
            cmdType(p); barAnim(p);
          }, once: true
        });
      });
    }
  });

  function activateStage(n) {
    if (n === currentStage) return;
    const enteringIntercept = n === 3 && currentStage !== 3;
    const retreatingFromIntercept = currentStage >= 3 && n < 3;

    trackNodes.forEach((node, i) => {
      if (i === 3) node.classList.toggle('active', i <= n);
      else node.classList.toggle('active', i === n);
    });

    stagePanels.forEach((panel, i) => {
      if (i === n) {
        panel.removeAttribute('hidden');
        gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' });
        cmdType(panel); barAnim(panel);
      } else {
        panel.setAttribute('hidden', '');
        gsap.set(panel, { opacity: 0, y: 0 });
      }
    });

    trackDots.forEach((dot, i) => dot.classList.toggle('lit', Math.floor(i / 3) < n));

    // --- Clamp brackets on INTERCEPT (stage 3) ---
    if (enteringIntercept) {
      if (topBracket) gsap.fromTo(topBracket, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' });
      if (bottomBracket) gsap.fromTo(bottomBracket, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' });
    }
    if (retreatingFromIntercept) {
      if (topBracket) gsap.to(topBracket, { opacity: 0, y: -40, duration: 0.2 });
      if (bottomBracket) gsap.to(bottomBracket, { opacity: 0, y: 40, duration: 0.2 });
    }

    currentStage = n;
  }

  function barAnim(p) {
    p.querySelectorAll('.stat-fill').forEach(f => {
      gsap.fromTo(f, { width: '0%' }, { width: (f.dataset.width || '100') + '%', duration: 1, ease: 'expo.out' });
    });
  }

  function cmdType(p) {
    const o = p.querySelector('.pipeline-terminal__output');
    const c = o?.dataset.cmd;
    if (!c) return;
    if (o._ti) clearInterval(o._ti);
    o.textContent = '';
    let i = 0;
    o._ti = setInterval(() => { if (i < c.length) o.textContent += c[i++]; else clearInterval(o._ti); }, 20);
  }
}
