<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import {
    formatDate,
    getDuration,
    formatDuration,
  } from '$lib/utilities/format-date';
  import { routeForPendingActivities } from '$lib/utilities/route-for';
  import Link from '$lib/holocene/link.svelte';
  import Icon from '$holocene/icon/index.svelte';
  import Badge from '$holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import {
    formatAttemptsLeft,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  const { namespace, run } = $page.params;
  const { workflow } = $workflowRun;
  const { pendingActivities, defaultWorkflowTaskTimeout, id } = workflow;

  const href = routeForPendingActivities({ namespace, workflow: id, run });
</script>

{#if pendingActivities.length}
  <section class="rounded-lg border-2 border-gray-300 p-4">
    <h3 class="mb-2 text-lg font-medium">Pending Activities</h3>
    <section>
      {#each pendingActivities as { id, ...pendingActivity } (id)}
        {@const failed = pendingActivity.attempt > 1}
        <div class="pending-activity-row">
          <h3 class="w-6 self-start p-1 font-normal text-gray-500">
            {pendingActivity.activityId}
          </h3>
          <div class="pending-activity-summary">
            <a class="flex w-full items-center hover:bg-gray-50" {href}>
              <div class="pending-activity-inner-row">
                <div class="pending-activity-detail">
                  <h4 class="pending-activity-detail-header">Activity Type</h4>
                  <Badge type={failed ? 'error' : 'default'}>
                    {pendingActivity.activityType}
                  </Badge>
                </div>
                <div class="pending-activity-detail">
                  <h4 class="pending-activity-detail-header">Last Heartbeat</h4>
                  {formatDate(pendingActivity.lastHeartbeatTime, 'relative')}
                </div>
                <div class="pending-activity-detail">
                  <h4 class="pending-activity-detail-header">Attempt</h4>
                  <Badge type={failed ? 'error' : 'default'}>
                    {#if failed}
                      <Icon
                        name="refresh"
                        stroke="currentcolor"
                        scale={0.5}
                        strokeWidth={2}
                      />
                    {/if}
                    {pendingActivity.attempt}
                  </Badge>
                </div>
                <div class="pending-activity-detail">
                  <h4 class="pending-activity-detail-header">Attempts Left</h4>
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
            {#if failed}
              <div class="pending-activity-failure-details">
                {#if pendingActivity.heartbeatDetails}
                  <div class="w-full">
                    <h4 class="pending-activity-detail-header">
                      Heartbeat Details
                    </h4>
                    <CodeBlock
                      class="max-h-32"
                      content={pendingActivity.heartbeatDetails}
                    />
                  </div>
                {/if}
                {#if pendingActivity.lastFailure}
                  <div class="w-full">
                    <h4 class="pending-activity-detail-header">Last Failure</h4>
                    <CodeBlock
                      class="max-h-32"
                      content={pendingActivity.lastFailure}
                    />
                  </div>
                {/if}
              </div>
            {/if}
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
