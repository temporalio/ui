<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import InputAndResultsPayload from '$lib/components/workflow/input-and-results-payload.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';

  export let input: Payloads;
</script>

<Panel>
  <InputAndResultsPayload
    title={translate('schedules.schedule-input')}
    content={input}
  >
    {#snippet titleSnippet()}
      <h2>
        {translate('schedules.schedule-input')}
      </h2>
    {/snippet}
  </InputAndResultsPayload>
</Panel>
