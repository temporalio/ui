<script lang="ts">
  export let currentPage: number;
  export let maximumPage: number;

  const increment = () => currentPage++;
  const decrement = () => currentPage++;

  $: isFirstPage = currentPage <= 0;
  $: isLastPage = currentPage >= maximumPage - 1;
</script>

<section class="bg-gray-100 p-4 flex gap-4">
  <button on:click={decrement} disabled={isFirstPage}> Previous </button>
  {#if maximumPage > 0}
    <p>Page {currentPage + 1} of {maximumPage}</p>
  {:else}
    <p>No Workflow Executions</p>
  {/if}
  <button on:click={increment} disabled={isLastPage}> Next </button>
</section>

<style lang="postcss">
  button {
    @apply rounded-lg border-purple-600 border-2 bg-white text-purple-600 px-2 text-sm;
  }

  button:disabled {
    @apply text-purple-400 border-purple-400;
  }
</style>
