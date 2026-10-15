/**
 * Builds the hero mark GSAP timeline from a resolved hero option.
 */
import { idleMotion } from '$lib/heroLogoMotion.js';

/**
 * @typedef {import('$lib/heroLogoMotion.js').HeroOption} HeroOption
 *
 * @typedef {object} HeroTimelineTargets
 * @property {typeof import('gsap').gsap} gsap
 * @property {HeroOption} option
 * @property {import('three').Group} root
 * @property {import('three').Group} markGroup
 * @property {import('three').Mesh} markMesh
 * @property {import('three').PerspectiveCamera} [camera]
 * @property {{ group: import('three').Group, glow: import('three').LineBasicMaterial, core: import('three').LineBasicMaterial, edges: import('three').BufferGeometry, coreLine: import('three').LineSegments }} wire
 * @property {import('three').Vector3} markFocus
 * @property {() => number} viewportBottomY
 * @property {(geo: import('three').BufferGeometry, t: number) => void} setDrawProgress
 * @property {(geo: import('three').BufferGeometry, t: number) => void} setLineProgress
 * @property {(material: import('three').Material | import('three').Material[], fn: (m: import('three').Material) => void) => void} eachMat
 * @property {number} [wireInnerFraction] fraction of wire segments that make up the inner "6" (laser-first)
 * @property {{ opacity: number, energy: number, live: number }} [auraProgress] darting line field (outside the mark)
 * @property {import('$lib/heroWordmark.js').Wordmark | null} [wordmark] SIX ACTUAL / A.I. // INTEL. lockup under the shield
 * @property {() => void} [onComplete]
 */

/**
 * @param {HeroTimelineTargets} targets
 */
export function createHeroLogoTimeline(targets) {
	const {
		gsap,
		option,
		root,
		markGroup,
		markMesh,
		camera,
		wire,
		markFocus,
		viewportBottomY,
		setDrawProgress,
		setLineProgress,
		eachMat,
		wireInnerFraction = 1,
		auraProgress,
		wordmark,
		onComplete
	} = targets;

	const { blank, rise, spin, wire: wireCfg, fill, assemble, aura: auraCfg } = option;

	const progress = {
		wire: 0,
		fill: 0,
		fade: 0,
		glow: 0,
		core: 0
	};

	function applyProgress() {
		setLineProgress(wire.edges, progress.wire);
		setLineProgress(wire.coreLine.geometry, progress.wire);
		wire.glow.opacity = progress.glow;
		wire.core.opacity = progress.core;

		if (assemble === 'opacity') {
			// Full mesh always drawn — soft ink-in (no chunk slabs)
			setDrawProgress(markMesh.geometry, 1);
			eachMat(markMesh.material, (m) => {
				m.transparent = progress.fill < 0.98;
				m.opacity = progress.fill * Math.max(progress.fade, 0.15);
				m.depthWrite = progress.fill > 0.55;
			});
		} else {
			// scatter / bottomUp — fragments sprinkle in during the first ~72% of
			// fill, then the solid simply brightens to full. Reaching the geometry
			// frontier early means the tail is a pure opacity ramp → smooth stop,
			// no late triangles snapping in at the end (the "pop").
			const revealEnd = 0.72;
			const drawP = Math.min(1, progress.fill / revealEnd);
			setDrawProgress(markMesh.geometry, drawP);
			eachMat(markMesh.material, (m) => {
				const filled = progress.fill > 0.001;
				m.transparent = progress.fill < 0.999;
				m.opacity = filled ? Math.min(1, progress.fill) * Math.max(progress.fade, 0.3) : 0;
				m.depthWrite = drawP > 0.5;
			});
		}
	}

	const fromY = viewportBottomY();
	const toY = markFocus.y;
	const fromZ = rise.fromZ ?? markFocus.z;
	const toZ = markFocus.z;
	const diveZ = rise.diveZ ?? toZ;
	const diveDuration = rise.diveDuration ?? rise.duration;
	const seatDuration = rise.seatDuration ?? 0;

	markMesh.visible = false;
	wire.group.visible = false;
	markGroup.position.set(0, 0, 0);
	root.position.set(markFocus.x, fromY, fromZ);
	markGroup.rotation.set(spin.from.rotateX, spin.from.rotateY, spin.from.rotateZ);
	markGroup.scale.setScalar(spin.from.scale);
	setDrawProgress(markMesh.geometry, assemble === 'opacity' ? 1 : 0);
	setLineProgress(wire.edges, 0);
	setLineProgress(wire.coreLine.geometry, 0);
	wire.glow.opacity = 0;
	wire.core.opacity = 0;
	eachMat(markMesh.material, (m) => {
		m.transparent = true;
		m.opacity = 0;
		m.depthWrite = false;
	});

	const tl = gsap.timeline({
		paused: true,
		onUpdate: applyProgress,
		onComplete: () => {
			eachMat(markMesh.material, (m) => {
				m.opacity = 1;
				m.transparent = false;
				m.depthWrite = true;
			});
			setDrawProgress(markMesh.geometry, 1);
			setLineProgress(wire.edges, 1);
			setLineProgress(wire.coreLine.geometry, 1);
			root.position.set(markFocus.x, toY, markFocus.z);
			markGroup.rotation.set(fill.to.rotateX, fill.to.rotateY, fill.to.rotateZ);
			markGroup.scale.setScalar(fill.to.scale);
			onComplete?.();
		}
	});

	tl.addLabel('blank')
		.to({}, { duration: blank })
		.addLabel('rise')
		.call(() => {
			markMesh.visible = true;
			wire.group.visible = true;
		})
		.fromTo(
			root.position,
			{ y: fromY },
			{ y: toY, duration: rise.duration, ease: rise.ease },
			'rise'
		)
		// Depth dive: rush in from near the camera, plunge past the surface…
		.fromTo(
			root.position,
			{ z: fromZ },
			{ z: diveZ, duration: diveDuration, ease: rise.ease },
			'rise'
		)
		.fromTo(
			progress,
			{ fade: 0 },
			{ fade: 1, duration: rise.fadeDuration, ease: rise.fadeEase },
			'rise'
		);

	// …then seat flush into the surface (follow-through, no pop).
	if (seatDuration > 0 && diveZ !== toZ) {
		tl.to(
			root.position,
			{ z: toZ, duration: seatDuration, ease: rise.seatEase ?? 'power2.inOut' },
			`rise+=${diveDuration}`
		);
	}

	// 'seat' = the moment the shield starts pushing back toward the camera.
	// Construction lines halt here and the wordmark reveals.
	tl.addLabel('seat', seatDuration > 0 && diveZ !== toZ ? `rise+=${diveDuration}` : fill.at);

	// Camera dolly for parallax depth (optional, option.camera).
	if (camera && option.camera) {
		const cam = option.camera;
		camera.position.z = cam.fromZ;
		camera.position.y = cam.fromY;
		tl.to(camera.position, { z: cam.toZ, duration: cam.duration, ease: cam.ease }, 'rise').to(
			camera.position,
			{ y: cam.toY, duration: cam.duration, ease: cam.ease },
			'rise'
		);
	}

	tl
		.fromTo(
			markGroup.rotation,
			{
				x: spin.from.rotateX,
				y: spin.from.rotateY,
				z: spin.from.rotateZ
			},
			{
				x: spin.to.rotateX,
				y: spin.to.rotateY,
				z: spin.to.rotateZ,
				duration: spin.duration,
				ease: spin.ease
			},
			'rise'
		)
		.fromTo(
			markGroup.scale,
			{ x: spin.from.scale, y: spin.from.scale, z: spin.from.scale },
			{
				x: spin.to.scale,
				y: spin.to.scale,
				z: spin.to.scale,
				duration: spin.duration,
				ease: spin.ease
			},
			'rise'
		)
		.addLabel('wireStart', 'rise');

	if (wireCfg.laserSix && wireCfg.laserBox) {
		// Two-stage laser: trace the inner "6" first, then draw the box frame.
		const inner = Math.max(0.08, Math.min(0.95, wireInnerFraction));
		const six = wireCfg.laserSix;
		const box = wireCfg.laserBox;
		tl.to(progress, { wire: inner, duration: six.duration, ease: six.ease }, six.at)
			.to(
				progress,
				{ glow: six.glowPeak, core: six.corePeak, duration: six.duration * 0.6, ease: 'power2.out' },
				six.at
			)
			.to(progress, { wire: 1, duration: box.duration, ease: box.ease }, box.at)
			.to(
				progress,
				{ glow: box.glowPeak, core: box.corePeak, duration: box.duration, ease: 'power1.inOut' },
				box.at
			);
	} else {
		// Single-stage wire draw (options A / C).
		tl.fromTo(
			progress,
			{ wire: 0, glow: 0, core: 0 },
			{
				wire: 1,
				glow: wireCfg.glowPeak ?? 1,
				core: wireCfg.corePeak ?? 0.9,
				duration: wireCfg.duration ?? 1.8,
				ease: wireCfg.ease ?? 'power1.inOut'
			},
			'rise'
		);
	}

	tl.addLabel('fill', fill.at)
		.fromTo(
			progress,
			{ fill: 0 },
			{ fill: 1, duration: fill.duration, ease: fill.ease },
			'fill'
		)
		.to(
			markGroup.rotation,
			{
				x: fill.to.rotateX,
				y: fill.to.rotateY,
				z: fill.to.rotateZ,
				duration: fill.duration,
				ease: fill.ease
			},
			'fill'
		)
		.to(
			markGroup.scale,
			{
				x: fill.to.scale,
				y: fill.to.scale,
				z: fill.to.scale,
				duration: fill.duration,
				ease: fill.ease
			},
			'fill'
		);

	// Impact flash as the shield slams into the surface.
	if (fill.impactAt) {
		tl.to(
			progress,
			{
				glow: fill.impactGlow ?? 1.5,
				core: fill.impactCore ?? 1.1,
				duration: 0.18,
				ease: 'power2.out'
			},
			fill.impactAt
		);
	}

	tl.to(
		progress,
		{
			glow: fill.wireRestGlow,
			core: fill.wireRestCore,
			duration: fill.wireRestDuration,
			ease: 'power2.out'
		},
		fill.wireRestAt
	);

	// Construction lines outside the mark: live while it builds, halted at 'seat'.
	if (auraProgress && auraCfg) {
		auraProgress.opacity = 0;
		auraProgress.energy = 0;
		auraProgress.live = 1;
		tl.set(auraProgress, { live: 1 }, 0).set(auraProgress, { live: 0 }, 'seat');
		const at = auraCfg.at ?? 'rise';
		tl.to(
			auraProgress,
			{
				opacity: auraCfg.peak ?? 1,
				energy: auraCfg.energyPeak ?? 1,
				duration: auraCfg.duration ?? 0.5,
				ease: auraCfg.ease ?? 'power2.out'
			},
			at
		);
		if (auraCfg.restAt) {
			tl.to(
				auraProgress,
				{
					opacity: auraCfg.rest ?? 0.55,
					energy: auraCfg.energyRest ?? 0.05,
					duration: auraCfg.restDuration ?? 1.4,
					ease: 'power2.inOut'
				},
				auraCfg.restAt
			);
		}
	}

	// Wordmark lockup builds itself under the shield as it seats.
	if (wordmark && option.text) {
		wordmark.addToTimeline(tl, option.text.at ?? 'seat');
	}

	tl.addLabel('settle').addLabel('idle');

	return { timeline: tl, progress, option };
}

/**
 * @param {typeof import('gsap').gsap} gsap
 * @param {import('three').Group} markGroup
 */
export function createHeroIdleTween(gsap, markGroup) {
	if (!idleMotion.enabled) return null;
	const baseY = markGroup.rotation.y;
	const baseX = markGroup.rotation.x;
	return gsap.to(markGroup.rotation, {
		y: baseY + idleMotion.rotateY,
		x: baseX + idleMotion.rotateX,
		duration: idleMotion.period / 2,
		ease: idleMotion.ease,
		yoyo: true,
		repeat: -1
	});
}
