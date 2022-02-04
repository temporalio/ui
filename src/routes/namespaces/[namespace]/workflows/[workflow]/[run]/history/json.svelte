<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  let events = getAppContext('events');
</script>

{#await events then content}
  <CodeBlock {content} />
{/await}
