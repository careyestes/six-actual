<script>
  import { onMount } from 'svelte';
  import { ensureGsap } from '$lib/gsap.js';
  import { heroDive } from '$lib/heroDive.js';
  import { blocksExit } from '$lib/blocksExit.js';
  import { heroOpeningDone } from '$lib/heroBrand.js';
  import { journeyMotion as M } from '$lib/journeyMotion.js';

  let { children } = $props();

  /** @type {HTMLDivElement | undefined} */
  let el;

  onMount(() => {
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const node = el;
    let destroyed = false;
    /** @type {gsap.core.Timeline | null} */
    let tl = null;
    /** @type {(() => void) | null} */
    let unsub = null;
    let lockTimer = 0;

    // Start at the top and keep the opening un-scrollable until it has played.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    root.classList.add('journey-deck', 'is-intro');
    node.classList.add('is-deck');

    const unlock = () => root.classList.remove('is-intro');
    unsub = heroOpeningDone.subscribe((done) => {
      if (done) unlock();
    });
    lockTimer = window.setTimeout(unlock, M.introLockTimeout * 1000);

    (async () => {
      const { gsap, ScrollTrigger } = await ensureGsap();
      if (destroyed) return;
      ScrollTrigger.config({ ignoreMobileResize: true });

      const scenes = /** @type {HTMLElement[]} */ ([...node.querySelectorAll('[data-scene]')]);
      const [hero, ...rest] = scenes;
      const q = (/** @type {HTMLElement} */ scene, /** @type {string} */ sel) => [
        ...scene.querySelectorAll(sel)
      ];

      tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: node,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * M.scrollPerUnit * M.total)}`,
          pin: true,
          scrub: M.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            root.style.setProperty('--grid-scale', (1 + self.progress * M.gridZoom).toFixed(3));
          }
        }
      });

      // ---- Hero: dive into the 6, green fills the screen, headline builds ----------
      if (hero) {
        const panel = q(hero, '[data-hero-panel]');
        const lines = q(hero, '[data-hero-line]');
        const cue = q(hero, '[data-hero-cue]');

        const h1 = q(hero, 'h1')[0];
        const voidEl = q(hero, '[data-hero-void]');
        const gridEl = q(hero, '[data-hero-grid]');
        const smooth01 = (/** @type {number} */ x) => {
          const v = Math.min(1, Math.max(0, x));
          return v * v * (3 - 2 * v);
        };

        /** Ink centre + stem width of the "i" in "decides", in viewport px (untransformed). */
        const measureI = () => {
          gsap.set(h1, { clearProps: 'transform' });
          const iEl = /** @type {HTMLElement} */ (q(hero, '[data-hero-i]')[0]);
          const r = iEl.getBoundingClientRect();
          const box = h1.getBoundingClientRect();
          const cs = getComputedStyle(iEl);
          const ctx = /** @type {CanvasRenderingContext2D} */ (
            document.createElement('canvas').getContext('2d')
          );
          ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const mi = ctx.measureText('i');
          const mx = ctx.measureText('x');
          const cx = r.left + (mi.actualBoundingBoxRight - mi.actualBoundingBoxLeft) / 2;
          const baseline = r.top + mi.fontBoundingBoxAscent;
          const cy = baseline - mx.actualBoundingBoxAscent / 2;
          return {
            cx,
            cy,
            ox: cx - box.left,
            oy: cy - box.top,
            inkW: Math.max(1, mi.actualBoundingBoxLeft + mi.actualBoundingBoxRight)
          };
        };

        /** @type {ReturnType<typeof measureI> | null} */
        let iMeasure = null;
        const zoom = { k: 0 };
        const applyZoom = () => {
          if (zoom.k <= 0.0001) {
            gsap.set(h1, { clearProps: 'transform' });
            gsap.set(q(hero, '[data-hero-i]'), { clearProps: 'color' });
            gsap.set(q(hero, '[data-hero-visual]'), { clearProps: 'opacity' });
            gsap.set(voidEl, { opacity: 0 });
            gsap.set(gridEl, { opacity: 0 });
            iMeasure = null;
            return;
          }
          iMeasure ??= measureI();
          const { cx, cy, ox, oy, inkW } = iMeasure;
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          // After the 90° turn the stem lies on its side: its thickness must span the height.
          const S = Math.max(40, (vh * M.heroOut.cover) / inkW);
          const k = zoom.k;
          const a = smooth01(k / M.heroOut.alignBy);
          gsap.set(h1, {
            transformOrigin: `${ox}px ${oy}px`,
            // Log-space zoom reads as a constant-speed push toward the screen.
            scale: Math.exp(Math.log(S) * k),
            rotation: M.heroOut.rotate * smooth01(k / M.heroOut.rotateBy),
            x: a * (vw / 2 - cx),
            y: a * (vh / 2 - cy)
          });
          // The light stem dims to black as it grows, so the screen goes dark rather than flashing.
          const dim = smooth01((k - 0.2) / 0.55);
          // The diagram steps back as the text pushes in.
          gsap.set(q(hero, '[data-hero-visual]'), { opacity: 1 - smooth01(k / 0.35) });
          const iEl = q(hero, '[data-hero-i]')[0];
          if (iEl) {
            const c = (/** @type {number} */ v) => Math.round(v * (1 - dim));
            gsap.set(iEl, { color: `rgb(${c(146)}, ${c(235)}, ${c(155)})` });
          }
          gsap.set(voidEl, { opacity: smooth01((k - M.heroOut.voidFrom) / (1 - M.heroOut.voidFrom)) });
          // The grid fades in over the closing "i" so it is fully in place at full screen.
          gsap.set(gridEl, {
            opacity: smooth01((k - M.heroOut.gridFrom) / (M.heroOut.gridTo - M.heroOut.gridFrom))
          });
        };
        ScrollTrigger.addEventListener('refreshInit', () => {
          iMeasure = null;
        });

        const forecast = { bars: 0, net: 0 };
        const applyForecast = () => {
          const v = /** @type {HTMLElement | undefined} */ (q(hero, '[data-hero-visual]')[0]);
          if (!v) return;
          v.style.setProperty('--bars', forecast.bars.toFixed(4));
          v.style.setProperty('--net', forecast.net.toFixed(4));
        };
        applyForecast();

        gsap.set(panel, { opacity: 0 });
        gsap.set(lines, {
          opacity: 0,
          scale: M.headline.fromScale,
          filter: `blur(${M.headline.fromBlur}px)`
        });

        tl.to(heroDive, { progress: 1, duration: M.dive.end - M.dive.at }, M.dive.at)
          .fromTo(
            cue,
            { opacity: 1 },
            { opacity: 0, duration: M.cueFade.duration, immediateRender: false },
            M.cueFade.at
          )
          .to(panel, { opacity: 1, duration: M.panelIn.duration, ease: M.panelIn.ease }, M.panelIn.at)
          .to(
            lines,
            {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              duration: M.headline.duration,
              stagger: M.headline.stagger,
              ease: M.headline.ease
            },
            M.headline.at
          )
          // Bars rise from the rule; the net fades in layer by layer (CSS vars on the visual).
          .to(
            forecast,
            {
              bars: 1,
              duration: M.forecast.bars.duration,
              ease: M.forecast.bars.ease,
              onUpdate: applyForecast
            },
            M.forecast.bars.at
          )
          .to(
            forecast,
            {
              net: 1,
              duration: M.forecast.net.duration,
              ease: M.forecast.net.ease,
              onUpdate: applyForecast
            },
            M.forecast.net.at
          )
          .to(zoom, { k: 1, duration: M.heroOut.duration, onUpdate: applyZoom }, M.heroOut.at)
          // Black hands the screen to the next scene.
          .to(
            hero,
            { opacity: 0, duration: 0.1 },
            M.heroOut.at + M.heroOut.duration - 0.05
          );
      }

      // ---- Following scenes: approach from depth, hold, pass through the viewer ----
      rest.forEach((scene, i) => {
        const cfg = M.scenes[i];
        if (!cfg) return;
        const items = q(scene, '[data-depth-item]');

        gsap.set(scene, { opacity: 0, scale: cfg.fromScale ?? M.sceneIn.fromScale });
        gsap.set(items, {
          opacity: 0,
          scale: M.sceneIn.itemFromScale,
          filter: `blur(${M.sceneIn.itemFromBlur}px)`
        });

        tl.to(
          scene,
          { scale: 1, duration: M.sceneIn.duration, ease: M.sceneIn.ease },
          cfg.in
        )
          .to(
            scene,
            cfg.fadeIn
              ? { opacity: 1, duration: cfg.fadeIn, ease: 'none' }
              : { opacity: 1, duration: M.sceneIn.duration, ease: M.sceneIn.ease },
            cfg.in
          )
          .to(
          items,
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: M.sceneIn.itemDuration,
            stagger: cfg.itemStagger ?? M.sceneIn.itemStagger,
            ease: M.sceneIn.ease
          },
          cfg.in + (cfg.itemDelay ?? 0.15)
        );

        if (cfg.exit) {
          // Text clears, the baseplate rises into a block, the camera pushes into it.
          const { at, duration } = cfg.exit;
          tl.to(
            items,
            { opacity: 0, scale: 1.08, filter: 'blur(6px)', duration: 0.45, ease: 'power2.in' },
            at
          )
            .to(q(scene, '[data-exit-clear]'), { opacity: 0, duration: 0.45, ease: 'power2.in' }, at)
            .to(blocksExit, { progress: 1, duration }, at)
            .to(scene, { opacity: 0, duration: 0.05 }, at + duration);
        }

        if (cfg.zoom) {
          // Everything scales up around the blinking cursor until it fills the screen.
          const { at, duration, cover } = cfg.zoom;
          const root = /** @type {HTMLElement | undefined} */ (q(scene, '[data-zoom-root]')[0]);
          const target = /** @type {HTMLElement | undefined} */ (q(scene, '[data-zoom-target]')[0]);
          if (root && target) {
            const z = { k: 0 };
            /** @type {{ cx: number; cy: number; ox: number; oy: number; w: number; h: number } | null} */
            let m = null;
            const measure = () => {
              gsap.set(root, { clearProps: 'transform' });
              const rr = root.getBoundingClientRect();
              const r = target.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              return { cx, cy, ox: cx - rr.left, oy: cy - rr.top, w: r.width, h: r.height };
            };
            ScrollTrigger.addEventListener('refreshInit', () => {
              m = null;
            });
            const apply = () => {
              const k = z.k;
              if (k <= 0.0001) {
                gsap.set(root, { clearProps: 'transform' });
                target.style.animation = '';
                target.style.opacity = '';
                m = null;
                return;
              }
              // Hold the cursor solid while it grows (no blink-out mid-zoom).
              target.style.animation = 'none';
              target.style.opacity = '1';
              m ??= measure();
              const vw = window.innerWidth;
              const vh = window.innerHeight;
              const S = Math.max(vw / m.w, vh / m.h) * cover;
              const a = (() => {
                const v = Math.min(1, Math.max(0, k / 0.75));
                return v * v * (3 - 2 * v);
              })();
              gsap.set(root, {
                transformOrigin: `${m.ox}px ${m.oy}px`,
                scale: Math.exp(Math.log(S) * k),
                x: a * (vw / 2 - m.cx),
                y: a * (vh / 2 - m.cy)
              });
            };
            tl.to(z, { k: 1, duration, onUpdate: apply }, at).to(
              scene,
              { opacity: 0, duration: 0.05 },
              at + duration
            );
          }
        }

        if (cfg.out != null) {
          tl.to(
            scene,
            {
              opacity: 0,
              scale: M.sceneOut.toScale,
              duration: M.sceneOut.duration,
              ease: M.sceneOut.ease
            },
            cfg.out
          );
        }
      });

      // Pad so the timeline is exactly `total` units long.
      tl.set({}, {}, M.total);
      // Dev hook for visual QA: window.__journeyTl.time(t) jumps without scroll smoothing.
      if (import.meta.env.DEV) /** @type {any} */ (window).__journeyTl = tl;
    })();

    return () => {
      destroyed = true;
      window.clearTimeout(lockTimer);
      unsub?.();
      tl?.scrollTrigger?.kill();
      tl?.kill();
      heroDive.progress = 0;
      blocksExit.progress = 0;
      root.classList.remove('journey-deck', 'is-intro');
      root.style.removeProperty('--grid-scale');
      node.classList.remove('is-deck');
    };
  });
</script>

<div class="journey" bind:this={el}>
  {@render children?.()}
</div>

<style>
  /* Deck mode: every scene is stacked in one pinned viewport. */
  :global(.journey.is-deck) {
    position: relative;
    height: 100svh;
    overflow: hidden;
  }

  :global(.journey.is-deck > [data-scene]) {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    pointer-events: none;
    transform-origin: 50% 50%;
    will-change: transform, opacity;
  }

  :global(.journey.is-deck > [data-scene='hero']) {
    display: block;
    place-items: normal;
    /* Keep the zooming headline re-rasterising (crisp) instead of scaling a bitmap. */
    will-change: auto;
  }

  /* Intro: no scrolling until the opening has played. */
  :global(html.is-intro) {
    overflow: hidden;
  }

  /* The background grid rushes toward the viewer as you travel in. */
  :global(html.journey-deck body::before) {
    transform: scale(var(--grid-scale, 1));
    transform-origin: 50% 50%;
    -webkit-mask-image: radial-gradient(85% 70% at 50% 50%, #000 10%, transparent 78%);
    mask-image: radial-gradient(85% 70% at 50% 50%, #000 10%, transparent 78%);
  }
</style>
