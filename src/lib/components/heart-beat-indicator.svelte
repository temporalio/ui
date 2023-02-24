<script lang="ts">
  // Heart rate animation
  // https://codepen.io/jupa8712/pen/XmbyXE?js-preprocessor=none

  let text = '';
  export let delay: number = 0;

  $: cssVarStyles = `--animation-delay:${delay}ms;`;
</script>

<div class="heart-beat" style={cssVarStyles}>
  <div class="heart-rate">
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="30px"
      height="18px"
      viewBox="0 0 150 73"
      enable-background="new 0 0 150 73"
      xml:space="preserve"
    >
      <polyline
        fill="none"
        stroke="#1D4ED8"
        stroke-width="3"
        stroke-miterlimit="10"
        points="0,45.486 18.514,45.486 24.595,33.324 32.676,45.486 37.771,45.486 42.838,55.622 51.959,18 56.067,45 60.067,60.729 63.122,45.486 77.297,45.486 83.379,41.419 90.473,45.486 100,45.486"
      />
    </svg>
    <div class="fade-in" />
    <div class="fade-out" />
  </div>
  {text}
</div>

<style lang="postcss">
  .heart-beat {
    @apply relative flex items-center justify-center bg-blue-100 text-center;
  }

  .heart-rate {
    @apply relative;

    width: 20px;
    height: 18px;
    margin: 0;
  }

  .fade-in {
    @apply absolute top-0 right-0 h-full w-full bg-blue-100;

    animation: heartRateIn 2s linear infinite;
    animation-delay: var(--animation-delay, 0);
  }

  .fade-out {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    animation: heartRateOut 2s linear infinite;
    animation-delay: var(--animation-delay, 0);
    background: rgb(219 234 254);
    background:
      linear-gradient(
        to left,
        rgb(219 234 254) 0%,
        rgb(219 234 254) 50%,
        rgb(255 255 255 / 0%) 100%
      );
    background:
      linear-gradient(
        to left,
        rgb(219 234 254) 0%,
        rgb(219 234 254) 50%,
        rgb(255 255 255 / 0%) 100%
      );
    background:
      linear-gradient(
        to left,
        rgb(219 234 254) 0%,
        rgb(219 234 254) 50%,
        rgb(255 255 255 / 0%) 100%
      );
    background:
      linear-gradient(
        to left,
        rgb(219 234 254) 0%,
        rgb(219 234 254) 50%,
        rgb(255 255 255 / 0%) 100%
      );
    background:
      linear-gradient(
        to right,
        rgb(219 234 254) 0%,
        rgb(219 234 254) 80%,
        rgb(255 255 255 / 0%) 100%
      );
  }

  @keyframes heartRateIn {
    0% {
      width: 100%;
    }

    50% {
      width: 0;
    }

    100% {
      width: 0;
    }
  }

  @keyframes heartRateOut {
    0% {
      width: 0%;
    }

    100% {
      width: 100%;
    }
  }
</style>
