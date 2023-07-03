<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import EmptyState from './empty-state.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <EmptyState title="No Resources Found" />
</Hst.Story>
