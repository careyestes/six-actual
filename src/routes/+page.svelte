<script>
  import { onMount, tick } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import LogoWithText from "$lib/components/LogoWithText.svelte";
  import Logo from "$lib/components/LogoMark.svelte";
  import CaseGallery from '$lib/components/Gallery.svelte';

  const acronyms = ['Dynamic','Intuitive', 'Predictive', 'Adaptive', 'Dynamic', 'Autonomous'];
  const displayList = [...acronyms, acronyms[0]];

  let currentIndex = 0;
  let acronymScrambled = [...displayList];
  let animate = true;
  let viewportWidth = 0;
  let timer;

  function randomizedFrom(original) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return original.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  // Immediate scramble, then animate into the real text
  function scrambleInto(original, index) {
    let iterations = 0;
    const maxIterations = original.length + 1;

    // Set an immediate scrambled frame so there is no flash of the real word
    acronymScrambled[index] = randomizedFrom(original);

    const iv = setInterval(() => {
      acronymScrambled[index] = original
        .split('')
        .map((char, i) => (i < iterations ? char : randomizedFrom('a').charAt(0)))
        .join('');

      iterations++;
      if (iterations > maxIterations) {
        acronymScrambled[index] = original;
        clearInterval(iv);
      }
    }, 65);
  }

  function preScramble(index) {
    scrambleInto(displayList[index], index);
  }

  function advance() {
    const next = currentIndex + 1;

    // Pre-scramble the item that is about to slide in
    if (next < displayList.length) {
      preScramble(next);
    }

    animate = true;
    currentIndex = next;

    if (currentIndex === acronyms.length) {
      // We are showing the cloned last item. Pre-scramble index 0
      preScramble(0);

      // After the transition, snap back to 0 without animation
      setTimeout(async () => {
        animate = false;
        currentIndex = 0;
        await tick(); // let DOM update with the snapped position
      }, 250); // match your slide transition
    }
  }

  onMount(() => {
    viewportWidth = window.innerWidth;
    const onResize = () => (viewportWidth = window.innerWidth);
    window.addEventListener('resize', onResize);

    // Pre-scramble what is currently visible and the next item
    preScramble(0);
    preScramble(1);

    timer = setInterval(advance, 3000);

    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(timer);
    };
  });


  $: translateValue = animate
    ? `translateY(-${currentIndex * (viewportWidth < 430 ? 64 : viewportWidth < 760 ? 96 : viewportWidth < 960 ? 112 : viewportWidth < 1500 ? 144 : 192)}px)`
    : 'translateY(0)';

</script>

<svelte:head>
    <title>Six Actual | Intelligence Redefined</title>
</svelte:head>

<section>
  <div class="video-container">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video class="main-video" width="400" autoplay muted playsinline loop preload="auto">
      <source class="video-source" src="/assets/video/global-code-development-data-analytics-network-complexities-SBV-348653380-preview.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
    <div class="logo-container">
      <LogoWithText />
    </div>
    <div class="subheadline">
      <div class="dynamic-intel-container">
        <div class="dynamic-text">
          <div 
            class="acronym-roller" 
            style="
              transform: {translateValue}; 
              transition: {animate ? 'transform 0.25s ease-in-out' : 'none'};
            ">
            {#each displayList as acronym, i}
              <div class="acronym">{acronymScrambled[i]}</div>
            {/each}
          </div>
        </div>
        <div class="lines">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="static-text">
          <div>Intelligence Redefined</div>
          <small>Powered by AI</small>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="pitch-text">
  <!-- svelte-ignore a11y_media_has_caption -->
  <video autoplay muted playsinline loop preload="auto">
    <source class="video-source" src="/assets/video/istockphoto-2209705526-640_adpp_is.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <div class="headline">
    <h1>
      <small>Welcome to the</small>
      <div class="shine-wrap">
        <span class="text-color-red">New Era of Intel</span>
        <span class="overlay-stroke" aria-hidden="true">New Era of Intel</span>
      </div>
    </h1>
  </div>
    <p class="max-width">In a rapidly evolving digital landscape, traditional intelligence methods fall short against emerging threats. Six Actual is pioneering the next generation of AI-driven intelligence tools designed to give both national security agencies and commercial enterprises the competitive edge.</p>
</section>

<section class="why">
  <h2>Why Six Actual<span class="text-color-red">?</span></h2>
  <div class="row-images">
    <div class="offset-image left">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video class="row-left-video" width="400" autoplay muted playsinline loop preload="auto">
        <source class="video-source" src="/assets/video/istockphoto-2190567145-640_adpp_is.mp4" type="video/mp4">
        Your browser does not support HTML5 video.
      </video>
    </div>
    <div class="text-column">
      <p>Our software-first approach transforms how intelligence is collected and analyzed. We leverage advanced artificial intelligence to provide rapid insights, predictive threat detection, and real-time decision support—exactly when it's needed most.</p>
    </div>
    <div class="offset-image right">
      <video class="row-right-video" width="400" autoplay muted playsinline loop preload="auto">
        <source class="video-source" src="/assets/video/istockphoto-2218919395-640_adpp_is.mp4" type="video/mp4">
        Your browser does not support HTML5 video.
      </video>
    </div>
  </div>
</section>

<section class="core-capabilities">
  <h2>Core Capabilities<span class="text-color-red">.</span></h2>
  <div class="flexed-columns">
    <div class="column column-left">
      <p>Ops and Automation</p>
      <ul>
        <li class="bots">
          <h3>Influence Operation Defense</h3>
          <p>Identify and counteract misinformation and deepfakes proactively</p>
        </li>
        <li class="model">
          <h3>Predictive Analytics</h3>
          <p>Anticipate cyber and geopolitical risks before they become threats</p>
        </li>
        <li class="processing">
          <h3>Real-Time Insights</h3>
          <p>Instant analysis of diverse intelligence sources to support agile decision-making</p>
        </li>
      </ul>
    </div>
    <div class="column column-right">
      <p>AI Integration</p>
      <ul>
        <li class="humint">
          <h3>Network Intelligence:</h3>
          <p>Leverage global data streams to maintain situational awareness.</p>
        </li>
        <li class="sigint">
          <h3>Sensor Intelligence</h3>
          <p>AI-driven deployment ensures broad-spectrum coverage across critical intelligence domains</p>
        </li>
        <li class="masint">
          <h3>Cognitive Fusion</h3>
          <p>Seamlessly combine multisource intelligence into unified, actionable insights for faster strategic decisions</p>
        </li>
      </ul>
    </div>
  </div>
</section>

<section class="dashboard-video-background">
  <video class="row-left-video" width="400" autoplay muted playsinline loop preload="auto">
    <source class="video-source" src="/assets/video/blue-futuristic-abstract-digital-device-hi-tech-elements-on-a-circuit-board-ar-SBV-346500290-preview.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <div class="text-container">
    <h3>All powered through an AI Dashboard</h3>
    <p>Delivering automated risk assessments, alerts, and strategic recommendations</p>
  </div>
</section>

<footer>
  <video class="row-left-video" width="400" autoplay muted playsinline loop preload="auto">
    <source class="video-source" src="/assets/video/istockphoto-2156008821-640_adpp_is.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <h2>
    <span>Transforming</span> 
    <span>Intelligence</span>
  </h2>
  <p class="max-width">The future demands intelligence that’s adaptive, real-time, and actionable. Six Actual leads this transformation, enabling organizations to stay ahead of threats and seize strategic opportunities.</p>
  <h3 class="max-width">Explore what real-time, AI-driven intelligence can do for you<span class="text-color-red">.</span></h3>
  <div class="citation">
    <Logo />
    <small>© 2025 Six Actual</small>
  </div>
</footer>

<style lang="scss">
  @use "../lib/styles/variables.scss" as *;

  video {
    display: block; 
    width: 100%;
    height: auto;
    pointer-events: none;
    object-fit: cover;
  }
  .max-width {
    max-width: $text-max-width;
    margin: 0 auto;
  }

  .video-container {
    position: relative;
    z-index: 0;
    height: auto;
    margin: 0;
    isolation: isolate;
    mix-blend-mode: difference;
    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 4rem;
      max-height: 90vh;
      border-radius: $border-radius;
      box-shadow: 0 0 2rem $black;
      overflow: hidden;
      &::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: -1;
        border-radius: inherit;
        padding: 1px;
        background: $gradient-green; 
        mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }
    }

    .main-video {
      position: relative;
      z-index: 0;
      display: block; 
      width: calc(100% - 2px);
      height: auto;
      margin: 1px;
      border-radius: inherit; 
      opacity: 0.8;
    }
    .logo-container {
      position: absolute;
      top: 12%;
      left: 50%;
      z-index: 1;
      width: 50%;
      transform: translate(-50%, 0);
      @media screen and (min-width: $breakpoint-max-medium) {
        top: 4rem;
        left: 0;
        right: 0; 
        width: 14%;
        margin: 0 auto;
        transform: translate(0, 0);
      }

    }
    .subheadline {
      margin: 3rem 2rem;
      @media screen and (min-width: $breakpoint-max-medium) {
        position: absolute;
        top: auto;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }
      @media screen and (min-width: $breakpoint-max-large) {
        top: 40%;
        bottom: auto;
        max-width: 94rem;
      }
      
      .dynamic-intel-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        height: auto;
        font-weight: 900;
        line-height: normal;
        @media screen and (min-width: $breakpoint-max-medium) {
        }
        @media screen and (min-width: $breakpoint-max-large) {
          flex-direction: row;
          height: 12rem;
          text-align: right;
          justify-content: center;
        }

        .dynamic-text {
          position: relative;
          flex: 0 0 4rem;
          overflow: hidden;
          @media screen and (min-width: $breakpoint-max-extrasmall) {
            flex: 0 0 6rem;
          }
          @media screen and (min-width: $breakpoint-max-small) {
            flex: 0 0 7rem;
          }
          @media screen and (min-width: $breakpoint-max-medium) {
            flex: 0 0 9rem;
          }
          @media screen and (min-width: $breakpoint-max-large) {
            position: relative;
            z-index: 1;
            flex: 0 0 auto;
            height: 13rem;
            font-size: calc(var(--fluid-7) + 1rem);
            letter-spacing: -0.25rem;
            text-align: right;
            transform: translate(0rem, -1rem);
          }
          .acronym-roller {
            display: flex;
            flex-direction: column;
          }
          
          .acronym {
            // height: 8rem;
            display: flex;
            align-items: flex-start;
            color: $secondary-active;
            justify-content: flex-start;
            font-size: 3rem;
            line-height: 4rem;
            @media screen and (min-width: $breakpoint-max-extrasmall) {
              font-size: 4rem;
              line-height: 6rem;
            }
            @media screen and (min-width: $breakpoint-max-small) {
              font-size: 6rem;
              line-height: 7rem;
            }
            @media screen and (min-width: $breakpoint-max-medium) {
              justify-content: center;
              font-size: 8rem;
              line-height: 9rem;
            }
            @media screen and (min-width: $breakpoint-max-large) {
              align-items: center;
              justify-content: flex-end;
              height: 12rem;
              text-shadow: 0 0.2rem 0.2rem $green-800;
            }
          }
        }

        .lines {
          position: relative;
          z-index: 0;
          flex: 0 0 auto;
          .line {
            display: none;
            @media screen and (min-width: $breakpoint-max-large) {
              position: absolute;
              top: -3rem;
              display: block;
              width: 1px;
              height: 18rem;
              background: $white;
              transform: rotate(44deg);
              margin: 0 auto; 
              mix-blend-mode: saturation;
            }
            &:nth-child(1) {
              transform: translate(-2rem, 0) rotate(44deg);
              opacity: 0.10;
            }
            &:nth-child(2) {
              transform: translate(-1.5rem, 0) rotate(44deg);
              opacity: 0.25;
            }
            &:nth-child(3) {
              transform: translate(-1rem, 0) rotate(44deg);
              opacity: 0.5;
            }
            &:nth-child(4) {
              transform: translate(-0.5rem, 0) rotate(44deg);
              opacity: 0.75;
            }
            &:nth-child(5) {
              transform: translate(0rem, 0) rotate(44deg);
              opacity: 1;
            }
            &:nth-child(6) {
              transform: translate(0.5rem, 0) rotate(44deg);
              opacity: 1;
            }
            &:nth-child(7) {
              transform: translate(1rem, 0) rotate(44deg);
              opacity: 0.75;
            }
            &:nth-child(8) {
              transform: translate(1.5rem, 0) rotate(44deg);
              opacity: 0.5;
            }
            &:nth-child(9) {
              transform: translate(2rem, 0) rotate(44deg);
              opacity: 0.25;
            }
            &:nth-child(10) {
              transform: translate(2.5rem, 0) rotate(44deg);
              opacity: 0.10;
            }
          }
        }
        
        .static-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 0 0 auto;
          margin: 0;
          font-size: var(--fluid-5);
          line-height: var(--fluid-5);
          @media screen and (min-width: $breakpoint-max-medium) {
            align-items: center;
            font-size: var(--fluid-4);
            line-height: var(--fluid-5);
          }
          @media screen and (min-width: $breakpoint-max-large) {
            position: relative;
            z-index: 1;
            flex: 1 1 auto;
            align-items: flex-start;
            justify-content: center;
            margin: 0 0 0 1rem;
            padding: 0 0 0 0;
            font-size: var(--fluid-5);
            line-height: var(--fluid-5);
            text-align: left;
            text-shadow: 0 0.2rem 0.2rem $green-800;
            // transform: translate(-6rem, 6rem);
          }
          div {
            @media screen and (min-width: $breakpoint-max-medium) {
              margin: 0 auto;
              text-align: center;
            }
            @media screen and (min-width: $breakpoint-max-large) {
              margin: 0;
              text-align: left;
            }
          }
          small {
            font-family: $geist;
            font-size: var(--fluid-1);
            font-weight: 900;
            letter-spacing: 0.25rem;
            line-height: var(--fluid-3);
            text-transform: uppercase;
            text-shadow: 0 0.2rem 0.2rem $green-800;
            @media screen and (min-width: $breakpoint-max-medium) {

            }
            @media screen and (min-width: $breakpoint-max-large) {
              font-size: var(--fluid-2);
              letter-spacing: 0.5rem;
              text-align: left;
            }
          }
        }
      }
    }
  }

  .headline {
    position: relative;
    margin: 1rem 2rem;
    z-index: 1;
    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 0 auto;
      padding: 0rem 10rem 4rem; 
      text-align: center;
      // text-shadow: 0 0 2rem $black;
    }
    @media screen and (min-width: $breakpoint-max-large) {
      padding: 0rem 20rem 4rem; 
    }
    h1 {
      display: flex;
      flex-direction: column;
      font-size: var(--fluid-3);
      line-height: var(--fluid-4);
      @media screen and (min-width: $breakpoint-max-medium) {
        font-size: var(--fluid-7);
        line-height: var(--fluid-7);
      }
      small {
        font-size: var(--fluid-2);
        line-height: var(--fluid-2);
        @media screen and (min-width: $breakpoint-max-large) {
          font-size: var(--fluid-5);
          line-height: var(--fluid-6);
        }
      }
      .shine-wrap {
        position: relative;
        display: inline-block;
      }

      .overlay-stroke {
        position: absolute;
        inset: 0;
        pointer-events: none;
        color: transparent;
        -webkit-text-fill-color: transparent;
        -webkit-text-stroke: 2px transparent;
        background-image: linear-gradient(
          40deg,
          rgba(255,0,64,0) 0%,
          rgba(255,0,64,0) 40%,
          rgba(255,127,127,0.8) 50%,
          rgba(255,0,64,0) 60%,
          rgba(255,0,64,0) 100%
        );
        background-size: 200% 100%;
        background-position: -20% 0;
        -webkit-background-clip: text;
        opacity: 0.9;
        animation: shine 8s ease-in-out infinite;
      }

      @keyframes shine {
        0%   { background-position: -20% 0; }
        100% { background-position: 120% 0; }
      }
    }
  }

  .pitch-text {
    position: relative;
    video {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 0;
      width: 100%;
      height: auto;
      margin: 0 auto;
      object-fit: cover;
      mix-blend-mode: color-dodge;
      filter: hue-rotate(210deg) opacity(0.6) blur(3px) grayscale(0.5);
    }
    p {
      position: relative;
      z-index: 1;
      margin: 0 2rem;
      font-size: var(--fluid-0);
      line-height: calc(var(--fluid-2) + 0.2rem);
      @media screen and (min-width: $breakpoint-max-medium ){
        margin: 0 2rem;
        font-size: var(--fluid-1);
        line-height: var(--fluid-3);
      }
      @media screen and (min-width: $breakpoint-max-large) {
        margin: 0 auto;
      }
    }
  }

  .why {
    h2 {
      max-width: $container-max-width;
      margin: 8rem auto 2rem;
      font-size: var(--fluid-4);
      line-height: var(--fluid-5);
      text-align: center;
      @media screen and (min-width: $breakpoint-max-medium) {
        font-size: var(--fluid-6);
        line-height: var(--fluid-7);
      }
    }
  }

  .row-images {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    @media screen and (min-width: $breakpoint-max-medium) {
      flex-direction: row;
    }
    div {
      flex: 1 1 20rem;
      @media screen and (min-width: $breakpoint-max-medium) {
        flex: 1 1 20%;
      }
      &.text-column {
        flex: 1 1 auto;
        margin: 0 1rem;
        font-size: var(--fluid-0);
        line-height: var(--fluid-2);
        @media screen and (min-width: $breakpoint-max-medium) {
          flex: 1 1 30%;
          margin: 0;
          font-size: var(--fluid-0);
          line-height: var(--fluid-1);
        }
        p {
          margin: 0 1rem;
          font-size: var(--fluid-0);
          line-height: calc(var(--fluid-2) + 0.2rem);
          @media screen and (min-width: $breakpoint-max-medium) {
            margin: 0 auto;
            padding: 1rem 0;
            font-size: var(--fluid-1);
            line-height: var(--fluid-3);
          }
        }
      }
    }
    .offset-image {
      position: relative;
      overflow: hidden;
      isolation: isolate;
      filter: hue-rotate(-40deg);
      @media screen and (min-width: $breakpoint-max-medium) {
        border-radius: $border-radius;
        &::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: inherit;
          padding: 1px;
          background: $gradient-green;
  
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      }
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.3); // or a gradient
        z-index: 1;
      }
      &.left {
        @media screen and (min-width: $breakpoint-max-medium) {
          border-radius: 0 $border-radius $border-radius 0;
          &::before {
            padding-left: 0;
          }
        }
      }
      &.right {
        @media screen and (min-width: $breakpoint-max-medium) {
          border-radius: $border-radius 0 0 $border-radius;
          &::before {
            padding-right: 0;
          }
        }
      }

      video {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: translate(-50%, -50%);
        z-index: -1;
        pointer-events: none;
      }

    }
  }

  .core-capabilities {
    margin: 2rem 1rem 2rem;
    max-width: $container-max-width;
    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 10rem 2rem 2rem;
    }
    @media screen and (min-width: $breakpoint-max-large) {
      margin: 10rem auto 2rem;
    }
    h2 {
      font-size: var(--fluid-4);
      line-height: var(--fluid-5);
      @media screen and (min-width: $breakpoint-max-medium) {
        font-size: var(--fluid-6);
        line-height: var(--fluid-7);
      }
    }
    .flexed-columns {
      display: flex;
      flex-direction: column;
      @media screen and (min-width: $breakpoint-max-medium) {
        flex-direction: row;
        gap: 2rem;
      }
      .column {
        flex: 1 1 50%;
        p {
          text-align: center;
          font-size: var(--fluid-2);
        }
        ul {
          display: flex;
          flex-direction: column;
          list-style: none;
          gap: 2rem;
          padding: 0;
          li {
            position: relative;
            display: flex;
            min-height: 17rem;
            padding: 2.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 1.25rem;
            align-self: stretch;
            background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%);
            border-radius: $border-radius;
            border: 1px solid var(--Frame-Border-1, #5A946A);
            &::after {
              content: "";
              position: absolute;
              z-index: 1;
              inset: 0;
              background: rgb(3 23 11 / 85%);
              border-radius: $border-radius;
              mix-blend-mode: darken;
            }
            &.bots {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-2197014958-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            &.model {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-1224971139-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            &.processing {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-2182883317-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            &.tasking {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-1804289230-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            &.humint {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-2197120164-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            &.sigint {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-1154752212-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            &.imint {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-2200130034-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            &.masint {
              background: linear-gradient(181deg, rgba(0, 41, 37, 0.16) 0.71%, rgba(0, 102, 92, 0.16) 99.29%), url("/assets/images/istockphoto-2161502196-1024x1024.jpg");
              background-position: 0 0;
              background-size: cover;
              background-repeat: no-repeat;
            }
            h3 {
              position: relative;
              z-index: 2;
              margin: 0;
              color: var(--Secondary, #FF0040);
              font-size: var(--fluid-1);
              font-style: normal;
              font-weight: 600;
              line-height: var(--fluid-2);
              text-shadow: 0 0 2rem $black;
            }
            p {
              position: relative;
              z-index: 2;
              font-family: $geist;
              font-size: var(--fluid-0);
              font-style: normal;
              font-weight: 100;
              line-height: normal;
              text-align: left;
              text-shadow: 0 0 2rem $black;
            }
          }
        }
      }
    }
  }

  .dashboard-video-background {
    position: relative;
    z-index: 0;
    min-height: 25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 0.5rem solid $green-600;
    border-bottom: 0.5rem solid $green-600;
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6); // or a gradient
      z-index: 1;
    }
    video {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: translate(-50%, -50%);
      z-index: -1;
      pointer-events: none;
    }

    .text-container {
      position: relative;
      z-index: 2;
      text-shadow: 0 0 2rem $black;
      h3 {
        color: $red-400;
        font-size: var(--fluid-5);
        line-height: var(--fluid-6);
        text-align: center;
        @media screen and (min-width: $breakpoint-max-medium) {
          font-size: var(--fluid-4);
          line-height: var(--fluid-5);
        }
      }
      p {
        font-size: var(--fluid-1);
        line-height: var(--fluid-2);
        text-align: center;
      }
    }
  }

  .case-studies {
    margin: 5rem 1rem 2rem;
    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 5rem 2rem 2rem;
      max-width: $container-max-width;
    }
    @media screen and (min-width: $breakpoint-max-large) {
      margin: 5rem auto 2rem;
    }
    h2 {
      margin: 0 0 2rem;
      font-size: var(--fluid-4);
      line-height: var(--fluid-5);
      @media screen and (min-width: $breakpoint-max-medium) {
        font-size: var(--fluid-6);
        line-height: var(--fluid-7);
      }
    }
  }

  footer {
    position: relative;
    margin: 0 0 0;
    padding: 4rem 0;
    overflow: hidden;
    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 0 0 0;
    }
    video {
      position: absolute;
      // top: 50%;
      // left: 50%;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: translate(0%, 0%) scale(1.3);
      transform-origin: top left;
      z-index: -1;
      pointer-events: none;
      mix-blend-mode: color-dodge;
      filter: hue-rotate(-30deg) opacity(0.3);
    }
    h2 {
      display: flex;
      flex-direction: column;
      margin: 0 0 2rem;
      font-size: var(--fluid-5);
      line-height: var(--fluid-6);
      text-align: center;
      @media screen and (min-width: $breakpoint-max-medium) {
        font-size: var(--fluid-6);
        line-height: var(--fluid-7);
      }
    }
    h3 {
      padding: 0 1rem;
      font-size: var(--fluid-3);
      line-height: var(--fluid-4);
    }
    p.max-width {
      margin: 2rem 1rem;
      font-size: var(--fluid-0);
      line-height: var(--fluid-2);
      @media screen and (min-width: $breakpoint-max-medium) {
        margin: 2rem auto;
        font-size: var(--fluid-0);
        line-height: var(--fluid-1);
      }
    }
    .citation {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin: 10rem 0 0;
      text-align: center;
    }
  }

</style>