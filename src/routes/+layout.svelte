<script>
  import { onMount } from 'svelte';
  import '../app.scss';
  import { startParallax } from '$lib/parallax.js';

  onMount(() => startParallax());
</script>

<a class="skip-link" href="#main">Skip to content</a>

<main id="main" tabindex="-1">
  <slot />
</main>

<style>
  main {
    min-height: 100svh;
  }

  main:focus {
    outline: none;
  }
</style>
