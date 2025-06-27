<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import Button from '$lib/holocene/button.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { translate } from '$lib/i18n/translate';
  import { updateActivityOptions } from '$lib/services/workflow-activities-service';
  import { toaster } from '$lib/stores/toaster';
  import { refresh } from '$lib/stores/workflow-run';
  import type { ActivityOptions } from '$lib/types';
  import type {
    ActivityTaskScheduledEvent,
    PendingActivity,
  } from '$lib/types/events';
  import { formatSecondsAbbreviated } from '$lib/utilities/format-time';

  type Props = {
    open: boolean;
    namespace: string;
    execution: WorkflowExecution;
    activity: PendingActivity;
    scheduledEvent: ActivityTaskScheduledEvent;
  };

  const fromDurationToNumber = (duration) => {
    if (!duration || !duration.endsWith('s')) {
      return '';
    }

    return duration?.replace('s', '');
  };

  const fromNumberToDuration = (duration: number): string => {
    if (!duration) return undefined;
    return duration + 's';
  };

  let {
    open = $bindable(),
    namespace,
    execution,
    activity,
    scheduledEvent,
  }: Props = $props();
  let { activityId: id, activityType: type } = $derived(activity);
  let taskQueue = $state(activity.activityOptions?.taskQueue?.name);
  let originalTaskQueue = $derived(
    scheduledEvent?.activityTaskScheduledEventAttributes?.taskQueue?.name,
  );
  let scheduleToCloseTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.scheduleToCloseTimeout),
  );
  let originalScheduleToCloseTimeout = $derived(
    fromDurationToNumber(
      scheduledEvent?.activityTaskScheduledEventAttributes
        ?.scheduleToCloseTimeout,
    ),
  );
  let scheduleToStartTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.scheduleToStartTimeout),
  );
  let originalScheduleToStartTimeout = $derived(
    fromDurationToNumber(
      scheduledEvent?.activityTaskScheduledEventAttributes
        ?.scheduleToStartTimeout,
    ),
  );
  let startToCloseTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.startToCloseTimeout),
  );
  let originalStartToCloseTimeout = $derived(
    fromDurationToNumber(
      scheduledEvent?.activityTaskScheduledEventAttributes?.startToCloseTimeout,
    ),
  );
  let heartbeatTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.heartbeatTimeout),
  );
  let originalHeartbeatTimeout = $derived(
    fromDurationToNumber(
      scheduledEvent?.activityTaskScheduledEventAttributes?.heartbeatTimeout,
    ),
  );
  let maximumAttempts = $state(
    activity?.activityOptions?.retryPolicy?.maximumAttempts,
  );
  let originalMaximumAttempts = $derived(
    scheduledEvent?.activityTaskScheduledEventAttributes?.retryPolicy
      ?.maximumAttempts,
  );
  let backoffCoefficient = $state(
    activity?.activityOptions?.retryPolicy?.backoffCoefficient,
  );
  let originalBackoffCoefficient = $derived(
    scheduledEvent?.activityTaskScheduledEventAttributes?.retryPolicy
      ?.backoffCoefficient,
  );
  let initialInterval = $state(
    fromDurationToNumber(
      activity?.activityOptions?.retryPolicy?.initialInterval,
    ),
  );
  let originalInitialInterval = $derived(
    fromDurationToNumber(
      scheduledEvent?.activityTaskScheduledEventAttributes?.retryPolicy
        ?.initialInterval,
    ),
  );
  let maximumInterval = $state(
    fromDurationToNumber(
      activity?.activityOptions?.retryPolicy?.maximumInterval,
    ),
  );
  let originalMaximumInterval = $derived(
    fromDurationToNumber(
      scheduledEvent?.activityTaskScheduledEventAttributes?.retryPolicy
        ?.maximumInterval,
    ),
  );
  let includeType = $state(false);

  const activityOptions = $derived({
    taskQueue: { name: taskQueue },
    scheduleToCloseTimeout: fromNumberToDuration(scheduleToCloseTimeout),
    scheduleToStartTimeout: fromNumberToDuration(scheduleToStartTimeout),
    startToCloseTimeout: fromNumberToDuration(startToCloseTimeout),
    heartbeatTimeout: fromNumberToDuration(heartbeatTimeout),
    retryPolicy: {
      maximumAttempts,
      initialInterval: fromNumberToDuration(initialInterval),
      backoffCoefficient,
      maximumInterval: fromNumberToDuration(maximumInterval),
    },
  }) as unknown as ActivityOptions;

  const closeCustomizationDrawer = () => {
    open = false;
  };

  const onUpdate = async () => {
    try {
      await updateActivityOptions({
        namespace,
        execution,
        id: includeType ? undefined : id,
        type: includeType ? type : undefined,
        activityOptions,
      });
      $refresh = Date.now();
      toaster.push({
        variant: 'success',
        message: `Options for Activity ${id} have been updated.`,
      });
    } catch (error) {
      console.error('Error updating activity options:', error);
    } finally {
      closeCustomizationDrawer();
    }
  };

  const resetOriginalValues = async () => {
    try {
      taskQueue = originalTaskQueue;
      scheduleToCloseTimeout = originalScheduleToCloseTimeout;
      scheduleToStartTimeout = originalScheduleToStartTimeout;
      startToCloseTimeout = originalStartToCloseTimeout;
      heartbeatTimeout = originalHeartbeatTimeout;
      maximumAttempts = originalMaximumAttempts;
      initialInterval = originalInitialInterval;
      backoffCoefficient = originalBackoffCoefficient;
      maximumInterval = originalMaximumInterval;

      await updateActivityOptions({
        namespace,
        execution,
        id: includeType ? undefined : id,
        type: includeType ? type : undefined,
        activityOptions,
      });
      $refresh = Date.now();
      toaster.push({
        variant: 'success',
        message: `Options for Activity ${id} have been reset to original values.`,
      });
    } catch (error) {
      console.error('Error reseting activity options:', error);
    } finally {
      closeCustomizationDrawer();
    }
  };
</script>

<Drawer
  {open}
  onClick={closeCustomizationDrawer}
  position="right"
  id="activity-options-update-drawer"
  dark={false}
  closeButtonLabel={translate('common.close')}
  class="w-[480px]"
>
  <DrawerContent title="Update Activity {activity.activityId}">
    <form onsubmit={onUpdate} class="flex flex-col gap-4">
      <div>
        <Label for="heartbeat-timeout" label="Heartbeat Timeout Duration" />
        <p class="mb-1 text-xs text-secondary">
          Maximum permitted time between successful Worker Heartbeats.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <NumberInput
              id="original-heartbeat-timeout"
              label="Original Heartbeat Timeout Duration"
              labelHidden
              value={originalHeartbeatTimeout}
              disabled
              class="w-24"
            />
            <Icon name="arrow-right" />
            <Input
              id="heartbeat-timeout"
              label="Heartbeat Timeout Duration"
              labelHidden
              bind:value={heartbeatTimeout}
              suffix="sec"
              class="w-36"
              error={isNaN(heartbeatTimeout)}
            />
          </div>
          <p class="text-nowrap text-secondary">
            {formatSecondsAbbreviated(heartbeatTimeout)}
          </p>
        </div>
      </div>
      <div>
        <Label
          for="retry-backoff-coefficient"
          label="Retry Backoff Coefficient"
        />
        <p class="mb-1 text-xs text-secondary">
          Coefficient used to calculate the next retry interval. The next retry
          interval is previous interval multiplied by the coefficient. Must be 1
          or larger.
        </p>
        <div class="flex items-center gap-2">
          <NumberInput
            id="original retry-backoff-coefficient"
            label="Orginal Retry Backoff Coefficient"
            labelHidden
            value={originalBackoffCoefficient}
            step={0.01}
            min={1}
            disabled
            class="w-24"
          />
          <Icon name="arrow-right" />
          <NumberInput
            id="retry-backoff-coefficient"
            label="Retry Backoff Coefficient"
            labelHidden
            bind:value={backoffCoefficient}
            step={0.01}
            min={1}
            class="w-24"
          />
        </div>
      </div>
      <div>
        <Label
          for="retry-initial-interval"
          label="Retry Initial Interval Duration"
        />
        <p class="mb-1 text-xs text-secondary">
          Interval of the first retry. If retryBackoffCoefficient is 1.0 then it
          is used for all retries.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <NumberInput
              id="original-retry-initial-interval"
              label="Original Retry Initial Interval Duration"
              labelHidden
              value={originalInitialInterval}
              disabled
              class="w-24"
            />
            <Icon name="arrow-right" />
            <Input
              id="retry-initial-interval"
              label="Retry Initial Interval Duration"
              labelHidden
              bind:value={initialInterval}
              suffix="sec"
              class="w-36"
              error={isNaN(initialInterval)}
            />
          </div>
          <p class="text-nowrap text-secondary">
            {formatSecondsAbbreviated(initialInterval)}
          </p>
        </div>
      </div>
      <div>
        <Label for="maximum-attempts" label="Retry Maximum Attempts" />
        <p class="mb-1 text-xs text-secondary">
          Maximum number of attempts. When exceeded the retries stop even if not
          expired yet. 1 disables retries. 0 means unlimited (up to the
          timeouts).
        </p>
        <div class="flex items-center gap-2">
          <NumberInput
            id="original-maximum-attempts"
            label="Original Retry Maximum Attempts"
            labelHidden
            value={originalMaximumAttempts}
            disabled
            class="w-24"
          />
          <Icon name="arrow-right" />
          <NumberInput
            id="maximum-attempts"
            label="Retry Maximum Attempts"
            labelHidden
            bind:value={maximumAttempts}
            class="w-24"
          />
        </div>
      </div>
      <div>
        <Label
          for="schedule-to-close-timeout"
          label="Schedule to Close Timeout Duration"
        />
        <p class="mb-1 text-xs text-secondary">
          Indicates how long the caller is willing to wait for an Activity
          completion. Limits how long retries will be attempted.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <NumberInput
              id="original-schedule-to-close-timeout"
              label="Orginal Schedule to Close Timeout Duration"
              labelHidden
              value={originalScheduleToCloseTimeout}
              disabled
              class="w-24"
            />
            <Icon name="arrow-right" />
            <Input
              id="schedule-to-close-timeout"
              label="Schedule to Close Timeout Duration"
              labelHidden
              bind:value={scheduleToCloseTimeout}
              suffix="sec"
              class="w-36"
              error={isNaN(scheduleToCloseTimeout)}
            />
          </div>
          <p class="text-nowrap text-secondary">
            {formatSecondsAbbreviated(scheduleToCloseTimeout)}
          </p>
        </div>
      </div>
      <div>
        <Label
          for="schedule-to-start-timeout"
          label="Schedule to Start Timeout Duration"
        />
        <p class="mb-1 text-xs text-secondary">
          Limits time an Activity Task can stay in a task queue before a Worker
          picks it up. This timeout is always non retryable, as all a retry
          would achieve is to put it back into the same queue.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <NumberInput
              id="original-schedule-to-start-timeout"
              label="Original Schedule to Start Timeout Duration"
              labelHidden
              value={originalScheduleToStartTimeout}
              disabled
              class="w-24"
            />
            <Icon name="arrow-right" />
            <Input
              id="schedule-to-start-timeout"
              label="Schedule to Start Timeout Duration"
              labelHidden
              bind:value={scheduleToStartTimeout}
              suffix="sec"
              class="w-36"
              error={isNaN(scheduleToStartTimeout)}
            />
          </div>
          <p class="text-nowrap text-secondary">
            {formatSecondsAbbreviated(scheduleToStartTimeout)}
          </p>
        </div>
      </div>
      <div>
        <Label
          for="start-to-close-timeout"
          label="Start to Close Timeout Duration"
        />
        <p class="mb-1 text-xs text-secondary">
          Maximum time an Activity is allowed to execute after being picked up
          by a Worker. This Timeout is always retryable.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <NumberInput
              id="original-start-to-close-timeout"
              label="Original Start to Close Timeout Duration"
              labelHidden
              value={originalStartToCloseTimeout}
              disabled
              class="w-24"
            />
            <Icon name="arrow-right" />
            <Input
              id="start-to-close-timeout"
              label="Start to Close Timeout Duration"
              labelHidden
              bind:value={startToCloseTimeout}
              suffix="sec"
              class="w-36"
              error={isNaN(startToCloseTimeout)}
            />
          </div>
          <p class="text-nowrap text-secondary">
            {formatSecondsAbbreviated(startToCloseTimeout)}
          </p>
        </div>
      </div>
      <div>
        <Label for="task-queue-name" label="Task Queue Name" />
        <Input
          id="task-queue-name"
          label="Task Queue Name"
          labelHidden
          bind:value={taskQueue}
          class="w-full"
        />
      </div>
      <Checkbox
        bind:checked={includeType}
        label={translate('activities.apply-to-all-activity-types', {
          type,
        })}
      />
      <div class="flex items-center justify-end gap-4">
        <Button
          type="button"
          on:click={closeCustomizationDrawer}
          variant="ghost"
          size="sm">{translate('common.cancel')}</Button
        >
        <Button type="submit" variant="primary" size="sm"
          >{translate('common.save')}</Button
        >
      </div>
      <div class="flex justify-end">
        <Button
          type="button"
          on:click={resetOriginalValues}
          variant="ghost"
          size="sm">Restore original values</Button
        >
      </div>
    </form>
  </DrawerContent>
</Drawer>
