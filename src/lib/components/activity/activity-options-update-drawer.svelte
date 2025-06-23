<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import Button from '$lib/holocene/button.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { translate } from '$lib/i18n/translate';
  import { updateActivityOptions } from '$lib/services/workflow-activities-service';
  import { toaster } from '$lib/stores/toaster';
  import { refresh } from '$lib/stores/workflow-run';
  import type { ActivityOptions } from '$lib/types';
  import type { PendingActivity } from '$lib/types/events';

  type Props = {
    open: boolean;
    namespace: string;
    execution: WorkflowExecution;
    activity: PendingActivity;
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

  let { open = $bindable(), namespace, execution, activity }: Props = $props();
  let { activityId: id, activityType: type } = $derived(activity);
  let taskQueue = $state(activity.activityOptions?.taskQueue?.name);
  let scheduleToCloseTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.scheduleToCloseTimeout),
  );
  let scheduleToStartTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.scheduleToStartTimeout),
  );
  let startToCloseTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.startToCloseTimeout),
  );
  let heartbeatTimeout = $state(
    fromDurationToNumber(activity?.activityOptions?.heartbeatTimeout),
  );
  let maximumAttempts = $state(
    activity?.activityOptions?.retryPolicy?.maximumAttempts,
  );
  let backoffCoefficient = $state(
    activity?.activityOptions?.retryPolicy?.backoffCoefficient,
  );
  let initialInterval = $state(
    fromDurationToNumber(
      activity?.activityOptions?.retryPolicy?.initialInterval,
    ),
  );
  let maximumInterval = $state(
    fromDurationToNumber(
      activity?.activityOptions?.retryPolicy?.maximumInterval,
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
      // TODO: Get original values from the activity scheduled event
      await updateActivityOptions({
        namespace,
        execution,
        id: includeType ? undefined : id,
        type: includeType ? type : undefined,
        activityOptions: { ...activity.activityOptions },
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
      <Input
        id="heartbeat-timeout"
        label="Heartbeat Timeout Duration"
        bind:value={heartbeatTimeout}
        suffix="seconds"
        class="w-fit"
      />
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
        <NumberInput
          id="retry-backoff-coefficient"
          label="Retry Backoff Coefficient"
          labelHidden
          bind:value={backoffCoefficient}
          step={0.01}
          min={1}
        />
      </div>
      <Input
        id="retry-initial-interval"
        label="Retry Initial Interval Duration"
        bind:value={initialInterval}
        suffix="seconds"
        class="w-fit"
      />
      <NumberInput
        id="maximum-attempts"
        label="Retry Maximum Attempts"
        bind:value={maximumAttempts}
      />
      <div>
        <Label
          for="schedule-to-close-timeout"
          label="Schedule to Close Timeout Duration"
        />
        <p class="mb-1 text-xs text-secondary">
          Limits time an activity task can stay in a task queue before a worker
          picks it up.
        </p>
        <Input
          id="schedule-to-close-timeout"
          label="Schedule to Close Timeout Duration"
          labelHidden
          bind:value={scheduleToCloseTimeout}
          suffix="seconds"
          class="w-fit"
        />
      </div>
      <Input
        id="schedule-to-start-timeout"
        label="Schedule to Start Timeout Duration"
        bind:value={scheduleToStartTimeout}
        suffix="seconds"
        class="w-fit"
      />
      <Input
        id="start-to-close-timeout"
        label="Start to Close Timeout Duration"
        bind:value={startToCloseTimeout}
        suffix="seconds"
        class="w-fit"
      />
      <div>
        <Label for="task-queue-name" label="Task Queue Name" />
        <p class="mb-1 text-xs text-secondary">
          Indicates how long the caller is willing to wait for an activity
          completion. Limits how long retries will be attempted.
        </p>
        <Input
          id="task-queue-name"
          label="Task Queue Name"
          labelHidden
          bind:value={taskQueue}
          class="w-fit"
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
