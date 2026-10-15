<script>
  import { onMount } from 'svelte';
  import {
    AdditiveBlending,
    AmbientLight,
    Box3,
    Color,
    DirectionalLight,
    DoubleSide,
    EdgesGeometry,
    Group,
    LineBasicMaterial,
    LineSegments,
    MeshPhysicalMaterial,
    PerspectiveCamera,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer
  } from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { ensureGsap } from '$lib/gsap.js';
  import { prepareAssembleOrder, orderWireByRadius, applySegmentOrder } from '$lib/heroAssemble.js';
  import { createHeroAura } from '$lib/heroAura.js';
  import { createWordmark } from '$lib/heroWordmark.js';
  import { diveMotion, idleMotion, resolveHeroOption } from '$lib/heroLogoMotion.js';
  import { heroDive } from '$lib/heroDive.js';
  import {
    createHeroIdleTween,
    createHeroLogoTimeline
  } from '$lib/heroLogoTimeline.js';

  let { onready = undefined } = $props();

  /** @type {HTMLCanvasElement | undefined} */
  let canvasEl;
  /** @type {HTMLDivElement | undefined} */
  let wrapEl;

  onMount(() => {
    if (!canvasEl || !wrapEl) return;

    ensureGsap();

    const heroOption = resolveHeroOption();
    console.info(
      `[hero] option ${heroOption.id} — ${heroOption.name}. Switch with ?hero=A|B|C`
    );

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.03, 100);
    camera.position.set(0, 0.05, 4.6);

    const renderer = new WebGLRenderer({
      canvas: canvasEl,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;

    scene.add(new AmbientLight(0xffffff, 0.38));
    const key = new DirectionalLight(0xffffff, 1.15);
    key.position.set(3.2, 4.2, 2.2);
    scene.add(key);
    const fillLight = new DirectionalLight(0xffffff, 0.28);
    fillLight.position.set(-2.8, 1.2, -1);
    scene.add(fillLight);
    const rim = new DirectionalLight(0x92eb9b, 0.55);
    rim.position.set(-1, 2, 3);
    scene.add(rim);
    const sheenLight = new DirectionalLight(0xffffff, 0.85);
    sheenLight.position.set(2.4, 1.8, 3.2);
    scene.add(sheenLight);

    const BRAND_GREEN = '#92eb9b';

    const root = new Group();
    scene.add(root);
    const markGroup = new Group();
    const textGroup = new Group();
    root.add(markGroup, textGroup);

    // Orbital field lives in world space so the mark dives *through* it.
    const aura = !reduced && heroOption.aura ? createHeroAura(BRAND_GREEN) : null;
    if (aura) scene.add(aura.group);

    let fitScale = 1;
    let openingDone = false;
    let sheenTime = 0;
    let raf = 0;
    let disposed = false;
    /** @type {ReturnType<typeof buildPieces> | null} */
    let pieces = null;
    /** @type {gsap.core.Timeline | null} */
    let openingTl = null;
    /** @type {gsap.core.Tween | null} */
    let idleTween = null;

    function brandColor() {
      return new Color(BRAND_GREEN);
    }

    /**
     * @param {import('three').Material | import('three').Material[]} material
     * @param {(m: import('three').Material) => void} fn
     */
    function eachMat(material, fn) {
      const mats = Array.isArray(material) ? material : [material];
      for (const m of mats) fn(m);
    }

    /**
     * @param {import('three').Mesh} mesh
     */
    function makeFillMaterial(mesh) {
      const green = brandColor();
      const highlight = green.clone().lerp(new Color('#ffffff'), 0.35);
      const mat = new MeshPhysicalMaterial({
        color: green.clone(),
        metalness: 0.78,
        roughness: 0.22,
        emissive: green.clone(),
        emissiveIntensity: 0.16,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
        sheen: 0.55,
        sheenRoughness: 0.28,
        sheenColor: highlight,
        reflectivity: 0.7,
        transparent: true,
        opacity: 1,
        flatShading: true,
        side: DoubleSide
      });
      mesh.material = mat;
      return mat;
    }

    /**
     * @param {import('three').BufferGeometry} geometry
     */
    function makeWire(geometry) {
      const edges = new EdgesGeometry(geometry, 22);
      const glow = new LineBasicMaterial({
        color: brandColor(),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        blending: AdditiveBlending
      });
      const core = new LineBasicMaterial({
        color: new Color('#ffffff'),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        blending: AdditiveBlending
      });
      const glowLine = new LineSegments(edges, glow);
      const coreLine = new LineSegments(edges.clone(), core);
      glowLine.scale.setScalar(1.012);
      coreLine.scale.setScalar(1.002);
      glowLine.renderOrder = 2;
      coreLine.renderOrder = 3;
      const group = new Group();
      group.add(glowLine, coreLine);
      return { group, glow, core, edges, glowLine, coreLine };
    }

    /**
     * @param {import('three').BufferGeometry} geo
     * @param {number} t 0–1
     */
    function setDrawProgress(geo, t) {
      const index = geo.index;
      const total = index ? index.count : geo.attributes.position.count;
      const step = 3;
      const visible = Math.floor((total * Math.min(1, Math.max(0, t))) / step) * step;
      geo.setDrawRange(0, visible);
    }

    /**
     * @param {import('three').BufferGeometry} geo
     * @param {number} t 0–1
     */
    function setLineProgress(geo, t) {
      const index = geo.index;
      const total = index ? index.count : geo.attributes.position.count;
      const visible = Math.floor((total * Math.min(1, Math.max(0, t))) / 2) * 2;
      geo.setDrawRange(0, Math.max(0, visible));
    }

    /**
     * @param {import('three').Object3D} sceneRoot
     */
    function buildPieces(sceneRoot) {
      /** @type {import('three').Mesh[]} */
      const meshes = [];
      sceneRoot.updateMatrixWorld(true);
      sceneRoot.traverse((child) => {
        // @ts-expect-error
        if (child.isMesh) meshes.push(child);
      });

      const ranked = meshes
        .map((mesh) => {
          const box = new Box3().setFromObject(mesh);
          const center = box.getCenter(new Vector3());
          const size = box.getSize(new Vector3());
          return { mesh, center, size, volume: size.x * size.y * size.z };
        })
        .sort((a, b) => a.center.x - b.center.x);

      const markEntry =
        ranked.slice(0, Math.min(3, ranked.length)).sort((a, b) => b.volume - a.volume)[0] ||
        ranked[0];

      const markMesh = markEntry.mesh;
      makeFillMaterial(markMesh);
      markMesh.visible = false;
      markGroup.attach(markMesh);

      markGroup.updateMatrixWorld(true);
      const markLocalCenter = new Box3()
        .setFromObject(markMesh)
        .getCenter(new Vector3());
      markGroup.worldToLocal(markLocalCenter);
      markMesh.position.sub(markLocalCenter);

      if (heroOption.assemble === 'scatter' || heroOption.assemble === 'bottomUp') {
        prepareAssembleOrder(markMesh.geometry, heroOption.assemble);
      }

      const wire = makeWire(markMesh.geometry);
      markMesh.add(wire.group);

      // For the laser-6 beat: order wire segments inner (the "6") → outer (box)
      // so a single draw sweep traces the glyph first, then the frame.
      let wireInnerFraction = 1;
      if (heroOption.wire?.laserSix) {
        const { innerFraction, order } = orderWireByRadius(wire.edges, {
          innerRadiusFactor: heroOption.wire.innerRadiusFactor ?? 0.72
        });
        applySegmentOrder(wire.coreLine.geometry, order);
        wireInnerFraction = innerFraction;
        console.info(
          `[hero] wire laser split — inner "6" fraction ${(innerFraction * 100).toFixed(0)}% of ${order.length} edges`
        );
      }

      // The GLB's own glyphs are not used; the lockup is rebuilt from font outlines.
      textGroup.visible = false;

      // Wordmark (SIX ACTUAL / A.I. // INTEL.) under the shield; builds itself as it seats.
      const wordmark = heroOption.text
        ? createWordmark({
            textGroup,
            root,
            markMesh,
            brand: brandColor(),
            config: heroOption.text
          })
        : null;

      if (sceneRoot.parent === root) root.remove(sceneRoot);

      const markFocus = new Vector3(0, 0, 0);
      return { markMesh, wire, markFocus, wireInnerFraction, wordmark };
    }

    /** Keep the wordmark inside narrow viewports. */
    function fitWordmark() {
      if (!pieces?.wordmark) return;
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * 4.6;
      pieces.wordmark.fit(halfH * camera.aspect);
    }

    function viewportBottomY() {
      // Use the resting camera depth so the start offset is stable regardless of
      // where the dolly/dive begins. Sign picks above (+1) vs below (-1) center.
      const dist = Math.abs(4.6 - root.position.z);
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * dist;
      const sign = heroOption.rise.fromYSign ?? -1;
      return sign * halfH * heroOption.rise.fromYFactor;
    }

    /**
     * @param {typeof import('gsap').gsap | null} [gsap]
     */
    function jumpToEnd(gsap = null) {
      if (!pieces) return;
      const { markMesh, wire, markFocus } = pieces;
      markMesh.visible = true;
      setDrawProgress(markMesh.geometry, 1);
      setLineProgress(wire.edges, 1);
      setLineProgress(wire.coreLine.geometry, 1);
      wire.group.visible = true;
      wire.glow.opacity = heroOption.fill.wireRestGlow;
      wire.core.opacity = heroOption.fill.wireRestCore;
      eachMat(markMesh.material, (m) => {
        m.opacity = 1;
        m.transparent = false;
        m.depthWrite = true;
      });
      markGroup.position.set(0, 0, 0);
      markGroup.rotation.set(
        heroOption.fill.to.rotateX,
        heroOption.fill.to.rotateY,
        heroOption.fill.to.rotateZ
      );
      markGroup.scale.setScalar(heroOption.fill.to.scale);
      root.position.set(markFocus.x, markFocus.y, markFocus.z);
      pieces.wordmark?.finalize();
      openingDone = true;
      if (aura) {
        aura.progress.opacity = heroOption.aura?.rest ?? 0.45;
        aura.progress.energy = heroOption.aura?.energyRest ?? 0.05;
      }
      onready?.();
      if (!reduced && idleMotion.enabled && gsap) {
        idleTween = createHeroIdleTween(gsap, markGroup);
      }
    }

    async function startOpening() {
      if (!pieces || reduced) {
        jumpToEnd();
        return;
      }

      const { gsap } = await ensureGsap();
      if (disposed || !pieces) return;

      const { timeline, progress: tlProgress } = createHeroLogoTimeline({
        gsap,
        option: heroOption,
        root,
        markGroup,
        markMesh: pieces.markMesh,
        camera,
        wire: pieces.wire,
        markFocus: pieces.markFocus,
        viewportBottomY,
        setDrawProgress,
        setLineProgress,
        eachMat,
        wireInnerFraction: pieces.wireInnerFraction,
        auraProgress: aura?.progress,
        wordmark: pieces.wordmark,
        onComplete: () => {
          openingDone = true;
          onready?.();
          idleTween = createHeroIdleTween(gsap, markGroup);
        }
      });

      openingTl = timeline;

      // Construction lines read the mark's real edges and follow the live build.
      aura?.bind({
        markMesh: pieces.markMesh,
        edges: pieces.wire.edges,
        innerFraction: pieces.wireInnerFraction,
        timeline: tlProgress
      });

      // Dev hook: window.__heroTl.progress(0.2) to scrub; hard-reload to replay
      if (typeof window !== 'undefined') {
        // @ts-expect-error
        window.__heroTl = openingTl;
        // @ts-expect-error
        window.__heroOption = heroOption;
        // @ts-expect-error
        window.__heroState = () => {
          const mat = Array.isArray(pieces.markMesh.material)
            ? pieces.markMesh.material[0]
            : pieces.markMesh.material;
          const dr = pieces.markMesh.geometry.drawRange;
          return {
            t: openingTl.time(),
            fillOpacity: mat.opacity,
            drawCount: dr.count,
            rootPos: root.position.toArray().map((n) => +n.toFixed(2)),
            camPos: camera.position.toArray().map((n) => +n.toFixed(2)),
            markRot: markGroup.rotation.toArray().slice(0, 3).map((n) => +(+n).toFixed(2)),
            markScale: +markGroup.scale.x.toFixed(3),
            glow: pieces.wire.glow.opacity,
            openingDone
          };
        };
        console.info(
          `[hero] playing ${heroOption.id} (${heroOption.name}), duration ${openingTl.duration().toFixed(2)}s`
        );
      }
      openingTl.play(0);
    }

    // --- Scroll dive: fly into the "6" counterspace ---------------------------------
    const dive = { p: 0, active: false };
    /** @type {{ cx: number, cy: number, frontZ: number, W: number, H: number } | null} */
    let diveGeom = null;

    /** Counterspace centre + shield size, in root-local units (scale independent). */
    function measureDive() {
      if (!pieces) return;
      const { markMesh } = pieces;
      markMesh.geometry.computeBoundingBox();
      root.updateMatrixWorld(true);
      const b = /** @type {Box3} */ (markMesh.geometry.boundingBox)
        .clone()
        .applyMatrix4(markMesh.matrixWorld)
        .applyMatrix4(root.matrixWorld.clone().invert());
      const W = b.max.x - b.min.x;
      const H = b.max.y - b.min.y;
      diveGeom = {
        cx: (b.min.x + b.max.x) / 2 + diveMotion.cx * W,
        cy: (b.min.y + b.max.y) / 2 + diveMotion.cy * H,
        frontZ: b.max.z,
        W,
        H
      };
    }

    const smooth01 = (/** @type {number} */ x) => {
      const t = Math.min(1, Math.max(0, x));
      return t * t * (3 - 2 * t);
    };

    /** @param {number} delta */
    function applyDive(delta) {
      if (!openingDone || !pieces || !diveGeom || reduced) return;
      const target = heroDive.progress;
      dive.p += (target - dive.p) * (1 - Math.exp(-delta * diveMotion.smooth));
      if (Math.abs(target - dive.p) < 1e-4) dive.p = target;
      const p = dive.p;

      if (p <= 0.0005) {
        if (dive.active) {
          // Back at the top: restore the resting lockup and resume the idle sway.
          dive.active = false;
          root.position.set(pieces.markFocus.x, pieces.markFocus.y, pieces.markFocus.z);
          idleTween?.resume();
          if (aura) aura.progress.opacity = heroOption.aura?.rest ?? 0.45;
        }
        return;
      }
      if (!dive.active) {
        dive.active = true;
        idleTween?.pause();
      }

      const s = root.scale.x;
      const { cx, cy, frontZ, W, H } = diveGeom;
      const vh = 2 * Math.tan((camera.fov * Math.PI) / 360);
      const dEnd =
        Math.min((diveMotion.h * H * s) / vh, (diveMotion.w * W * s) / (vh * camera.aspect)) *
        diveMotion.cover;
      const dStart = Math.max(
        dEnd * 1.5,
        camera.position.z - (pieces.markFocus.z + frontZ * s)
      );

      // Log-space zoom reads as constant speed; a touch of ease-in-out softens the ends.
      const e = 0.5 * p + 0.5 * smooth01(p);
      const d = dStart * Math.pow(dEnd / dStart, e);
      const a = smooth01(p / diveMotion.align);

      const alignX = camera.position.x - s * cx;
      const alignY = camera.position.y - s * cy;
      root.position.x = pieces.markFocus.x + (alignX - pieces.markFocus.x) * a;
      root.position.y = pieces.markFocus.y + (alignY - pieces.markFocus.y) * a;
      root.position.z = camera.position.z - d - s * frontZ;

      // Settle the mark flat, and let the construction lines fall away.
      markGroup.rotation.x *= 0.85;
      markGroup.rotation.y *= 0.85;
      if (aura) {
        aura.progress.opacity = (heroOption.aura?.rest ?? 0.45) * (1 - Math.min(1, p * 5));
      }
    }

    /**
     * @param {number} t
     */
    function updateSheen(t) {
      if (!pieces) return;
      const { markMesh, wire } = pieces;
      const pulse = 0.55 + Math.sin(t * 1.2) * 0.2 + Math.sin(t * 2.6) * 0.08;
      sheenLight.position.set(
        Math.cos(t * 0.5) * 3.2,
        1.4 + Math.sin(t * 0.7) * 1.1,
        2.4 + Math.sin(t * 0.45) * 1.6
      );
      sheenLight.intensity = 0.5 + pulse * 0.5;
      rim.intensity = 0.38 + pulse * 0.3;

      eachMat(markMesh.material, (m) => {
        // @ts-expect-error
        if (m.emissiveIntensity != null) m.emissiveIntensity = 0.12 + pulse * 0.14;
        // @ts-expect-error
        if (m.sheen != null) m.sheen = 0.4 + pulse * 0.25;
      });

      if (openingDone) {
        wire.group.visible = true;
        // Idle shimmer rides on top of resting glow from timeline end.
        // Keep the additive small so there's no brighten-jump at handoff.
        wire.glow.opacity = heroOption.fill.wireRestGlow + pulse * 0.06;
        wire.core.opacity = heroOption.fill.wireRestCore + pulse * 0.04;
      }
    }

    function resize() {
      if (!wrapEl) return;
      const { clientWidth: w, clientHeight: h } = wrapEl;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitWordmark();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrapEl);
    resize();

    const loader = new GLTFLoader();
    loader.load(
      '/assets/models/model.glb',
      (gltf) => {
        if (disposed) return;

        const asset = gltf.scene;
        const box = new Box3().setFromObject(asset);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        asset.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        fitScale = 2.4 / maxDim;
        root.scale.setScalar(fitScale);
        root.add(asset);
        root.updateMatrixWorld(true);

        pieces = buildPieces(asset);

        root.updateMatrixWorld(true);
        const markBox = new Box3().setFromObject(pieces.markMesh);
        const markSize = markBox.getSize(new Vector3());
        const markDim = Math.max(markSize.x, markSize.y) || 1;
        const targetMark = 0.95;
        fitScale *= targetMark / markDim;
        root.scale.setScalar(fitScale);
        root.updateMatrixWorld(true);
        // Lift the lockup so shield + wordmark read as one centred group.
        pieces.markFocus.set(0, (pieces.wordmark?.lift ?? 0) * root.scale.x, 0);
        fitWordmark();
        measureDive();

        startOpening();
      },
      undefined,
      (err) => {
        console.error('[HeroLogo3D] failed to load model', err);
        onready?.();
      }
    );

    let last = performance.now();
    const tick = (now) => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      sheenTime += delta;
      if (pieces) updateSheen(sheenTime);
      if (aura) aura.update(sheenTime, openingDone);
      pieces?.wordmark?.update();
      applyDive(delta);
      // Once the dive is complete the canvas is fully covered by the green panel.
      if (dive.p > 0.995 && heroDive.progress > 0.995) return;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      openingTl?.kill();
      idleTween?.kill();
      aura?.dispose();
      ro.disconnect();
      renderer.dispose();
      root.traverse((obj) => {
        // @ts-expect-error
        if (obj.geometry) obj.geometry.dispose?.();
        // @ts-expect-error
        if (obj.material) {
          // @ts-expect-error
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const mat of mats) mat.dispose?.();
        }
      });
    };
  });
</script>

<div class="stage-3d" bind:this={wrapEl} role="img" aria-label="Six Actual">
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .stage-3d {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
