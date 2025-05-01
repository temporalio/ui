<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import InputAndResultsPayload from '$lib/components/workflow/input-and-results-payload.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  export let input: Payloads;
</script>

<Panel>
  <InputAndResultsPayload
    title={translate('schedules.schedule-input')}
    content={stringifyWithBigInt(input)}
    isRunning={false}
  />
</Panel>
