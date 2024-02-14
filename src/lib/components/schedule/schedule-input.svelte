<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let input: Payloads;

  console.log('INPUT: ', input);
</script>

<Panel>
  <h2 class="mb-4 text-2xl">{translate('schedules.schedule-input')}</h2>
  <div class="pr-2">
    <PayloadDecoder value={input} let:decodedValue key="payloads">
      <CodeBlock
        id="schedule-input"
        class="max-h-80 overflow-y-scroll overscroll-contain"
        content={decodedValue}
        copyable
      />
    </PayloadDecoder>
  </div>
</Panel>
