<script lang="ts">
  import ActivityExecutionDetailCard from '$lib/components/standalone-activities/activity-execution-detail-card.svelte';
  import ActivityExecutionLastFailure from '$lib/components/standalone-activities/activity-execution-last-failure.svelte';
  import ActivityExecutionLastHeartbeat from '$lib/components/standalone-activities/activity-execution-last-heartbeat.svelte';
  import ActivityExecutionLastWorker from '$lib/components/standalone-activities/activity-execution-last-worker.svelte';
  import ActivityExecutionProgressBar from '$lib/components/standalone-activities/activity-execution-progress-bar.svelte';
  import ActivityExecutionRetrySchedule from '$lib/components/standalone-activities/activity-execution-retry-schedule.svelte';
  import ActivityExecutionRunStateBadge from '$lib/components/standalone-activities/activity-execution-run-state-badge.svelte';
  import ActivityExecutionTimeouts from '$lib/components/standalone-activities/activity-execution-timeouts.svelte';
  import ActivityExecutionUpcomingAttempts from '$lib/components/standalone-activities/activity-execution-upcoming-attempts.svelte';
  import ActivityExecutionInputAndOutcome from '$lib/components/standalone-activities/activity-input-and-outcome.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import { formatSecondsAbbreviated } from '$lib/utilities/format-time';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';

  import { StandaloneActivity } from './standalone-activity.svelte';

  const activity = $derived(new StandaloneActivity($activityExecution));

  $effect(() => {
    if (activity.running) {
      const id = setInterval(() => {
        activity.now = Date.now();
      }, 1000);

      return () => clearInterval(id);
    }
  });
</script>

{#if activity}
  <div class="flex flex-col gap-4">
    <ActivityExecutionInputAndOutcome
      input={$activityExecution.input}
      outcome={$activityExecution.outcome}
      pending={$activityExecution.info.status ===
        'ACTIVITY_EXECUTION_STATUS_RUNNING'}
    />
    <ActivityExecutionLastFailure
      failure={$activityExecution.info.lastFailure}
    />
    <ActivityExecutionTimeouts {activity} />

    <div class="grid gap-4 max-lg:grid-cols-1 lg:grid-cols-2">
      <ActivityExecutionLastHeartbeat
        lastHeartbeat={$activityExecution.info.lastHeartbeatTime}
        heartbeatDetails={$activityExecution.info.heartbeatDetails}
      />
      <ActivityExecutionLastWorker
        identity={$activityExecution.info.lastWorkerIdentity}
      />
    </div>
    {#if activity.running}
      <div class="grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
        <ActivityExecutionDetailCard
          title="Current Attempt"
          content={activity.currentAttempt}
          description={activity.maximumAttempts
            ? `of ${activity.maximumAttempts} maximum`
            : 'of unlimited'}
        >
          <ActivityExecutionRunStateBadge state={activity.runState} />
        </ActivityExecutionDetailCard>
        <ActivityExecutionDetailCard
          title="Current Interval"
          content={activity.currentInterval}
          description="next attempt at {$timestamp(
            activity.nextAttemptScheduleTime,
          )}"
        />
        <ActivityExecutionDetailCard
          title="Attempts Left"
          content={!activity.maximumAttempts ? '∞' : activity.attemptsRemaining}
          description="last completed at {$timestamp(
            activity.lastAttemptCompletedTime,
          )}"
        />
        <ActivityExecutionDetailCard
          title="Time Remaining"
          content={activity.secondsRemaining
            ? formatSecondsAbbreviated(activity.secondsRemaining, false)
            : '∞'}
          description="(approximate)"
        />
      </div>
      <ActivityExecutionProgressBar
        attempt={activity.currentAttempt}
        maximumAttempts={activity.maximumAttempts}
      />

      <div class="grid gap-4 max-lg:grid-cols-1 lg:grid-cols-2">
        <ActivityExecutionRetrySchedule {activity} />

        <ActivityExecutionUpcomingAttempts {activity} />
      </div>
    {:else}
      <ActivityExecutionDetailCard
        title="Attempts"
        content={activity.currentAttempt}
        description={activity.maximumAttempts
          ? `of ${activity.maximumAttempts} maximum`
          : 'of unlimited'}
      />
    {/if}
  </div>
{/if}
