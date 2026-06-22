# EdgeNexus IT — Complete System Architecture & UI Report

> **Generated:** 2026-06-13
> **Last Updated:** 2026-06-20 (batch 16 — Form validation & favicon fixes)
> **Purpose:** A complete reference so any LLM or developer can understand the full project — structure, animations, UI flow, design system, and backend.
>
> **⚠️ CORRECTED:** DevOps page sections (3.4, 4.12, 11, Appendix A) now document the **actual implementation** from files on disk, NOT the earlier prompt.md specification. Several previously-listed bugs were already fixed in code (boot event, scanline, Three.js, pipeline node count, preloader import). The report now reflects what is actually built.

---

## Change Log

| Date | Change |
|------|--------|
| 2026-06-17 | **Nav Brand Redesign** — Removed `EDGE[NEXUS IT]` bracket format. New structure: `.nav-logo-wrap` (40px circle) containing `.nav-logo-img` (32px brand-icon.png) + `.nav-wordmark` with `.nav-wordmark-edge` (#00aaff blue, 700 weight) and `.nav-wordmark-nexus` (white). Applied via `shared-layout.js` HTML update + `nav.css` brand rules. Fix applies to all 7 pages via shared layout injection. **Later fixed to match footer:** logo now uses `brand-icon@2x.png`, `object-fit: cover`, no accent border/glow — wordmark uses `--brand-blue` (#00B0E0), `font-weight: 900`, `letter-spacing: -0.01em`. |
| 2026-06-17 | **Cyber Security Hero Canvas Fix** — Fixed Attack Surface Map canvas disappearing on mobile (iOS/Android) and intermittently on desktop. Root causes: canvas sized while GSAP had set panel opacity:0 → offsetWidth:0; IntersectionObserver firing before first draw; missing DPR scaling. Fixes: (1) sizeCanvas() runs before GSAP timeline with getBoundingClientRect fallback, (2) RAF starts immediately with hasDrawnOnce guard delaying IntersectionObserver, (3) DPR scaling capped at 2×, (4) debounced resize handler for orientation changes, (5) removed CSS `!important` rule that broke GSAP panel fade-in. |
| 2026-06-17 | **Shared Layout System** — Created `js/components/shared-layout.js` that injects nav + footer into ALL pages via JS. Removed static nav/footer HTML from `index.html` and all 5 service pages (`msp.html`, `devops.html`, `cyber-security.html`, `it-support.html`, `staff-augmentation.html`). All now use `<!-- nav/footer injected by shared-layout.js -->` placeholder comments. |
| 2026-06-17 | **Nav Complete Rewrite** — `js/components/nav.js` rewritten: new class-based selectors (`.nav` instead of `#navbar`), `data-navlink` active link detection, `data-service` active service highlighting, mobile hamburger menu with `nav-hamburger` + `nav-mobile-panel`. `styles/components/nav.css` rewritten (~428→330 lines): `.nav-inner` CSS grid layout (1fr auto 1fr), `.nav-brand` with `EDGE[NEXUS IT]` text, `.nav-dropdown`, `.nav-right` (clock + CTA), `.nav-hamburger`, `.nav-mobile-panel`. Responsive at 1024/768/480px. Added About page link in nav. |
| 2026-06-17 | **About Page Built** — New `about.html` with full cinematic treatment: hero with particle canvas connecting-lines animation + GSAP entry timeline (eyebrow → headline → stat stagger), scroll-triggered stat counters (847 days uptime, 12k nodes, 99.97% SLA), mission section with 4 metric cards, values grid (4 principles: Observability First, Defense in Depth, Automate Everything, No Ego), approach timeline (4 cards: Detect, Triage, Resolve, Optimize), cinema auto-scroll divider strip, shared CTA and footer. `js/pages/about.js` (157 lines) + `styles/pages/about.css` (352 lines). Uses same `shared-layout.js` injection. No preloader. Boots on window load. |
| 2026-06-17 | **Terminal CSS Unification** — Added `.term-field`, `.term-label`, `.term-arrow`, `.term-input`, `.term-textarea` class aliases in `terminal.css` alongside legacy `.terminal-*` selectors. Shared compatibility between old and new form markup. Font size bumped from 13px→14px. |
| 2026-06-17 | **Hero Padding Fixes** — Added `padding-top: var(--nh)` to cyber-security, devops, and staff-augmentation hero sections to prevent navbar overlap (missing from initial builds). |
| 2026-06-17 | **About Page Moved to services/ + Hire Our Experts Section Added** — `about.html` moved from root to `services/about.html`. All asset paths updated to `../` prefix, CDN and JS module paths fixed. Nav links dynamically resolve via `ABOUT_PATH` variable (`services/about.html` from root, `about.html` from subpages). Active link detection in `nav.js` updated to exclude about page from services dropdown. New **"Hire Our Experts"** section (6 expert cards: Network Engineer, DevOps Architect, SOC Analyst, Cloud Engineer, IT Support Spec., Security Engineer) with filter tabs (All Roles, Cybersecurity, Cloud, Network, DevOps, Support), GSAP scroll reveal, filter animations, "Hire Now" smooth-scroll to CTA. Empty avatars show CSS monogram fallback. Busy card shows orange "Busy" badge + "View Profile" CTA. Mobile: horizontal scroll with snap. Responsive 3-col → 2-col → 1-col/h-scroll. ~300 lines CSS, ~90 lines JS. |
| 2026-06-17 | **Nav Logo & Font Matches Footer** — Updated navbar brand to use `brand-icon@2x.png` (same as footer). Removed accent border/glow from logo circle. Logo now uses `object-fit: cover + border-radius: 50% + opacity: 0.9`. Wordmark font-weight:900, letter-spacing: -0.01em, "EDGE" uses `--brand-blue` (#00B0E0), "NEXUS IT" uses `--t1` — 100% matching footer style. |
| 2026-06-17 | **Services Dropdown Hover Fix** — Added 200ms close delay + CSS invisible bridge (`::before`/`::after`) to prevent dropdown closing when moving mouse from button to menu. Direct `mouseenter`/`mouseleave` listeners added on dropdown. |
| 2026-06-17 | **About Page: Removed "03 / APPROACH" Section** — Full APPROACH section (4 cards: Detect, Triage, Resolve, Optimize + SVG path line) removed from HTML and unused CSS deleted. |
| 2026-06-17 | **About Page: Values → Horizontal Scroll Carousel** — Values section converted from 4-col grid to GSAP pinned horizontal scroll with depth states (active: glow+scale, adjacent: dimmed, far: dimmed+blur). Section glow background added. Mobile: CSS `scroll-snap-type` fallback with center-detection highlighting. |
| 2026-06-17 | **About Page: Section Numbering Removed** — All `01 /`, `02 /`, `03 /`, `04 /` prefixes removed from MISSION, PRINCIPLES, and CONTACT labels. |
| 2026-06-17 | **About Page: Full Responsive Pass** — All sections resized at 1024/900/768/640/480px with compact fonts, spacing, card sizes. Hero scroll hidden at 768px. Experts cards switch to horizontal scroll at 768px. |
| 2026-06-17 | **Navbar Brand Size Increased** — `clamp(16px, 1.8vw, 22px)` up from `clamp(14px, 1.4vw, 17px)`. |
| 2026-06-17 | **Services Mobile: Horizontal Scroll + Glow** — Services cards on index.html mobile replaced vertical column layout with horizontal scroll (`max-content` width, `scroll-snap-type: x mandatory`). Active card gets glow + `is-active` class, scale 1.05. Non-active dimmed to 0.45 opacity, 0.7 brightness. Same depth states as about values. |
| 2026-06-17 | **About Experts: All "Hire Now" Buttons** — Changed Cloud Engineer busy card from "View Profile" to "Hire Now". Removed busy-card ghost button CSS override. |
| 2026-06-19 | **Backend API Implemented** — Full PHP backend for contact form lead capture. `api/` directory with 5 PHP files (contact.php, config.php, validator.php, rate-limiter.php, mailer.php). PHPMailer v7.1 via Composer sending through Hostinger SMTP. Security: honeypot bot protection, CSRF token via session, IP-based rate limiting (3/15min), input sanitization, .htaccess deny-all-except-contact. Frontend: cta.js rewritten to POST real JSON to backend, CSRF token fetch on page load, PAGE_ID constants + honeypot fields added to all 7 pages. All existing animations preserved unchanged. `implementation.md` created as quick-reference. |
| 2026-06-20 | **Backend Finalization** — cta.js deploy-sequence refinements: `API_BASE` uses `import.meta.url` for dynamic path resolution (works in both local XAMPP and live root). Page-specific deploy output lines (cyber-security shows "AUDIT_QUEUED" sequence, all other pages show standard "MESSAGE DEPLOYED"). Uniform 5-line typewriter deploy sequence on all pages. `api/rate-limiter.php` enhanced with `HTTP_CF_CONNECTING_IP` (Cloudflare) proxy support. Deleted `backend-architecture.md`, `edgenexus-backend-prompt.md`, `implementation.md` doc files. `api/.htaccess` restrictions added. `.env.example` template created. Report updated to reflect current file structure and deleted files. |
| 2026-06-20 | **Form Validation & Favicon Fixes** — Added email format validation to all contact forms (cta.js): validates name, email, and message fields. Shows inline error messages below invalid fields with red border. Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. All 3 fields now required. Also created circular favicon with dark background (`favicon-32.png`, `favicon-48.png`) using brand-icon@2x.png source. Updated all 7 pages with proper multi-size favicon links. |
| 2026-06-16 | **Globe Fix** — `js/sections/hero.js` (39 lines changed), `styles/sections/hero.css` (47 lines changed). Report updated. |
| 2026-06-16 | **Cyber Security Page v2 Built** — Complete `services/cyber-security.html` with 8 signature animations: decrypt-in headline, 3D-tilt shield panel, depth-field particle canvas with threat deflection, cursor spotlight mask, SVG icon morph, intercept glitch sequence, depth-stack card reveal. Added shared `js/core/decrypt-text.js` primitive. All existing nav dropdowns updated to point to the new page. All effects use `--accent` blue (no red/orange). |
| 2026-06-16 (batch 5) | **Cyber Security v3 — "Live Defense Feed" Rewrite** — Replaced all 8 v2 "movie-hacker" animations with grounded SOC-telemetry visuals. Hero: redaction-lift headline, 16-node live network telemetry graph with detect→respond pulses, sensor-dust particles, ±3° tilt with moving specular band, variable-speed terminal with `[DETECT]` injection. Perimeter: radar scope with 6 defense-layer blips, sweep-pass triggers, hover connecting lines. Kill Chain: deterministic forensic waveform that flatlines at INTERCEPT via scroll-scrubbed clip-path. Incident Response: scrolling log feed, network disconnect diagram, checklist draw with counter. Removed shared `js/core/decrypt-text.js` (confirmed unused elsewhere). Removed all glitch/RGB-split/spotlight/orbit-ring code. Zero new CDN deps. |
| 2026-06-16 (batch 6) | **Cyber Security v4 Hero — "Attack Surface Map"** — Replaced v3 telemetry panel with Hex Map hero: canvas-drawn hexagonal attack surface grid with pulsing threat levels, attack vector counter (0→2,847 count-up + periodic increments), surface stat strip (4 metrics), severity legend. Added scanline sweep overlay, word-by-word headline stagger entry choreography. GSAP `fromTo()` entry timeline (scanline → eyebrow → headline words → stat → body → CTAs → panel). Hero pin exit scrub-driven via ScrollTrigger. |
| 2026-06-16 (batch 7) | **Cyber Security Full Responsive Pass** — Applied responsive CSS across all 4 sections at 1024/900/768/640/480/375px breakpoints. Mobile navbar hamburger menu, touch-friendly 44px buttons, CTA/footer mobile stacking. Hero hex canvas scales dynamically (65% at 375px). Radar canvas squares responsively (capped 480px, min 200px). Kill chain scroll scrub shortened on mobile (`+=150%`). IR depth-stack falls back to fade+slide at ≤900px. Global typography clamps lowered (`30px` floor on `.text-display`). Mobile overflow guard + safe-area-insets for notched phones. `isMobile` flag passed via context to all section inits. |
| 2026-06-16 (batch 8) | **Hero Alignment & Size Fixes** — Fixed 10 layout bugs: left padding (B1), eyebrow floating (B2), headline 200px (B3), counter rendered as circle (B4), stat misalignment (B5), content overflow (B6), panel alignment (B7), vertical centering (B8), max-width missing (B9), grid ratio (B10). Replaced full CSS with corrected version. Added Google Fonts preconnect/preload + `document.fonts.ready` guard. Switched entry timeline from `set()`+`to()` to `fromTo()` to prevent elements getting stuck hidden. |
| 2026-06-16 (batch 11) | **IT Support Page Built** — Final service page `services/it-support.html` created. 5 sections: Hero with split-flap character reveal headline + canvas noise flow field background + live ticket board panel; SLA Stats with rolling drum counters and live uptime tick; Response Tiers with CSS polygon morph hover + magnetic cursor field; Team Bench with 3D CSS perspective flip cards; Shared CTA with IT-support submit sequence. 4 new CSS files, 5 new JS files. Severity tokens added to tokens.css. All nav dropdowns updated across all 5 existing pages. `services.js` SERVICE_PAGES updated (IT Support card no longer shows "COMING SOON"). 6 service cards now all live. |
| 2026-06-16 (batch 9b) | **Staff-Augmentation & Cursor Fix** — Added missing `btn` base class, `<span>` wraps, and `btn-ghost` on staff-aug CTA buttons. Added `initCursor` import and call (cursor was never initialized on this page). |
| 2026-06-16 (batch 9a) | **Removed `//` Prefixes Sitewide** — All 16 instances of `// ` removed from visible headings/text across cyber-security.html, devops.html, msp.html, and staff-augmentation.html. |
| 2026-06-16 (batch 9) | **Hero Layout Tweaks** — Removed eyebrow label from HTML/CSS/JS. Reduced top padding from `nh+80px` to `nh+28px`. Removed attack vector counter block ("0 / Attack vectors / Eliminated this week") from HTML, CSS, and JS. |
| 2026-06-14 (batch 4) | **All Subpage Hero Headings Style Alignment** — Standardized all service subpages' hero headings typography (matching Outfit font, clamp size `clamp(36px, 5.5vw, 72px)`, line-height `1.05`, letter-spacing `-0.025em`, and white base color) and applied the glowing cyan accent text style (`text-shadow: 0 0 20px rgba(0, 170, 255, 0.3)...`) to match the homepage hero looks. Wrapped the final word "SLEEPS." in the MSP hero heading in `.headline-accent` to enable this style. |
| 2026-06-14 (batch 3) | **Cross-Page Links & Navigation Fixes** — Fixed navigation dropdown menus in `services/web-development.html` and `services/msp.html` to link directly to respective subpages (`msp.html`, `devops.html`) instead of `#services`. Updated `SERVICE_PAGES` mapping in `js/sections/services.js` to set Cyber Security and IT Support pages to `null`, correctly disabling nonexistent page navigation and marking their cards as "COMING SOON" without causing 404 errors on click. **Services Horizontal Scroll Snapping** — Rewrote Services horizontal layout to focus and center exactly one card at a time with GSAP snap, dimming/scaling down inactive adjacent cards to 0.45 opacity and highlighting the active card with scale 1.05, border-color, and box-shadow. **Continuous & Responsive 3D Globe** — Enabled Three.js 3D Globe on all devices (removed low memory, small mobile, and prefers-reduced-motion gates) and ensured it rotates continuously (never pauses on scroll/off-screen). Adjusted CSS and JS scaling/opacity dynamically for screens under 480px to make it perfectly centered and responsive without blocking text. **Functional Hero CTA Buttons** — Wired up all primary and ghost CTA buttons in all subpage and homepage hero sections with smooth-scroll handlers using GSAP ScrollToPlugin, targeting their respective contact, stack, services, and SLA sections. |
| 2026-06-14 (batch 2) | **Performance Tuning** — Hero globe rendering tier-gated (depth fade on high-tier only, node pulse skips on low, packets skip on mid/low). Mouse parallax throttled via RAF gating. SOC off-screen pause simplified (no busy-wait). GSAP lag smoothing disabled; low-memory devices capped at 30fps in main.js. Preloader duration reduced (2.6s → 1.4s). **CSS/JS Loading Overhaul** — Non-critical CSS deferred via `media="print" onload`. CDN scripts changed to `defer`. Google Fonts moved from `@import` to `<link>` with preconnect/preload. D3/TopoJSON moved from `<head>` to footer. Added `<noscript>` fallback. **Asset Reorganization** — Root images moved to `assets/icons/` and `assets/images/`; root originals deleted. All 4 HTML pages updated. **Services Nav Extended** — Cyber Security → `cyber-security.html`, IT Support → `it-support.html` (previously both `#services`). **Hero Headline Accent** — MSP headline "Total Business Continuity." wrapped in `.hero-headline-accent` with blue glow. **Font Loading** — `@import` removed from typography.css in favor of HTML `<link>`. |
| 2026-06-14 | **Design System Overhaul** — Darkened backgrounds, added accent-2 (#ff6b00) and accent-3 (#ff2d55), reduced spacing/typography scale. **Grid System Upgrade** — Added `#grid-pulse` canvas with diagonal breathing wave (10±2s interval) and scanline texture overlay (`body::before`). **Hero Metric Bar Removed** — Metric bar (latency, threats, uptime, nodes) removed from homepage hero HTML/CSS/JS. **Web Dev Metric Bar Removed** — Hero metric bar removed from web-development page. **Status Bar Component Added** — New fixed status bar (`js/components/status-bar.js`, `styles/components/status-bar.css`) with live clock, pulse dot, scroll-to-collapse. **CTA Refactored** — Now shared between index and devops pages with DevOps-specific deploy-sequence submit handler. **Footer/Nav/Buttons/Preloader Tightened** — Reduced padding, font sizes, and spacing across all shared components. **Clock Multipage Support** — Now selects all `[id*="clock"]` elements, supports multiple page instances. **Homepage Nav Updated** — MSP and DevOps nav links point directly to `services/msp.html` and `services/devops.html`. **Services Card Navigation Updated** — Card 0 → `msp.html`, card 1 → `devops.html` (previously undefined). **GSAP Learning** — 2 new taste preferences around `gsap.from()` vs `gsap.set()` pre-hiding and CSS reveal class conflicts. |
| 2026-06-13 | **Critical analysis performed.** Added DevOps page documentation. Identified 10+ architectural inconsistencies, bugs, and cross-page navigation gaps across all three service subpages. Updated file counts and structure listings. |
| 2026-06-13 | Redesigned MSP Coverage (asymmetric featured + 2x2 grid + bottom bar) and SLA Architecture (horizontal bar timeline with urgency-encoded widths, P1 ripple, scanline hover). Simplified MSP contact form labels to "Name" and "Email". |
| 2026-06-12 | Improved MSP page animations: entry choreography with word-by-word headline stagger, SVG topology node entry/continuous pulse/line breathing/parallax, coverage section bidirectional card reveals with hover icon glow and sibling dim, SLA timeline with P1 continuous ripple + 4-stage power-on node activation, coverage map with terminal typewriter and ping rings. Updated hero pin to 150vh with SVG drift. Added `coverage-map.js`. |

---

## 1. Project Identity

EdgeNexus IT is a **high-performance, cinematic corporate landing page** for an enterprise IT infrastructure provider, complete with dedicated service subpages (MSP, DevOps, Cyber Security, IT Support, Staff Augmentation) and a **PHP backend** for contact form lead capture via Hostinger SMTP.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend Core** | Vanilla JavaScript (ES Modules, type="module") |
| **Animation Engine** | GSAP 3.12.2 + ScrollTrigger + ScrollToPlugin |
| **3D** | Three.js r128 (WebGL, 3D wireframe globe with auto-rotation) |
| **Mapping** | D3.js 7.8.5 + TopoJSON 3.0.2 (world threat map) |
| **CSS** | CSS Custom Properties (Design Tokens), Flexbox, Grid |
| **Graphics** | HTML5 Canvas (noise, grid, pulse wave, dot grid, donut chart, sparkline, attack arcs, packet stream), SVG (preloader, pipeline, D3 world map, circuit trace, ZDT icons), CSS gradients |
| **Fonts** | Outfit (headings), DM Mono (data/terminal), Barlow Condensed (labels) |
| **CDNs** | three.min.js, d3.min.js, topojson.min.js, gsap.min.js + ScrollTrigger + ScrollToPlugin |
| **Backend Language** | PHP 8.1+ |
| **Mail Library** | PHPMailer 7.1.1 (via Composer) |
| **SMTP Provider** | Hostinger Email SMTP (included with hosting) |
| **Security** | Honeypot + CSRF Token (session) + IP Rate Limiting (3/15min) + Input Sanitization + CORS |

---

## 2. Complete File Structure

```
K:\EdgeNexusIt\
├── index.html                         ← Main landing page (6 sections + preloader + nav + footer)
├── report.md                          ← THIS FILE
│
├── assets/
│   ├── icons/
│   │   ├── brand-icon.png             ← Navbar brand icon (32×32)
│   │   ├── brand-icon@2x.png          ← Nav & Footer retina brand icon (40×40 displayed)
│   │   └── favicon-48.png             ← Browser tab icon (48×48)
│   └── images/
│       ├── apple-touch-icon.png       ← iOS home screen icon
│       ├── logo.png                   ← Full logo
│       └── logo-transparent.png       ← Transparent logo
│
├── services/
│   ├── about.html                      ← About page (cinematic hero, mission, values, experts, CTA)
│   ├── msp.html                        ← MSP subpage (5 sections) [TRACKED]
│   ├── devops.html                     ← DevOps & Cloud Automation subpage (5 sections) [TRACKED]
│   ├── cyber-security.html             ← Cyber Security subpage (5 sections)
│   ├── it-support.html                 ← IT Support subpage (5 sections)
│   └── staff-augmentation.html         ← Staff Augmentation subpage
│
├── api/                                ← Backend — contact form lead capture [NEW]
│   ├── contact.php                    ← Main endpoint (CORS, routing, orchestration)
│   ├── config.php                     ← SMTP credentials (GITIGNORED — placeholder)
│   ├── validator.php                  ← Input sanitization & field validation
│   ├── rate-limiter.php               ← IP-based rate limiting (3 req / 15 min)
│   ├── mailer.php                     ← PHPMailer SMTP send + email template
│   ├── .htaccess                      ← Deny all PHP except contact.php
│   └── storage/
│       ├── .htaccess                  ← Deny from all
│       ├── .gitkeep
│       └── rate-limits/               ← Created at runtime
│
├── vendor/                             ← PHPMailer installed via Composer [NEW]
│   └── phpmailer/phpmailer/src/
│       ├── PHPMailer.php
│       ├── SMTP.php
│       └── Exception.php
│
├── styles/
│   ├── tokens.css                     ← ALL design tokens (colors, fonts, spacing, motion)
│   ├── reset.css                      ← Minimal CSS reset + body base
│   ├── typography.css                 ← @font-face declarations + type utility classes
│   ├── utilities.css                  ← Shared helpers + #grid-pulse canvas + scanline body::before
│   ├── scrollbar.css                  ← Custom scrollbar + ::selection styles
│   │
│   ├── components/
│   │   ├── preloader.css              ← Preloader: progress bar, network SVG, implosion
│   │   ├── nav.css                    ← Navbar: glass effect, visibility, dropdown, mobile menu
│   │   ├── buttons.css                ← Button primitives + ghost SVG border-trace + error shake
│   │   ├── cards.css                  ← Generic card components (.service-card, .stat-item)
│   │   ├── cursor.css                 ← Custom cursor (dot + ring + hover/click states)
│   │   ├── terminal.css               ← CTA terminal box (form, header dots, glow)
│   │   └── status-bar.css             ← Status bar: fixed top bar, pulse dot, live clock, scroll collapse [NEW]
│   │
│   ├── sections/
│   │   ├── hero.css                   ← Hero: full-viewport, canvas behind, bracket corners, atmospheric glow
│   │   ├── services.css               ← Services: horizontal scroll cards + hover overlay + depth carousel
│   │   ├── process.css                ← Process: sticky pipeline, step cards, nodes, blueprint corners
│   │   ├── soc.css                    ← SOC: D3 world threat map, donut chart, vuln score, incidents
│   │   ├── cta.css                    ← CTA: terminal form, ambient dots, vignette
│   │   └── footer.css                 ← Footer: brand, links, sparkline, NOC strip
│   │
│   └── pages/
│       ├── msp/                       [TRACKED]
│       │   ├── hero-msp.css           ← MSP Hero: topology SVG, metric bar
│       │   ├── coverage.css           ← Coverage: 6-pillar grid, corner brackets
│       │   ├── sla.css                ← SLA: 4-tier timeline
│       │   └── coverage-map.css       ← Coverage Map: global node reach
│       ├── devops/                    [TRACKED]
│       │   ├── hero-devops.css        ← DevOps Hero: left/right grid, pipeline canvas terminal, metric bar
│       │   ├── pipeline.css           ← Pipeline: 5-step cards, SVG path, terminal commands
│       │   ├── stack-interop.css      ← Stack: 6-platform grid tiles (AWS, GCP, Azure, K8s, TF, Ansible)
│       │   └── zero-downtime.css      ← ZDT: 3 protocol cards (Blue-Green, Canary, Rollback)
│       ├── cyber-security/
│       │   ├── hero-cybersec.css      ← Hero: redaction-lift bars, telemetry graph, sensor dust, specular band
│       │   ├── perimeter.css          ← Perimeter: radar scope, defense cards grid
│       │   ├── killchain.css           ← Kill Chain: waveform SVG, clamp brackets, flatline
│       │   └── incident-response.css  ← Incident Response: scrolling log, disconnect diagram, checklist
│       ├── it-support/
│       │   ├── hero-itsupport.css     ← Hero: split-flap chars, ticket board panel, flow field canvas
│       │   ├── sla-stats.css          ← SLA Stats: drum counters, stat cards grid
│       │   ├── response-tiers.css     ← Response Tiers: polygon morph, magnetic field cards
│       │   └── team-bench.css         ← Team Bench: 3D CSS perspective flip cards
│       ├── staff-augmentation/
│       │   ├── hero-staffaug.css      ← Staff Augmentation hero & talent section
│       │   └── page-transitions-staffaug.css
│       └── about.css                  ← About page cinematic styles [NEW]
├── js/
│   ├── main.js                        ← Main homepage entry point & orchestrator
│   │
│   ├── core/
│   │   ├── decrypt-text.js           ← Character-scramble reveal primitive [REMOVED in v3 — unused]
│   │   ├── noise.js                   ← Canvas-based grain texture overlay (fixed bg)
│   │   ├── grid.js                    ← Reactive 40px grid overlay (proximity pulse + section color shift + breathing wave)
│   │   ├── cursor.js                  ← Custom cursor (dot snaps, ring lerps, hover + click states)
│   │   ├── reveals.js                 ← Unified scroll-triggered reveal system (clip, fade, stagger, divider)
│   │   ├── transitions.js             ← Interstitial atmosphere zones between sections (4 transitions)
│   │   ├── scroll-indicator.js        ← Top-of-viewport scroll progress line (dashed, auto-hide)
│   │   └── performance.js             ← Reduced-motion, low-memory, mobile kill switches + FPS capping (30/40/60 per tier)
│   │
│   ├── components/
│   │   ├── preloader.js               ← SVG network assembly → progress bar → node pulse → implosion → flash
│   │   ├── nav.js                     ← Nav: active link, dropdown, mobile toggle/hamburger, smooth scroll [REWRITTEN]
│   │   ├── shared-layout.js           ← Injects navbar + footer HTML into any page [NEW]
│   │   ├── clock.js                   ← Live SYS clock (supports multiple pages, selects all [id*="clock"])
│   │   ├── status-bar.js              ← Status bar: live clock, entry slide-down, scroll collapse [NEW]
│   │   └── buttons.js                 ← Ghost button SVG border-trace perimeter injection
│   │
│   ├── sections/
│   │   ├── hero.js                    ← Cinematic V2 Globe: 3D wireframe, node halos, comet packets, z-depth fade, background particles + bridge transition (metric bar removed; tier-gated rendering added)
│   │   ├── services.js                ← Horizontal scroll pin + depth carousel + mouse glow + sibling reactions + card navigation to subpages (all 5 cards linked)
│   │   ├── process.js                 ← SVG pipeline draw (scrub) + ScrollTrigger node activation + ripple effects
│   │   ├── soc.js                     ← SOC dashboard: D3 world map, Canvas donut, sparkline, vuln counter, incidents (off-screen pause simplified, no busy-wait)
│   │   ├── cta.js                     ← Ambient dots (60 particles, drift, focus convergence, submit explode); shared with DevOps page
│   │   └── footer.js                  ← Enhances existing footer: sparkline SVG, uptime ticker, NOC message rotator
│   │
│   └── pages/
│       ├── msp/                       [TRACKED]
│       │   ├── page-main.js           ← MSP subpage entry point, scanline entry choreography, 150vh hero pin
│       │   ├── hero-msp.js            ← SVG topology: node entry slam, continuous pulse, line breathing, parallax, metric bar counters
│       │   ├── coverage.js            ← 6-pillar staggered reveal, hover icon glow, sibling dim (bidirectional)
│       │   ├── sla.js                 ← SLA timeline scrub, P1 continuous ripple, 4-stage power-on node activation (bidirectional)
│       │   └── coverage-map.js        ← Map scale entry, SVG arc draw, terminal typewriter, ping rings
│       ├── devops/                    [TRACKED]
│       │   ├── page-main.js           ← DevOps entry point (uses window load, no preloader)
│       │   ├── hero-devops.js         ← Pipeline dashboard panel + entry choreography + terminal typewriter
│       │   ├── pipeline.js            ← 5-node horizontal track + scroll-scrubbed detail panel swap + terminal typewriters
│       │   ├── stack-interop.js       ← Orbit canvas with rotating devicon SVGs + hover connection + tooltip
│       │   └── zero-downtime.js       ← 3-card animated SVG ZDT protocols + GSAP power-on sequences + hover
│       ├── cyber-security/
│       │   ├── page-main.js           ← Cyber Security entry point, passes tier/fineHover/reducedMotion to all sections
│       │   ├── hero-cybersec.js       ← Redaction-lift headline, 16-node telemetry graph, sensor dust, variable terminal
│       │   ├── perimeter.js           ← Radar scope canvas + sweep wedge + 6 defense blips + hover lines
│       │   ├── killchain.js            ← Master ScrollTrigger + forensic waveform + flatline overlay + clamp brackets
│       │   └── incident-response.js   ← Depth-stack card reveal + scrolling log + disconnect diagram + checklist draw
│       ├── it-support/
│       │   ├── page-main.js           ← IT Support entry point, boots identical to devops pattern
│       │   ├── hero-itsupport.js      ← Split-flap chars, noise flow field, blur-focus pull, ticket timers
│       │   ├── sla-stats.js           ← Rolling drum counters, live uptime tick
│       │   ├── response-tiers.js       ← CSS polygon morph, magnetic cursor field
│       │   └── team-bench.js           ← 3D perspective flip cards, keyboard accessibility
│       ├── staff-augmentation/
│       │   ├── page-main.js           ← Staff Augmentation entry point
│       │   └── hero-staffaug.js       ← Staff Augmentation hero animations
│
│   ├── about.js                       ← About page entry: particle canvas, stat counters, scroll reveals [NEW]
│
├── .claude/
│   └── settings.local.json            ← Permissions allowlist for Bash commands
│
├── .commandcode/
│   └── taste/taste.md                 ← 7 learned preferences for CommandCode
│
├── .env.example                       ← SMTP credential template [NEW]
├── .gitignore                         ← Updated: vendor/, config.php, .env, api/storage/* [NEW]
├── composer.json                      ← Requires phpmailer/phpmailer ^7.1 [NEW]
├── composer.lock                      ← Locked to v7.1.1 [NEW]
│
```

---

## 3. Page Structure & UI Flow

### 3.1 — Homepage / Main Landing Page (`index.html`)

The main page is a single-scroll vertical layout with **6 sections** + preloader + nav (injected via `shared-layout.js`) + status bar + footer:

```
┌──────────────────────────────────────────────────────────────────────┐
│                  STATUS BAR (fixed top, z-index: 2001)                │
│  ● SYSTEM ONLINE        SYSTEM: NOMINAL          SYS 14:23:41         │
│  (collapses to 0px height on scroll >200px)                           │
├──────────────────────────────────────────────────────────────────────┤
│                        NAVBAR (glass overlay)                        │
│  EDGE[NEXUS IT]   [HOME] [SERVICES ▾] [PROCESS] [SOC] [CONTACT]     │
│                                              SYS 14:23:41            │
├──────────────────────────────────────────────────────────────────────┤
│  1. HERO SECTION (full viewport, pinned 200vh)                       │
│     ┌──────────────────────────────────────────────────────────┐     │
│     │  Three.js Cinematic V2 Globe (right side)                 │     │
│     │  - 18 lat rings + 24 lon meridians (Z-depth faded)        │     │
│     │  - 55 Fibonacci surface nodes + neon halos                │     │
│     │  - 30 Comet Data Packets (Bezier arc trails)              │     │
│     │  - 80 Floating Background Data Particles                  │     │
│     │  - Surface node connection lines (nearby pairs)           │     │
│     │  - Inner glow sphere + point light                        │     │
│     │  - Dual-layer CSS radial atmospheric glow                 │     │
│     │  - Axial wobble animation                                 │     │
│     │                                                           │     │
│     │  EDGE INFRASTRUCTURE (eyebrow)                            │     │
│     │  ─────── (divider)                                        │     │
│     │  INFRASTRUCTURE THAT                                      │     │
│     │  NEVER FAILS. (headline, clip-path reveal)                │     │
│     │                                                           │     │
│     │  Enterprise-grade networks... (body text)                 │     │
│     │  [typewriter effect: "ping edgenexus.io..."]              │     │
│     │                                                           │     │
│     │  [DEPLOY NOW]  [VIEW INFRASTRUCTURE]                      │     │
│     │                                                           │     │
│     │  NOTE: Metric bar was REMOVED in 2026-06-14 update.       │     │
│     │  replaced by the new status bar component.                │     │
│     └──────────────────────────────────────────────────────────┘     │
├───── SCROLL → hairline rule sweeps viewport ─────────────────────────┤
│                                                                      │
│  2. SERVICES SECTION (horizontal scroll pin)                         │
│     OUR SERVICES (eyebrow)                                           │
│     ─────── (divider)                                                │
│     FIVE STREAMS. ONE NEXUS. (heading)                              │
│                                                                      │
│     ←─── 5 service cards in horizontal scroll (GSAP pin + x───→     │
│         translate, SCROLL VERTICALLY to move horizontally)           │
│                                                                      │
│     ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│     │MSP   │ │DEVOPS│ │CYBER │ │IT    │ │STAFF │                   │
│     │[icon]│ │[icon]│ │SEC.  │ │SUPP. │ │AUG.  │                   │
│     │01    │ │02    │ │[icon]│ │[icon]│ │[icon]│                   │
│     └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                   │
│                                                                      │
│     Card navigation to subpages:                                     │
│     - MSP (card 0)  → services/msp.html ← NOW LINKED                │
│     - DevOps (card 1) → services/devops.html ← NOW LINKED           │
│     - Cyber Security (card 2) → services/cyber-security.html ← NEW   │
│     - IT Support (card 3) → services/it-support.html                  │
│     - Staff Augmentation (card 4) → services/staff-augmentation.html  │
│                                                                      │
├───── SCROLL → electric blue scan line sweeps viewport ───────────────┤
│                                                                      │
│  3. PROCESS SECTION (sticky pipeline)                                │
│  4. SOC SECTION (Security Operations Center Dashboard)               │
│  5. CTA SECTION (terminal form, dark intimate)                       │
│  6. FOOTER                                                           │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 — Web Development Service Page [REMOVED]

The Web Development service page was removed from the project. The homepage now has **5 service cards** (MSP, DevOps, Cyber Security, IT Support, Staff Augmentation).

### 3.3 — Managed Service Provider Page (`services/msp.html`)

*(unchanged — see previous report version)*

### 3.4 — DevOps & Cloud Automation Page (`services/devops.html`)

The actual implementation differs substantially from the original prompt.md specification. The final design uses a **Pipeline Dashboard** hero panel, **5-node horizontal track** with swap-in detail panels, **Orbit Canvas** stack visualization with rotating devicon logos, **IaC with code/diff toggle** and sparkline metrics, and **animated SVG** ZDT protocol cards.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        NAVBAR (glass overlay)                        │
│  EDGE[NEXUS IT]   [HOME] [SERVICES ▾] [PIPELINE] [STACK] [CONTACT]  │
│     ┌─ Dropdown ──────────────────────────────┐                      │
│     │  MSP → msp.html                         │                      │
│     │  DEVOPS → #hero-devops (active)          │                      │
│     │  CYBER SECURITY → cyber-security.html │                      │
│     │  IT SUPPORT → it-support.html     │                      │
│     │  STAFF AUG. → staff-augmentation.html                          │
│     └─────────────────────────────────────────┘                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. HERO — "DEPLOY WITHOUT FEAR."                                    │
│     ┌─────────────────────────────────┐ ┌────────────────────────┐   │
│     │ LEFT: Copy column               │ │ RIGHT: Pipeline Panel  │   │
│     │ "EDGENEXUS :: DEVOPS-OPS //     │ │ ┌──────────────────┐   │   │
│     │  BUILD 4,847 :: ALL CLEAR"      │ │ │ ┌─ NEXUS_PIPELINE│   │   │
│     │                                 │ │ │   / BUILD #4847 ─┤   │   │
│     │ "DEPLOY   WITHOUT   FEAR."       │ │ │                   │   │   │
│     │ (accent underline on "FEAR.")   │ │ │ BUILD ■■■■■■■■ ✓ │   │   │
│     │                                 │ │ │ TEST  ■■■■■■■■ ✓ │   │   │
│     │ Zero-drama deployments...       │ │ │ SCAN  ■■■■■■■■ ▶ │   │   │
│     │                                 │ │ │ STAGE ■■■■■■■■ ◌ │   │   │
│     │ [INIT_DEPLOY ▶] [./view_stack]  │ │ │ DEPLOY ■■■■■■■■ ◌ │   │   │
│     │                                 │ │ │                   │   │   │
│     │                                 │ │ │ ● 3 NODES HEALTHY │   │   │
│     │                                 │ │ │ ◌ 0 ALERTS        │   │   │
│     │                                 │ │ │ ↑ 99.97% UPTIME   │   │   │
│     │                                 │ │ │                   │   │   │
│     │                                 │ │ │ [OK] nexus@edge  │   │   │
│     │                                 │ │ │ typewriter (8 ln) │   │   │
│     │                                 │ └──────────────────┘   │   │
│     │                                 │                        │   │
│     │                                 │ ■ SCAN stage auto-     │   │
│     │                                 │   cycles 0→65% (8s),   │   │
│     │                                 │   then STAGE→DEPLOY→   │   │
│     │                                 │   RESET every ~12s     │   │
│     └─────────────────────────────────┘ └────────────────────────┘   │
│                                                                      │
│     ★ Hero pin: 120% scrub-driven exit (inner fades out)            │
│     ★ Entry: scanline → eyebrow → headline word-stagger (0.08s)     │
│       → accent underline draw → body → CTA buttons                  │
│     ★ Scanline IS implemented (body::before via GSAP '--scanline-   │
│       opacity') — NOT missing                                       │
│     ★ Boot event: window.addEventListener('load', ...) — matches     │
│       MSP/WebDev pattern                                            │
│     ★ NO preloader, NO metric bar, NO Three.js loaded               │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  2. THE PIPELINE — "END-TO-END AUTOMATION FLOW"                      │
│                                                                      │
│     5-NODE HORIZONTAL TRACK (scroll-scrubbed stage progression)     │
│     ─────────────────────────────────────────────────────────────    │
│     (01) ── (02) ── (03) ── (04) ── (05)                            │
│     COMPILE  TEST    SCAN    STAGE   DEPLOY                          │
│                                                                      │
│     Detail panel below swaps per active stage (hidden attribute):    │
│                                                                      │
│     [COMPILE]     [TEST]        [SCAN]         [STAGE]      [DEPLOY]│
│     avg 1.8s      avg 12s       avg 6s         avg 45s      avg 0.8s│
│     4,200 runs/d  847 tests     0 CVE          canary 1%    840/d    │
│     ┌─terminal─┐  ┌─terminal─┐  ┌─terminal─┐  ┌─terminal─┐ ┌─term┐ │
│     │ typewrtr │  │ typewrtr │  │ typewrtr │  │ typewrtr │ │ typ │ │
│     └──────────┘  └──────────┘  └──────────┘  └──────────┘ └─────┘ │
│     Stat bars:    Stat bars:     Stat bars:    Stat bars:    Stat   │
│     cache 94%    pass 99%      vuln 0%       canary 1%    rep100% │
│     workers 80%  cover 87%     license 100%  err-budget98% roll100%│
│                                                                      │
│     ★ Master ScrollTrigger pin with scrub (0→4 stages)              │
│     ★ Background line + animated accent fill line (scaleX scrub)    │
│     ★ 12 connector dots (3 per segment) light progressively          │
│     ★ Active node: box-shadow ring pulse CSS keyframe               │
│     ★ Terminal typewriter fires per-panel on activation (20ms/char) │
│     ★ Stat bars animate via gsap.fromTo per-panel on activation     │
│     ★ Panel swap uses `hidden` attribute (no stacked DOM)           │
│     ★ Mobile (≤768px): track hidden, all panels stack vertically     │
│     ★ Reduced motion: triggers all panels on scroll enter (once)    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  3. STACK INTEROPERABILITY                                           │
│                                                                      │
│     INTEGRATED STACK — 13 TOOLS · 3 CLOUD PROVIDERS · 1 NEXUS      │
│                                                                      │
│     ┌──────────────────────────────────────────────────────┐        │
│     │              ORBIT CANVAS (Canvas 2D API)             │        │
│     │                                                      │        │
│     │        ╭── Ring 1 (r=96) ──╮                        │        │
│     │     DOCKER  KUBERNETES  TERRAFORM                    │        │
│     │                                                      │        │
│     │    ╭─── Ring 2 (r=168) ─────╮                       │        │
│     │  GITHUB ACTIONS  ARGOCD                              │        │
│     │  PROMETHEUS  GRAFANA                                 │        │
│     │                                                      │        │
│     │  ╭── Ring 3 (r=240) ───────────╮                    │        │
│     │  AWS  GCP  AZURE  ANSIBLE                           │        │
│     │  VAULT  NGINX                                        │        │
│     │                                                      │        │
│     │     ── NEXUS (center node) ──                       │        │
│     │                                                      │        │
│     │    [DOCKER // Container runtime · BUILD, DEPLOY]    │        │
│     │    ← hover tooltip at bottom center                  │        │
│     └──────────────────────────────────────────────────────┘        │
│                                                                      │
│     ★ Canvas renders 3 dashed orbit rings (4,6,6 dashes)            │
│     ★ 13 devicon SVGs preloaded from jsDelivr CDN, auto-rotate:     │
│       - Ring 1: 0.008 rad/frame (fastest — 3 items)                 │
│       - Ring 2: 0.005 rad/frame (medium — 4 items)                  │
│       - Ring 3: 0.003 rad/frame (slowest — 6 items)                 │
│     ★ Hover: connection line from center NEXUS to tool              │
│       + tooltip appears + icon enlarges (26px vs 18px)              │
│     ★ Non-hovered items dim to 0.2 alpha when another is hovered   │
│     ★ GSAP fade-in on scroll trigger (opacity + y:30)               │
│     ★ Responsive height: 400→350→300px                              │
│     ★ Reduced motion: stops all rotation (speeds set to 0)          │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  4. INFRASTRUCTURE AS CODE — "IaC"                                   │
│                                                                      │
│     ┌──────────────────────────────────┬──────────────────────┐     │
│     │  ● ● ●  nexus-infra.tf  .tf     │                      │     │
│     │  [CODE VIEW | DIFF VIEW]         │ PROVISION TIME       │     │
│     │  ┌────────────────────────┐      │ 4m 12s → 38s        │     │
│     │  │ resource "aws_instance"│      │ ████████████████░░░  │     │
│     │  │   ami = "ami-..."      │      │ ╱╲   ╱╲ (sparkline)  │     │
│     │  │   instance_type = ...  │      │                      │     │
│     │  │   tags = {             │      │ CONFIG DRIFT         │     │
│     │  │     Name = "Nexus..."  │      │ 0 DETECTED           │     │
│     │  │     // AUTO_SCALING    │      │ ████████████████████  │     │
│     │  │   }                    │      │ ─── (sparkline)      │     │
│     │  │ }                      │      │                      │     │
│     │  │ ▊ (blinking cursor)    │      │ INFRA COVERAGE       │     │
│     │  └────────────────────────┘      │ 100% AS-CODE         │     │
│     │  // Terraform-driven immutable.. │ ████████████████████  │     │
│     │                                  │ ╱╲    ╱╲ (sparkline) │     │
│     │                                  │                      │     │
│     │                                  │ Real-time intelligence│     │
│     │                                  │ layer...              │     │
│     └──────────────────────────────────┴──────────────────────┘     │
│                                                                      │
│     ★ Terraform code typewriter (14ms/char, 8 lines)                │
│     ★ Syntax highlighting via regex-to-span injection:               │
│       keywords(accent), strings(#ce9178), comments(accent+pulse),   │
│       braces(#ffd700)                                                │
│     ★ CODE VIEW / DIFF VIEW toggle:                                  │
│       - Code: character-by-character typewriter on scroll trigger   │
│       - Diff: git-style view with 6 deletions (pink, line-through)  │
│         and 6 additions (blue accent), +/- gutter markers            │
│     ★ 3 metric cards, each with:                                     │
│       - Header (label + animated counter value)                     │
│       - Progress bar (0→data-width%, 1.4s power2.out, stagger 0.18)│
│       - Sparkline canvas (30-point random walk, 3 trends)           │
│     ★ GP: 3 trends: "up" (upward drift), "flat" (mean-reverting),   │
│       "up" again (but covers infra coverage — progressive)           │
│     ★ Blinking cursor (CSS @keyframes, ▊ character)                 │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  5. ZERO-DOWNTIME PROTOCOL                                           │
│                                                                      │
│     ZERO / DOWNTIME.                                                 │
│     ───────────────────────────────────── (full-width accent line)   │
│                                                                      │
│     ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│     │01 // BLUE-GREEN  │ │02 // CANARY      │ │03 // INSTANT     │  │
│     │     SWAP         │ │    RELEASE       │ │    ROLLBACK      │  │
│     │                  │ │                  │ │                  │  │
│     │  ┌──[SVG]───┐   │ │  ┌──[SVG]───┐    │ │  ┌──[SVG]───┐    │  │
│     │  │v1.2 LIVE │   │ │  │99%→STABLE│    │ │  │ ⭕ 90s    │    │  │
│     │  │v1.3 READY│   │ │  │1%→CANARY │    │ │  │ DETECT.. │    │  │
│     │  │ → arrow  │   │ │  │ + paths  │    │ │  │ progress │    │  │
│     │  └──────────┘   │ │  └──────────┘    │ │  │ ring     │    │  │
│     │                  │ │                  │ │  └──────────┘    │  │
│     │ PARALLEL DEPLOY   │ │ GRADUAL ROLLOUT  │ │ ONE-CLICK REVERT│  │
│     │ Switch production │ │ Expose 1% subset │ │ Fail-safe <90s  │  │
│     └──────────────────┘ └──────────────────┘ └──────────────────┘  │
│                                                                      │
│     ★ SVG animations via CSS @keyframes, toggled by ScrollTrigger:   │
│       - Blue-Green: traffic arrow shifts + labels swap (4s loop)     │
│       - Canary: canary-path thickens (stroke-width, 4s loop)         │
│       - Rollback: ring stroke-dashoffset 0→314→0 + stroke color     │
│         shift (orange → pink → green, 4s loop)                      │
│     ★ Card power-on entry (GSAP timeline, stagger 0.1s):             │
│       card fade+slide → flash(120ms) → icon slam(back.out 2.2) →   │
│       eyebrow clip → title lift → desc lift                         │
│     ★ Bidirectional reverse on scroll-up                             │
│     ★ Title underline accent draws left→right via ScrollTrigger     │
│     ★ Hover: GSAP borderColor + backgroundColor transition           │
│     ★ 3-column grid, stacks to 1-col on mobile                      │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  6. CTA — "INITIATE PIPELINE" + FOOTER                               │
│     "EDGENEXUS // DEVOPS-INTAKE" (shared CTA component)             │
│     "READY TO NEVER PAGE AT 3AM AGAIN?"                              │
│     Form: NAME ($ prompt), EMAIL ($ prompt), MESSAGE (textarea)      │
│     Submit: "SEND MESSAGE" button                                    │
│     DevOps-specific submit handler: deploy-sequence feedback         │
│     Ambient dots: shared from cta.js                                 │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.5 — Cyber Security Page (`services/cyber-security.html`) [v3 — LIVE DEFENSE FEED]

The Cyber Security page was rewritten from **v2 (movie-hacker)** to **v3 (real-SOC-telemetry)**. All visual effects use the `--accent` (blue #00aaff) token — no red or orange colors appear on the page. The shared `js/core/decrypt-text.js` primitive was removed (unused elsewhere). Zero new CDN dependencies.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        NAVBAR (glass overlay)                        │
│  EDGE[NEXUS IT]   [HOME] [SERVICES ▾] [PERIMETER] [KILL CHAIN] [CT] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. HERO — "OPERATE WITHOUT EXPOSURE."                               │
│     ┌────────────────────────────┬──────────────────────────────┐    │
│     │ LEFT: Copy column          │ RIGHT: NEXUS_SHIELD panel    │    │
│     │                             │  (±3° 3D-tilt + moving      │    │
│     │ OPERATE  WITHOUT           │   specular reflection band,  │    │
│     │ EXPOSURE.                   │   sensor-dust particles      │    │
│     │ ← redaction-lift: bars     │   with tracer streaks)       │    │
│     │   retract left→right,      │                               │    │
│     │   stamp flash on accent    │ ┌─ NEXUS_SHIELD/SOC-LIVE ───┐│    │
│     │   word, persistent glow    │ │                             ││    │
│     │                             │ │ 16-node network graph     ││    │
│     │ Real-time threat...        │ │ (star topology, pulses     ││    │
│     │                             │ │  every 4.5-6.5s)          ││    │
│     │ [RUN SECURITY SCAN ▶]      │ │                             ││    │
│     │ [./view_threat_map]        │ │ 1,247   82   0.4s          ││    │
│     │                             │ │ ENDPTS  THRT  RESP        ││    │
│     │                             │ │                             ││    │
│     │   ★ Sensor dust: 50        │ │ [SOC] variable-speed       ││    │
│     │     particles + 3 tracers  │ │   terminal + [DETECT]      ││    │
│     │     (no deflection logic)  │ │   line injection on pulse  ││    │
│     └────────────────────────────┴──────────────────────────────┘    │
│                                                                      │
│     Entry: scanline → pre-label (fade) → redaction-lift headline    │
│       → stamp flash → particle canvas → shield panel → body → CTA   │
│       Tier-scaled: high=16 nodes+pulse, mid=10 nodes+pulse 7-9s,    │
│       low=static graph, no pulse, fewer particles                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  2. THE PERIMETER — "NOTHING UNWATCHED." (RADAR SCOPE)              │
│                                                                      │
│     ┌──────────────────────────────────────────────────────┐        │
│     │                 RADAR SCOPE (square canvas)           │        │
│     │                                                      │        │
│     │   4 range rings + 12 radial spokes                   │        │
│     │   Sweep wedge rotating every 6s (15° arc, comet-tail)│        │
│     │                                                      │        │
│     │   Blips (6 defense layers across 3 range bands):    │        │
│     │   ● IDENTITY & ACCESS   (inner band)                 │        │
│     │   ● ENDPOINT DEFENSE    (inner band)                 │        │
│     │   ● NETWORK PERIMETER   (mid band)                   │        │
│     │   ● CLOUD POSTURE       (mid band)                   │        │
│     │   ● DATA PROTECTION     (outer band)                 │        │
│     │   ● THREAT INTELLIGENCE (outer band)                 │        │
│     │                                                      │        │
│     │   [blips brighten on sweep-pass trigger]             │        │
│     │   [hover card → connecting line + stat readout]     │        │
│     └──────────────────────────────────────────────────────┘        │
│                                                                      │
│     ★ Sweep pass: each blip detects wedge leading edge crossing     │
│       → brighten + expand (500ms), fires once per rotation          │
│     ★ Hover: 6 defense cards below scope draw lines + stats         │
│     ★ Canvas hover: tooltip with layer name + stat                  │
│     ★ Reduced motion: sweep stops (static 0°), hover still works    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  3. THE KILL CHAIN — "WHERE ATTACKS DIE." (FORENSIC WAVEFORM)       │
│                                                                      │
│     (01) ── (02) ── (03) ── (04) ── (05)                            │
│     RECON  DELIVERY EXPLOIT INTERCEPT CONTAINED                      │
│                               ▲                                      │
│                         [  ~flatline~  ]                             │
│                        clamp brackets slide in                       │
│                                                                      │
│     ★ Background waveform (120-sample polyline): gentle→spiky→       │
│       clamped→flat across 5 stages                                   │
│     ★ Flatline overlay: clip-path scrubbed by ScrollTrigger,         │
│       reveals left→right as INTERCEPT is reached                     │
│     ★ Clamp brackets: slide in from above/below at INTERCEPT         │
│       position (back.out 1.7 ease)                                   │
│     ★ Seeded random (seed=42), deterministic across reloads          │
│     ★ All 5 panels, stat bars, terminal typewriter unchanged from v2 │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  4. INCIDENT RESPONSE PROTOCOL (New card internals)                  │
│                                                                      │
│     DETECT. CONTAIN. RECOVER.                                        │
│     ───────────────────────────────────── (full-width accent line)   │
│                                                                      │
│      ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│      │01 // DETECT &   │ │02 // CONTAIN &  │ │03 // RECOVER &  │    │
│      │     TRIAGE      │ │    ERADICATE    │ │    HARDEN       │    │
│      │                 │ │                 │ │                 │    │
│      │ scrolling log   │ │ network         │ │ checklist draw  │    │
│      │ feed (8s loop,  │ │ disconnect      │ │ (4 checks,      │    │
│      │ 10 lines, pause │ │ diagram (4s     │ │  4.5s loop,     │    │
│      │ on hover)       │ │ loop)           │ │  counter X/4)   │    │
│      │                 │ │                 │ │                 │    │
│      │ AUTOMATED ALERT │ │ THREAT ISOLATED │ │ HARDENED+PATCHED│    │
│      └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                      │
│     ★ Depth-stack reveal + power-on micro-sequence kept from v2     │
│     ★ Card hover (borderColor + backgroundColor) kept from v2       │
│     ★ 3-column grid, 1-col on mobile                                │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
### 3.6 — IT Support Page (`services/it-support.html`)

The IT Support page is the final service page, completing all 6 service offerings. It features a **Live Ticket Board** hero panel with split-flap character reveal, **Noise Flow Field** canvas background, **Rolling Drum Counters** for SLA metrics, **CSS Polygon Morph** response tier cards with magnetic cursor field, and **3D CSS Perspective Flip Cards** for team bench.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        NAVBAR (glass overlay)                        │
│  EDGE[NEXUS IT]   [HOME] [SERVICES ▾] [RESPONSE] [TEAM] [CONTACT]  │
│     ┌─ Dropdown ──────────────────────────────┐                      │
│     │  MSP → msp.html                         │                      │
│     │  DEVOPS → devops.html                   │                      │
│     │  CYBER SECURITY → cyber-security.html  │                      │
│     │  IT SUPPORT → #hero-itsupport (active)  │                      │
│     │  STAFF AUGMENTATION → staff-augmentation.html │               │
│     └─────────────────────────────────────────┘                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. HERO — "EVERY SECOND OFFLINE COSTS."                             │
│     ┌────────────────────────────┬──────────────────────────────┐    │
│     │ LEFT: Copy column          │ RIGHT: Live Ticket Board     │    │
│     │                            │ ┌─ NEXUS_HELPDESK ────────┐ │    │
│     │ EDGENEXUS IT-SUPPORT       │ │ ● ● ●     ● LIVE        │ │    │
│     │ (eyebrow fade in)          │ │                            │ │    │
│     │                            │ │ P1  VPN ACCESS      OPEN  │ │    │
│     │ EVERY  SECOND              │ │ P2  NETWORK LAT..  OPEN  │ │    │
│     │ OFFLINE                    │ │ P2  EMAIL SYNC   RESOLVED│ │    │
│     │ COSTS.                     │ │ P0  SERVER UNREA.. OPEN  │ │    │
│     │ (split-flap reveal)        │ │ P3  PRINTER OFF.. QUEUED│ │    │
│     │                            │ │                            │ │    │
│     │ Human-scale response...    │ │ AVG FIRST RESP [■■■■■] 18M│ │    │
│     │                            │ └────────────────────────────┘ │    │
│     │ [REQUEST SUPPORT ▶]       │ ═ Noise flow field canvas ═══  │    │
│     │ [./view_sla]               │ (180/90/40 particles, tiered)  │    │
│     └────────────────────────────┴──────────────────────────────┘    │
│                                                                      │
│     ★ Split-flap: CHARSET cycling (12 flips/char, 38ms interval)    │
│     ★ Flow field: 2D value noise grid, bilinear interpolation       │
│     ★ Blur→Sharp focus pull via ScrollTrigger+CSS transition        │
│     ★ Ticket timers: live count-up, P0 pulse at >300s               │
│     ★ Hero pin: 120% scrub exit, 80% mobile                         │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  2. SLA STATS — "NUMBERS DON'T LIE."                                 │
│                                                                      │
│     MEASURED. PUBLISHED. GUARANTEED.                                 │
│     ────────────────────────────────────                             │
│                                                                      │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│     │99.97%   │ │18 MIN   │ │2,847    │ │<4 HRS   │            │
│     │UPTIME   │ │AVG MTTR │ │TICKETS  │ │P1 SLA   │            │
│     │ 12-month│ │Mean time│ │Last 30d │ │Target   │            │
│     │ rolling │ │to reslvn│ │all sev  │ │reslvn   │            │
│     └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                      │
│     ★ Rolling drum counters: cascading digit animation L→R          │
│     ★ Duration per place: 0.55s(ones) + 0.2s per digit              │
│     ★ Live uptime tick: 99.97% increments 0.01% every ~3.6s         │
│     ★ Special case: 99.97% display from integer 9997 (data-target)  │
│     ★ 4-col → 2-col (900px) → 1-col (480px) responsive             │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  3. RESPONSE TIERS — "PRIORITY ZERO EXISTS."                         │
│                                                                      │
│     ESCALATION PROTOCOL                                              │
│     ─────────────────────────                                        │
│                                                                      │
│     ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                    │
│     │  P0    │ │  P1    │ │  P2    │ │  P3    │                    │
│     │CRITICAL│ │  HIGH  │ │ MEDIUM │ │  LOW   │                    │
│     │<15 MIN │ │<2 HRS  │ │<8 HRS  │ │<24 HRS │                    │
│     │        │ │        │ │        │ │        │                    │
│     │•Bus halt│ •Impair │ •Degrade │ •Minor  │                    │
│     │•24/7 on│ •Remote │ •Remote │ •Sched. │                    │
│     │•Warroom│ •On-site│ •Workarnd│ •Self-svc│                    │
│     │•Exec esc│ •Mgr ntf│ •Nxt-day│ •Batch   │                    │
│     └────────┘ └────────┘ └────────┘ └────────┘                    │
│                                                                      │
│     ★ Polygon morph: clip-path rect→parallelogram on hover          │
│     ★ P0: more extreme angle (20%→100%, 80%→0%)                    │
│     ★ Magnetic cursor: gsap.quickTo per card (14% strength)         │
│     ★ Elastic return: elastic.out(1,0.4) on mouseleave+blur         │
│     ★ RAF-throttled mousemove (no per-frame GSAP calls)             │
│     ★ 4-col → 2-col (1024px) → 1-col (640px)                       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  4. TEAM BENCH — "REAL HUMANS. REAL FAST."                           │
│                                                                      │
│     THE BENCH                                                        │
│     ─────────                                                         │
│                                                                      │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│     │ 🖧 NETWORK│ │ 🖥 SYSTEMS│ │ 🛡 SECURI│ │ ☁ CLOUD  │            │
│     │Connect & │ │Servers & │ │Endpoint &│ │AWS,Azur,G│            │
│     │Infra     │ │OS        │ │Access    │ │CP        │            │
│     │          │ │          │ │          │ │          │            │
│     │ hover →  │ │ hover →  │ │ hover →  │ │ hover →  │            │
│     └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│           ↕ (flip)      ↕ (flip)      ↕ (flip)      ↕ (flip)       │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│     │3 ENGNRRS │ │4 ENGNRRS │ │2 ENGNRRS │ │5 ENGNRRS │            │
│     │22min,94% │ │31min,91% │ │44min,88% │ │18min,97% │            │
│     │●3/3 ONLN │ │●4/4 ONLN │ │●2/2 ONLN │ │●5/5 ONLN │            │
│     │Routing.. │ │Win,Linux,│ │MFA,MDM.. │ │IAM,comp..│            │
│     └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                      │
│     ★ CSS 3D perspective flip: rotateY(180deg) on hover/focus       │
│     ★ backface-visibility + -webkit-backface-visibility             │
│     ★ Keyboard: Space/Enter toggles flip state                      │
│     ★ Touch: hide front, show back content directly                 │
│     ★ Green online dot: CSS keyframe pulse (1.5s)                   │
│     ★ 4-col → 2-col (1024px) → 1-col (480px)                       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  5. CTA — "NEED SOMEONE WHO PICKS UP THE PHONE?"                    │
│     IT-SUPPORT-INTAKE, shared terminal form                          │
│     Submit sequence: TICKET_CREATED → SLA_ASSIGNED →                │
│     ENGINEER_NOTIFIED → MESSAGE_RECEIVED.                           │
└──────────────────────────────────────────────────────────────────────┘

### 3.7 — About Page (`about.html`)  [NEW]

The About page is the newest page, completing the site's informational core. It follows the same cinematic design language with a particle canvas hero, scroll-triggered stat counters, and shared layout injection.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        NAVBAR (injected by shared-layout.js)          │
│  EDGE[NEXUS IT]    [HOME] [SERVICES ▾] [ABOUT]          SYS 14:23:41 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. HERO — "ARCHITECTS OF INFRASTRUCTURE."                           │
│     ┌──────────────────────────────────────────────────────────┐     │
│     │  Canvas particle system (60 dots + connecting lines       │     │
│     │  within 150px distance, accent blue 0.25 alpha)           │     │
│     │                                                           │     │
│     │  EDGENEXUS IT :: ABOUT (eyebrow)                          │     │
│     │  ARCHITECTS OF                                             │     │
│     │  INFRASTRUCTURE. (headline, blue accent glow)             │     │
│     │                                                           │     │
│     │  We build, secure, and operate... (subtitle)              │     │
│     │                                                           │     │
│     │  847          12,000        99.97                         │     │
│     │  DAYS UPTIME  NODES MANAGED SLA PERCENT                   │     │
│     │  (count-up from 0 on scroll)                              │     │
│     │                                                           │     │
│     │  SCROLL ↓                                                  │     │
│     └──────────────────────────────────────────────────────────┘     │
│                                                                      │
│     Entry: eyebrow → headline (opacity+y+scale, 1.2s) → subtitle →  │
│     stat stagger (0.15s each)                                        │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  2. MISSION — "ZERO DOWNTIME. ZERO COMPROMISE."                     │
│     ┌──────────────────────────────┬───────────────────────────┐     │
│     │  01 / MISSION                │ 4 Metric Cards:           │     │
│     │  ZERO DOWNTIME.              │  14+ Years in production  │     │
│     │  ZERO COMPROMISE.            │  500+ Enterprise clients  │     │
│     │                              │  99.97% Average SLA       │     │
│     │  EdgeNexus IT was founded... │  24/7 NOC operations       │     │
│     └──────────────────────────────┴───────────────────────────┘     │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  3. VALUES — "HOW WE OPERATE."                                        │
│     01. OBSERVABILITY FIRST   02. DEFENSE IN DEPTH                   │
│     03. AUTOMATE EVERYTHING   04. NO EGO. JUST UPTIME.              │
│     4-column grid with numbered cards, hover lift + border glow      │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  4. APPROACH — "FROM DETECTION TO RESOLUTION."                       │
│     DETECT → TRIAGE → RESOLVE → OPTIMIZE                             │
│     4 cards with SVG icons, dashed path line below, gradient top     │
│     border accent per card                                            │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  CINEMATIC DIVIDER                                                    │
│  "RELIABILITY IS NOT A FEATURE — IT'S THE FOUNDATION."               │
│  Auto-scrolling marquee text (24s linear infinite)                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  5. CTA — "YOUR INFRASTRUCTURE NEEDS A NEXUS."                       │
│     Shared terminal form (name, email, message)                       │
│     No custom submit override (uses default index CTA handler)       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Global Cinematic Touches (v3)
- **Depth-of-Field Blur** (high=1px, mid=0.5px): `filter: blur()` on background canvases (sensor-dust, telemetry, radar)

---

## 4. Complete Animation Inventory

### 4.1 — PRELOADER (`js/components/preloader.js`)
| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| Progress bar fill | GSAP `onUpdate` | **1.4s** (was 2.6s) | power1.inOut | 0→100%, syncs counter + status text |
| Node reveal | GSAP `to()` on each | 0.3s | power2.out | 24 SVG circles fade in progressively |
| Edge reveal | GSAP `to()` on each | 0.4s | — | Connected edges fade in with nodes |
| Node pulse at 100% | GSAP `fromTo` (r:3→6→3) | 0.2s each | power2.inOut | All 24 nodes pulse, staggered 0.02s |
| Implosion (nodes→center) | GSAP `to()` attr: cx/cy/r | 0.5s | power3.in | All nodes collapse to center of SVG |
| Edge fade-out | GSAP `to()` opacity:0 | 0.3s | — | Edges disappear with implosion |
| Discharge flash | GSAP `to()` 0→0.04→0 | 0.04s×2 | yoyo, repeat:1 | White overlay flash at full convergence |
| Preloader slide-up / fade | GSAP `to()` yPercent/-opacity | 0.4–0.8s | expo.in / power2.inOut | Bridge-dependent exit |

### 4.2 — HERO (Homepage, `js/sections/hero.js`) [UPDATED]
| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| *(all globe/globe-entry animations unchanged — see previous report)* | | | | |
| Entry: canvas fade in | GSAP `to()` | 0.4s | — | Unchanged |
| Entry: eyebrow clip | GSAP `to()` clipPath | 0.5s | power2.out | Unchanged |
| Entry: headline clip | GSAP `to()` clipPath | 0.7s | power2.out | Unchanged |
| Entry: divider scale | GSAP `to()` scaleX:0→1 | 0.8s | power2.out | Unchanged |
| Entry: body/typer/CTAs | GSAP `to()` opacity+y | 0.6s | power2.out | Stagger 0.1s. **Metric bar removed from entry.** |
| Exit: content columns | GSAP `to()` y:-80 + opacity 0 | 0.3s | power2.in | Scrub-driven. **Metric bar removed from exit.** |
| **Globe depth fade** | Per-frame Z-depth calculation | continuous | — | **NEW: high-tier only** — skipped on mid/low (saves ~1ms/frame) |
| **Node pulse** | Math.sin(elapsed) opacity/scale | continuous | — | **NEW: skipped on low tier** — static node opacity |
| **Data packet animation** | Bezier arc progress per frame | continuous | — | **NEW: high-tier only** — skipped on mid/low |
| **Mouse parallax** | RAF-throttled mousemove → globe rotation | continuous | — | **NEW: throttled via requestAnimationFrame gating** (was firing on every mousemove event) |
| **Off-screen pause** | IntersectionObserver + rootMargin | — | — | **NEW: 200px rootMargin** prevents rapid toggle; paused loop returns without scheduling RAF (no busy-wait) |
| Background particles | Canvas RAF | continuous | — | Unchanged |

### 4.3 — HERO (Web Dev Page, `js/pages/web-development/hero-webdev.js`) [UPDATED]
| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| *(all dot-grid / mockup / parallax animations unchanged)* | | | | |
| Metric bar entrance | **REMOVED** | — | — | `.hero-webdev-metrics` HTML/CSS/JS fully deleted |

### 4.4 — SERVICES (`js/sections/services.js`) [UPDATED]
Card navigation now linked: card 0 → `services/msp.html`, card 1 → `services/devops.html`, card 2 → `services/cyber-security.html`, card 3 → `services/it-support.html`, card 4 → `services/staff-augmentation.html`. Navigation is wired up **before** vertical scanline injection.

*(all horizontal scroll / depth / hover animations unchanged)*

### 4.5 — STACK (Web Dev Page, `js/pages/web-development/stack.js`)
*(unchanged — see previous report version)*

### 4.6 — PROCESS (Web Dev Page, `js/pages/web-development/process-webdev.js`)
*(unchanged — see previous report version)*

### 4.7 — WHY US (Web Dev Page, `js/pages/web-development/why-us.js`)
*(unchanged — see previous report version)*

### 4.8 — CTA (`js/sections/cta.js`) [REFACTORED]
| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| CSRF token fetch | `fetch(API_BASE + '?action=token')` | On page load | async | Fetches CSRF token from backend session. `API_BASE` uses `new URL('../../api/contact.php', import.meta.url).href` for local XAMPP + live root compatibility. |
| Ambient dot drift | Canvas `requestAnimationFrame` | continuous | sine-wave | 60 particles, drift + sine amplitude + edge bounce. **Shared across ALL pages.** |
| Focus convergence | GSAP `to()` per dot | 1.2s | power2.inOut | Dots move toward focused terminal input. Runs on **all pages** (no longer index-only). |
| Defocus return | GSAP `to()` per dot | 2s | power1.inOut | Returns dots to original positions on input blur. |
| Submit: dot convergence + explode | GSAP timeline | 1.0s total | power3.in → power2.out | Dots converge to center (0.4s) then scatter to random viewport edges (0.6s). Reset positions on complete. |
| Submit: typewriter deploy lines | `setTimeout` chain, 20ms/char | ~3.5s | — | 5-line typewriter sequence. **Cyber-security page** shows audit-themed lines ("AUDIT_QUEUED"). **All other pages** show standard lines ("MESSAGE DEPLOYED"). Uniform on all 7 pages. |
| Submit: real POST | `fetch(API_BASE, {method:'POST', body:JSON})` | After typewriter | async | Sends `{name, email, message, page, _token, _honey}` to `/api/contact.php`. Page ID derived from `PAGE_ID` constant. |
| Submit: error shake | GSAP `to()` x:±8 | 0.3s | power2.inOut | 3 quick oscillations on validation/network error. `btn--shake` class toggle. |
| Submit: form reset | setTimeout + display toggle | 3s after POST | — | Re-enables form, clears inputs, removes deploy output div, restores button text.

### 4.9 — FOOTER (`js/sections/footer.js`)
*(unchanged — see previous report version)*

### 4.10 — CORE / GLOBAL SYSTEMS [UPDATED]

#### Grid System (`js/core/grid.js`)

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| Proximity pulse | Canvas RAF + mouse | continuous | — | Original: white cross-hairs pulse near cursor. 40px CELL. |
| Section color shift | Canvas RAF + scroll | continuous | — | Original: ambient tint per section zone. |
| **Breathing wave** | Canvas RAF + `setTimeout` | 1.2s wave | linear (progress) | **NEW**: Diagonal (45°) wave sweeps across grid intersections every 10±2s. Draws 1px cross fragments at each intersection within 400px wave width. Opacity ramps 0.035→0.10→0. Opacity controlled by `--grid-line` token. |
| Mobile adaptation | — | — | — | CELL = 60 on mobile (was 40). |

#### Scanline Texture (`styles/utilities.css`) [NEW]

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| **Scanline overlay** | CSS `body::before` + `repeating-linear-gradient` | static | — | Fixed overlay at z-index: 9998, 3px repeating pattern with 0.08 black at 1px. Opacity controlled by `--scanline-opacity` CSS variable (default 0). |

#### Status Bar (`js/components/status-bar.js` + `styles/components/status-bar.css`) [NEW]

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| **Entry slide-down** | CSS `transform: translateY(-100%)→0` | 0.3s | expo | Waits 300ms after init (or preloader exit). Uses `.visible` class. |
| **Scroll collapse** | CSS `height: 32px→0` | 0.2s | expo | `scrollY > 200` adds `.collapsed` class; `<200` removes. height transition + border-color fade. |
| **Live clock** | JS `setInterval` 1s | continuous | — | Updates `#status-clock` textContent with HH:MM:SS. |
| **Pulse dot** | CSS `@keyframes status-pulse` | 1.5s | ease-in-out infinite | Green accent dot: opacity 1→0.4→1, scale 1→0.8→1. |

#### Clock (`js/components/clock.js`) [UPDATED]

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| Live time | `setInterval` 1s | continuous | — | **Now selects all `[id*="clock"]` elements.** Prefixes with "SYS " only for `#nav-clock`. |

#### Performance System (`js/core/performance.js`) [NEW — FPS capping]

| Feature | Implementation | Details |
|---------|---------------|---------|
| **FPS capping per tier** | `frameInterval = 1000 / fpsTarget` | low=30fps, mid=40fps, high=60fps. Exported as `getFpsTarget()` and `frameInterval`. |
| **GSAP lag smoothing** | `gsap.ticker.lagSmoothing(0)` | Prevents GSAP accelerating time to catch up after lag. **Also applied in main.js** (duplicate). |
| **Tier-change listener** | `window.addEventListener('tierchange', ...)` | Updates `fpsTarget` dynamically when device tier changes. |
| **Low-memory FPS cap** | `gsap.ticker.fps(30)` when `deviceMemory ≤ 2` | Applied in `main.js` independently of tier system. |

#### CSS Loading Strategy (`index.html`) [NEW]

| Feature | Implementation | Details |
|---------|---------------|---------|
| **Critical CSS** | Synchronous `<link>` | `tokens.css`, `reset.css`, `preloader.css` — first paint essentials |
| **Non-critical CSS** | `<link media="print" onload="this.media='all'">` | All other CSS files load asynchronously with `<noscript>` fallback |
| **CDN scripts** | `<script defer>` | three.js, gsap, ScrollTrigger, ScrollToPlugin, d3, topojson all deferred |
| **Font preload** | `<link rel="preload" as="style">` + preconnect | Google Fonts discovered early; `@import` removed from typography.css |
| **D3/TopoJSON move** | From `<head>` to `<body>` footer | Previously render-blocking, now deferred |

### 4.11 — MSP Page Animations
*(unchanged — see previous report version)*

### 4.12 — DEVOPS Page Animations (`js/pages/devops/`) [CORRECTED TO ACTUAL IMPLEMENTATION]

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| **HERO** | | | | |
| Dashboard SCAN progress | GSAP `to()` width:0→65% | 8s | none, repeat:-1 | Continuous loop, bar fills on SCAN row |
| Dashboard stage cycle | `setTimeout` chain | ~12s/cycle | — | SCAN (4s) → STAGE (3s) → DEPLOY (3s) → RESET (2s) |
| Stage state transitions | GSAP + classList | 0.5s | power2.out | Sets completed/active/pending classes, fills bars |
| SCAN running counter | `setInterval` 100ms | continuous | — | Increments 0.1s ticks during SCAN stage |
| Terminal typewriter | `setTimeout` 18ms/char | ~7s per cycle | — | 8 log lines, 500ms line gap, 3s pause → restarts |
| Entry: scanline fade | GSAP `to()` `--scanline-opacity`:1 | 0.4s | power2.out | First entry step at t=0.03s |
| Entry: eyebrow slide | GSAP `to()` y:10→0, opacity | 0.4s | power2.out | At t=0.1s |
| Entry: headline word stagger | GSAP `to()` y:40→0, opacity | 0.6s per word | expo.out | Stagger 0.08s, splits HTML on `<br>` + `<span>` |
| Entry: accent underline | GSAP `to()` `--underline-scale`:1 | 0.4s | expo.out | Draws left→right on "FEAR." |
| Entry: body text | GSAP `to()` y:20→0, opacity | 0.5s | power2.out | After headline + 0.1s |
| Entry: CTA buttons | GSAP `to()` y:15→0, opacity | 0.4s | power2.out | After body + 0.1s |
| Hero pin exit | GSAP `to()` y:-80 + opacity | 0.4s | power2.in | Scrub-driven at 120% pin progress |
| **PIPELINE** | | | | |
| Track line fill | GSAP `to()` scaleX:0→1 | scrub | none | Single master ScrollTrigger, scrub mapped to progress 0→4 |
| Node activation | CSS class toggle + `@keyframes node-pulse` | 1.4s | ease-out infinite | Box-shadow ring pulse: 0→8px→0 |
| Connector dots light | CSS class `.lit` on 12 dots | 0.15s | ease | Background → accent + glow, lights up to active stage |
| Detail panel swap | GSAP `fromTo()` opacity+y | 0.35s | expo.out | Panel hidden attribute toggle + fade-in on stage change |
| Terminal typewriter | `setInterval` 20ms/char | ~1s per panel | — | Reads `data-cmd` attribute, clears on stage change |
| Stat bars | GSAP `fromTo()` width:0→target% | 1s | expo.out | .stat-fill elements, reads data-width attribute |
| Mobile fallback | ScrollTrigger once + vertical stack | — | — | All panels visible with vertical timeline layout |
| **STACK INTEROP** | | | | |
| Orbit rotation | Canvas `requestAnimationFrame` | continuous | linear | 3 rings at 0.008/0.005/0.003 rad/frame |
| Tool entry fade | GSAP `fromTo()` opacity + y | 0.6s | power2.out | ScrollTrigger once on section enter |
| Logo render | Canvas `drawImage` per devicon | per frame | — | 13 preloaded SVG logos from CDN |
| Hover connection line | Canvas redraw per frame | instant | — | Line from center to hovered tool |
| Hover tooltip | CSS opacity 0→1 | 0.3s | ease | Bottom-center tooltip + icon enlarge 18→26px |
| Sibling dim | Canvas `globalAlpha` 0.2 | per frame | — | Non-hovered items dim when one is selected |
| **IaC** | | | | |
| Code typewriter | `setTimeout` 14ms/char | ~4.5s total | — | 8 lines, 100ms line gap, syntax-highlighted spans |
| Syntax highlighting | String `.replace()` → spans | per char | — | keyword(accent), string(#ce9178), comment(accent+pulse), brace(#ffd700) |
| Blinking cursor | CSS `@keyframes blink` | 1s step-end | — | ▊ character, appended after typewriter completes |
| Diff view toggle | JS classList + display swap | instant | — | CODE↔DIFF toggle buttons with active state |
| Progress bars | GSAP `to()` width:0→data-width% | 1.4s | power2.out | Stagger 0.18s, triggered once on scroll enter |
| Numeric counters | GSAP `fromTo({val:0})` → target | 1.4s | power2.out | Reads data-target + data-suffix attributes |
| Sparklines | Canvas `getContext('2d')` draw | static | — | 30-point random walk per metric (3 trends: up/flat/up) |
| **ZERO-DOWNTIME** | | | | |
| SVG CSS keyframe loops (paused→playing) | CSS `@keyframes` on SVGs | 4s loop | ease-in-out | Toggled by ScrollTrigger play/pause |
| Blue-Green SVG: traffic arrow | CSS `stroke-width` shift | 4s loop | ease-in-out | Arrow thickens + stroke color shift blue→green |
| Blue-Green SVG: label swap | CSS `opacity` swap | 4s loop | step-end | Live label fades, Ready label appears at 50% |
| Canary SVG: path thicken | CSS `stroke-width` | 4s loop | ease-in-out | Canary path thickens from 1→4 |
| Rollback SVG: progress ring | CSS `stroke-dashoffset` 0→314→0 | 4s loop | ease-in-out | Ring unwinds, stroke shifts orange→pink→green |
| Card entry: flash | WAAPI `.animate()` on flash div | 120ms | — | White overlay 0→0.06→0 transparency |
| Card entry: icon slam | GSAP `to()` scale:0→1, rotation:-12→0 | 0.45s | back.out(2.2) | Overshoot effect |
| Card entry: eyebrow clip | GSAP `to()` clipPath | 0.35s | power2.out | Right→left reveal |
| Card entry: title lift | GSAP `to()` y:16→0, opacity | 0.35s | power2.out | — |
| Card entry: desc lift | GSAP `to()` y:8→0, opacity | 0.3s | power2.out | Slight delay |
| Title underline accent | GSAP `to()` scaleX:0→1 | 1.2s | expo.out | ScrollTrigger on section enter, once |
| Card hover | GSAP `to()` borderColor + backgroundColor | 0.2s | power2.out | border→accent-border, bg→accent-glow |

---

### 4.13 — CYBER SECURITY Page Animations (`js/pages/cyber-security/`) [v3 — LIVE DEFENSE FEED]

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| **HERO** | | | | |
| Redaction-lift headline | GSAP `to()` scaleX:1→0 on `.redact-bar` | 0.5s per line, stagger 0.12s | expo.out | Bars retract left→right (transformOrigin:right). 3 lines: OPERATE, WITHOUT, EXPOSURE. |
| Pre-label fade | GSAP `to()` opacity 0→1→0 | 0.2s in, 0.2s out | power2.out | "CLASSIFIED // DECLASSIFYING…" fades in, holds 0.3s, fades out before redaction starts. High-tier only. |
| Stamp flash on accent word | WAAPI `.animate()` opacity 0→0.45→0 | 90ms | ease-out | White/blue overlay flash on "EXPOSURE." when final bar completes. Followed by persistent `text-shadow` glow. |
| Live network telemetry graph | Canvas RAF + requestAnimationFrame | continuous | — | 16-node star topology (1 central SOC + 15 peripheral in 2 rings). Precomputed fixed positions. |
| Center node heartbeat | `Math.sin(elapsed/1800*2π)` | 1.8s | sine | Radius 6±1px, opacity 0.85–1.0 |
| Detect→respond pulse | Canvas RAF + `setTimeout` randomization | 600ms pulse, 4.5–6.5s interval | power2.inOut | Random peripheral: radius 2.5→4.5→2.5 + accent-strong fill. Traveling dot along edge to center. Center radius bump. Terminal [DETECT] injection. Threat counter +1. Tier-scaled. |
| Counters: ACTIVE ENDPOINTS | GSAP `fromTo()` count-up | 1.2s | power2.out | Static count 0→1,247 on load |
| Counters: THREATS NEUTRALIZED | GSAP `fromTo()` count-up + per-pulse increment | 1.2s initial | power2.out | Increments +1 per detect→respond pulse with scale-pulse on digit |
| Counters: AVG RESPONSE TIME | GSAP `fromTo()` count-up | 1.2s | power2.out | Static 0→0.4s on load |
| Sensor-dust particles (ambient) | Canvas RAF | continuous | — | 50/25/12 per tier (high/mid/low). 1–2px, opacity 0.06–0.15, slow drift. Scroll parallax: `(1-z)*delta*0.3`. No threat/deflection logic. |
| Sensor-dust tracers | Canvas RAF + timed cycles | 3–5s travel, 2–4s pause | — | 3/2/0 per tier. 4–6px streaks drawn as short lines with fading gradient along velocity. Travel diagonally, fade out, respawn. |
| 3D-tilt shield panel (±3°) | GSAP `to()` rotationX/Y, RAF mousemove | 0.4s | power2.out | `perspective: 1000px`, ±3° max (was ±6°). Moving specular band: linear-gradient div shifts opposite to tilt direction. |
| Variable-speed terminal | `setTimeout` 14ms/char base | ~5s/cycle | — | 8 security log lines. ~15% of lines in 2–3 bursts (chunk at word boundaries, 60–90ms gap). [DETECT] line injected from pulse events (capped 1/4s). |
| Hero pin exit | GSAP `to()` y:-80 + translateZ(40) + scale(1.03) | 0.4s | power2.in | Scrub-driven, responsive end (120% desktop, 80% mobile). Unchanged from v2. |
| **PERIMETER** (Radar Scope) | | | | |
| Range rings + spokes | Canvas RAF | continuous | — | 4 concentric rings (25/50/75/100% radius) + 12 radial spokes at 30°. |
| Sweep wedge rotation | Canvas RAF, `angle += (2π/6000) * dt` | 6s per rotation | linear | ~15° radial gradient wedge with comet-tail phosphor decay. Leading edge accent-strong. |
| Center node heartbeat | `Math.sin(elapsed/900)` | 1.8s | sine | Scale 1↔1.06, opacity 0.85↔1. "YOUR BUSINESS" label below. |
| Blip sweep-pass trigger | Canvas per-frame angle comparison | 500ms flash | power2.out → settle | 6 blips at fixed positions. Leading edge crossing detection (per-blip `lastPassed` guard). Radius 3→6→3, opacity 0.6→1→0.7. ~6s cadence per blip. |
| Hover: defense card connection | Canvas redraw + `.defense-card` event listeners | per frame | — | Connecting line center→blip (accent-border, 1px, dashed). Blip brightens to detected state. Stat readout visible. Card hover: border/background transition. |
| Canvas hover tooltip | CSS opacity 0→1 + textContent swap | 0.2s | ease | Falls back when defense-cards not present. |
| GSAP fade-in | GSAP `fromTo()` opacity + y | 0.6s | power2.out | ScrollTrigger once (unchanged from v2). |
| **KILL CHAIN** (Forensic Waveform) | | | | |
| Waveform generation | `seededRandom(42)` LCG | deterministic | — | 120 samples: RECON ±4px → DELIVERY ±8px → EXPLOIT ±18px → INTERCEPT ±18px → CONTAINED (flat). |
| Base polyline render | SVG `<polyline>` in `.killchain-waveform` | static | — | `stroke: var(--accent-border)`, 1.5px, spans full track width. |
| Flatline overlay | SVG `<polyline>` + `clip-path: inset(0 var(--flatline-clip) 0 0)` | scrub | — | `stroke: var(--accent)`, 1.5px. Initially hidden (clip 100%). ScrollTrigger drives to 0% during stages 3–4. |
| Clamp brackets | GSAP `to()` y-position | 0.3s | back.out(1.7) | `[` and `]` SVG paths at INTERCEPT x-position. Slide in from above/below on entering stage 3. Reverse if scrub retreats. |
| Persistent node pulse | CSS `@keyframes node-pulse` | 1.4s | ease-out infinite | Blue box-shadow ring 0→15px→0 (unchanged from v2). |
| Track line fill | GSAP `to()` scaleX:0→1 | scrub | none | Master ScrollTrigger (unchanged from v2). |
| Panel swap | GSAP `fromTo()` opacity+y | 0.35s | expo.out | `hidden` attribute toggle (unchanged from v2). |
| Stat bars | GSAP `fromTo()` width:0→target% | 1s | expo.out | Per-panel on activation (unchanged from v2). |
| Terminal typewriter | `setInterval` 20ms/char | ~1s per panel | — | Reads `data-cmd` attribute (unchanged from v2). |
| **INCIDENT RESPONSE** | | | | |
| Depth-stack card reveal | GSAP `to()` translateZ/scale/rotateY | 0.6s, stagger 0.12s | back.out(1.4) | Card 1: z=0, Card 2: z=-40→0, Card 3: z=-80→0. Mobile: translateY+scale fallback. Unchanged from v2. |
| Power-on micro-sequence | GSAP timeline per card | ~1.85s total | mixed | flash(120ms) → icon slam(back.out 2.2) → eyebrow clip → title lift → desc lift. Unchanged from v2. |
| Card 1: Scrolling log feed | CSS `@keyframes log-scroll` | 8s loop | linear infinite | 10 hardcoded SOC log lines. Timestamps in var(--t3), keywords in var(--accent). Duplicated for seamless loop. Pause on hover. Reduced-motion: static first 4 lines. |
| Card 2: Network disconnect diagram | GSAP timeline (card._timeline), repeat:-1 | 4s loop | power2.out | 4 connection lines retract via stroke-dashoffset (stagger 0.3s). Peer nodes dim. 2–3s hold. 3–4s restore reverse stagger. Played/paused via ScrollTrigger visibility. |
| Card 3: Checklist draw | GSAP timeline (card._timeline), repeat:-1 | 4.5s loop | expo.out | 4 checkmarks draw sequentially (0.3s each, stagger 0.4s). Counter "X/4 COMPLETE" increments. 2–3.5s hold with glow. 3.5–4s fast erase + reset. |
| Title underline | GSAP `to()` scaleX:0→1 | 1.2s | expo.out | ScrollTrigger once (unchanged from v2). |
| Card hover | GSAP `to()` borderColor + backgroundColor | 0.2s | power2.out | Hover-capable only (unchanged from v2). |
| **GLOBAL TOUCHES** | | | | |
| Slow light sweep | GSAP `to()` x:+=200% | 2.5s + 11.5s pause | power1.inOut, repeat:-1 | Fixed div with linear-gradient sweep. High/mid tier only. |

### 4.14 — IT SUPPORT Page Animations (`js/pages/it-support/`)

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| **HERO** | | | | |
| Split-flap character reveal | `setInterval` per char | 38ms interval, 12 flips/char | — | CHARSET cycling, pre-measured widths, staggered 55ms/char. Accent glow on settled "COSTS." |
| Noise flow field particles | Canvas RAF + bilinear noise | continuous | — | 180/90/40 per tier, 2D value noise grid (20px cells), angle drift 0.003/frame, trail fade (rgba 0.15 clear) |
| Blur->Sharp focus pull | CSS transition + ScrollTrigger | 0.6s opacity, 0.8s filter | power2.out | Panel starts blur(8px) + opacity 0 + y:20, classList.add('focused') after 200ms |
| Response bar fill | GSAP `to()` width:72% | 1.4s | expo.out | Delayed 0.8s after focus trigger |
| Ticket live timers | `setInterval` 1000ms | continuous | — | Parses data-seconds, formats MM:SS, P0 >300s = .overdue class |
| Scanline entry | GSAP `to()` `--scanline-opacity` | 0.4s | power2.out | At t=0.03 in entry timeline |
| Eyebrow fade in | GSAP `to()` opacity | 0.4s | power2.out | At t=0.15 |
| Body text | GSAP `to()` opacity + y | 0.5s | power2.out | At t=1.8 (after split-flap settles) |
| CTA buttons | GSAP `to()` opacity + y | 0.4s | power2.out | At t=2.1 |
| Hero pin exit | GSAP `to()` opacity + y | scrub | — | 120% end (desktop), 80% (mobile), fade+move at >0.7 progress |
| Ticket timers off-screen pause | IntersectionObserver 200px | — | — | Stops/resumes setInterval when hero leaves/enters viewport |
| **SLA STATS** | | | | |
| Card entry reveal | GSAP `to()` opacity + y | 0.5s, stagger 0.1 | power2.out | ScrollTrigger once at top 70%, cards gain .revealed class |
| Drum roll digits | GSAP `to()` translateY on .drum-column | 0.55-1.15s per place | power3.out | Right-to-left cascade at 0.05s interval. Duration increases 0.2s per digit place |
| Live uptime tick | `setInterval` 3600ms | 0.3s per digit | power2.out | After drums settle: increments 99.97% -> 99.98% -> ... caps at 100.00% |
| Top accent line draw | CSS transition scaleX 0->1 | 0.6s | expo | `.revealed::before` transition |
| **RESPONSE TIERS** | | | | |
| Card entry reveal | GSAP `to()` opacity + y | 0.5s, stagger 0.1 | power2.out | ScrollTrigger once at top 70% |
| Polygon morph hover | CSS `clip-path` transition | 0.4s | cubic-bezier(0.16,1,0.3,1) | rect -> parallelogram (P0 steeper angle) |
| Magnetic cursor field | `gsap.quickTo()` per card | 0.4s (follow) | power2.out | RAF-throttled, 14% strength, 380px falloff |
| Elastic return | GSAP `to()` x:0, y:0 | 0.8s | elastic.out(1,0.4) | On mouseleave and blur |
| **TEAM BENCH** | | | | |
| Card entry reveal | GSAP `to()` opacity + y | 0.5s, stagger 0.1 | power2.out | ScrollTrigger once at top 70% |
| 3D perspective flip | CSS `transform: rotateY(180deg)` | 0.6s | cubic-bezier(0.16,1,0.3,1) | perspective 1000px, preserve-3d, backface-visibility hidden |
| Keyboard flip toggle | JS keydown Enter/Space | instant | — | Toggles between 0deg and 180deg |
| Green dot pulse | CSS `@keyframes dot-pulse` | 1.5s | ease-in-out infinite | opacity 1->0.6->1, scale 1->0.85->1 |
| Hover border glow | CSS `border-color` transition | 0.2s | — | Front face gains accent-border on flip-card hover |
| Touch fallback | `@media (hover: none)` | — | — | Hides front face, shows back content always |
| Depth-of-field blur | CSS `filter: blur()` | static | — | 1px (high) / 0.5px (mid) blur on background canvases. Off on low and reduced-motion. |

### 4.15 — ABOUT Page Animations (`js/pages/about.js`) [NEW]

| Animation | Method | Duration | Easing | Details |
|-----------|--------|----------|--------|---------|
| **HERO** | | | | |
| Particle canvas animation | Canvas RAF requestAnimationFrame | continuous | linear | 60 dots with (x,y,r,dx,dy), edge bounce, connecting lines within 150px distance, accent blue 0.25 fill |
| Entry: eyebrow fade | GSAP `from()` opacity | 0.6s | expo.out | At t=0 with 0.2s delay |
| Entry: headline reveal | GSAP `from()` opacity + y + scale | 1.2s | expo.out | y:80, scale:0.95, starts -=0.3 after eyebrow |
| Entry: subtitle | GSAP `from()` opacity + y | 0.8s | expo.out | y:30, starts -=0.6 after headline |
| Entry: stat stagger | GSAP `from()` opacity + y | 0.8s, stagger 0.15s | expo.out | y:40, 3 stats animate sequentially, -=0.4 after subtitle |
| Stat counters | GSAP `fromTo()` textContent | 2.5s | power2.out | ScrollTrigger at top 90%, snap to integer/float per data-target |
| **MISSION** | | | | |
| Metric card reveal | GSAP `fromTo()` batch | 0.6s, stagger 0.08s | power2.out | ScrollTrigger top 88%, opacity+y, bidirectional onEnterBack |
| **VALUES** | | | | |
| Value card reveal | GSAP `fromTo()` batch | 0.6s, stagger 0.08s | power2.out | Same batch pattern as metrics |
| **APPROACH** | | | | |
| Approach card reveal | GSAP `fromTo()` batch | 0.6s, stagger 0.08s | power2.out | scale:0.97 added, same scroll trigger |
| **CINEMATIC DIVIDER** | | | | |
| Auto-scroll marquee | CSS `@keyframes cinema-scroll` | 24s linear infinite | — | Duplicated text span, translates -50% for seamless loop |

### 4.16 — Shared Layout System (`js/components/shared-layout.js`) [NEW]

| Feature | Details |
|---------|---------|
| **Navbar injection** | `document.body.insertAdjacentHTML('afterbegin', ...)` — injects full nav structure with brand, links, dropdown, mobile panel |
| **Footer injection** | `document.body.insertAdjacentHTML('beforeend', ...)` — injects full footer with brand, links, NOC status, sparkline canvas |
| **Root detection** | Auto-detects subpage via `window.location.pathname.includes('/services/')`, sets `ROOT` to `'..'` or `'.'` |
| **Pages using shared layout** | `index.html`, `about.html`, `msp.html`, `devops.html`, `cyber-security.html`, `it-support.html`, `staff-augmentation.html` — ALL pages |
| **Import pattern** | `import { injectLayout } from './components/shared-layout.js'; injectLayout();` — runs before any other imports |
| **Static HTML removed** | ~55-85 lines of nav + ~56-85 lines of footer removed from every page, replaced with `<!-- nav/footer injected by shared-layout.js -->` |

### 4.17 — Nav System (`js/components/nav.js`, `styles/components/nav.css`) [REWRITTEN]

| Feature | Details |
|---------|---------|
| **Selector** | `.nav` (was `#navbar`) — class-based to support single-page and subpage instances |
| **Active link detection** | `data-navlink` attributes: `home`, `services`, `about`, `contact`. Matches on `path.endsWith()` for page-level active state |
| **Active service highlight** | `data-service` attributes per dropdown item. Matches `href` filename against `path` |
| **CSS Grid layout** | `.nav-inner`: `grid-template-columns: 1fr auto 1fr` — brand (start), links (center), clock/CTA (end) |
| **Hamburger menu** | `.nav-hamburger` button, `.nav-mobile-panel` slide-in. Toggles via class `menu-open` on `.nav` |
| **Glass effect** | `backdrop-filter: blur(12px) saturate(180%)` with `-webkit-backdrop-filter` fallback |
| **Scroll state** | `.scrolled` class on scroll > 50px for stronger glass opacity |
| **Responsive breakpoints** | 1024px (narrower gap), 768px (hamburger visible, links hidden), 480px (tight padding, smaller font) |

---

## 5. Design System Reference

### 5.1 — Color Palette (`styles/tokens.css`) [UPDATED — 2026-06-14]

#### Background & Surface (Darkened)

| Token | Previous Value | Current Value | Delta |
|-------|---------------|---------------|-------|
| `--bg` | `#04080f` | **`#020508`** | Darker (less blue) |
| `--surface` | `#080d1a` | **`#070c16`** | Darker |
| `--panel` | `#0a1020` | **`#090e1c`** | Darker |

#### Accent System (Extended)

| Token | Previous Value | Current Value | Notes |
|-------|---------------|---------------|-------|
| `--accent` | `#00aaff` | `#00aaff` | Unchanged (primary blue) |
| `--accent-dim` | `rgba(0,170,255,0.15)` | **`rgba(0,170,255,0.12)`** | Reduced opacity |
| `--accent-glow` | `rgba(0,170,255,0.06)` | **`rgba(0,170,255,0.05)`** | Reduced opacity |
| `--accent-border` | `rgba(0,170,255,0.35)` | **`rgba(0,170,255,0.30)`** | Reduced opacity |
| `--accent-strong` | `rgba(0,170,255,0.6)` | `rgba(0,170,255,0.6)` | Unchanged |
| **`--accent-2`** | — | **`#ff6b00`** | NEW — orange accent |
| **`--accent-2-dim`** | — | **`rgba(255,107,0,0.12)`** | NEW — orange dim |
| **`--accent-3`** | — | **`#ff2d55`** | NEW — pink/red accent |
| **`--grid-line`** | — | **`rgba(255,255,255,0.035)`** | NEW — grid intersection base opacity |

#### Spacing (Compressed)

| Token | Previous | Current | Delta |
|-------|----------|---------|-------|
| `--sp` (section padding) | `clamp(80px,10vw,140px)` | **`clamp(56px,7vw,100px)`** | ~30% reduction |
| `--cw` (content width) | `1400px` | **`1280px`** | -120px |
| `--nh` (navbar height) | `64px` | **`56px`** | -8px |

#### Text Hierarchy

| Token | Value |
|-------|-------|
| `--t1` | `#e2e8f0` (unchanged) |
| `--t2` | `rgba(226,232,240,0.50)` (unchanged) |
| `--t3` | `rgba(226,232,240,0.25)` (unchanged) |

#### Border & Divider

| Token | Value |
|-------|-------|
| `--bh` | `rgba(255,255,255,0.06)` |
| `--bc` | `rgba(255,255,255,0.10)` |

### 5.2 — Typography (`styles/typography.css`) [UPDATED]

| Class | Previous Font Size | Current Font Size |
|-------|-------------------|-------------------|
| `.text-display` | `clamp(42px,7vw,96px)` | **`clamp(38px,6vw,80px)`** |
| `.text-title` | `clamp(36px,5.5vw,64px)` | **`clamp(28px,3.5vw,52px)`** |

**Font loading moved:** `@import url(...)` was removed from this file. Google Fonts are now loaded via `<link>` tags in `<head>` with `preconnect` + `preload` for faster parallel discovery.

### 5.3 — Component-Level Typography & Spacing [UPDATED]

| Component | Property | Previous | Current |
|-----------|----------|----------|---------|
| **Brand logo** (nav) | font-size | 20px | **16px** |
| **Nav links** (nav) | font-size | 12px | **11px** |
| **Nav indicator** | bottom | -10px | **-8px** |
| **Primary buttons** | padding | 13px 28px | **10px 20px** |
| **Primary buttons** | letter-spacing | 0.12em | **0.10em** |
| **Preloader title** | font-size | 18px | **16px** |
| **Preloader bar** | width | 240px | **200px** |
| **Preloader counter** | font-size | 10px | **9px** |
| **CTA .terminal** | max-width | 640px | **560px** |
| **CTA .term-body** | padding | 28px 32px 32px | **24px 28px 28px** |
| **CTA .cta-header** | max-width | 720px | **640px** |
| **CTA .cta-header** | margin-bottom | 56px | **40px** |
| **Footer** | padding-top | 80px | **40px** |
| **Footer bottom** | padding-bottom | 60px | **40px** |
| **Footer grid** | gap | 60px | **40px** |
| **Footer heading** | font-size | 16px | **14px** |

### 5.4 — Motion System

| Token | Value |
|-------|-------|
| `--dur-fast` | `0.2s` |
| `--dur-med` | `0.4s` |
| `--dur-slow` | `0.6s` |
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-power` | `cubic-bezier(0.65, 0, 0.35, 1)` |

---

## 6. Boot Sequences

### 6.1 — Homepage Boot Sequence [UPDATED]

The CSS loading strategy and GSAP ticker configuration have been updated. Below is the revised flow:

```
1. index.html <head> loads:
   ├── Google Fonts: preconnect (fonts.googleapis.com, fonts.gstatic.com) + preload as style
   ├── Google Fonts stylesheet <link> (display=swap for non-blocking)
   ├── Critical CSS (render-blocking by design):
   │   ├── styles/tokens.css
   │   ├── styles/reset.css
   │   └── styles/components/preloader.css
   └── Non-critical CSS (deferred via media="print" onload="this.media='all'"):
       ├── styles/typography.css, utilities.css, scrollbar.css
       ├── styles/components/nav.css, buttons.css, cards.css, terminal.css, cursor.css, status-bar.css
       ├── styles/sections/hero.css, services.css, process.css, soc.css, cta.css, footer.css
       └── <noscript> fallback with all non-critical CSS as normal <link> tags
   └── history.scrollRestoration = 'manual' + window.scrollTo(0,0)

2. body rendered (static HTML for SEO/accessibility)

3. CDN scripts loaded with defer (no parser blocking):
   ├── three.min.js, gsap.min.js + ScrollTrigger + ScrollToPlugin
   └── d3.min.js + topojson.min.js (moved from <head>)

4. js/main.js (type="module"):
   ├── GSAP tweaks: gsap.ticker.lagSmoothing(0) + low-memory → fps(30)
   ├── Registers ScrollTrigger + ScrollToPlugin + gsap.registerEffect(revealClip)
   ├── On window 'load' event:
   │   ├── safe(initPreloader):
   │   │   ├── Creates 24 SVG nodes + edges via setTimeout chain
   │   │   ├── Progress bar fills 0→100% over 1.4s (was 2.6s)
   │   │   ├── Node pulse at 100% (stagger 0.02s)
   │   │   ├── Implosion (0.5s): all nodes collapse to center
   │   │   ├── Return promise resolved → triggers post-preloader
   │   │   └── Preloader slides up (0.8s expo.in) → flash overlay
   │   │
   │   ├── safe(initStatusBar, 'statusBar')
   │   ├── safe(initGrid, 'grid') — proximity + breathing wave
   │   ├── safe(initNav, 'nav')
   │   ├── safe(initClock, 'clock')
   │   ├── safe(initCursor, 'cursor')
   │   ├── safe(initButtons, 'buttons')
   │   ├── safe(initHero, 'hero') — Three.js globe + entry + pin (tier-gated rendering)
   │   ├── safe(initServices, 'services') — horizontal scroll + depth + all 5 cards linked
   │   ├── safe(initSectionsProcess, 'process') — pipeline draw
   │   ├── safe(initSoc, 'soc') — D3 map + dashboard (no busy-wait pause)
   │   ├── safe(initCTA, 'cta') — ambient dots + form
   │   ├── safe(initFooter, 'footer') — sparkline + NOC
   │   ├── safe(initScrollIndicator, 'scrollIndicator')
   │   ├── safe(registerReveals, 'reveals')
   │   ├── safe(initTransitions, 'transitions')
   │   ├── ScrollTrigger.refresh()
   │   ├── window.addEventListener('resize', ...) — regenerates noise + repositions dots
   │   └── safe(auditPerformance, 'performance')
   └── Font load → ScrollTrigger.refresh() + scrollTo(0,0)
```

### 6.2 — Web Development Subpage Boot Sequence [REMOVED]

### 6.3 — MSP Subpage Boot Sequence

*(unchanged — see previous report version)*

### 6.4 — DevOps Subpage Boot Sequence [CORRECTED — matches actual code]

```
1. services/devops.html <head> loads:
   ├── Shared CSS (tokens → reset → typography → utilities → scrollbar)
   ├── Shared Component CSS (preloader → nav → buttons → cards → cursor → terminal)
   ├── Shared Section CSS (cta → footer)
   ├── Page-specific CSS (hero-devops → pipeline → stack-interop → zero-downtime)
   └── history.scrollRestoration = 'manual' + window.scrollTo(0,0)

2. body rendered (static HTML for SEO/accessibility)

3. CDN scripts: gsap, ScrollTrigger, ScrollToPlugin (NO three.js)

4. js/pages/devops/page-main.js executes (type="module"):
   ├── Registers ScrollTrigger + ScrollToPlugin immediately
   └── On window 'load' event (NOT DOMContentLoaded):
       ├── Guards against GSAP failure (graceful reveal fallback)
       ├── Checks sessionStorage for card transition flag
       │   └── Flag Present: Triggers 0.5s clip-path viewport expansion
       ├── safe(generateNoise, 'noise')
       ├── safe(initGrid, 'grid')
       ├── safe(initNav, 'nav')
       ├── safe(initClock, 'clock')
       ├── safe(initCursor, 'cursor')
       ├── safe(initButtons, 'buttons')
       ├── safe(initHeroDevops, 'hero-devops'):
       │   ├── initPipelineDashboard() — SCAN→STAGE→DEPLOY auto-cycle (12s per cycle)
       │   ├── initTerminalOutput() — 8-line typewriter loop
       │   ├── Entry choreography (scanline→eyebrow→headline→body→CTA)
       │   └── Hero pin (ScrollTrigger, pin, scrub:1, end:+=120%)
       └── setTimeout (100ms):
           ├── safe(initStackInterop, 'stack-interop') — orbit canvas with devicon logos
           ├── safe(initPipeline, 'pipeline') — 5-node track + scroll-scrubbed panel swap
           ├── safe(initZeroDowntime, 'zero-downtime') — animated SVG cards + power-on
           ├── safe(initCTA, 'cta') — ambient dots + form + devops handler
           ├── safe(initFooter, 'footer') — sparkline SVG, uptime, NOC rotator
           ├── safe(initScrollIndicator, 'scrollIndicator')
           ├── safe(registerReveals, 'reveals')
           ├── safe(initTransitions, 'transitions')
           └── document.fonts.ready:
               ├── ScrollTrigger.refresh()
               ├── window.scrollTo(0,0)
               └── safe(auditPerformance, 'performance')

### 6.5 — IT Support Subpage Boot Sequence [NEW]

```
1. services/it-support.html <head> loads:
   ├── Shared CSS (tokens → reset → typography → utilities → scrollbar)
   ├── Shared Component CSS (preloader → nav → buttons → cards → cursor → terminal)
   ├── Shared Section CSS (cta → footer)
   ├── Page-specific CSS (hero-itsupport → sla-stats → response-tiers → team-bench)
   └── history.scrollRestoration = 'manual' + window.scrollTo(0,0)

2. body rendered (static HTML)

3. CDN scripts: gsap, ScrollTrigger, ScrollToPlugin (NO three.js)

4. js/pages/it-support/page-main.js (type="module"):
   ├── Registers ScrollTrigger + ScrollToPlugin immediately
   └── On window 'load' event:
       ├── Guards against GSAP failure
       ├── Derives tier, isMobile, reducedMotion flags
       ├── safe(generateNoise, 'noise')
       ├── safe(initGrid, 'grid')
       ├── safe(initNav, 'nav')
       ├── safe(initClock, 'clock')
       ├── safe(initCursor, 'cursor')
       ├── safe(initButtons, 'buttons')
       ├── safe(initHeroItsupport, 'hero-itsupport'):
       │   ├── initSplitFlap() — builds char DOM, pre-measures widths
       │   ├── initNoiseFlowField() — 2D noise grid + particles
       │   ├── initFocusPull() — ScrollTrigger blur -> sharp
       │   ├── initTicketTimers() — live count-up
       │   └── initHeroEntry() — scanline -> eyebrow -> split-flap -> body -> CTA
       └── setTimeout (100ms):
           ├── safe(initSlaStats, 'sla-stats') — drum counters + live uptime
           ├── safe(initResponseTiers, 'response-tiers') — polygon morph + magnetic
           ├── safe(initTeamBench, 'team-bench') — 3D flip cards
           ├── safe(initCTA, 'cta') — shared terminal form + IT support submit override
           ├── safe(initFooter, 'footer')
           ├── safe(initScrollIndicator, 'scrollIndicator')
           ├── safe(registerReveals, 'reveals')
           ├── safe(initTransitions, 'transitions')
           ├── safe(initStatusBar, 'statusBar')
           └── document.fonts.ready:
               ├── ScrollTrigger.refresh()
               ├── window.scrollTo(0,0)
               └── safe(auditPerformance, 'performance')

   NOTE: No preloader, no Three.js
   NOTE: Identical boot pattern to devops page
```

   NOTE: No preloader — initPreloader() NOT imported, NOT called
   NOTE: Uses window 'load' event — matches MSP/WebDev
   NOTE: Three.js NOT loaded on this page
   NOTE: Scanline IS implemented via body::before + GSAP
   NOTE: preloader.css still in head (legacy — not used by JS)
```

### 6.6 — About Page Boot Sequence [NEW]

All pages (including About) now have `injectLayout()` as the first import to inject shared nav + footer via `js/components/shared-layout.js`.

```
1. about.html <head> loads:
   ├── Google Fonts via <link> with preconnect/preload
   ├── Shared CSS (tokens → reset → typography → utilities → scrollbar)
   ├── Shared Component CSS (nav → buttons → cursor)
   ├── Shared Section CSS (footer → cta → terminal)
   ├── Page-specific CSS (about.css)
   └── history.scrollRestoration = 'manual' + window.scrollTo(0,0)

2. body rendered with placeholder comments for nav/footer injection

3. CDN scripts: gsap, ScrollTrigger, ScrollToPlugin (NO three.js)

4. js/pages/about.js (type="module"):
   ├── import { injectLayout } from '../components/shared-layout.js'
   ├── injectLayout() — injects nav + footer body HTML
   ├── Registers ScrollTrigger + ScrollToPlugin immediately
   ├── GSAP tweaks: lagSmoothing(0) + low-memory → fps(30)
   └── On window 'load' event:
       ├── if (!gsap) return
       ├── CRITICAL: ensures all animated elements visible FIRST
       │   (sets opacity:1, transform:none, visibility:visible, clipPath:none)
       ├── Reduced motion: timeScale(1000), kill ScrollTrigger, init basics, return
       ├── safe(generateNoise, 'noise')
       ├── safe(initGrid, 'grid')
       ├── safe(initNav, 'nav')
       ├── safe(initClock, 'clock')
       ├── safe(initCursor, 'cursor')
       ├── safe(initButtons, 'buttons')
       ├── safe(initCTA, 'cta')
       ├── inline heroTl timeline (no ScrollTrigger in hero):
       │   eyebrow → headline → subtitle → stat stagger (no pin)
       ├── statsLoop() — GSAP fromTo textContent counters × 3
       ├── ScrollTrigger.batch for mission cards, values cards, approach cards
       ├── Hero particle canvas (60 dots, connecting lines, RAF loop)
       └── setTimeout (100ms):
           ├── safe(initFooter, 'footer')
           ├── safe(initScrollIndicator, 'scrollIndicator')
           ├── safe(registerReveals, 'reveals')
           ├── safe(initTransitions, 'transitions')
           └── document.fonts.ready:
               ├── ScrollTrigger.refresh()
               ├── window.scrollTo(0,0)
               └── safe(auditPerformance, 'performance')

   NOTE: No preloader, no three.js, no status bar
   NOTE: No hero pin — About page hero is a standard section (not pinned)
   NOTE: Uses explicit visibility guard before animations to prevent flash-of-hidden-content
   NOTE: Shared layout injection is synchronous (no async), runs before module body
```

---

## 7. Accessibility & UX Features [UPDATED]

| Feature | Implementation |
|---------|---------------|
| Skip link | `<a href="#main-content">Skip to main content</a>` on all pages |
| ARIA labels | All sections, buttons, inputs, live regions |
| `aria-live="polite"` | Clock, metric bar, NOC status, preloader, **status bar** |
| `role="list" / "listitem"` | Service cards, nav links, tech items |
| `prefers-reduced-motion` | GSAP globalTimeline.timeScale(1000), kills ScrollTrigger |
| Low-memory fallback | `navigator.deviceMemory ≤ 2` → hides canvas elements, GSAP capped at 30fps |
| **FPS tier system** | low=30fps, mid=40fps, high=60fps via `performance.js`; GSAP `lagSmoothing(0)` |
| Mobile fallback | `< 768px` → kills pinned ScrollTriggers, switches to vertical layouts |
| Touch cursor disable | `matchMedia('(hover: none)')` → skips custom cursor |
| SEO-friendly | Static HTML with all content, JS enhances only |
| Form validation | Client-side name+email required check, error shake animation |
| Scroll-to-top on refresh | `history.scrollRestoration='manual'` + `window.scrollTo(0,0)` |
| Services Navigation | "SERVICES" navbar item has hover dropdown listing all 5 services |
| Card-to-Page Transition | Clicked service card coordinates saved to sessionStorage for clip-path expansion |
| Full Responsiveness | Mobile-first CSS/JS across breakpoints (480px, 768px, 1024px, 1280px) |
| Status bar aria | Role `region` with `aria-label="System status"`, `aria-live="polite"` on clock |
| **Deferred CSS/JS** | Non-critical CSS loaded asynchronously via `media="print"`, CDN scripts deferred |
| **Font preloading** | Google Fonts loaded via `<link>` with preconnect/preload (no `@import`) |

---

## 8. Key Technical Patterns

### GSAP ScrollTrigger Architecture

- **Homepage Hero:** Pinned scroll with scrub-driven exit timeline. Pinned height reduced on mobile (200vh → 120vh). Metric bar exclusion removed from entry/exit.
- **Services:** Pinned scroll with scrub-driven horizontal x-translation + depth states. Killed on mobile (≤ 768px). Card navigation now links MSP and DevOps.
- **Process:** Multiple ScrollTriggers for SVG draw + node activation. Switches to vertical timeline on mobile.
- **SOC:** Single ScrollTrigger with `once:true` for dashboard entrance. 4-col → 3-col → 1-col responsive grid.
- **MSP Hero:** Pinned 120vh, scrub-driven exit timeline (headline→body/topology→metrics).
- **WebDev Hero:** Manual ScrollTrigger.create with onUpdate for mockup drift + canvas zoom + copy fade. Metric bar entirely removed.
- **DevOps Hero:** Pinned with scrub-driven exit (inner column). Entry via separate timeline with delays (not scrub-linked). **No metric bar.**
- **DevOps Pipeline:** Single master ScrollTrigger with scrub + `onUpdate` mapping progress→stage (0-4). **Far more efficient** than per-node triggers.
- **Zero-Downtime:** Individual ScrollTrigger per card + 1 title underline trigger + 3 per-SVG CSS play/pause triggers. toggleActions: "play none none reverse".

### Core System Responsiveness

*(unchanged — see previous report version)*

### Services Dropdown Navigation — Cross-Page Links [FULLY RESOLVED — SHARED LAYOUT]

All nav/dropdown links are now centrally managed in `js/components/shared-layout.js`. Every page uses the identical injected nav structure. The dropdown includes 5 services, plus the About link.

| From Page | About | MSP | DevOps | Cyber Sec | IT Support | Staff Aug |
|-----------|-------|-----|--------|-----------|-----------|----------|
| index.html | **about.html** | services/msp.html | services/devops.html | services/cyber-security.html | services/it-support.html | services/staff-augmentation.html |
| about.html | **active** | services/msp.html | services/devops.html | services/cyber-security.html | services/it-support.html | services/staff-augmentation.html |
| msp.html | about.html | **active** | devops.html | cyber-security.html | it-support.html | staff-augmentation.html |
| devops.html | about.html | msp.html | **active** | cyber-security.html | it-support.html | staff-augmentation.html |
| cyber-security.html | about.html | msp.html | devops.html | **active** | it-support.html | staff-augmentation.html |
| staff-augmentation.html | about.html | msp.html | devops.html | cyber-security.html | it-support.html | **active** |
| it-support.html | about.html | msp.html | devops.html | cyber-security.html | **active** | staff-augmentation.html |

All cross-page navigation links now managed via shared-layout.js. Active state detected automatically via `data-navlink` path matching. All 5 service pages (MSP, DevOps, Cyber Security, IT Support, Staff Augmentation) + About page live and linked.

---

## 9. Critical Analysis — Outstanding Issues & Inconsistencies [CORRECTED — many issues from earlier report were already fixed in the actual implementation]

### 9.1 — Critical

| # | Issue | Page(s) | File | Description |
|---|-------|---------|------|-------------|
| C1 | ~~Boot event mismatch~~ | **FIXED** | `page-main.js:31` | Uses `window.addEventListener('load', ...)` — matches MSP/WebDev. |
| C2 | ~~Missing preloader (spec mismatch)~~ | **NOT A BUG** | — | Preloader was never added to any subpage. Prompt.md spec was aspirational; actual implementation intentionally skips it. |
| C3 | ~~Pipeline node/card count mismatch~~ | **FIXED** | `pipeline.js` | Actual code uses 5 nodes + 5 detail panels. The old report described prompt.md's 6-node SVG design which was never built. |
| C4 | ~~Stack interop JS hover not implemented~~ | **CLEAN SLATE** | `stack-interop.js` | Completely redesigned: orbit canvas with hover connection line + tooltip + sibling dim (native Canvas API). Original "6-tile grid + CSS hover" design was replaced entirely. |

### 9.2 — High

| # | Issue | Page(s) | File | Description |
|---|-------|---------|------|-------------|
| H1 | ~~Missing scanline sweep entry~~ | **FIXED** | `hero-devops.js:90` | Scanline IS implemented: entry timeline sets `body::before` `--scanline-opacity` via GSAP `to()` at t=0.03s. |
| H2 | ~~Terminal typewriter timestamp drift~~ | **FIXED** | `hero-devops.js:228-286` | Actual terminal uses static log strings (no timestamps), so no drift issue. |
| H3 | Entry animation not scroll-linked | DevOps | `hero-devops.js:76-120` | Entry timeline (entryTl) plays on fixed delays while the hero pin is scrubbed independently. Entry speed is decoupled from user scroll — contrast with MSP/WebDev where entry is a fixed pre-scrub sequence. Minor — this is a design choice, not a bug. |
| H4 | ~~Cross-page DevOps link broken~~ | **FIXED** | `msp.html:58` | Dropdown "DEVOPS" links now connect correctly to `devops.html` (and "MSP" links to `msp.html`). |
| H5 | Section transitions incompatible | DevOps | Not in any file | `transitions.js` targets homepage section IDs (#hero, #services, #process, #soc, #cta). DevOps page uses custom IDs (#hero-devops, #pipeline, #stack, #zdt, #cta-devops, etc.) — transition zones will not activate between its sections. |
| H6 | **Preloader CSS loaded but unused on all subpages** | MSP, WebDev, DevOps | HTML head | All 3 subpages load `preloader.css` (2KB) but none use it. Minor bloat. `preloader.js` is NOT imported on DevOps (was removed), but IS on WebDev/MSP — dead import risk there. |

### 9.3 — Medium

| # | Issue | Page(s) | File | Description |
|---|-------|---------|------|-------------|
| M1 | ~~No `overflow: visible` on pipeline SVG~~ | **N/A** | `pipeline.css` | Pipeline uses HTML/CSS track + div nodes, not SVG. No overflow issue. |
| M2 | ~~Three.js loaded but unused~~ | **FIXED** | `devops.html` | Three.js is NOT loaded on the DevOps page. Only gsap + plugins are loaded. |
| M3 | ~~Metric counter precision inconsistency~~ | **N/A** | — | DevOps hero has no metric counters (no metric bar at all). Different design from prompt.md spec. |
| M4 | ~~7 ScrollTrigger instances on one section~~ | **FIXED** | `pipeline.js` | Uses a single master ScrollTrigger with `onUpdate` mapping progress→stage (0-4). Clean and performant. |
| M5 | **Missing page-transitions.css** | DevOps | `devops.html` | WebDev page includes `page-transitions.css` for entry transitions. DevOps page has no equivalent. |
| M6 | **Services.js `getTrack()` returns dynamic value** | Homepage | `services.js:31` | `container.scrollWidth - section.clientWidth + 80` can change on resize but ScrollTrigger `end` is recalculated via `invalidateOnRefresh: true`. Minor — `onUpdate` calls `applyDepth` every frame. |
| M7 | **Scanline texture always in DOM** | All pages | `styles/utilities.css` | The `body::before` scanline overlay is always present at z-index 9998. Invisible by default (`--scanline-opacity: 0`) but sits above most content, potentially blocking interaction if a JS error sets the variable. |
| M8 | **Status bar scroll listener never cleaned up** | Homepage | `status-bar.js:29-35` | Scroll listener added in `initStatusBar` runs perpetually. No cleanup on section navigation. |
| M9 | **Orbit canvas devicon CDN dependency** | DevOps | `stack-interop.js:76` | Devicons loaded from jsDelivr CDN. If CDN is slow/down, placeholder text shows (tool name truncated to 4 chars) — graceful but visually inconsistent. |
| M10 | **Duplicate GSAP ticker config** | Homepage | `main.js` + `performance.js` | `gsap.ticker.lagSmoothing(0)` applied in both files. `gsap.ticker.fps(30)` in main.js for low-memory independently of tier system. Both run — performance.js's tier config overrides. |
| M11 | ~~Cyber/IT Support pages not yet built~~ | **FIXED / SAFE** | `js/sections/services.js` | Map these subpage URLs to `null` so their homepage cards dynamically change to "COMING SOON" state and prevent 404 routing when clicked. |

### 9.4 — Low / Informational

| # | Issue | Page(s) | File | Description |
|---|-------|---------|------|-------------|
| L1 | **MSP contact form label inconsistency** | MSP | `msp.html:436` | Form labels use "Name" and "Email" (sentence case) while WebDev uses "NAME" and "EMAIL" (uppercase). DevOps uses "Name" and "Email" like MSP. |
| L2 | **Homepage metric bar completely removed** | Homepage | multiple | The metric bar (latency, threats, uptime, active nodes) was removed from hero.html/hero.js/index.html. Visual info replaced by status bar. |
| L3 | **Web Dev page metrics removed** | Web Dev | multiple | `hero-webdev-metrics` HTML+CSS+JS removed. "Avg Load Time / Lighthouse / CWV / Uptime" bar gone. |
| L4 | **Status bar and nav clock overlap** | Homepage | `status-bar.js`, `clock.js` | Both show live clock: status bar = HH:MM:SS, nav = "SYS HH:MM:SS". Intentional but duplicative. |
| L5 | **DevOps pipeline scroll-scrub fixed to 5 stages** | DevOps | `pipeline.js` | Master ScrollTrigger end: `+=250%` → progress 0→1 maps to stage 0-4. Scroll distance is always 250% regardless of viewport height — may feel fast/tall on different screens. |
| L6 | **Asset reorganization complete** | All pages | — | Root-level images moved to `assets/icons/` and `assets/images/`. Old files deleted from root. |
| L7 | **Font loading moved from @import to <link>** | All pages | `typography.css`, all HTML | `@import` removed from typography.css. Now uses HTML `<link>` with preconnect/preload per Lighthouse recommendations. |

---

## 10. Web Development Subpage — Cinematic UI Features [REMOVED]

The Web Development service page was removed from the project. The site now ships with 5 service pages.

---

## 11. DevOps Subpage — Cinematic UI Features [CORRECTED — actual implementation]

### 11.1 — Pipeline Dashboard Hero
- **Pipeline Dashboard** (right column): 5-row grid (BUILD, TEST, SCAN, STAGE, DEPLOY) with progress bars + stage state indicators + running counters
- SCAN stage auto-cycles: progress 0→65% over 8s → complete → STAGE active (3s) → DEPLOY active (3s) → RESET (2s) → repeat
- Terminal typewriter (bottom of dashboard): 8 deployment log lines, 18ms/char, 500ms line gap, 3s pause → restart
- **No canvas packet stream, no metric bar** — completely different from original prompt.md spec
- Hero pin: 120% scrub-driven exit

### 11.2 — Hero Entry Choreography
- Scanline texture fade-in (GSAP `--scanline-opacity`:1 at t=0.03s)
- Eyebrow slide-in (t=0.1s)
- Headline word-by-word stagger (DEPLOY, WITHOUT, FEAR. — each word split via regex on `<br>` and `<span>` boundaries)
- Accent underline draw on "FEAR." (CSS `--underline-scale` 0→1 via `::after` pseudo-element)
- Body text + CTA buttons stagger in
- **No scanline bar sweep** — uses CSS overlay opacity instead

### 11.3 — Orbit Canvas Stack (Stack Interoperability)
- Canvas 2D API orbit visualization: 3 dashed rings (r=96, 168, 240) with 13 devicon logos
- Center NEXUS node (filled circle, shadow glow, "NEXUS" monospace label)
- 3 ring groups: Docker/K8s/Terraform (inner), GitHub Actions/ArgoCD/Prometheus/Grafana (mid), AWS/GCP/Azure/Ansible/Vault/Nginx (outer)
- Rings auto-rotate at different speeds (0.008/0.005/0.003 rad/frame)
- Hover: connection line from center + tooltip + enlarge (18→26px) + sibling dim (0.2 alpha)
- Devicon SVGs preloaded from `cdn.jsdelivr.net/gh/devicons/devicon`
- Fallback: truncated text label if CDN fails
- Fade-in on scroll via GSAP + ScrollTrigger

### 11.4 — Pipeline Section (The Pipeline)
- Horizontal 5-node track: COMPILE, TEST, SCAN, STAGE, DEPLOY
- Background line + animated accent fill line (GSAP `scaleX` scrub)
- 12 connector dots (3 per segment) light progressively with stage
- Active node: CSS `@keyframes node-pulse` (box-shadow ring 0→8px→0, 1.4s)
- Detail panel below swaps via `hidden` attribute on scroll scrub (0→4 stages)
- Each panel: stage title + meta stats + terminal with typewriter command + 2 stat bars
- Single master ScrollTrigger (efficient), not per-node

### 11.5 — Infrastructure as Code (IaC) [REMOVED]

This section does not exist in the actual DevOps page. The DevOps page has 4 content sections: Hero, Pipeline, Stack Interop, ZDT + shared CTA.

### 11.6 — Zero-Downtime Protocol Cards
- 3 SVG-animated protocol cards (Blue-Green Swap, Canary Release, Instant Rollback)
- CSS `@keyframes` animated SVGs, played/paused via ScrollTrigger class toggle:
  - Blue-Green: traffic arrow shifts stroke-width 1→8 + label swap, 4s loop
  - Canary: canary-path thickens 1→4, 4s loop
  - Rollback: progress ring stroke-dashoffset 0→314→0 + stroke shift orange→pink→green, 4s loop
- Card entry: GSAP timeline (flash → icon slam → eyebrow clip → title → desc)
- Title underline accent draws left→right via ScrollTrigger
- Cards stagger 0.1s, bidirectional on scroll-up
- Hover: GSAP borderColor + backgroundColor transition
- 3-column grid (single column on mobile)

---

## 12. Performance Architecture [NEW]

### 12.1 — Tier System (`js/core/performance.js`)

The tier system categorizes devices and adjusts rendering complexity:

| Tier | Condition | FPS Target | Globe Depth Fade | Node Pulse | Data Packets | Grid Wave |
|------|-----------|-----------|-----------------|------------|-------------|-----------|
| **high** | Desktop, >4GB RAM, no reduced-motion | 60 | ✅ Full Z-depth per frame | ✅ Math.sin pulse | ✅ 30 comet packets | ✅ |
| **mid** | Tablet OR ≤4GB RAM OR reduced-motion | 40 | ❌ Skipped | ✅ (simplified) | ❌ Skipped | ✅ |
| **low** | Mobile OR ≤2GB RAM | 30 | ❌ Skipped | ❌ Static opacity | ❌ Skipped | ✅ (simplified) |

### 12.2 — GSAP Performance Configuration

| Setting | Location | Effect |
|---------|----------|--------|
| `gsap.ticker.lagSmoothing(0)` | `main.js:25` | Prevents GSAP from accelerating time to catch up after lag |
| `gsap.ticker.fps(30)` on low-memory | `main.js:27` | Caps GSAP tick rate for devices with ≤2GB RAM |
| `gsap.ticker.lagSmoothing(0)` | `performance.js:63` | Duplicate of main.js setting — runs again during auditPerformance() |
| Tier-change listener | `performance.js:68-72` | Dynamically updates fpsTarget when device conditions change |

### 12.3 — Hero Globe Rendering Budget

| Feature | Per-frame Cost | Saving on Mid/Low |
|---------|---------------|-------------------|
| Depth fade (18 lat + 24 lon lines) | ~1ms | Skipped on mid/low |
| Node pulse (55 Fibonacci nodes) | ~0.3ms | Skipped on low |
| Data packets (30 arcs × 4 objects) | ~0.5ms | Skipped on mid/low |
| Mouse parallax (RAF-throttled) | ~0.1ms | Same (already cheap) |

### 12.4 — CSS/JS Loading Performance

| Optimization | Before | After | Benefit |
|-------------|--------|-------|---------|
| Non-critical CSS | 17 synchronous `<link>` tags | 1 critical + 16 deferred via `media="print"` | Non-blocking first paint |
| CDN script loading | Blocking in `<head>` (D3/TopoJSON) + blocking before `</body>` | All `defer` | No parser blocking |
| Google Fonts | `@import` in typography.css | `<link>` with preconnect/preload | Parallel discovery during HTML parse |
| D3/TopoJSON location | `<head>` (render-blocking) | `<body>` footer with `defer` | Not blocking initial render |

---

## 13. Key Metrics [UPDATED]

| Metric | Value |
|--------|-------|
| Total HTML files | **7** (index.html + about.html + 5 service subpages) |
| Total CSS files | **41** (1 tokens + 1 reset + 1 typography + 1 utilities + 1 scrollbar + **7 components** + 6 sections + 5 web-dev + 4 msp + 5 devops + **4 cyber-security + 4 it-support + 1 about**) |
| Total JS modules | **46** (1 main + **7 core** + **6 components** + 6 homepage + 5 web-dev + 5 msp + 5 devops + **5 cyber-security + 5 it-support + 1 about**) |
| Service cards | 5 (MSP, DevOps, Cyber Security, IT Support, Staff Augmentation) |
| Active service pages | **5** (MSP, DevOps, Cyber Security, IT Support, Staff Augmentation) |
| **Asset files** | **7** (3 icons + 4 images in `assets/` subdirectories) |
| Process nodes (Homepage) | 5 (Discover, Design, Deploy, Monitor, Optimize) |
| Process nodes (Web Dev) | 6 (Discover, Architect, Build, Test, Deploy, Scale) |
| DevOps pipeline stages | 5 nodes + 5 panels (COMPILE, TEST, SCAN, STAGE, DEPLOY) — horizontal track + scroll-scrubbed detail swap |
| DevOps orbit canvas tools | 13 devicons (3 rings: Docker/K8s/Terraform + GitHub Actions/ArgoCD/Prometheus/Grafana + AWS/GCP/Azure/Ansible/Vault/Nginx) |
| SOC dashboard panels | 4 (Threat Map, Threat Overview, Vulnerability Score, Recent Incidents) |
| **Backend PHP files** | **5** (contact.php, config.php, validator.php, rate-limiter.php, mailer.php) |
| **Composer packages** | **1** (phpmailer/phpmailer v7.1.1) |
| **Security layers** | **5** (honeypot, CSRF token, IP rate limiting, input sanitization, CORS) |
| **Rate limit** | **3 requests per 15 minutes per IP** |
| **Form pages integrated** | **7** (index + 5 services + about) — honeypot + PAGE_ID + CSRF fetch on all |
| **New files created (backend)** | **12** (5 PHP + 2 .htaccess + .gitkeep + composer.json + composer.lock + .env.example + .gitignore) |
| Three.js globe radius | 4.2 world units |
| CTA ambient dots | 60 (shared between index and devops) |
| Footer NOC messages | 5 |
| Section transitions | 4 on homepage; NOT active on subpages (ID mismatch) |
| **Status bar z-index** | **2001** (above navbar) |
| **Grid breathing wave** | **10±2s interval, 1.2s diagonal sweep, 400px wave width** |
| **Design tokens** | **3 new: --accent-2, --accent-3, --grid-line** |
| **Spacing compression** | **--sp reduced by ~30%, --cw reduced by 120px, --nh reduced by 8px** |
| **Typography compression** | **.text-display max 96→80px, .text-title max 64→52px** |
| **Devops hero pipeline dashboard** | **5-row auto-cycle (SCAN→STAGE→DEPLOY → RESET, ~12s loop)** |
| **Devops orbit canvas** | **13 devicon logos, 3 rotating rings, Canvas 2D API** |
| **Devops IaC diff toggle** | **CODE VIEW (typewriter) / DIFF VIEW (git-style +/- toggle)** |
| **Devops IaC sparklines** | **3 Canvas random-walk lines (up/flat/up trends)** |
| **Devops ZDT SVG animations** | **3 CSS @keyframe loops (4s each), ScrollTrigger play/pause** |
| **FPS tiers** | **3 tiers: low=30, mid=40, high=60 — dynamic via performance.js** |
| **Preloader duration** | **1.4s (was 2.6s)** |
| **Taste preferences** | **7 (was 6) — new: cross-page verification** |
| **Cyber Security signature animations** | **11 v3 (replaced 8 v2)** — redaction-lift, telemetry graph, sensor dust + tracers, specular band, variable terminal, radar scope, forensic waveform, scrolling log, disconnect diagram, checklist draw, global light sweep |
| **Cyber Security defense canvas layers** | **Removed** — replaced by radar scope with 6 blips in 3 range bands, Canvas 2D API |
| **Cyber Security kill chain stages** | **5 nodes + 5 panels (RECON, DELIVERY, EXPLOIT, INTERCEPT, CONTAINED)** — unchanged from v2 |
| **Cyber Security incident response cards** | **3 (Detect & Triage, Contain & Eradicate, Recover & Harden)** — new v3 internals per card |
| **New shared core module** | **0** — `js/core/decrypt-text.js` removed in v3 (confirmed unused elsewhere) |
| **New CDN dependencies** | **0 across all pages** |
| **Cyber Security total v3 animations** | **11 core + 5 kept from v2** (pin exit, node pulse, track fill, panel swap, stat bars, terminal typewriter, depth-stack reveal, power-on seq, title underline, card hover) |
| **Shared layout system** | **All 7 pages** — `js/components/shared-layout.js` injects nav + footer everywhere. ~141 lines of nav + ~112 lines of footer HTML removed from each page. |
| **Nav rewrite** | **`.nav` class-based** (was `#navbar`). CSS Grid layout, `data-navlink` active detection, hamburger menu, responsive at 1024/768/480px. |
| **About page** | **New page**: hero with particle canvas + stat counters + 3 scroll sections + cinema divider + shared CTA. `about.html` + `about.css` + `about.js`. |
| **Terminal CSS unification** | **`.term-*` aliases** added alongside legacy `.terminal-*` selectors. Font size 13px→14px. |
| **Hero padding fixes** | **`padding-top: var(--nh)`** added to cyber-security, devops, and staff-augmentation hero sections. |
| **Nav logo matches footer** | Nav now uses `brand-icon@2x.png` (same as footer), `object-fit: cover`, `border-radius: 50%`, `opacity: 0.9`, `font-weight: 900`, `letter-spacing: -0.01em`, "EDGE" in `--brand-blue` (#00B0E0). |

---

## 14. Backend Architecture [NEW]

### 14.1 — Overview

A contact-form-to-email lead capture pipeline for all 7 pages. Users fill a form in any CTA section → JS POSTs JSON to a PHP endpoint → PHP validates, sanitizes, and sends a formatted email to the company inbox via PHPMailer + Hostinger SMTP.

**No database, no user auth, no CMS** — pure lead pipeline.

### 14.2 — Request Flow

```
User submits form → cta.js (fetch POST /api/contact.php)
  → CORS headers & OPTIONS preflight (204)
  → rate-limiter.php (3 req / 15 min per IP)
  → honeypot check (silent 200 if bot caught)
  → CSRF token verification (hash_equals)
  → validator.php (sanitize → validate all fields)
  → mailer.php (PHPMailer SMTP → Hostinger)
  → JSON response back to frontend
```

### 14.3 — API Endpoint

**`POST /api/contact.php`** — accepts JSON body with `name`, `email`, `message`, `page`, `_token`, `_honey`.

| HTTP | Scenario |
|------|----------|
| 200 | Email sent successfully |
| 200 (silent) | Bot caught by honeypot (no email sent, fake success) |
| 403 | CSRF token mismatch |
| 422 | Validation failed — returns all field errors at once |
| 429 | Rate limited (4th+ request within 15 min) |
| 500 | SMTP failure (error logged to `api/storage/mail_errors.log`) |

**`GET /api/contact.php?action=token`** — returns a CSRF token for the session.

### 14.4 — Security

| Layer | Implementation |
|-------|---------------|
| **Honeypot** | Hidden `_honey` input in every form (CSS: off-screen). Bots auto-fill it → silent 200, no email sent |
| **CSRF Token** | `bin2hex(random_bytes(32))` per session, verified via `hash_equals()`, fetched on page load |
| **Rate Limiting** | 3 submissions / 15 min / IP. File-based storage in `api/storage/rate-limits/` (NOT `/tmp/`). Supports Cloudflare (`CF-Connecting-IP`) and generic proxy (`X-Forwarded-For`) headers. Uses `flock(LOCK_EX)` for atomic read-check-write. Fails safe: allows request if storage unavailable. |
| **Input Sanitization** | `strip_tags()` + `htmlspecialchars()` + length truncation |
| **Email Validation** | `filter_var(FILTER_VALIDATE_EMAIL)` |
| **Page Whitelist** | `index, msp, devops, cyber-security, it-support, staff-augmentation, about` |
| **CORS** | Origin-locked to `https://edgenexus.io`, OPTIONS preflight handler |
| **.htaccess** | `Deny from all` on all PHP files, only `contact.php` re-allowed |

### 14.5 — Email Template

**Subject:** `[EdgeNexus Lead] {PageLabel} — {Name}`  
**Reply-To** set to the lead's email (clicking Reply goes directly to the client).

Email includes: Name, Email, Page, Timestamp, IP, Message body. Plaintext format for maximum deliverability.

### 14.6 — Frontend Integration

| File | Change |
|------|--------|
| `js/sections/cta.js` | CSRF token fetch on page load via `fetch(API_BASE + '?action=token')`. `API_BASE` resolved dynamically via `new URL('../../api/contact.php', import.meta.url)` — works in both local XAMPP subfolder and live root domain. Replaced fake Formspree POST with real `fetch()` to `/api/contact.php`. Page-specific deploy output (cyber-security shows audit sequence, all others show standard sequence). Uniform 5-line typewriter on all pages. Error handling via `btn--shake`. **All animations preserved unchanged.** |
| `js/main.js` + 6 page JS files | Added `const PAGE_ID = '{page}'` per page |
| All 7 HTML pages | Added `_honey` honeypot input to each CTA form |

### 14.7 — Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `api/contact.php` | ~130 | Main endpoint: CORS, routing, orchestration, error handling |
| `api/config.php` | ~40 | SMTP credentials (gitignored — placeholder values) |
| `api/validator.php` | ~85 | `sanitize_string()`, `validate_*()`, `validate_submission()` |
| `api/rate-limiter.php` | ~125 | IP-based rate limiting with file storage. Cloudflare + generic proxy support. Atomic `flock(LOCK_EX)` read-check-write. |
| `api/mailer.php` | ~85 | PHPMailer setup, email template, `send_lead_email()` |
| `api/.htaccess` | ~20 | Deny-all-except-contact access control |
| `api/storage/.htaccess` | 1 | Deny from all |
| `composer.json` | — | Requires `phpmailer/phpmailer ^7.1` |
| `.gitignore` | — | Updated with `vendor/`, `api/config.php`, `.env`, `api/storage/*` |
| `.env.example` | — | SMTP credential template |

### 14.8 — PHP Requirements

- PHP 8.1+ (cPanel: Software → PHP Selector)
- Extensions: `openssl`, `curl`, `mbstring` (cPanel: Extensions tab)
- PHPMailer v7.1.1 installed via Composer (`vendor/` must be uploaded to server)

### 14.9 — Manual Setup Required Before Going Live

1. **Set up Hostinger email password** at `hpanel.hostinger.com → Email Accounts` (use the one provided)
2. **Create `api/config.php` on the production server** with real credentials (do NOT upload the placeholder file)
3. **Upload `vendor/` to hosting** (or run `composer install` if SSH available)
4. **Set PHP version to 8.1+** and enable required extensions in cPanel

---

## Appendix A — Critical Fixes Needed (Priority Order) [UPDATED]

1. ~~**Fix cross-page DevOps links**~~ — **FIXED** Updated MSP and WebDev nav dropdowns to link DEVOPS directly to `devops.html` (and MSP to `msp.html`).
2. **Clean up preloader CSS on subpages** — All 4 subpages load `preloader.css` but none use it. Minor 2KB bloat. `preloader.js` is imported on WebDev and MSP but never called.
3. **Consider section transitions on subpages** — If transition atmosphere zones are desired on subpages, ID-matching logic in `transitions.js` needs updating (cyber-security page uses `#hero-cybersec`, `#perimeter`, `#killchain`, `#incident-response`, `#cta-cybersec`).
4. **Status bar scroll listener cleanup** — `initStatusBar` adds a scroll listener with no cleanup mechanism. Should support a teardown/cleanup for SPA-style page transitions.
5. **Resolve duplicate GSAP ticker config** — `main.js` and `performance.js` both call `gsap.ticker.lagSmoothing(0)`. `main.js` also applies `fps(30)` for low-memory independently of the tier system. Consolidate into one place.
6. ~~**Create Cyber Security and IT Support pages**~~ — **BOTH PAGES ARE LIVE.** Cyber Security at `services/cyber-security.html` with 11 v3 animations. IT Support at `services/it-support.html` with 6 section animations (split-flap, flow field, drum counters, magnetic field, 3D flip cards). All 5 service cards now navigate to live pages. No "COMING SOON" states remain.
7. ~~**Nav/footer duplication across pages**~~ — **FIXED via shared-layout.js.** All 7 pages now inject nav + footer from a single source of truth. ~300+ lines of duplicated HTML removed per page. Nav system rewritten from `#navbar` ID-based to `.nav` class-based with CSS Grid layout.
8. ~~**About page missing**~~ — **NOW LIVE.** `about.html` with full cinematic hero, mission/values/approach sections, particle canvas, stat counters, and shared CTA.
9. ~~**Hero padding missing on service pages**~~ — **FIXED.** Added `padding-top: var(--nh)` to cyber-security, devops, and staff-augmentation hero sections.
10. ~~**Terminal CSS selector inconsistency**~~ — **FIXED.** `.term-*` aliases added alongside legacy `.terminal-*` selectors for cross-page compatibility.
