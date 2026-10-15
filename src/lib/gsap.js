/**
 * Client-only GSAP bootstrap (dynamic import — safe for SvelteKit SSR).
 */
import { browser } from '$app/environment';

/** @type {typeof import('gsap').gsap | null} */
let gsapRef = null;
/** @type {typeof import('gsap/ScrollTrigger').ScrollTrigger | null} */
let scrollTriggerRef = null;
let registered = false;
/** @type {Promise<{ gsap: typeof import('gsap').gsap, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }> | null} */
let loading = null;

/**
 * Load and register GSAP + ScrollTrigger. Call only from browser (onMount / actions).
 */
export async function ensureGsap() {
	if (!browser) {
		throw new Error('[gsap] ensureGsap() is client-only');
	}
	if (registered && gsapRef && scrollTriggerRef) {
		return { gsap: gsapRef, ScrollTrigger: scrollTriggerRef };
	}
	if (loading) return loading;

	loading = (async () => {
		const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
			import('gsap'),
			import('gsap/ScrollTrigger')
		]);
		gsap.registerPlugin(ScrollTrigger);
		gsapRef = gsap;
		scrollTriggerRef = ScrollTrigger;
		registered = true;
		return { gsap, ScrollTrigger };
	})();

	return loading;
}
