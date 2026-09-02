<script>
  import { onMount, tick } from 'svelte';
  import LogoWithText from '$lib/components/LogoWithText.svelte';
  import DecorativeVideo from '$lib/components/DecorativeVideo.svelte';
  import { prefersReducedMotion } from '$lib/prefersReducedMotion.js';

  const acronyms = ['Dynamic', 'Intuitive', 'Predictive', 'Adaptive', 'Dynamic', 'Autonomous'];
  const displayList = [...acronyms, acronyms[0]];

  let currentIndex = 0;
  let acronymScrambled = [...displayList];
  let animate = true;
  let viewportWidth = 0;
  let timer;

  function randomizedFrom(original) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return original
      .split('')
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  }

  function scrambleInto(original, index) {
    let iterations = 0;
    const maxIterations = original.length + 1;

    acronymScrambled[index] = randomizedFrom(original);

    const iv = setInterval(() => {
      acronymScrambled[index] = original
        .split('')
        .map((char, i) => (i < iterations ? char : randomizedFrom('a').charAt(0)))
        .join('');

      iterations++;
      if (iterations > maxIterations) {
        acronymScrambled[index] = original;
        clearInterval(iv);
      }
    }, 65);
  }

  function preScramble(index) {
    scrambleInto(displayList[index], index);
  }

  function advance() {
    const next = currentIndex + 1;

    if (next < displayList.length) {
      preScramble(next);
    }

    animate = true;
    currentIndex = next;

    if (currentIndex === acronyms.length) {
      preScramble(0);

      setTimeout(async () => {
        animate = false;
        currentIndex = 0;
        await tick();
      }, 250);
    }
  }

  function startAcronymAnimation() {
    preScramble(0);
    preScramble(1);
    clearInterval(timer);
    timer = setInterval(advance, 3000);
  }

  function stopAcronymAnimation() {
    clearInterval(timer);
    timer = undefined;
    animate = false;
    currentIndex = 0;
    acronymScrambled = [...displayList];
  }

  onMount(() => {
    viewportWidth = window.innerWidth;
    const onResize = () => (viewportWidth = window.innerWidth);
    window.addEventListener('resize', onResize);

    const unsubscribe = prefersReducedMotion.subscribe((reduced) => {
      if (reduced) {
        stopAcronymAnimation();
      } else {
        startAcronymAnimation();
      }
    });

    return () => {
      window.removeEventListener('resize', onResize);
      unsubscribe();
      clearInterval(timer);
    };
  });

  $: translateValue =
    $prefersReducedMotion || !animate
      ? 'translateY(0)'
      : `translateY(-${currentIndex * (viewportWidth < 430 ? 64 : viewportWidth < 760 ? 96 : viewportWidth < 960 ? 112 : viewportWidth < 1500 ? 144 : 192)}px)`;
</script>

<section>
  <div class="video-container">
    <DecorativeVideo
      class="main-video"
      src="/assets/video/hero-data-network.mp4"
      poster="/assets/video/hero-data-network-poster.jpg"
      eager
    />
    <div class="logo-container">
      <LogoWithText />
    </div>
    <div class="subheadline">
      <div class="dynamic-intel-container">
        <div class="dynamic-text" aria-hidden="true">
          <div
            class="acronym-roller"
            class:static={$prefersReducedMotion}
            style="
              transform: {translateValue};
              transition: {animate && !$prefersReducedMotion ? 'transform 0.25s ease-in-out' : 'none'};
            "
          >
            {#each displayList as acronym, i}
              <div class="acronym">{acronymScrambled[i]}</div>
            {/each}
          </div>
        </div>
        <div class="lines">
          {#each Array(10) as _, i}
            <div class="line"></div>
          {/each}
        </div>
        <div class="static-text">
          <div>Analytics Redefined</div>
          <small>Powered by AI</small>
        </div>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/variables.scss' as *;

  .video-container :global(video) {
    display: block;
    width: 100%;
    height: auto;
    pointer-events: none;
    object-fit: cover;
  }

  .video-container {
    position: relative;
    z-index: 0;
    height: auto;
    margin: 0;
    isolation: isolate;
    mix-blend-mode: difference;

    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 4rem;
      max-height: 90vh;
      border-radius: $border-radius;
      box-shadow: 0 0 2rem $black;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
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

    :global(.main-video) {
      position: relative;
      z-index: 0;
      display: block;
      width: calc(100% - 2px);
      height: auto;
      margin: 1px;
      border-radius: inherit;
      opacity: 0.8;
    }

    .logo-container {
      position: absolute;
      top: 12%;
      left: 50%;
      z-index: 1;
      width: 50%;
      transform: translate(-50%, 0);

      @media screen and (min-width: $breakpoint-max-medium) {
        top: 4rem;
        left: 0;
        right: 0;
        width: 14%;
        margin: 0 auto;
        transform: translate(0, 0);
      }
    }

    .subheadline {
      margin: 3rem 2rem;

      @media screen and (min-width: $breakpoint-max-medium) {
        position: absolute;
        top: auto;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }

      @media screen and (min-width: $breakpoint-max-large) {
        top: 40%;
        bottom: auto;
        max-width: 94rem;
      }

      .dynamic-intel-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        height: auto;
        font-weight: 900;
        line-height: normal;

        @media screen and (min-width: $breakpoint-max-large) {
          flex-direction: row;
          height: 12rem;
          text-align: right;
          justify-content: center;
        }

        .dynamic-text {
          position: relative;
          flex: 0 0 4rem;
          overflow: hidden;

          @media screen and (min-width: $breakpoint-max-extrasmall) {
            flex: 0 0 6rem;
          }

          @media screen and (min-width: $breakpoint-max-small) {
            flex: 0 0 7rem;
          }

          @media screen and (min-width: $breakpoint-max-medium) {
            flex: 0 0 9rem;
          }

          @media screen and (min-width: $breakpoint-max-large) {
            position: relative;
            z-index: 1;
            flex: 0 0 auto;
            height: 13rem;
            font-size: calc(var(--fluid-7) + 1rem);
            letter-spacing: -0.25rem;
            text-align: right;
            transform: translate(0rem, -1rem);
          }

          .acronym-roller {
            display: flex;
            flex-direction: column;

            &.static .acronym:not(:first-child) {
              display: none;
            }
          }

          .acronym {
            display: flex;
            align-items: flex-start;
            color: $secondary-active;
            justify-content: flex-start;
            font-size: 3rem;
            line-height: 4rem;

            @media screen and (min-width: $breakpoint-max-extrasmall) {
              font-size: 4rem;
              line-height: 6rem;
            }

            @media screen and (min-width: $breakpoint-max-small) {
              font-size: 6rem;
              line-height: 7rem;
            }

            @media screen and (min-width: $breakpoint-max-medium) {
              justify-content: center;
              font-size: 8rem;
              line-height: 9rem;
            }

            @media screen and (min-width: $breakpoint-max-large) {
              align-items: center;
              justify-content: flex-end;
              height: 12rem;
              text-shadow: 0 0.2rem 0.2rem $green-800;
            }
          }
        }

        .lines {
          position: relative;
          z-index: 0;
          flex: 0 0 auto;

          .line {
            display: none;

            @media screen and (min-width: $breakpoint-max-large) {
              position: absolute;
              top: -3rem;
              display: block;
              width: 1px;
              height: 18rem;
              background: $white;
              transform: rotate(44deg);
              margin: 0 auto;
              mix-blend-mode: saturation;
            }

            &:nth-child(1) {
              transform: translate(-2rem, 0) rotate(44deg);
              opacity: 0.1;
            }

            &:nth-child(2) {
              transform: translate(-1.5rem, 0) rotate(44deg);
              opacity: 0.25;
            }

            &:nth-child(3) {
              transform: translate(-1rem, 0) rotate(44deg);
              opacity: 0.5;
            }

            &:nth-child(4) {
              transform: translate(-0.5rem, 0) rotate(44deg);
              opacity: 0.75;
            }

            &:nth-child(5) {
              transform: translate(0rem, 0) rotate(44deg);
              opacity: 1;
            }

            &:nth-child(6) {
              transform: translate(0.5rem, 0) rotate(44deg);
              opacity: 1;
            }

            &:nth-child(7) {
              transform: translate(1rem, 0) rotate(44deg);
              opacity: 0.75;
            }

            &:nth-child(8) {
              transform: translate(1.5rem, 0) rotate(44deg);
              opacity: 0.5;
            }

            &:nth-child(9) {
              transform: translate(2rem, 0) rotate(44deg);
              opacity: 0.25;
            }

            &:nth-child(10) {
              transform: translate(2.5rem, 0) rotate(44deg);
              opacity: 0.1;
            }
          }
        }

        .static-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 0 0 auto;
          margin: 0;
          font-size: var(--fluid-5);
          line-height: var(--fluid-5);

          @media screen and (min-width: $breakpoint-max-medium) {
            align-items: center;
            font-size: var(--fluid-4);
            line-height: var(--fluid-5);
          }

          @media screen and (min-width: $breakpoint-max-large) {
            position: relative;
            z-index: 1;
            flex: 1 1 auto;
            align-items: flex-start;
            justify-content: center;
            margin: 0 0 0 1rem;
            padding: 0;
            font-size: var(--fluid-5);
            line-height: var(--fluid-5);
            text-align: left;
            text-shadow: 0 0.2rem 0.2rem $green-800;
          }

          div {
            @media screen and (min-width: $breakpoint-max-medium) {
              margin: 0 auto;
              text-align: center;
            }

            @media screen and (min-width: $breakpoint-max-large) {
              margin: 0;
              text-align: left;
            }
          }

          small {
            font-family: $geist;
            font-size: var(--fluid-1);
            font-weight: 900;
            letter-spacing: 0.25rem;
            line-height: var(--fluid-3);
            text-transform: uppercase;
            text-shadow: 0 0.2rem 0.2rem $green-800;

            @media screen and (min-width: $breakpoint-max-large) {
              font-size: var(--fluid-2);
              letter-spacing: 0.5rem;
              text-align: left;
            }
          }
        }
      }
    }
  }
</style>
