<script lang="ts">
  import { workflowRun } from '$lib/stores/workflow-run';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { getDuration, formatDuration } from '$lib/utilities/format-time';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { timeFormat } from '$lib/stores/time-format';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  const { pendingActivities } = $workflowRun.workflow;
</script>

{#if pendingActivities.length}
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <TableHeaderRow slot="headers">
      <th class="table-cell w-44"><h2>Activity Id</h2></th>
      <th class="table-cell w-auto"><h2>Details</h2></th>
    </TableHeaderRow>
    {#each pendingActivities as { id, activityId, ...details } (id)}
      {@const failed = details.attempt > 1}
      <tr class="event-table-body">
        <td />
        <td
          class="table-cell w-44 items-start break-all py-5 pl-5 pr-2 align-top"
        >
          <div class="pt-1">
            <Link href="#{id}">{activityId}</Link>
          </div>
        </td>
        <td class="table-cell py-4 px-5">
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
                <Icon class="mr-1" name="retry" />
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
            {#if details.scheduledTime}
              <div class="event-table-row">
                <h2>Next Retry</h2>
                <Badge type="error">
                  {toTimeDifference(details.scheduledTime)}
                </Badge>
              </div>
            {/if}
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
                  class="pb-2"
                  content={details.heartbeatDetails}
                />
              </div>
            {/if}
            {#if details.lastFailure}
              <div class="event-table-row">
                <h2>Last Failure</h2>
                <CodeBlock
                  slot="value"
                  class="pb-2"
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
        </td>
        <td />
      </tr>
    {/each}
  </Table>
{:else}
  <EmptyState title="No Pending Activities" />
{/if}

<style lang="postcss">
  .event-table-header {
    @apply grid grid-cols-2 rounded-t-lg border-2 border-gray-300 bg-gray-900 p-3 text-white;
  }

  .event-table-body {
    @apply table-row w-full border-2 border-t-0 border-gray-300;
  }

  .event-table-row {
    @apply grid grid-cols-2 border-b border-gray-300 py-1;
  }

  .event-table-row:last-child {
    @apply border-0;
  }
</style>
