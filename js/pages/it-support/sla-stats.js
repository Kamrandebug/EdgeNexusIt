/**
 * sla-stats.js — Rolling Drum Counter
 *
 * Animations:
 *  1. Scroll-trigger card reveal + drum roll count-up
 *  2. Live uptime tick (99.97% -> increments 0.01% every ~3.6s)
 */

export function initSlaStats(reducedMotion = false) {

  const counters = document.querySelectorAll('.drum-counter');

  counters.forEach(buildDrum);

  ScrollTrigger.create({
    trigger: '#sla-stats',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to('.sla-stat-card', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1,
        onComplete: () => {
          document.querySelectorAll('.sla-stat-card').forEach(c => c.classList.add('revealed'));
        }
      });

      counters.forEach((counter, idx) => {
        startDrumRoll(counter, idx * 0.15);
      });
    }
  });

  /* ─── Build drum DOM ───────────────────────────────── */

  function buildDrum(counter) {
    const targetStr = counter.getAttribute('data-target'); // e.g. "9997"
    const suffix = counter.getAttribute('data-suffix') || '';
    const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
    const digitsEl = counter.querySelector('.drum-digits');
    if (!digitsEl) return;

    let digitChars;
    if (decimals > 0) {
      // e.g. 9997 with 2 decimals = "9997", display shows "99.97"
      const display = counter.getAttribute('data-display') || targetStr;
      digitChars = display.replace('.', '').split('');
    } else {
      digitChars = targetStr.split('');
    }

    digitChars.forEach((ch) => {
      const place = document.createElement('div');
      place.className = 'drum-place';
      const col = document.createElement('div');
      col.className = 'drum-column';
      // Create digits 0-9
      for (let d = 0; d <= 9; d++) {
        const item = document.createElement('span');
        item.className = 'drum-digit-item';
        item.textContent = d;
        col.appendChild(item);
      }
      place.appendChild(col);
      digitsEl.appendChild(place);
    });

    // Append suffix
    if (suffix) {
      const sufEl = document.createElement('span');
      sufEl.className = 'drum-suffix';
      sufEl.textContent = suffix;
      counter.appendChild(sufEl);
    }

    if (reducedMotion) {
      setDrumFinal(counter, targetStr, decimals);
    }
  }

  function setDrumFinal(counter, targetStr, decimals) {
    const places = counter.querySelectorAll('.drum-place');
    const digits = targetStr.split('');
    places.forEach((place, i) => {
      const col = place.querySelector('.drum-column');
      const digit = parseInt(digits[i] || '0', 10);
      col.style.transform = `translateY(-${digit * 1.1}em)`;
    });
  }

  /* ─── Drum roll animation ───────────────────────────── */

  function startDrumRoll(counter, delay) {
    const places = counter.querySelectorAll('.drum-place');
    const targetStr = counter.getAttribute('data-target') || '0';
    const digits = targetStr.split('');

    // Animate from rightmost digit first
    for (let i = places.length - 1; i >= 0; i--) {
      const place = places[i];
      const col = place.querySelector('.drum-column');
      const digit = parseInt(digits[i] || '0', 10);
      const placeFromRight = places.length - 1 - i;
      const duration = 0.55 + (placeFromRight * 0.2);
      const finalY = -digit * 1.1;

      gsap.to(col, {
        y: finalY + 'em',
        duration: duration,
        ease: 'power3.out',
        delay: delay + (places.length - 1 - i) * 0.05,
        overwrite: 'auto'
      });
    }
  }

  /* ─── Live uptime tick ─────────────────────────────── */

  const uptimeCounter = document.getElementById('drum-uptime');
  if (uptimeCounter && !reducedMotion) {
    // After drums settle, increment 0.01% every ~3.6s
    // Uptime data-target=9997, decimals=2, display=99.97
    // We need to tick the decimal parts
    setTimeout(() => {
      let uptimeValue = 9997; // hundredths of percent
      setInterval(() => {
        uptimeValue++;
        if (uptimeValue > 10000) uptimeValue = 9998; // cap and roll
        const str = String(uptimeValue).padStart(4, '0');
        const digits = str.split('');
        const places = uptimeCounter.querySelectorAll('.drum-place');
        places.forEach((place, i) => {
          const col = place.querySelector('.drum-column');
          const digit = parseInt(digits[i] || '0', 10);
          gsap.to(col, {
            y: -digit * 1.1 + 'em',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      }, 3600);
    }, 2000 + counters.length * 150); // after all drums settle
  }
}
