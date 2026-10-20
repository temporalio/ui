<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { TaskQueueInfo, VersionTaskQueue } from '$lib/types/deployments';
  import { formatDurationMs } from '$lib/utilities/compute-regions';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { durationToMs } from '$lib/utilities/version-details';

  interface Props {
    namespace: string;
    /** From the details request: names and types, no stats. */
    taskQueues: readonly TaskQueueInfo[];
    /**
     * From a second request that asks for stats. Undefined while it loads,
     * and null when it failed.
     */
    stats: readonly VersionTaskQueue[] | undefined | null;
  }

  let { namespace, taskQueues, stats }: Props = $props();

  const statsFor = (queue: TaskQueueInfo) =>
    stats?.find(({ name, type }) => name === queue.name && type === queue.type)
      ?.stats;

  /** "TASK_QUEUE_TYPE_ACTIVITY" -> "Activity". */
  const typeLabel = (type: string): string => {
    const word = type.replace(/^TASK_QUEUE_TYPE_/, '').toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const count = (value: string | number | undefined): string =>
    value === undefined ? '0' : Number(value).toLocaleString();

  const age = (value: string | undefined): string => {
    const ms = durationToMs(value);
    return ms ? formatDurationMs(ms) : '—';
  };
</script>

<section
  aria-labelledby="version-details-task-queues"
  aria-busy={stats === undefined && taskQueues.length > 0}
  class="flex flex-col gap-3"
>
  <h3 id="version-details-task-queues" class="text-sm font-medium">
    {translate('deployments.details-task-queues')}
    {#if taskQueues.length}
      <span class="font-normal text-secondary">({taskQueues.length})</span>
    {/if}
  </h3>
  {#if !taskQueues.length}
    <p class="text-sm text-secondary">
      {translate('deployments.details-no-task-queues')}
    </p>
  {:else}
    <table class="w-full table-fixed text-sm tabular-nums">
      <thead>
        <tr class="border-b border-primary text-left text-secondary">
          <th class="py-1.5 pr-2 font-normal">
            {translate('deployments.details-task-queue-name')}
          </th>
          <th class="w-24 py-1.5 pr-2 font-normal">
            {translate('deployments.details-task-queue-type')}
          </th>
          <th class="w-20 py-1.5 pr-2 text-right font-normal">
            {translate('deployments.details-backlog')}
          </th>
          <th class="w-24 py-1.5 text-right font-normal">
            {translate('deployments.details-oldest-task')}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each taskQueues as queue (`${queue.name}-${queue.type}`)}
          {@const queueStats = statsFor(queue)}
          <tr class="border-b border-primary last:border-0">
            <td class="break-all py-1.5 pr-2">
              <Link href={routeForTaskQueue({ namespace, queue: queue.name })}>
                {queue.name}
              </Link>
            </td>
            <td class="py-1.5 pr-2">{typeLabel(queue.type)}</td>
            <td class="py-1.5 pr-2 text-right">
              {#if stats === undefined}
                <span
                  class="inline-block h-3 w-8 animate-pulse rounded bg-surface-tertiary align-middle"
                ></span>
              {:else if queueStats}
                {count(queueStats.approximateBacklogCount)}
              {:else}
                —
              {/if}
            </td>
            <td class="py-1.5 text-right">
              {#if stats === undefined}
                <span
                  class="inline-block h-3 w-10 animate-pulse rounded bg-surface-tertiary align-middle"
                ></span>
              {:else if queueStats}
                {age(queueStats.approximateBacklogAge)}
              {:else}
                —
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if stats === null}
      <p class="text-xs text-secondary">
        {translate('deployments.details-stats-unavailable')}
      </p>
    {/if}
  {/if}
</section>
