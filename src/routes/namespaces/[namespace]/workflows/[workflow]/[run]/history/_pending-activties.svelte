<script lang="ts">
  import { page } from '$app/stores';

  import {
    formatDate,
    getDuration,
    formatDuration,
  } from '$lib/utilities/format-date';
  import { routeForPendingActivities } from '$lib/utilities/route-for';
  import Link from '$lib/components/link.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import Badge from '$lib/components/badge.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  const {
    pendingActivities,
    defaultWorkflowTaskTimeout,
    id: workflow,
  } = $page.stuff.workflow;
  const { namespace, run } = $page.params;

  const href = routeForPendingActivities({ namespace, workflow, run });
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
                  <h4>Activity Type</h4>
                  <Badge type={failed ? 'warning' : 'default'}>
                    {pendingActivity.activityType}
                  </Badge>
                </div>
                <h4 class="pending-activity-detail">
                  Last Heartbeat {formatDate(
                    pendingActivity.lastHeartbeatTime,
                    'relative',
                  )}
                </h4>
                <div class="pending-activity-detail">
                  <h4>Attempt</h4>
                  <Badge type={failed ? 'warning' : 'default'}>
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
                  <h4>Attempts Left</h4>
                  <Badge type={failed ? 'warning' : 'default'}>
                    {pendingActivity.maximumAttempts - pendingActivity.attempt}
                  </Badge>
                </div>
                <div class="pending-activity-detail">
                  <h4>Next Retry</h4>
                  <Badge type={failed ? 'warning' : 'default'}>
                    {defaultWorkflowTaskTimeout}
                  </Badge>
                </div>
                <h4 class="pending-activity-detail">
                  Expiration {formatDuration(
                    getDuration({
                      start: Date.now(),
                      end: pendingActivity.expirationTime,
                    }),
                  )}
                </h4>
              </div>
            </a>
            {#if failed}
              <div class="pending-activity-failure-details">
                <div class="hidden lg:inline-block">
                  {#if pendingActivity.heartbeatDetails}
                    <h4>Heartbeat Details</h4>
                    <CodeBlock
                      class="max-h-32"
                      content={pendingActivity.heartbeatDetails}
                    />
                  {/if}
                </div>
                <div class="hidden lg:inline-block">
                  {#if pendingActivity.lastFailure}
                    <h4>Last Failure</h4>
                    <CodeBlock
                      class="max-h-32"
                      content={pendingActivity.lastFailure}
                    />
                  {/if}
                </div>
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
    @apply mb-2 flex w-full flex-row items-center;
  }

  .pending-activity-summary {
    @apply w-full border-b-2 border-gray-300 text-sm;
  }

  .pending-activity-row:last-child .pending-activity-summary {
    @apply border-b-0;
  }

  .pending-activity-inner-row {
    width: 100%;
    display: grid;
    grid-template-columns: 20% 20% repeat(3, 1fr) 20%;
    column-gap: 1rem;
  }

  .pending-activity-detail {
    @apply xl:flex xl:flex-row xl:items-center xl:gap-2;
  }

  .pending-activity-failure-details {
    width: 100%;
    margin-bottom: 0.5rem;
    display: grid;
    grid-template-columns: 40% 1fr;
    column-gap: 2rem;
  }
</style>
