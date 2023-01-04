<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';

  import { importEvents } from '$lib/stores/import-events';
</script>

<CodeBlock content={$importEvents} data-cy="event-history-json" />
