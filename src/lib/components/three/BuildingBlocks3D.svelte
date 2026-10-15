<script>
  import { onMount } from 'svelte';
  import {
    AdditiveBlending,
    AmbientLight,
    BoxGeometry,
    DirectionalLight,
    BufferGeometry,
    EdgesGeometry,
    Color,
    Float32BufferAttribute,
    Group,
    LineBasicMaterial,
    LineLoop,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    OrthographicCamera,
    Scene,
    Vector3,
    WebGLRenderer
  } from 'three';
  import { blocksExit } from '$lib/blocksExit.js';
  import {
    BRICK_H,
    STUD_H,
    blocksMotion,
    LAYERS,
    brickState,
    makeBlocks
  } from '$lib/buildingBlocks.js';

  /** Layout box (in the page) the finished tower should be centred in. */
  let { anchor = undefined } = $props();

  /** @type {HTMLCanvasElement | undefined} */
  let canvasEl;
  /** @type {HTMLDivElement | undefined} */
  let wrapEl;

  const GREEN = new Color('#92eb9b');
  const MINT = new Color('#d8ffe0');
  const DIM = new Color('#4a8a5a');
  // Solid fill once seated: deeper than the outline so the edges still glow on top.
  const FILLS = [new Color('#3d9a54'), new Color('#79c98c'), new Color('#2b6b3b')];
  const WHITE = new Color('#ffffff');

  /** @param {number[]} p */
  function lineGeo(p) {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(p, 3));
    return g;
  }

  /** Wireframe brick: box edges, inset top panel line, studs. */
  function brickEdges(w, d) {
    /** @type {number[]} */
    const p = [];
    const seg = (ax, ay, az, bx, by, bz) => p.push(ax, ay, az, bx, by, bz);
    const h = BRICK_H;
    const rect = (y, x0, z0, x1, z1) => {
      seg(x0, y, z0, x1, y, z0);
      seg(x1, y, z0, x1, y, z1);
      seg(x1, y, z1, x0, y, z1);
      seg(x0, y, z1, x0, y, z0);
    };
    rect(0, 0, 0, w, d);
    rect(h, 0, 0, w, d);
    seg(0, 0, 0, 0, h, 0);
    seg(w, 0, 0, w, h, 0);
    seg(w, 0, d, w, h, d);
    seg(0, 0, d, 0, h, d);
    // Inset panel line on top + a shallow groove around the side, for that machined look.
    rect(h, 0.1, 0.1, w - 0.1, d - 0.1);
    rect(h * 0.2, 0, 0, w, d);

    const N = 14;
    const r = 0.3;
    for (let cx = 0; cx < w; cx++) {
      for (let cz = 0; cz < d; cz++) {
        const x = cx + 0.5;
        const z = cz + 0.5;
        for (let i = 0; i < N; i++) {
          const a0 = (i / N) * Math.PI * 2;
          const a1 = ((i + 1) / N) * Math.PI * 2;
          for (const y of [h, h + STUD_H]) {
            seg(
              x + Math.cos(a0) * r,
              y,
              z + Math.sin(a0) * r,
              x + Math.cos(a1) * r,
              y,
              z + Math.sin(a1) * r
            );
          }
        }
        for (const [ax, az] of [
          [r, 0],
          [-r, 0],
          [0, r],
          [0, -r]
        ]) {
          seg(x + ax, h, z + az, x + ax, h + STUD_H, z + az);
        }
      }
    }
    return lineGeo(p);
  }

  onMount(() => {
    if (!canvasEl || !wrapEl) return;
    const canvas = canvasEl;
    const wrap = wrapEl;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    const scene = new Scene();
    scene.add(new AmbientLight(0xffffff, 0.9));
    const sun = new DirectionalLight(0xffffff, 1.4);
    sun.position.set(4, 9, 6);
    scene.add(sun);
    const camera = new OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
    camera.position.set(14, 12, 14);
    camera.lookAt(0, 0, 0);

    const { bricks, total, buildEnd } = makeBlocks();
    const W = Math.max(...LAYERS.map((l) => l.x1));
    const D = Math.max(...LAYERS.map((l) => l.z1));

    const tower = new Group();
    tower.position.set(-W / 2, -1.2, -D / 2);
    scene.add(tower);

    // --- Baseplate: just the outline rectangle ----------------------------------------
    const pad = 1;
    const borderMat = new LineBasicMaterial({
      color: GREEN,
      transparent: true,
      opacity: 0.45,
      blending: AdditiveBlending,
      depthWrite: false
    });
    tower.add(
      new LineLoop(
        lineGeo([-pad, 0, -pad, W + pad, 0, -pad, W + pad, 0, D + pad, -pad, 0, D + pad]),
        borderMat
      )
    );

    // --- Exit slab: the rectangle rises into a solid block (driven by scroll) ----------
    const SLAB_H = 5;
    const slabGeo = new BoxGeometry(1, 1, 1);
    slabGeo.translate(0, 0.5, 0);
    // Matches the next scene's background exactly (see WhySection.svelte).
    const slabTop = new MeshBasicMaterial({ color: new Color('#1e5231'), transparent: true });
    const slabSide = (/** @type {string} */ c) =>
      new MeshLambertMaterial({ color: new Color(c), transparent: true });
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    const slabMats = [
      slabSide('#14381f'),
      slabSide('#14381f'),
      slabTop,
      slabSide('#14381f'),
      slabSide('#1a4a2a'),
      slabSide('#1a4a2a')
    ];
    const slab = new Mesh(slabGeo, slabMats);
    const slabCx = (W + 2 * pad) / 2 - pad;
    const slabCz = (D + 2 * pad) / 2 - pad;
    slab.position.set(slabCx, 0, slabCz);
    slab.scale.set(W + 2 * pad, 0.001, D + 2 * pad);
    const slabEdgeMat = new LineBasicMaterial({
      color: MINT,
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
      depthWrite: false
    });
    slab.add(new LineSegments(new EdgesGeometry(slabGeo), slabEdgeMat));
    slab.visible = false;
    tower.add(slab);

    // --- Bricks ---------------------------------------------------------------------
    const tones = [GREEN, MINT, DIM];
    const bricksRt = bricks.map((b) => {
      const group = new Group();
      const lineMat = new LineBasicMaterial({
        color: tones[b.tone].clone(),
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false
      });
      const lines = new LineSegments(brickEdges(b.w, b.d), lineMat);
      const fillMat = new MeshLambertMaterial({
        color: FILLS[b.tone].clone(),
        transparent: true,
        opacity: 0,
        // Pushed back a hair so the outline sitting on the surface never z-fights.
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
      });
      const box = new BoxGeometry(b.w, BRICK_H, b.d);
      box.translate(b.w / 2, BRICK_H / 2, b.d / 2);
      const fill = new Mesh(box, fillMat);
      const rippleMat = new LineBasicMaterial({
        color: GREEN,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false
      });
      const ripple = new LineLoop(lineGeo([0, 0, 0, b.w, 0, 0, b.w, 0, b.d, 0, 0, b.d]), rippleMat);
      ripple.position.set(b.w / 2, 0, b.d / 2);
      ripple.geometry.translate(-b.w / 2, 0, -b.d / 2);
      group.add(fill, lines, ripple);
      group.visible = false;
      tower.add(group);
      return { b, group, lineMat, fillMat, rippleMat, ripple, base: tones[b.tone] };
    });

    /** @param {number} t loop time in seconds */
    function pose(t, vis = 1) {
      // Faint transparent fills must not punch holes in the rising block via the depth buffer.
      const dw = vis >= 1;
      for (const r of bricksRt) {
        const s = brickState(r.b, bricks.length, buildEnd, t);
        r.group.visible = s.visible && vis > 0.01;
        if (r.fillMat.depthWrite !== dw) r.fillMat.depthWrite = dw;
        if (!s.visible) continue;
        r.group.position.set(r.b.x + s.offX, r.b.y + s.offY, r.b.z + s.offZ);
        r.lineMat.opacity = vis * s.alpha * (0.7 + 0.3 * s.flash);
        r.lineMat.color.copy(r.base).lerp(WHITE, Math.min(1, s.flash * 0.9));
        // Faint ghost while falling; 80% solid fill the moment it seats.
        const ghost = 0.02 * s.alpha;
        const solid = blocksMotion.seatedFill * s.seat * s.alpha;
        r.fillMat.opacity = vis * Math.max(ghost, solid);
        // Ripple on the footprint as the brick seats.
        if (s.ripple <= 1) {
          const k = 1 + s.ripple * 0.5;
          r.ripple.scale.set(k, 1, k);
          r.rippleMat.opacity = vis * (1 - s.ripple) * 0.85;
        } else {
          r.rippleMat.opacity = 0;
        }
      }
    }

    // Resting frustum (tower framed over the anchor); the exit zoom is relative to it.
    const base = { l: -10, r: 10, t: 7, b: -7 };
    const topPoint = new Vector3();
    const clamp01 = (/** @type {number} */ x) => Math.min(1, Math.max(0, x));
    const smooth = (/** @type {number} */ x) => {
      const v = clamp01(x);
      return v * v * (3 - 2 * v);
    };
    // Half-height (world units) at which the block's top face fills any viewport.
    const HH_FINAL = 0.7;
    // Quarter-turn-ish spin (radians, clockwise on screen) as the block comes at the viewer.
    const SPIN = 0.42;

    /** Exit: rectangle → solid block → push into it. Also sets the camera frustum. */
    function applyCamera(k) {
      const rise = 1 - Math.pow(1 - clamp01(k / 0.35), 3);
      slab.visible = k > 0.001;
      slab.scale.y = Math.max(0.001, SLAB_H * rise);

      const u = clamp01((k - 0.3) / 0.7);
      const fade = 1 - smooth((u - 0.85) / 0.15);
      for (const m of slabMats) m.opacity = fade;
      slabEdgeMat.opacity = 0.9 * fade;
      borderMat.opacity = 0.45 * fade;

      // Clockwise roll about the view axis, easing in with the push.
      camera.position.set(14, 12, 14);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);
      if (u > 0) camera.rotateZ(smooth(u) * SPIN);
      camera.updateMatrixWorld(true);

      const hwb = (base.r - base.l) / 2;
      const hhb = (base.t - base.b) / 2;
      const cxb = (base.r + base.l) / 2;
      const cyb = (base.t + base.b) / 2;
      let cx = cxb;
      let cy = cyb;
      let hh = hhb;
      if (u > 0 && hhb > HH_FINAL) {
        // Aim at the middle of the block's top face (in view space).
        tower.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        topPoint.set(slabCx, SLAB_H, slabCz);
        tower.localToWorld(topPoint);
        topPoint.applyMatrix4(camera.matrixWorldInverse);
        const a = smooth(u / 0.7);
        cx = cxb + (topPoint.x - cxb) * a;
        cy = cyb + (topPoint.y - cyb) * a;
        // Log-space zoom reads as a constant-speed push toward the screen.
        hh = hhb * Math.exp(Math.log(HH_FINAL / hhb) * smooth(u));
      }
      const hw = (hh * hwb) / hhb;
      camera.left = cx - hw;
      camera.right = cx + hw;
      camera.top = cy + hh;
      camera.bottom = cy - hh;
      camera.updateProjectionMatrix();
    }

    function resize() {
      const { clientWidth: w, clientHeight: h } = wrap;
      if (w < 1 || h < 1) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);

      // The canvas covers the whole scene so bricks can fall in from (and lift out past)
      // the screen edge without being clipped. The tower is framed to fit the anchor box
      // and positioned over it.
      const aw = anchor?.clientWidth || w;
      const ah = anchor?.clientHeight || h;
      const halfHBox = Math.max(4.7, 5.9 / (aw / ah));
      const unitsPerPx = (2 * halfHBox) / ah;
      const halfH = (unitsPerPx * h) / 2;
      const halfW = (unitsPerPx * w) / 2;

      let fx = 0.5;
      let fy = 0.5;
      if (anchor) {
        // Ratios are unaffected by the scene's scale transform during the journey.
        const wr = wrap.getBoundingClientRect();
        const ar = anchor.getBoundingClientRect();
        if (wr.width > 0 && wr.height > 0) {
          fx = (ar.left + ar.width / 2 - wr.left) / wr.width;
          fy = (ar.top + ar.height / 2 - wr.top) / wr.height;
        }
      }
      const shiftX = halfW * (1 - 2 * fx);
      const shiftY = halfH * (2 * fy - 1);
      base.l = -halfW + shiftX;
      base.r = halfW + shiftX;
      base.t = halfH + shiftY;
      base.b = -halfH + shiftY;
      applyCamera(blocksExit.progress);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    if (anchor) ro.observe(anchor);
    resize();

    // --- Loop ---------------------------------------------------------------------
    const sceneEl = wrap.closest('[data-scene]');
    let active = true;
    let started = performance.now();
    let frame = 0;
    /** @type {number | null} */
    let pausedAt = null;
    let raf = 0;
    let disposed = false;

    const tick = (/** @type {number} */ now) => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      // The journey stacks scenes; only animate while this one is actually showing,
      // and restart the build from an empty baseplate each time it arrives.
      if (sceneEl && frame++ % 8 === 0) {
        const vis = parseFloat(getComputedStyle(sceneEl).opacity) > 0.02;
        if (vis && !active) started = now;
        active = vis;
      }
      if (!active) return;
      // While the scroll exit plays, the build freezes in place and dissolves.
      const k = blocksExit.progress;
      if (k > 0.001) {
        pausedAt ??= now;
      } else if (pausedAt !== null) {
        started += now - pausedAt;
        pausedAt = null;
      }
      const clock = pausedAt ?? now;
      const t = (((clock - started) / 1000) % total + total) % total;
      // The baseplate and tower stay perfectly still (no swivel).
      tower.rotation.y = 0;
      pose(t, 1 - smooth((k - 0.12) / 0.28));
      applyCamera(k);
      renderer.render(scene, camera);
    };

    if (reduced) {
      // One still frame of the finished build.
      pose(buildEnd + 0.6);
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        // @ts-expect-error
        o.geometry?.dispose?.();
        // @ts-expect-error
        o.material?.dispose?.();
      });
      renderer.dispose();
    };
  });
</script>

<div class="blocks-3d" bind:this={wrapEl} aria-hidden="true">
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .blocks-3d {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
