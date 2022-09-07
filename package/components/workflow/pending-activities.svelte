<script>import { page } from '$app/stores';
import { workflowRun } from '../../stores/workflow-run';
import { formatDate, getDuration, formatDuration, } from '../../utilities/format-date';
import { routeForPendingActivities } from '../../utilities/route-for';
import Link from '../../holocene/link.svelte';
import Icon from '$holocene/icon/icon.svelte';
import Badge from '$holocene/badge.svelte';
import CodeBlock from '../../holocene/code-block.svelte';
import { formatAttemptsLeft, formatRetryExpiration, } from '../../utilities/format-event-attributes';
import { toTimeDifference } from '../../utilities/to-time-difference';
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
                      <Icon name="retry" />
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

<style>
  .pending-activity-row {

    display: flex;

    width: 100%;

    flex-direction: row;

    align-items: center;

    gap: 0.5rem
}

  .pending-activity-summary {

    width: 100%;

    overflow-x: scroll;

    border-bottom-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(212 212 216 / var(--tw-border-opacity));

    padding-top: 0.25rem;

    padding-bottom: 0.25rem;

    font-size: 0.875rem;

    line-height: 1.25rem
}

  .pending-activity-row:last-child .pending-activity-summary {

    border-bottom-width: 0px
}

  .pending-activity-inner-row {

    display: flex;

    width: 100%;

    flex-direction: row;

    align-content: space-between;

    gap: 1.5rem
}

  .pending-activity-detail {

    width: 100%;

    white-space: nowrap
}

  @media (min-width: 1280px) {

    .pending-activity-detail {

        display: flex;

        flex-direction: row;

        align-items: center;

        gap: 0.5rem
    }
}

  .pending-activity-detail-header {

    font-weight: 500
}

  .pending-activity-failure-details {

    display: flex;

    width: 100%;

    flex-direction: row;

    gap: 1rem
}</style>
