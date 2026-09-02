<script>
  import DecorativeVideo from '$lib/components/DecorativeVideo.svelte';
</script>

<section class="pitch-text">
  <DecorativeVideo src="/assets/video/pitch-agentic-analytics.mp4" />
  <div class="headline">
    <h1>
      <small>Most analytics tells you what happened.</small>
      <div class="shine-wrap">
        <span class="text-color-red">Ours decides what happens next.</span>
        <span class="overlay-stroke" aria-hidden="true">Ours decides what happens next.</span>
      </div>
    </h1>
  </div>
  <p class="max-width">
    At Six Actual, we are building a new class of software—agentic by design—purpose-built for
    organizations, commercial and public sector, that can't rely on hindsight or wait on a human in
    the loop for every decision. It is engineered for environments where the data is complex, the
    stakes are high, and "close enough" isn't good enough.
  </p>
</section>

<style lang="scss">
  @use '../../styles/variables.scss' as *;
  @use '../../styles/shine' as *;

  @include shine-wrap;

  .max-width {
    max-width: $text-max-width;
    margin: 0 auto;
  }

  .headline {
    position: relative;
    margin: 1rem 2rem;
    z-index: 1;

    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 0 auto;
      padding: 0rem 10rem 4rem;
      text-align: center;
    }

    @media screen and (min-width: $breakpoint-max-large) {
      padding: 0rem 20rem 4rem;
    }

    h1 {
      display: flex;
      flex-direction: column;
      font-size: var(--fluid-3);
      line-height: var(--fluid-4);

      @media screen and (min-width: $breakpoint-max-medium) {
        font-size: var(--fluid-7);
        line-height: var(--fluid-7);
      }

      small {
        font-size: var(--fluid-2);
        line-height: var(--fluid-2);

        @media screen and (min-width: $breakpoint-max-large) {
          font-size: var(--fluid-4);
          line-height: var(--fluid-6);
        }
      }
    }
  }

  .pitch-text {
    position: relative;

    :global(video) {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 0;
      width: 100%;
      height: auto;
      margin: 0 auto;
      pointer-events: none;
      object-fit: cover;
      mix-blend-mode: color-dodge;
      filter: hue-rotate(210deg) opacity(0.6) blur(3px) grayscale(0.5);
    }

    p {
      position: relative;
      z-index: 1;
      margin: 0 2rem;
      font-size: var(--fluid-0);
      line-height: calc(var(--fluid-2) + 0.2rem);

      @media screen and (min-width: $breakpoint-max-medium) {
        margin: 0 2rem;
        font-size: var(--fluid-1);
        line-height: var(--fluid-3);
      }

      @media screen and (min-width: $breakpoint-max-large) {
        margin: 0 auto;
      }
    }
  }
</style>
