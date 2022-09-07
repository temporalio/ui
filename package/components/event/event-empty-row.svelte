<script>import EmptyState from '../../holocene/empty-state.svelte';
</script>

<article class="row">
  <div class="cell">
    <EmptyState
      title="No Events Match"
      content="There are no events that match your filters or selected view. Adjust your filters or view to see your events."
    />
  </div>
</article>

<style>
  .row {
    position: absolute;
    left: 0px;
    right: 0px;
    border-width: 2px;
    padding: 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.25rem
}</style>
