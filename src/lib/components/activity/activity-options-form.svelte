<script lang="ts">
  import { untrack } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { translate } from '$lib/i18n/translate';
  import { toaster } from '$lib/stores/toaster';
  import type { ActivityOptions } from '$lib/types';
  import {
    formatSecondsAbbreviated,
    fromDurationToNumber,
    fromNumberToDuration,
  } from '$lib/utilities/format-time';
  import { has } from '$lib/utilities/has';

  type Props = {
    open: boolean;
    activityId: string;
    activityOptions: ActivityOptions | undefined;
    onSave: (activityOptions: ActivityOptions) => Promise<void>;
  };

  let {
    open = $bindable(),
    activityId,
    activityOptions: initialOptions,
    onSave,
  }: Props = $props();

  // Form fields are seeded from activity.activityOptions once when the drawer
  // opens. They must NOT reset reactively if the activity prop changes while
  // the user is mid-edit — untrack() captures the initial value intentionally.
  let taskQueue = $state(untrack(() => initialOptions?.taskQueue?.name ?? ''));
  let scheduleToCloseTimeout = $state(
    untrack(() =>
      fromDurationToNumber(String(initialOptions?.scheduleToCloseTimeout)),
    ),
  );
  let scheduleToStartTimeout = $state(
    untrack(() =>
      fromDurationToNumber(String(initialOptions?.scheduleToStartTimeout)),
    ),
  );
  let startToCloseTimeout = $state(
    untrack(() =>
      fromDurationToNumber(String(initialOptions?.startToCloseTimeout)),
    ),
  );
  let heartbeatTimeout = $state(
    untrack(() =>
      fromDurationToNumber(String(initialOptions?.heartbeatTimeout)),
    ),
  );
  let maximumAttempts = $state(
    untrack(() => initialOptions?.retryPolicy?.maximumAttempts ?? 0),
  );
  let backoffCoefficient = $state(
    untrack(() => initialOptions?.retryPolicy?.backoffCoefficient ?? 0),
  );
  let initialInterval = $state(
    untrack(() =>
      fromDurationToNumber(
        String(initialOptions?.retryPolicy?.initialInterval),
      ),
    ),
  );
  let maximumInterval = $state(
    untrack(() =>
      fromDurationToNumber(
        String(initialOptions?.retryPolicy?.maximumInterval),
      ),
    ),
  );

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

  const onUpdate = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      await onSave(activityOptions);
      toaster.push({
        variant: 'success',
        message: `Options for Activity ${activityId} have been updated.`,
      });
    } catch (error) {
      console.error('Error updating activity options:', error);
      toaster.push({
        variant: 'error',
        message: `Options for Activity ${activityId} have been failed to update: ${has(error, 'message') ? error.message : translate('common.unknown-error')}`,
        duration: 5000,
      });
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
  class="w-screen sm:w-[480px]"
>
  <DrawerContent title="Update Activity {activityId}">
    <form onsubmit={onUpdate} class="flex flex-col gap-4">
      <div>
        <Label for="heartbeat-timeout" label="Heartbeat Timeout Duration" />
        <p class="mb-1 text-xs text-secondary">
          Maximum permitted time between successful Worker Heartbeats.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <Input
            id="heartbeat-timeout"
            label="Heartbeat Timeout Duration"
            labelHidden
            bind:value={heartbeatTimeout}
            suffix="sec"
            class="w-36"
            error={isNaN(Number(heartbeatTimeout))}
          />
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
          <Input
            id="retry-initial-interval"
            label="Retry Initial Interval Duration"
            labelHidden
            bind:value={initialInterval}
            suffix="sec"
            class="w-36"
            error={isNaN(Number(initialInterval))}
          />
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
        <NumberInput
          id="maximum-attempts"
          label="Retry Maximum Attempts"
          labelHidden
          bind:value={maximumAttempts}
          class="w-24"
        />
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
          <Input
            id="schedule-to-close-timeout"
            label="Schedule to Close Timeout Duration"
            labelHidden
            bind:value={scheduleToCloseTimeout}
            suffix="sec"
            class="w-36"
            error={isNaN(Number(scheduleToCloseTimeout))}
          />
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
          <Input
            id="schedule-to-start-timeout"
            label="Schedule to Start Timeout Duration"
            labelHidden
            bind:value={scheduleToStartTimeout}
            suffix="sec"
            class="w-36"
            error={isNaN(Number(scheduleToStartTimeout))}
          />
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
          <Input
            id="start-to-close-timeout"
            label="Start to Close Timeout Duration"
            labelHidden
            bind:value={startToCloseTimeout}
            suffix="sec"
            class="w-36"
            error={isNaN(Number(startToCloseTimeout))}
          />
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
    </form>
  </DrawerContent>
</Drawer>
