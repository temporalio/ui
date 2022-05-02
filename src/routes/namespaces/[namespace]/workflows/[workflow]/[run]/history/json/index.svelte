<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';
  import { events } from '$lib/stores/events';
</script>

<CodeBlock content={$events} data-cy="event-history-json" />
