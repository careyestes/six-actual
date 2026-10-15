<script>
  // Wide-ish boxes crop the sides ("slice"); portrait or very wide-and-short boxes show the
  // whole diagram ("meet") so the bars, net and predicted next point are all still there.
  let boxW = $state(1600);
  let boxH = $state(900);
  const par = $derived(
    boxW / boxH < 1.15 || boxW / boxH > 2 ? 'xMidYMid meet' : 'xMidYMid slice'
  );

  // The headline's horizontal rule is the baseline of this diagram (it sits at the exact
  // centre of the panel, and so does y = 450 of the 1600×900 viewBox).
  //
  //   Above the rule  — what happened: observed bars that rise up from the rule, plus a mean.
  //   Below the rule  — what happens next: a small neural net. Recent data points go in, hidden
  //                     AI nodes fire left → right, and the output node is the inferred next
  //                     data point, which crosses the rule and shows up as a dashed "ghost" bar.
  //
  // Scroll drives two CSS variables set on the parent (see Journey.svelte):
  //   --bars  0 → 1   bars rise from the rule
  //   --net   0 → 1   network fades in layer by layer
  // Both default to 1 here, so the diagram is complete without the scroll journey.

  const BASE = 450;

  // ---- Above: observed bars ------------------------------------------------
  const noise = [0, 18, -10, 24, -6, 30, -14, 12, 26, -18, 34, 0, -8, 28, 16, -12, 38, 6, -20, 30, 12, 40, -6];
  const N = noise.length;
  const bars = noise.map((n, i) => {
    const h = Math.max(36, Math.round(52 + i * 8.5 + n));
    return { x: 100 + i * 56, w: 36, h, y: BASE - h, d: +((i / (N - 1)) * 0.5).toFixed(3) };
  });
  const mean = BASE - Math.round(bars.reduce((a, b) => a + b.h, 0) / N);

  // ---- Below: the net -------------------------------------------------------
  const XS = [150, 464, 778, 1092, 1406];
  const COUNTS = [5, 6, 6, 4];
  const spread = (/** @type {number} */ n) =>
    Array.from({ length: n }, (_, i) => 662 + (i - (n - 1) / 2) * 52);

  /** @type {{ x: number, y: number, l: number, j: number }[][]} */
  const layers = COUNTS.map((n, l) => spread(n).map((y, j) => ({ x: XS[l], y, l, j })));
  const OUT_Y = [586, 664, 742];
  const OUT_P = [0.62, 0.25, 0.13];
  layers.push(OUT_Y.map((y, j) => ({ x: XS[4], y, l: 4, j })));

  // Every node connects to every node in the next layer.
  const links = layers.slice(0, -1).map((from, l) => ({
    l,
    d: from.map((a) => layers[l + 1].map((b) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`).join(' ')).join(' ')
  }));

  // The routes that carry the signal to the chosen output.
  const route = (/** @type {number[]} */ picks) =>
    picks.map((j, l) => layers[l][j]);
  const routes = [route([2, 3, 2, 1, 0]), route([3, 1, 4, 2, 0])];
  const routeD = routes.map((r) => `M ${r.map((p) => `${p.x} ${p.y}`).join(' L ')}`);
  const hot = new Set(routes.flat().map((p) => `${p.l}:${p.j}`));

  const chosen = layers[4][0];
  const GHOST_H = 300;
  const oct = (/** @type {number} */ x, /** @type {number} */ y, r = 15) => {
    const c = r * 0.4;
    return `M ${x - c} ${y - r} L ${x + c} ${y - r} L ${x + r} ${y - c} L ${x + r} ${y + c} L ${x + c} ${y + r} L ${x - c} ${y + r} L ${x - r} ${y + c} L ${x - r} ${y - c} Z`;
  };
</script>

<svg
  class="forecast"
  bind:clientWidth={boxW}
  bind:clientHeight={boxH}
  viewBox="0 0 1600 900"
  preserveAspectRatio={par}
  aria-hidden="true"
  focusable="false"
>
  <defs>
    <!-- Quiet the middle so the black headline stays legible over the diagram. -->
    <radialGradient
      id="hf-fade-grad"
      cx="0"
      cy="0"
      r="1"
      gradientUnits="userSpaceOnUse"
      gradientTransform="translate(800 450) scale(470 250)"
    >
      <stop offset="0" stop-color="#4a4a4a" />
      <stop offset="0.7" stop-color="#4a4a4a" />
      <stop offset="1" stop-color="#fff" />
    </radialGradient>
    <mask id="hf-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
      <rect class="fade" x="0" y="0" width="1600" height="900" />
    </mask>
  </defs>

  <!-- The rule, continued edge to edge (the HTML rule is the bright part in the middle). -->
  <line class="base" x1="60" y1={BASE} x2="1540" y2={BASE} />

  <g mask="url(#hf-fade)">
    <!-- ABOVE: what happened -->
    <g class="history">
      <g class="bars">
        {#each bars as b}
          <g class="bar" style="--d:{b.d}">
            <rect x={b.x} y={b.y} width={b.w} height={b.h} />
            <line class="cap" x1={b.x} y1={b.y} x2={b.x + b.w} y2={b.y} />
          </g>
        {/each}
      </g>
      <line class="mean" x1="100" y1={mean} x2={bars[N - 1].x + 36} y2={mean} />
    </g>

    <!-- BELOW: what happens next -->
    <g class="net">
      {#each links as k}
        <path class="links" style="--d:{k.l * 0.13}" d={k.d} />
      {/each}

      {#each routeD as d, i}
        <path class="route" class:alt={i === 1} d={d} />
      {/each}

      {#each layers as layer, l}
        <g class="layer" style="--d:{l * 0.13}">
          {#each layer as n}
            {@const isHot = hot.has(`${n.l}:${n.j}`)}
            {#if l === 0}
              <rect
                class="node input"
                class:hot={isHot}
                style="--l:{l}; --j:{n.j}"
                x={n.x - 6}
                y={n.y - 6}
                width="12"
                height="12"
              />
            {:else if l === 4 && n.j === 0}
              <path class="node pick" style="--l:{l}; --j:{n.j}" d={oct(n.x, n.y)} />
            {:else}
              <circle
                class="node"
                class:hot={isHot}
                style="--l:{l}; --j:{n.j}"
                cx={n.x}
                cy={n.y}
                r={l === 4 ? 9 : 8}
              />
            {/if}
            {#if l === 4}
              <text class="prob" class:win={n.j === 0} x={n.x + 28} y={n.y + 5}>
                {OUT_P[n.j].toFixed(2)}
              </text>
            {/if}
          {/each}
        </g>
      {/each}

      <!-- The inferred value leaves the net, crosses the rule and becomes the next bar. -->
      <g class="ghost" style="--d:0.6">
        <line class="drop" x1={chosen.x} y1={chosen.y - 18} x2={chosen.x} y2={BASE} />
        <line class="drop run" x1={chosen.x} y1={chosen.y - 18} x2={chosen.x} y2={BASE} />
        <rect class="next" x={chosen.x - 18} y={BASE - GHOST_H} width="36" height={GHOST_H} />
        <text class="cap-txt" x={chosen.x} y={BASE - GHOST_H - 14} text-anchor="middle">t + 1</text>
      </g>
    </g>
  </g>

  <g class="labels">
    <text x="1572" y={BASE - 20} text-anchor="end">OBSERVED</text>
    <text x="1572" y={BASE + 34} text-anchor="end">INFERRED</text>
    <g class="captions">
      <text x={XS[0]} y="838" text-anchor="middle">INPUTS</text>
      <text x={XS[2]} y="838" text-anchor="middle">MODEL</text>
      <text x={XS[4]} y="838" text-anchor="middle">NEXT POINT</text>
    </g>
  </g>
</svg>

<style>
  .forecast {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    --mint: 146, 235, 155;
  }

  line,
  path,
  rect,
  circle {
    fill: none;
    vector-effect: non-scaling-stroke;
  }

  rect.fade {
    fill: url(#hf-fade-grad);
    stroke: none;
  }

  text {
    fill: rgba(var(--mint), 0.5);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 14px;
    letter-spacing: 0.3em;
  }

  .base {
    stroke: rgba(var(--mint), 0.18);
    stroke-width: 1;
  }

  /* ---------- Above: bars rise from the rule ---------- */
  .bar {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    transform: scaleY(clamp(0, calc((var(--bars, 1) - var(--d)) / 0.5), 1));
  }

  .bar rect {
    fill: rgba(var(--mint), 0.1);
    stroke: rgba(var(--mint), 0.34);
    stroke-width: 1;
  }

  .bar .cap {
    stroke: rgba(var(--mint), 0.75);
    stroke-width: 1.5;
  }

  .mean {
    stroke: rgba(var(--mint), 0.45);
    stroke-width: 1;
    stroke-dasharray: 2 7;
    opacity: clamp(0, calc((var(--bars, 1) - 0.8) / 0.2), 1);
  }

  /* ---------- Below: the net ---------- */
  .layer,
  .links,
  .ghost {
    opacity: clamp(0, calc((var(--net, 1) - var(--d, 0)) / 0.4), 1);
  }

  .route {
    opacity: clamp(0, calc((var(--net, 1) - 0.5) / 0.4), 1);
  }

  .links {
    stroke: rgba(var(--mint), 0.13);
    stroke-width: 1;
  }

  /* Signal travelling toward the chosen output. */
  .route {
    stroke: rgba(var(--mint), 0.95);
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-dasharray: 6 30;
    stroke-linecap: round;
    animation: flow 1.5s linear infinite;
    filter: drop-shadow(0 0 5px rgba(var(--mint), 0.65));
  }

  .route.alt {
    stroke: rgba(var(--mint), 0.55);
    stroke-width: 1.5;
    stroke-dasharray: 4 34;
    animation-duration: 2s;
    filter: none;
  }

  .node {
    fill: #1e5231;
    stroke: rgba(var(--mint), 0.5);
    stroke-width: 1.2;
    animation: fire 3.6s ease-in-out infinite;
    animation-delay: calc(var(--l) * 0.4s + var(--j) * 0.06s);
  }

  .node.input {
    stroke: rgba(var(--mint), 0.7);
  }

  .node.hot {
    stroke: rgba(var(--mint), 0.95);
    stroke-width: 1.6;
  }

  .node.pick {
    fill: #92eb9b;
    stroke: none;
    animation: none;
    filter: drop-shadow(0 0 10px rgba(var(--mint), 0.75));
  }

  .prob {
    font-size: 14px;
    letter-spacing: 0.08em;
    fill: rgba(var(--mint), 0.4);
  }

  .prob.win {
    font-size: 19px;
    fill: rgba(var(--mint), 0.95);
  }

  /* The prediction leaves the net and lands above the rule. */
  .drop {
    stroke: rgba(var(--mint), 0.4);
    stroke-width: 1.2;
    stroke-dasharray: 3 8;
  }

  .drop.run {
    stroke: rgba(var(--mint), 0.95);
    stroke-width: 2;
    stroke-dasharray: 6 30;
    stroke-linecap: round;
    /* Dashes travel upward (path runs from the node to the rule). */
    animation: flow 1.2s linear infinite;
    filter: drop-shadow(0 0 5px rgba(var(--mint), 0.7));
  }

  .next {
    fill: rgba(var(--mint), 0.07);
    stroke: rgba(var(--mint), 0.7);
    stroke-width: 1.4;
    stroke-dasharray: 5 6;
    animation: breathe 3.6s ease-in-out infinite;
  }

  .cap-txt {
    fill: rgba(var(--mint), 0.8);
    letter-spacing: 0.2em;
  }

  .labels text {
    fill: rgba(var(--mint), 0.5);
    letter-spacing: 0.4em;
  }

  .captions text {
    font-size: 12px;
    fill: rgba(var(--mint), 0.36);
  }

  @keyframes flow {
    to {
      stroke-dashoffset: -36;
    }
  }

  @keyframes fire {
    0%,
    26%,
    100% {
      fill: #1e5231;
    }
    10% {
      fill: rgba(var(--mint), 0.7);
    }
  }

  @keyframes breathe {
    0%,
    100% {
      fill: rgba(var(--mint), 0.05);
    }
    50% {
      fill: rgba(var(--mint), 0.14);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .route,
    .drop.run,
    .node,
    .next {
      animation: none;
    }
  }
</style>
