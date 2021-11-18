<script lang="ts">
  export let count = 1;

  const elements = [];
  for (let i = 0; i < count; i++) {
    elements.push(i);
  }
</script>

{#each elements as _}
  <span> &zwnj; </span>
{/each}

<style lang="postcss">
  span {
    background-color: #eee;
    background-image: linear-gradient(90deg, #eee, #f5f5f5, #eee);
    background-size: 200px 100%;
    background-repeat: no-repeat;
    border-radius: 4px;
    display: inline-block;
    line-height: 1;
    width: 100%;
    animation: loader 1.2s ease-in-out infinite;
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
