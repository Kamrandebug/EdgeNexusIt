// js/sections/cta.js
// CTA terminal form (shared between all pages — uniform deploy sequence)
let csrfToken = '';

// Derive API base URL relative to this module's location so it works in both
// local XAMPP subfolder (http://localhost/EdgeNexusIt/...) and live root domain.
const API_BASE = new URL('../../api/contact.php', import.meta.url).href;

export function initCTA() {
  // Support all CTAs — main site + service pages
  const cta = document.getElementById('cta') || document.getElementById('cta-devops') || document.getElementById('cta-msp') || document.getElementById('cta-webdev') || document.getElementById('cta-cybersec') || document.getElementById('staffaug-contact') || document.getElementById('cta-itsupport');
  if (!cta) return;

  const isServicePage = !!document.getElementById('cta-devops') || !!document.getElementById('cta-msp') || !!document.getElementById('cta-webdev') || !!document.getElementById('cta-cybersec') || !!document.getElementById('cta-itsupport');

  // Fetch CSRF token once on page load
  fetch(API_BASE + '?action=token')
    .then(r => r.json())
    .then(data => { if (data.token) csrfToken = data.token; })
    .catch(() => {});

  const dots = spawnAmbientDots(cta);
  const terminal = cta.querySelector('.terminal');
  const form = cta.querySelector('form') || cta.querySelector('.term-body');

  // Support both standard and page-suffixed input IDs (e.g. -itsupport)
  const inputEmail = document.getElementById('inp-email') || document.getElementById('inp-email-itsupport');
  const inputName = document.getElementById('inp-name') || document.getElementById('inp-name-itsupport');
  const inputIssue = document.getElementById('inp-issue') || document.getElementById('inp-issue-itsupport');
  const submitBtn = cta.querySelector('.term-submit');

  // ── Focus convergence (ambient dots react to focus — all pages) ──
  let focusDebounce;
  const handleFocus = () => {
    clearTimeout(focusDebounce);
    const rect = terminal.getBoundingClientRect();
    const ctaRect = cta.getBoundingClientRect();
    const centerX = rect.left - ctaRect.left + rect.width / 2;
    const centerY = rect.top - ctaRect.top + rect.height / 2;

    dots.forEach(dotObj => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      const tx = centerX + Math.cos(angle) * dist;
      const ty = centerY + Math.sin(angle) * dist;

      gsap.to(dotObj.el, {
        x: tx, y: ty, left: 0, top: 0,
        opacity: Math.min(dotObj.originalOpacity * 1.5, 0.7),
        duration: 1.2, ease: 'power2.inOut', overwrite: true,
      });
    });
  };

  const handleBlur = () => {
    focusDebounce = setTimeout(() => {
      dots.forEach(dotObj => {
        gsap.to(dotObj.el, {
          x: 0, y: 0, left: `${dotObj.x}%`, top: `${dotObj.y}%`,
          opacity: dotObj.originalOpacity,
          duration: 2, ease: 'power1.inOut', overwrite: true,
        });
      });
    }, 200);
  };

  [inputEmail, inputName, inputIssue].forEach(input => {
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }
  });

  // ── Uniform deploy-sequence submit on all pages ──
  if (submitBtn) {
    setupDeploySubmit(cta, submitBtn, inputName, inputEmail, inputIssue, dots);
  }
}

function setupDeploySubmit(cta, submitBtn, inputName, inputEmail, inputIssue, dots) {
  const termBody = cta.querySelector('.term-body');

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Remove existing error messages
    termBody.querySelectorAll('.field-error').forEach(el => el.remove());
    [inputName, inputEmail, inputIssue].forEach(inp => inp && inp.classList.remove('input-error'));

    // Basic validation — all fields required
    let hasError = false;
    if (!inputName.value.trim()) {
      showFieldError(inputName, 'Name is required');
      hasError = true;
    }
    if (!inputEmail.value.trim()) {
      showFieldError(inputEmail, 'Email is required');
      hasError = true;
    }
    if (!inputIssue || !inputIssue.value.trim()) {
      showFieldError(inputIssue, 'Message is required');
      hasError = true;
    }
    if (hasError) {
      submitBtn.classList.add('btn--shake');
      setTimeout(() => submitBtn.classList.remove('btn--shake'), 400);
      return;
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail.value.trim())) {
      showFieldError(inputEmail, 'Enter a valid email address (e.g. name@domain.com)');
      submitBtn.classList.add('btn--shake');
      setTimeout(() => submitBtn.classList.remove('btn--shake'), 400);
      return;
    }

    // Disable form
    submitBtn.disabled = true;
    const inputs = cta.querySelectorAll('.term-input');
    inputs.forEach(inp => inp.disabled = true);

    // Animate ambient dots converging
    if (dots && dots.length) {
      const rect = termBody.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const centerX = rect.left - ctaRect.left + rect.width / 2;
      const centerY = rect.top - ctaRect.top + rect.height / 2;

      const tl = gsap.timeline();
      tl.to(dots.map(d => d.el), {
        x: centerX, y: centerY, left: 0, top: 0,
        backgroundColor: 'var(--accent)', opacity: 1,
        duration: 0.4, ease: 'power3.in',
      })
      .to(dots.map(d => d.el), {
        x: (i) => (Math.random() - 0.5) * window.innerWidth * 2,
        y: (i) => (Math.random() - 0.5) * window.innerHeight * 2,
        opacity: 0, duration: 0.6, ease: 'power2.out',
        onComplete: () => {
          dots.forEach(dotObj => {
            dotObj.x = Math.random() * 100;
            dotObj.y = Math.random() * 100;
            gsap.set(dotObj.el, {
              x: 0, y: 0, left: `${dotObj.x}%`, top: `${dotObj.y}%`,
              backgroundColor: 'white', opacity: dotObj.originalOpacity,
            });
          });
        },
      });
    }

    // Replace button with terminal deployment sequence
    submitBtn.style.display = 'none';

    const outputDiv = document.createElement('div');
    outputDiv.className = 'deploy-output';
    Object.assign(outputDiv.style, {
      fontFamily: 'var(--fm)',
      fontSize: '11px',
      color: 'var(--t2)',
      lineHeight: '1.8',
      padding: '0 0 8px',
    });
    termBody.appendChild(outputDiv);

    const isCyberPage = !!document.getElementById('cta-cybersec');

    const lines = isCyberPage ? [
      { text: '[00:00] Initializing asset discovery...',                  color: 'var(--t3)' },
      { text: '[00:01] Mapping network perimeter...',                     color: 'var(--t3)' },
      { text: '[00:02] Cross-referencing CVE database...',                color: 'var(--t3)' },
      { text: '[00:03] Compiling findings...',                            color: 'var(--t3)' },
      { text: '[00:04] ✓ AUDIT_QUEUED :: report ETA 24h :: ref 0x8f3a',  color: 'var(--accent)' },
    ] : [
      { text: '[00:00] Connecting to NEXUS intake server...',       color: 'var(--t3)' },
      { text: '[00:01] Authenticating request... OK',               color: 'var(--t3)' },
      { text: '[00:02] Routing to team... ASSIGNED',                color: 'var(--t3)' },
      { text: '[00:03] SLA timer started: response within 4h',      color: 'var(--t3)' },
      { text: '[00:04] ✓ MESSAGE DEPLOYED. We\'ll be in touch.',   color: 'var(--accent)' },
    ];

    let lineIdx = 0;
    let charIdx = 0;
    let currentLineEl = null;

    function typeNextChar() {
      if (lineIdx >= lines.length) {
        // Sequence complete — fire real submission
        setTimeout(async () => {
          const payload = {
            name: inputName.value.trim(),
            email: inputEmail.value.trim(),
            message: inputIssue ? inputIssue.value.trim() : '',
            page: submitBtn.dataset.page || 'index',
            _token: csrfToken,
            _honey: document.getElementById('_honey')?.value || '',
          };

          try {
            await fetch(API_BASE, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
              },
              body: JSON.stringify(payload),
            }).then(response => {
              console.log('Server Response Status:', response.status);
              return response.json();
            }).then(data => {
              console.log('Server Response Data:', data);
            });
          } catch (err) {
            // Network error — show error shake
            submitBtn.classList.add('btn--shake');
            setTimeout(() => submitBtn.classList.remove('btn--shake'), 400);
          }

          // Re-enable after delay for UX
          setTimeout(() => {
            submitBtn.style.display = '';
            submitBtn.querySelector('span').textContent = isCyberPage ? 'REQUEST AUDIT' : 'SEND MESSAGE';
            submitBtn.disabled = false;
            inputs.forEach(inp => { inp.disabled = false; inp.value = ''; });
            outputDiv.remove();
          }, 3000);
        }, 500);
        return;
      }

      const line = lines[lineIdx];
      if (charIdx === 0) {
        currentLineEl = document.createElement('div');
        currentLineEl.textContent = '';
        currentLineEl.style.color = line.color;
        outputDiv.appendChild(currentLineEl);
      }

      currentLineEl.textContent += line.text[charIdx];
      charIdx++;

      if (charIdx < line.text.length) {
        setTimeout(typeNextChar, 20);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(typeNextChar, 400);
      }
    }

    typeNextChar();
  });
}

function showFieldError(input, msg) {
  if (!input) return;
  input.classList.add('input-error');
  const err = document.createElement('div');
  err.className = 'field-error';
  err.textContent = '✗ ' + msg;
  err.style.cssText = 'font-family:var(--fm);font-size:10px;color:#ff4d4d;margin-top:2px;padding-left:4px;letter-spacing:0.02em;';
  input.parentNode.appendChild(err);
}

function spawnAmbientDots(section) {
  const wrap = section.querySelector('.ambient-dots');
  if (!wrap) return [];

  const dots = [];
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    const size = Math.random() < 0.2 ? 2 : 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const opacity = Math.random() * 0.5 + 0.1;

    dot.className = 'ambient-dot';
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    dot.style.opacity = opacity;
    dot.style.filter = `blur(${Math.random() * 1}px)`;

    wrap.appendChild(dot);

    const dotObj = { el: dot, x, y, originalOpacity: opacity };
    dots.push(dotObj);

    gsap.to(dot, {
      x: `+=${(Math.random() - 0.5) * 10}`,
      y: `+=${(Math.random() - 0.5) * 10}`,
      duration: 4 + Math.random() * 4,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 2,
    });
  }
  return dots;
}
