/**
 * Scroll-linked parallax for `[data-parallax]` nodes and the atmosphere layer.
 * Respects prefers-reduced-motion.
 */
import { browser } from '$app/environment';

let started = false;
let ticking = false;
/** @type {(() => void) | null} */
let teardown = null;

function reducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function updateSheen(y) {
	const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
	const t = Math.min(Math.max(y / max, 0), 1);
	/* Highlight drifts across the gradient text like light moving over a surface */
	const angle = 125 + t * 70;
	const posX = t * 100;
	const posY = 30 + t * 40;
	document.documentElement.style.setProperty('--sheen-angle', `${angle.toFixed(1)}deg`);
	document.documentElement.style.setProperty(
		'--sheen-pos',
		`${posX.toFixed(1)}% ${posY.toFixed(1)}%`
	);
}

function update() {
	ticking = false;
	const y = window.scrollY;
	document.documentElement.style.setProperty('--scroll-y', `${y}px`);
	updateSheen(y);

	const nodes = document.querySelectorAll('[data-parallax]');
	for (const node of nodes) {
		const speed = Number(node.getAttribute('data-parallax')) || 0.12;
		const rect = node.getBoundingClientRect();
		const center = rect.top + rect.height / 2;
		const viewCenter = window.innerHeight / 2;
		const offset = (center - viewCenter) * speed;
		node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
	}
}

function onScroll() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(update);
}

export function startParallax() {
	if (!browser || started) return teardown;
	started = true;

	if (reducedMotion()) {
		return () => {
			started = false;
		};
	}

	update();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });

	teardown = () => {
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onScroll);
		document.documentElement.style.removeProperty('--scroll-y');
		document.documentElement.style.removeProperty('--sheen-angle');
		document.documentElement.style.removeProperty('--sheen-pos');
		document.querySelectorAll('[data-parallax]').forEach((node) => {
			node.style.transform = '';
		});
		started = false;
		teardown = null;
	};

	return teardown;
}
