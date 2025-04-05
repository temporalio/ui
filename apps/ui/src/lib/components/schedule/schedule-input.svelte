<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import InputAndResults from '../workflow/input-and-results.svelte';

  export let input: Payloads;
</script>

<Panel>
  <InputAndResults
    title={translate('schedules.schedule-input')}
    content={stringifyWithBigInt(input)}
  />
</Panel>
