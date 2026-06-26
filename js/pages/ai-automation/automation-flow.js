/**
 * automation-flow.js — Zero Human in the Loop
 * 5-node scroll-scrubbed pipeline: DATA IN → AI PARSE → DECISION → ACTION → VERIFY
 * Adapts the devops pipeline.js pattern to 5 nodes.
 */

export function initAutomationFlow(isMobile = false, reducedMotion = false) {
  const section = document.getElementById('automation-flow');
  if (!section) return;

  const nodes   = Array.from(section.querySelectorAll('.flow-node'));
  const lineFill = section.querySelector('.flow-line-fill');
  if (!nodes.length) return;

  // ── Reduced motion: show all nodes immediately ────────
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    nodes.forEach(n => n.classList.add('active'));
    if (lineFill) lineFill.style.transform = 'scaleX(1)';
    return;
  }

  // ── Entrance Animation (No Pinning) ────────────────────
  gsap.set(lineFill, { scaleX: 0 });
  
  ScrollTrigger.create({
    trigger: '#automation-flow',
    start: 'top 75%',
    onEnter: () => {
      // Light up nodes sequentially
      nodes.forEach((n, i) => {
        setTimeout(() => {
          n.classList.add('active');
        }, i * 300); // 300ms delay between each node
      });
      // Fill the line across the total duration
      if (lineFill) {
        gsap.to(lineFill, { scaleX: 1, duration: (nodes.length - 1) * 0.3, ease: 'none' });
      }
    },
    once: true,
  });
}
