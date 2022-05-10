<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';
  import { getContext } from 'svelte';

  const { events } = getContext('eventHistory');
</script>

<CodeBlock content={events} data-cy="event-history-json" />
