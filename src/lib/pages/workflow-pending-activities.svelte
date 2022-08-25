<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import Icon from '$holocene/icon/index.svelte';
  import Badge from '$holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import {
    formatDate,
    getDuration,
    formatDuration,
  } from '$lib/utilities/format-date';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { timeFormat } from '$lib/stores/time-format';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  const { pendingActivities } = $workflowRun.workflow;
  const workflow = $page.params?.workflow;
</script>

<PageTitle title={`Pending Activities | ${workflow}`} url={$page.url.href} />
{#if pendingActivities.length}
  <section class="event-table">
    <header class="event-table-header">
      <h2>Activity Id</h2>
      <h2>Details</h2>
    </header>
    {#each pendingActivities as { id, activityId, ...details } (id)}
      {@const failed = details.attempt > 1}
      <div class="event-table-body">
        <div class="flex w-8 items-start p-5">
          <Link href="#{id}">{activityId}</Link>
        </div>
        <div class="w-full py-4 px-5">
          <div class="event-table-row">
            <h2 class="font-semibold">Activity Type</h2>
            <Badge type={failed ? 'error' : 'default'}>
              {details.activityType}
            </Badge>
          </div>
          <div class="event-table-row">
            <h2>Attempt</h2>
            <Badge type={failed ? 'error' : 'default'}>
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
              <Badge type="error">
                {formatAttemptsLeft(details.maximumAttempts, details.attempt)}
              </Badge>
            </div>
            <div class="event-table-row">
              <h2>Next Retry</h2>
              <Badge type="error">
                {toTimeDifference(String(details.scheduledTime))}
              </Badge>
            </div>
          {/if}
          <div class="event-table-row">
            <h2>Maximum Attempts</h2>
            <Badge>{formatMaximumAttempts(details.maximumAttempts)}</Badge>
          </div>
          {#if failed}
            {#if details.heartbeatDetails}
              <div class="event-table-row">
                <h2>Heartbeat Details</h2>
                <CodeBlock
                  slot="value"
                  class="w-full pb-2"
                  content={details.heartbeatDetails}
                />
              </div>
            {/if}
            {#if details.lastFailure}
              <div class="event-table-row">
                <h2>Last Failure</h2>
                <CodeBlock
                  slot="value"
                  class="w-full pb-2"
                  content={details.lastFailure}
                />
              </div>
            {/if}
            <div class="event-table-row">
              <h2>Retry Expiration</h2>
              <p>
                {formatRetryExpiration(
                  details.maximumAttempts,
                  formatDuration(
                    getDuration({
                      start: Date.now(),
                      end: details.expirationTime,
                    }),
                  ),
                )}
              </p>
            </div>
          {/if}
          <div class="event-table-row">
            <h2>Last Heartbeat</h2>
            <p>{formatDate(details.lastHeartbeatTime, 'relative')}</p>
          </div>
          <div class="event-table-row">
            <h2>State</h2>
            <p>{details.state}</p>
          </div>
          {#if details.lastStartedTime}
            <div class="event-table-row">
              <h2>Last Started Time</h2>
              <p>{formatDate(details.lastStartedTime, $timeFormat)}</p>
            </div>
          {/if}
          {#if details.scheduledTime}
            <div class="event-table-row">
              <h2>Scheduled Time</h2>
              <p>{formatDate(details.scheduledTime, $timeFormat)}</p>
            </div>
          {/if}
          {#if details.lastWorkerIdentity}
            <div class="event-table-row">
              <h2>Last Worker Identity</h2>
              <p>{details.lastWorkerIdentity}</p>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </section>
{:else}
  <EmptyState title="No Pending Activities" />
{/if}

<style lang="postcss">
  .event-table {
    @apply mb-6 w-full table-fixed xl:table;
  }

  .event-table-header {
    @apply grid grid-cols-2 rounded-t-lg border-2 border-gray-300 bg-gray-900 p-3 text-white;
  }

  .event-table-body {
    @apply flex w-full flex-row border-2 border-t-0 border-gray-300;
  }

  .event-table-row {
    @apply grid grid-cols-2 border-b border-gray-300 py-1;
  }

  .event-table-row:last-child {
    @apply border-0;
  }
</style>
