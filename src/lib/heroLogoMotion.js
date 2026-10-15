/**
 * Hero 3D mark — GSAP timeline options (pick one)
 * -----------------------------------------------
 * Switch with URL:  ?hero=A  |  ?hero=B  |  ?hero=C
 * Or set `activeHeroOption` below.
 *
 * All options are faster than the previous open and avoid “block chunk” fill
 * by using a different assemble strategy.
 */

/** @typedef {'A' | 'B' | 'C'} HeroOptionId */
/** @typedef {{ x?: number, y?: number, z?: number, rotateX?: number, rotateY?: number, rotateZ?: number, scale?: number }} Pose */

/**
 * @typedef {object} HeroOption
 * @property {HeroOptionId} id
 * @property {string} name
 * @property {string} summary
 * @property {'opacity' | 'scatter' | 'bottomUp'} assemble
 * @property {number} blank
 * @property {{ duration: number, ease: string, fromYFactor: number, fadeEase: string, fadeDuration: number, fromYSign?: number, fromZ?: number, diveZ?: number, diveDuration?: number, seatDuration?: number, seatEase?: string }} rise
 * @property {{ duration: number, ease: string, from: Required<Pick<Pose,'rotateX'|'rotateY'|'rotateZ'|'scale'>>, to: Required<Pick<Pose,'rotateX'|'rotateY'|'rotateZ'|'scale'>> }} spin
 * @property {{ duration?: number, ease?: string, glowPeak?: number, corePeak?: number, innerRadiusFactor?: number, laserSix?: { at: string, duration: number, ease: string, glowPeak: number, corePeak: number }, laserBox?: { at: string, duration: number, ease: string, glowPeak: number, corePeak: number } }} wire
 * @property {{ at: string, duration: number, ease: string, to: Required<Pick<Pose,'rotateX'|'rotateY'|'rotateZ'|'scale'>>, wireRestAt: string, wireRestDuration: number, wireRestGlow: number, wireRestCore: number, impactAt?: string, impactGlow?: number, impactCore?: number }} fill
 * @property {{ fromZ: number, toZ: number, fromY: number, toY: number, duration: number, ease: string }} [camera]
 * @property {{ at?: string, duration?: number, ease?: string, peak?: number, energyPeak?: number, rest?: number, energyRest?: number, restAt?: string, restDuration?: number }} [aura]
 * @property {import('$lib/heroWordmark.js').WordmarkConfig} [text]
 */

/** @type {Record<HeroOptionId, HeroOption>} */
export const heroOptions = {
	/**
	 * A — Wire draws, then the solid fades in as a whole (no triangle chunks).
	 * Feels like a neon line-art mark that “inks” solid.
	 */
	A: {
		id: 'A',
		name: 'Wire soft fill',
		summary:
			'Edges draw while rising; solid fades in as one piece (no polygon chunks). Clean, premium, fast.',
		assemble: 'opacity',
		blank: 0.2,
		rise: {
			duration: 2.2,
			ease: 'power2.out',
			fromYFactor: 1.35,
			fadeEase: 'power2.out',
			fadeDuration: 1.0
		},
		spin: {
			duration: 2.2,
			ease: 'power3.out',
			from: { rotateX: 0.05, rotateY: -Math.PI * 2, rotateZ: 0.02, scale: 1.03 },
			to: { rotateX: 0.01, rotateY: 0.06, rotateZ: 0, scale: 1.01 }
		},
		wire: {
			duration: 2.0,
			ease: 'power1.inOut',
			glowPeak: 1,
			corePeak: 0.9
		},
		fill: {
			at: 'rise+=1.1',
			duration: 1.1,
			ease: 'power2.out',
			to: { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 },
			wireRestAt: 'fill+=0.35',
			wireRestDuration: 0.7,
			wireRestGlow: 0.28,
			wireRestCore: 0.12
		}
	},

	/**
	 * B — DEFAULT. Lasers the inner "6" outline first, then the surrounding
	 * box/shield assembles from flying fragments while the mark rises & spins.
	 * Emphatic + chaotic but purposeful, ~4.5s, decelerates to a smooth stop.
	 */
	B: {
		id: 'B',
		name: 'Depth-dive laser shield',
		summary:
			'Shield hurls in from near the viewer (high Z), plunges down into the surface and seats; laser-6 → box → fragments, with a camera dolly for parallax. ~4.5s, impact flash, smooth follow-through stop.',
		assemble: 'scatter',
		blank: 0.1,
		rise: {
			duration: 2.9,
			ease: 'power2.out',
			fromYFactor: 0.75, // start this far ABOVE center (fromYSign: 1) and come down
			fromYSign: 1,
			fadeEase: 'power1.out',
			fadeDuration: 0.5,
			fromZ: 3.8, // start close to the camera (big / in-your-face)
			diveZ: -0.4, // plunge past the surface plane…
			diveDuration: 2.1,
			seatDuration: 0.85, // …then seat flush (follow-through, no pop)
			seatEase: 'power2.inOut'
		},
		spin: {
			duration: 2.2,
			ease: 'power3.out',
			// Subtle turn + downward pitch so the FACE stays readable while the 6 lasers.
			// (Depth dive is the hero move now, not a big spin.)
			from: { rotateX: 0.3, rotateY: -0.7, rotateZ: 0.05, scale: 1.24 },
			to: { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 }
		},
		// Subtle camera dolly in — parallax depth without fighting the near-camera bigness.
		camera: { fromZ: 4.95, toZ: 4.6, fromY: 0.18, toY: 0.05, duration: 2.9, ease: 'power2.out' },
		// Two-stage laser: "6" alone first, then box — fill starts after both.
		wire: {
			innerRadiusFactor: 0.68,
			laserSix: { at: 'rise+=0.1', duration: 1.1, ease: 'power2.inOut', glowPeak: 1.4, corePeak: 1 },
			laserBox: { at: 'rise+=1.3', duration: 0.9, ease: 'power2.out', glowPeak: 1.15, corePeak: 0.85 }
		},
		fill: {
			at: 'rise+=2.0',
			duration: 2.0,
			ease: 'power2.out',
			to: { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 },
			// Glow pops as the shield slams into the surface, then rests.
			impactAt: 'rise+=2.55',
			impactGlow: 1.5,
			impactCore: 1.1,
			wireRestAt: 'fill+=1.3',
			wireRestDuration: 0.9,
			wireRestGlow: 0.24,
			wireRestCore: 0.1
		},
		// Construction lines (see heroAura.js): angles come from the 6's own edges, spawned
		// by the laser / fragment build. `energy` only drives the extra ambient lines.
		aura: {
			at: 'rise',
			duration: 0.5,
			ease: 'power2.out',
			peak: 1,
			energyPeak: 1,
			rest: 0.6,
			energyRest: 0.05,
			restAt: 'fill+=0.9',
			restDuration: 1.4
		},
		// Wordmark (SIX ACTUAL / A.I. // INTEL.) under the shield. Builds itself like the
		// shield — outline traced, fragments assemble, flash — starting at the 'seat' label,
		// the moment the shield pushes back toward the camera (the lines halt there too).
		text: {
			at: 'seat',
			depth: 0.05,
			slide: 0.1,
			slideDuration: 1.0,
			lineStagger: 0.45,
			wireDuration: 1.0,
			fillDelay: 0.4,
			fillDuration: 1.3,
			wireGlowPeak: 1.1,
			wireCorePeak: 0.9,
			impactGlow: 1.3,
			impactCore: 1.0,
			wireRestGlow: 0.1,
			wireRestCore: 0.04
		}
	},

	/**
	 * C — Solid builds bottom→top (height-sorted triangles) with wire leading.
	 * Feels like the mark is printed / grown upward as it rises into frame.
	 */
	C: {
		id: 'C',
		name: 'Bottom-up build',
		summary:
			'Mark grows upward triangle-by-triangle (sorted by height) while sliding up. Architectural assemble.',
		assemble: 'bottomUp',
		blank: 0.18,
		rise: {
			duration: 2.35,
			ease: 'power2.out',
			fromYFactor: 1.38,
			fadeEase: 'power2.out',
			fadeDuration: 0.85
		},
		spin: {
			duration: 2.35,
			ease: 'power2.out',
			from: { rotateX: 0.04, rotateY: -Math.PI * 2, rotateZ: 0.02, scale: 1.02 },
			to: { rotateX: 0.01, rotateY: 0.05, rotateZ: 0, scale: 1.0 }
		},
		wire: {
			duration: 1.8,
			ease: 'power1.inOut',
			glowPeak: 0.95,
			corePeak: 0.85
		},
		fill: {
			at: 'rise+=0.45',
			duration: 1.7,
			ease: 'none',
			to: { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 },
			wireRestAt: 'fill+=0.85',
			wireRestDuration: 0.6,
			wireRestGlow: 0.3,
			wireRestCore: 0.14
		}
	}
};

/** Default when no `?hero=` query — B is the locked hero animation */
/** @type {HeroOptionId} */
export let activeHeroOption = 'B';

/**
 * Resolve option from URL (?hero=A|B|C) or fallback.
 * @param {string} [search]
 * @returns {HeroOption}
 */
export function resolveHeroOption(search = typeof window !== 'undefined' ? window.location.search : '') {
	const id = /** @type {HeroOptionId | null} */ (
		new URLSearchParams(search).get('hero')?.toUpperCase() ?? null
	);
	if (id && heroOptions[id]) return heroOptions[id];
	return heroOptions[activeHeroOption];
}

/** @deprecated use resolveHeroOption — kept so older imports don’t break */
export const buildMotion = heroOptions.A;

export const restPose = {
	x: 0,
	y: 0,
	z: 0,
	rotateX: 0,
	rotateY: 0,
	rotateZ: 0,
	scale: 1
};

export const idleMotion = {
	enabled: true,
	rotateY: 0.045,
	rotateX: 0.015,
	period: 14,
	ease: 'sine.inOut'
};

export const motionPromptHints = [
	'Preview options: ?hero=A | ?hero=B | ?hero=C',
	'After choosing, set activeHeroOption in heroLogoMotion.js',
	'Assemble modes: opacity (soft), scatter (fragments), bottomUp (grow)'
];

/**
 * Scroll "dive": the camera flies into the "6" counterspace (the green island inside
 * the bowl of the 6) until it fills the screen. Values are fractions of the shield's
 * width / height, measured from the front face of model.glb:
 *   centre  → (cx, cy) from the shield centre (y up; negative = below centre)
 *   size    → w × h of the counterspace
 */
export const diveMotion = {
	cx: 0,
	cy: -0.127,
	w: 0.3955,
	h: 0.2728,
	/** < 1 keeps the view fully inside the counterspace at the end of the dive. */
	cover: 0.78,
	/** Progress (0–1) by which the counterspace is centred on the camera axis. */
	align: 0.55,
	/** Damping rate (1/s) applied to scroll progress. */
	smooth: 8
};
