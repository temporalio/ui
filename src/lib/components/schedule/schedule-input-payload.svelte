<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import { getSinglePayload } from '$lib/utilities/encode-payload';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let input: string;
  export let payloads: Payloads;
  export let error = false;

  const handleInputChange = (event: CustomEvent<string>) => {
    input = event.detail;
  };

  const setInitialInput = (decodedValue: string): void => {
    input = getSinglePayload(decodedValue);
  };
</script>

<div class="flex flex-col gap-1">
  <Label for="schedule-input" label={translate('workflows.input')} />
  <PayloadDecoder
    value={payloads}
    let:decodedValue
    key="payloads"
    onDecode={setInitialInput}
  >
    {#key decodedValue}
      <CodeBlock
        id="schedule-input"
        maxHeight={320}
        content={getSinglePayload(decodedValue)}
        on:change={handleInputChange}
        editable
        copyable={false}
      />
    {/key}
  </PayloadDecoder>
  <span class="text-xs font-light italic" class:text-red-700={error}>
    {translate('workflows.signal-payload-input-label-hint')}
  </span>
</div>
