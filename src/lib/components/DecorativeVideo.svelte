<script>
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/prefersReducedMotion.js';
	import { waitForVideoTurn, releaseVideoTurn } from '$lib/videoLoadQueue.js';

	/** @type {string} */
	export let src = '';
	/** @type {string} */
	export let poster = '';
	/** @type {number} */
	export let width = 400;
	/**
	 * DOM load order. Lower loads first.
	 * 0 = hero (always first), higher = later sections, footer last.
	 * @type {number}
	 */
	export let priority = 99;
	let className = '';
	export { className as class };

	$: isHero = priority === 0;

	let videoEl;
	let shouldLoad = false;
	let videoReady = false;
	let released = false;

	function releaseOnce() {
		if (released) return;
		released = true;
		releaseVideoTurn(priority);
	}

	function syncPlayback(reduced) {
		if (!videoEl || !shouldLoad || reduced) return;
		videoEl.play().catch(() => {});
	}

	async function beginLoad() {
		shouldLoad = true;
		await Promise.resolve();
		if (!videoEl) return;
		videoEl.load();
		syncPlayback(false);
	}

	function onVideoReady() {
		videoReady = true;
	}

	function onCanPlay() {
		videoReady = true;
		releaseOnce();
	}

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const unsubscribeMotion = prefersReducedMotion.subscribe((isReduced) => {
			if (isReduced) {
				videoEl?.pause();
				releaseOnce();
				return;
			}
			if (shouldLoad) {
				syncPlayback(false);
			}
		});

		if (reduced) {
			releaseOnce();
			return unsubscribeMotion;
		}

		let cancelled = false;

		(async () => {
			await waitForVideoTurn(priority);
			if (cancelled) return;
			await beginLoad();
		})();

		return () => {
			cancelled = true;
			releaseOnce();
			unsubscribeMotion();
		};
	});
</script>

<div
	class="decorative-media {className}"
	class:ready={videoReady}
	aria-hidden="true"
>
	{#if poster}
		<img
			class="poster"
			src={poster}
			alt=""
			width={width}
			decoding="async"
			loading={isHero ? 'eager' : 'lazy'}
			fetchpriority={isHero ? 'high' : priority >= 4 ? 'low' : 'auto'}
		/>
	{/if}

	{#if !$prefersReducedMotion}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			bind:this={videoEl}
			{width}
			muted
			playsinline
			loop
			autoplay={isHero}
			preload={shouldLoad ? 'auto' : 'none'}
			on:loadeddata={onVideoReady}
			on:canplay={onCanPlay}
			on:playing={onVideoReady}
			on:error={releaseOnce}
		>
			{#if shouldLoad}
				<source {src} type="video/mp4" />
			{/if}
		</video>
	{/if}
</div>

<style lang="scss">
	.decorative-media {
		position: relative;
		display: block;
		overflow: hidden;
		pointer-events: none;

		.poster {
			display: block;
			width: 100%;
			height: auto;
			object-fit: cover;
		}

		video {
			position: absolute;
			inset: 0;
			z-index: 1;
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0;
			transition: opacity 0.35s ease;
		}

		&.ready video {
			opacity: 1;
		}

		&:not(:has(.poster)) {
			.poster {
				display: none;
			}

			video {
				position: relative;
				inset: auto;
				height: auto;
				opacity: 1;
			}
		}
	}
</style>
