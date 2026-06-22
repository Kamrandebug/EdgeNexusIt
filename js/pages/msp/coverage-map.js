// js/pages/msp/coverage-map.js
// Global node reach: terminal typewriter + map entry + ping rings

export function initCoverageMap() {
  initMapEntry();
  initTerminalTypewriter();
  initPingRings();
}

// ── Map panel entry: scale fade-in ───────────────────────────────────
function initMapEntry() {
  const mapWrap = document.querySelector('.cm-map-wrap');
  if (!mapWrap) return;

  gsap.fromTo(mapWrap,
    { opacity: 0, scale: 0.97 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#coverage-map',
        start: 'top 70%',
        once: true,
      },
    }
  );

  // SVG arcs draw in sequence
  const arcs = document.querySelectorAll('.cm-arcs path');
  arcs.forEach((arc, i) => {
    const len = arc.getTotalLength();
    arc.style.strokeDasharray = len;
    arc.style.strokeDashoffset = len;

    gsap.to(arc, {
      strokeDashoffset: 0,
      duration: 0.4,
      delay: i * 0.4,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#coverage-map',
        start: 'top 60%',
        once: true,
      },
    });
  });
}

// ── Terminal block: typewriter line by line ──────────────────────────
function initTerminalTypewriter() {
  const terminal = document.querySelector('.cm-terminal');
  if (!terminal) return;

  const lines = Array.from(terminal.querySelectorAll('.cm-term-line'));
  const texts = lines.map(l => l.textContent);
  lines.forEach(l => { l.textContent = ''; l.style.opacity = '0'; });

  ScrollTrigger.create({
    trigger: '#coverage-map',
    start: 'top 65%',
    once: true,
    onEnter() {
      typeLines(lines, texts, 0);
    },
  });
}

function typeLines(lineEls, texts, lineIdx) {
  if (lineIdx >= lineEls.length) return;

  const el = lineEls[lineIdx];
  const text = texts[lineIdx];
  el.style.opacity = '1';

  let charIdx = 0;
  function typeChar() {
    if (charIdx >= text.length) {
      // Cursor blink pause, then next line
      el.innerHTML = text + '<span style="display:inline-block;width:8px;height:14px;background:var(--accent);animation:blink 1s infinite;margin-left:2px;vertical-align:middle"></span>';
      setTimeout(() => {
        el.innerHTML = text;
        typeLines(lineEls, texts, lineIdx + 1);
      }, 400);
      return;
    }
    el.textContent = text.substring(0, charIdx + 1);
    charIdx++;
    setTimeout(typeChar, 30);
  }
  typeChar();
}

// ── Continuous ping rings from dots (paused when off-screen) ────────
function initPingRings() {
  const mapOverlay = document.querySelector('.cm-map-overlay');
  if (!mapOverlay) return;

  let pingPaused = false;
  const section = document.getElementById('coverage-map');
  if (section) {
    const io = new IntersectionObserver(([entry]) => {
      pingPaused = !entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(section);
  }

  setInterval(() => {
    if (pingPaused) return;
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: absolute;
      top: ${25 + Math.random() * 50}%;
      left: ${25 + Math.random() * 50}%;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      border: 1px solid var(--accent);
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.6;
      pointer-events: none;
    `;
    mapOverlay.appendChild(ring);

    gsap.to(ring, {
      scale: 3,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => ring.remove(),
    });
  }, 2000);
}
