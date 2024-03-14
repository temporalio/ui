<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import { getSinglePayload } from '$lib/utilities/encode-payload';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let input: string;
  export let payloads: Payloads;

  const handleInputChange = (event: CustomEvent<string>) => {
    input = event.detail;
  };
</script>

<div class="flex flex-col gap-4">
  <label for="schedule-input">{translate('workflows.input')}</label>
  <PayloadDecoder value={payloads} let:decodedValue key="payloads">
    {#key decodedValue}
      <CodeBlock
        id="schedule-input"
        class="max-h-80 overflow-y-scroll overscroll-contain"
        content={getSinglePayload(decodedValue)}
        on:change={handleInputChange}
        editable
        copyable={false}
      />
    {/key}
  </PayloadDecoder>
  <span class="font-secondary text-xs font-light italic">
    {translate('workflows.signal-payload-input-label-hint')}
  </span>
</div>
