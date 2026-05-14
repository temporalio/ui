<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Failure } from '$lib/types';

  interface Props {
    failure: Failure | undefined;
  }

  let { failure }: Props = $props();
</script>

{#if failure}
  <Accordion class="border-warning bg-warning" open title="Last Failure">
    <CodeBlock maxHeight={320} content={JSON.stringify(failure, null, 2)} />
  </Accordion>
{/if}
