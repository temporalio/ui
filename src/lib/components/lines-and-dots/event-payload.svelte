<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
  import type { PotentiallyDecodable } from '$lib/utilities/decode-payload';
  import { format } from '$lib/utilities/format-camel-case';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let key: string = '';
  export let value: PotentiallyDecodable | EventAttribute | WorkflowEvent;
</script>

<div
  class="flex w-full flex-wrap items-center justify-between gap-1 pr-1 xl:flex-nowrap xl:gap-4"
>
  {#if key}
    <p class="min-w-fit text-sm">
      {format(key)}
    </p>
  {/if}
  <PayloadDecoder {value} key="payloads" let:decodedValue>
    <CodeBlock content={decodedValue} inline copyable={false} />
  </PayloadDecoder>
</div>
