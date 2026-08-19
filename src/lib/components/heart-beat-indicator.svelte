<script lang="ts">
  let { delay = 0 }: { delay?: number } = $props();

  const cssVarStyles = $derived(`--animation-delay:${delay}ms;`);
</script>

<div class="heart-beat" style={cssVarStyles} aria-hidden="true">
  <svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="30px"
    height="18px"
    viewBox="0 0 150 73"
    xml:space="preserve"
    aria-hidden="true"
    focusable="false"
  >
    <polyline
      class="heart-rate-line"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-miterlimit="10"
      pathLength="1"
      points="0,45.486 18.514,45.486 24.595,33.324 32.676,45.486 37.771,45.486 42.838,55.622 51.959,18 56.067,45 60.067,60.729 63.122,45.486 77.297,45.486 83.379,41.419 90.473,45.486 100,45.486"
    />
  </svg>
</div>

<style lang="postcss">
  .heart-beat {
    @apply relative flex w-5 items-center justify-center text-center;
  }

  .heart-rate-line {
    stroke-dasharray: 1 1;
    stroke-dashoffset: 1;
    animation: heartRate 2s linear infinite;
    animation-delay: var(--animation-delay, 0ms);
    will-change: stroke-dashoffset;
  }

  @keyframes heartRate {
    0% {
      stroke-dashoffset: 1;
    }

    50% {
      stroke-dashoffset: 0;
    }

    100% {
      stroke-dashoffset: -1;
    }
  }
</style>
