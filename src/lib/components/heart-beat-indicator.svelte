<script lang="ts">
  // Heart rate animation
  // https://codepen.io/jupa8712/pen/XmbyXE?js-preprocessor=none

  const text = '';
  let { delay = 0 }: { delay?: number } = $props();

  const cssVarStyles = $derived(`--animation-delay:${delay}ms;`);
</script>

<div class="heart-beat" style={cssVarStyles} aria-hidden="true">
  <div class="heart-rate">
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="20px"
      height="14px"
      viewBox="0 0 150 73"
      enable-background="new 0 0 150 73"
      xml:space="preserve"
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-miterlimit="10"
        points="0,45.486 18.514,45.486 24.595,33.324 32.676,45.486 37.771,45.486 42.838,55.622 51.959,18 56.067,45 60.067,60.729 63.122,45.486 77.297,45.486 83.379,41.419 90.473,45.486 100,45.486"
      />
    </svg>
    <div class="fade-in"></div>
    <div class="fade-out"></div>
  </div>
  {text}
</div>

<style lang="postcss">
  .heart-beat {
    @apply relative flex items-center justify-center bg-transparent text-center text-information;
  }

  .heart-rate {
    @apply relative;

    width: 18px;
    height: 14px;
    margin: 0;
  }

  .heart-rate svg {
    display: block;
    width: 100%;
    height: 100%;
    animation: heartRate 1.8s var(--ease-standard, ease-in-out) infinite;
    animation-delay: var(--animation-delay, 0);
  }

  .fade-in,
  .fade-out {
    display: none;
  }

  @keyframes heartRate {
    0% {
      opacity: 0.45;
    }

    18% {
      opacity: 1;
    }

    36%,
    100% {
      opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .heart-rate svg {
      animation: none;
      opacity: 1;
    }
  }
</style>
