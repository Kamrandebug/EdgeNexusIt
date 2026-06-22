import { tier, reducedMotion } from './performance.js';

// Generate canvas noise texture
// Tier-gated: high/mid = full resolution, low = halved (coarser but same identity)
let noiseCache = null;

export function generateNoise() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Low tier: halve resolution (regen frequency handled by caller)
  const scale = (tier === 'low' || reducedMotion) ? 0.5 : 1.0;
  canvas.width = Math.round(window.innerWidth * scale);
  canvas.height = Math.round(window.innerHeight * scale);

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255;
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = reducedMotion ? 4 : 8; // Lower opacity when reduced motion
  }

  ctx.putImageData(imageData, 0, 0);

  // Scale up display to fill viewport (CSS handles the stretch)
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';

  // Cache the data URL to avoid re-encode if unchanged
  noiseCache = canvas.toDataURL();

  // Apply to body as background
  document.body.style.backgroundImage = `url(${noiseCache})`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundAttachment = 'fixed';
}
