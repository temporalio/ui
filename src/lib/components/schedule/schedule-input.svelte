<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import InputAndResultsPayload from '$lib/components/workflow/input-and-results-payload.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';

  let { input, scheduleId }: { input: Payloads; scheduleId: string } = $props();
</script>

<Panel>
  <InputAndResultsPayload
    title={translate('schedules.schedule-input')}
    content={input}
    payloadDownloadFilenameData={{ scheduleId, type: 'input' }}
  >
    {#snippet titleSnippet()}
      <h2>
        {translate('schedules.schedule-input')}
      </h2>
    {/snippet}
  </InputAndResultsPayload>
</Panel>
