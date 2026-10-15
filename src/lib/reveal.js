/**
 * Scroll-triggered section reveals powered by GSAP + ScrollTrigger.
 * Timing/easing live in `revealMotion.js` for prompt-friendly retunes.
 */
import { browser } from '$app/environment';
import { ensureGsap } from '$lib/gsap.js';
import { revealMotion } from '$lib/revealMotion.js';

/**
 * @param {HTMLElement} node
 * @param {{
 *   start?: string;
 *   once?: boolean;
 *   rootMargin?: string;
 *   threshold?: number;
 * }} [params]
 */
export function reveal(node, params = {}) {
	if (!browser) return;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		node.classList.add('is-visible');
		return;
	}

	node.classList.add('reveal-ready');

	let destroyed = false;
	/** @type {import('gsap').core.Tween | import('gsap').core.Timeline | null} */
	let tween = null;
	/** @type {import('gsap').core.Tween | { kill: () => void } | null} */
	let st = null;

	(async () => {
		const { gsap, ScrollTrigger } = await ensureGsap();
		if (destroyed) return;

		const childNodes = [...node.querySelectorAll(revealMotion.childSelector)];
		const targets = /** @type {HTMLElement[]} */ (
			childNodes.length > 0 ? childNodes : [node]
		);

		gsap.set(targets, {
			opacity: 0,
			y: revealMotion.fromY,
			filter: revealMotion.fromBlur > 0 ? `blur(${revealMotion.fromBlur}px)` : 'none'
		});

		const start = params.start ?? revealMotion.start;
		const once = params.once ?? revealMotion.once;

		st = ScrollTrigger.create({
			trigger: node,
			start,
			once,
			onEnter: () => {
				node.classList.add('is-visible');
				tween = gsap.to(targets, {
					opacity: 1,
					y: 0,
					filter: 'blur(0px)',
					duration: revealMotion.duration,
					ease: revealMotion.ease,
					stagger: revealMotion.stagger,
					overwrite: 'auto'
				});
			}
		});
	})();

	return {
		destroy() {
			destroyed = true;
			tween?.kill();
			st?.kill();
		}
	};
}
