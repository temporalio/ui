<script lang="ts">
  import ActivityExecutionInputAndOutcome from '$lib/components/activity-execution/activity-execution-input-and-outcome.svelte';
  import {
    ActivityExecutionAttemptsDetail,
    ActivityExecutionDetail,
    // ActivityExecutionSnippetDetail,
    ActivityExecutionTimestampDetail,
  } from '$lib/components/activity-execution/details';
  import DetailList from '$lib/components/detail-list/detail-list.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { activityExecution } from '$lib/utilities/activity-execution-poller.svelte';
  import { fromSeconds } from '$lib/utilities/to-duration';
</script>

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
        <h6 class="underline underline-offset-4">Identity</h6>
        <DetailList
          rowCount={3}
          aria-label="Activity Execution Identity Details"
        >
          <ActivityExecutionDetail
            label="Activity ID"
            value={$activityExecution.info.activityId}
          />
          <ActivityExecutionDetail
            label="Activity Type"
            value={$activityExecution.info.activityType.name}
          />
          <ActivityExecutionDetail
            label="Run ID"
            value={$activityExecution.info.runId}
          />
        </DetailList>
        <h6 class="underline underline-offset-4">Current State</h6>
        <DetailList rowCount={2} aria-label="Activity Execution Status Details">
          <ActivityExecutionDetail
            label="Run State"
            value={$activityExecution.info.runState}
          />
          <ActivityExecutionAttemptsDetail
            attempt={$activityExecution.info.attempt}
            maximumAttempts={$activityExecution.info.retryPolicy
              ?.maximumAttempts}
            lastFailure={$activityExecution.info.lastFailure}
          />
        </DetailList>
        <h6 class="underline underline-offset-4">Timing & Progress</h6>
        <DetailList
          rowCount={4}
          aria-label="Activity Execution Timing and Progress Details"
        >
          <ActivityExecutionTimestampDetail
            label="Schedule Time"
            value={$activityExecution.info.scheduleTime}
          />
          <ActivityExecutionTimestampDetail
            label="Last Started Time"
            value={$activityExecution.info.lastStartedTime}
          />
          <ActivityExecutionDetail
            label="Execution Duration"
            value={$activityExecution.info.executionDuration}
          />
          <ActivityExecutionTimestampDetail
            label="Close Time"
            value={$activityExecution.info.closeTime}
          />
        </DetailList>
        <h6 class="underline underline-offset-4">Health</h6>
        <DetailList rowCount={3} aria-label="Activity Execution Health Details">
          <ActivityExecutionTimestampDetail
            label="Last Heartbeat"
            value={$activityExecution.info.lastHeartbeatTime}
          />
          <ActivityExecutionDetail
            label="Heartbeat Timeout"
            value={$activityExecution.info.heartbeatTimeout}
          />
          <ActivityExecutionDetail label="Heartbeat Details" value="TBD" />
        </DetailList>
        <h6 class="underline underline-offset-4">Retry State</h6>
        <DetailList rowCount={4} aria-label="Activity Execution Retry State">
          <ActivityExecutionDetail
            label="Current Retry Interval"
            value={$activityExecution.info.currentRetryInterval}
          />
          <ActivityExecutionTimestampDetail
            label="Next Attempt Scheduled Time"
            value="TBD"
          />
          <ActivityExecutionTimestampDetail
            label="Last Attempt Completed Time"
            value={$activityExecution.info.lastAttemptCompleteTime}
          />
          <ActivityExecutionDetail label="Retry Policy" value="TBD" />
        </DetailList>

        <h6 class="underline underline-offset-4">Timeout Configuration</h6>
        <DetailList
          rowCount={3}
          aria-label="Activity Execution Timeout Details"
        >
          <ActivityExecutionDetail
            label="Schedule to Start Timeout"
            value={fromSeconds($activityExecution.info.scheduleToStartTimeout)}
          />
          <ActivityExecutionDetail
            label="Schedule to Close Timeout"
            value={fromSeconds($activityExecution.info.scheduleToCloseTimeout)}
          />
          <ActivityExecutionDetail
            label="Start to Close Timeout"
            value={fromSeconds($activityExecution.info.startToCloseTimeout)}
          />
        </DetailList>
        <h6 class="underline underline-offset-4">Worker</h6>
        <DetailList rowCount={4} aria-label="Activity Execution Worker Details">
          <ActivityExecutionDetail
            label="Task Queue"
            value={$activityExecution.info.taskQueue}
          />
          <ActivityExecutionDetail
            label="Last Worker Identity"
            value={$activityExecution.info.lastWorkerIdentity}
          />
          <ActivityExecutionDetail
            label="Last Deployment Version"
            value="TBD"
          />
          <ActivityExecutionDetail label="Priority" value="TBD" />
        </DetailList>
      </div>
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
    </div>
  </Card>
{/if}
