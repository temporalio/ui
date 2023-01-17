<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';

  export let loading = false;
</script>

<article class="row">
  <div class="cell">
    {#if loading}
      <Loading />
    {:else}
      <EmptyState
        title="No Events Match"
        content="There are no events that match your filters or selected view. Adjust your filters or view to see your events."
      />
    {/if}
  </div>
</article>

<style lang="postcss">
  .row {
    @apply absolute left-0 right-0 border-2 p-2 text-center text-sm;
  }
</style>
