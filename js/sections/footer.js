// Footer — enhances existing static HTML with sparkline, uptime ticker, and NOC rotator
export function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  // Inject sparkline into NOC status column if canvas exists but no SVG yet
  const nocCol = footer.querySelector('.footer-noc');
  const sparklineCanvas = footer.querySelector('#footer-sparkline');
  if (nocCol && sparklineCanvas && !document.getElementById('sparkline-svg')) {
    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'noc-item';
    svgWrapper.innerHTML = `
      <svg class="sparkline-svg" id="sparkline-svg" viewBox="0 0 120 40">
        <path class="sparkline-fill" id="sparkline-fill" />
        <path class="sparkline-path" id="sparkline-path" />
      </svg>
    `;
    // Hide the static canvas placeholder
    sparklineCanvas.style.display = 'none';
    nocCol.appendChild(svgWrapper);
  }

  // Inject uptime ticker into NOC strip if not present
  const nocStrip = footer.querySelector('.noc-strip');
  if (nocStrip && !document.getElementById('uptime-ticker')) {
    const divider = document.createElement('span');
    divider.className = 'text-label';
    divider.textContent = '|';
    divider.style.flexShrink = '0';
    const tickerItem = document.createElement('span');
    tickerItem.className = 'text-label';
    tickerItem.id = 'uptime-ticker';
    tickerItem.textContent = 'UPTIME: 847d 14h 23m 41s';
    nocStrip.appendChild(divider);
    nocStrip.appendChild(tickerItem);
  }

  // Ensure NOC status element has correct ID for rotator
  const nocStatusEl = footer.querySelector('#noc-status');
  if (!nocStatusEl) {
    const liveIndicator = nocStrip?.querySelector('.text-label');
    if (liveIndicator && liveIndicator.textContent.includes('LIVE')) {
      liveIndicator.id = 'noc-status';
    }
  }

  initSparkline();
  initUptimeTicker();
  initNOCMetrics();
}

function initSparkline() {
  const svg      = document.getElementById('sparkline-svg');
  const path     = document.getElementById('sparkline-path');
  const fillPath = document.getElementById('sparkline-fill');
  if (!svg || !path) return;

  let values = Array(20).fill(99.99);
  const W    = 120, H = 40;

  function mapToY(v) {
    return H - ((v - 99.95) / 0.05) * H;
  }

  function update() {
    values.shift();
    values.push(99.965 + Math.random() * 0.035);

    const pts = values.map((v, i) => ({
      x: (i / 19) * W,
      y: mapToY(v),
    }));

    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    path.setAttribute('d', d);

    // Area fill (close to bottom)
    if (fillPath) {
      const fillD = d + ` L ${W} ${H} L 0 ${H} Z`;
      fillPath.setAttribute('d', fillD);
    }
  }

  // Add gradient def
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#00aaff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#00aaff" stop-opacity="0"/>
    </linearGradient>
  `;
  svg.insertBefore(defs, svg.firstChild);

  setInterval(update, 2000);
  update();
}

function initUptimeTicker() {
  const el = document.getElementById('uptime-ticker');
  if (!el) return;

  const start = new Date('2024-01-01T00:00:00Z').getTime();

  setInterval(() => {
    const now = Date.now();
    const diff = now - start;

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    if (window.innerWidth <= 768) {
      el.textContent = `UPTIME: ${days}d ${hours}h`;
    } else {
      el.textContent = `UPTIME: ${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
    }
  }, 1000);
}

function initNOCMetrics() {
  // Rotate through fake NOC status messages
  const messages = [
    'ALL SYSTEMS NOMINAL',
    'EDGE NODE PKT-9 OPTIMIZING...',
    'THREAT SCAN: 0 ANOMALIES',
    'LATENCY: 1.8ms AVG',
    'CDN CACHE HIT: 99.2%',
  ];
  const el = document.getElementById('noc-status');
  if (!el) return;

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % messages.length;
    gsap.fromTo(el,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
        onStart() { el.textContent = messages[idx]; } }
    );
  }, 5000);
}
