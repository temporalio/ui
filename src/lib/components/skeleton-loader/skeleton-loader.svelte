<script lang="ts">
  export let count = 1;
  export let radius = 'normal';

  const elements = [];
  for (let i = 0; i < count; i++) {
    elements.push(i);
  }
</script>

{#each elements as _}
  <span class={radius}> &zwnj; </span>
{/each}

<style lang="postcss">
  span {
    background-color: #e1e0e7;
    background-image: linear-gradient(90deg, #eee, #e1e0e7, #eee);
    background-size: 200px 100%;
    background-repeat: no-repeat;
    display: inline-block;
    line-height: 1;
    width: 100%;
    height: 100%;
    animation: loader 1.4s ease-in-out infinite;
  }

  .normal {
    border-radius: 15px;
  }

  .circle {
    border-radius: 20px;
  }

  @keyframes loader {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
</style>
