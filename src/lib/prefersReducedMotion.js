import { readable } from 'svelte/store';
import { browser } from '$app/environment';

export const prefersReducedMotion = readable(false, (set) => {
	if (!browser) return;

	const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
	set(mq.matches);

	const onChange = (event) => set(event.matches);
	mq.addEventListener('change', onChange);

	return () => mq.removeEventListener('change', onChange);
});
