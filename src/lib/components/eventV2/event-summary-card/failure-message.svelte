<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { getStackTrace } from '$lib/utilities/get-single-attribute-for-event';
  import type { ProtoFailure } from '$types';

  export let failure: ProtoFailure;
  export let title = 'Failure';
  export let intent: 'warning' | 'error' | 'success' | 'info' = 'error';

  let stackTrace = getStackTrace(failure);
</script>

<Alert
  icon="warning"
  {intent}
  {title}
  role="status"
  regular={false}
  class="w-full"
>
  <div>
    {failure?.cause?.cause?.message ??
      failure?.cause?.message ??
      failure?.message}
  </div>
  {#if stackTrace}
    <div class="">
      <p class="text-sm">Stack trace</p>
      <CodeBlock
        content={stackTrace}
        class="mb-2 h-full lg:pr-2"
        language="text"
      />
    </div>
  {/if}
</Alert>
