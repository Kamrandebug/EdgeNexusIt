// Shared layout — injects navbar + footer into any page
export function injectLayout() {
  const isSubpage = window.location.pathname.includes('/services/');
  const ROOT = isSubpage ? '..' : '.';
  const ABOUT_PATH = isSubpage ? 'about.html' : 'services/about.html';

  // ── Navbar HTML ──────────────────────────────────────────────────
  const navHTML = `
<header class="nav" role="banner">
  <div class="nav-inner">

    <!-- Brand -->
    <a href="${ROOT}/index.html" class="nav-brand" aria-label="EdgeNexus IT — Home">
      <span class="nav-logo-wrap">
        <img
          class="nav-logo-img"
          src="${ROOT}/assets/icons/brand-icon@2x.png"
          alt="EdgeNexus IT logo"
          width="32"
          height="32"
        />
      </span>
      <span class="nav-wordmark">
        <span class="nav-wordmark-edge">EDGE</span><span class="nav-wordmark-nexus">NEXUS IT</span>
      </span>
    </a>

    <!-- Primary links -->
    <nav class="nav-links" role="navigation" aria-label="Main navigation">
      <ul class="nav-list" role="list">

        <li class="nav-item">
          <a href="${ROOT}/index.html" class="nav-link" data-navlink="home">HOME</a>
        </li>

        <li class="nav-item nav-item--dropdown">
          <button class="nav-link nav-dropdown-trigger" aria-haspopup="true" aria-expanded="false" data-navlink="services">
            SERVICES <span class="nav-chevron" aria-hidden="true">&#9662;</span>
          </button>
          <ul class="nav-dropdown" role="list" aria-label="Services submenu">
            <li><a href="${ROOT}/services/msp.html"                class="nav-dropdown-link" data-service="msp">MSP</a></li>
            <li><a href="${ROOT}/services/devops.html"             class="nav-dropdown-link" data-service="devops">DEVOPS &amp; CLOUD</a></li>
            <li><a href="${ROOT}/services/cyber-security.html"     class="nav-dropdown-link" data-service="cyber">CYBER SECURITY</a></li>
            <li><a href="${ROOT}/services/it-support.html"         class="nav-dropdown-link" data-service="itsupport">IT SUPPORT</a></li>
            <li><a href="${ROOT}/services/staff-augmentation.html" class="nav-dropdown-link" data-service="staffaug">STAFF AUGMENTATION</a></li>
            <li><a href="${ROOT}/services/ai-automation.html"        class="nav-dropdown-link" data-service="ai">AI AUTOMATION</a></li>
          </ul>
        </li>

        <li class="nav-item">
          <a href="${ABOUT_PATH}" class="nav-link" data-navlink="about">ABOUT</a>
        </li>

      </ul>
    </nav>

    <!-- Right side: clock + CTA -->
    <div class="nav-right">
      <span class="nav-clock" id="nav-clock" aria-live="polite" aria-label="System time">SYS 00:00:00</span>
      <a href="#cta" class="btn btn-ghost nav-cta" data-navlink="contact">CONTACT</a>
    </div>

    <!-- Mobile hamburger -->
    <button class="nav-hamburger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="nav-mobile-panel">
      <span></span><span></span><span></span>
    </button>

  </div>
</header>

<!-- Mobile panel -->
<div class="nav-mobile-panel" id="nav-mobile-panel" aria-hidden="true">
  <ul class="nav-mobile-list" role="list">
    <li><a href="${ROOT}/index.html"                        class="nav-mobile-link">HOME</a></li>
    <li class="nav-mobile-item--section">SERVICES</li>
    <li><a href="${ROOT}/services/msp.html"                 class="nav-mobile-link nav-mobile-link--sub">MSP</a></li>
    <li><a href="${ROOT}/services/devops.html"              class="nav-mobile-link nav-mobile-link--sub">DEVOPS &amp; CLOUD</a></li>
    <li><a href="${ROOT}/services/cyber-security.html"      class="nav-mobile-link nav-mobile-link--sub">CYBER SECURITY</a></li>
    <li><a href="${ROOT}/services/it-support.html"          class="nav-mobile-link nav-mobile-link--sub">IT SUPPORT</a></li>
    <li><a href="${ROOT}/services/staff-augmentation.html"  class="nav-mobile-link nav-mobile-link--sub">STAFF AUGMENTATION</a></li>
    <li><a href="${ROOT}/services/ai-automation.html"        class="nav-mobile-link nav-mobile-link--sub">AI AUTOMATION</a></li>
    <li><a href="${ABOUT_PATH}"                        class="nav-mobile-link">ABOUT</a></li>
    <li><a href="#cta"                                      class="nav-mobile-link nav-mobile-link--cta">CONTACT</a></li>
  </ul>
</div>`;

  // ── Footer HTML ──────────────────────────────────────────────────
  const footerHTML = `
<footer id="footer" role="contentinfo">
  <div class="footer-grid container">

    <div class="footer-brand">
      <div class="footer-logo">
        <img src="${ROOT}/assets/icons/brand-icon@2x.png" alt="EdgeNexus mark" width="30" height="30" class="footer-logo-icon">
        <span class="edge">EDGE</span><span class="nexus">NEXUS IT</span>
      </div>
      <p class="text-body" style="margin-top:16px">
        Precision IT Architecture.<br>
        Zero tolerance for downtime.
      </p>
      <div style="font-family:var(--fd); font-weight:900; font-size:14px; letter-spacing:-0.01em; color:var(--accent); margin-top:24px; margin-bottom:6px">SOCIAL LINKS</div>
      <div style="font-family:var(--fd); font-size:14px; font-weight:600; color:var(--t1); letter-spacing:0.02em; margin-bottom:14px">Email : sales@edgenexusit.com</div>
      <div class="footer-socials">
        <a href="https://www.linkedin.com/in/edge-nexus-it-8bba64413?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="footer-social-link">
          <i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>
        </a>
        <a href="https://www.instagram.com/edgenexesit?utm_source=qr&igsh=MWg5amIwMnZqcjF1MA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="footer-social-link">
          <i class="fa-brands fa-instagram" aria-hidden="true"></i>
        </a>
        <a href="https://www.facebook.com/share/1F1pFuigjv/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="footer-social-link">
          <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
        </a>
      </div>
    </div>

    <div class="footer-links">
      <div class="text-eyebrow" style="margin-bottom:20px">NAVIGATION</div>
      <nav aria-label="Footer navigation">
        <ul role="list" style="list-style:none; display:flex; flex-direction:column; gap:12px">
          <li><a href="${ROOT}/index.html" class="text-mono footer-link">HOME</a></li>
          <li><a href="${ROOT}/index.html#services" class="text-mono footer-link">SERVICES</a></li>
          <li><a href="${ABOUT_PATH}" class="text-mono footer-link">ABOUT</a></li>
          <li><a href="#cta" class="text-mono footer-link">CONTACT</a></li>
        </ul>
      </nav>
    </div>

    <div class="footer-noc">
      <div class="text-eyebrow" style="margin-bottom:20px">NOC STATUS</div>
      <canvas id="footer-sparkline" width="200" height="40" aria-hidden="true"
        aria-label="System performance sparkline"></canvas>
      <div id="noc-status" class="text-label" style="margin-top:16px; color:var(--accent)" aria-live="polite">
        ALL SYSTEMS NOMINAL
      </div>
    </div>

  </div>

  <div class="noc-strip" role="status" aria-label="System status">
    <span class="text-label" style="color:var(--accent)">&#9679; LIVE</span>
    <span class="text-label">EDGE NODE PKT-9: ONLINE</span>
    <span class="text-label">|</span>
    <span class="text-label">CDN: 99.2% HIT RATE</span>
    <span class="text-label">|</span>
    <span class="text-label">THREAT SCAN: CLEAN</span>
    <span class="text-label" style="margin-left:auto">
      &copy; 2026 EDGENEXUS IT. ALL RIGHTS RESERVED.
    </span>
  </div>
</footer>`;

  // Inject
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}
