/**
 * Shared, scroll-driven "dive" state. Journey.svelte tweens `progress` 0 → 1 as the
 * user scrolls; HeroLogo3D reads it every frame (once the opening has finished) and
 * flies the camera into the shield's "6" counterspace.
 */
export const heroDive = { progress: 0 };
