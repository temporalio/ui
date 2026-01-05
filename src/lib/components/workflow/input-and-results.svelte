<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import InputAndResultsPayload from './input-and-results-payload.svelte';

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);
</script>

<div
  class="flex flex-1 flex-col gap-4 lg:flex-row"
  data-testid="input-and-result"
>
  <div class="w-full lg:w-1/2">
    <InputAndResultsPayload
      title={translate('workflows.input')}
      content={workflowEvents.input}
    />
  </div>
  <div class="w-full lg:w-1/2">
    <InputAndResultsPayload
      title={translate('workflows.result')}
      content={workflowEvents.results}
    />
  </div>
</div>
