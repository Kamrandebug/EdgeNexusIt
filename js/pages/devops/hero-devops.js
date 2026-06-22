// js/pages/devops/hero-devops.js
// ─────────────────────────────────────────────────────
// Cinematic scroll animations and Pipeline Dashboard for DevOps Hero
// Uses GSAP 3.12.2 + ScrollTrigger (globally registered)
// ─────────────────────────────────────────────────────

export function initHeroDevops() {
  const section = document.querySelector('.hero-devops');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  // ── IntersectionObserver: pause dashboard auto-cycle + terminal off-screen ──
  let sectionVisible = true;
  let doPageHidden = false;
  function doIsActive() { return !doPageHidden && sectionVisible; }
  document.addEventListener('visibilitychange', () => {
    doPageHidden = document.hidden;
  });
  const io = new IntersectionObserver(([entry]) => {
    sectionVisible = entry.isIntersecting;
  }, { threshold: 0 });
  io.observe(section);

  // ── 1. PIPELINE DASHBOARD LOGIC ──────────────────────
  initPipelineDashboard();

  // ── 2. HERO ENTRY CHOREOGRAPHY ───────────────────────
  const eyebrow = section.querySelector('.hero-devops__eyebrow .text-eyebrow');
  const headlineEl = section.querySelector('.hero-devops__headline');
  const body = section.querySelector('.hero-devops__body');
  const cta = section.querySelector('.hero-devops__cta');

  // Split headline into individual words for word-by-word stagger
  if (headlineEl && !prefersReducedMotion) {
    const html = headlineEl.innerHTML;
    const parts = html.split(/(<br\s*\/?>)/);
    let newHtml = '';
    parts.forEach(p => {
      if (p.match(/<br\s*\/?>/)) {
        newHtml += p;
      } else if (p.match(/<span/)) {
        const spanMatch = p.match(/^(<span[^>]*>)(.*?)(<\/span>)$/);
        if (spanMatch) {
          const spanOpen = spanMatch[1];
          const spanContent = spanMatch[2];
          const spanClose = spanMatch[3];
          const wrappedWords = spanContent.split(/\s+/).filter(Boolean).map(w =>
            `<span class="word" style="display:inline-block">${w}</span>`
          ).join(' ');
          newHtml += spanOpen + wrappedWords + spanClose;
        } else {
          newHtml += p;
        }
      } else {
        const wrapped = p.split(/\s+/).filter(Boolean).map(w =>
          `<span class="word" style="display:inline-block">${w}</span>`
        ).join(' ');
        newHtml += wrapped;
      }
    });
    headlineEl.innerHTML = newHtml;
  }

  const headlineWords = headlineEl ? headlineEl.querySelectorAll('.word') : [];
  const accentUnderline = headlineEl ? headlineEl.querySelector('.headline-accent') : null;

  // ── HERO PIN (≥1025px) ─────────────────────────────
  // DevOps Hero entry timeline is delay-based, not scrub-linked,
  // so it doesn't depend on the pin. The dashboard auto-cycle (8s/12s loops)
  // is scroll-independent. Both unaffected by unpinning.
  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": function() {
      if (!prefersReducedMotion) {
        gsap.to(section.querySelector('.hero-devops__inner'), {
          y: -80,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
      }
    },

    "(max-width: 1024px)": function() {
      // Unpin. Entry timeline is delay-based, not scrub-linked — runs as-is.
      // Dashboard auto-cycle unaffected either way.
    }
  });

  // Entry timeline — run once on load (not scrubbed)
  if (!prefersReducedMotion) {
    // Set initial states
    gsap.set(eyebrow, { y: 10, opacity: 0 });
    gsap.set(headlineWords.length ? headlineWords : headlineEl,
      headlineWords.length ? { y: 40, opacity: 0 } : { opacity: 0 });
    gsap.set(body, { y: 20, opacity: 0 });
    gsap.set(cta, { y: 15, opacity: 0 });
    
    // Scanline texture initial state
    gsap.set(document.body, { '--scanline-opacity': 0 });

    const entryTl = gsap.timeline({ delay: 0.1 });

    // t=0.03s: Scanline texture fades in
    entryTl.to(document.body, { '--scanline-opacity': 1, duration: 0.4, ease: 'power2.out' }, 0.03);

    // t=0.10s: Eyebrow
    entryTl.to(eyebrow, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1);

    // t=0.25s: Headline words stagger (expo.out)
    if (headlineWords.length) {
      entryTl.to(headlineWords, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'expo.out',
      }, 0.25);
    }

    // After headline: accent underline on "FEAR." draws left→right
    if (accentUnderline) {
      entryTl.to(accentUnderline, {
        '--underline-scale': 1,
        duration: 0.4,
        ease: 'expo.out'
      }, '+=0.1');
    }

    // Body text
    entryTl.to(body, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '+=0.1');

    // CTA buttons
    entryTl.to(cta, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '+=0.1');
  }

  // ── Part C: CTA Button Functionality ─────────────────────────────
  if (cta) {
    const primaryBtn = cta.querySelector('.btn-primary');
    const ghostBtn = cta.querySelector('.btn-ghost');

    if (primaryBtn) {
      primaryBtn.addEventListener('click', () => {
        gsap.to(window, {
          scrollTo: { y: '#cta-devops', offsetY: 64 },
          duration: 1,
          ease: 'expo.inOut'
        });
      });
    }

    if (ghostBtn) {
      ghostBtn.addEventListener('click', () => {
        gsap.to(window, {
          scrollTo: { y: '#stack', offsetY: 64 },
          duration: 1,
          ease: 'expo.inOut'
        });
      });
    }
  }

  // ── 3. TERMINAL OUTPUT TYPEWRITER ────────────────────
  initTerminalOutput();
}

function initPipelineDashboard() {
  const dashboard = document.querySelector('.pipeline-dashboard-wrap');
  if (!dashboard) return;

  const scanRow = dashboard.querySelector('[data-stage="SCAN"]');
  const scanFill = scanRow?.querySelector('.progress-fill');
  const scanCounter = scanRow?.querySelector('.counter');
  
  const stages = ['SCAN', 'STAGE', 'DEPLOY'];
  let currentStageIndex = 0; // 0=SCAN active
  
  // SCAN bar loop: 0->65% over 8s
  gsap.to(scanFill, {
    width: '65%',
    duration: 8,
    repeat: -1,
    ease: 'none'
  });

  // RUNNING counter — paused when off-screen / tab hidden
  let scanTime = 0;
  let counterInterval = setInterval(() => {
    if (!doIsActive()) return;
    if (currentStageIndex === 0) {
      scanTime += 0.1;
      if (scanCounter) scanCounter.textContent = scanTime.toFixed(1);
    }
  }, 100);

  // Full cycle every 12s
  function cycleStages() {
    const stageElements = {
      SCAN: dashboard.querySelector('[data-stage="SCAN"]'),
      STAGE: dashboard.querySelector('[data-stage="STAGE"]'),
      DEPLOY: dashboard.querySelector('[data-stage="DEPLOY"]')
    };

    // 1. SCAN completes
    setTimeout(() => {
      if (!doIsActive()) { holdUntilActive(() => cycleStages()); return; }
      setStageState(stageElements.SCAN, 'completed');
      setStageState(stageElements.STAGE, 'active');
      currentStageIndex = 1;

      // 2. STAGE completes
      setTimeout(() => {
        if (!doIsActive()) { holdUntilActive(() => cycleStages()); return; }
        setStageState(stageElements.STAGE, 'completed');
        setStageState(stageElements.DEPLOY, 'active');
        currentStageIndex = 2;

        // 3. DEPLOY completes
        setTimeout(() => {
          if (!doIsActive()) { holdUntilActive(() => cycleStages()); return; }
          setStageState(stageElements.DEPLOY, 'completed');

          // 4. RESET
          setTimeout(() => {
            if (!doIsActive()) { holdUntilActive(() => cycleStages()); return; }
            resetDashboard(stageElements);
            currentStageIndex = 0;
            scanTime = 0;
            cycleStages();
          }, 2000);
        }, 3000);
      }, 3000);
    }, 4000);
  }

  function holdUntilActive(callback) {
    const check = () => {
      if (doIsActive()) { callback(); }
      else { requestAnimationFrame(check); }
    };
    requestAnimationFrame(check);
  }

  function setStageState(el, state) {
    if (!el) return;
    el.classList.remove('active', 'pending', 'completed');
    el.classList.add(state);
    
    const fill = el.querySelector('.progress-fill');
    const status = el.querySelector('.row-status');
    const time = el.querySelector('.row-time');

    if (state === 'completed') {
      gsap.to(fill, { width: '100%', duration: 0.5, ease: 'power2.out' });
      status.textContent = '✓';
      if (el.dataset.stage === 'SCAN') time.textContent = '4.2s';
      if (el.dataset.stage === 'STAGE') time.textContent = '2.1s';
      if (el.dataset.stage === 'DEPLOY') time.textContent = '0.8s';
    } else if (state === 'active') {
      gsap.to(fill, { width: '65%', duration: 3, ease: 'none' });
      status.textContent = '▶';
      time.innerHTML = 'RUNNING... <span class="counter">0.0</span>s';
    }
  }

  function resetDashboard(elements) {
    Object.values(elements).forEach(el => {
      el.classList.remove('active', 'completed');
      el.classList.add('pending');
      el.querySelector('.progress-fill').style.width = '0';
      el.querySelector('.row-status').textContent = '◌';
      el.querySelector('.row-time').textContent = 'QUEUED';
    });
    // Special case for SCAN which is active at start of cycle
    setStageState(elements.SCAN, 'active');
  }

  // Start the cycle — SCAN → STAGE → DEPLOY
  cycleStages();
}

function initTerminalOutput() {
  const terminalOutput = document.getElementById('terminal-output');
  if (!terminalOutput) return;

  const logs = [
    "[OK] nexus@edge :: pipeline-daemon :: initiate --deployment-sequence prod-alpha-01",
    "[OK] nexus@edge :: pipeline-daemon :: Loading manifests... SUCCESS",
    "[OK] nexus@edge :: pipeline-daemon :: Provisioning K8s cluster... ACTIVE",
    "[OK] nexus@edge :: pipeline-daemon :: Terraform apply... DONE",
    "[OK] nexus@edge :: pipeline-daemon :: ANALYZING BINARIES...",
    "[OK] nexus@edge :: pipeline-daemon :: VULNERABILITY SCAN: 0 CRITICAL FOUND",
    "[OK] nexus@edge :: pipeline-daemon :: UPLOADING ARTIFACTS TO REGISTRY...",
    "[OK] nexus@edge :: pipeline-daemon :: CLUSTER HEALTH: 100%",
    "[OK] nexus@edge :: pipeline-daemon :: SYNCING SECRETS VIA VAULT..."
  ];

  let logIndex = 0;
  let charIndex = 0;
  let currentLine = "";
  const maxLines = 8;

  const typeNextChar = () => {
    if (!doIsActive()) { requestAnimationFrame(() => setTimeout(typeNextChar, 50)); return; }
    if (logIndex >= logs.length) {
      setTimeout(() => {
        terminalOutput.innerHTML = '';
        logIndex = 0;
        charIndex = 0;
        currentLine = "";
        setTimeout(typeNextChar, 18);
      }, 3000);
      return;
    }

    const targetLine = logs[logIndex];

    if (charIndex === 0) {
      const lineEl = document.createElement('div');
      lineEl.className = 'log-line';
      lineEl.style.color = 'var(--t3)';
      terminalOutput.appendChild(lineEl);

      // Auto-scroll
      if (terminalOutput.children.length > maxLines) {
        terminalOutput.removeChild(terminalOutput.firstChild);
      }
    }

    terminalOutput.lastChild.textContent += targetLine[charIndex];
    charIndex++;

    if (charIndex < targetLine.length) {
      setTimeout(typeNextChar, 18);
    } else {
      logIndex++;
      charIndex = 0;
      setTimeout(typeNextChar, 500);
    }
  };

  typeNextChar();
}
