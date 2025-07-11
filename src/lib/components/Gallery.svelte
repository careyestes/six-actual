<script>
  import { fade } from 'svelte/transition';
  let currentIndex = 0;

  const slides = [
    {
      title: "Case Study 1:",
      subtitle: "Ukraine’s Use of Commercial & Open-Source Intelligence",
      description: `Ukraine has outmaneuvered Russian forces by integrating commercial satellite imagery, AI-driven geospatial intelligence, and social media monitoring to track troop movements, disrupt logistics, and enhance battlefield decision-making.`,
      image: "/assets/images/istockphoto-2170816663-1024x1024.jpg",
      alt: 'Map of Ukraine with glowing lines',
    },
    {
      title: "Case Study 2:",
      subtitle: "AI-Driven Financial Market Intelligence",
      description: `Hedge funds use AI-enhanced OSINT to track global supply chains, political risks, and cyber threats, leveraging satellite imagery and alternative data to make market-moving decisions before traditional analysts.`,
      image: "/assets/images/istockphoto-1358049863-1024x1024.jpg",
      alt: 'Map of Ukraine with glowing lines',
    },
    {
      title: "Case Study 3:",
      subtitle: "Commercial Cell Phone Data for Intelligence",
      description: `AI-powered geospatial analysis of AdTech-derived location data allows intelligence agencies and financial firms to track illicit networks, supply chain disruptions, and emerging economic trends in real time.`,
      image: "/assets/images/istockphoto-165838058-1024x1024.jpg",
      alt: 'Map of Ukraine with glowing lines',
    }
  ];

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
  }

  function goTo(index) {
    currentIndex = index;
  }
</script>

<div class="gallery">
  <div class="slide-wrapper">
    <button class="left" on:click={prevSlide} aria-label="Previous Slide"></button>
    {#key currentIndex}
      <div class="slide" transition:fade={{ duration: 400 }}>
        <div class="image">
          <img src={slides[currentIndex].image} alt={slides[currentIndex].alt} />
        </div>
        <div class="content">
          <h3>{slides[currentIndex].title}</h3>
          <h4>{slides[currentIndex].subtitle}</h4>
          <p>{slides[currentIndex].description}</p>
        </div>
      </div>
    {/key}
    <button class="right" on:click={nextSlide} aria-label="Next Slide"></button>
  </div>

  <div class="controls">
    
    <div class="dots">
      {#each slides as _, i}
        <button
          class:active={i === currentIndex}
          on:click={() => goTo(i)}
          aria-label={`Gallery Item ${i + 1}`}
        ></button>
      {/each}
    </div>
    
  </div>
</div>


<style lang="scss">
  @use "../styles/variables.scss" as *;
  
  .gallery {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    overflow: hidden;
    .slide-wrapper {
      position: relative;
      width: 100%;
      height: 42rem; 
      @media screen and (min-width: $breakpoint-max-medium) {
        height: 30rem; 
      }
      button {
        position: absolute;
        top: calc(100% + 2rem);
        z-index: 3;
        background: none;
        width: 2rem;
        height: 2rem;
        border: 2px solid $primary-active;
        color: $primary-active;
        font-size: 3rem;
        cursor: pointer;
        @media screen and (min-width: $breakpoint-max-medium) {
          top: 50%;
        }
        &.left {
          left: 0;
          border-top: 0;
          border-right: 0;
          transform: translate(0.5rem, -50%) rotate(45deg);
        }
        &.right {
          right: 0;
          border-bottom: 0;
          border-left: 0;
          transform: translate(-0.5rem, -50%) rotate(45deg);
        }
      }

      .slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: flex-start;
        padding: 0;
        @media screen and (min-width: $breakpoint-max-medium) {
          flex-direction: row;
          gap: 2rem;
          padding: 0 4rem;
        }
        .image {
          flex: 0 0 20rem;
          width: 100%;
          height: auto;
          border-radius: $border-radius;
          border: 1px solid var(--Frame-Border-1, #5A946A);
          overflow: hidden;
          @media screen and (min-width: $breakpoint-max-medium) {
            flex: 0 0 30rem;
            width: 30rem;
            height: 30rem;
          }
          img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .content {
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          align-items: flex-start;
          @media screen and (min-width: $breakpoint-max-medium) {
            padding-top: 2.5rem;
          }
          h3 {
            font-size: var(--fluid-3);
            line-height: var(--fluid-4);
            margin: 0;
          }
          h4 {
            font-size: var(--fluid-1);
            line-height: var(--fluid-2);
            font-weight: bold;
            margin: 0.5rem 0 1rem;
          }
          p {
            font-family: $geist;
            font-size: var(--fluid-0);
            font-weight: 100;
            line-height: var(--fluid-1);
            white-space: pre-wrap;
          }
        }
      }
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      .dots {
        display: flex;
        gap: 0;
        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          &::before {
            display: block;
            content: "";
            width: 12px;
            height: 12px;
            background: #555;
            border-radius: 50%;
          }
          &.active {
            &::before {
              width: 32px;
              background: $primary-active;
              border-radius: 10rem;
            }
          }
        }
      }
    }
  }
</style>
