# code-style
- When deleting JS files, immediately clean up all import references to them — a single dead ES module import crashes the entire script silently, producing a blank page. Confidence: 0.85
- Before refactoring JS-driven reveal animations, check whether CSS sets the initial hidden state (opacity/transform/clipPath) that JS must explicitly override to make elements visible. Confidence: 0.80
- When a GSAP ScrollTrigger timeline uses gsap.from() for entrance animations, do NOT pre-hide those elements with gsap.set() — the from() tween handles initial state and pre-hiding breaks content visibility before the trigger fires. Confidence: 0.70
- Avoid mixing CSS reveal classes (e.g., reveal-clip) with GSAP timeline animations on the same element — the two systems fight over visibility and the element stays hidden. Confidence: 0.70
- When a top-level function references variables from a calling function's scope (e.g., a closure-scoped callback like doIsActive), those variables are NOT accessible — pass them as parameters instead. This silently produces ReferenceError at runtime. Confidence: 0.75
- When verifying changes across multiple similar pages, check all relevant sections (header, nav, footer) on every page — don't assume uniformity and miss a section on one page. Confidence: 0.70
- Check HTML files for duplicate/corrupted trailing content (e.g., script tags repeated after closing </html>) — file writes can corrupt the end of files, and this breaks page rendering silently. Confidence: 0.70
