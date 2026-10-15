<script>
  import { onMount } from 'svelte';
  import LogoWithText from '$lib/components/LogoWithText.svelte';
  import HeroForecast from '$lib/components/HeroForecast.svelte';
  import { heroOpeningDone } from '$lib/heroBrand.js';

  let brandReady = $state(false);
  /** @type {import('svelte').Component | null} */
  let Logo3D = $state(null);
  let loadError = $state(false);

  onMount(() => {
    import('$lib/components/three/HeroLogo3D.svelte')
      .then((mod) => {
        Logo3D = mod.default;
      })
      .catch((err) => {
        console.error('[hero] 3D logo failed to load', err);
        loadError = true;
        brandReady = true;
        heroOpeningDone.set(true);
      });

    return () => {
      heroOpeningDone.set(false);
    };
  });

  function onLogoReady() {
    brandReady = true;
    heroOpeningDone.set(true);
  }
</script>

<section class="hero" class:brand-ready={brandReady} data-scene="hero" aria-labelledby="hero-title">
  <div class="stage">
    <div class="brand">
      <div class="mark">
        {#if Logo3D}
          <Logo3D onready={onLogoReady} />
        {:else if loadError}
          <div class="fallback"><LogoWithText /></div>
        {/if}
      </div>
    </div>

    <div class="cue-wrap" data-hero-cue aria-hidden="true">
      <div class="cue"><span></span></div>
    </div>
  </div>

  <!-- The headline lives on the green you land in after diving through the 6. -->
  <div class="panel" data-hero-panel>
    <!-- Observed (stats) on the left, inferred (what happens next) on the right. -->
    <div class="visual" data-hero-visual><HeroForecast /></div>
    <h1 id="hero-title" aria-label="Most analytics tells you what happened. Ours decides what happens next.">
      <span class="line line-a" data-hero-line>Most analytics tells you what happened.</span>
      <span class="line rule" data-hero-line aria-hidden="true"></span>
      <span class="line line-b" data-hero-line>Ours dec<span class="zoom-i" data-hero-i>i</span>des what happens next.</span>
    </h1>
    <!-- The zoom into the "i" ends in pure black. -->
    <div class="void" data-hero-void aria-hidden="true"></div>
    <!-- The site grid arrives as the "i" closes in, so it is already in place at full screen. -->
    <div class="grid-veil" data-hero-grid aria-hidden="true"></div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/variables.scss' as *;

  .hero {
    position: relative;
  }

  .stage {
    position: relative;
    height: 100svh;
    min-height: 28rem;
  }

  .brand {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .mark {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 0 $page-gutter;
    color: var(--color-foreground);

    :global(svg) {
      display: block;
      width: min(34rem, 72vw);
      height: auto;
    }
  }

  .cue-wrap {
    position: absolute;
    left: 50%;
    bottom: clamp(1.25rem, 4vh, 2.5rem);
    transform: translateX(-50%);
    z-index: 2;
  }

  .cue {
    opacity: 0;
    transition: opacity 0.55s ease 0.15s;

    .brand-ready & {
      opacity: 1;
    }

    span {
      display: block;
      width: 1px;
      height: 2.75rem;
      background: linear-gradient(to bottom, transparent, var(--color-border-strong));
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .brand-ready .cue span {
      animation: drift 2.6s ease-in-out infinite;
    }
  }

  /* The deep green you land in after diving through the 6 (same family as the next scenes). */
  .panel {
    position: relative;
    z-index: 3;
    display: grid;
    place-items: center;
    padding: clamp(4rem, 12vw, 8rem) $page-gutter;
    color: #d8ffe0;
    background:
      radial-gradient(110% 85% at 22% 12%, rgba(146, 235, 155, 0.12) 0%, transparent 58%),
      radial-gradient(100% 80% at 85% 95%, rgba(2, 18, 8, 0.28) 0%, transparent 62%),
      /* Light enough that the black headline keeps >= 3:1 (large-text AA) against it. */
      #2b7044;
  }

  .void {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: $near-black;
    opacity: 0;
    pointer-events: none;
  }

  .grid-veil {
    position: absolute;
    inset: 0;
    z-index: 3;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;

    /* Same grid, scale and falloff as the page background (see app.scss / Journey.svelte). */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--grid-line) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
      background-size: 68px 68px;
      transform: scale(var(--grid-scale, 1));
      transform-origin: 50% 50%;
      -webkit-mask-image: radial-gradient(85% 70% at 50% 50%, #000 10%, transparent 78%);
      mask-image: radial-gradient(85% 70% at 50% 50%, #000 10%, transparent 78%);
    }
  }

  .visual {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  h1 {
    position: relative;
    z-index: 1;
    /* Equal rows above and below the rule keep it on the panel's exact centre line, which is the
       baseline of the diagram behind (bars above, net below). */
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    justify-items: center;
    row-gap: clamp(1.25rem, 3.4vw, 2.5rem);
    margin: 0;
    max-width: 18ch;
    text-align: center;
    font-size: clamp(2.2rem, 4.7vw, 5rem);
    line-height: 1.04;
    letter-spacing: -0.045em;

    .line {
      display: block;
      transform-origin: 50% 50%;
    }

    .line-a {
      align-self: end;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.95);
    }

    .line-b {
      align-self: start;
      font-weight: 700;
      color: #000;
    }

    /* Divider between "what happened" and "what happens next". */
    .rule {
      width: min(62vw, 56rem);
      height: 1px;
      background: rgba(190, 255, 200, 0.55);
    }
  }

  /* Scroll journey: the panel is a full-screen layer over the canvas. */
  :global(.is-deck) .panel {
    position: absolute;
    inset: 0;
    padding: $page-gutter;
  }

  @keyframes drift {
    0%,
    100% {
      opacity: 0.25;
      transform: translateY(-25%) scaleY(0.7);
    }
    50% {
      opacity: 1;
      transform: translateY(0) scaleY(1);
    }
  }
</style>
