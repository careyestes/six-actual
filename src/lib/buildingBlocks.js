/**
 * Building-blocks loop — layout + timing (pure, no three.js).
 * -----------------------------------------------------------
 * A stepped tower of engineered bricks snaps together one by one, holds, lifts away in
 * reverse order, and loops. `makeBlocks()` returns the bricks; `brickState()` is a pure
 * function of time, so the loop is deterministic and trivially pausable.
 *
 * Prompt examples:
 *   "Build the blocks faster"      → lower `blocksMotion.stagger`
 *   "Make the tower taller"        → add a layer to `LAYERS`
 *   "Hold the finished build longer" → raise `blocksMotion.hold`
 */

export const blocksMotion = {
	/** Seconds before the first brick drops. */
	lead: 0.5,
	/** Seconds between bricks dropping. */
	stagger: 0.4,
	/** Seconds a brick takes to fall and seat. */
	fall: 1.0,
	/** Seconds the finished build holds. */
	hold: 2.4,
	/** Seconds between bricks lifting away (reverse order). */
	liftStagger: 0.1,
	/** Seconds a brick takes to lift and fade. */
	lift: 0.9,
	/** Empty pause before the loop restarts. */
	rest: 0.8,
	/** Fill opacity of a brick once it has seated. */
	seatedFill: 0.9,
	/** How far bricks start/leave above the tower (world units). */
	drop: 9
};

/** Footprint (in studs) of each layer, bottom → top. */
export const LAYERS = [
	{ x0: 0, x1: 8, z0: 0, z1: 6 },
	{ x0: 1, x1: 7, z0: 1, z1: 5 },
	{ x0: 2, x1: 6, z0: 2, z1: 4 },
	{ x0: 3, x1: 5, z0: 2, z1: 4 }
];

/** Brick height, stud height (relative to the 1-unit stud pitch). */
export const BRICK_H = 1;
export const STUD_H = 0.26;

/** @param {number} seed */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * @typedef {object} Brick
 * @property {number} layer
 * @property {number} x  stud column
 * @property {number} z  stud row
 * @property {number} w  studs wide (x)
 * @property {number} d  studs deep (z)
 * @property {number} y  base height
 * @property {number} dx spawn drift x
 * @property {number} dz spawn drift z
 * @property {number} tone 0 brand green, 1 bright mint, 2 dim
 * @property {number} order build order
 */

/**
 * @param {number} [seed]
 * @returns {{ bricks: Brick[], total: number, buildEnd: number }}
 */
export function makeBlocks(seed = 11) {
	const rnd = mulberry32(seed);
	/** @type {Brick[]} */
	const bricks = [];
	const sizes = [
		[4, 2],
		[2, 4],
		[3, 2],
		[2, 3],
		[2, 2],
		[4, 1],
		[1, 4],
		[2, 1],
		[1, 2],
		[1, 1]
	];

	LAYERS.forEach((L, layer) => {
		const used = new Set();
		const key = (/** @type {number} */ x, /** @type {number} */ z) => `${x},${z}`;
		const layerBricks = [];
		for (let z = L.z0; z < L.z1; z++) {
			for (let x = L.x0; x < L.x1; x++) {
				if (used.has(key(x, z))) continue;
				// Offset which sizes are tried first so layers interlock like real bricks.
				const order = sizes
					.map((s, i) => ({ s, k: rnd() + (layer % 2 ? i * 0.02 : -i * 0.02) }))
					.sort((a, b) => a.k - b.k)
					.map((o) => o.s);
				for (const [w, d] of order) {
					if (x + w > L.x1 || z + d > L.z1) continue;
					let free = true;
					for (let i = 0; i < w && free; i++)
						for (let j = 0; j < d; j++) if (used.has(key(x + i, z + j))) free = false;
					if (!free) continue;
					for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) used.add(key(x + i, z + j));
					layerBricks.push({
						layer,
						x,
						z,
						w,
						d,
						y: layer * BRICK_H,
						dx: (rnd() - 0.5) * 7,
						dz: (rnd() - 0.5) * 7,
						tone: rnd() < 0.18 ? 1 : rnd() < 0.3 ? 2 : 0,
						order: 0
					});
					break;
				}
			}
		}
		// Shuffle within the layer so it assembles from all over, not row by row.
		for (let i = layerBricks.length - 1; i > 0; i--) {
			const j = Math.floor(rnd() * (i + 1));
			[layerBricks[i], layerBricks[j]] = [layerBricks[j], layerBricks[i]];
		}
		bricks.push(...layerBricks);
	});

	bricks.forEach((b, i) => (b.order = i));
	const m = blocksMotion;
	const buildEnd = m.lead + (bricks.length - 1) * m.stagger + m.fall;
	const total = buildEnd + m.hold + (bricks.length - 1) * m.liftStagger + m.lift + m.rest;
	return { bricks, total, buildEnd };
}

const clamp01 = (/** @type {number} */ v) => Math.min(1, Math.max(0, v));

/**
 * Pure state of one brick at loop time `t` (seconds, already wrapped to 0…total).
 * @param {Brick} b
 * @param {number} count total bricks
 * @param {number} buildEnd
 * @param {number} t
 */
export function brickState(b, count, buildEnd, t) {
	const m = blocksMotion;
	const tIn = m.lead + b.order * m.stagger;
	const p = clamp01((t - tIn) / m.fall);
	// Fast approach, soft seat.
	const e = 1 - Math.pow(1 - p, 3);

	const liftAt = buildEnd + m.hold + (count - 1 - b.order) * m.liftStagger;
	const q = clamp01((t - liftAt) / m.lift);

	const since = t - (tIn + m.fall); // seconds since seated
	const seated = since > 0 && q === 0;
	const flash = seated ? Math.exp(-since * 4.5) : 0;
	const ripple = seated ? clamp01(since / 0.8) : 2; // 2 = inactive

	const lift = q * q;
	// 0 → 1 over a beat once the brick has seated; the solid fill follows it.
	const seat = since > 0 ? clamp01(since / 0.18) : 0;
	return {
		visible: p > 0 && q < 1,
		// Bricks fall and lift straight up/down: no sideways drift (`dx`/`dz` are kept only so the
		// seeded layout stays identical).
		offX: 0,
		offZ: 0,
		offY: (1 - e) * m.drop + lift * m.drop * 0.7,
		alpha: clamp01(p / 0.3) * (1 - q),
		flash,
		ripple,
		seat
	};
}
