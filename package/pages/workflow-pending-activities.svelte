<script>var _a;
import { page } from '$app/stores';
import { workflowRun } from '../stores/workflow-run';
import Icon from '$holocene/icon/icon.svelte';
import Badge from '$holocene/badge.svelte';
import EmptyState from '../holocene/empty-state.svelte';
import Link from '../holocene/link.svelte';
import CodeBlock from '../holocene/code-block.svelte';
import { formatDate, getDuration, formatDuration, } from '../utilities/format-date';
import PageTitle from '../holocene/page-title.svelte';
import { formatAttemptsLeft, formatMaximumAttempts, formatRetryExpiration, } from '../utilities/format-event-attributes';
import { timeFormat } from '../stores/time-format';
import { toTimeDifference } from '../utilities/to-time-difference';
const { pendingActivities } = $workflowRun.workflow;
const workflow = (_a = $page.params) === null || _a === void 0 ? void 0 : _a.workflow;
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

<style>
  .event-table {

    margin-bottom: 1.5rem;

    width: 100%;

    table-layout: fixed
}

@media (min-width: 1280px) {

    .event-table {

        display: table
    }
}

  .event-table-header {

    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    border-top-left-radius: 0.5rem;

    border-top-right-radius: 0.5rem;

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(212 212 216 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    padding: 0.75rem;

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .event-table-body {

    display: flex;

    width: 100%;

    flex-direction: row;

    border-width: 2px;

    border-top-width: 0px;

    --tw-border-opacity: 1;

    border-color: rgb(212 212 216 / var(--tw-border-opacity))
}

  .event-table-row {

    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    border-bottom-width: 1px;

    --tw-border-opacity: 1;

    border-color: rgb(212 212 216 / var(--tw-border-opacity));

    padding-top: 0.25rem;

    padding-bottom: 0.25rem
}

  .event-table-row:last-child {

    border-width: 0px
}</style>
