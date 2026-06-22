// js/sections/soc.js — Security Operations Center Dashboard

/* ─── SECTION 1 — DATA ─── */

const THREAT_DATA = { critical:8, high:12, medium:9, low:3, total:32 };
const VULN_SCORE  = 72;

const ATTACK_ORIGINS = [
  { label:'United States', flag:'🇺🇸', pct:35 },
  { label:'Netherlands',   flag:'🇳🇱', pct:18 },
  { label:'Russia',        flag:'🇷🇺', pct:14 },
  { label:'Germany',       flag:'🇩🇪', pct:11 },
  { label:'Other',         flag:'●',   pct:22 },
];

const INCIDENTS_SEED = [
  { name:'Brute Force Login', time:'2m ago',  sev:'critical', icon:'⚡' },
  { name:'Malware Detected',  time:'15m ago', sev:'high',     icon:'⚠' },
  { name:'Unusual Access',    time:'32m ago', sev:'medium',   icon:'👁' },
  { name:'Phishing Attempt',  time:'1h ago',  sev:'low',      icon:'✉' },
];

const LIVE_POOL = [
  { name:'Port Scan Detected',    sev:'medium',   icon:'🔍' },
  { name:'SSH Login × 47 Failed', sev:'high',     icon:'⚡' },
  { name:'DNS Anomaly Flagged',   sev:'low',      icon:'📡' },
  { name:'Credential Stuffing',   sev:'critical', icon:'⚠'  },
  { name:'Traffic Spike Outbound',sev:'medium',   icon:'📈' },
  { name:'Privilege Escalation',  sev:'critical', icon:'🔒' },
];

const ATTACK_CITIES = {
  'United States': [-95,  38],
  'Netherlands':   [  5,  52],
  'Russia':        [ 60,  55],
  'Germany':       [ 10,  51],
  'China':         [105,  35],
  'Brazil':        [-50, -10],
};

const TARGET_CITY = [-0.5, 51.5];


/* ─── SECTION 2 — WORLD MAP (D3 + animated Canvas arcs overlay) ─── */

function initSOCMap() {
  const svgEl   = document.getElementById('soc-map-svg');
  const wrap    = svgEl.closest('.soc-map-wrap');

  function getSize() {
    const r = wrap.getBoundingClientRect();
    return { w: r.width, h: r.height || 180 };
  }

  const canvas  = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `;
  wrap.style.position = 'relative';
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const svg      = d3.select(svgEl);
  let projection, pathGen;

  function setupProjection(w, h) {
    projection = d3.geoNaturalEarth1()
      .scale((w / 640) * 100)
      .translate([w / 2, h / 2]);
    pathGen = d3.geoPath(projection);
  }

  function drawMap(world, w, h) {
    svg.attr('viewBox', `0 0 ${w} ${h}`)
       .attr('width', w)
       .attr('height', h);

    svg.selectAll('*').remove();

    const countries = topojson.feature(world, world.objects.countries);
    const borders   = topojson.mesh(
      world, world.objects.countries, (a, b) => a !== b
    );

    svg.append('rect')
       .attr('width', w).attr('height', h)
       .attr('fill', '#050d1e');

    svg.append('g')
       .selectAll('path')
       .data(countries.features)
       .join('path')
         .attr('d', pathGen)
         .attr('fill', '#0e1f3d')
         .attr('stroke', 'none');

    svg.append('path')
       .datum(borders)
       .attr('d', pathGen)
       .attr('fill', 'none')
       .attr('stroke', '#1a3560')
       .attr('stroke-width', 0.5);

    const graticule = d3.geoGraticule()();
    svg.append('path')
       .datum(graticule)
       .attr('d', pathGen)
       .attr('fill', 'none')
       .attr('stroke', '#0a1830')
       .attr('stroke-width', 0.3);
  }

  const SEV_COLORS = {
    critical: '#e05252',
    high:     '#e07820',
    medium:   '#c8a820',
    low:      '#28a86a',
  };

  const CITY_KEYS   = Object.keys(ATTACK_CITIES);
  const SEV_KEYS    = Object.keys(SEV_COLORS);

  const ARC_COUNT = 5;
  let arcs = [];

  function makeArc() {
    const cityKey = CITY_KEYS[Math.floor(Math.random() * CITY_KEYS.length)];
    const sev     = SEV_KEYS[Math.floor(Math.random() * SEV_KEYS.length)];
    return {
      cityKey,
      sev,
      color: SEV_COLORS[sev],
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.005,
      tailLen: 0.18,
    };
  }

  for (let i = 0; i < ARC_COUNT; i++) arcs.push(makeArc());

  const pulseRings = CITY_KEYS.map((k, i) => ({
    key: k,
    phase: (i / CITY_KEYS.length) * Math.PI * 2,
    radius: 0,
    maxRadius: 12,
  }));

  function projectCity(cityKey) {
    const [lon, lat] = ATTACK_CITIES[cityKey];
    return projection([lon, lat]);
  }

  function projectTarget() {
    return projection(TARGET_CITY);
  }

  function bezier(p0, p1, p2, t) {
    const x = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
    const y = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
    return [x, y];
  }

  function controlPoint(from, to, h) {
    return [
      (from[0] + to[0]) / 2,
      Math.min(from[1], to[1]) - h * 0.28,
    ];
  }

  let rafId;
  let socVisible = true;

  // IntersectionObserver — pause arcs when SOC section is off-screen
  const socSection = document.getElementById('soc');
  if (socSection) {
    const io = new IntersectionObserver(([entry]) => {
      socVisible = entry.isIntersecting;
      // Resume animation loop when scrolled back in
      if (socVisible && !rafId) {
        rafId = requestAnimationFrame(animateArcs);
      }
    }, { threshold: 0 });
    io.observe(socSection);
  }

  function animateArcs() {
    // Pause when off-screen — no busy-wait, just return
    if (!socVisible) {
      rafId = null;
      return;
    }
    const { w, h } = getSize();
    canvas.width  = w;
    canvas.height = h;

    const target = projectTarget();
    if (!target) { rafId = requestAnimationFrame(animateArcs); return; }

    ctx.fillStyle = 'rgba(4,8,15,0.18)';
    ctx.fillRect(0, 0, w, h);

    pulseRings.forEach(ring => {
      const pt = projectCity(ring.key);
      if (!pt) return;

      ring.radius += 0.4;
      if (ring.radius > ring.maxRadius) ring.radius = 0;

      const alpha = 1 - ring.radius / ring.maxRadius;

      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,80,80,${0.7 + Math.sin(Date.now()*0.003 + ring.phase)*0.3})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt[0], pt[1], ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,80,80,${alpha * 0.6})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(target[0], target[1], 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00aaff';
    ctx.fill();

    const tPulse = (Date.now() % 2000) / 2000;
    ctx.beginPath();
    ctx.arc(target[0], target[1], 4 + tPulse * 10, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,170,255,${(1 - tPulse) * 0.6})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    arcs.forEach(arc => {
      const from = projectCity(arc.cityKey);
      if (!from) return;

      const cp   = controlPoint(from, target, h);
      const tail = Math.max(0, arc.progress - arc.tailLen);
      const STEPS = 24;

      for (let i = 0; i < STEPS; i++) {
        const t0 = tail + (arc.progress - tail) * (i / STEPS);
        const t1 = tail + (arc.progress - tail) * ((i+1) / STEPS);
        const p0 = bezier(from, cp, target, t0);
        const p1 = bezier(from, cp, target, t1);
        const alpha = (i / STEPS) * 0.85;

        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.strokeStyle = arc.color
          .replace(')', `,${alpha})`)
          .replace('rgb(', 'rgba(');
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      const head = bezier(from, cp, target, arc.progress);
      ctx.beginPath();
      ctx.arc(head[0], head[1], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = arc.color;
      ctx.fill();

      arc.progress += arc.speed;
      if (arc.progress > 1) {
        Object.assign(arc, makeArc());
        arc.progress = 0;
      }
    });

    rafId = requestAnimationFrame(animateArcs);
  }

  // Check global reduced-motion flag (set by page entry points)
  const socReducedMotion = window.__reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      const { w, h } = getSize();
      setupProjection(w, h);
      drawMap(world, w, h);
      if (!socReducedMotion) animateArcs();

      const ro = new ResizeObserver(() => {
        const { w: nw, h: nh } = getSize();
        setupProjection(nw, nh);
        drawMap(world, nw, nh);
      });
      ro.observe(wrap);
    })
    .catch(err => {
      console.warn('SOC map topology failed to load:', err);
      svg.append('rect').attr('width','100%').attr('height','100%').attr('fill','#050d1e');
      svg.append('text').attr('x','50%').attr('y','50%').attr('text-anchor','middle')
         .attr('fill','#1a3560').attr('font-size','11').text('MAP UNAVAILABLE');
    });

  const list = document.getElementById('soc-origins-list');
  ATTACK_ORIGINS.forEach(o => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span style="font-size:0.85rem">${o.flag}</span>
      <span>${o.label}</span>
      <span class="soc-origin-pct">${o.pct}%</span>
    `;
    list.appendChild(li);
  });

  return () => { cancelAnimationFrame(rafId); };
}


/* ─── SECTION 3 — DONUT CHART (Canvas 2D) ─── */

function initSOCDonut() {
  const canvas = document.getElementById('soc-donut-canvas');
  const SIZE   = 120;
  canvas.width  = SIZE * window.devicePixelRatio;
  canvas.height = SIZE * window.devicePixelRatio;
  const ctx    = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cx = SIZE / 2, cy = SIZE / 2;
  const R  = SIZE * 0.44;
  const r  = R * 0.65;
  const GAP = 0.04;

  const SEGMENTS = [
    { val: THREAT_DATA.critical, color: '#e05252' },
    { val: THREAT_DATA.high,     color: '#e07820' },
    { val: THREAT_DATA.medium,   color: '#c8a820' },
    { val: THREAT_DATA.low,      color: '#28a86a' },
  ];
  const total = SEGMENTS.reduce((s, x) => s + x.val, 0);

  let drawProgress = 0;
  let breathPhase  = 0;

  function drawDonut() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.arc(cx, cy, r, Math.PI * 2, 0, true);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();

    let startAngle = -Math.PI / 2;
    SEGMENTS.forEach((seg, i) => {
      const fraction   = seg.val / total;
      const sweepAngle = fraction * Math.PI * 2 * drawProgress - GAP;
      if (sweepAngle <= 0) return;

      const breathOffset = Math.sin(breathPhase + i * 1.2) * 1.2;

      ctx.beginPath();
      ctx.arc(cx, cy, R + breathOffset, startAngle + GAP/2, startAngle + sweepAngle);
      ctx.arc(cx, cy, r,                startAngle + sweepAngle, startAngle + GAP/2, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      startAngle += fraction * Math.PI * 2;
    });
  }

  function animateIn() {
    gsap.to({ p: 0 }, {
      p: 1,
      duration: 1.2,
      ease: 'expo.out',
      onUpdate() {
        drawProgress = this.targets()[0].p;
        drawDonut();
      },
      onComplete() {
        gsap.ticker.add(breathTick);
      }
    });
  }

  function breathTick(time) {
    breathPhase = time * 0.8;
    drawDonut();
  }

  function runCounters() {
    const counter = (id, target) =>
      gsap.to({ v: 0 }, {
        v: target,
        duration: 1.2,
        ease: 'expo.out',
        onUpdate() {
          document.getElementById(id).textContent = Math.round(this.targets()[0].v);
        }
      });

    counter('soc-threat-total', THREAT_DATA.total);
    counter('leg-critical',     THREAT_DATA.critical);
    counter('leg-high',         THREAT_DATA.high);
    counter('leg-medium',       THREAT_DATA.medium);
    counter('leg-low',          THREAT_DATA.low);
  }

  return { animateIn, runCounters };
}


/* ─── SECTION 4 — SPARKLINE (Canvas 2D) ─── */

function initSOCSparkline() {
  const canvas = document.getElementById('soc-spark-canvas');
  const ctx    = canvas.getContext('2d');

  let data = Array.from({ length: 20 }, () =>
    40 + Math.random() * 50
  );

  function draw() {
    const W = canvas.offsetWidth  || 160;
    const H = canvas.offsetHeight || 60;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    const c = canvas.getContext('2d');
    c.scale(window.devicePixelRatio, window.devicePixelRatio);

    if (data.length < 2) return;

    const minV = Math.min(...data) - 5;
    const maxV = Math.max(...data) + 5;
    const range = maxV - minV || 1;

    const step = W / (data.length - 1);
    const py   = v => H - ((v - minV) / range) * (H - 8) - 4;

    const grad = c.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   'rgba(0,170,255,0.25)');
    grad.addColorStop(1,   'rgba(0,170,255,0)');

    c.beginPath();
    c.moveTo(0, py(data[0]));
    for (let i = 1; i < data.length; i++) {
      const x0 = (i-1) * step, y0 = py(data[i-1]);
      const x1 = i     * step, y1 = py(data[i]);
      const mx = (x0 + x1) / 2;
      c.bezierCurveTo(mx, y0, mx, y1, x1, y1);
    }

    c.lineTo((data.length-1) * step, H);
    c.lineTo(0, H);
    c.closePath();
    c.fillStyle = grad;
    c.fill();

    c.beginPath();
    c.moveTo(0, py(data[0]));
    for (let i = 1; i < data.length; i++) {
      const x0 = (i-1) * step, y0 = py(data[i-1]);
      const x1 = i     * step, y1 = py(data[i]);
      const mx = (x0 + x1) / 2;
      c.bezierCurveTo(mx, y0, mx, y1, x1, y1);
    }
    c.strokeStyle = '#00aaff';
    c.lineWidth   = 1.5;
    c.stroke();
  }

  draw();

  setInterval(() => {
    data.shift();
    data.push(40 + Math.random() * 50);
    draw();
  }, 2000);

  return { redraw: draw };
}


/* ─── SECTION 5 — VULNERABILITY COUNTER ─── */

function runVulnCounter() {
  const numEl   = document.getElementById('soc-vuln-num');
  const riskEl  = document.getElementById('soc-vuln-risk');

  gsap.to({ v: 0 }, {
    v: VULN_SCORE,
    duration: 1.4,
    ease: 'expo.out',
    onUpdate() {
      const v = Math.round(this.targets()[0].v);
      numEl.textContent = v;
      numEl.className = 'soc-vuln-num ' + (
        v < 40 ? 'risk-low' : v < 70 ? 'risk-medium' : 'risk-high'
      );
    },
    onComplete() {
      riskEl.textContent = 'Medium Risk';
    }
  });
}


/* ─── SECTION 6 — INCIDENTS ─── */

function buildIncidentRow(inc) {
  const li = document.createElement('li');
  li.className = 'soc-inc-row';
  li.innerHTML = `
    <div class="soc-inc-icon sev-${inc.sev}" aria-hidden="true">${inc.icon}</div>
    <div class="soc-inc-body">
      <div class="soc-inc-name">${inc.name}</div>
      <div class="soc-inc-time">${inc.time}</div>
    </div>
    <span class="soc-badge sev-${inc.sev}">${inc.sev}</span>
  `;
  return li;
}

function initSOCIncidents() {
  const list = document.getElementById('soc-incidents');
  INCIDENTS_SEED.forEach(inc => list.appendChild(buildIncidentRow(inc)));
}

function staggerIncidents() {
  gsap.to('.soc-inc-row', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'expo.out',
    delay: 0.5,
  });
}

function startLiveFeed() {
  let feedPaused = false;
  const socSection = document.getElementById('soc');
  if (socSection) {
    const io = new IntersectionObserver(([entry]) => {
      feedPaused = !entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(socSection);
  }

  const rand = (a, b) => a + Math.random() * (b - a);

  setInterval(() => {
    if (feedPaused) return;
    const inc  = LIVE_POOL[Math.floor(Math.random() * LIVE_POOL.length)];
    const row  = buildIncidentRow({ ...inc, time: 'just now' });
    const list = document.getElementById('soc-incidents');

    row.style.opacity   = '0';
    row.style.transform = 'translateY(-10px)';
    list.insertBefore(row, list.firstChild);

    gsap.to(row, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' });

    if (list.children.length > 6) {
      const last = list.lastChild;
      gsap.to(last, {
        opacity: 0,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => last.remove(),
      });
    }
  }, rand(9000, 16000));
}


/* ─── SECTION 7 — SCROLL TRIGGER + BOOT ─── */

function registerSOCScrollTrigger() {
  ScrollTrigger.create({
    trigger: '#soc',
    start:   'top 65%',
    once:    true,
    onEnter() {
      gsap.timeline()
        .to('#soc', { backgroundColor:'rgba(0,170,255,0.03)', duration:0.14, ease:'power2.in'  })
        .to('#soc', { backgroundColor:'transparent',          duration:0.22, ease:'power2.out' });

      gsap.fromTo('.soc-panel',
        { opacity:0, y:28, clipPath:'inset(0 0 100% 0)' },
        { opacity:1, y:0,  clipPath:'inset(0 0 0% 0)',
          duration:0.75, stagger:0.1, ease:'expo.out', delay:0.1 }
      );

      const donut = initSOCDonut();
      donut.animateIn();
      donut.runCounters();

      runVulnCounter();

      staggerIncidents();

      startLiveFeed();
    }
  });
}


/* ─── SECTION 8 — EXPORT ─── */

export function initSOC() {
  initSOCIncidents();
  initSOCSparkline();
  initSOCMap();
  registerSOCScrollTrigger();
}
