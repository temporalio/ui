<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { translate } from '$lib/i18n/translate';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import {
    type GetPollersResponse,
    type TaskQueueCompatibility,
    getWorkerTaskReachability,
    getBuildIdReachability,
  } from '$lib/services/pollers-service';
  import {
    getCurrentCompatibilityDefaultVersion,
    getCurrentPollerBuildId,
    getDefaultVersionForSet,
    getNonDefaultVersionsForSet,
    getOrderedVersionSets,
  } from '$lib/utilities/task-queue-compatibility';
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import { page } from '$app/stores';

  export let taskQueue: string;
  export let workers: GetPollersResponse;
  export let compatibility: TaskQueueCompatibility | undefined;

  let namespace = $page.params.namespace;

  $: versionSets = getOrderedVersionSets(compatibility);
  $: defaultVersion = getCurrentCompatibilityDefaultVersion(compatibility);

  $: buildIds = workers?.pollers.map(getCurrentPollerBuildId);

  let workerTaskReachability;

  async function fetchWorkerTaskReachability(
    namespace: string,
    buildIds: string[],
  ) {
    workerTaskReachability = await getWorkerTaskReachability({
      namespace,
      buildIds,
      taskQueue,
    });
  }

  $: if (compatibility) fetchWorkerTaskReachability(namespace, buildIds);
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-lg font-medium" data-testid="task-queue-name">
    {translate('task-queue')}:
    <span class="select-all font-normal">{taskQueue}</span>
  </h2>

  {#if versionSets?.length}
    <h2 class="text-base font-medium" data-testid="version-sets">
      {translate('workers', 'version-sets')}
    </h2>
    <Table class="mb-6 w-full min-w-[600px] table-fixed">
      <TableHeaderRow slot="headers">
        <th class="w-3/12">{translate('workers', 'default')}</th>
        <th class="w-9/12">{translate('workers', 'compatible-build-ids')}</th>
      </TableHeaderRow>
      {#each versionSets as set, index (index)}
        <TableRow data-testid="version-row">
          <td class="text-left" data-testid="version-default">
            <CompatibilityBadge
              defaultVersion
              active={index === 0}
              buildId={getDefaultVersionForSet(set.buildIds)}
            >
              <svelte:fragment slot="overall-default-worker">
                {#if index === 0}{translate('workers', 'overall')}{/if}
              </svelte:fragment>
              <svelte:fragment slot="default-worker">
                {translate('workers', 'default')}
              </svelte:fragment>
            </CompatibilityBadge>
          </td>
          <td class="text-left" data-testid="version-compatible-builds">
            <div class="flex gap-2 noto flex-wrap">
              {#each getNonDefaultVersionsForSet(set.buildIds) as buildId}
                <CompatibilityBadge active={false} {buildId}>
                  <svelte:fragment slot="default-worker">
                    {translate('workers', 'default')}
                  </svelte:fragment>
                </CompatibilityBadge>
              {/each}
            </div>
          </td>
        </TableRow>
      {:else}
        <tr class="w-full">
          <td colspan="6">
            <EmptyState title={translate('workers', 'no-version-sets-found')} />
          </td>
        </tr>
      {/each}
    </Table>
  {/if}
  <h2 class="text-base font-medium" data-testid="workers">
    {translate('workers', 'workers')}
  </h2>
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <TableHeaderRow slot="headers">
      <th class={versionSets?.length ? 'w-3/12' : 'w-6/12'}
        >{translate('id')}</th
      >
      {#if versionSets?.length}
        <th class="w-3/12">{translate('workers', 'version')}</th>
        <th class="w-2/12">{translate('workers', 'retirability')}</th>
      {/if}
      <th class="w-2/12">{translate('workflows', 'last-accessed')}</th>
      <th class="w-2/12">
        <p class="text-center">
          {translate('workflows', 'workflow-task-handler')}
        </p>
      </th>
      <th class="w-2/12 text-center">
        <p class="text-center">{translate('workflows', 'activity-handler')}</p>
      </th>
    </TableHeaderRow>
    {#each workers?.pollers as poller (poller.identity)}
      {@const buildId = getCurrentPollerBuildId(poller)}
      {@const reachability = getBuildIdReachability(
        workerTaskReachability,
        taskQueue,
        buildId,
      )}
      <TableRow data-testid="worker-row">
        <td class="text-left" data-testid="worker-identity">
          <p class="select-all">{poller.identity}</p>
        </td>
        {#if versionSets?.length}
          <td class="text-left" data-testid="worker-identity">
            <p class="select-all">
              <CompatibilityBadge
                defaultVersion={buildId === defaultVersion}
                active={buildId === defaultVersion}
                {buildId}
              >
                <svelte:fragment slot="overall-default-worker">
                  {#if buildId === defaultVersion}{translate(
                      'workers',
                      'overall',
                    )}{/if}
                </svelte:fragment>
                <svelte:fragment slot="default-worker">
                  {translate('workers', 'default')}
                </svelte:fragment>
              </CompatibilityBadge>
            </p>
          </td>
          <td class="text-left" data-testid="worker-last-access-time">
            <p>
              <span class:reachability={!!reachability}>{reachability}</span>
            </p>
          </td>
        {/if}
        <td class="text-left" data-testid="worker-last-access-time">
          <p class="select-all">
            {formatDate(poller.lastAccessTime, $timeFormat)}
          </p>
        </td>
        <td data-testid="workflow-poller">
          {#if poller.taskQueueTypes.includes('WORKFLOW')}
            <Icon
              name="checkmark"
              class="m-auto text-blue-700"
              title={translate('yes')}
            />
          {:else}
            <Icon
              name="close"
              class="m-auto text-primary"
              title={translate('no')}
            />
          {/if}
        </td>
        <td data-testid="activity-poller">
          {#if poller.taskQueueTypes.includes('ACTIVITY')}
            <Icon
              name="checkmark"
              class="m-auto text-blue-700"
              title={translate('yes')}
            />
          {:else}
            <Icon
              name="close"
              class="m-auto text-primary"
              title={translate('no')}
            />
          {/if}
        </td>
      </TableRow>
    {:else}
      <tr class="w-full">
        <td colspan={versionSets?.length ? 8 : 6}>
          <EmptyState title={translate('workflows', 'workers-empty-state')} />
        </td>
      </tr>
    {/each}
  </Table>
</section>

<style lang="postcss">
  .reachability {
    @apply bg-gray-200 px-2 py-1 rounded-sm;
  }
</style>
