import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		// Bundle GSAP for SSR so Node doesn't try to load its ESM entry as CJS
		noExternal: ['gsap']
	},
	optimizeDeps: {
		include: ['gsap', 'gsap/ScrollTrigger']
	}
});
