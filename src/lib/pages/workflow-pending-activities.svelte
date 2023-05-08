<script lang="ts">
  import { workflowRun } from '$lib/stores/workflow-run';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { getDuration, formatDuration } from '$lib/utilities/format-time';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { timeFormat } from '$lib/stores/time-format';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  $: pendingActivities = $workflowRun.workflow?.pendingActivities;
</script>

{#if pendingActivities.length}
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <TableHeaderRow slot="headers">
      <th class="w-44">Activity Id</th>
      <th>Details</th>
    </TableHeaderRow>
    {#each pendingActivities as { id, activityId, ...details } (id)}
      {@const failed = details.attempt > 1}
      <TableRow>
        <td class="w-44 items-start break-all py-5 pl-5 pr-2 align-top">
          <div class="pt-1">
            <Link href="#{id}">{activityId}</Link>
          </div>
        </td>
        <td class="py-4 px-5">
          <ul>
            <li class="event-table-row">
              <h4 class="font-semibold">Activity Type</h4>
              <Badge type={failed ? 'error' : 'default'}>
                {details.activityType}
              </Badge>
            </li>
            <li class="event-table-row">
              <h4>Attempt</h4>
              <Badge type={failed ? 'error' : 'default'}>
                {#if failed}
                  <Icon class="mr-1" name="retry" />
                {/if}
                {details.attempt}
              </Badge>
            </li>
            {#if failed}
              <li class="event-table-row">
                <h4>Attempts Left</h4>
                <Badge type="error">
                  {formatAttemptsLeft(details.maximumAttempts, details.attempt)}
                </Badge>
              </li>
              {#if details.scheduledTime}
                <li class="event-table-row">
                  <h4>Next Retry</h4>
                  <Badge type="error">
                    {toTimeDifference({
                      date: details.scheduledTime,
                      negativeDefault: 'None',
                    })}
                  </Badge>
                </li>
              {/if}
            {/if}
            <li class="event-table-row">
              <h4>Maximum Attempts</h4>
              <Badge>{formatMaximumAttempts(details.maximumAttempts)}</Badge>
            </li>
            {#if failed}
              {#if details.heartbeatDetails}
                <li class="event-table-row">
                  <h4>Heartbeat Details</h4>
                  <CodeBlock
                    slot="value"
                    class="pb-2"
                    content={details.heartbeatDetails}
                  />
                </li>
              {/if}
              {#if details.lastFailure}
                <li class="event-table-row">
                  <h4>Last Failure</h4>
                  <CodeBlock
                    slot="value"
                    class="pb-2"
                    content={details.lastFailure}
                  />
                </li>
              {/if}
              <li class="event-table-row">
                <h4>Retry Expiration</h4>
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
              </li>
            {/if}
            <li class="event-table-row">
              <h4>Last Heartbeat</h4>
              <p>{formatDate(details.lastHeartbeatTime, 'relative')}</p>
            </li>
            <li class="event-table-row">
              <h4>State</h4>
              <p>{details.state}</p>
            </li>
            {#if details.lastStartedTime}
              <li class="event-table-row">
                <h4>Last Started Time</h4>
                <p>{formatDate(details.lastStartedTime, $timeFormat)}</p>
              </li>
            {/if}
            {#if details.scheduledTime}
              <li class="event-table-row">
                <h4>Scheduled Time</h4>
                <p>{formatDate(details.scheduledTime, $timeFormat)}</p>
              </li>
            {/if}
            {#if details.lastWorkerIdentity}
              <li class="event-table-row">
                <h4>Last Worker Identity</h4>
                <p>{details.lastWorkerIdentity}</p>
              </li>
            {/if}
          </ul>
        </td>
      </TableRow>
    {/each}
  </Table>
{:else}
  <EmptyState title="No Pending Activities" />
{/if}

<style lang="postcss">
  .event-table-row {
    @apply grid grid-cols-2 border-b border-gray-300 py-1;
  }

  .event-table-row:last-child {
    @apply border-0;
  }
</style>
