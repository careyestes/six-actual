/**
 * Scroll journey — tune via prompts
 * ---------------------------------
 * The page does not scroll *down*; it scrolls *in*. Everything after the opening is a
 * single pinned viewport. Scroll position drives a master GSAP timeline whose unit is
 * arbitrary ("t"); `scrollPerUnit` converts it to viewport-heights of scrolling.
 *
 *   t 0 → 1.5   camera dives into the shield's "6" counterspace (heroDive.progress 0 → 1)
 *   t 1.1       green panel fades in over the (now green) canvas
 *   t 1.5       headline builds on the green
 *   t 4.0       headline zooms (and turns) into the "i" in "decides" → black → next scene
 *   …           each scene: approach → long sticky hold → pass through the viewer
 *   t 8.6 → 10.2 pitch exit: baseplate rises into a block, camera zooms into it
 *   t 13.0 → 14.4 why exit: zoom into the blinking cursor → final scene
 *
 * Prompt examples:
 *   "Make the dive into the 6 longer"       → raise `dive.end` and shift the rest later
 *   "Less scrolling between sections"       → lower `scrollPerUnit` (or shorten holds)
 *   "Longer sticky stops between sections"  → raise holds / `scrollPerUnit`
 *   "Scenes should arrive from further away" → lower `sceneIn.fromScale`
 */
export const journeyMotion = {
	/** Timeline length (units). Must cover the last scene's hold. */
	total: 16.8,
	/**
	 * Viewport-heights of scrolling per timeline unit. Higher = more physical scroll for the
	 * same animation, so each sticky hold feels longer.
	 */
	scrollPerUnit: 0.9,
	/** Seconds of scroll smoothing (ScrollTrigger scrub). */
	scrub: 0.9,
	/** The background grid scales 1 → 1 + gridZoom over the whole journey. */
	gridZoom: 2.6,

	dive: { at: 0, end: 1.5 },
	cueFade: { at: 0, duration: 0.25 },
	panelIn: { at: 1.1, duration: 0.45, ease: 'power1.inOut' },
	headline: {
		at: 1.55,
		duration: 0.6,
		stagger: 0.22,
		fromScale: 0.8,
		fromBlur: 10,
		ease: 'power3.out'
	},
	/**
	 * The diagram behind the headline: bars rise from the rule as the first line and the rule
	 * arrive; the net below fades in layer by layer with the second line.
	 */
	forecast: {
		bars: { at: 1.7, duration: 1.3, ease: 'power2.out' },
		net: { at: 2.1, duration: 1.1, ease: 'power1.inOut' }
	},
	/**
	 * Exit from the green headline: the text travels toward the screen, turns 90° counter-
	 * clockwise and focuses into the "i" in "decides" until the screen is black.
	 * Starts later so the finished headline holds before it leaves.
	 */
	heroOut: {
		at: 4.0,
		duration: 1.4,
		rotate: -90,
		/** Fraction of the zoom by which the rotation / re-centring are complete. */
		rotateBy: 0.85,
		alignBy: 0.75,
		/** The black layer fades in over the last fraction of the zoom. */
		voidFrom: 0.8,
		/** The site grid fades in over this fraction range of the zoom. */
		gridFrom: 0.3,
		gridTo: 0.85,
		/** How many viewport-heights the "i" stem should span at the end. */
		cover: 1.4
	},

	/**
	 * Scene order after the hero: Pitch, Why, Footer. `out: null` = stays.
	 * Pitch leaves differently: its green baseplate rises into a solid block and the camera
	 * pushes into it (`exit`), then Why arrives.
	 * Each scene holds for roughly 3 timeline units (~2.7 viewport-heights of scroll) before
	 * its exit starts, so it's harder to skip past a section.
	 */
	scenes: [
		{ in: 5.55, exit: { at: 8.6, duration: 1.6 } },
		// Why is green: it fills in quickly (no shrink-from-depth on the background) while the
		// green block is still on screen, and its text arrives a beat later.
		{
			in: 9.85,
			fadeIn: 0.3,
			fromScale: 1,
			itemDelay: 0.4,
			itemStagger: 0.07,
			// Exit: push into the blinking cursor until it fills the screen.
			zoom: { at: 13.0, duration: 1.4, cover: 1.15 }
		},
		// Last scene is the cursor's colour, so the zoom lands right in it.
		{ in: 14.2, out: null, fadeIn: 0.25, fromScale: 1, itemDelay: 0.3 }
	],
	sceneIn: {
		duration: 0.85,
		fromScale: 0.74,
		ease: 'power2.out',
		itemStagger: 0.13,
		itemDuration: 0.6,
		itemFromScale: 0.92,
		itemFromBlur: 8
	},
	sceneOut: { duration: 0.85, toScale: 1.5, ease: 'power2.in' },

	/** Safety release for the intro scroll-lock (seconds). */
	introLockTimeout: 10
};
