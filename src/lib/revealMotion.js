/**
 * Section reveal motion — tune via prompts
 * ----------------------------------------
 * Used by `reveal.js` (ScrollTrigger). Edit values here; do not hardcode
 * durations/easings inside section components.
 *
 * Prompt examples:
 *   "Make section reveals slower and softer"
 *   "Increase stagger between eyebrow and body"
 *   "Start reveals earlier (more of the section in view)"
 */

export const revealMotion = {
	/** ScrollTrigger start: "triggerPos viewportPos" */
	start: 'top 82%',
	/** Optional end — unused when once:true */
	end: 'bottom top',
	/** Play once when entering */
	once: true,
	/** Per-element duration (seconds) */
	duration: 0.95,
	/** GSAP ease */
	ease: 'power3.out',
	/** Stagger between sibling reveal targets (seconds) */
	stagger: 0.12,
	/** Initial Y offset in px */
	fromY: 36,
	/** Slight blur on enter (0 = off) */
	fromBlur: 6,
	/** Selector for staggered children inside the trigger node */
	childSelector:
		'.line, .eyebrow, .body, h2, .meta, [class*="reveal-delay"], [data-reveal]'
};
