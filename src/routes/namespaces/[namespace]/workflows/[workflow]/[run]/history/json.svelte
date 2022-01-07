<script lang="ts">
  import { getContext } from 'svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  let events = getContext<EventualHistoryEvents>('events');
</script>

{#await events then content}
  <CodeBlock {content} />
{/await}
