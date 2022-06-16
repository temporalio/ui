<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/index.svelte';
  import Badge from '$lib/components/badge.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import Link from '$lib/components/link.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import {
    formatDate,
    getDuration,
    formatDuration,
  } from '$lib/utilities/format-date';

  const { pendingActivities, defaultWorkflowTaskTimeout } =
    $page.stuff.workflow;
</script>

{#if pendingActivities.length}
  <section class="event-table">
    <header class="event-table-header">
      <h2>Activity Id</h2>
      <h2>Details</h2>
    </header>
    {#each pendingActivities as { id, activityId, ...details } (id)}
      {@const failed = details.attempt > 1}
      <div class="event-table-body">
        <div class="w-8 p-5 flex items-start">
          <Link href="#{id}">{activityId}</Link>
        </div>
        <div class="w-full py-4 px-5">
          <div class="event-table-row">
            <h2>Activity Type</h2>
            <Badge type={failed ? 'warning' : 'default'}>
              {details.activityType}
            </Badge>
          </div>
          <div class="event-table-row">
            <h2>Attempt</h2>
            <Badge type={failed ? 'warning' : 'default'}>
              {#if failed}
                <Icon
                  class="mr-1"
                  stroke="currentcolor"
                  name="refresh"
                  strokeWidth={2}
                  scale={0.5}
                />
              {/if}
              {details.attempt}
            </Badge>
          </div>
          {#if failed}
            <div class="event-table-row">
              <h2>Attempts Left</h2>
              <Badge type="warning">
                {details.maximumAttempts - details.attempt}
              </Badge>
            </div>
            <div class="event-table-row">
              <h2>Next Retry</h2>
              <Badge type="warning">
                {defaultWorkflowTaskTimeout}
              </Badge>
            </div>
          {/if}
          <div class="event-table-row">
            <h2>Maximum Attempts</h2>
            <Badge>{details.maximumAttempts}</Badge>
          </div>
          {#if failed}
            <div class="event-table-row">
              <h2>Heartbeat Details</h2>
              <CodeBlock
                slot="value"
                class="w-full pb-2"
                content={details.heartbeatDetails}
              />
            </div>
            <div class="event-table-row">
              <h2>Last Failure</h2>
              <CodeBlock
                slot="value"
                class="w-full pb-2"
                content={details.lastFailure}
              />
            </div>
            <div class="event-table-row">
              <h2>Retry Expiration</h2>
              <p>
                {formatDuration(
                  getDuration({
                    start: Date.now(),
                    end: details.expirationTime,
                  }),
                )}
              </p>
            </div>
          {/if}
          <div class="event-table-row">
            <h2>State</h2>
            <p>{details.state}</p>
          </div>
          <div class="event-table-row">
            <h2>Last Heartbeat</h2>
            <p>{formatDate(details.lastHeartbeatTime, 'relative')}</p>
          </div>
          <div class="event-table-row">
            <h2>Last Started Time</h2>
            <p>{formatDate(details.lastStartedTime)}</p>
          </div>
          <div class="event-table-row">
            <h2>Scheduled Time</h2>
            <p>{formatDate(details.scheduledTime)}</p>
          </div>
          <div class="event-table-row">
            <h2>Last Worker Identity</h2>
            <p>{formatDate(details.lastWorkerIdentity)}</p>
          </div>
        </div>
      </div>
    {/each}
  </section>
{:else}
  <EmptyState title="No Pending Activities" />
{/if}

<style lang="postcss">
  .event-table {
    @apply w-full table-fixed xl:table mb-6;
  }

  .event-table-header {
    @apply border-2 border-gray-300 bg-gray-900 text-white rounded-t-lg p-3 grid grid-cols-2;
  }

  .event-table-body {
    @apply border-2 border-t-0 border-gray-300 flex flex-row w-full;
  }

  .event-table-row {
    @apply grid grid-cols-2 border-b border-gray-300 py-1;
  }

  .event-table-row:last-child {
    @apply border-0;
  }
</style>
