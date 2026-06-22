# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/


# workflow
- When user references a markdown spec file (e.g., prompt.md, logo.md), read it and execute the structured tasks within — they prefer drafting task specs in markdown rather than inline instructions. Confidence: 0.75
- When the user explicitly references a single spec file, execute ONLY that file — do not also read and execute other adjacent spec files (e.g., don't read prompt.md when user only asked for card.md). Confidence: 0.70
- Ask for confirmation before executing irreversible or destructive operations (the user uses "Proceed" as their go-ahead signal). Confidence: 0.70

# code-style
- When deleting JS files, immediately clean up all import references to them — a single dead ES module import crashes the entire script silently, producing a blank page. Confidence: 0.85
- Before refactoring JS-driven reveal animations, check whether CSS sets the initial hidden state (opacity/transform/clipPath) that JS must explicitly override to make elements visible. Confidence: 0.80
- When a GSAP ScrollTrigger timeline uses gsap.from() for entrance animations, do NOT pre-hide those elements with gsap.set() — the from() tween handles initial state and pre-hiding breaks content visibility before the trigger fires. Confidence: 0.70
- Avoid mixing CSS reveal classes (e.g., reveal-clip) with GSAP timeline animations on the same element — the two systems fight over visibility and the element stays hidden. Confidence: 0.70
- When verifying changes across multiple similar pages, check all relevant sections (header, nav, footer) on every page — don't assume uniformity and miss a section on one page. Confidence: 0.70


