<script lang="ts">
  import EmptyState from '$lib/components/empty-state.svelte';
</script>

<article class="row">
  <div class="cell">
    <EmptyState
      title="No Events Match"
      content="There are no events that match your filters. Adjust your filters to see your events."
    />
  </div>
</article>

<style lang="postcss">
  .row {
    @apply absolute left-0 right-0 p-2 text-sm text-center border-2;
  }
</style>
