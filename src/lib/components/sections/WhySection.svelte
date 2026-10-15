<script>
  import { onMount } from 'svelte';

  /** @type {HTMLDivElement | undefined} */
  let stageEl = $state();
  /** @type {{ d: string; x0: number; y0: number; x1: number; y1: number }[]} */
  let paths = $state([]);
  let size = $state({ w: 0, h: 0 });

  // Side by side on desktops/tablets and on landscape phones; stacked otherwise.
  const SIDE_BY_SIDE = '(min-width: 900px), (min-width: 600px) and (orientation: landscape)';

  /** Offset of `el` inside `stage` (layout px, unaffected by the scene's transforms). */
  const offsetIn = (/** @type {HTMLElement} */ el, /** @type {HTMLElement} */ stage) => {
    let x = 0;
    let y = 0;
    /** @type {HTMLElement | null} */
    let n = el;
    while (n && n !== stage) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = /** @type {HTMLElement | null} */ (n.offsetParent);
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };

  // Lines run from the big heading shape out to every smaller shape.
  function measure() {
    if (!stageEl) return;
    const stage = stageEl;
    size = { w: stage.offsetWidth, h: stage.offsetHeight };
    const side = stage.querySelector('[data-source]');
    // Stacked (narrow) layout: no lines.
    if (!side || !window.matchMedia(SIDE_BY_SIDE).matches) {
      paths = [];
      return;
    }
    const s = offsetIn(/** @type {HTMLElement} */ (side), stage);
    const x0 = s.x + s.w;
    const y0 = s.y + s.h / 2;
    paths = [...stage.querySelectorAll('[data-target]')].map((t) => {
      const r = offsetIn(/** @type {HTMLElement} */ (t), stage);
      const x1 = r.x;
      const y1 = r.y + r.h / 2;
      const dx = (x1 - x0) * 0.55;
      return { d: `M ${x0} ${y0} C ${x0 + dx} ${y0}, ${x1 - dx} ${y1}, ${x1} ${y1}`, x0, y0, x1, y1 };
    });
  }

  onMount(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageEl) ro.observe(stageEl);
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  });
</script>

<section class="why" data-scene="why" aria-labelledby="why-title">
  <!-- A screen: scanlines and a fine grid that crosses behind everything. -->
  <div class="screen" aria-hidden="true"></div>

  <div class="stage" bind:this={stageEl} data-zoom-root>
    <svg
      class="lines"
      width={size.w}
      height={size.h}
      viewBox="0 0 {size.w} {size.h}"
      aria-hidden="true"
      focusable="false"
      data-depth-item
    >
      {#each paths as p (p.d)}
        <path class="band" d={p.d} />
        <path class="hair" d={p.d} />
        <path class="chase" d={p.d} />
      {/each}
    </svg>

    <div class="big" data-source data-depth-item>
      <h2 id="why-title">
        <span class="sheen">Autonomous where it counts.</span>
        <span class="sheen-accent">Accountable at every step.</span>
      </h2>
      <!-- Blinking terminal cursor: the exit zooms into this. -->
      <span class="cursor" data-zoom-target aria-hidden="true"></span>
    </div>

    <div class="side">
      <div class="shape empty" data-target data-depth-item></div>
      <div class="shape empty" data-target data-depth-item></div>
      <div class="shape sub" data-target data-depth-item>
        <p class="body">
          Our team is comprised of operators, engineers, and researchers with a track record in
          mission-critical systems, regulated industries, and national-scale data infrastructure.
        </p>
      </div>
      <div class="shape empty" data-target data-depth-item></div>
      <div class="shape empty" data-target data-depth-item></div>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/variables.scss' as *;

  /* Deep green: the pitch's block lands here, so its top face uses this exact colour. */
  .why {
    position: relative;
    overflow: hidden;
    padding: clamp(4rem, 10vw, 8rem) $page-gutter;
    color: #d8ffe0;
    background:
      radial-gradient(110% 85% at 18% 8%, rgba(146, 235, 155, 0.1) 0%, transparent 58%),
      radial-gradient(100% 80% at 88% 96%, rgba(2, 18, 8, 0.4) 0%, transparent 65%),
      #1e5231;
  }

  /* Scanlines, like a screen. */
  .screen {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(2, 18, 8, 0.28) 0 1px,
      transparent 1px 4px
    );
    -webkit-mask-image: radial-gradient(130% 110% at 50% 50%, #000 35%, rgba(0, 0, 0, 0.45) 100%);
    mask-image: radial-gradient(130% 110% at 50% 50%, #000 35%, rgba(0, 0, 0, 0.45) 100%);
  }

  .stage {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    /* Scales with the screen: wide margins and type follow the viewport instead of stopping at
       the page container width. */
    max-width: 130rem;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0 clamp(1.25rem, 5vw, 7rem);

    @media screen and (min-width: 900px), screen and (min-width: 600px) and (orientation: landscape) {
      flex-direction: row;
      align-items: stretch;
      gap: clamp(4rem, 11vw, 14rem);
    }
  }

  .lines {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: visible;

    .band {
      fill: none;
      stroke: rgba(146, 235, 155, 0.09);
      stroke-width: 14;
      stroke-linecap: round;
    }

    .hair {
      fill: none;
      stroke: rgba(146, 235, 155, 0.32);
      stroke-width: 1.5;
    }

    /* Small chasing pieces. */
    .chase {
      fill: none;
      stroke: rgba(200, 255, 210, 0.85);
      stroke-width: 2.4;
      stroke-dasharray: 3 15;
      stroke-linecap: round;
      animation: flow 1.1s linear infinite;
    }
  }

  @keyframes flow {
    to {
      stroke-dashoffset: -36;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lines .chase,
    .cursor {
      animation: none;
    }
  }

  /* Shapes (sit above the lines so dots appear to leave and enter them). */
  .big,
  .shape {
    position: relative;
    z-index: 1;
    border: 2px solid rgba(146, 235, 155, 0.5);
    background: rgba(146, 235, 155, 0.07);
  }

  .big {
    display: flex;
    align-items: center;
    position: relative;
    flex: 1.5 1 0;
    min-width: 0;
    padding: clamp(1.75rem, 4.4vw, 6rem);
    border-radius: clamp(20px, 2.2vw, 44px);
  }

  /* Block cursor in the corner of the heading shape. */
  .cursor {
    position: absolute;
    right: clamp(1.1rem, 2.2vw, 3rem);
    bottom: clamp(1.1rem, 2.2vw, 3rem);
    width: clamp(0.5rem, 0.85vw, 1.2rem);
    height: clamp(1rem, 1.7vw, 2.4rem);
    background: #000;
    animation: blink 1.1s steps(1, end) infinite;
  }

  @keyframes blink {
    0%,
    55% {
      opacity: 1;
    }
    56%,
    100% {
      opacity: 0;
    }
  }

  .side {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    gap: clamp(0.6rem, 1.7svh, 1.6rem);
    min-width: 0;
  }

  .shape {
    border-radius: clamp(12px, 1.2vw, 24px);
  }

  .empty {
    height: clamp(1.6rem, 6.5svh, 6rem);
    border-style: dashed;
    border-color: rgba(146, 235, 155, 0.3);
    background: rgba(146, 235, 155, 0.03);
  }

  .sub {
    padding: clamp(1rem, 2.2vw, 3rem);
  }

  h2 {
    display: flex;
    flex-direction: column;
    gap: 0.12em;
    margin: 0;
    font-size: clamp(2rem, min(4.1vw, 7.5svh), 6.5rem);

    span {
      display: block;
    }

    /* Dark ink on green: drop the light text sheen. */
    .sheen,
    .sheen-accent {
      background: none;
      -webkit-text-fill-color: currentColor;
    }

    .sheen {
      color: rgba(216, 255, 224, 0.82);
    }

    .sheen-accent {
      color: #92eb9b;
    }
  }

  .body {
    margin: 0;
    color: rgba(222, 255, 230, 0.9);
    font-size: clamp(0.9rem, min(1.2vw, 2.4svh), 1.75rem);
    line-height: 1.55;
    text-wrap: pretty;
  }
</style>
