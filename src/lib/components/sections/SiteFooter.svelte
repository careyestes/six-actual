<script>
  import { onMount } from 'svelte';
  import Logo from '$lib/components/LogoMark.svelte';

  /** @type {HTMLElement | undefined} */
  let footerEl;
  /** @type {HTMLVideoElement | undefined} */
  let videoEl;

  // The journey stacks scenes, so play only while this one is actually showing.
  onMount(() => {
    const footer = footerEl;
    const video = videoEl;
    if (!footer || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // poster only
    let playing = false;
    const check = () => {
      const visible = parseFloat(getComputedStyle(footer).opacity) > 0.02;
      if (visible && !playing) {
        playing = true;
        video.play().catch(() => {});
      } else if (!visible && playing) {
        playing = false;
        video.pause();
      }
    };
    check();
    const id = window.setInterval(check, 250);
    return () => window.clearInterval(id);
  });
</script>

<footer data-scene="footer" bind:this={footerEl} aria-labelledby="footer-title">
  <video
    class="bg"
    bind:this={videoEl}
    src="/assets/video/footer-trusted-decisions.mp4"
    poster="/assets/video/footer-trusted-decisions-poster.jpg"
    muted
    loop
    playsinline
    preload="auto"
    aria-hidden="true"
    tabindex="-1"
  ></video>
  <!-- Pushes the video back so the copy leads. -->
  <div class="scrim" aria-hidden="true"></div>

  <div class="inner">
    <h2 id="footer-title" data-depth-item>
      <span class="sheen">What we're building doesn't just inform decisions.</span>
      <span class="sheen-accent">It's trusted to make them.</span>
    </h2>

    <div class="meta" data-depth-item>
      <span class="mark" aria-hidden="true"><Logo /></span>
      <small>© {new Date().getFullYear()} Six Actual</small>
    </div>
  </div>
</footer>

<style lang="scss">
  @use '../../styles/variables.scss' as *;

  /* Black: the cursor block from the previous scene zooms until it fills the screen. */
  footer {
    position: relative;
    overflow: hidden;
    background: #000;
  }

  .bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Over the black footer: lower opacity pushes the video back. */
    opacity: 0.32;
    pointer-events: none;
  }

  .scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      radial-gradient(110% 85% at 30% 45%, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.8) 100%),
      rgba(0, 0, 0, 0.3);
  }

  .inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    width: 100%;
    max-width: $container-max-width;
    margin: 0 auto;
    box-sizing: border-box;
    padding: clamp(4rem, 10vw, 8rem) $page-gutter clamp(1.25rem, 2.5vw, 2rem);
    /* In the pinned journey the footer fills the viewport: stretch so the meta row can sit on
       the bottom edge. */
    align-self: stretch;
  }

  h2 {
    display: flex;
    flex-direction: column;
    gap: 0.12em;
    max-width: 26ch;
    /* Headline floats in the space above the bottom bar. */
    margin-block: auto;
    font-size: var(--display-md);
    text-shadow: 0 2px 24px rgba(0, 0, 0, 0.55);

    span {
      display: block;
    }
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    /* Stuck to the bottom of the screen. */
    margin-top: auto;
    padding-top: 1.25rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-faint);
    font-family: $mono;
    font-size: clamp(0.75rem, 0.9vw, 0.95rem);
    letter-spacing: 0.08em;
  }

  .mark {
    display: block;
    color: var(--color-foreground);
    opacity: 0.8;

    :global(svg) {
      display: block;
      width: 1.6rem;
      height: auto;
    }
  }

</style>
