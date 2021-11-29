<script lang="ts">
  import Button from '$lib/components/button/main-button.svelte';

  export let currentPage: number;
  export let maximumPage: number;

  const increment = () => currentPage++;
  const decrement = () => currentPage--;

  $: isFirstPage = currentPage <= 0;
  $: isLastPage = currentPage >= maximumPage - 1;
</script>

<section class="bg-gray-100 p-4 flex gap-20 justify-between">
  {#if maximumPage > 0}
    <section class="flex gap-4 items-center">
      <Button
        variant="secondary"
        size="small"
        on:click={decrement}
        disabled={isFirstPage}>Previous</Button
      >
      <p>Page {currentPage + 1} of {maximumPage}</p>
      <Button
        variant="secondary"
        size="small"
        on:click={increment}
        disabled={isLastPage}>Next</Button
      >
    </section>
  {:else}
    <section class="flex gap-4 items-center">
      <p>No Workflow Executions</p>
    </section>
  {/if}
</section>
