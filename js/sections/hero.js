import { flags, hasHover, tier, breakpoint, reducedMotion } from '../core/performance.js';

// js/sections/hero.js
export function initHero() {
  const section = document.getElementById('hero');
  if (!section) return;

  // ── Part A: Three.js Globe Canvas ──────────────────────────
  try {
    initHeroCanvas(section);
  } catch (e) {
    console.warn('[EdgeNexus] Three.js canvas init failed:', e);
    const canvas = document.getElementById('hero-canvas');
    if (canvas) canvas.style.display = 'none';
  }

  // ── Part B: Pinned Hero Scroll Scene ─────────────────────────────
  initHeroPin();

  // ── Part C: CTA Button Functionality ─────────────────────────────
  const primaryBtn = section.querySelector('.hero-cta .btn-primary');
  const ghostBtn = section.querySelector('.hero-cta .btn-ghost');

  if (primaryBtn) {
    primaryBtn.addEventListener('click', () => {
      gsap.to(window, {
        scrollTo: { y: '#cta', offsetY: 64 },
        duration: 1,
        ease: 'expo.inOut'
      });
    });
  }

  if (ghostBtn) {
    ghostBtn.addEventListener('click', () => {
      gsap.to(window, {
        scrollTo: { y: '#services', offsetY: 64 },
        duration: 1,
        ease: 'expo.inOut'
      });
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// A. THREE.JS CANVAS: 3D Wireframe Globe (v2 — visual fixes applied)
// Replaces the flat network topology with a rotating globe on the right.
// ─────────────────────────────────────────────────────────────────────
function initHeroCanvas(section) {
  const canvas  = document.getElementById('hero-canvas');
  if (!canvas) return;

  // FIX 1: 45° FOV, correct aspect from canvas.clientWidth/clientHeight
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Mobile: square canvas (130vw × 130vw) — right-anchored, full-bg globe
  const isMobileInit = window.innerWidth <= 768;
  const initW = isMobileInit
    ? window.innerWidth * 1.3
    : (canvas.clientWidth || window.innerWidth * 0.62);
  const initH = isMobileInit
    ? window.innerWidth * 1.3                        /* square — matches CSS 130vw */
    : (canvas.clientHeight || initW);

  renderer.setSize(initW, initH, false);

  const fov = flags.isMobile ? 60 : 45;
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, initW / initH, 0.1, 100);
  camera.position.set(0, 0, 7); // FIX 2: start z=7; bridge animates to 12/13

  const clock = new THREE.Clock();

  // Mobile opacity — wireframe is visible but layered behind content text
  const isSmallMobile = window.innerWidth <= 480;
  const isMobileMid = window.innerWidth > 480 && window.innerWidth <= 768;
  const isMobileAny = isSmallMobile || isMobileMid;

  const MOBILE_CANVAS_OPACITY = 1;
  canvas.style.opacity = isMobileAny ? String(MOBILE_CANVAS_OPACITY) : '0';

  // ── Globe Configuration (tiered LOD) ────────────────────────
  const GLOBE_RADIUS        = 4.2;
  // Tier-based detail levels (per §2 + Phase 3 spec)
  let GLOBE_LAT_LINES, GLOBE_LON_LINES, GLOBE_NODE_COUNT, GLOBE_PACKET_COUNT, GLOBE_ROTATION_SPEED;
  let connectionLinesEnabled = true;
  let bgParticlesEnabled = true;

  if (reducedMotion) {
    // Render — axial wobble paused, no comets/particles, same geometry
    GLOBE_LAT_LINES = 18;
    GLOBE_LON_LINES = 24;
    GLOBE_NODE_COUNT = 55;
    GLOBE_PACKET_COUNT = 0;
    GLOBE_ROTATION_SPEED = 0.0018;
    connectionLinesEnabled = true;
    bgParticlesEnabled = false;
  } else if (tier === 'low') {
    GLOBE_LAT_LINES = 10;
    GLOBE_LON_LINES = 12;
    GLOBE_NODE_COUNT = 18;
    GLOBE_PACKET_COUNT = 6;
    GLOBE_ROTATION_SPEED = 0.0018;
    connectionLinesEnabled = false; // Most expensive — disable at low
    bgParticlesEnabled = false;
  } else if (tier === 'mid') {
    GLOBE_LAT_LINES = 14;
    GLOBE_LON_LINES = 18;
    GLOBE_NODE_COUNT = 35;
    GLOBE_PACKET_COUNT = 16;
    GLOBE_ROTATION_SPEED = 0.0018;
    connectionLinesEnabled = true;
    bgParticlesEnabled = true;
  } else {
    // high tier (current defaults — unchanged)
    GLOBE_LAT_LINES = 18;
    GLOBE_LON_LINES = 24;
    GLOBE_NODE_COUNT = 55;
    GLOBE_PACKET_COUNT = 30;
    GLOBE_ROTATION_SPEED = 0.0018;
    connectionLinesEnabled = true;
    bgParticlesEnabled = true;
  }
  const GLOBE_COLOR         = 0x00aaff;
  const GLOBE_ACCENT        = 0x00ff88; // Added for cinematic pop
  const GLOBE_GRID_OPACITY  = isMobileAny ? 0.60 : 0.22;
  const GLOBE_NODE_OPACITY  = 1.0;
  const GLOBE_ARC_OPACITY   = isMobileAny ? 0.85 : 0.45;
  const GLOBE_GLOW_OPACITY  = isMobileAny ? 0.25 : 0.08;

  // ── Globe Group ─────────────────────────────────────────────
  const globeGroup = new THREE.Group();
  
  let offset = [2.8, 0, 0];
  if (window.innerWidth <= 768) {
    offset = [0, 0, 0]; // CSS handles right-side positioning; Three.js origin = canvas center
  } else if (window.innerWidth <= 1024) {
    offset = [1.8, -0.5, 0];
  }

  globeGroup.position.set(...offset);
  scene.add(globeGroup);

  // Mobile: no scale-down — globe fills the background at full size.
  // Size is controlled by camera distance instead.

  // Add a subtle inner light for depth
  const innerLight = new THREE.PointLight(GLOBE_COLOR, isMobileAny ? 2.5 : 1, 10);
  innerLight.position.set(0, 0, 0);
  globeGroup.add(innerLight);

  // FIX 8: subtle initial tilt
  globeGroup.rotation.x = 0.15;
  globeGroup.rotation.y = -0.4;

  // ── Latitude / Longitude Wireframe Grid (FIX 3+4: depth-aware) ─
  const gridMaterial = new THREE.LineBasicMaterial({
    color: GLOBE_COLOR,
    opacity: GLOBE_GRID_OPACITY,
    transparent: true,
    linewidth: 1,
    blending: THREE.AdditiveBlending // Added for cinematic glow
  });

  const latLines = [];
  const lonLines = [];

  // Latitude rings
  for (let lat = -80; lat <= 80; lat += (180 / GLOBE_LAT_LINES)) {
    const phi = THREE.MathUtils.degToRad(lat);
    const r   = GLOBE_RADIUS * Math.cos(phi);
    const y   = GLOBE_RADIUS * Math.sin(phi);
    const points = [];
    for (let seg = 0; seg <= 64; seg++) {
      const theta = (seg / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    const geo  = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, gridMaterial.clone());
    globeGroup.add(line);
    latLines.push({ line });
  }

  // Longitude lines (meridians)
  for (let lon = 0; lon < 360; lon += (360 / GLOBE_LON_LINES)) {
    const theta = THREE.MathUtils.degToRad(lon);
    const points = [];
    for (let seg = 0; seg <= 64; seg++) {
      const phi = ((seg / 64) - 0.5) * Math.PI;
      const x = GLOBE_RADIUS * Math.cos(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi) * Math.sin(theta);
      points.push(new THREE.Vector3(x, y, z));
    }
    const geo  = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, gridMaterial.clone());
    globeGroup.add(line);
    lonLines.push({ line });
  }

  // ── Surface Nodes (Fibonacci sphere) — FIX 6: improved quality ──
  const nodeMat = new THREE.MeshBasicMaterial({
    color: 0x00ccff,    // brighter pop
    transparent: true,
    opacity: GLOBE_NODE_OPACITY,
    depthWrite: false,    // prevents z-fighting
    blending: THREE.AdditiveBlending
  });
  
  // Node Halo Material for cinematic glow
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12); // Slightly smaller core
  const haloGeo = new THREE.SphereGeometry(0.12, 12, 12);  // Large glow halo

  const surfaceNodes = [];

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < GLOBE_NODE_COUNT; i++) {
    const y     = 1 - (i / (GLOBE_NODE_COUNT - 1)) * 2;
    const r     = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
    mesh.position.set(
      x * GLOBE_RADIUS,
      y * GLOBE_RADIUS,
      z * GLOBE_RADIUS
    );

    // Add halo for cinematic glow
    const halo = new THREE.Mesh(haloGeo, haloMat.clone());
    mesh.add(halo);

    globeGroup.add(mesh);
    surfaceNodes.push({
      mesh,
      halo,
      dir: new THREE.Vector3(x, y, z).normalize()
    });
  }

  // ── FIX 7: Surface Connection Lines Between Nearby Nodes (tier-gated) ──
  const connectionLines = [];
  if (connectionLinesEnabled) {
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x00aaff,
      opacity: 0.20,
      transparent: true,
      depthWrite: false
    });

    for (let i = 0; i < surfaceNodes.length; i++) {
      const nodeA = surfaceNodes[i];
      const distances = surfaceNodes
        .map((nodeB, j) => ({ j, dist: nodeA.dir.distanceTo(nodeB.dir) }))
        .filter(({ j, dist }) => j !== i && dist < 0.65)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);

      distances.forEach(({ j }) => {
        if (i >= j) return;
        const nodeB = surfaceNodes[j];
        const points = [
          nodeA.mesh.position.clone(),
          nodeB.mesh.position.clone()
        ];
        const geo  = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, connectionMaterial.clone());
        line.material.depthWrite = false;
        globeGroup.add(line);
        connectionLines.push({ line });
      });
    }
  }

  // ── Inner Glow Sphere ─────────────────────────────────────────
  const glowGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.98, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: GLOBE_COLOR,
    opacity: GLOBE_GLOW_OPACITY,
    transparent: true,
    side: THREE.BackSide
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  globeGroup.add(glowMesh);

  // ── Data Arc Packets (great-circle routes) ────────────────────
  function buildArcPoints(startDir, endDir, radius, segments = 64) {
    const points = [];
    const start  = startDir.clone().normalize();
    const end    = endDir.clone().normalize();
    
    // Create a curved path that lifts off the surface slightly
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).normalize();
    const dist = start.distanceTo(end);
    const altitude = 1.0 + (dist * 0.2); // Lift based on distance
    
    for (let t = 0; t <= 1; t += 1 / segments) {
      // Quadratic bezier-like curve for better "arc" look
      const dir = new THREE.Vector3();
      const t1 = (1 - t) * (1 - t);
      const t2 = 2 * (1 - t) * t;
      const t3 = t * t;
      
      dir.x = t1 * start.x + t2 * mid.x * altitude + t3 * end.x;
      dir.y = t1 * start.y + t2 * mid.y * altitude + t3 * end.y;
      dir.z = t1 * start.z + t2 * mid.z * altitude + t3 * end.z;
      
      points.push(dir.normalize().multiplyScalar(radius * (1 + Math.sin(t * Math.PI) * 0.08)));
    }
    return points;
  }

  const arcMaterial = new THREE.LineBasicMaterial({
    color: GLOBE_COLOR,
    opacity: GLOBE_ARC_OPACITY,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  // Comet trail material
  const packetMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    opacity: 0.9,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  const packetGeo = new THREE.SphereGeometry(0.04, 8, 8);

  const arcs = [];

  for (let i = 0; i < GLOBE_PACKET_COUNT; i++) {
    const idxA = Math.floor(Math.random() * GLOBE_NODE_COUNT);
    let   idxB = Math.floor(Math.random() * GLOBE_NODE_COUNT);
    while (idxB === idxA) idxB = Math.floor(Math.random() * GLOBE_NODE_COUNT);

    const nodeA = surfaceNodes[idxA];
    const nodeB = surfaceNodes[idxB];

    const points   = buildArcPoints(nodeA.dir, nodeB.dir, GLOBE_RADIUS);
    const arcGeo   = new THREE.BufferGeometry().setFromPoints(points);
    const arcLine  = new THREE.Line(arcGeo, arcMaterial.clone());

    // Create a small group for the packet and its "tail"
    const packetGroup = new THREE.Group();
    const packet = new THREE.Mesh(packetGeo, packetMaterial.clone());
    packetGroup.add(packet);
    
    // Add a tail effect (multiple smaller particles)
    const tailCount = 4;
    const tails = [];
    for(let j=0; j<tailCount; j++) {
      const tail = new THREE.Mesh(
        new THREE.SphereGeometry(0.03 - (j * 0.005), 6, 6),
        packetMaterial.clone()
      );
      tail.material.opacity = 0.5 - (j * 0.1);
      packetGroup.add(tail);
      tails.push(tail);
    }

    globeGroup.add(arcLine);
    globeGroup.add(packetGroup);

    arcs.push({
      line:     arcLine,
      points:   points,
      packet:   packetGroup,
      tails:    tails,
      progress: Math.random(),
      speed:    0.003 + Math.random() * 0.005 // Slightly faster for "extreme" feel
    });
  }

  // ── Cinematic Background Particles (tier-gated) ──────────
  // At low tier or reducedMotion, skip particle system entirely
  let particles = null;
  let partCount = 0;
  if (bgParticlesEnabled) {
    partCount = 80;
  }
  const partGeo = new THREE.BufferGeometry();
  const partPos = new Float32Array(Math.max(partCount, 1) * 3);
  const partSpeeds = new Float32Array(Math.max(partCount, 1));

  for (let i = 0; i < partCount; i++) {
    const r = GLOBE_RADIUS * (1.2 + Math.random() * 2.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    partPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    partPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    partPos[i * 3 + 2] = r * Math.cos(phi);
    
    partSpeeds[i] = 0.1 + Math.random() * 0.3;
  }

  if (bgParticlesEnabled) {
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x00aaff,
      size: 0.06,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    particles = new THREE.Points(partGeo, partMat);
    globeGroup.add(particles);
  }

  // ── Mouse parallax (desktop only — no mouse on mobile) ────────────
  let targetX = 0, targetY = 0;
  let mouseRaf;
  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', e => {
      if (mouseRaf) return;
      mouseRaf = requestAnimationFrame(() => {
        mouseRaf = null;
        targetX = ((e.clientX / window.innerWidth)  - 0.5) * 1.8;
        targetY = ((e.clientY / window.innerHeight) - 0.5) * -1.0;
      });
    }, { passive: true });
  }

  // ── Visibility tracking: pause RAF loops when off-screen or tab hidden ──
  let pageHidden = false;
  let sectionVisible = true;
  let paused = false;

  function isGlobeActive() {
    return !pageHidden && sectionVisible;
  }

  const visibilityHandler = () => {
    pageHidden = document.hidden;
    updatePaused();
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  const sectionObserver = new IntersectionObserver(([entry]) => {
    sectionVisible = entry.isIntersecting;
    updatePaused();
  }, { threshold: 0 });
  sectionObserver.observe(section);

  function updatePaused() {
    const shouldPause = !isGlobeActive();
    if (shouldPause === paused) return;
    paused = shouldPause;
    if (!paused && !animId) {
      // Resume the loop — consume the time delta so elapsed doesn't jump
      clock.getDelta();
      animate();
    }
  }

  // ── Tier-gate: skip per-frame depth fade on mid/low (saves ~1ms/frame) ──
  const enableDepthFade = tier === 'high' && !reducedMotion;
  const skipNodePulse = tier === 'low';    // low: static node opacity
  const skipPackets = tier !== 'high';      // mid/low: no data packet animation

  // ── Render loop ────────────────────────────────────────────────
  let animId;
  function animate() {
    if (paused) {
      animId = null; // Stop scheduling entirely when off-screen
      return;
    }
    animId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // 1. Auto-rotate the entire globe group
    globeGroup.rotation.y += GLOBE_ROTATION_SPEED;
    if (!reducedMotion) {
      globeGroup.rotation.x = 0.15 + Math.sin(elapsed * 0.08) * 0.04;
    }

    // FIX 3+4: Depth-fade grid lines — only on high tier, skips when off-screen
    if (enableDepthFade) {
      const allGridLines = [...latLines, ...lonLines];
      globeGroup.updateMatrixWorld(true);
      allGridLines.forEach(({ line }) => {
        const positions = line.geometry.attributes.position;
        if (!positions) return;
        const midIdx = Math.floor(positions.count / 2);
        const localPos = new THREE.Vector3(
          positions.getX(midIdx),
          positions.getY(midIdx),
          positions.getZ(midIdx)
        );
        const worldPos = localPos.clone().applyMatrix4(globeGroup.matrixWorld);
        const depth = worldPos.z;
        const t = (depth + GLOBE_RADIUS) / (GLOBE_RADIUS * 2);
        line.material.opacity = 0.03 + t * 0.25;
      });
    }

    // 2. Surface node opacity pulse — skip on low tier
    if (!skipNodePulse) {
      surfaceNodes.forEach((node, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 1.4 + i * 0.8);
        node.mesh.material.opacity = pulse;
        if (node.halo) {
          node.halo.material.opacity = pulse * 0.35;
          const scale = 1.0 + Math.sin(elapsed * 2 + i) * 0.1;
          node.halo.scale.set(scale, scale, scale);
        }
      });
    }

    // 3. Advance data packets along their arc paths — skip on mid/low
    if (!skipPackets) {
      arcs.forEach(arc => {
        arc.progress += arc.speed;
        if (arc.progress >= 1) arc.progress = 0;

        const totalPoints = arc.points.length;
        const currIdx = Math.floor(arc.progress * (totalPoints - 1));

        // Update packet position
        arc.packet.position.copy(arc.points[currIdx]);

        // Update tail positions for "comet" effect
        if (arc.tails) {
          arc.tails.forEach((tail, j) => {
            const tailIdx = Math.max(0, currIdx - (j + 1) * 3);
            tail.position.copy(arc.points[tailIdx]).sub(arc.packet.position);
          });
        }

        const edgeFade = Math.sin(arc.progress * Math.PI);
        arc.packet.children[0].material.opacity = 0.4 + 0.6 * edgeFade;
      });
    }

    // 4. Animate background particles (null if tier-gated off)
    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < partCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsed * 0.2 + i) * 0.002;
        positions[i * 3] += Math.cos(elapsed * 0.2 + i) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Mouse parallax — dead zone to prevent micro-drift
    const camLerpX = (targetX - camera.position.x) * 0.04;
    const camLerpY = (targetY - camera.position.y) * 0.04;
    if (Math.abs(camLerpX) > 0.0005 || Math.abs(camLerpY) > 0.0005) {
      camera.position.x += camLerpX;
      camera.position.y += camLerpY;
      camera.lookAt(0, 0, 0);
    }

    // 6. Render
    renderer.render(scene, camera);
  }
  animate();

  // ── Resize (mobile: square 130vw·130vw; desktop: hero width) ─
  window.addEventListener('resize', () => {
    const isMobileSize = window.innerWidth <= 768;
    let w, h;
    if (isMobileSize) {
      const size = window.innerWidth * 1.3;
      w = size; h = size;            // square — fixes oval globe
      camera.aspect = 1.0;
    } else {
      w = canvas.clientWidth || window.innerWidth * 0.62;
      h = canvas.clientHeight || w;
      camera.aspect = w / h;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileSize ? 1.5 : 2));
  });

  // Orientation change — wait for layout to settle
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const isMobileSize = window.innerWidth <= 768;
      let w, h;
      if (isMobileSize) {
        const size = window.innerWidth * 1.3;
        w = size; h = size;
        camera.aspect = 1.0;
      } else {
        w = canvas.clientWidth || window.innerWidth * 0.62;
        h = canvas.clientHeight || w;
        camera.aspect = w / h;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }, 300);
  });

  // Store for Phase 2 scroll control
  window._heroRenderer = renderer;
  window._heroScene    = scene;
  window._heroCamera   = camera;

  // ── Continuity Bridge Implementation ────────────────────────────
  window._heroBridge = () => {
    // Initial hidden state for elements (since registerReveals skips #hero)
    const headline = document.querySelector('.hero-headline');
    const eyebrow = document.querySelector('.text-eyebrow');
    const divider = document.querySelector('.reveal-divider');
    const body = document.querySelector('.text-body');
    const typer = document.querySelector('#typer');
    const ctas = document.querySelector('.hero-cta');

    gsap.set([eyebrow, headline], { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(divider, { scaleX: 0, transformOrigin: 'left' });
    gsap.set([body, typer, ctas], { opacity: 0, y: 24 });

    // 1. Fade in canvas — on mobile keep low opacity so text stays readable
    const targetOpacity = isMobileAny ? MOBILE_CANVAS_OPACITY : 1;
    gsap.to(canvas, { opacity: targetOpacity, duration: 0.4 });

    // Camera pullback — closer on mobile so globe fills more of the canvas
    const targetZ = isMobileAny ? 11 : 11;
    gsap.to(camera.position, {
      z: targetZ,
      duration: 1.2,
      ease: 'power2.inOut'
    });

    // 3. Staggered entrance of UI elements
    const uiTl = gsap.timeline({ delay: 0.6 });

    uiTl.to([eyebrow, headline], {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      stagger: 0.1,
      ease: 'power4.out'
    })
    .to(divider, { scaleX: 1, duration: 0.8, ease: 'expo.out' }, '-=0.8')
    .to([body, typer, ctas], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.6');
  };
}

// ─────────────────────────────────────────────────────────────────────
// B. HERO PIN + SCROLL SCENE
// ─────────────────────────────────────────────────────────────────────
function initHeroPin() {
  const content   = document.querySelector('.hero-content');
  const canvas    = document.getElementById('hero-canvas');

  if (!content || !canvas) return;

  // Desktop: pin + scrub exit (unchanged)
  // Tablet/mobile: unpin — content reveals via ScrollTrigger onEnter
  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": function() {
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end:   '+=40%',
          pin:   true,
          scrub: 1.5,
          anticipatePin: 1,
        }
      });

      exitTl.to({}, { duration: 0.6 });
      exitTl.to(content, {
        opacity: 0,
        y: -40,
        scale: 0.97,
        duration: 0.25,
        ease: 'power2.in',
      }, '>');
    },

    "(max-width: 1024px)": function() {
      // No pin — hero content is always visible.
      // The globe on mobile is tiered separately in Phase 3.
      // Content entry is handled by the hero bridge/_heroBridge already.
      // Just ensure ScrollTrigger doesn't hold a stale pin reference.
    }
  });
}

// ─────────────────────────────────────────────────────────────────────
// D. HERO TYPER — rotating attribute phrase