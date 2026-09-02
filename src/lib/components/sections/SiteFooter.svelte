<script>
  import Logo from '$lib/components/LogoMark.svelte';
  import DecorativeVideo from '$lib/components/DecorativeVideo.svelte';
</script>

<footer>
  <DecorativeVideo
    class="row-left-video"
    src="/assets/video/footer-trusted-decisions.mp4"
  />
  <h2>
    <small>What we're building doesn't just inform decisions.</small>
    <div class="shine-wrap">
      <span class="text-color-red">It's trusted to make them.</span>
      <span class="overlay-stroke" aria-hidden="true">It's trusted to make them.</span>
    </div>
  </h2>

  <div class="citation">
    <Logo />
    <small>© {new Date().getFullYear()} Six Actual</small>
  </div>
</footer>

<style lang="scss">
  @use '../../styles/variables.scss' as *;
  @use '../../styles/shine' as *;

  @include shine-wrap;

  footer {
    position: relative;
    margin: 0;
    padding: 4rem 0;
    overflow: hidden;

    :global(video) {
      display: block;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: translate(0%, 0%) scale(1.3);
      transform-origin: top left;
      z-index: -1;
      pointer-events: none;
      mix-blend-mode: color-dodge;
      filter: hue-rotate(-30deg) opacity(0.3);
    }

    h2 {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: $container-max-width;
      margin: 0 auto;
      padding: 8rem 4rem 0;
      font-size: var(--fluid-7);
      line-height: var(--fluid-7);
      text-align: center;

      small {
        @media screen and (min-width: $breakpoint-max-medium) {
          font-size: var(--fluid-4);
          line-height: var(--fluid-5);
        }
      }
    }

    .citation {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin: 10rem 0 0;
      text-align: center;
      svg {
        mix-blend-mode: hard-light;
      }
    }
  }
</style>
