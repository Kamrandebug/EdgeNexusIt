# EdgeNexus IT — Hero Section Standardization Prompt
## Task: Unify hero layout, typography, spacing, and CTA alignment across all 8 pages

---

## CONTEXT

You are working inside `K:\EdgeNexusIt\` — a Vanilla JS ES Modules project with GSAP, Three.js, and Canvas 2D. Design tokens live in `styles/tokens.css`. All pages share a nav/footer via `js/components/shared-layout.js`.

**The reference standard is the Cyber Security page hero** (`services/cyber-security.html` + `styles/pages/cyber-security/hero-cybersec.css`). Its current visual output at desktop 1920×1080 represents the target layout — 2-column grid (copy left, canvas/panel right), full-viewport height, correct padding, correctly sized heading, correctly placed CTAs.

**Do NOT touch any canvas animation code, JS animation logic, GSAP timelines, or ScrollTrigger setups.** Only CSS and HTML structural attributes are in scope.

---

## OBJECTIVE

Apply a single consistent hero layout spec to all 8 pages:

| Page | Hero JS File | Hero CSS File |
|------|-------------|---------------|
| `index.html` | `js/sections/hero.js` | `styles/sections/hero.css` |
| `services/msp.html` | `js/pages/msp/hero-msp.js` | `styles/pages/msp/hero-msp.css` |
| `services/devops.html` | `js/pages/devops/hero-devops.js` | `styles/pages/devops/hero-devops.css` |
| `services/cyber-security.html` | `js/pages/cyber-security/hero-cybersec.js` | `styles/pages/cyber-security/hero-cybersec.css` |
| `services/it-support.html` | `js/pages/it-support/hero-itsupport.js` | `styles/pages/it-support/hero-itsupport.css` |
| `services/staff-augmentation.html` | `js/pages/staff-aug/hero-staffaug.js` | `styles/pages/staff-aug/hero-staffaug.css` |
| `services/ai-automation.html` | `js/pages/ai-automation/hero-ai.js` | `styles/pages/ai-automation/hero-ai.css` |
| `services/about.html` | `js/pages/about.js` | `styles/pages/about.css` |

---

## STEP 0 — READ FILES FIRST (mandatory before any edits)

Read these files in order before writing a single line:

1. `styles/tokens.css` — for `--nh`, `--sp`, `--cw`, `--accent`, `--t1`, `--t2`, `--t3` values
2. `styles/typography.css` — for `.text-display`, `.text-title` clamp values
3. `styles/components/buttons.css` — for `.btn`, `.btn-primary`, `.btn-ghost` specs
4. `styles/pages/cyber-security/hero-cybersec.css` — **the reference standard**
5. `services/cyber-security.html` — **the reference standard HTML structure**

Then read each target page's current hero CSS and HTML before editing it.

---

## THE STANDARD SPEC (derived from cyber-security hero)

### Hero Section Container

```css
/* The hero section wrapper */
.hero-[page] {
  min-height: 100vh;
  padding-top: var(--nh);          /* navbar clearance — REQUIRED on all subpages */
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
```

### Inner Content Grid (2-column: copy | visual panel)

```css
.hero-[page]-inner {
  width: 100%;
  max-width: var(--cw);            /* 1280px — from tokens */
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 60px);
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 50/50 default; cyber-sec uses 45fr 55fr */
  gap: clamp(40px, 5vw, 80px);
  align-items: center;
}
```

**Notes on column ratios:**
- Homepage globe: `grid-template-columns: 1fr 1fr` (or keep existing if it matches visual)
- Cyber-security: `45fr 55fr` (panel-heavy — use as reference)
- AI automation brain: `40fr 60fr` (brain-heavy — keep existing if working)
- IT support, DevOps, MSP, Staff-aug: `1fr 1fr` (equal split)
- About: full-width centered (no right panel — single column, centered text)

### Copy Column (left side)

```css
.hero-[page]-copy {
  display: flex;
  flex-direction: column;
  gap: 0;                          /* spacing controlled by child margins */
}
```

### Eyebrow / Pre-label

```css
.hero-[page]-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: clamp(10px, 1.1vw, 13px);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 20px;
  opacity: 0;                      /* GSAP animates this in — do not change */
}
```

### Headline

```css
.hero-[page]-headline {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(40px, 5.5vw, 72px);   /* THE STANDARD — match cyber-sec exactly */
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--t1);
  margin-bottom: 24px;
  /* Do NOT set opacity/visibility here — GSAP controls entry */
}

/* Accent word highlight (e.g. "REDUCED." or "FEAR.") */
.hero-[page]-headline .headline-accent,
.hero-[page]-headline span[class*="accent"] {
  color: var(--accent);
  text-shadow:
    0 0 20px rgba(0, 170, 255, 0.3),
    0 0 60px rgba(0, 170, 255, 0.15);
}
```

### Body / Subtitle Text

```css
.hero-[page]-body,
.hero-[page]-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(14px, 1.4vw, 17px);
  line-height: 1.65;
  color: var(--t2);
  max-width: 480px;
  margin-bottom: 36px;
  /* Do NOT set opacity here — GSAP controls */
}
```

### CTA Button Group

```css
.hero-[page]-cta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  /* Do NOT set opacity here — GSAP controls */
}

/* Buttons use global .btn .btn-primary and .btn .btn-ghost classes */
/* Do not override padding, font-size, or letter-spacing on hero buttons */
/* Only add hero-specific overrides if cyber-sec hero has them */
```

### Right Panel / Canvas Wrapper

```css
.hero-[page]-panel,
.hero-[page]-visual,
.hero-[page]-canvas-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;            /* default — adjust per page if needed */
  /* canvas inside should be width:100% height:100% */
}
```

---

## PER-PAGE INSTRUCTIONS

Work through each page in this order. Read the current CSS + HTML for each page before editing.

---

### PAGE 1 — `index.html` (Homepage Hero)

**Current panel:** Three.js globe (right side)
**Current heading:** "PREDICTIVE IT MANAGEMENT. / TOTAL BUSINESS CONTINUITY."

**Check and fix:**
1. Confirm `min-height: 100vh` on `.hero` section
2. Confirm headline `font-size: clamp(40px, 5.5vw, 72px)` — update if different
3. Confirm `font-weight: 800`, `line-height: 1.02`, `letter-spacing: -0.025em`
4. Confirm `.hero-inner` uses `max-width: var(--cw)` and the correct grid
5. Confirm `.hero-body` / `.hero-subtitle` max-width ≤ 480px, `clamp(14px, 1.4vw, 17px)` font-size
6. Confirm CTA buttons use standard `.btn` classes — no hero-level padding overrides
7. Confirm globe wrapper has no fixed pixel height that breaks on resize
8. Do NOT add `padding-top: var(--nh)` — homepage has preloader and handles its own offset

---

### PAGE 2 — `services/msp.html` (MSP Hero)

**Current panel:** SVG network topology (right side)
**Current heading:** "TOTAL BUSINESS / CONTINUITY. / YOUR NETWORK / NEVER SLEEPS."

**Check and fix:**
1. Confirm `padding-top: var(--nh)` exists on the hero section
2. Headline: `clamp(40px, 5.5vw, 72px)` / `font-weight: 800` / `line-height: 1.02` / `letter-spacing: -0.025em`
3. Eyebrow: DM Mono, `clamp(10px, 1.1vw, 13px)`, `letter-spacing: 0.18em`, `color: var(--accent)`, `margin-bottom: 20px`
4. Body text: `clamp(14px, 1.4vw, 17px)`, `max-width: 480px`, `margin-bottom: 36px`
5. CTA group: `display: flex; gap: 16px; align-items: center; flex-wrap: wrap`
6. Grid: `grid-template-columns: 1fr 1fr` with `gap: clamp(40px, 5vw, 80px)`
7. Hero section: `min-height: 100vh`, `display: flex`, `align-items: center`
8. Confirm `.headline-accent` on "SLEEPS." has the blue glow text-shadow

---

### PAGE 3 — `services/devops.html` (DevOps Hero)

**Current panel:** Pipeline dashboard terminal (right side)
**Current heading:** "DEPLOY WITHOUT FEAR."

**Check and fix:**
1. Confirm `padding-top: var(--nh)` on hero section
2. Headline: `clamp(40px, 5.5vw, 72px)` / `font-weight: 800` / `line-height: 1.02` / `letter-spacing: -0.025em`
3. Eyebrow "EDGENEXUS :: DEVOPS-OPS // BUILD 4,847 :: ALL CLEAR": DM Mono, same eyebrow spec
4. Body text spec same as standard
5. CTA group: `[INIT_DEPLOY ▶]` primary + `[./view_stack]` ghost — standard flex gap
6. Grid ratio: check current — keep `1fr 1fr` or adjust if pipeline panel needs more space
7. The pipeline panel right column: ensure it has defined height matching hero viewport

---

### PAGE 4 — `services/cyber-security.html` (Cyber Security Hero) — REFERENCE PAGE

**Do not edit this page.** It is the visual standard.
Read it to confirm the exact values then apply those values to all other pages.

Extract and note:
- The exact hero section selector and its padding/min-height
- The exact `.hero-cybersec-headline` font-size clamp
- The exact grid column ratio
- The exact `.hero-cybersec-body` max-width and font-size
- The exact gap between eyebrow → headline → body → CTA

---

### PAGE 5 — `services/it-support.html` (IT Support Hero)

**Current panel:** Live ticket board terminal (right side)
**Current heading:** "EVERY SECOND OFFLINE COSTS."

**Check and fix:**
1. `padding-top: var(--nh)` — verify present
2. Headline: split-flap characters must still animate, but the *final rendered size* of the headline container must match `clamp(40px, 5.5vw, 72px)` for each character. Check the split-flap char `.sf-char` width/height and adjust so the settled visual matches the standard headline height
3. If split-flap chars are sized in px (e.g. `width: 48px; height: 64px`), update to use `font-size: clamp(40px, 5.5vw, 72px)` with `width: 1ch; height: 1.05em` so they scale correctly
4. Body text and CTA: standard spec
5. Ensure flow-field canvas wrapper fills the right column without overflowing

---

### PAGE 6 — `services/staff-augmentation.html` (Staff Augmentation Hero)

**Current panel:** (check the actual file — may be stats or visual panel)
**Current heading:** (read from HTML)

**Check and fix:**
1. `padding-top: var(--nh)` — this was added in batch 9; confirm it is present
2. Apply full standard spec: headline size, eyebrow spec, body spec, CTA flex spec
3. Grid: `1fr 1fr` with standard gap and max-width

---

### PAGE 7 — `services/ai-automation.html` (AI Automation Hero)

**Current panel:** 3D brain hologram canvas (right, 60% width)
**Current heading:** "THINK. / AUTOMATE. / EVOLVE."

**Check and fix:**
1. Headline: `clamp(40px, 5.5vw, 72px)` per word line — if currently sized differently, update
2. The grid is `40fr 60fr` (copy:brain) — keep this ratio, do NOT change to 1fr 1fr
3. Eyebrow "EDGENEXUS AI": DM Mono spec
4. "EVOLVE." accent span: blue glow text-shadow
5. Body text: standard spec
6. CTA: `[DEPLOY AI]` primary + `[./view_stack]` ghost — standard flex
7. Ensure brain canvas wrapper has no fixed pixel height that breaks the layout

---

### PAGE 8 — `services/about.html` (About Hero)

**Current layout:** Full-width centered (no right panel)
**Current heading:** "ARCHITECTS OF INFRASTRUCTURE."

**The about hero is single-column centered — apply these modified rules:**

```css
.about-hero {
  min-height: 100vh;
  padding-top: var(--nh);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

.about-hero-inner {
  max-width: var(--cw);
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 60px);
  /* single column, centered */
}

.about-hero-headline {
  font-size: clamp(40px, 5.5vw, 72px);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--t1);
  margin-bottom: 24px;
}

.about-hero-subtitle {
  font-size: clamp(14px, 1.4vw, 17px);
  line-height: 1.65;
  color: var(--t2);
  max-width: 560px;          /* wider than 2-col pages since it's centered */
  margin: 0 auto 36px;
}

/* Stats row below subtitle */
.about-hero-stats {
  display: flex;
  justify-content: center;
  gap: clamp(32px, 5vw, 80px);
  flex-wrap: wrap;
}
```

---

## RESPONSIVE BREAKPOINTS (apply to ALL pages)

Add or update these breakpoints in each hero CSS file. Do not remove existing breakpoints — only add/fix the values shown below.

```css
/* ── 1024px — Tablet landscape ──────────────────────── */
@media (max-width: 1024px) {
  .hero-[page]-inner {
    gap: clamp(32px, 4vw, 56px);
  }
  .hero-[page]-headline {
    font-size: clamp(36px, 5vw, 60px);
  }
}

/* ── 900px — Start stacking ──────────────────────────── */
@media (max-width: 900px) {
  .hero-[page]-inner {
    grid-template-columns: 1fr;     /* stack to single column */
    text-align: left;
  }
  .hero-[page]-panel,
  .hero-[page]-visual,
  .hero-[page]-canvas-wrap {
    width: 100%;
    max-height: 340px;
    order: -1;                       /* panel goes above copy on tablet */
  }
}

/* ── 768px — Mobile ──────────────────────────────────── */
@media (max-width: 768px) {
  .hero-[page] {
    min-height: 100svh;              /* use svh for mobile chrome bar */
    padding-top: calc(var(--nh) + 8px);
  }
  .hero-[page]-inner {
    padding: 0 20px;
    gap: 24px;
  }
  .hero-[page]-headline {
    font-size: clamp(32px, 9vw, 48px);
    margin-bottom: 16px;
  }
  .hero-[page]-body,
  .hero-[page]-subtitle {
    font-size: 14px;
    margin-bottom: 28px;
  }
  .hero-[page]-cta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .hero-[page]-panel,
  .hero-[page]-visual {
    max-height: 260px;
  }
}

/* ── 480px — Small mobile ────────────────────────────── */
@media (max-width: 480px) {
  .hero-[page]-headline {
    font-size: clamp(28px, 8vw, 40px);
  }
  .hero-[page]-cta .btn {
    width: 100%;
    justify-content: center;
  }
}
```

---

## WHAT NOT TO TOUCH

- **Do NOT modify any JS animation files** (`hero-*.js`, `page-main.js`, etc.)
- **Do NOT change GSAP `fromTo()` / `set()` / `to()` calls**
- **Do NOT change ScrollTrigger pin configurations**
- **Do NOT change canvas drawing logic** (Three.js globe, brain hologram, hex grid, etc.)
- **Do NOT change entry animation timing or sequencing**
- **Do NOT change `opacity: 0` initial states** — GSAP depends on these
- **Do NOT change `clip-path` initial states** on headline words
- **Do NOT change `.headline-accent` text-shadow values** (they are already correct on cyber-sec)
- **Do NOT touch `styles/tokens.css`** — all tokens stay as-is
- **Do NOT touch `styles/typography.css`** — global text classes stay as-is
- **Do NOT touch `js/components/shared-layout.js`** — nav/footer injection stays as-is

---

## VERIFICATION CHECKLIST

After all edits, visually verify each page at 1920px, 1280px, 900px, and 375px:

| Check | All Pages |
|-------|-----------|
| Headline font-size matches cyber-security page visually | ✓ |
| No nav overlap — `padding-top: var(--nh)` present on all subpages | ✓ |
| CTA buttons are vertically aligned, same height as cyber-sec CTAs | ✓ |
| Right panel / canvas does not overflow or clip incorrectly | ✓ |
| Body text max-width does not exceed 480px (560px for about centered) | ✓ |
| At 900px: both columns stack, canvas goes above copy | ✓ |
| At 768px: full-width buttons or correct flex-column CTA | ✓ |
| No horizontal scroll at any breakpoint | ✓ |
| Eyebrow label spacing from headline is consistent across pages | ✓ |
| Canvas/Three.js globe still renders and animates correctly | ✓ |
| GSAP entry animations still fire correctly (elements start hidden, reveal on load) | ✓ |

---

## OUTPUT FORMAT

For each page, output:
1. The **updated hero CSS file** (complete file — no truncation)
2. Any **HTML structural changes** needed (only if a wrapper div is missing or misnamed — minimal HTML surgery)

Start with the reference page read (cyber-security), then proceed page by page.
