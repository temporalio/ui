<script lang="ts">
  import EmptyState from './empty-state.svelte';

  export let Hst;
</script>

<Hst.Story>
  <EmptyState title="No Resources Found" />
</Hst.Story>
