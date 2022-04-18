<script>
  import { onMount } from 'svelte';
  let text = '';

  // async function loop() {
  //   if (text.length === 3) text = '';
  //   text += '.';
  //   await new Promise((resolve) => setTimeout(resolve, 300));
  //   loop();
  // }

  // onMount(() => {
  //   loop();
  // });

  // Heart rate animation
  // https://codepen.io/jupa8712/pen/XmbyXE?js-preprocessor=none
</script>

<div class="LoadingIndicator">
  <div class="heart-rate">
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="37.5px"
      height="18px"
      viewBox="0 0 150 73"
      enable-background="new 0 0 150 73"
      xml:space="preserve"
    >
      <polyline
        fill="none"
        stroke="#b91c1c"
        stroke-width="5"
        stroke-miterlimit="10"
        points="0,45 200,45"
      />
    </svg>
    <div class="fade-in" />
    <div class="fade-out" />
  </div>
  {text}
</div>

<style>
  .LoadingIndicator {
    display: flex;
    background: #ffffff;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    /* top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    height: 100vh; */
    z-index: 1;
    font-size: 60px;
  }

  .heart-rate {
    width: 37.5px;
    height: 18px;
    position: relative;
    margin: 0 20px;
  }

  .fade-in {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    top: 0;
    right: 0;
    animation: heartRateIn 2.5s linear infinite;
  }

  .fade-out {
    position: absolute;
    width: 120%;
    height: 100%;
    top: 0;
    left: -120%;
    animation: heartRateOut 2.5s linear infinite;
    background: rgba(255, 255, 255, 1);
    background: -moz-linear-gradient(
      left,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background: -webkit-linear-gradient(
      left,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background: -o-linear-gradient(
      left,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background: -ms-linear-gradient(
      left,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 80%,
      rgba(255, 255, 255, 0) 100%
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
      left: -120%;
    }
    30% {
      left: -120%;
    }
    100% {
      left: 0;
    }
  }
</style>
