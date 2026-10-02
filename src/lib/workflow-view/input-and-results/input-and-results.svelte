<script lang="ts" module>
  import type { QualifiedHistoryEvent } from '../data/history-events/types';
  import type { ExecutionIdentity } from '../data/identity-keys';

  /** The parent supplies events, identity, and running/paused status for the selected execution. */
  export type Props = {
    /** Already scoped to identity by the parent; this component does not filter executions. */
    events: readonly QualifiedHistoryEvent[];
    identity: ExecutionIdentity;
    isPending: boolean;
  };
</script>

<script lang="ts">
  import InputAndResultsPayload from '$lib/components/workflow/input-and-results-payload.svelte';
  import { translate } from '$lib/i18n/translate';

  import { getInputAndResults } from './get-input-and-results';
  import { getExecutionKey } from '../data/identity-keys';

  let { events, identity, isPending }: Props = $props();

  const workflowEvents = $derived(getInputAndResults(events));
  const pending = $derived(isPending && !workflowEvents.hasCompletion);
</script>

{#key getExecutionKey(identity)}
  <div class="flex flex-col gap-4 lg:flex-row" data-testid="input-and-result">
    <InputAndResultsPayload
      title={translate('workflows.input')}
      content={workflowEvents.input ?? undefined}
      isPending={pending}
      payloadDownloadFilenameData={{
        workflowId: identity.workflowId,
        runId: identity.runId,
        type: 'input',
      }}
    />
    <InputAndResultsPayload
      title={translate('workflows.result')}
      content={workflowEvents.results ?? undefined}
      isPending={pending}
      payloadDownloadFilenameData={{
        workflowId: identity.workflowId,
        runId: identity.runId,
        type: 'result',
      }}
    />
  </div>
{/key}
