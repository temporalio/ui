<div
  class="w-full h-5 
      bg-gradient-to-r
      from-gray-100
      via-gray-200
      to-gray-300
      rounded-full
      background-animate 
      {$$props.class}"
/>

<style lang="postcss">
  .background-animate {
    background-size: 400%;

    -webkit-animation: AnimationName 3s ease infinite;
    -moz-animation: AnimationName 3s ease infinite;
    animation: AnimationName 3s ease infinite;
  }

  @keyframes AnimationName {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
</style>
