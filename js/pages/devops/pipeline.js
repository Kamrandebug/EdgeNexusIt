// js/pages/devops/pipeline.js
// ─────────────────────────────────────────────────────
// Horizontal scroll-driven pipeline flow for DevOps page
// Uses GSAP 3.12.2 + ScrollTrigger
// ─────────────────────────────────────────────────────

export function initPipeline() {
  const section = document.getElementById('pipeline');
  if (!section) return;

  const trackNodes = section.querySelectorAll('.track-node');
  const trackLineFill = section.querySelector('.track-line-fill');
  const trackDots = section.querySelectorAll('.track-dot');
  const stagePanels = section.querySelectorAll('.stage-panel');
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tablet/mobile: standard vertical reveals (unpinned). Same panel content/styling as desktop.
  if (prefersReducedMotion) {
    stagePanels.forEach(panel => {
      panel.removeAttribute('hidden');
      ScrollTrigger.create({
        trigger: panel,
        start: 'top 80%',
        onEnter: () => {
          const output = panel.querySelector('.pipeline-terminal__output');
          const cmd = output?.dataset.cmd;
          if (cmd) startTypewriter(output, cmd);
          animateStatBars(panel);
        },
        once: true
      });
    });
    return;
  }

  let currentStage = -1;

  // 1. PIN & MASTER SCROLLTRIGGER (desktop ≥1025px)
  // ≤1024px: vertical-stack fallback — same panels, scroll-triggered reveals
  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": function() {
      // Target the real .track-line-fill div
      gsap.to('.track-line-fill', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#pipeline',
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const stage = Math.min(4, Math.floor(self.progress * 5));
            activateStage(stage);
          }
        }
      });
    },

    "(min-width: 769px) and (max-width: 1024px)": function() {
      // Tablet: scroll-triggered reveals with track node sync (track still visible)
      stagePanels.forEach(panel => {
        panel.removeAttribute('hidden');
      });

      stagePanels.forEach(panel => {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 80%',
          onEnter: () => {
            const stageIdx = Array.from(panel.parentElement.children).indexOf(panel);
            trackNodes.forEach((node, i) => node.classList.toggle('active', i === stageIdx));
            const output = panel.querySelector('.pipeline-terminal__output');
            const cmd = output?.dataset.cmd;
            if (cmd) startTypewriter(output, cmd);
            animateStatBars(panel);
          },
          once: true
        });
      });
    },

    "(max-width: 768px)": function() {
      // Mobile: All 5 panels stacked vertically, track hidden via CSS
      stagePanels.forEach(panel => {
        panel.removeAttribute('hidden');
      });

      stagePanels.forEach(panel => {
        gsap.set(panel, { opacity: 0, y: 20, visibility: 'visible' });

        ScrollTrigger.create({
          trigger: panel,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(panel, {
              opacity: 1,
              y: 0,
              visibility: 'visible',
              duration: 0.5,
              ease: 'expo.out',
              overwrite: 'auto'
            });
            const output = panel.querySelector('.pipeline-terminal__output');
            const cmd = output?.dataset.cmd;
            if (cmd) startTypewriter(output, cmd);
            animateStatBars(panel);
          },
          once: true
        });
      });
    }
  });

  function activateStage(n) {
    if (n === currentStage) return;

    // Update nodes
    trackNodes.forEach((node, i) => {
      node.classList.toggle('active', i === n);
    });

    // Swap panels using hidden attribute
    stagePanels.forEach((panel, i) => {
      if (i === n) {
        panel.removeAttribute('hidden');
        gsap.fromTo(panel,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }
        );
        // Fire typewriter for this panel's terminal
        const output = panel.querySelector('.pipeline-terminal__output');
        const cmd = output?.dataset.cmd;
        if (cmd) startTypewriter(output, cmd);
        // Animate stat bars
        animateStatBars(panel);
      } else {
        panel.setAttribute('hidden', '');
        gsap.set(panel, { opacity: 0, y: 0 });
      }
    });

    // Light connector dots up to active stage
    const dotsPerSegment = 3;
    trackDots.forEach((dot, i) => {
      const segmentIndex = Math.floor(i / dotsPerSegment);
      dot.classList.toggle('lit', segmentIndex < n);
    });

    currentStage = n;
  }

  function animateStatBars(panel) {
    const fills = panel.querySelectorAll('.stat-fill');
    fills.forEach(fill => {
      const targetWidth = fill.dataset.width || '100';
      gsap.fromTo(fill, 
        { width: '0%' }, 
        { width: `${targetWidth}%`, duration: 1, ease: 'expo.out' }
      );
    });
  }

  let typewriterInterval = null;
  function startTypewriter(el, text) {
    // Clear previous if any
    if (el._typeInterval) clearInterval(el._typeInterval);
    el.textContent = '';
    
    let i = 0;
    el._typeInterval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(el._typeInterval);
      }
    }, 20);
  }
}
