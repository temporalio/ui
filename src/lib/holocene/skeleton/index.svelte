<div
  class="background-animate 
      h-12
      w-full
      rounded-full
      bg-gradient-to-r
      from-gray-100
      via-gray-200
      to-gray-300 
      {$$props.class}"
/>

<style lang="postcss">
  .background-animate {
    background-size: 400%;

    -webkit-animation: Loading 3s ease infinite;
    -moz-animation: Loading 3s ease infinite;
    animation: Loading 3s ease infinite;
  }

  @keyframes Loading {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
</style>
