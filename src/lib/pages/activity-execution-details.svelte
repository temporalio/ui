<script lang="ts">
  import ActivityExecutionInputAndOutcome from '$lib/components/activity-execution/activity-execution-input-and-outcome.svelte';
  import {
    DetailList,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
  } from '$lib/components/detail-list';
  import DetailListValue from '$lib/components/detail-list/detail-list-value.svelte';
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { Failure } from '$lib/types';
  import { activityExecution } from '$lib/utilities/activity-execution-poller.svelte';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
  } from '$lib/utilities/format-event-attributes';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';
  import { fromSeconds } from '$lib/utilities/to-duration';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const isClosed = $derived(
    $activityExecution.info.status !== 'ACTIVITY_EXECUTION_STATUS_RUNNING',
  );

  const isRetrying = $derived(
    $activityExecution.info.status === 'ACTIVITY_EXECUTION_STATUS_RUNNING' &&
      $activityExecution.info.attempt > 1,
  );
</script>

{#snippet activityExecutionAttemptsBadge(
  attempt: number,
  maximumAttempts: number | undefined,
  lastFailure: Failure,
)}
  {@const failed = attempt > 1 && !!lastFailure}
  {@const badgeType = failed ? 'danger' : 'default'}

  <DetailListLabel>Attempt</DetailListLabel>
  <DetailListValue>
    <Badge type={badgeType} class="flex items-center gap-2">
      <Icon name="retry" class={failed ? 'text-red-400' : ''} />
      <span>{attempt} of {formatMaximumAttempts(maximumAttempts)}</span>
    </Badge>

    {#if maximumAttempts && !isClosed}
      <p class="ml-1 text-secondary">
        {formatAttemptsLeft(maximumAttempts, attempt)} remaining
      </p>
    {/if}
  </DetailListValue>
{/snippet}

{#if $activityExecution}
  <ActivityExecutionInputAndOutcome
    input={$activityExecution.input}
    outcome={$activityExecution.outcome}
  />
  <Card class="space-y-4">
    <div class="flex items-center justify-between">
      <h4>{$activityExecution.info.activityType.name}</h4>
      <div class="flex items-center gap-2">
        <Button leadingIcon="pause">Pause</Button>
        <Button leadingIcon="pencil">Update</Button>
        <Button leadingIcon="retry">Reset</Button>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <h6 class="col-span-2 underline underline-offset-4">Identity</h6>
        <DetailList
          rowCount={3}
          aria-label="Activity Execution Identity Details"
        >
          <DetailListLabel>Activity ID</DetailListLabel>
          <DetailListTextValue text={$activityExecution.info.activityId} />
          <DetailListLabel>Activity Type</DetailListLabel>
          <DetailListTextValue
            text={$activityExecution.info.activityType.name}
          />
          <DetailListLabel>Run ID</DetailListLabel>
          <DetailListTextValue copyable text={$activityExecution.info.runId} />
        </DetailList>
        {#if !isClosed}
          <h6 class="underline underline-offset-4">Current State</h6>
          <DetailList
            rowCount={2}
            aria-label="Activity Execution Status Details"
          >
            <DetailListLabel>Run State</DetailListLabel>
            <DetailListTextValue
              text={fromScreamingEnum($activityExecution.info.runState, '')}
            />
            {@render activityExecutionAttemptsBadge(
              $activityExecution.info.attempt,
              $activityExecution.info.retryPolicy?.maximumAttempts,
              $activityExecution.info.lastFailure,
            )}
          </DetailList>
        {/if}
        <h6 class="underline underline-offset-4">Timing and Progress</h6>
        <DetailList
          rowCount={isClosed ? 4 : 2}
          aria-label="Activity Execution Timing and Progress Details"
        >
          <DetailListLabel>Schedule Time</DetailListLabel>
          <DetailListTimestampValue
            timestamp={$activityExecution.info.scheduleTime}
          />
          <DetailListLabel>Last Started Time</DetailListLabel>
          <DetailListTimestampValue
            timestamp={$activityExecution.info.lastStartedTime}
          />
          {#if isClosed}
            <DetailListLabel>Execution Duration</DetailListLabel>
            <DetailListTextValue
              text={fromSeconds($activityExecution.info.executionDuration)}
            />
            <DetailListLabel>Close Time</DetailListLabel>
            <DetailListTimestampValue
              timestamp={$activityExecution.info.lastStartedTime}
            />
          {/if}
        </DetailList>
        {#if !isClosed}
          <h6 class="underline underline-offset-4">Health</h6>
          <DetailList
            rowCount={2}
            aria-label="Activity Execution Health Details"
          >
            <DetailListLabel>Last Heartbeat</DetailListLabel>
            <DetailListTimestampValue
              timestamp={$activityExecution.info.lastHeartbeatTime}
            />
            <DetailListLabel>Heartbeat Timeout</DetailListLabel>
            <DetailListTextValue
              text={fromSeconds($activityExecution.info.heartbeatTimeout)}
            />
          </DetailList>
        {/if}
        {#if isRetrying}
          <h6 class="underline underline-offset-4">Retry State</h6>
          <DetailList rowCount={3} aria-label="Activity Execution Retry State">
            <DetailListLabel>Current Retry Interval</DetailListLabel>
            <DetailListTextValue
              text={fromSeconds($activityExecution.info.currentRetryInterval)}
            />

            <DetailListLabel>Last Attempted Complete Time</DetailListLabel>
            <DetailListTimestampValue
              timestamp={$activityExecution.info.lastAttemptCompleteTime}
            />

            <DetailListLabel>Next Attempt Scheduled Time</DetailListLabel>
            <DetailListTimestampValue
              timestamp={$activityExecution.info.nextAttemptScheduleTime}
            />
          </DetailList>
        {/if}

        <h6 class="underline underline-offset-4">Timeout Configuration</h6>
        <DetailList
          rowCount={3}
          aria-label="Activity Execution Timeout Details"
        >
          <DetailListLabel>Schedule to Start Timeout</DetailListLabel>
          <DetailListTextValue
            text={fromSeconds($activityExecution.info.scheduleToStartTimeout)}
          />
          <DetailListLabel>Schedule to Close Timeout</DetailListLabel>
          <DetailListTextValue
            text={fromSeconds($activityExecution.info.scheduleToCloseTimeout)}
          />
          <DetailListLabel>Start to Close Timeout</DetailListLabel>
          <DetailListTextValue
            text={fromSeconds($activityExecution.info.startToCloseTimeout)}
          />
        </DetailList>
        <h6 class="underline underline-offset-4">Worker</h6>
        <DetailList rowCount={2} aria-label="Activity Execution Worker Details">
          <DetailListLabel>Task Queue</DetailListLabel>
          <DetailListLinkValue
            href={routeForTaskQueue({
              namespace,
              queue: $activityExecution.info.taskQueue,
            })}
            text={$activityExecution.info.taskQueue}
          />

          <DetailListLabel>Last Worker Identity</DetailListLabel>
          <DetailListTextValue
            text={$activityExecution.info.lastWorkerIdentity}
          />
        </DetailList>
      </div>
      <div class="space-y-2">
        {#if $activityExecution.info.lastFailure}
          <div class="space-y-2">
            <p class="font-medium text-secondary">Last Failure</p>
            <CodeBlock
              content={JSON.stringify(
                $activityExecution.info.lastFailure,
                null,
                2,
              )}
            />
          </div>
        {/if}
        {#if $activityExecution.info.retryPolicy}
          <div class="space-y-2">
            <p class="font-medium text-secondary">Retry Policy</p>
            <CodeBlock
              content={JSON.stringify(
                $activityExecution.info.retryPolicy,
                null,
                2,
              )}
            />
          </div>
        {/if}
        {#if $activityExecution.info.heartbeatDetails}
          <div class="space-y-2">
            <p class="font-medium text-secondary">Heartbeat Details</p>
            <PayloadDecoder value={$activityExecution.info.heartbeatDetails}>
              {#snippet children(content)}
                <CodeBlock {content} />
              {/snippet}
            </PayloadDecoder>
          </div>
        {/if}
        {#if $activityExecution.info.header}
          <div class="space-y-2">
            <p class="font-medium text-secondary">Header</p>
            <PayloadDecoder value={$activityExecution.info.header.fields}>
              {#snippet children(content)}
                <CodeBlock {content} />
              {/snippet}
            </PayloadDecoder>
          </div>
        {/if}
        {#if $activityExecution.info.priority}
          <div class="space-y-2">
            <p class="font-medium text-secondary">Priority</p>
            <CodeBlock
              content={JSON.stringify(
                $activityExecution.info.priority,
                null,
                2,
              )}
            />
          </div>
        {/if}
      </div>
    </div>
  </Card>
{/if}
