// js/components/preloader.js
const STATUSES = [
  'BOOTSTRAPPING CORE RUNTIME...',
  'MAPPING EDGE NODES...',
  'VERIFYING CRYPTOGRAPHIC CHAIN...',
  'ESTABLISHING SECURE TUNNEL...',
  'LOADING THREAT INTELLIGENCE...',
  'CALIBRATING LATENCY MONITORS...',
  'ALL SYSTEMS NOMINAL.',
];

const MAX_NODES = 24;

export function initPreloader(onComplete) {
  const el = document.getElementById('preloader');
  if (!el) { onComplete?.(); return; }

  // Build layout
  el.innerHTML = `
    <div class="pre-network-wrap">
      <svg id="pre-svg" width="320" height="200" viewBox="0 0 320 200"></svg>
    </div>
    <div class="pre-logo">EDGE<span>[NEXUS]</span></div>
    <div class="pre-bar-container"><div class="pre-bar-fill" id="pre-bar"></div></div>
    <div class="pre-status" id="pre-status">${STATUSES[0]}</div>
    <div class="pre-counter" id="pre-counter">00</div>
  `;

  const svg     = document.getElementById('pre-svg');
  const bar     = document.getElementById('pre-bar');
  const status  = document.getElementById('pre-status');
  const counter = document.getElementById('pre-counter');

  // Pre-compute random node positions
  const nodeData = Array.from({ length: MAX_NODES }, (_, i) => ({
    x: 20 + Math.random() * 280,
    y: 10 + Math.random() * 180,
    el: null,
  }));

  // Pre-compute edges (nearby pairs)
  const edgeData = [];
  nodeData.forEach((a, i) => {
    nodeData.forEach((b, j) => {
      if (j <= i) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 80) edgeData.push({ from: a, to: b, el: null });
    });
  });

  // SVG elements created but invisible
  edgeData.forEach(edge => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', edge.from.x); line.setAttribute('y1', edge.from.y);
    line.setAttribute('x2', edge.to.x);   line.setAttribute('y2', edge.to.y);
    line.style.stroke        = 'rgba(0, 170, 255, 0.25)';
    line.style.strokeWidth   = '0.5';
    line.style.opacity       = '0';
    svg.appendChild(line);
    edge.el = line;
  });

  nodeData.forEach(node => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '3');
    circle.style.fill    = 'rgba(0, 170, 255, 0.7)';
    circle.style.opacity = '0';
    svg.appendChild(circle);
    node.el = circle;
  });

  // Progress timeline
  let nodesShown = 0;

  const tl = gsap.timeline();

  tl.to({}, {
    duration: 1.4,       // was 2.6 — faster node reveal
    ease: 'power1.inOut',
    onUpdate() {
      const p    = this.progress();
      const pct  = Math.round(p * 100);

      bar.style.width     = `${pct}%`;
      counter.textContent = String(pct).padStart(2, '0');
      status.textContent  = STATUSES[Math.floor(p * (STATUSES.length - 1))];

      // Reveal nodes progressively
      const targetNodes = Math.floor(p * MAX_NODES);
      while (nodesShown < targetNodes && nodesShown < MAX_NODES) {
        const node = nodeData[nodesShown];
        gsap.to(node.el, { opacity: 1, duration: 0.3, ease: 'power2.out' });

        // Show edges connected to this node
        edgeData.forEach(edge => {
          if (edge.from === node || edge.to === node) {
            gsap.to(edge.el, { opacity: 1, duration: 0.4 });
          }
        });

        nodesShown++;
      }
    },
  });

  // All nodes pulse green at 100%
  tl.call(() => {
    nodeData.forEach((n, i) => {
      gsap.fromTo(n.el,
        { r: 3, fill: 'rgba(0,170,255,0.7)' },
        {
          r: 6,
          fill: '#00aaff',
          duration: 0.2,
          delay: i * 0.02,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        }
      );
    });
  });

  // Brief hold
  tl.to({}, { duration: 0.4 });

  // Implosion — all nodes collapse to center
  tl.addLabel('implosion');
  tl.call(() => {
    nodeData.forEach(n => {
      gsap.to(n.el, {
        attr: { cx: 160, cy: 100, r: 0 },
        duration: 0.5,
        ease: 'power3.in',
      });
    });
    edgeData.forEach(e => {
      gsap.to(e.el, { opacity: 0, duration: 0.3 });
    });
  });

  // 1. Flash and Cross-fade
  tl.to({}, { duration: 0.5 }); // Wait for implosion
  
  tl.call(() => {
    // Discharge flash
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed; inset:0; background:white; opacity:0; z-index:10000; pointer-events:none;';
    document.body.appendChild(flash);
    
    gsap.to(flash, {
      opacity: 0.04,
      duration: 0.04,
      yoyo: true,
      repeat: 1,
      onComplete: () => flash.remove()
    });

    // Notify hero to start expanding
    if (window._heroBridge) {
      window._heroBridge();
    } else {
      // Fallback: slide up if bridge isn't available
      gsap.to(el, { yPercent: -100, duration: 0.8, ease: 'expo.in' });
    }
  });

  tl.to(el, {
    opacity: window._heroBridge ? 0 : 1, // Only fade if bridge exists
    duration: 0.4,
    ease: 'power2.inOut',
    onComplete() {
      el.style.display = 'none';
      onComplete?.();
    },
  });
}
