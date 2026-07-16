<script lang="ts">
  import PollersTable from '$lib/components/workers/pollers-table/pollers-table.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowPollersWithVersions } from '$lib/runes/workflow-versions.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import {
    fetchPaginatedWorkers,
    fetchWorkerCount,
  } from '$lib/services/worker-service';
  import { workerCountEnabled } from '$lib/stores/workers';

  import WorkersTable from './workers-table.svelte';

  interface Props {
    namespace: string;
    useFallback?: boolean;
    searchAttributes?: Record<string, string>;
    taskQueue: string;
  }

  let {
    namespace,
    useFallback = false,
    searchAttributes,
    taskQueue,
  }: Props = $props();

  const query = $derived(`TaskQueue="${taskQueue}"`);
  const onFetch = $derived(() => fetchPaginatedWorkers({ namespace, query }));

  let total = $state<number | undefined>();
  $effect(() => {
    if (useFallback || !$workerCountEnabled) {
      total = undefined;
      return;
    }
    const controller = new AbortController();
    fetchWorkerCount({ namespace, query }, (input, init) =>
      fetch(input, { ...init, signal: controller.signal }),
    ).then(({ count }) => {
      if (!controller.signal.aborted) total = count;
    });
    return () => controller.abort();
  });

  const View = {
    Workers: 'workers',
    Pollers: 'pollers',
  } as const;
  type View = (typeof View)[keyof typeof View];

  let selected = $state<View>(View.Workers);

  const pollersPromise = $derived(getPollers({ queue: taskQueue, namespace }));
</script>

{#snippet pollersTable(showHeader = false)}
  {#await pollersPromise}
    <Skeleton class="h-8 w-24 rounded-none" />
    <SkeletonTable rows={5} />
  {:then workers}
    {#if showHeader}
      {@const pollerCount =
        getWorkflowPollersWithVersions(searchAttributes, workers)?.pollers
          ?.length ?? 0}
      <h2 class="flex items-center gap-2" data-testid="workers">
        {translate('workers.workers')}
        <Badge type="count">{pollerCount}</Badge>
      </h2>
    {:else}
      <Alert
        intent="info"
        title={translate('workers.pollers-description')}
        class="max-w-screen-lg xl:w-2/3"
      />
    {/if}
    <PollersTable {workers} {searchAttributes} />
  {:catch error}
    <Alert
      intent="error"
      title={error?.message ?? translate('workers.error-message-fetching')}
      class="max-w-screen-lg xl:w-2/3"
    />
  {/await}
{/snippet}

{#if useFallback}
  {@render pollersTable(true)}
{:else}
  <ToggleButtons>
    <ToggleButton
      active={selected === View.Workers}
      on:click={() => (selected = View.Workers)}
    >
      {translate('workers.workers')}
    </ToggleButton>
    <ToggleButton
      class="!border-r"
      active={selected === View.Pollers}
      on:click={() => (selected = View.Pollers)}
    >
      {translate('workers.pollers')}
      {#await pollersPromise then workers}
        {@const pollerCount =
          getWorkflowPollersWithVersions(searchAttributes, workers)?.pollers
            ?.length ?? 0}
        <Badge type="count">
          {pollerCount}
        </Badge>
      {/await}
    </ToggleButton>
  </ToggleButtons>
  {#if selected === View.Workers}
    <WorkersTable {namespace} {onFetch} {total} />
  {:else}
    {@render pollersTable()}
  {/if}
{/if}
