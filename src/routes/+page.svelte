<script>
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import LogoWithText from "$lib/components/LogoWithText.svelte";
  import Logo from "$lib/components/LogoMark.svelte";
  import CaseGallery from '$lib/components/Gallery.svelte';

  const acronyms = ['AI', 'HUM', 'SIG', 'IM', 'MAS'];
  const phrases = {
    AI: [
      'counter-misinformation',
      'adversarial network mapping',
      'deepfake detection'
    ],
    HUM: [
      'crowdsourced',
      'real-time',
      'intelligence'
    ],
    SIG: [
      'military movements',
      'GPS jamming',
      'cyber threats'
    ],
    IM: [
      'track troop buildups',
      'infrastructure expansion',
      'economic disruptions'
    ],
    MAS: [
      'nuclear activity',
      'industrial espionage',
      'illicit resource extraction'
    ]
  };
  let currentIndex = 0;
  let interval;
  let animate = true;
  let viewportWidth = 0;

  const displayList = [...acronyms, acronyms[0]];
  let displayedPhrases = phrases[acronyms[currentIndex]];
  let scrambled = [...displayedPhrases];
  let wrapper;

  // Scramble effect
  function scrambleText(original, index) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let iterations = 0;
    const maxIterations = 10;

    const interval = setInterval(() => {
      scrambled[index] = original
        .split('')
        .map((char, i) =>
          i < iterations ? char : chars[Math.floor(Math.random() * chars.length)]
        )
        .join('');

      iterations++;
      if (iterations > original.length) {
        scrambled[index] = original;
        clearInterval(interval);
      }
    }, 30);
  }

  function advance() {
    animate = true;
    currentIndex += 1;

    if (currentIndex === acronyms.length) {
      // Show the clone acronym (no need to update phrases)
      setTimeout(() => {
        animate = false;
        currentIndex = 0;
        displayedPhrases = phrases[acronyms[0]];
        scrambled = [...displayedPhrases];
        scrambled.forEach((_, i) => scrambleText(displayedPhrases[i], i));
      }, 250); // matches transition time
    } else {
      displayedPhrases = phrases[acronyms[currentIndex]];
      scrambled = [...displayedPhrases];
      scrambled.forEach((_, i) => scrambleText(displayedPhrases[i], i));
    }
  }

  onMount(() => {
    // For grabbing viewport to swap height animation
    viewportWidth = window.innerWidth;
    window.addEventListener("resize", () => {
      viewportWidth = window.innerWidth;
    });
    // To kick the advance animation
    scrambled.forEach((_, i) => scrambleText(displayedPhrases[i], i));
    const interval = setInterval(advance, 3000); // pause for 3s per acronym
    return () => clearInterval(interval);
  });

  $: translateValue = animate
    ? `translateY(-${currentIndex * (viewportWidth < 960 ? 80 : 192)}px)`
    : 'translateY(0)';

</script>

<section>
  <div class="video-container">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video class="main-video" width="400" autoplay muted playsinline loop>
      <source class="video-source" src="/assets/video/global-code-development-data-analytics-network-complexities-SBV-348653380-preview.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
    <div class="logo-container">
      <LogoWithText />
    </div>
    <div class="headline">
      <h1>Building a Next-Generation Software Company for Information Dominance</h1>
    </div>
    <div class="subheadline">
      <div class="dynamic-intel-container">
        <div class="dynamic-text">
          <div
            bind:this={wrapper}
            class="acronym-wrapper"
            style=" transform: {translateValue}; transition: {animate ? 'transform 0.25s ease-in-out' : 'none'};">
            {#each displayList as acronym}
              <div class="acronym">{acronym}</div>
            {/each}
          </div>
        </div>
        <div class="static-text">INT</div>
      </div>
      <ul class="phrase-list">
        {#each scrambled as phrase}
          <li>{phrase}</li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="pitch-text">
  <p class="max-width">In a world where adversaries exploit AI, misinformation, and digital networks to undermine national security, intelligence agencies and private-sector firms require an autonomous, AI-driven intelligence solution to maintain an operational advantage.</p>
  <h2>Six Actual<br /> is the <span class="text-color-red">solution.</span></h2>
</section>

<section class="row-images">
  <div class="offset-image left">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video class="row-left-video" width="400" autoplay muted playsinline loop>
      <source class="video-source" src="/assets/video/istockphoto-2190567145-640_adpp_is.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
  </div>
  <div class="text-column">
    <p>Six Actual develops AI-powered intelligence operations, realtime data analytics, and automated collection tasking to enhance national security and commercial intelligence capabilities.</p>
    <p>By taking a software-first approach, Six Actual delivers mission-ready, rapidly deployable solutions that integrate seamlessly with existing intelligence infrastructure. AI-driven automation will enable real-time intelligence collection, analysis, and response, providing decision-makers with scalable, real-time decision-support tools designed for modern geopolitical and cyber warfare.</p>
  </div>
  <div class="offset-image right">
    <video class="row-right-video" width="400" autoplay muted playsinline loop>
      <source class="video-source" src="/assets/video/istockphoto-2218919395-640_adpp_is.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
  </div>
</section>

<section class="core-capabilities">
  <h2>Core Capabilities</h2>
  <div class="flexed-columns">
    <div class="column column-left">
      <p>Ops and Automation</p>
      <ul>
        <li class="bots">
          <h3>Autonomous Bots</h3>
          <p>Counter-misinformation, adversarial network mapping, and deepfake detection to combat influence operations</p>
        </li>
        <li class="model">
          <h3>Predictive Threat Modeling</h3>
          <p>Leveraging AI-powered analytics to forecast emerging cyber and geopolitical risks</p>
        </li>
        <li class="processing">
          <h3>Real-Time Intelligence Processing</h3>
          <p>Autonomously collect and analyze OSINT,SIGINT, IMINT, and MASINT</p>
        </li>
        <li class="tasking">
          <h3>Adaptive AI Tasking</h3>
          <p>Automated sensor deployment, ensuring comprehensive intelligence coverage</p>
        </li>
      </ul>
    </div>
    <div class="column column-right">
      <p>Integration</p>
      <ul>
        <li class="humint">
          <h3>HUMINT</h3>
          <p>Gig economy networks provide crowdsourced real-time intelligence from conflict zones, protests, and supply chains</p>
        </li>
        <li class="sigint">
          <h3>SIGINT</h3>
          <p>AI-driven RF signal detection enables tracking of military movements, GPS jamming, and cyber threats</p>
        </li>
        <li class="imint">
          <h3>IMINT</h3>
          <p>Commercial satellite imagery and AI-powered pattern recognition track troop buildups, infrastructure expansion, and economic disruptions</p>
        </li>
        <li class="masint">
          <h3>MASINT</h3>
          <p>AI-powered environmental sensors detect nuclear activity, industrial espionage, and illicit resource extraction</p>
        </li>
      </ul>
    </div>
  </div>
</section>

<section class="dashboard-video-background">
  <video class="row-left-video" width="400" autoplay muted playsinline loop>
    <source class="video-source" src="/assets/video/blue-futuristic-abstract-digital-device-hi-tech-elements-on-a-circuit-board-ar-SBV-346500290-preview.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <div class="text-container">
    <h3>All powered through an AI Dashboard</h3>
    <p>Delivering automated risk assessments, alerts, and strategic recommendations</p>
  </div>
</section>

<section class="case-studies">
  <h2>Case Studies</h2>
  <CaseGallery />
</section>

<footer>
  <video class="row-left-video" width="400" autoplay muted playsinline loop>
    <source class="video-source" src="/assets/video/istockphoto-2185567591-640_adpp_is.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <h2>The time is <span>now.</span></h2>
  <p class="max-width">The intelligence industry is undergoing a seismic shift—from classified, slow-moving intelligence models to real-time, AI-powered commercial and open-source intelligence networks.</p>
  <p class="max-width">Six Actual is positioned to be the leading AI-powered intelligence provider, integrating autonomous AI tasking, commercial sensor data, and real-time predictive analytics to deliver unmatched intelligence solutions for national security and financial markets. The future of intelligence is real-time, AI-driven, and market-responsive—and this company is built to lead that transformation. The time to now.</p>
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
      top: 10%;
      left: 50%;
      z-index: 1;
      width: 50%;
      transform: translate(-50%, 0);
      @media screen and (min-width: $breakpoint-max-medium) {
        top: 1rem;
        left: 1rem;
        width: 18%;
        transform: translate(0, 0);
      }

    }
    .headline {
      margin: 1rem;
      @media screen and (min-width: $breakpoint-max-medium) {
        position: absolute;
        top: 1rem;
        right: 1rem;
        left: auto;
        z-index: 1;
        width: calc(82% - 2rem);
        max-width: 50rem;
        margin: 0 0;
        text-align: right;
        text-shadow: 0 0 2rem $black;
      }
      h1 {
        font-size: var(--fluid-2);
        line-height: var(--fluid-3);
      }
    }
    .subheadline {
      margin: 2rem 0;
      @media screen and (min-width: $breakpoint-max-medium) {
        position: absolute;
        top: 40%;
        right: 4rem;
        z-index: 1;
        margin: 0;
      }
      .dynamic-intel-container {
        display: flex;
        justify-content: center;
        height: 5rem;
        font-size: var(--fluid-7);
        font-weight: 900;
        line-height: normal;
        @media screen and (min-width: $breakpoint-max-medium) {
          height: 12rem;
          text-align: right;
          justify-content: right;
        }

        .dynamic-text {
          overflow: hidden;
          height: 5rem;
          position: relative;
          @media screen and (min-width: $breakpoint-max-medium) {
            width: 20rem;
            height: 12rem;
          }
          .acronym-wrapper {
            display: flex;
            flex-direction: column;
          }

          .acronym {
            height: 5rem;
            display: flex;
            align-items: center;
            color: $secondary-active;
            justify-content: center;
            @media screen and (min-width: $breakpoint-max-medium) {
              justify-content: flex-end;
              height: 12rem;
            }
          }
        }

        .static-text {
          display: flex;
          align-items: center;
          @media screen and (min-width: $breakpoint-max-medium) {
            margin-left: 1rem;
          }
        }

        .phrase-list {
          margin-top: 1rem;
          font-family: monospace;
          font-size: 1.25rem;
          list-style: none;
          padding: 0;
        }

        .phrase-list li {
          line-height: 1.6;
        }
      }
      ul {
        padding: 0;
        font-size: var(--fluid-0);
        line-height: var(--fluid-1);
        line-height: 2rem;
        list-style: none;
        text-align: center;
        text-shadow: 0 0.2rem 0.2rem $black;
        @media screen and (min-width: $breakpoint-max-medium) {
          padding-right: 2rem;
          font-size: var(--fluid-1);
        line-height: var(--fluid-2);
          text-align: right;
        }
      }
    }

  }

  .pitch-text {
    p {
      margin: 0 1rem;
      font-size: var(--fluid-0);
      line-height: calc(var(--fluid-2) + 0.2rem);
      @media screen and (min-width: $breakpoint-max-medium) {
        margin: 0 auto;
        font-size: var(--fluid-1);
      }
    }
    h2 {
      margin: var(--fluid-4) 1rem;
      font-size: var(--fluid-5);
      line-height: var(--fluid-6);
      text-align: center;
      @media screen and (min-width: $breakpoint-max-medium) {
        margin: var(--fluid-4) auto;
        font-size: var(--fluid-6);
        line-height: var(--fluid-6);
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
        flex: 1 1 30%;
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
    margin: 10rem 1rem 2rem;
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
    margin: 4rem 0 0;
    padding: 4rem 0;
    border-top: 0.5rem solid $green-600;
    overflow: hidden;
    @media screen and (min-width: $breakpoint-max-medium) {
      margin: 10rem 0 0;
    }
    video {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: translate(-50%, -50%) scale(1.3);
      transform-origin: top left;
      z-index: -1;
      pointer-events: none;
      mix-blend-mode: color-dodge;
      filter: hue-rotate(-30deg);
    }
    h2 {
      margin: 0 0 2rem;
      font-size: var(--fluid-5);
      line-height: var(--fluid-6);
      text-align: center;
      @media screen and (min-width: $breakpoint-max-medium) {
        font-size: var(--fluid-6);
        line-height: var(--fluid-7);
      }
      span {
        color: $red-400;
      }
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