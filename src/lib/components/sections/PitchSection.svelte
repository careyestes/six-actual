<script>
  import { onMount } from 'svelte';

  /** @type {import('svelte').Component | null} */
  let Blocks = $state(null);
  /** @type {HTMLElement | undefined} */
  let anchor = $state();

  onMount(() => {
    import('$lib/components/three/BuildingBlocks3D.svelte')
      .then((mod) => {
        Blocks = mod.default;
      })
      .catch((err) => console.error('[pitch] building blocks failed to load', err));
  });
</script>

<section class="pitch" data-scene="pitch" aria-labelledby="pitch-title">
  <h2 id="pitch-title" class="sr-only">About Six Actual</h2>
  <!-- Engineered wireframe blocks assemble, hold, and lift away on a loop. The canvas
       spans the whole scene (so nothing clips) and frames the tower over `.slot`. -->
  <div class="blocks" aria-hidden="true">
    {#if Blocks && anchor}<Blocks {anchor} />{/if}
  </div>

  <div class="layout" data-exit-clear>
    <div class="slot" bind:this={anchor} aria-hidden="true"></div>

    <div class="card">
      <p class="body lead" data-depth-item>
        At Six Actual, we are building a new class of software—agentic by design—purpose-built for
        organizations, commercial and public sector, that can't rely on hindsight or wait on a human
        in the loop for every decision.
      </p>
      <hr class="rule" data-depth-item aria-hidden="true" />
      <p class="body stakes" data-depth-item>
        It is engineered for environments where the data is complex, the stakes are high, and
        "close enough" isn't good enough.
      </p>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/variables.scss' as *;

  .pitch {
    position: relative;
    padding: clamp(3rem, 8vw, 6rem) $page-gutter;
  }

  .blocks {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  /* In the pinned journey the scene is a full-viewport layer; fill it so the two columns
     scale with the screen. */
  :global(.is-deck) .pitch {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    padding: clamp(1.5rem, 4vw, 4rem);
  }

  /* Bricks on the left, text on the right. Everything is sized from the viewport. */
  .layout {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    align-items: center;
    column-gap: clamp(1.5rem, 5vw, 6rem);
    width: 100%;
    max-width: 112rem;
    margin: 0 auto;
    box-sizing: border-box;
    padding: clamp(0.75rem, min(5vw, 5svh), 6rem);
  }

  .slot {
    width: 100%;
    aspect-ratio: 1.15;
    max-height: 66svh;
    pointer-events: none;
  }

  .card {
    width: 100%;
    max-width: 50rem;
    padding: clamp(0.75rem, min(2.6vw, 3.4svh), 3rem);
    border-color: rgba(146, 235, 155, 0.5);
    box-shadow: 0 0 0 1px rgba(146, 235, 155, 0.06), 0 0 3rem rgba(146, 235, 155, 0.06);
  }

  /* Narrow screens: bricks above, text below. */
  @media (max-width: 800px) and (orientation: portrait), (max-width: 560px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      row-gap: clamp(0.5rem, 2vw, 1.5rem);
    }

    .slot {
      aspect-ratio: auto;
      height: clamp(10rem, 36svh, 24rem);
      max-height: none;
    }

    /* Phones in portrait: comfortable reading size, still bounded by the screen height. */
    .body {
      font-size: clamp(0.95rem, min(4.2vw, 2.7svh), 1.5rem);
    }
  }

  .body {
    margin: 0;
    /* Scales with the viewport (width, capped by height so it never overflows short screens). */
    font-size: clamp(0.8rem, min(1.85vw, 3.4svh), 2.4rem);
    line-height: 1.45;
    letter-spacing: -0.012em;
    text-wrap: pretty;
  }

  .lead {
    color: rgba(206, 230, 212, 0.72);
  }

  .stakes {
    color: var(--color-foreground);
    font-weight: 500;
  }

  .rule {
    height: 1px;
    margin: clamp(0.6rem, min(2.2vw, 2.4svh), 2.25rem) 0;
    border: 0;
    background: rgba(146, 235, 155, 0.45);
  }
</style>
