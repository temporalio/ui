<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { PageServerData } from './$types';

  export let data: PageServerData;
</script>

<div class="flex gap-2">
  <div class="w-1/2">
    <h6>Workflows loaded with<br /><code>buf</code></h6>
    <CodeBlock content={data.workflowsBuf} />
  </div>
  <div class="w-1/2">
    <h6>Workflows loaded with<br /><code>trpc</code></h6>
    <CodeBlock content={data.workflowsTrpc} />
  </div>
</div>
