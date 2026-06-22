import { flags } from '../../core/performance.js';

let animId, hidden = false;

export function initHeroStaffAug() {
  initThreeScene();
  animateText();
  initScrollButtons();
}

function initThreeScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;
  // On very small screens, Three.js canvas is hidden via CSS
  if (window.innerWidth < 480) { canvas.style.display = 'none'; return; }

  const W = canvas.clientWidth, H = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 1.5, 7);

  // Central hub
  const hubMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), hubMat);
  scene.add(hub);

  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.08 });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), glowMat);
  scene.add(glow);

  // Orbital nodes — 6
  const ORBIT_R = 3.5;
  const orbitals = [];
  for (let i = 0; i < 6; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00c8ff })
    );
    scene.add(mesh);

    const pos = new Float32Array(6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.2 }));
    scene.add(line);

    orbitals.push({
      mesh, line,
      baseAngle: (i / 6) * Math.PI * 2,
      speed: i < 3 ? 0.004 : -0.002,
      yOff: (Math.random() - 0.5) * 1.2,
    });
  }

  // Particles — 180
  const pCount = 180;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = Math.random() * 8, theta = Math.random() * Math.PI * 2, phi = Math.acos((Math.random() * 2) - 1);
    pPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i*3+2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00aaff, size: 0.025, transparent: true, opacity: 0.35 }));
  scene.add(particles);

  // Mouse parallax
  let targetX = 0, targetY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => { hidden = document.hidden; });
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });

  function animate() {
    animId = requestAnimationFrame(animate);
    if (hidden) return;

    hub.rotation.y += 0.003; glow.rotation.y += 0.001;
    const t = performance.now() * 0.001;

    orbitals.forEach(o => {
      const angle = o.baseAngle + t * o.speed * 100;
      o.mesh.position.x = Math.cos(angle) * ORBIT_R;
      o.mesh.position.y = o.yOff;
      o.mesh.position.z = Math.sin(angle) * ORBIT_R * 0.5;
      const arr = o.line.geometry.attributes.position.array;
      arr[0]=0; arr[1]=0; arr[2]=0;
      arr[3]=o.mesh.position.x; arr[4]=o.mesh.position.y; arr[5]=o.mesh.position.z;
      o.line.geometry.attributes.position.needsUpdate = true;
    });

    const pa = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      pa[i*3+1] += 0.003;
      if (pa[i*3+1] > 8) pa[i*3+1] = -8;
    }
    pGeo.attributes.position.needsUpdate = true;

    camera.position.x += (targetX * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (1.5 + targetY * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
}

function animateText() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.1);
  tl.to('.hero-line', { clipPath: 'inset(0 0% 0 0)', duration: 1.0, stagger: 0.15, ease: 'expo.out' }, 0.2);
  tl.to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, 0.7);
  tl.to('.hero-buttons', { opacity: 1, y: 0, duration: 0.8 }, 0.9);
  tl.to('.hero-metric-badge', { opacity: 1, x: 0, duration: 0.8 }, 1.2);
  gsap.to('.hero-scroll-arrow', { y: 8, yoyo: true, repeat: -1, duration: 0.8, ease: 'sine.inOut' });
}

function initScrollButtons() {
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.scrollTo;
      if (target) gsap.to(window, { scrollTo: { y: target, offsetY: 64 }, duration: 1, ease: 'power2.inOut' });
    });
  });

  // Talent pool filter
  const filterBtns = document.querySelectorAll('.pool-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.role-card').forEach(card => {
        const match = filter === 'all' || card.dataset.discipline === filter;
        if (match) {
          card.classList.remove('filtered-out');
          gsap.fromTo(card, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });

  // Talent pool card reveals on scroll + REQUEST buttons
  const cards = document.querySelectorAll('.role-card');
  cards.forEach(card => {
    const isMobile = window.innerWidth <= 768;
    ScrollTrigger.create({
      trigger: card, start: isMobile ? 'top 90%' : 'top 80%', once: true,
      onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }),
    });
  });
  document.querySelectorAll('.role-card-cta').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.role-card');
      redirectToContact(card);
    });
  });

  document.querySelectorAll('.role-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.role-card-cta')) return;
      card.classList.add('is-active');
      gsap.to(card, { scale: 1.03, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 });
      redirectToContact(card);
    });
  });
}

function redirectToContact(card) {
  const title = card?.querySelector('.role-card-title')?.textContent?.trim() || '';
  const issueField = document.getElementById('inp-issue');
  if (issueField && title) issueField.value = 'Interested in: ' + title;
  gsap.to(window, { scrollTo: { y: '#staffaug-contact', offsetY: 64 }, duration: 1, ease: 'power2.inOut' });
}
