<script>
  import HeroSection from '$lib/components/sections/HeroSection.svelte';
  import PitchSection from '$lib/components/sections/PitchSection.svelte';
  import WhySection from '$lib/components/sections/WhySection.svelte';
  import SiteFooter from '$lib/components/sections/SiteFooter.svelte';
</script>

<svelte:head>
  <title>Six Actual | Analytics Redefined</title>
  <link rel="preload" as="image" href="/assets/video/hero-data-network-poster.jpg" />
  <link rel="preload" as="video" href="/assets/video/hero-data-network.mp4" type="video/mp4" />
</svelte:head>

<HeroSection />
<PitchSection />
<WhySection />
<SiteFooter />
