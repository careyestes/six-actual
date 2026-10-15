/**
 * Geometry helpers for assemble modes (avoids chunky sequential drawRange).
 */

/**
 * Reorder mesh index buffer so setDrawRange reveals triangles in `order`.
 * @param {import('three').BufferGeometry} geo
 * @param {'scatter' | 'bottomUp' | 'sequential'} order
 */
export function prepareAssembleOrder(geo, order) {
	const index = geo.index;
	if (!index) return;

	const src = index.array;
	const triCount = Math.floor(src.length / 3);
	/** @type {number[]} */
	const triIds = Array.from({ length: triCount }, (_, i) => i);

	if (order === 'scatter') {
		// Fisher–Yates
		for (let i = triIds.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const tmp = triIds[i];
			triIds[i] = triIds[j];
			triIds[j] = tmp;
		}
	} else if (order === 'bottomUp') {
		const pos = geo.attributes.position;
		triIds.sort((a, b) => {
			const ya = triangleCentroidY(pos, src, a);
			const yb = triangleCentroidY(pos, src, b);
			return ya - yb;
		});
	}

	const next = src.slice();
	for (let t = 0; t < triCount; t++) {
		const from = triIds[t] * 3;
		const to = t * 3;
		next[to] = src[from];
		next[to + 1] = src[from + 1];
		next[to + 2] = src[from + 2];
	}
	index.array.set(next);
	index.needsUpdate = true;
	geo.clearGroups();
}

/**
 * @param {import('three').BufferAttribute} pos
 * @param {ArrayLike<number>} idx
 * @param {number} tri
 */
function triangleCentroidY(pos, idx, tri) {
	const i = tri * 3;
	const a = idx[i] * 3;
	const b = idx[i + 1] * 3;
	const c = idx[i + 2] * 3;
	return (pos.array[a + 1] + pos.array[b + 1] + pos.array[c + 1]) / 3;
}

/**
 * Reorder a (non-indexed) EdgesGeometry so inner segments (the "6" glyph)
 * come before outer segments (the surrounding box). Lets a single draw-range
 * sweep laser the 6 first, then the box frame.
 *
 * @param {import('three').BufferGeometry} edges
 * @param {{ innerRadiusFactor?: number }} [opts]
 * @returns {{ innerFraction: number, order: number[] }}
 */
export function orderWireByRadius(edges, opts = {}) {
	const { innerRadiusFactor = 0.72 } = opts;
	const pos = edges.attributes.position;
	if (!pos) return { innerFraction: 1, order: [] };

	const segCount = Math.floor(pos.count / 2);
	/** @type {number[]} */
	const radius = new Array(segCount);
	let maxR = 0;
	for (let s = 0; s < segCount; s++) {
		const i = s * 2;
		const cx = (pos.getX(i) + pos.getX(i + 1)) / 2;
		const cy = (pos.getY(i) + pos.getY(i + 1)) / 2;
		const r = Math.hypot(cx, cy);
		radius[s] = r;
		if (r > maxR) maxR = r;
	}

	const order = Array.from({ length: segCount }, (_, i) => i).sort(
		(a, b) => radius[a] - radius[b]
	);

	const threshold = innerRadiusFactor * maxR;
	let inner = 0;
	for (const s of order) {
		if (radius[s] < threshold) inner++;
		else break;
	}
	const innerFraction = segCount ? inner / segCount : 1;

	applySegmentOrder(edges, order);
	return { innerFraction, order };
}

/**
 * Reorder a line-segment geometry's position buffer by segment order (in place).
 * @param {import('three').BufferGeometry} geo
 * @param {number[]} order segment indices
 */
export function applySegmentOrder(geo, order) {
	const pos = geo.attributes.position;
	if (!pos) return;
	const stride = pos.itemSize;
	const arr = pos.array;
	const src = arr.slice();
	const span = 2 * stride;
	for (let t = 0; t < order.length; t++) {
		const from = order[t] * span;
		const to = t * span;
		for (let k = 0; k < span; k++) arr[to + k] = src[from + k];
	}
	pos.needsUpdate = true;
}
