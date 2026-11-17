<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft } from '$lib/io/icon';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';

  import type { ChainError } from './types';

  interface Props {
    namespace: string;
    workflowId: string;
    error: ChainError;
  }

  let { namespace, workflowId, error }: Props = $props();

  const title = $derived(
    'statusCode' in error && error.statusCode === 404
      ? translate('workflows.workflow-chain-404-title')
      : translate('workflows.workflow-chain-error-title'),
  );

  const workflowsHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `WorkflowId="${workflowId}"`,
    }) ?? '',
  );
</script>

<header class="mb-4 flex flex-col gap-1">
  <div class="mb-4 block">
    <Link
      href={workflowsHref}
      data-testid="back-to-workflows"
      LeadingIcon={IconChevronLeft}
    >
      {translate('workflows.back-to-workflows')}
    </Link>
  </div>
</header>
<div class="text-center align-middle" data-testid="workflow-chain-error">
  {#if 'statusCode' in error}
    <h1 class="leading-0 text-[12rem] font-semibold">
      {error.statusCode}
    </h1>
    <p class="-mt-12 text-lg">{title}</p>
    <p class="text-2xl font-bold text-danger">
      {error.statusText ?? ''}
    </p>
  {:else}
    <h1 class="text-lg">{title}</h1>
    <p class="text-2xl font-bold text-danger">
      {error.message}
    </p>
  {/if}
</div>
