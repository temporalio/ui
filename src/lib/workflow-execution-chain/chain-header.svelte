<script lang="ts">
  import {
    DetailList,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
    DetailListValue,
  } from '$lib/components/detail-list';
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { Breadcrumbs } from '$lib/io/breadcrumbs';
  import { IconLink } from '$lib/io/icon';
  import { createWallClock } from '$lib/runes/wall-clock.svelte';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { formatDistance } from '$lib/utilities/format-time';
  import {
    routeForWorkflow,
    routeForWorkflowExecutionChain,
    routeForWorkflows,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';
  import { getWorkflowVirtualTime } from '$lib/utilities/workflow-time-skipping';

  import type { WorkflowExecutionChain } from './workflow-execution-chain.svelte';

  interface Props {
    chain: WorkflowExecutionChain;
  }

  let { chain }: Props = $props();

  const { namespace, workflowId, firstRunId } = $derived(chain.identity);

  const workflowsHref = $derived(
    `${routeForWorkflows({ namespace })}?${$workflowsSearchParams}`,
  );
  const workflowIdHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `WorkflowId="${workflowId}"`,
    }) ?? '',
  );

  const breadcrumbs = $derived([
    { label: translate('workflows.all-workflows'), href: workflowsHref },
    { label: workflowId, href: workflowIdHref },
    {
      label: translate('workflows.chain'),
      href: routeForWorkflowExecutionChain({
        namespace,
        workflow: workflowId,
        firstRunId,
      }),
    },
  ]);

  const latestRun = $derived(
    chain.runs.find((run) => run.runId === chain.latestRunId),
  );
  const firstRun = $derived(chain.firstRun);
  const chainStart = $derived(
    firstRun.status === 'found' ? firstRun.workflow.startTime : undefined,
  );
  const chainEnd = $derived(chain.closeTime);

  const readWallClock = createWallClock();

  const durationEnd = $derived(
    chainEnd ?? getWorkflowVirtualTime(latestRun?.workflow) ?? readWallClock(),
  );

  const chainDuration = $derived(
    chainStart ? formatDistance({ start: chainStart, end: durationEnd }) : '',
  );

  const sdkInfo = $derived.by(() => {
    for (const run of [...chain.runs].reverse()) {
      const sdkAndVersion = chain.sdkInfoOf(run.runId);
      if (sdkAndVersion?.sdk && sdkAndVersion.version) {
        return sdkAndVersion;
      }
    }
    return null;
  });

  const sdkLoading = $derived.by(() => {
    if (sdkInfo) {
      return false;
    }
    if (!chain.latestRunId) {
      return true;
    }
    const { status } = chain.cardLoadOf(chain.latestRunId);
    return status === 'queued' || status === 'loading';
  });
</script>

{#snippet skeleton()}
  <DetailListValue>
    <Skeleton class="my-1 h-3 w-40" />
  </DetailListValue>
{/snippet}

<header class="flex flex-col gap-4" data-testid="chain-header">
  <Breadcrumbs items={breadcrumbs} />

  <div class="flex flex-wrap items-center gap-3">
    <Badge text={translate('workflows.chain-of-executions')} Icon={IconLink} />
    <h1
      data-testid="workflow-id-heading"
      class="overflow-hidden max-sm:text-xl sm:max-md:text-2xl"
    >
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={workflowId}
        clickAllToCopy
        container-class="w-full"
        class="overflow-hidden text-ellipsis text-left"
      />
    </h1>
  </div>

  {#if sdkInfo || sdkLoading}
    <DetailList
      aria-label={translate('workflows.sdk')}
      rowCount={1}
      class="grid-flow-row"
    >
      <DetailListLabel>{translate('workflows.sdk')}</DetailListLabel>
      {#if sdkInfo}
        <DetailListValue>
          <SdkLogo sdk={sdkInfo.sdk} version={sdkInfo.version} />
        </DetailListValue>
      {:else}
        {@render skeleton()}
      {/if}
    </DetailList>
  {/if}

  <DetailList
    aria-label={translate('workflows.chain-of-executions')}
    rowCount={5}
    class="grid-flow-row"
  >
    <DetailListLabel>{translate('workflows.chain-status')}</DetailListLabel>
    {#if chain.status === 'loading'}
      {@render skeleton()}
    {:else}
      <DetailListTextValue
        text={chain.status === 'closed'
          ? translate('workflows.chain-closed-status')
          : translate('workflows.chain-open')}
      />
    {/if}

    <DetailListLabel>{translate('workflows.chain-start')}</DetailListLabel>
    {#if firstRun.status === 'loading'}
      {@render skeleton()}
    {:else if chainStart}
      <DetailListTimestampValue timestamp={chainStart} />
    {:else}
      <DetailListTextValue
        text={firstRun.status === 'notFound'
          ? translate('workflows.chain-start-past-retention')
          : translate('common.unknown')}
      />
    {/if}

    <DetailListLabel>{translate('workflows.chain-duration')}</DetailListLabel>
    {#if firstRun.status === 'loading' || (chainStart && !latestRun)}
      {@render skeleton()}
    {:else}
      <DetailListTextValue
        text={chainDuration || translate('common.unknown')}
      />
    {/if}

    <DetailListLabel>{translate('workflows.first-run')}</DetailListLabel>
    {#if firstRun.status === 'found'}
      <DetailListLinkValue
        text={firstRunId}
        href={routeForWorkflow({
          namespace,
          workflow: workflowId,
          run: firstRunId,
        })}
      />
    {:else}
      <DetailListTextValue
        text={firstRun.status === 'notFound'
          ? translate('workflows.run-past-retention', { runId: firstRunId })
          : firstRunId}
      />
    {/if}

    <DetailListLabel>{translate('workflows.latest-run')}</DetailListLabel>
    {#if chain.latestRunId}
      <DetailListLinkValue
        text={chain.latestRunId}
        href={routeForWorkflow({
          namespace,
          workflow: workflowId,
          run: chain.latestRunId,
        })}
      />
    {:else}
      {@render skeleton()}
    {/if}
  </DetailList>
</header>
