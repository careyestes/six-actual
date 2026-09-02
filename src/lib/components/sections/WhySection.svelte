<script>
  import DecorativeVideo from '$lib/components/DecorativeVideo.svelte';
</script>

<section class="why">
  <div class="row-images">
    <div class="offset-image left">
      <DecorativeVideo
        class="row-left-video"
        src="/assets/video/why-autonomous.mp4"
        poster="/assets/video/why-autonomous-poster.jpg"
        priority={2}
      />
    </div>
    <div class="text-column">
      <h2>
        Autonomous where it counts<span class="text-color-red">.</span>
        <br aria-hidden="true" />
        Accountable at every step<span class="text-color-red">.</span>
      </h2>
      <p>
        Our team is comprised of operators, engineers, and researchers with a track record in
        mission-critical systems, regulated industries, and national-scale data infrastructure.
      </p>
    </div>
    <div class="offset-image right">
      <DecorativeVideo
        class="row-right-video"
        src="/assets/video/why-accountable.mp4"
        poster="/assets/video/why-accountable-poster.jpg"
        priority={3}
      />
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/variables.scss' as *;

  .row-images {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    @media screen and (min-width: $breakpoint-max-medium) {
      flex-direction: row;
      margin-top: 8rem;
    }

    div {
      flex: 1 1 20rem;

      @media screen and (min-width: $breakpoint-max-medium) {
        flex: 1 1 20%;
      }

      &.text-column {
        order: -1;
        flex: 1 1 auto;
        margin: 0 1rem;
        font-size: var(--fluid-0);
        line-height: var(--fluid-2);

        @media screen and (min-width: $breakpoint-max-medium) {
          order: 0;
          flex: 1 1 30%;
          margin: 0;
          font-size: var(--fluid-0);
          line-height: var(--fluid-1);
        }

        h2 {
          margin: 8rem 0 2rem;
          font-size: var(--fluid-4);
          line-height: var(--fluid-5);
          text-align: center;

          @media screen and (min-width: $breakpoint-max-medium) {
            margin: 0 0 2rem;
            font-size: var(--fluid-3);
            line-height: var(--fluid-5);
          }
        }

        p {
          margin: 0 1rem;
          font-size: var(--fluid-0);
          line-height: calc(var(--fluid-2) + 0.2rem);

          @media screen and (min-width: $breakpoint-max-medium) {
            margin: 0 auto;
            padding: 1rem 3rem;
            font-size: var(--fluid-1);
            line-height: var(--fluid-3);
          }
        }
      }
    }

    .offset-image {
      position: relative;
      overflow: hidden;
      isolation: isolate;
      filter: hue-rotate(-40deg);

      @media screen and (min-width: $breakpoint-max-medium) {
        border-radius: $border-radius;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: inherit;
          padding: 1px;
          background: $gradient-green;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 1;
      }

      &.left {
        @media screen and (min-width: $breakpoint-max-medium) {
          border-radius: 0 $border-radius $border-radius 0;

          &::before {
            padding-left: 0;
          }
        }
      }

      &.right {
        @media screen and (min-width: $breakpoint-max-medium) {
          border-radius: $border-radius 0 0 $border-radius;

          &::before {
            padding-right: 0;
          }
        }
      }

      :global(.decorative-media) {
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%);
        z-index: -1;
        pointer-events: none;
      }

      :global(.decorative-media .poster),
      :global(.decorative-media video) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
</style>
