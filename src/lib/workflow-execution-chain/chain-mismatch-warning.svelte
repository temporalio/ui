<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import { TextLink } from '$lib/io/text-link';
  import { routeForWorkflowExecutionChain } from '$lib/utilities/route-for';

  import type { ChainMismatch } from './types';

  interface Props {
    namespace: string;
    workflowId: string;
    firstRunId: string;
    mismatch: ChainMismatch;
  }

  let { namespace, workflowId, firstRunId, mismatch }: Props = $props();

  const workflowIdReused = $derived(mismatch.reason === 'workflowIdReused');

  const currentChainHref = $derived(
    routeForWorkflowExecutionChain({
      namespace,
      workflow: workflowId,
      firstRunId: mismatch.currentFirstRunId,
    }),
  );
</script>

<Alert
  intent="warning"
  title={workflowIdReused
    ? translate('workflows.chain-mismatch-reused-title')
    : translate('workflows.chain-mismatch-not-found-title')}
  data-testid="chain-mismatch-warning"
>
  <div class="flex flex-col gap-2 pt-1">
    <p>
      {workflowIdReused
        ? translate('workflows.chain-mismatch-reused-description')
        : translate('workflows.chain-mismatch-not-found-description', {
            firstRunId,
          })}
    </p>
    <TextLink href={currentChainHref}>
      {workflowIdReused
        ? translate('workflows.chain-mismatch-reused-link')
        : translate('workflows.chain-mismatch-not-found-link')}
    </TextLink>
  </div>
</Alert>
