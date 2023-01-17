<script lang="ts">
  import { page } from '$app/stores';
  import type { WorkflowRunWithWorkers } from '$lib/stores/workflow-run';

  import { formatDate } from '$lib/utilities/format-date';
  import { getDuration, formatDuration } from '$lib/utilities/format-time';
  import { routeForPendingActivities } from '$lib/utilities/route-for';
  import Link from '$lib/holocene/link.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import {
    formatAttemptsLeft,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  export let workflowRun: WorkflowRunWithWorkers;

  $: pendingActivities = workflowRun.workflow?.pendingActivities;

  $: href = routeForPendingActivities({
    namespace: $page.params.namespace,
    workflow: $page.params.workflow,
    run: $page.params.run,
  });

  $: canceled = ['Terminated', 'TimedOut', 'Canceled'].includes(
    workflowRun.workflow?.status,
  );
</script>

{#if pendingActivities.length}
  <section class="rounded-xl border-[3px] border-gray-900 bg-white p-4">
    <h3 class="mb-2 flex gap-2 text-lg font-medium">
      Pending Activities
      {#if canceled}
        <Tooltip bottom text="Pending activities have been canceled.">
          <Badge type="warning" class="py-0"><Icon name="canceled" /></Badge>
        </Tooltip>
      {/if}
    </h3>
    <section>
      {#each pendingActivities as { id, ...pendingActivity } (id)}
        {@const failed = pendingActivity.attempt > 1}
        <div class="pending-activity-row-container">
          <h3 class="w-full self-start text-sm font-normal text-gray-500">
            {pendingActivity.activityId}
          </h3>
          <div class="pending-activity-row">
            <div class="pending-activity-summary">
              <a class="flex w-full items-center hover:bg-gray-50" {href}>
                <div class="pending-activity-inner-row">
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      Activity Type
                    </h4>
                    <Badge type={failed ? 'error' : 'default'}>
                      {pendingActivity.activityType}
                    </Badge>
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      Last Heartbeat
                    </h4>
                    {formatDate(pendingActivity.lastHeartbeatTime, 'relative')}
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">Attempt</h4>
                    <Badge type={failed ? 'error' : 'default'}>
                      {#if failed}
                        <Icon name="retry" />
                      {/if}
                      {pendingActivity.attempt}
                    </Badge>
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      Attempts Left
                    </h4>
                    <Badge type={failed ? 'error' : 'default'}>
                      {formatAttemptsLeft(
                        pendingActivity.maximumAttempts,
                        pendingActivity.attempt,
                      )}
                    </Badge>
                  </div>
                  {#if failed && pendingActivity.scheduledTime}
                    <div class="pending-activity-detail">
                      <h4 class="pending-activity-detail-header">Next Retry</h4>
                      <Badge type={failed ? 'error' : 'default'}>
                        {toTimeDifference(pendingActivity.scheduledTime)}
                      </Badge>
                    </div>
                  {/if}
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">Expiration</h4>
                    {formatRetryExpiration(
                      pendingActivity.maximumAttempts,
                      formatDuration(
                        getDuration({
                          start: Date.now(),
                          end: pendingActivity.expirationTime,
                        }),
                      ),
                    )}
                  </div>
                </div>
              </a>
              <div class="pending-activity-failure-details">
                {#if pendingActivity?.heartbeatDetails}
                  <div class="w-1/2 grow">
                    <h4 class="pending-activity-detail-header">
                      Heartbeat Details
                    </h4>
                    <CodeBlock
                      class="max-h-32"
                      content={pendingActivity.heartbeatDetails}
                    />
                  </div>
                {/if}
                {#if pendingActivity?.lastFailure}
                  <div class="w-1/2 grow">
                    <h4 class="pending-activity-detail-header">Last Failure</h4>
                    <CodeBlock
                      class="max-h-32"
                      content={pendingActivity.lastFailure}
                    />
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </section>
    <div class="text-right">
      <Link {href}>Show all</Link>
    </div>
  </section>
{/if}

<style lang="postcss">
  .pending-activity-row-container {
    @apply mt-4;
  }

  .pending-activity-row {
    @apply flex w-full flex-row items-center gap-2;
  }

  .pending-activity-summary {
    @apply w-full overflow-x-scroll border-b-2 border-gray-300 py-1 text-sm;
  }

  .pending-activity-row:last-child .pending-activity-summary {
    @apply border-b-0;
  }

  .pending-activity-inner-row {
    @apply flex w-full flex-row content-between gap-6;
  }

  .pending-activity-detail {
    @apply w-full whitespace-nowrap xl:flex xl:flex-row xl:items-center xl:gap-2;
  }

  .pending-activity-detail-header {
    @apply font-medium;
  }

  .pending-activity-failure-details {
    @apply flex w-full flex-row gap-4;
  }
</style>
