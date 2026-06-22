import { flags, tier, reducedMotion, hasHover } from './performance.js';

// Global reactive grid overlay
const SECTION_GRID_COLORS = {
  hero:        'rgba(0, 170, 255, 0.08)',
  services:    'rgba(0, 170, 255, 0.08)',
  process:     'rgba(30, 120, 255, 0.06)',
  stats:       'rgba(0, 170, 255, 0.08)',
  cta:         'rgba(0, 170, 255, 0.04)',
  footer:      'rgba(0, 170, 255, 0.03)',
  // DevOps page sections
  'hero-devops': 'rgba(0, 170, 255, 0.08)',
  pipeline:    'rgba(0, 170, 255, 0.06)',
  iac:         'rgba(0, 170, 255, 0.06)',
  zdt:         'rgba(0, 170, 255, 0.05)',
  'cta-devops':'rgba(0, 170, 255, 0.04)',
};

export function initGrid() {
  if (flags.isSmallMobile) {
    const grid = document.getElementById('grid-overlay');
    if (grid) grid.style.display = 'none';
    return;
  }

  const grid = document.getElementById('grid-overlay');
  if (!grid) return;

  // Position overlay to cover full viewport (fixed, pointer-events off)
  Object.assign(grid.style, {
    position:      'fixed',
    inset:         '0',
    pointerEvents: 'none',
    zIndex:        '0',
  });

  // Draw initial grid via CSS background-image (no canvas → no dual-render)
  setGridColor(grid, SECTION_GRID_COLORS.hero);

  // Tier-gated interactions
  // Proximity pulse: high tier with hover; mid tier with hover; off otherwise
  if (tier === 'high' || (tier === 'mid' && hasHover)) {
    initProximityPulse(grid);
  }
  // Breathing wave: on at every tier except reducedMotion (§1.2)
  if (!reducedMotion) {
    initBreathingGrid();
  }
  initSectionColorShift(grid);
}

function initBreathingGrid() {
  const canvas = document.getElementById('grid-pulse');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const CELL = flags.isMobile ? 60 : 40;
  let width, height;
  let animationId;

  // IntersectionObserver — pause wave when grid overlay is off-screen
  let isVisible = true;
  const gridOverlay = document.getElementById('grid-overlay');
  if (gridOverlay) {
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (!isVisible && animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      } else if (isVisible && waveActive) {
        // Resume if we were mid-wave
        animationId = requestAnimationFrame(animate);
      }
    }, { threshold: 0 });
    io.observe(gridOverlay);
  }

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  window.addEventListener('resize', resize);
  resize();

  let waveActive = false;
  let waveProgress = 0;
  const duration = 1200; // 1.2s

  function triggerWave() {
    if (waveActive) return;
    waveActive = true;
    waveProgress = 0;
    
    const startTime = performance.now();

    function animate(time) {
      // Pause if off-screen
      if (!isVisible) {
        animationId = null;
        return;
      }
      const elapsed = time - startTime;
      waveProgress = elapsed / duration;

      if (waveProgress >= 1) {
        waveActive = false;
        ctx.clearRect(0, 0, width, height);
        scheduleNextWave();
        return;
      }

      drawWave(waveProgress);
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);
  }

  function drawWave(progress) {
    ctx.clearRect(0, 0, width, height);
    
    // Diagonal wave at 45 degrees: x + y = constant
    // Max constant is width + height
    const maxDist = width + height;
    const currentDist = maxDist * progress;
    const waveWidth = 400;

    for (let x = 0; x <= width; x += CELL) {
      for (let y = 0; y <= height; y += CELL) {
        const dist = x + y;
        const diff = Math.abs(dist - currentDist);
        
        if (diff < waveWidth) {
          const intensity = 1 - (diff / waveWidth);
          const opacity = 0.035 + intensity * 0.065; // from --grid-line (0.035) to 0.10
          
          ctx.beginPath();
          // Draw a small 1px cross or dot at intersection
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 1;
          
          // Horizontal line fragment
          ctx.moveTo(x - 5, y);
          ctx.lineTo(x + 5, y);
          // Vertical line fragment
          ctx.moveTo(x, y - 5);
          ctx.lineTo(x, y + 5);
          ctx.stroke();
        }
      }
    }
  }

  function scheduleNextWave() {
    const delay = (10 + (Math.random() * 4 - 2)) * 1000; // 10±2s
    setTimeout(triggerWave, delay);
  }

  scheduleNextWave();
}

function initProximityPulse(grid) {
  const CELL = flags.isMobile ? 80 : 60; // Larger cells on mobile (fewer grid lines)
  let rafId  = null;

  if (flags.isTouch) return; // No mouse pulse on touch devices

  document.addEventListener('mousemove', e => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const nearestX = Math.round(e.clientX / CELL) * CELL;
      const nearestY = Math.round(e.clientY / CELL) * CELL;
      const dist     = Math.hypot(e.clientX - nearestX, e.clientY - nearestY);
      const strength = Math.max(0, 1 - dist / 180);
      const opacity  = 0.08 + strength * 0.16;
      grid.style.setProperty('--grid-pulse-opacity', opacity);
    });
  }, { passive: true });
}

function initSectionColorShift(grid) {
  Object.entries(SECTION_GRID_COLORS).forEach(([id, color]) => {
    const section = document.getElementById(id);
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end:   'bottom center',
      onEnter:     () => setGridColor(grid, color),
      onEnterBack: () => setGridColor(grid, color),
    });
  });
}

function setGridColor(el, color) {
  const size = flags.isMobile ? '60px' : '40px';
  el.style.backgroundImage = [
    `linear-gradient(${color} 1px, transparent 1px)`,
    `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
  ].join(', ');
  el.style.backgroundSize = `${size} ${size}`;
}
