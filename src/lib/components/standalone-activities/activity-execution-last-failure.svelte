<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Failure } from '$lib/types';

  interface Props {
    failure: Failure | undefined;
  }

  let { failure }: Props = $props();
</script>

{#if failure}
  <Card
    class="flex flex-col gap-4 py-5 {failure
      ? 'border-warning bg-warning'
      : ''}"
    title="Last Failure"
  >
    <h5 class="text-xs font-semibold uppercase tracking-wide">Last Failure</h5>
    <CodeBlock content={JSON.stringify(failure, null, 2)} />
  </Card>
{/if}
