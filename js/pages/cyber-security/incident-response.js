// js/pages/cyber-security/incident-response.js
// v3 — scrolling log feed (detect), network disconnect diagram (contain), checklist draw (recover)
// Depth-stack card reveal + power-on micro-sequence retained from v2

export function initIncidentResponse({ tier = 'high', reducedMotion = false } = {}, ctx = {}) {
  const { fineHover = false } = ctx;
  const section = document.querySelector('.section-incident-response');
  if (!section) return;

  const cards = section.querySelectorAll('.ir-card');
  const prefersReducedMotion = reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;
  const easeIn = tier === 'low' ? 'power2.out' : 'back.out(1.4)';
  const dur = tier === 'low' ? 0.4 : 0.6;

  // ── Inject per-card content into .ir-card__icon-wrap ──
  cards.forEach(card => {
    const proto = card.dataset.protocol;
    const iconWrap = card.querySelector('.ir-card__icon-wrap');
    if (!iconWrap) return;

    if (proto === 'detect') buildLogFeed(iconWrap, prefersReducedMotion);
    else if (proto === 'contain') buildDisconnectDiagram(iconWrap, card, prefersReducedMotion);
    else if (proto === 'recover') buildChecklistDraw(iconWrap, card, prefersReducedMotion);
  });

  // ── Title underline accent ──
  const accentLine = section.querySelector('.title-underline-accent');
  if (accentLine) {
    ScrollTrigger.create({
      trigger: section, start: 'top 80%', end: 'top 40%',
      onEnter: () => gsap.to(accentLine, { scaleX: 1, duration: 1.2, ease: 'expo.out' }),
      once: true,
    });
  }

  // ── Reduced motion: static display, no depth-stack ──
  if (prefersReducedMotion) {
    cards.forEach(c => gsap.set(c, { opacity: 1, clearProps: 'all' }));
    return;
  }

  // ── Depth-stack config ──
  const depthConfigs = [
    { z: 0, scale: 1, rotY: 0, delay: 0 },
    { z: -40, scale: 0.95, rotY: -4, delay: 0.12 },
    { z: -80, scale: 0.9, rotY: -8, delay: 0.24 },
  ];

  // ── Card depth-stack reveal + power-on micro-sequence ──
  cards.forEach((card, i) => {
    const flash = document.createElement('div');
    flash.className = 'ir-flash';
    Object.assign(flash.style, {
      position: 'absolute', inset: '0', background: 'rgba(255,255,255,0)',
      pointerEvents: 'none', zIndex: '0',
    });
    card.style.position = 'relative';
    card.appendChild(flash);

    const fkf = [
      { background: 'rgba(255,255,255,0)', offset: 0 },
      { background: 'rgba(255,255,255,0.06)', offset: 0.5 },
      { background: 'rgba(255,255,255,0)', offset: 1 },
    ];
    const fkt = { duration: 120, iterations: 1, fill: 'forwards' };

    const iconWrap = card.querySelector('.ir-card__icon-wrap');
    const eyebrow = card.querySelector('.ir-card__eyebrow');
    const title = card.querySelector('.ir-card__title');
    const desc = card.querySelector('.ir-card__desc');
    const depth = depthConfigs[i];

    // Initial states
    if (isMobile) {
      gsap.set(card, { opacity: 0, y: 30, scale: 0.95 });
    } else {
      gsap.set(card, { opacity: 0, translateZ: depth.z, scale: depth.scale, rotateY: depth.rotY });
    }
    gsap.set(iconWrap, { scale: 0, rotation: -12 });
    gsap.set(eyebrow, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(title, { y: 16, opacity: 0 });
    gsap.set(desc, { y: 8, opacity: 0 });

    ScrollTrigger.create({
      trigger: card, start: 'top 75%', toggleActions: 'play none none reverse',
      onEnter: () => {
        const tl = gsap.timeline({ delay: depth.delay });

        // Depth arrival
        if (isMobile) {
          tl.to(card, { opacity: 1, y: 0, scale: 1, duration: dur, ease: easeIn });
        } else {
          tl.to(card, { opacity: 1, translateZ: 0, scale: 1, rotateY: 0, duration: dur, ease: easeIn });
        }

        // Power-on micro-sequence: flash → icon slam → eyebrow clip → title lift → desc lift
        tl.call(() => { flash.animate(fkf, fkt); })
          .to(iconWrap, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.2)' }, '+=0.06')
          .to(eyebrow, { clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'power2.out' }, '+=0.15')
          .to(title, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, '+=0.07')
          .to(desc, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1')
          // Start card-specific looping timeline after power-on completes
          .call(() => {
            if (card._timeline) card._timeline.play(0);
          });
      },
      onLeaveBack: () => {
        gsap.set(card, { opacity: 0 });
        if (isMobile) gsap.set(card, { y: 30, scale: 0.95 });
        else gsap.set(card, { translateZ: depth.z, scale: depth.scale, rotateY: depth.rotY });
        gsap.set(iconWrap, { scale: 0, rotation: -12 });
        gsap.set(eyebrow, { clipPath: 'inset(0 100% 0 0)' });
        gsap.set(title, { y: 16, opacity: 0 });
        gsap.set(desc, { y: 8, opacity: 0 });

        if (card._timeline) card._timeline.pause(0);
      },
    });

    // Hover effect
    if (fineHover) {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-glow)',
          duration: 0.2, ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          borderColor: 'var(--bc)', backgroundColor: 'var(--panel)',
          duration: 0.2, ease: 'power2.out',
        });
      });
    }
  });
}

// ───────────────────────────────────────────
// Card 1 — Scrolling Log Feed (data-protocol="detect")
// ───────────────────────────────────────────

function buildLogFeed(container, reducedMotion) {
  // Inject @keyframes once
  if (!document.getElementById('ir-log-scroll-style')) {
    const s = document.createElement('style');
    s.id = 'ir-log-scroll-style';
    s.textContent = `@keyframes log-scroll {
      from { transform: translateY(0); }
      to   { transform: translateY(-50%); }
    }`;
    document.head.appendChild(s);
  }

  const logHTML = [
    '<span class="log-ts">[09:14:02]</span> <span class="log-kw">auth_anomaly</span> detected :: node-08',
    '<span class="log-ts">[09:14:03]</span> correlating with threat-intel feed',
    '<span class="log-ts">[09:14:04]</span> severity: MEDIUM :: <span class="log-kw">blocklisting</span> src-IP',
    '<span class="log-ts">[09:14:05]</span> executing <span class="log-kw">SOAR playbook</span> :: isolate-host',
    '<span class="log-ts">[09:14:07]</span> host <span class="log-kw">isolated</span> :: <span class="log-kw">quarantined</span>',
    '<span class="log-ts">[09:14:09]</span> forensic snapshot captured',
    '<span class="log-ts">[09:14:11]</span> <span class="log-kw">IoC propagated</span> to all sensors',
    '<span class="log-ts">[09:14:13]</span> alert <span class="log-kw">escalated</span> to tier-2 analyst',
    '<span class="log-ts">[09:14:15]</span> <span class="log-kw">EDR sweep</span> initiated on adjacent hosts',
    '<span class="log-ts">[09:14:18]</span> post-containment verification passed',
  ];

  const panel = document.createElement('div');
  panel.className = 'log-panel';
  panel.style.cssText = 'height:120px;overflow:hidden;font-family:ui-monospace,monospace;font-size:11px;line-height:1.7;';

  const wrapper = document.createElement('div');
  wrapper.className = 'log-scroll-wrap';

  // Render all lines once (source set)
  logHTML.forEach(html => {
    const el = document.createElement('div');
    el.innerHTML = html;
    wrapper.appendChild(el);
  });

  if (reducedMotion) {
    // Static: show only first 4 lines, hide the rest
    for (let i = 4; i < wrapper.children.length; i++) {
      wrapper.children[i].style.display = 'none';
    }
  } else {
    // Duplicate full list for seamless loop
    logHTML.forEach(html => {
      const el = document.createElement('div');
      el.innerHTML = html;
      wrapper.appendChild(el);
    });
    wrapper.style.animation = 'log-scroll 8s linear infinite';

    // Pause on hover
    panel.addEventListener('mouseenter', () => { wrapper.style.animationPlayState = 'paused'; });
    panel.addEventListener('mouseleave', () => { wrapper.style.animationPlayState = 'running'; });
  }

  panel.appendChild(wrapper);
  container.appendChild(panel);
}

// ───────────────────────────────────────────
// Card 2 — Network Disconnect Diagram (data-protocol="contain")
// ───────────────────────────────────────────

function buildDisconnectDiagram(container, card, reducedMotion) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 160 100');
  svg.style.cssText = 'width:100%;height:100px;display:block;';

  // Nodes
  const cx = 80, cy = 50;
  const peers = [
    { x: 40, y: 20 },
    { x: 120, y: 20 },
    { x: 40, y: 80 },
    { x: 120, y: 80 },
  ];

  // Helper: Euclidean distance
  function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  // ── Connection lines ──
  const lines = peers.map(p => {
    const len = dist(cx, cy, p.x, p.y);
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', p.x);
    line.setAttribute('y2', p.y);
    line.setAttribute('stroke', 'var(--accent-border)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', len);
    line.setAttribute('stroke-dashoffset', '0');
    line.dataset.len = len;
    svg.appendChild(line);
    return { el: line, len };
  });

  // ── Center node ──
  const centerCircle = document.createElementNS(NS, 'circle');
  centerCircle.setAttribute('cx', cx);
  centerCircle.setAttribute('cy', cy);
  centerCircle.setAttribute('r', '8');
  centerCircle.setAttribute('fill', 'var(--accent-dim)');
  centerCircle.setAttribute('stroke', 'var(--accent-border)');
  centerCircle.setAttribute('stroke-width', '1.5');
  svg.appendChild(centerCircle);

  const centerLabel = document.createElementNS(NS, 'text');
  centerLabel.setAttribute('x', cx);
  centerLabel.setAttribute('y', cy + 8 + 10);
  centerLabel.setAttribute('text-anchor', 'middle');
  centerLabel.setAttribute('fill', 'var(--t2)');
  centerLabel.setAttribute('font-size', '6');
  centerLabel.textContent = 'ASSET';
  svg.appendChild(centerLabel);

  // ── Peer nodes ──
  const peerCircles = peers.map(p => {
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', 'var(--accent-dim)');
    circle.setAttribute('stroke', 'var(--accent-border)');
    circle.setAttribute('stroke-width', '1');
    svg.appendChild(circle);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', p.x);
    label.setAttribute('y', p.y + 5 + 8);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'var(--t2)');
    label.setAttribute('font-size', '5');
    label.textContent = 'PEER';
    svg.appendChild(label);

    return circle;
  });

  container.appendChild(svg);

  // Static diagram in reduced motion
  if (reducedMotion) return;

  // ── GSAP Timeline (4s loop) ──
  const tl = gsap.timeline({ paused: true, repeat: -1 });

  // Phase 1 (0–2s): Retract connections staggered, dim peers
  lines.forEach(({ el, len }, i) => {
    const t = i * 0.3;
    tl.to(el, { strokeDashoffset: len, duration: 0.4, ease: 'power2.in' }, t);
    tl.to(peerCircles[i], { fill: 'var(--bh)', duration: 0.25, ease: 'power2.out' }, t + 0.1);
  });

  // Phase 2 (2–3s): Hold — gap in timeline is implicit

  // Phase 3 (3–4s): Restore with reverse stagger
  for (let i = 3; i >= 0; i--) {
    const t = 3 + (3 - i) * 0.3;
    tl.to(lines[i].el, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, t);
    tl.to(peerCircles[i], { fill: 'var(--accent-dim)', duration: 0.25, ease: 'power2.out' }, t + 0.1);
  }

  card._timeline = tl;
}

// ───────────────────────────────────────────
// Card 3 — Checklist Draw (data-protocol="recover")
// ───────────────────────────────────────────

function buildChecklistDraw(container, card, reducedMotion) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 160 100');
  svg.style.cssText = 'width:100%;height:100px;display:block;';

  const rows = [
    'PATCH DEPLOYED',
    'CREDENTIALS ROTATED',
    'BACKUPS VERIFIED',
    'POLICY HARDENED',
  ];

  const startX = 20, boxSize = 10, labelX = 36;
  const rowGap = 18, startY = 16;
  const checkPaths = [];

  rows.forEach((label, i) => {
    const y = startY + i * rowGap;

    // Checkbox square
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', startX);
    rect.setAttribute('y', y);
    rect.setAttribute('width', boxSize);
    rect.setAttribute('height', boxSize);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', 'var(--accent-border)');
    rect.setAttribute('stroke-width', '1.5');
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    // Checkmark path
    const path = document.createElementNS(NS, 'path');
    const chkX = startX + 2, chkY = y + boxSize / 2;
    const d = `M${chkX},${chkY} l${boxSize * 0.3},${boxSize * 0.3} l${boxSize * 0.5},-${boxSize * 0.6}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--accent)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    checkPaths.push(path);

    // Label text
    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', labelX);
    text.setAttribute('y', y + boxSize - 1);
    text.setAttribute('fill', 'var(--t2)');
    text.setAttribute('font-size', '7');
    text.setAttribute('font-family', 'ui-monospace,monospace');
    text.textContent = label;
    svg.appendChild(text);
  });

  // Counter text "X/4 COMPLETE"
  const counter = document.createElementNS(NS, 'text');
  counter.setAttribute('x', startX);
  counter.setAttribute('y', startY + rows.length * rowGap + 6);
  counter.setAttribute('fill', 'var(--t2)');
  counter.setAttribute('font-size', '7');
  counter.setAttribute('font-family', 'ui-monospace,monospace');
  counter.setAttribute('font-weight', 'bold');
  counter.textContent = '0/4 COMPLETE';
  svg.appendChild(counter);

  container.appendChild(svg);

  // Static in reduced motion
  if (reducedMotion) return;

  // ── Compute path lengths ──
  // SVG needs to be in the DOM for getTotalLength() to work reliably
  // Force length computation via a temp wrapper
  const pathLengths = checkPaths.map(p => {
    // getTotalLength works on attached elements; force a synchronous layout
    return p.getTotalLength ? p.getTotalLength() : 0;
  });

  // Guard: if lengths are 0 (unlikely), default to a reasonable value
  checkPaths.forEach((p, i) => {
    if (!pathLengths[i]) pathLengths[i] = 15; // fallback approx length
    p.setAttribute('stroke-dasharray', pathLengths[i]);
    p.setAttribute('stroke-dashoffset', pathLengths[i]);
  });

  // ── GSAP Timeline (~4.5s loop) ──
  const tl = gsap.timeline({ paused: true, repeat: -1 });

  // Phase 1 (0–2s): Checkmarks draw sequentially, counter increments
  checkPaths.forEach((path, i) => {
    const t = i * 0.4;
    tl.to(path, { strokeDashoffset: 0, duration: 0.3, ease: 'expo.out' }, t)
      .call(() => { counter.textContent = `${i + 1}/4 COMPLETE`; }, [], t + 0.15);
  });

  // Phase 2 (2–3.5s): Hold, counter glow
  tl.to(counter, { fill: 'var(--accent)', duration: 0.4, ease: 'power2.out' }, 2)
    .to(counter, { fill: 'var(--t2)', duration: 0.4, ease: 'power2.out' }, 2.4);

  // Phase 3 (3.5–4s): All erase quickly, counter resets
  checkPaths.forEach(path => {
    tl.to(path, { strokeDashoffset: pathLengths[checkPaths.indexOf(path)], duration: 0.2, ease: 'power2.in' }, 3.5);
  });
  tl.call(() => { counter.textContent = '0/4 COMPLETE'; }, [], 3.5);

  card._timeline = tl;
}
