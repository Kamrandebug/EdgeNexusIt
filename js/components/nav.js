// Navigation — active detection, dropdown, mobile toggle, scroll behaviour
export function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // ── 2a. Active link detection ──────────────────────────────────
  const path = window.location.pathname;

  document.querySelectorAll('[data-navlink]').forEach(el => {
    const key = el.dataset.navlink;
    const isActive =
      (key === 'home'     && (path.endsWith('index.html') || path.endsWith('/'))) ||
      (key === 'services' && path.includes('/services/') && !path.endsWith('about.html')) ||
      (key === 'about'    && (path.endsWith('about.html') || path.endsWith('/about/')));
    if (isActive) el.classList.add('active');
  });

  // Mark the specific active service in dropdown
  document.querySelectorAll('[data-service]').forEach(el => {
    const href = el.getAttribute('href');
    if (href && path.includes(href.split('/').pop())) {
      el.classList.add('active');
    }
  });

  // ── 2b. Contact CTA → smooth scroll to #cta ────────────────────
  document.querySelectorAll('[data-navlink="contact"], .nav-mobile-link--cta').forEach(link => {
    link.addEventListener('click', (e) => {
      // Find any CTA section on the current page
      const ctaSelectors = ['#cta', '#cta-devops', '#cta-msp', '#cta-cybersec', '#cta-itsupport', '#staffaug-contact'];
      let ctaSection = null;
      for (const sel of ctaSelectors) {
        ctaSection = document.querySelector(sel);
        if (ctaSection) break;
      }
      if (ctaSection) {
        e.preventDefault();
        if (window.gsap) {
          gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: ctaSection, offsetY: 56 },
            ease: 'expo.inOut'
          });
        } else {
          ctaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        closeMobilePanel();
      }
      // If no CTA section on page, let href fallback naturally
    });
  });

  // ── 2c. Services dropdown ──────────────────────────────────────
  const dropdownTrigger = document.querySelector('.nav-dropdown-trigger');
  const dropdown = document.querySelector('.nav-dropdown');

  if (dropdownTrigger && dropdown) {
    const container = dropdownTrigger.parentElement;
    let closeTimer = null;

    function cancelClose() { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } }

    container.addEventListener('mouseenter', () => { cancelClose(); openDropdown(); });
    container.addEventListener('mouseleave', () => {
      closeTimer = setTimeout(() => { closeDropdown(); }, 200);
    });

    dropdown.addEventListener('mouseenter', () => { cancelClose(); openDropdown(); });
    dropdown.addEventListener('mouseleave', () => {
      closeTimer = setTimeout(() => { closeDropdown(); }, 200);
    });

    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      cancelClose();
      const isOpen = dropdownTrigger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeDropdown() : openDropdown();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) closeDropdown();
    });
  }

  function openDropdown() {
    if (!dropdownTrigger || !dropdown) return;
    dropdownTrigger.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('open');
  }
  function closeDropdown() {
    if (!dropdownTrigger || !dropdown) return;
    dropdownTrigger.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('open');
  }

  // ── 2d. Mobile hamburger toggle ────────────────────────────────
  const hamburger = document.querySelector('.nav-hamburger');
  const mobilePanel = document.querySelector('.nav-mobile-panel');

  function closeMobilePanel() {
    if (!hamburger || !mobilePanel) return;
    hamburger.setAttribute('aria-expanded', 'false');
    mobilePanel.setAttribute('aria-hidden', 'true');
    mobilePanel.classList.remove('open');
    hamburger.classList.remove('active');
  }

  if (hamburger && mobilePanel) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobilePanel();
      } else {
        hamburger.setAttribute('aria-expanded', 'true');
        mobilePanel.setAttribute('aria-hidden', 'false');
        mobilePanel.classList.add('open');
        hamburger.classList.add('active');
      }
    });

    mobilePanel.querySelectorAll('.nav-mobile-link').forEach(link => {
      link.addEventListener('click', () => closeMobilePanel());
    });

    // Close mobile panel on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobilePanel.classList.contains('open')) {
        closeMobilePanel();
      }
    });
  }

  // ── 2e. Scroll-based glass intensity ───────────────────────────
  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}
