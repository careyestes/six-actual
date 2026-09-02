import { readable } from 'svelte/store';

export const prefersReducedMotion = readable(false, (set) => {
	const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
	set(mq.matches);

	const onChange = (event) => set(event.matches);
	mq.addEventListener('change', onChange);

	return () => mq.removeEventListener('change', onChange);
});
