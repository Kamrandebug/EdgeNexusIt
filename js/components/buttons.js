// js/components/buttons.js
export function initButtons() {
  document.querySelectorAll('.btn-ghost').forEach(btn => {
    injectBorderTrace(btn);
  });
}

function injectBorderTrace(btn) {
  const { width, height } = btn.getBoundingClientRect();
  if (!width || !height) return;

  // Perimeter for dasharray
  const perimeter = Math.round(2 * (width + height));

  // Create SVG overlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('btn-ghost-svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.classList.add('btn-ghost-rect');
  rect.setAttribute('x', 0.5);
  rect.setAttribute('y', 0.5);
  rect.setAttribute('width', width - 1);
  rect.setAttribute('height', height - 1);
  rect.style.setProperty('--perimeter', perimeter);

  svg.appendChild(rect);
  btn.style.position = 'relative';
  btn.insertBefore(svg, btn.firstChild);
}
