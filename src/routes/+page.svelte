<script>
  import HeroSection from '$lib/components/sections/HeroSection.svelte';
  import PitchSection from '$lib/components/sections/PitchSection.svelte';
  import WhySection from '$lib/components/sections/WhySection.svelte';
  import SiteFooter from '$lib/components/sections/SiteFooter.svelte';
  import Journey from '$lib/components/Journey.svelte';
</script>

<svelte:head>
  <title>Six Actual | Analytics Redefined</title>
</svelte:head>

<Journey>
  <HeroSection />
  <PitchSection />
  <WhySection />
  <SiteFooter />
</Journey>
