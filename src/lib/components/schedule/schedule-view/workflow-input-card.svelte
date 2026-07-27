<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import InputAndResultsPayload from '$lib/components/workflow/input-and-results-payload.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';

  interface Props {
    input?: Payloads;
    scheduleId: string;
  }

  let { input, scheduleId }: Props = $props();
</script>

<Panel class="flex w-full flex-col gap-4 border-subtle p-6" as="section">
  <InputAndResultsPayload
    title={translate('schedules.workflow-input')}
    content={input}
    payloadDownloadFilenameData={{ scheduleId, type: 'input' }}
  >
    {#snippet titleSnippet()}
      <h2 class="mb-[0.75rem] text-2xl font-medium">
        {translate('schedules.workflow-input')}
      </h2>
    {/snippet}
  </InputAndResultsPayload>
</Panel>
