<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import { TextLink } from '$lib/io/text-link';
  import { routeForWorkflowExecutionChain } from '$lib/utilities/route-for';

  import type { OlderChain } from './types';

  interface Props {
    namespace: string;
    workflowId: string;
    firstRunId: string;
    olderChain: OlderChain;
  }

  let { namespace, workflowId, firstRunId, olderChain }: Props = $props();

  const reused = $derived(olderChain.reason === 'reused');

  const currentChainHref = $derived(
    routeForWorkflowExecutionChain({
      namespace,
      workflow: workflowId,
      firstRunId: olderChain.currentFirstRunId,
    }),
  );
</script>

<Alert
  intent="warning"
  title={reused
    ? translate('workflows.older-chain-title')
    : translate('workflows.chain-not-visible-title')}
  data-testid="older-chain-warning"
>
  <div class="flex flex-col gap-2 pt-1">
    <p>
      {reused
        ? translate('workflows.older-chain-description')
        : translate('workflows.chain-not-visible-description', { firstRunId })}
    </p>
    <TextLink href={currentChainHref}>
      {reused
        ? translate('workflows.view-newer-chain')
        : translate('workflows.view-current-chain')}
    </TextLink>
  </div>
</Alert>
