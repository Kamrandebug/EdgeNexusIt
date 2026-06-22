// js/pages/devops/stack-interop.js
// ─────────────────────────────────────────────────────
// Orbital Canvas — stack tools orbiting center NEXUS node
// Uses native Canvas API + GSAP for entry animation
// ─────────────────────────────────────────────────────

import { hasHover, reducedMotion as perfReducedMotion, tier as perfTier } from '../../core/performance.js';

export function initStackInterop() {
  const canvas = document.getElementById('stack-orbit-canvas');
  if (!canvas) return;

  const section = document.querySelector('.section-stack-interop');
  const tooltip = document.getElementById('stack-tooltip');
  const prefersReducedMotion = perfReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Resolve CSS custom props from document ─────────
  const style = getComputedStyle(document.documentElement);
  const ACCENT = style.getPropertyValue('--accent').trim() || '#00aaff';
  const ACCENT_GLOW = style.getPropertyValue('--accent-glow').trim() || 'rgba(0,170,255,0.05)';
  const PANEL = style.getPropertyValue('--panel').trim() || '#090e1c';
  const BC = style.getPropertyValue('--bc').trim() || 'rgba(255,255,255,0.06)';
  const T3 = style.getPropertyValue('--t3').trim() || 'rgba(226,232,240,0.25)';
  const BG = style.getPropertyValue('--bg').trim() || '#020508';
  const T1 = style.getPropertyValue('--t1').trim() || '#e2e8f0';

  // ── Tool Data ─────────────────────────────────────
  const tools = [
    // Ring 1 (r=120): 3 items
    { name: 'DOCKER',       slug: 'docker',       ring: 0, desc: 'Container runtime · BUILD, DEPLOY stages' },
    { name: 'KUBERNETES',   slug: 'kubernetes/kubernetes-plain', ring: 0, desc: 'Orchestration · ALL stages' },
    { name: 'TERRAFORM',    slug: 'terraform/terraform-original', ring: 0, desc: 'Provisioning · BUILD, DEPLOY stages' },
    // Ring 2 (r=210): 4 items
    { name: 'GITHUB ACTIONS', slug: 'githubactions/githubactions-original', ring: 1, desc: 'CI/CD · BUILD, TEST stages' },
    { name: 'ARGOCD',       slug: 'argo/argo-original', ring: 1, desc: 'GitOps deploy · STAGE, DEPLOY stages' },
    { name: 'PROMETHEUS',   slug: 'prometheus/prometheus-original', ring: 1, desc: 'Monitoring · ALL stages' },
    { name: 'GRAFANA',      slug: 'grafana/grafana-original', ring: 1, desc: 'Dashboards · ALL stages' },
    // Ring 3 (r=300): 6 items
    { name: 'AWS',     slug: 'amazonwebservices/amazonwebservices-plain-wordmark', ring: 2, desc: 'Cloud provider · BUILD, DEPLOY' },
    { name: 'GCP',     slug: 'googlecloud/googlecloud-original', ring: 2, desc: 'Cloud provider · BUILD, DEPLOY' },
    { name: 'AZURE',   slug: 'azure/azure-original', ring: 2, desc: 'Cloud provider · BUILD, DEPLOY' },
    { name: 'ANSIBLE', slug: 'ansible/ansible-original', ring: 2, desc: 'Configuration mgmt · STAGE, DEPLOY' },
    { name: 'VAULT',   slug: 'vault/vault-original', ring: 2, desc: 'Secrets mgmt · ALL stages' },
    { name: 'NGINX',   slug: 'nginx/nginx-original', ring: 2, desc: 'Reverse proxy · DEPLOY stage' },
  ];

  const RING_RADII = [96, 168, 240];
  const RING_SPEEDS = prefersReducedMotion ? [0, 0, 0] : [0.008, 0.005, 0.003];
  // Low tier: reduce rotation speed ~25-30%
  const speedMultiplier = perfTier === 'low' && !prefersReducedMotion ? 0.7 : 1.0;

  const ctx = canvas.getContext('2d');
  const BASE_URL = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';
  let w, h, cx, cy;
  let angleOffset = [0, 0, 0];
  let animationId;
  let loaded = false;

  // Hover state
  let hoveredIndex = -1;

  // Preload images
  const images = {};
  let loadedCount = 0;

  function preloadImages(callback) {
    tools.forEach((tool, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        images[i] = img;
        loadedCount++;
        if (loadedCount === tools.length) { loaded = true; callback(); }
      };
      img.onerror = () => {
        images[i] = null;
        loadedCount++;
        if (loadedCount === tools.length) { loaded = true; callback(); }
      };
      img.src = `${BASE_URL}${tool.slug}.svg`;
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h / 2;
  }

  function getToolPositions() {
    return tools.map((tool, i) => {
      const ring = tool.ring;
      const itemsInRing = tools.filter(t => t.ring === ring).length;
      const idxInRing = tools.filter(t => t.ring === ring).indexOf(tool);
      const baseAngle = (2 * Math.PI / itemsInRing) * idxInRing - Math.PI / 2;
      const angle = baseAngle + angleOffset[ring];
      const r = RING_RADII[ring];
      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        angle,
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // ── Orbit Rings ──
    ctx.strokeStyle = BC;
    ctx.lineWidth = 1;
    [0, 1, 2].forEach(ri => {
      ctx.beginPath();
      ctx.arc(cx, cy, RING_RADII[ri], 0, Math.PI * 2);
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    const positions = getToolPositions();

    // ── Connection line for hovered tool ──
    if (hoveredIndex >= 0) {
      const pos = positions[hoveredIndex];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = ACCENT;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Center NEXUS node ──
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = ACCENT;
    ctx.shadowColor = ACCENT_GLOW;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = BG;
    ctx.font = 'bold 9px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEXUS', cx, cy);

    // ── Tool logos ──
    tools.forEach((tool, i) => {
      const pos = positions[i];
      const isHovered = i === hoveredIndex;
      const size = isHovered ? 26 : 18;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(-pos.angle);

      if (hoveredIndex >= 0 && !isHovered) {
        ctx.globalAlpha = 0.2;
      }

      if (images[i]) {
        ctx.drawImage(images[i], -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = isHovered ? ACCENT : T3;
        ctx.font = '9px DM Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tool.name.substring(0, 4), 0, 0);
      }

      ctx.restore();
    });
  }

  // ── IntersectionObserver: pause RAF when off-screen ──
  let isVisible = true;
  if (section) {
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationId) {
        // Resume RAF loop when scrolled back in
        animationId = requestAnimationFrame(animate);
      }
    }, { threshold: 0 });
    io.observe(section);
  }

  function animate() {
    if (!isVisible) {
      // Completely halt RAF when off-screen (no busy-wait)
      animationId = null;
      return;
    }
    if (!prefersReducedMotion) {
      angleOffset[0] += RING_SPEEDS[0] * speedMultiplier;
      angleOffset[1] += RING_SPEEDS[1] * speedMultiplier;
      angleOffset[2] += RING_SPEEDS[2] * speedMultiplier;
    }
    draw();
    animationId = requestAnimationFrame(animate);
  }

  // ── Mouse / Pointer Interaction ──
  function getHoveredIndex(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const positions = getToolPositions();

    let closest = -1;
    let closestDist = 40;
    positions.forEach((pos, i) => {
      const dist = Math.hypot(mx - pos.x, my - pos.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function showTooltip(idx) {
    hoveredIndex = idx;
    canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
    tooltip.classList.toggle('visible', idx >= 0);
    if (idx >= 0) {
      tooltip.textContent = `${tools[idx].name} // ${tools[idx].desc}`;
    }
  }

  function clearTooltip() {
    hoveredIndex = -1;
    canvas.style.cursor = 'default';
    tooltip.classList.remove('visible');
  }

  // Mouse hover (high/mid tier with hover-capable pointer)
  if (hasHover) {
    canvas.addEventListener('mousemove', (e) => {
      const idx = getHoveredIndex(e.clientX, e.clientY);
      if (idx !== hoveredIndex) showTooltip(idx);
    });
    canvas.addEventListener('mouseleave', clearTooltip);
  }

  // Touch tap equivalent (all tiers)
  canvas.addEventListener('click', (e) => {
    const idx = getHoveredIndex(e.clientX, e.clientY);
    // If tapping same node, dismiss; otherwise show new node
    if (idx === hoveredIndex && idx >= 0) {
      clearTooltip();
    } else {
      showTooltip(idx);
    }
  });

  // Dismiss tooltip on scroll (prevents stuck tooltips after panning)
  window.addEventListener('scroll', () => {
    if (hoveredIndex >= 0) clearTooltip();
  }, { passive: true });

  // ── Init ──
  function init() {
    resize();
    window.addEventListener('resize', resize);

    gsap.fromTo(canvas,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      }
    );

    animate();
  }

  preloadImages(init);
}
