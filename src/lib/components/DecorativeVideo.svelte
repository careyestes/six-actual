<script>
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/prefersReducedMotion.js';

	/** @type {string} */
	export let src = '';
	/** @type {string} */
	export let poster = '';
	/** @type {number} */
	export let width = 400;
	/** When true, preload and play immediately (hero). Otherwise lazy-load on scroll. */
	export let eager = false;
	let className = '';
	export { className as class };

	let videoEl;
	let shouldLoad = eager;

	function syncPlayback(reduced) {
		if (!videoEl || !shouldLoad) return;

		if (reduced) {
			videoEl.pause();
		} else {
			videoEl.play().catch(() => {});
		}
	}

	function startLazyLoad(reduced) {
		shouldLoad = true;
		// Re-bind source then load/play after DOM update
		queueMicrotask(() => {
			if (!videoEl) return;
			videoEl.load();
			syncPlayback(reduced);
		});
	}

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const unsubscribeMotion = prefersReducedMotion.subscribe(syncPlayback);

		if (eager) {
			syncPlayback(reduced);
			return unsubscribeMotion;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					startLazyLoad(reduced);
					observer.disconnect();
					break;
				}
			},
			{ rootMargin: '200px 0px' }
		);

		observer.observe(videoEl);

		return () => {
			observer.disconnect();
			unsubscribeMotion();
		};
	});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video
	bind:this={videoEl}
	class={className}
	{width}
	poster={poster || null}
	autoplay={eager && !$prefersReducedMotion}
	muted
	playsinline
	loop={!$prefersReducedMotion}
	preload={$prefersReducedMotion ? 'metadata' : eager ? 'auto' : 'none'}
	aria-hidden="true"
>
	{#if shouldLoad}
		<source {src} type="video/mp4" />
	{/if}
	Your browser does not support HTML5 video.
</video>

<style lang="scss">
	video {
		@media (prefers-reduced-motion: reduce) {
			display: none;
		}
	}
</style>
