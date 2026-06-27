# PRODUCTION PROMPT — EdgeNexus IT: Fix report.md to Match Actual Codebase

## CONTEXT

You are working on the EdgeNexus IT project at `K:\EdgeNexusIt\`. The file `report.md` is the canonical reference document for the entire project. It currently contains **multiple factual errors** — wrong headlines, wrong counts, non-existent sections listed as real, and diagram boxes that don't match what is actually in the HTML/JS.

**Your task:** Rewrite every inaccurate section of `report.md` so it is a 100% faithful description of the actual codebase. Do NOT change anything that is already correct. Do NOT add features that don't exist. Every single diagram box, stat value, file path, section name, animation description, and config number must be sourced directly from the actual code files listed below.

**Do NOT invent, guess, or copy from the wrong section of the existing report. Read the source files to verify every claim.**

---

## VERIFIED FACTS FROM CODEBASE (use these as ground truth)

### ── DESIGN TOKENS (`styles/tokens.css`) ──
- `--bg: #020508` | `--surface: #070c16` | `--panel: #090e1c`
- `--accent: #00aaff` | `--brand-blue: #00B0E0` | `--brand-glow: #63FFFF`
- `--accent-2: #ff6b00` | `--accent-3: #ff2d55`
- Fonts: `--fd: 'Outfit'` | `--fm: 'DM Mono'` | `--fu: 'Barlow Condensed'`
- `--cw: 1280px` | `--nh: 56px`
- IT Support severity tokens: `--severity-p0: #ff2d55` / `--severity-p1: #ff6b00` / `--severity-p2: #00aaff` / `--severity-p3: rgba(226,232,240,0.35)`

### ── NAVBAR (from `js/components/shared-layout.js`) ──
Structure: `[brand-icon@2x.png] EDGE NEXUS IT` | HOME | SERVICES ▾ | ABOUT | [SYS HH:MM:SS clock] | [CONTACT btn]
Services dropdown (6 items): MSP | DEVOPS & CLOUD | CYBER SECURITY | IT SUPPORT | STAFF AUGMENTATION | AI AUTOMATION
Mobile panel: same 6 services as nav-mobile-link--sub items
No eyebrow text in navbar. Nav wordmark: `nav-wordmark-edge` (EDGE) + `nav-wordmark-nexus` (NEXUS IT)

### ── STATUS BAR (`js/components/status-bar.js` + `js/components/shared-layout.js`) ──
The status bar is a separate component. Footer NOC strip reads: `● LIVE | EDGE NODE PKT-9: ONLINE | CDN: 99.2% HIT RATE | THREAT SCAN: CLEAN`
Footer NOC status div: "ALL SYSTEMS NOMINAL"

---

### ── HOMEPAGE (`index.html`) ──

**HERO SECTION:**
- Headline (exact): `"Predictive IT Management.\nTotal Business Continuity."` — second line wrapped in `.hero-headline-accent`
- Eyebrow: `"EDGE INFRASTRUCTURE"`
- Body: `"Enterprise-grade networks. Zero-downtime architecture. Built for businesses that cannot afford to stop."`
- Typer: `#typer` element exists but the rotating typewriter logic is at the end of `hero.js` (function stub); no phrases array visible in hero.js — typer is set hidden/shown via GSAP only
- CTAs: `[DEPLOY NOW →]` (scrolls to `#cta`) | `[VIEW INFRASTRUCTURE]` (scrolls to `#services`)
- Canvas: `#hero-canvas` — Three.js WebGL globe

**GLOBE TIER-GATED COUNTS (from `js/sections/hero.js`):**
| Tier | Lat Lines | Lon Lines | Nodes | Packets | BG Particles |
|------|-----------|-----------|-------|---------|--------------|
| high | 18 | 24 | 55 | 30 | 80 |
| mid | 14 | 18 | 35 | 16 | 80 (enabled but…) |
| low | 10 | 12 | 18 | 6 | 0 |
| reducedMotion | 18 | 24 | 55 | 0 | 0 |

Note: `bgParticlesEnabled = true` on `mid` and `high`; `false` on `low` and reducedMotion. `partCount = 80` only when `bgParticlesEnabled === true`.

**HERO PIN:** Desktop only via `ScrollTrigger.matchMedia("(min-width: 1025px)")`, `end: '+=40%'`. No pin on tablet/mobile.

**SERVICES SECTION:**
- Heading: `"SIX STREAMS.\nONE NEXUS."` — eyebrow: `"OUR SERVICES"`
- Sub: `"Every service engineered to eliminate failure at scale."`
- 6 service cards with exact numbers and nav targets:
  - 01 MANAGED SERVICE PROVIDER → `services/msp.html`
  - 02 DEVOPS → `services/devops.html`
  - 03 CYBER SECURITY → `services/cyber-security.html`
  - 04 IT SUPPORT → `services/it-support.html`
  - 05 STAFF AUGMENTATION → `services/staff-augmentation.html`
  - 06 AI AUTOMATION → `services/ai-automation.html`
- Card 06 icon: center node (filled circle cx=16 cy=16) + 4 corner satellite circles (cx=6/26 cy=8/24) connected by dashed lines

**PROCESS SECTION:**
- Left sticky panel eyebrow: `"THE BLUEPRINT"`
- Left headline: `"STRATEGIC\nEXECUTION."`
- 5 pipeline nodes: `DISCOVER | DESIGN | DEPLOY | MONITOR | OPTIMIZE`
- 5 scrolling cards (right panel):
  - 01 / DISCOVERY — "Auditing current infrastructure."
  - 02 / DESIGN — "Engineering the roadmap."
  - 03 / DEPLOYMENT — "Execution with precision."
  - 04 / MONITORING — "Constant vigilance."
  - 05 / OPTIMIZATION — "Continuous improvement."

**SOC SECTION:**
- Eyebrow: `"THREAT INTELLIGENCE"` | Title: `"SECURITY OPERATIONS CENTER."`
- Threat data: `{ critical:8, high:12, medium:9, low:3, total:32 }` | `VULN_SCORE = 72`
- Attack origins: 🇺🇸 US 35% | 🇳🇱 Netherlands 18% | 🇷🇺 Russia 14% | 🇩🇪 Germany 11% | ● Other 22%
- Seed incidents: Brute Force Login (critical), Malware Detected (high), Unusual Access (medium), Phishing Attempt (low)
- 4 panels: Threat Map (D3 SVG + Canvas arcs) | Threat Overview (donut canvas) | Vulnerability Score (sparkline canvas, score=72) | Recent Incidents (live list)
- Vuln risk label at 72: "Medium Risk"
- Donut colors: Critical=#e05252 | High=#e07820 | Medium=#c8a820 | Low=#28a86a
- Target city for arcs: London [-0.5, 51.5]

**CTA SECTION:**
- Eyebrow: `"ESTABLISH LINK"` | Title: `"READY TO BUILD\nSOMETHING UNBREAKABLE?"`
- Form fields: `$ NAME:` / `$ EMAIL:` / `$ MESSAGE:` + honeypot `#_honey`
- Submit button: `"SEND MESSAGE"` | `data-page="index"`
- Deploy sequence (standard, non-cyber/non-AI): 5 lines:
  1. `[00:00] Connecting to NEXUS intake server...`
  2. `[00:01] Authenticating request... OK`
  3. `[00:02] Routing to team... ASSIGNED`
  4. `[00:03] SLA timer started: response within 4h`
  5. `[00:04] ✓ MESSAGE DEPLOYED. We'll be in touch.`

---

### ── MSP PAGE (`services/msp.html`) ──

**HERO:**
- ID: `#hero-msp`
- Headline (exact): `"NETWORKS\nTHAT NEVER SLEEPS."` — "SLEEPS." in `.headline-accent`
- Body: `"Observatory-grade managed services for mission-critical enterprise environments. We eliminate downtime through predictive orchestration and clinical precision."`
- CTAs: `[DEPLOY NOW →]` (href `#cta-msp`) | `[VIEW SLA]` (href `#sla`)
- Right panel: `<canvas id="network-canvas">` with label `"LIVE_TOPOLOGY_FEED_V4.2"`
  - Canvas 2D: Core→DC→Endpoint hierarchy with animated data packets (from `hero-msp.js`)
  - NO eyebrow text block in HTML
- Background: `.hero-scanlines` overlay (CSS)

**SECTION 2 — THE COVERAGE:**
- ID: `#coverage` | eyebrow: `"MSP Coverage Matrix"`
- Title: `"THE COVERAGE"` | sub: `"Six disciplines. One throat to choke. Zero gaps in your infrastructure perimeter."`
- Layout: asymmetric — 1 featured card + 2×2 mini grid + 1 full-width bottom bar
  - Featured (01): 24/7 Monitoring — `"Always Active ›"`
  - Mini 02: Patch Management
  - Mini 03: Incident Response
  - Mini 04: Backup & Recovery
  - Mini 05: Vendor Management
  - Bar 06 (full-width): Capacity Planning + "06 ›"
  - Live NOC strip (next to bar): `"All systems nominal · 847 endpoints monitored · 0 critical alerts"`

**SECTION 3 — SLA ARCHITECTURE:**
- ID: `#sla` | Title: `"SLA ARCHITECTURE"` | sub: `"Four-tier response framework..."`
- 4 tiers as horizontal bars (urgency-encoded widths: P1=8%, P2=25%, P3=55%, P4=100%):
  - P1 Critical — Immediate Containment — System Down — `< 15 MIN`
  - P2 High — Same Day Resolution — Degraded Service — `< 1 HOUR`
  - P3 Medium — Next Business Day — Partial Impact — `< 4 HOURS`
  - P4 Low — Scheduled Maintenance — Minor Impact — `< 24 HOURS`
- Stat strip: `99.98% Uptime SLA` (counter animated) | `24/7/365 NOC Coverage` | `< 8 MIN Avg P1 Response`

**SECTION 4 — GLOBAL NODE REACH (`#coverage-map`):**
- Title: `"GLOBAL NODE\nREACH"`
- Body: `"Our redundant backbone spans 42 global availability zones..."`
- Left: terminal block with 5 static lines (`SCANNING_BACKBONE... | US-EAST-01: ONLINE | EU-WEST-03: ONLINE | AS-PACIFIC-02: OPTIMIZING | SYS_HEALTH: 100.00%`)
- Right: map with pulse dots at hardcoded `top/left %` positions

**SECTION 5 — CTA (`#cta-msp`):**
- Shared CTA component | `data-page="msp"` on submit button | `"SEND MESSAGE"` label

---

### ── DEVOPS PAGE (`services/devops.html`) ──

**HERO (`#hero-devops`):**
- NO eyebrow text (HTML comment says `DEVOPS HERO EYEBROW REMOVED`)
- Headline (exact 3 lines): `"DEPLOY\nWITHOUT\nFEAR."` — "FEAR." in `.headline-accent`
- Body: `"Zero-drama deployments. Pipelines that self-heal. Infrastructure that provisions in minutes. We run the engine — you ship the product."`
- CTAs: `[INIT_DEPLOY ▶]` | `[./view_stack.sh]`
- Right panel: Pipeline Dashboard (`<div class="pipeline-dashboard-wrap">`)
  - Header: `"┌─ NEXUS_PIPELINE / BUILD #4847 ──────────────────────────────┐"`
  - 5 dashboard rows with exact statuses:
    | Stage | Status Icon | Time |
    |-------|-------------|------|
    | BUILD | ✓ | 1.8s |
    | TEST | ✓ | 12.4s |
    | SCAN | ▶ (active) | RUNNING... 0.0s (live counter) |
    | STAGE | ◌ (pending) | QUEUED |
    | DEPLOY | ◌ (pending) | QUEUED |
  - Footer stats: `● 3 NODES HEALTHY` | `◌ 0 ALERTS` | `↑ 99.97% UPTIME`
  - Terminal strip at bottom: `<div id="terminal-output">` — JS injects 9 `[OK] nexus@edge :: pipeline-daemon ::` lines
- Entry: scanline → headline word-stagger (expo.out, 3 words) → accent underline draw → body → CTAs
- Hero pin: `ScrollTrigger` scrub exit on `.hero-devops__inner`

**SECTION 2 — THE PIPELINE (`#pipeline`):**
- Title: `"THE PIPELINE"`
- 5 nodes: `COMPILE | TEST | SCAN | STAGE | DEPLOY`
- 12 connector dots (between nodes, 3 per segment)
- SVG background line + animated accent fill
- Panel stats per stage (exact from HTML):
  | Stage | Meta | Terminal cmd | Stat 1 | Stat 2 |
  |-------|------|-------------|--------|--------|
  | COMPILE | avg 1.8s · 4,200 runs/day · 0.0% fail | `nexus build --target=prod --parallel=8 --cache=warm` | CACHE HIT RATE 94% | PARALLEL WORKERS 80% |
  | TEST | avg 12s · 847 tests · 99.3% pass rate | `nexus test --suite=full --coverage --bail=false` | PASS RATE 99% | COVERAGE 87% |
  | SCAN | avg 6s · CVE: 0 critical · SBOM: clean | `nexus audit --depth=critical --sbom --license-check` | VULNERABILITIES 0% | LICENSE COMPLIANCE 100% |
  | STAGE | avg 45s · canary: 1% · observe: 300s | `nexus stage --env=canary --traffic=1% --observe=300s` | CANARY TRAFFIC 1% | ERROR BUDGET 98% |
  | DEPLOY | avg 0.8s · 840 runs/day · Zero downtime | `nexus deploy --strategy=blue-green --rollback=auto` | PROD REPLICATION 100% | AUTO-ROLLBACK ENABLED 100% |

**SECTION 3 — INTEGRATED STACK (`#stack`):**
- Title: `"INTEGRATED STACK"` | sub: `"13 TOOLS · 3 CLOUD PROVIDERS · 1 NEXUS"`
- Canvas: `#stack-orbit-canvas` — 3 rotating rings from `stack-interop.js`
- Ring speeds (from JS): Ring 0 = 0.008 rad/frame | Ring 1 = 0.005 | Ring 2 = 0.003
- 13 tools from JS: Ring 0 (r=96): DOCKER, KUBERNETES, TERRAFORM | Ring 1 (r=168): GITHUB ACTIONS, ARGOCD, PROMETHEUS, GRAFANA | Ring 2 (r=240): AWS, GCP, AZURE, ANSIBLE, VAULT, NGINX
- Center: NEXUS hub node

**⚠ SECTION 4 "IaC / Infrastructure as Code" — DOES NOT EXIST IN CODEBASE**
The report currently documents an "IaC" section with Terraform typewriter, CODE VIEW/DIFF VIEW toggle, and 3 metric sparkline cards. **This section does not exist in `services/devops.html` or any DevOps JS file.** Remove it entirely from the report. DevOps page has exactly 4 sections: HERO → PIPELINE → STACK → ZERO-DOWNTIME → CTA.

**SECTION 4 — ZERO DOWNTIME PROTOCOL (`#zdt`):**
- Title (exact HTML): `"ZERO / DOWNTIME."` (accent `/` between words)
- 3 cards:
  - 01 BLUE-GREEN SWAP — `"PARALLEL DEPLOY"` — "Switch production"
  - 02 CANARY RELEASE — `"GRADUAL ROLLOUT"` — "Expose 1% subset"
  - 03 INSTANT ROLLBACK — `"ONE-CLICK REVERT"` — "Fail-safe <90s"

**SECTION 5 — CTA (`#cta-devops`):**
- Title: `"READY TO\nNEVER PAGE AT 3AM AGAIN?"`
- `data-page="devops"` on submit button | Label: `"SEND MESSAGE"`
- Deploy sequence: standard 5-line sequence (NOT devops-specific)

---

### ── CYBER SECURITY PAGE (`services/cyber-security.html`) ──

**HERO (`#hero-cybersec`):**
- Background: `<canvas id="hero-noise-cs">` (grain texture, same noise.js)
- Headline (exact 4 words): `"YOUR ATTACK\nSURFACE,\nREDUCED."` — "REDUCED." in `.headline-accent`
- Body: `"Continuous exposure management — every endpoint, identity, and cloud workload mapped, monitored, and hardened before adversaries find an entry point."`
- CTAs: `[RUN EXPOSURE AUDIT ▶]` (id=`cs-cta-audit`) | `[./view_attack_surface]` (id=`cs-cta-surface`)
- Right panel: `#hero-surface-panel` — ATTACK SURFACE MAP (hex canvas)
  - Panel header: `"ATTACK SURFACE MAP · LIVE"` + `"SCANNING · 1,247 ENDPOINTS"`
  - Canvas: `#surface-hex-canvas`
  - Scanline sweep overlay: `.surface-scanline-sweep`
  - Legend: Clear | Low | Medium | High | Critical (5 levels)
  - Stat strip (4 items): `847 Exposure Vectors` | `3 Critical Active` | `99.7% Coverage` | `0.4s Avg Response`
- Entry: word-by-word headline stagger (`.hw` spans, 4 words) → rest of elements

**SECTION 2 — THE PERIMETER (`#perimeter`):**
- Eyebrow: `"SIX LAYERS. ZERO GAPS."` | Title: `"NOTHING UNWATCHED."`
- Canvas: `#perimeter-canvas` — radar scope with orbital defense rings
- 6 defense cards (grid below canvas):
  | Layer | Name | Stat |
  |-------|------|------|
  | 0 | IDENTITY & ACCESS | 847 ENDPOINTS MONITORED |
  | 1 | ENDPOINT DEFENSE | 0 OPEN PORTS |
  | 2 | NETWORK PERIMETER | 12 POLICIES ACTIVE |
  | 3 | CLOUD POSTURE | 99.8% COMPLIANT |
  | 4 | DATA PROTECTION | 3.2TB ENCRYPTED |
  | 5 | THREAT INTELLIGENCE | 1,204 IOCS ACTIVE |
- Tooltip: `#perimeter-tooltip` (appears on canvas node hover)

**SECTION 3 — THE KILL CHAIN (`#killchain`):**
- Eyebrow: `"WHERE ATTACKS DIE."` | Title: `"WHERE ATTACKS DIE."`
- 5-node track: `01 RECON | 02 DELIVERY | 03 EXPLOIT | 04 INTERCEPT | 05 CONTAINED`
- 12 connector dots between nodes (at hardcoded `left:` percentages: 22%, 27%, 32%, 47%, 52%, 57%, 64%, 69%, 74%, 81%, 86%, 91%)
- Stage 04 INTERCEPT has class `intercept-active` by default
- Detail panels per stage (exact meta text):
  - RECON: `"47K scans/day deflected · 0 ports exposed"` | cmd: `scan --log perimeter`
  - DELIVERY: `"99.8% phishing blocked at gateway"` | cmd: `tail mail-gateway.log`
  - EXPLOIT: `"0 successful exploits (90d)"` | cmd: `status exploit-attempts`
  - INTERCEPT: `"<200ms detection-to-block"` | cmd: `ids --last`
  - CONTAINED: `"100% incidents logged + forensics captured"` | cmd: `incident --export`
- Stats hidden (`display:none`) — only terminal typewriter is visible per panel

**SECTION 4 — INCIDENT RESPONSE (`#incident-response`):**
- Title: `"DETECT. CONTAIN. RECOVER."`
- 3 IR cards:
  - 01 DETECT & TRIAGE — `.log-panel` animated log feed — `"AUTOMATED ALERT"`
  - 02 CONTAIN & ERADICATE — `.disconnect-svg` SVG diagram — title not fully shown in excerpt
  - 03 RECOVER & REPORT — checklist draw animation

**SECTION 5 — CTA (`#cta-cybersec` — NOTE: element ID is `cta-cybersec` not `cta-cyber`):**
- Deploy sequence (cyber-specific 5 lines):
  1. `[00:00] Initializing asset discovery...`
  2. `[00:01] Mapping network perimeter...`
  3. `[00:02] Cross-referencing CVE database...`
  4. `[00:03] Compiling findings...`
  5. `[00:04] ✓ AUDIT_QUEUED :: report ETA 24h :: ref 0x8f3a`
- Submit label: `"REQUEST AUDIT"` (set by cta.js when `isCyberPage` detected)

---

### ── IT SUPPORT PAGE (`services/it-support.html`) ──

**HERO (`#hero-itsupport`):**
- Eyebrow: `"EDGENEXUS IT-SUPPORT"`
- Headline (split-flap chars): `"EVERY SECOND"` / `"OFFLINE"` / `"COSTS."` — 3 `.flap-line` spans with `data-text` attributes
- Body: `"Human-scale response. Machine-scale detection. Every ticket opened is a clock started — and we race it."`
- Right panel: `#itsupport-panel` — NEXUS_HELPDESK live ticket board
  - Canvas background: `#flow-field-canvas` (noise flow field)
  - Panel header: 3 dots + `"NEXUS_HELPDESK"` + `"● LIVE"`
  - 5 live ticket rows:
    | Sev | Type | Status | Timer |
    |----|------|--------|-------|
    | P1 | VPN ACCESS | OPEN | 4:03 |
    | P2 | NETWORK LATENCY | OPEN | 1:23 |
    | P2 | EMAIL SYNC | RESOLVED | 8:11 |
    | P0 | SERVER UNREACHABLE | OPEN | 0:48 |
    | P3 | PRINTER OFFLINE | QUEUED | 30:20 |
  - Footer bar: `"AVG FIRST RESPONSE"` | progress bar | `"18 MIN"`

**SECTION 2 — SLA STATS (`#sla-stats`):**
- Title: `"Numbers don't lie."`
- 4 drum-counter cards:
  - UPTIME SLA: `99.97%` (data-target=9997, decimals=2)
  - MEAN FIRST RESPONSE: `18 MIN` (data-target=18)
  - TICKETS RESOLVED THIS MONTH: `2847` (data-target=2847)
  - P1 SLA TARGET: `<4 HRS` (data-target=4, data-display="<4")

**SECTION 3 — RESPONSE TIERS (`#response-tiers`):**
- Title: `"Priority zero exists."`
- Sub: `"Not every ticket is equal. Our SLA tiers are engineered around how much downtime actually costs you."`
- 4 tier cards (P0, P1, P2, P3) — CSS polygon morph on hover + magnetic cursor field

**SECTION 4 — TEAM BENCH (`#team-bench`):**
- Eyebrow: `"THE BENCH"` | Title: `"Real humans. Real fast."`
- 4 flip cards (8 `.flip-card` divs = 4 cards × front+back):
  - NETWORK — `"Connectivity & Infrastructure"`
  - SYSTEMS — `"Servers & Operating Systems"`
  - SECURITY — `"Endpoint & Access Control"`
  - CLOUD — `"AWS, Azure & GCP"`
- Hint text on front: `"hover to meet the team →"`

**CTA (`#cta-itsupport` — check actual HTML ID):** `data-page="it-support"` | `"SEND MESSAGE"` label

---

### ── STAFF AUGMENTATION PAGE (`services/staff-augmentation.html`) ──

**HERO (`#hero-staffaug`):**
- Eyebrow: `"EDGENEXUS :: STAFF-AUG · TALENT_POOL ONLINE"`
- Headline: `"YOUR TEAM.\nDEPLOYED\nINSTANTLY."` — "INSTANTLY." in `.accent`
- Sub body text present
- CTAs: `[DEPLOY YOUR TEAM]` (data-scroll-to="#staffaug-contact") | second ghost button
- Right side: Three.js canvas (`#hero-canvas`)
  - Scene: 1 central hub (blue sphere r=0.35) + glow shell (r=0.55, opacity 0.08) + 6 orbital nodes (r=0.12) with connecting lines + 180 bg particles
  - Orbitals 0-2 rotate at +0.004 rad/frame | orbitals 3-5 at -0.002 rad/frame
- Metric badge (overlay): `"● LIVE | 1,240 ENGINEERS | AVAILABLE NOW"`
- Scroll indicator: `"SCROLL ↓"`

**⚠ SECTIONS THAT DO NOT EXIST — REMOVE FROM REPORT:**
- Vetting Pipeline section
- Engagement Model Cards section
- People-as-Nodes Topology Canvas (the actual canvas is orbital nodes, NOT a people-nodes topology)

**SECTION 2 — TALENT POOL (`#talent-pool`):**
- Eyebrow: `"02 TALENT POOL"`
- Title: `"500+ ENGINEERS.\nREADY TO DEPLOY."` (accent span)
- Sub: `"Pre-vetted. Battle-tested. Across every layer of the modern stack. Filter by discipline. Deploy in 48 hours."`
- Filter bar: `ALL | BACKEND | FRONTEND | DEVOPS | CLOUD | SECURITY | DATA/ML` (7 filters)
- Role cards grid (`data-discipline` attribute) — each card has: badge (discipline), status (● AVAILABLE), title, experience (e.g. "5+ YRS EXP"), 4 skill chips, rate (e.g. "FROM $88/HR"), REQUEST → button
- Card status: all show "● AVAILABLE" — no "Busy" cards in this page (Busy card is on About page experts section)

**CTA (`#staffaug-contact`):**
- Eyebrow: `"EDGENEXUS TALENT-REQUEST"`
- Title: `"READY TO ADD A\nSENIOR ENGINEER BY FRIDAY?"`
- Submit: `"SEND REQUEST"` | `data-page="staff-augmentation"`

---

### ── AI AUTOMATION PAGE (`services/ai-automation.html`) ──

**HERO (`#hero-ai`):**
- Layout: 2-col grid — `.hero-ai-copy` (left) | `.hero-ai-visual` (right)
- Eyebrow: `"EDGENEXUS AI"`
- Headline (3 `.headline-word` spans): `"THINK." | "AUTOMATE." | "EVOLVE."` — "EVOLVE." has `.headline-accent`
- Accent line: `.hero-ai-accent-line` (draws left→right via GSAP scaleX)
- Body: `"Intelligent automation that learns, adapts, and compounds. No scripts, no rigid rules — living AI systems that improve every cycle."`
- CTAs: `[DEPLOY AI]` (scrolls to `#cta-ai`) | `[./view_stack]` (scrolls to `#capabilities`)
- Right: `<canvas id="canvas-brain-particle">` + label `"NEURAL · HOLOGRAM"`

**BRAIN HOLOGRAM ANIMATION (from `js/pages/ai-automation/hero-ai.js`) — CORRECT FACTS:**
- Brain polygon: **28 points** in `BRAIN_SILHOUETTE` array (indices 0–27)
- Tier-gated particle counts: `high: 3200 | mid: 2000 | low: 1200`
- Algorithm: random sampling in normalized [-1,1]×[-1,1] space → ray-casting point-in-polygon → accepted inside brain
- Z-rotation: Y-axis rotation (`rotY += 0.008` approx) + mouse parallax (mouseX [-1,1])
- Color gradient (front→back depth mapping):
  - c1 = [232, 244, 255] (#e8f4ff, bright white-blue, front)
  - c2 = [96, 184, 255] (#60b8ff)
  - c3 = [26, 106, 255] (#1a6aff)
  - c4 = [10, 31, 92] (#0a1f5c, deep navy, back)
- Particle rendering: filled `fillRect` squares (variable size 0.8–6.5px based on Z-depth)
- Z-depth sorting: `Float32Array` for performance
- Projection base rings: 3 concentric pulsing ellipses at `holo_cy = cy + R * 1.05`
  - Ring radii: 3 entries from `rings[]` array, pulsing via `ringScale = 1 + 0.04 * Math.sin(time * 1.8)`
  - Color: `rgba(0, 180, 255, alpha * rp)` where rp = riseProgress
- Outer glow cone + inner bright cone from base
- Scan ring: ellipse rising from `holo_cy` to `cy - R` over 3.5s period
- Entry animation: `riseProgress` 0→1 over 1.8s (power2.out) — particles "rise" from base into brain positions
- GSAP entry timeline: scanline → visual fade-in → eyebrow clip → 3 headline words stagger (0.20s) → accentLine scaleX → body → ctas → label
- Hero pin: ScrollTrigger, desktop `end='+=120%'`, mobile `end='+=80%'`; fade out `.hero-ai-inner` opacity at progress > 0.70

**SECTION 2 — CAPABILITIES (`#capabilities`):**
- Eyebrow: `"THE INTELLIGENCE LAYER"`
- Title: `"Six systems. One orchestration layer.\nZero manual intervention."`
- 6 cards in 3×2 grid with `data-cap` attributes:
  | # | Title | Description summary |
  |-|------|------|
  | 01 | LLM INTEGRATION | Drop GPT-4, Claude, or custom fine-tuned models into workflows |
  | 02 | COMPUTER VISION | Real-time object detection, scene understanding, multi-modal transformers |
  | 03 | PREDICTIVE ANALYTICS | Forecast demand, detect anomalies, time-series transformers; SVG sparkline draw on hover |
  | 04 | NLP PIPELINE | Parse, classify, extract from unstructured text (tickets, emails, logs, contracts) |
  | 05 | WORKFLOW AUTOMATION | Orchestrate multi-step processes end-to-end |
  | 06 | AUTONOMOUS AGENTS | Self-directed AI agents, 24/7, pulsing dot ring hover effect |
- Magnetic hover: cards 01, 02, 06 (elastic.out quickTo)
- Card 02: conic-gradient iris expand on hover
- Card 03: SVG sparkline `stroke-dashoffset` draw on hover

**SECTION 3 — AUTOMATION FLOW (`#automation-flow`):**
- Eyebrow: `"THE AUTOMATION FLOW"`
- Title: `"ZERO HUMAN\nIN THE LOOP."`
- Sub: `"End-to-end intelligence: from raw signal to resolved action."`
- 5 nodes in `.flow-track`: `01 DATA IN | 02 AI PARSE | 03 DECISION | 04 ACTION | 05 VERIFY`
- SVG connecting line: `<rect class="flow-line-bg">` + `<rect class="flow-line-fill">` in a `viewBox="0 0 1000 2"` SVG
- Activation: sequential 300ms stagger, pulse glow on active node

**SECTION 4 — IMPACT METRICS (`#impact-metrics`):**
- Eyebrow: `"MEASURED. PUBLISHED. GUARANTEED."`
- Title: `"THE NUMBERS\nDON'T LIE."`
- 4 drum-counter cards:
  - 847M — TASKS AUTOMATED DAILY (data-target=847, suffix=M)
  - 0.3s — AVG DECISION LATENCY (data-target=03, suffix=s, decimals=1, display=0.3)
  - 97.3% — WORKFLOW ACCURACY (data-target=973, suffix=%, decimals=1, display=97.3)
  - 83% — COST REDUCTION (data-target=83, suffix=%)
- Live chart: `<canvas id="ai-activity-chart">` — 3-line oscilloscope
  - INFERENCE (blue #00aaff) | TRAINING (orange #ff6b00) | DEPLOYMENT (red #ff2d55)

**SECTION 5 — CTA (`#cta-ai`):**
- Title: `"READY TO\nAUTOMATE?"` — "AUTOMATE" in accent color
- Sub: `"Tell us what to eliminate. We'll build the agent."`
- Submit: `"DEPLOY AI"` | `data-page="ai-automation"`
- Deploy sequence (AI-specific 5 lines):
  1. `[00:00] WORKFLOW_INITIATING...`
  2. `[00:01] NEURAL_HANDSHAKE_COMPLETE`
  3. `[00:02] AUTOMATION_QUEUED`
  4. `[00:03] AGENT_ASSIGNED`
  5. `[00:04] ✓ DEPLOYMENT_SCHEDULED.`
- Page has `<div id="light-sweep">` at bottom (decorative)

---

### ── ABOUT PAGE (`services/about.html`) ──

**HERO (`#about-hero`):**
- Canvas: `#about-hero-canvas` (particle connecting-lines animation)
- 3 animated stat counters:
  - `847` — label: `"DAYS UPTIME"`
  - `12000` — label: `"NODES MANAGED"`
  - `99.97` — label: `"SLA PERCENT"`

**SECTION — MISSION (`#about-mission`):**
- Title: `"ZERO DOWNTIME.\nZERO COMPROMISE."` (accent span on "ZERO COMPROMISE.")
- 4 metric cards (static, not counters):
  - `14+` Years in production
  - `500+` Enterprise clients
  - `99.97%` Average SLA
  - `24/7` NOC operations

**SECTION — VALUES (`#about-values`):**
- Title: `"HOW WE OPERATE."` (accent on "OPERATE.")
- 4 horizontal-scroll carousel articles (`data-value-idx` 0–3):
  - 01 OBSERVABILITY FIRST
  - 02 DEFENSE IN DEPTH
  - 03 AUTOMATE EVERYTHING
  - 04 NO EGO. JUST UPTIME.
- GSAP pinned horizontal scroll with depth states (active/adjacent/far)

**⚠ SECTION "APPROACH" (Detect/Triage/Resolve/Optimize) — DOES NOT EXIST.** Was removed. Remove from report.

**SECTION — HIRE OUR EXPERTS (`#about-experts`):**
- 6 filter tabs: `All Roles | Cybersecurity | Cloud | Network | DevOps | Support`
- 6 expert cards (`data-category`, `data-status`):
  - Network Engineer (network, available)
  - DevOps & Cloud Architect (devops, available)
  - SOC Analyst Tier 2 (cybersecurity, available)
  - Cloud Infrastructure Engineer (cloud, **busy** — "Busy" orange badge)
  - IT Support Specialist L2/L3 (support, available)
  - Security Engineer (cybersecurity, available)
- All have empty `<img>` src with CSS monogram fallback
- "Hire Now" button on all cards (including Cloud Engineer's busy card — changed from "View Profile")
- Mobile: horizontal scroll with snap

**SECTION — CTA/CONTACT:** Uses shared CTA pattern | `data-page` not set (check actual HTML for CTA section)

---

### ── FILE TREE CORRECTIONS ──

**ADD to `assets/images/`:**
```
assets/images/brain-hologram.png  ← AI hologram reference image (exists on disk)
```

**REMOVE from JS file tree:**
```
js/core/decrypt-text.js  ← removed in cyber-security v3; file does not exist on disk
```

**Remove the `[REMOVED in v3 — unused]` note** and just omit the file entirely from the tree.

---

## WHAT TO FIX IN `report.md`

Make the following targeted corrections. Do NOT rewrite sections that are already correct. Use surgical edits:

### 1. Section 1 (Project Identity) — Tech Stack table
- Verify CDNs list: `three.min.js r128 | d3 7.8.5 | topojson 3.0.2 | gsap 3.12.2 + ScrollTrigger + ScrollToPlugin | Font Awesome 7.0.1`
- Add Font Awesome to CDN list if missing

### 2. Section 2 (File Structure)
- Add `assets/images/brain-hologram.png` to the assets tree
- Remove `js/core/decrypt-text.js` entry entirely

### 3. Section 3.1 (Homepage diagram)
- Fix hero headline to: `"Predictive IT Management.\nTotal Business Continuity."`
- Fix hero pin: Desktop `end: '+=40%'` (not 200vh). No pin on mobile/tablet.
- Fix globe counts table to match tier table above
- Fix services heading to `"SIX STREAMS.\nONE NEXUS."` (if wrong)
- Fix process node labels to: DISCOVER | DESIGN | DEPLOY | MONITOR | OPTIMIZE
- Fix SOC threat data to: critical=8, high=12, medium=9, low=3, total=32; vuln=72
- Fix SOC attack origins to: US 35% | Netherlands 18% | Russia 14% | Germany 11% | Other 22%
- Fix CTA deploy sequence to the 5-line standard sequence above

### 4. Section 3.3 (MSP page diagram)
- Fix headline to: `"NETWORKS\nTHAT NEVER SLEEPS."`
- Fix coverage section to correct asymmetric layout (featured + 2×2 mini + full-width bar)
- Fix coverage card titles to match actual: 24/7 Monitoring | Patch Management | Incident Response | Backup & Recovery | Vendor Management | Capacity Planning
- Fix SLA tiers to correct values: P1 <15MIN | P2 <1HR | P3 <4HRS | P4 <24HRS (with correct bar widths 8%/25%/55%/100%)
- Fix SLA stat strip: `99.98% Uptime SLA | 24/7/365 NOC Coverage | <8 MIN Avg P1 Response`

### 5. Section 3.4 (DevOps page diagram)
- Remove eyebrow — there is NONE (it was removed)
- Fix headline to exact 3-line: `"DEPLOY\nWITHOUT\nFEAR."`
- Fix CTA buttons: `[INIT_DEPLOY ▶]` | `[./view_stack.sh]`
- Fix dashboard header string (exact monospace chars)
- Fix terminal lines to the 9 `[OK] nexus@edge :: pipeline-daemon ::` lines
- Fix pipeline nodes to: COMPILE | TEST | SCAN | STAGE | DEPLOY
- Fix pipeline stage stats to match table above (meta text, cmd, stat labels, widths)
- **DELETE the entire IaC / Infrastructure as Code section (Section 4 in current report)** — it does not exist
- Renumber: STACK becomes Section 3, ZDT becomes Section 4, CTA becomes Section 5
- Fix ZDT title to exact: `"ZERO / DOWNTIME."` with `/` as accent

### 6. Section 3.5 (Cyber Security page diagram)
- Fix headline to: `"YOUR ATTACK\nSURFACE,\nREDUCED."` (4 `.hw` words)
- Fix right panel label to: `"ATTACK SURFACE MAP · LIVE"` scanning `1,247 ENDPOINTS`
- Fix stat strip: `847 Exposure Vectors | 3 Critical Active | 99.7% Coverage | 0.4s Avg Response`
- Fix legend: Clear | Low | Medium | High | Critical (5 levels, not 3)
- Fix section 2 to: NOTHING UNWATCHED (not NOTHING PASSES UNWATCHED or similar)
- Fix 6 defense card names+stats to match table above
- Fix kill chain nodes to: 01 RECON | 02 DELIVERY | 03 EXPLOIT | 04 INTERCEPT | 05 CONTAINED
- Fix kill chain stage meta text to exact values above
- Fix CTA deploy sequence to cyber-specific 5 lines
- Fix CTA submit label to `"REQUEST AUDIT"`

### 7. Section IT Support (add/fix wherever it is in the document)
- Fix headline to split-flap: `"EVERY SECOND" / "OFFLINE" / "COSTS."`
- Fix ticket board: 5 exact rows with P0/P1/P2/P2/P3 severities
- Fix SLA stats: 4 drum counters (99.97% / 18 MIN / 2847 / <4 HRS)
- Fix flip cards: 4 cards — NETWORK | SYSTEMS | SECURITY | CLOUD (not 3D CSS flip cards for "Network Engineer / DevOps Architect / SOC Analyst / Cloud Engineer / IT Support Spec / Security Engineer" — those are on the ABOUT page experts section)

### 8. Staff Augmentation page section
- Fix headline to: `"YOUR TEAM.\nDEPLOYED\nINSTANTLY."`
- Fix canvas description: Three.js scene — 1 hub + 6 orbital nodes + 180 bg particles (NOT "people-as-nodes topology" — that was the old version)
- Fix metric badge: `"1,240 ENGINEERS | AVAILABLE NOW"`
- **REMOVE vetting pipeline section** — does not exist
- **REMOVE engagement model cards section** — does not exist
- Fix Talent Pool: 7 filter buttons (ALL/BACKEND/FRONTEND/DEVOPS/CLOUD/SECURITY/DATA-ML), role card structure, no busy cards
- Fix CTA: `"READY TO ADD A SENIOR ENGINEER BY FRIDAY?"` | `"SEND REQUEST"` button

### 9. AI Automation page section
- Fix brain particle counts to: high=3200 / mid=2000 / low=1200
- Fix brain polygon to: **28 points** (not 26, not 27)
- Fix particle rendering to: `fillRect` squares (not circles)
- Fix color gradient: 4 stops from white-blue (#e8f4ff) to deep navy (#0a1f5c)
- Fix hero pin: desktop `+=120%`, mobile `+=80%`
- Fix GSAP entry timeline order: scanline → visual fade → eyebrow → 3 words (0.20s stagger) → accent line → body → ctas → label
- Fix capabilities card titles and descriptions to match exact text above
- Fix automation flow nodes: DATA IN | AI PARSE | DECISION | ACTION | VERIFY
- Fix metrics: 847M / 0.3s / 97.3% / 83%
- Fix CTA title: `"READY TO\nAUTOMATE?"` (not "READY TO\nDEPLOY AI?")
- Fix deploy sequence to AI-specific 5 lines

### 10. About page section
- Fix hero stats labels: `847 DAYS UPTIME | 12000 NODES MANAGED | 99.97 SLA PERCENT`
- Fix mission title to: `"ZERO DOWNTIME.\nZERO COMPROMISE."`
- Fix mission cards: 14+ Years / 500+ Clients / 99.97% SLA / 24/7 NOC
- Fix values: 4 cards — OBSERVABILITY FIRST | DEFENSE IN DEPTH | AUTOMATE EVERYTHING | NO EGO. JUST UPTIME.
- **REMOVE the "03 / APPROACH" section (Detect/Triage/Resolve/Optimize)** — was deleted
- Fix experts filter tabs: All Roles | Cybersecurity | Cloud | Network | DevOps | Support (6 tabs, note no "IT Support" tab — just "Support")
- Fix experts: 6 cards with correct names/categories/statuses

### 11. Change Log section
- Add entry for all corrections made in this pass
- Note that brain polygon is 28 points (batch 22 log incorrectly said 26)

---

## EXECUTION RULES

1. **Read source files before editing** — do not rely on the existing report for any factual claim. Cross-check against actual HTML/JS.
2. **Surgical edits only** — don't rewrite the whole report from scratch unless unavoidable. Find the wrong text, fix it.
3. **Keep all correct content** — the change log, backend documentation, CSS architecture, performance tier docs, and component docs are mostly accurate. Leave them.
4. **Diagram boxes** — update ASCII art diagrams in sections 3.1–3.x to match the actual page structure. Use the exact section IDs, heading text, and UI element labels from HTML.
5. **Do not add features that don't exist** — if a section/feature is in the report but not in the code, mark it REMOVED or delete it.
6. **Verify file counts** — update any "5 new JS files, 4 new CSS files" type statements if the actual count differs.
7. **Update the "Last Updated" date** in the report header to today's date after all fixes are applied.

---

## FILES TO READ (in order of priority)

```
index.html
services/msp.html
services/devops.html
services/cyber-security.html
services/it-support.html
services/staff-augmentation.html
services/ai-automation.html
services/about.html
js/components/shared-layout.js
js/sections/hero.js
js/sections/soc.js
js/sections/cta.js
js/pages/ai-automation/hero-ai.js
js/pages/ai-automation/capabilities.js
js/pages/ai-automation/automation-flow.js
js/pages/ai-automation/impact-metrics.js
js/pages/devops/hero-devops.js
js/pages/devops/pipeline.js
js/pages/devops/stack-interop.js
js/pages/devops/zero-downtime.js
js/pages/msp/hero-msp.js
js/pages/cyber-security/hero-cybersec.js
js/pages/it-support/hero-itsupport.js
js/pages/staff-augmentation/hero-staffaug.js
js/pages/about.js
styles/tokens.css
report.md  ← the file to fix
```

---

## DELIVERABLE

A corrected `report.md` with:
- Every diagram updated to match real HTML structure
- Every stat/count/value sourced from actual code
- Non-existent sections removed (IaC, Vetting Pipeline, Engagement Cards, Approach section)
- File tree corrected (add brain-hologram.png, remove decrypt-text.js)
- Change log updated with today's date entry listing all fixes made

