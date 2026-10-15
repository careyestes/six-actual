import { writable } from 'svelte/store';

/** True once the hero opening animation has finished (scroll journey unlocks). */
export const heroOpeningDone = writable(false);
