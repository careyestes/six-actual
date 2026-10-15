/**
 * Wordmark lockup built under the hero shield:
 *
 *   SIX ACTUAL        (Chakra Petch Bold, ~1.8× the shield's width)
 *   A.I. // INTEL.    (Chakra Petch Medium, tracked out)
 *
 * Glyph outlines come from `heroWordmarkPaths.js` (real font outlines, laid out to
 * match the supplied lockup) and are extruded into solid meshes. Each line then
 * builds itself the way the shield does: an outline traced left → right by a
 * light, the solid assembling from scattered fragments, an impact flash, settle.
 */
import {
	AdditiveBlending,
	Box3,
	Color,
	DoubleSide,
	EdgesGeometry,
	ExtrudeGeometry,
	Group,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshPhysicalMaterial,
	Path,
	Shape,
	Vector2
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { applySegmentOrder, prepareAssembleOrder } from '$lib/heroAssemble.js';
import { WORDMARK_LINES } from '$lib/heroWordmarkPaths.js';

/** @param {number} v */
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * @param {import('three').BufferGeometry} geo
 * @param {number} t 0–1
 */
function setLineProgress(geo, t) {
	const total = geo.attributes.position.count;
	geo.setDrawRange(0, Math.floor((total * clamp01(t)) / 2) * 2);
}

/**
 * @param {import('three').BufferGeometry} geo
 * @param {number} t 0–1
 */
function setFillProgress(geo, t) {
	const total = geo.index ? geo.index.count : geo.attributes.position.count;
	geo.setDrawRange(0, Math.floor((total * clamp01(t)) / 3) * 3);
}

/**
 * Sort an edges geometry's segments by midpoint x so the outline is traced
 * left → right, and return the order (to apply to the clone as well).
 * @param {import('three').BufferGeometry} edges
 */
function orderSegmentsByX(edges) {
	const pos = edges.attributes.position;
	const segCount = Math.floor(pos.count / 2);
	const mid = new Array(segCount);
	for (let s = 0; s < segCount; s++) mid[s] = (pos.getX(s * 2) + pos.getX(s * 2 + 1)) / 2;
	const order = Array.from({ length: segCount }, (_, i) => i).sort((a, b) => mid[a] - mid[b]);
	applySegmentOrder(edges, order);
	return order;
}

/** Parse a path made only of M / L / Z into closed polygons.
 * @param {string} d
 * @returns {[number, number][][]}
 */
function parseContours(d) {
	/** @type {[number, number][][]} */
	const contours = [];
	/** @type {[number, number][] | null} */
	let cur = null;
	const re = /([MLZ])([^MLZ]*)/g;
	let m;
	while ((m = re.exec(d))) {
		const cmd = m[1];
		if (cmd === 'Z') continue;
		const [x, y] = m[2].trim().split(/\s+/).map(Number);
		if (cmd === 'M') {
			cur = [];
			contours.push(cur);
		}
		cur?.push([x, y]);
	}
	return contours
		.map((c) => {
			const a = c[0];
			const b = c[c.length - 1];
			return a[0] === b[0] && a[1] === b[1] ? c.slice(0, -1) : c;
		})
		.filter((c) => c.length > 2);
}

/** @param {Vector2[]} pts */
function polyArea(pts) {
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const p = pts[i];
		const q = pts[(i + 1) % pts.length];
		a += p.x * q.y - q.x * p.y;
	}
	return Math.abs(a) / 2;
}

/**
 * @param {Vector2[]} pts
 * @param {Vector2} p
 */
function insidePoly(pts, p) {
	let inside = false;
	for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
		const a = pts[i];
		const b = pts[j];
		if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
			inside = !inside;
		}
	}
	return inside;
}

/** Group contours into shapes (outers + their holes) by even/odd nesting.
 * @param {Vector2[][]} polys
 */
function buildShapes(polys) {
	const items = polys
		.map((pts) => ({ pts, area: polyArea(pts), depth: 0, parent: -1 }))
		.sort((a, b) => b.area - a.area);
	items.forEach((it, i) => {
		for (let j = 0; j < i; j++) {
			if (insidePoly(items[j].pts, it.pts[0])) {
				it.depth++;
				it.parent = j;
			}
		}
	});
	/** @type {Map<number, Shape>} */
	const shapes = new Map();
	items.forEach((it, i) => {
		if (it.depth % 2 === 0) shapes.set(i, new Shape(it.pts));
	});
	items.forEach((it) => {
		if (it.depth % 2 === 1) shapes.get(it.parent)?.holes.push(new Path(it.pts));
	});
	return [...shapes.values()];
}

/**
 * @typedef {object} WordmarkConfig
 * @property {string} [at]
 * @property {number} [depth]          extrusion depth, as a multiple of the shield width
 * @property {number} [slide]          how far each line slides down from under the shield (× shield width)
 * @property {number} [slideDuration]
 * @property {number} [lineStagger]    delay between the two lines
 * @property {number} [wireDuration]
 * @property {number} [fillDelay]
 * @property {number} [fillDuration]
 * @property {number} [wireGlowPeak]
 * @property {number} [wireCorePeak]
 * @property {number} [impactGlow]
 * @property {number} [impactCore]
 * @property {number} [wireRestGlow]
 * @property {number} [wireRestCore]
 *
 * @typedef {object} Wordmark
 * @property {import('three').Group} group
 * @property {number} count
 * @property {number} lift  root-local distance to raise the lockup so shield + text sit centred
 * @property {() => void} update
 * @property {(halfW: number) => void} fit
 * @property {() => void} finalize
 * @property {(tl: import('gsap').core.Timeline, at: string) => void} addToTimeline
 */

/**
 * @param {object} args
 * @param {import('three').Group} args.textGroup child of `root`
 * @param {import('three').Group} args.root
 * @param {import('three').Mesh} args.markMesh shield mesh, already centred
 * @param {string | import('three').Color} args.brand wire glow colour
 * @param {WordmarkConfig} args.config
 * @returns {Wordmark}
 */
export function createWordmark({ textGroup, root, markMesh, brand, config }) {
	const cfg = {
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
		wireRestCore: 0.04,
		...config
	};
	const glowColor = brand instanceof Color ? brand.clone() : new Color(brand);

	// Shield bounds in root-local units.
	root.updateMatrixWorld(true);
	const markBox = new Box3()
		.setFromObject(markMesh)
		.applyMatrix4(root.matrixWorld.clone().invert());
	const W = markBox.max.x - markBox.min.x;
	const cx = (markBox.max.x + markBox.min.x) / 2;
	const bottomY = markBox.min.y;
	const cz = (markBox.max.z + markBox.min.z) / 2;
	const depth = cfg.depth * W;

	// Pivot at the shield's bottom centre so the whole lockup can be scaled to fit.
	textGroup.position.set(cx, bottomY, 0);
	textGroup.visible = true;

	// Same brand green as the shield.
	const textColor = glowColor.clone();

	/** @type {{ mesh: Mesh, mat: MeshPhysicalMaterial, geo: import('three').BufferGeometry, wire: { glow: LineBasicMaterial, core: LineBasicMaterial, edges: import('three').BufferGeometry, coreGeo: import('three').BufferGeometry }, p: { wire: number, fill: number, glow: number, core: number }, restY: number, pace: number }[]} */
	const lines = [];
	let halfExtentX = 0;
	let extentBelow = 0;

	WORDMARK_LINES.forEach((line, lineIndex) => {
		// Path units (shield width = 1, y down from shield bottom) → pivot-local, y up.
		const polys = parseContours(line.d).map((c) => c.map(([x, y]) => new Vector2(x * W, -y * W)));
		const shapes = buildShapes(polys);
		const parts = shapes.map(
			(shape) =>
				new ExtrudeGeometry(shape, {
					depth,
					bevelEnabled: false,
					curveSegments: 1
				})
		);
		const merged = mergeGeometries(parts, false);
		parts.forEach((g) => g.dispose());

		merged.computeBoundingBox();
		const bb = /** @type {Box3} */ (merged.boundingBox);
		const lcx = (bb.min.x + bb.max.x) / 2;
		const lcy = (bb.min.y + bb.max.y) / 2;
		merged.translate(-lcx, -lcy, -depth / 2);
		halfExtentX = Math.max(halfExtentX, (bb.max.x - bb.min.x) / 2);
		extentBelow = Math.max(extentBelow, -bb.min.y);

		// Sequential index → shuffled triangles, so the solid assembles from fragments.
		const count = merged.attributes.position.count;
		merged.setIndex(Array.from({ length: count }, (_, i) => i));
		prepareAssembleOrder(merged, 'scatter');

		const mat = new MeshPhysicalMaterial({
			color: textColor.clone(),
			metalness: 0.78,
			roughness: 0.22,
			emissive: glowColor.clone(),
			emissiveIntensity: 0.16,
			clearcoat: 0.65,
			clearcoatRoughness: 0.18,
			flatShading: true,
			side: DoubleSide,
			transparent: true,
			opacity: 0
		});
		const mesh = new Mesh(merged, mat);
		mesh.position.set(lcx, lcy, cz);
		mesh.visible = false;

		const edges = new EdgesGeometry(merged, 22);
		const coreGeo = edges.clone();
		applySegmentOrder(coreGeo, orderSegmentsByX(edges));
		const glow = new LineBasicMaterial({
			color: glowColor.clone(),
			transparent: true,
			opacity: 0,
			depthWrite: false,
			depthTest: false,
			toneMapped: false,
			blending: AdditiveBlending
		});
		const core = new LineBasicMaterial({
			color: new Color(0xffffff),
			transparent: true,
			opacity: 0,
			depthWrite: false,
			depthTest: false,
			toneMapped: false,
			blending: AdditiveBlending
		});
		const glowLine = new LineSegments(edges, glow);
		const coreLine = new LineSegments(coreGeo, core);
		glowLine.scale.setScalar(1.006);
		glowLine.renderOrder = 2;
		coreLine.renderOrder = 3;
		const wireGroup = new Group();
		wireGroup.add(glowLine, coreLine);
		mesh.add(wireGroup);
		textGroup.add(mesh);

		setLineProgress(edges, 0);
		setLineProgress(coreGeo, 0);
		setFillProgress(merged, 0);

		lines.push({
			mesh,
			mat,
			geo: merged,
			wire: { glow, core, edges, coreGeo },
			p: { wire: 0, fill: 0, glow: 0, core: 0 },
			restY: mesh.position.y,
			// The tracked-out sub line is smaller and quicker.
			pace: lineIndex === 0 ? 1 : 0.85
		});
	});

	function apply() {
		for (const g of lines) {
			const f = clamp01(g.p.fill);
			// Fragments land first; the surface only reaches full strength as they finish.
			const draw = clamp01(f / 0.72);
			const opacity = f <= 0 ? 0 : 0.55 + 0.45 * clamp01((f - 0.5) / 0.5);
			setFillProgress(g.geo, draw);
			g.mat.opacity = opacity;
			g.mat.transparent = opacity < 0.999;
			g.mat.depthWrite = opacity > 0.5;
			setLineProgress(g.wire.edges, g.p.wire);
			setLineProgress(g.wire.coreGeo, g.p.wire);
			g.wire.glow.opacity = g.p.glow;
			g.wire.core.opacity = g.p.core;
		}
	}

	return {
		group: textGroup,
		count: lines.length,
		lift: extentBelow / 2,

		update: apply,

		/** Scale the lockup down on narrow viewports so it never overflows.
		 * @param {number} halfW visible half-width at the shield's plane */
		fit(halfW) {
			const worldW = 2 * halfExtentX * root.scale.x;
			const k = Math.min(1, (2 * halfW * 0.88) / (worldW || 1));
			textGroup.scale.setScalar(k);
		},

		/** Jump to the finished state (reduced motion). */
		finalize() {
			for (const g of lines) {
				g.mesh.visible = true;
				g.mesh.position.y = g.restY;
				g.p.wire = 1;
				g.p.fill = 1;
				g.p.glow = cfg.wireRestGlow;
				g.p.core = cfg.wireRestCore;
			}
			apply();
		},

		/**
		 * Append the build to the hero timeline, starting at `at` (a label).
		 * @param {import('gsap').core.Timeline} tl
		 * @param {string} at
		 */
		addToTimeline(tl, at) {
			const offsetY = cfg.slide * W;
			lines.forEach((g, i) => {
				const t0 = `${at}+=${(i * cfg.lineStagger).toFixed(3)}`;
				const wireD = cfg.wireDuration * g.pace;
				const fillAt = cfg.fillDelay * g.pace;
				const fillD = cfg.fillDuration * g.pace;
				tl.call(
					() => {
						g.mesh.visible = true;
					},
					undefined,
					t0
				)
					// Slides down out from beneath the shield as the lockup seats.
					.fromTo(
						g.mesh.position,
						{ y: g.restY + offsetY },
						{ y: g.restY, duration: cfg.slideDuration, ease: 'power3.out' },
						t0
					)
					// Outline traced left → right…
					.fromTo(
						g.p,
						{ wire: 0, glow: 0, core: 0 },
						{ wire: 1, duration: wireD, ease: 'power2.inOut' },
						t0
					)
					.to(
						g.p,
						{
							glow: cfg.wireGlowPeak,
							core: cfg.wireCorePeak,
							duration: wireD * 0.5,
							ease: 'power2.out'
						},
						t0
					)
					// …the solid assembles from fragments behind it…
					.fromTo(
						g.p,
						{ fill: 0 },
						{ fill: 1, duration: fillD, ease: 'power2.out' },
						`${t0}+=${fillAt.toFixed(3)}`
					)
					// …flash as the last fragments land, then the outline settles.
					.to(
						g.p,
						{ glow: cfg.impactGlow, core: cfg.impactCore, duration: 0.16, ease: 'power2.out' },
						`${t0}+=${(fillAt + fillD * 0.55).toFixed(3)}`
					)
					.to(
						g.p,
						{
							glow: cfg.wireRestGlow,
							core: cfg.wireRestCore,
							duration: 0.8,
							ease: 'power2.out'
						},
						`${t0}+=${(fillAt + fillD * 0.55 + 0.16).toFixed(3)}`
					);
			});
		}
	};
}
