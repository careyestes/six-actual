/**
 * Construction lines for the hero mark.
 *
 * Secondary animation that shows how the shield is being generated. Every line
 * takes its direction from a real edge of the mark (so the angles match the 6
 * and its frame), lives in the mark's local space (so it rides the dive/tilt
 * with it), and is spawned by the build itself:
 *
 *  - laser phase:    as the laser reaches an edge, a line shoots in along that
 *                    edge's own extension and stops where it meets the shield.
 *  - assembly phase: lines shoot across the shield along the glyph's angles and
 *                    land on the fragments about to appear.
 *  - idle:           an occasional line along a random edge.
 *
 * Each dart: head races out on a cubic ease-out, tail lags then catches up, so it
 * extends, snaps to a stop and vanishes. Angular only — no radial / HUD shapes.
 */
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	DynamicDrawUsage,
	Group,
	LineBasicMaterial,
	LineSegments,
	Vector3
} from 'three';

const POOL = 72;
/** Dart lifetime range (s). Slowed 10% from the previous 0.42–0.95. */
const LIFE_MIN = 0.46;
const LIFE_MAX = 1.05;
/** Segments shorter than this fraction of the mark size are ignored (bevel noise). */
const MIN_EDGE_FRAC = 0.06;
/** Assembly darts aim at triangles this many positions ahead of the reveal frontier. */
const LEAD_TRIS = 48;

/**
 * @typedef {object} AuraBind
 * @property {import('three').Mesh} markMesh
 * @property {import('three').BufferGeometry} edges wire edges, ordered inner "6" → outer box
 * @property {number} innerFraction fraction of edge segments that are the inner "6"
 * @property {{ wire: number, fill: number }} timeline live timeline progress
 *
 * @typedef {object} AuraField
 * @property {import('three').Group} group
 * @property {{ opacity: number, energy: number, live: number }} progress
 * @property {(ctx: AuraBind) => void} bind
 * @property {(t: number, openingDone: boolean) => void} update
 * @property {() => void} dispose
 */

/** @param {number} a @param {number} b */
const rand = (a, b) => a + Math.random() * (b - a);
/** @param {number} v */
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * @param {string | import('three').Color} brand
 * @returns {AuraField}
 */
export function createHeroAura(brand) {
	const green = brand instanceof Color ? brand.clone() : new Color(brand);
	const softWhite = new Color('#e6fff0');

	const group = new Group();
	group.visible = false;

	const positions = new Float32Array(POOL * 6);
	const colors = new Float32Array(POOL * 6);
	const geo = new BufferGeometry();
	const posAttr = new BufferAttribute(positions, 3);
	const colAttr = new BufferAttribute(colors, 3);
	posAttr.setUsage(DynamicDrawUsage);
	colAttr.setUsage(DynamicDrawUsage);
	geo.setAttribute('position', posAttr);
	geo.setAttribute('color', colAttr);

	const mat = new LineBasicMaterial({
		vertexColors: true,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		// Assembly lines land *on* the shield face, so don't let the mesh hide them.
		depthTest: false,
		toneMapped: false,
		blending: AdditiveBlending
	});
	const lines = new LineSegments(geo, mat);
	lines.frustumCulled = false;
	lines.renderOrder = 1;
	group.add(lines);

	// live: 1 while the shield builds; the timeline drops it to 0 at 'seat' to halt the lines.
	const progress = { opacity: 0, energy: 0, live: 1 };

	/**
	 * @typedef {object} Dart
	 * @property {boolean} active
	 * @property {number} fa  start (plane coords, mark-local)
	 * @property {number} fb
	 * @property {number} ta  end (plane coords, mark-local)
	 * @property {number} tb
	 * @property {number} depth depth-axis coordinate (mark-local)
	 * @property {number} dist
	 * @property {number} maxLen
	 * @property {number} life
	 * @property {number} age
	 * @property {number} bright
	 * @property {import('three').Color} color
	 */
	/** @type {Dart[]} */
	const darts = Array.from({ length: POOL }, () => ({
		active: false,
		fa: 0,
		fb: 0,
		ta: 0,
		tb: 0,
		depth: 0,
		dist: 1,
		maxLen: 1,
		life: 1,
		age: 0,
		bright: 1,
		color: green
	}));

	/** @type {null | {
	 *   mesh: import('three').Mesh,
	 *   timeline: { wire: number, fill: number },
	 *   ax: number[], depthAxis: number, depthMid: number,
	 *   ref: number, min: number[], max: number[], ca: number, cb: number,
	 *   segCount: number, innerCount: number,
	 *   segs: (null | { dx: number, dy: number, ux: number, uy: number, ea: number, eb: number, tExit: number })[],
	 *   all: number[], inner: number[],
	 *   triCount: number
	 * }} */
	let ctx = null;
	let prevWireF = 0;
	let prevTri = 0;
	let assemblyAcc = 0;
	let ambientAcc = 0;
	let prevT = -1;

	const tmp = new Vector3();
	const out = [0, 0, 0];

	/**
	 * Distance along (ux,uy) from (pa,pb) until it leaves the mark's plane bbox.
	 * @param {number} pa @param {number} pb @param {number} ux @param {number} uy
	 */
	function exitDist(pa, pb, ux, uy) {
		if (!ctx) return 0;
		const { ax, min, max } = ctx;
		let t = Infinity;
		if (ux > 1e-6) t = Math.min(t, (max[ax[0]] - pa) / ux);
		else if (ux < -1e-6) t = Math.min(t, (min[ax[0]] - pa) / ux);
		if (uy > 1e-6) t = Math.min(t, (max[ax[1]] - pb) / uy);
		else if (uy < -1e-6) t = Math.min(t, (min[ax[1]] - pb) / uy);
		return t === Infinity ? 0 : Math.max(0, t);
	}

	/**
	 * Read the mark's real edges once: segment directions, endpoints, shield bbox.
	 * @param {AuraBind} b
	 */
	function bind(b) {
		const pos = b.edges.attributes.position;
		const n = pos.count;
		const min = [Infinity, Infinity, Infinity];
		const max = [-Infinity, -Infinity, -Infinity];
		for (let i = 0; i < n; i++) {
			const p = [pos.getX(i), pos.getY(i), pos.getZ(i)];
			for (let k = 0; k < 3; k++) {
				if (p[k] < min[k]) min[k] = p[k];
				if (p[k] > max[k]) max[k] = p[k];
			}
		}
		const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
		// Thinnest axis is depth; the other two are the face plane.
		const depthAxis = size.indexOf(Math.min(...size));
		const ax = [0, 1, 2].filter((k) => k !== depthAxis);
		const ref = Math.max(size[ax[0]], size[ax[1]]);
		const ca = (min[ax[0]] + max[ax[0]]) / 2;
		const cb = (min[ax[1]] + max[ax[1]]) / 2;
		const depthMid = (min[depthAxis] + max[depthAxis]) / 2;

		const segCount = Math.floor(n / 2);
		const innerCount = Math.floor(b.innerFraction * segCount);

		ctx = {
			mesh: b.markMesh,
			timeline: b.timeline,
			ax,
			depthAxis,
			depthMid,
			ref,
			min,
			max,
			ca,
			cb,
			segCount,
			innerCount,
			segs: [],
			all: [],
			inner: [],
			triCount: 0
		};

		const get = (i, k) => (k === 0 ? pos.getX(i) : k === 1 ? pos.getY(i) : pos.getZ(i));
		for (let s = 0; s < segCount; s++) {
			const i = s * 2;
			const a0 = get(i, ax[0]);
			const b0 = get(i, ax[1]);
			const a1 = get(i + 1, ax[0]);
			const b1 = get(i + 1, ax[1]);
			const len = Math.hypot(a1 - a0, b1 - b0);
			if (len < ref * MIN_EDGE_FRAC) {
				ctx.segs.push(null);
				continue;
			}
			const dx = (a1 - a0) / len;
			const dy = (b1 - b0) / len;
			// Extend the stroke beyond its far-from-center end.
			const d0 = Math.hypot(a0 - ca, b0 - cb);
			const d1 = Math.hypot(a1 - ca, b1 - cb);
			const end1 = d1 >= d0;
			const ea = end1 ? a1 : a0;
			const eb = end1 ? b1 : b0;
			const ux = end1 ? dx : -dx;
			const uy = end1 ? dy : -dy;
			const seg = { dx, dy, ux, uy, ea, eb, tExit: exitDist(ea, eb, ux, uy) };
			ctx.segs.push(seg);
			ctx.all.push(s);
			if (s < innerCount) ctx.inner.push(s);
		}

		const idx = b.markMesh.geometry.index;
		ctx.triCount = idx ? Math.floor(idx.count / 3) : 0;

		prevWireF = 0;
		prevTri = 0;
	}

	/** @param {Dart} d */
	function begin(d) {
		d.active = true;
		d.age = 0;
		d.life = rand(LIFE_MIN, LIFE_MAX);
		d.color = Math.random() < 0.2 ? softWhite : green;
	}

	/** Line along a real edge's own extension, ending where it meets the shield.
	 * @param {Dart} d @param {number} segIndex @param {number} bright */
	function spawnTrace(d, segIndex, bright) {
		if (!ctx) return;
		const seg = ctx.segs[segIndex];
		if (!seg) return;
		const stopA = seg.ea + seg.ux * seg.tExit;
		const stopB = seg.eb + seg.uy * seg.tExit;
		const L = ctx.ref * rand(1.1, 3.0);
		begin(d);
		d.fa = stopA + seg.ux * L;
		d.fb = stopB + seg.uy * L;
		d.ta = stopA;
		d.tb = stopB;
		d.depth = ctx.depthMid;
		d.dist = L;
		d.maxLen = ctx.ref * rand(0.5, 1.3);
		d.bright = bright * rand(0.75, 1);
	}

	/** Line across the shield along a glyph angle, landing on an upcoming fragment.
	 * @param {Dart} d @param {number} curTri */
	function spawnAssembly(d, curTri) {
		if (!ctx || !ctx.all.length) return;
		const geoM = ctx.mesh.geometry;
		const idx = geoM.index;
		const posM = geoM.attributes.position;
		if (!idx || ctx.triCount < 1) return;
		const tri = Math.min(ctx.triCount - 1, curTri + Math.floor(Math.random() * LEAD_TRIS));
		const ia = idx.getX(tri * 3);
		const ib = idx.getX(tri * 3 + 1);
		const ic = idx.getX(tri * 3 + 2);
		const { ax, depthAxis } = ctx;
		const c = [0, 0, 0];
		for (const vi of [ia, ib, ic]) {
			c[0] += posM.getX(vi) / 3;
			c[1] += posM.getY(vi) / 3;
			c[2] += posM.getZ(vi) / 3;
		}
		const pa = c[ax[0]];
		const pb = c[ax[1]];

		// Prefer the 6's own strokes for the angle.
		const pool = ctx.inner.length && Math.random() < 0.65 ? ctx.inner : ctx.all;
		const seg = ctx.segs[pool[Math.floor(Math.random() * pool.length)]];
		if (!seg) return;
		const sign = Math.random() < 0.5 ? -1 : 1;
		const ux = seg.dx * sign;
		const uy = seg.dy * sign;
		const L = exitDist(pa, pb, ux, uy) + ctx.ref * rand(0.25, 1.3);

		begin(d);
		d.fa = pa + ux * L;
		d.fb = pb + uy * L;
		d.ta = pa;
		d.tb = pb;
		d.depth = c[depthAxis];
		d.dist = L;
		d.maxLen = ctx.ref * rand(0.45, 1.0);
		d.bright = rand(0.5, 0.85);
	}

	function free() {
		return darts.find((d) => !d.active);
	}

	/**
	 * Mark-local plane point → world position, written into `out`.
	 * @param {number} a @param {number} b @param {number} depth
	 */
	function toWorld(a, b, depth) {
		if (!ctx) return;
		const v = [0, 0, 0];
		v[ctx.ax[0]] = a;
		v[ctx.ax[1]] = b;
		v[ctx.depthAxis] = depth;
		tmp.set(v[0], v[1], v[2]).applyMatrix4(ctx.mesh.matrixWorld);
		out[0] = tmp.x;
		out[1] = tmp.y;
		out[2] = tmp.z;
	}

	/**
	 * @param {number} t elapsed seconds
	 * @param {boolean} openingDone
	 */
	function update(t, openingDone) {
		const dt = prevT < 0 ? 0 : Math.min(0.05, t - prevT);
		prevT = t;

		const o = progress.opacity;
		if (o <= 0.001 || !ctx) {
			group.visible = false;
			return;
		}
		group.visible = true;
		mat.opacity = o;
		ctx.mesh.updateWorldMatrix(true, false);

		const tl = ctx.timeline;
		// Halted (shield pushing back to the camera): no new lines, existing ones finish fast.
		const live = progress.live > 0.5;
		const ageRate = live ? 1 : 2.6;

		// 1) Laser phase — a line per edge as the laser reaches it.
		const wireF = Math.floor(clamp01(tl.wire) * ctx.segCount);
		if (wireF < prevWireF) prevWireF = wireF; // timeline restarted
		let budget = live ? 6 : 0;
		for (let s = prevWireF; s < wireF && budget > 0; s++) {
			if (!ctx.segs[s] || Math.random() > 0.8) continue;
			const d = free();
			if (!d) break;
			spawnTrace(d, s, 1);
			budget--;
		}
		prevWireF = wireF;

		// 2) Assembly phase — lines feed the fragments about to be revealed.
		const dr = ctx.mesh.geometry.drawRange;
		const drawn = Number.isFinite(dr.count) ? dr.count : ctx.triCount * 3;
		const curTri = Math.floor(drawn / 3);
		if (curTri < prevTri) prevTri = curTri;
		if (live && tl.fill > 0.001 && curTri < ctx.triCount) {
			assemblyAcc += (curTri - prevTri) * 0.03;
			let n = 0;
			while (assemblyAcc >= 1 && n < 4) {
				assemblyAcc -= 1;
				n++;
				const d = free();
				if (d) spawnAssembly(d, curTri);
			}
		}
		prevTri = curTri;

		// 3) Ambient — occasional line along a random edge (more during the entrance).
		if (live) {
			ambientAcc += dt * ((openingDone ? 0.9 : 1.2) + progress.energy * 4);
			while (ambientAcc >= 1) {
				ambientAcc -= 1;
				const d = free();
				if (d && ctx.all.length) {
					spawnTrace(d, ctx.all[Math.floor(Math.random() * ctx.all.length)], 0.6);
				}
			}
		} else {
			ambientAcc = 0;
		}

		for (let i = 0; i < POOL; i++) {
			const d = darts[i];
			const o6 = i * 6;

			if (d.active) d.age += dt * ageRate;
			const u = d.age / d.life;
			if (!d.active || u >= 1) {
				d.active = false;
				positions.fill(0, o6, o6 + 6);
				colors.fill(0, o6, o6 + 6);
				continue;
			}

			// Head: fast cubic ease-out, arrives by u = 0.5.
			const head = 1 - Math.pow(1 - clamp01(u / 0.5), 3);
			// Tail: waits, then smoothsteps up to the head → snap-stop + vanish.
			const tu = clamp01((u - 0.16) / 0.84);
			let tail = tu * tu * (3 - 2 * tu);
			tail = Math.max(tail, head - d.maxLen / d.dist);

			// vertex 0 = tail (dark → invisible under additive), vertex 1 = head
			toWorld(d.fa + (d.ta - d.fa) * tail, d.fb + (d.tb - d.fb) * tail, d.depth);
			positions[o6] = out[0];
			positions[o6 + 1] = out[1];
			positions[o6 + 2] = out[2];
			toWorld(d.fa + (d.ta - d.fa) * head, d.fb + (d.tb - d.fb) * head, d.depth);
			positions[o6 + 3] = out[0];
			positions[o6 + 4] = out[1];
			positions[o6 + 5] = out[2];

			const fade = (1 - Math.pow(u, 3) * 0.75) * d.bright;
			colors[o6] = 0;
			colors[o6 + 1] = 0;
			colors[o6 + 2] = 0;
			colors[o6 + 3] = d.color.r * fade;
			colors[o6 + 4] = d.color.g * fade;
			colors[o6 + 5] = d.color.b * fade;
		}

		posAttr.needsUpdate = true;
		colAttr.needsUpdate = true;
	}

	function dispose() {
		geo.dispose();
		mat.dispose();
	}

	return { group, progress, bind, update, dispose };
}
