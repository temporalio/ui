<script lang="ts">
  import type { Hst } from '@histoire/plugin-svelte';
  import EmptyState from './empty-state.svelte';

  export let Hst: Hst;
</script>

<Hst.Story>
  <EmptyState title="No Resources Found" />
</Hst.Story>
