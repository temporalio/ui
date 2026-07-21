<script lang="ts">
  import { untrack } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import DurationInput, {
    DAYS,
    DEFAULT_UNITS,
    SECONDS,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    initialTimeoutUnit,
    TIMEOUT_UNITS,
  } from '$lib/services/standalone-activities';
  import { toaster } from '$lib/stores/toaster';
  import type { ActivityOptions, DescribeNamespaceResponse } from '$lib/types';
  import { has } from '$lib/utilities/has';

  import StartDelayGuard from '../standalone-activities/start-delay-guard.svelte';

  type Props = {
    open: boolean;
    activityId: string;
    activityOptions: ActivityOptions | undefined;
    onSave: (activityOptions: ActivityOptions) => Promise<void>;
    namespace?: DescribeNamespaceResponse;
    delayed?: boolean;
  };

  let {
    open = $bindable(),
    activityId,
    activityOptions: initialOptions,
    onSave,
    namespace,
    delayed = false,
  }: Props = $props();

  // Form fields are seeded from activity.activityOptions once when the drawer
  // opens. They must NOT reset reactively if the activity prop changes while
  // the user is mid-edit — untrack() captures the initial value intentionally.
  let taskQueue = $state(untrack(() => initialOptions?.taskQueue?.name ?? ''));
  let scheduleToCloseTimeout = $state(
    untrack(() => String(initialOptions?.scheduleToCloseTimeout ?? '')),
  );
  let scheduleToStartTimeout = $state(
    untrack(() => String(initialOptions?.scheduleToStartTimeout ?? '')),
  );
  let startToCloseTimeout = $state(
    untrack(() => String(initialOptions?.startToCloseTimeout ?? '')),
  );
  let heartbeatTimeout = $state(
    untrack(() => String(initialOptions?.heartbeatTimeout ?? '')),
  );
  let maximumAttempts = $state(
    untrack(() => initialOptions?.retryPolicy?.maximumAttempts ?? 0),
  );
  let backoffCoefficient = $state(
    untrack(() => initialOptions?.retryPolicy?.backoffCoefficient ?? 0),
  );
  let initialInterval = $state(
    untrack(() => String(initialOptions?.retryPolicy?.initialInterval ?? '')),
  );
  let maximumInterval = $state(
    untrack(() => String(initialOptions?.retryPolicy?.maximumInterval ?? '')),
  );
  let startDelay = $state(
    untrack(() => String(initialOptions?.startDelay ?? '')),
  );

  const activityOptions = $derived({
    taskQueue: { name: taskQueue },
    scheduleToCloseTimeout: scheduleToCloseTimeout || undefined,
    scheduleToStartTimeout: scheduleToStartTimeout || undefined,
    startToCloseTimeout: startToCloseTimeout || undefined,
    heartbeatTimeout: heartbeatTimeout || undefined,
    startDelay: startDelay || undefined,
    retryPolicy: {
      maximumAttempts,
      backoffCoefficient,
      initialInterval: initialInterval || undefined,
      maximumInterval: maximumInterval || undefined,
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
        <Label
          for="maximum-attempts"
          label={translate('activities.retry-max-attempts')}
        />
        <p class="mb-1 text-xs text-secondary">
          {translate('activities.retry-max-attempts-description')}
        </p>
        <NumberInput
          id="maximum-attempts"
          label={translate('activities.retry-max-attempts')}
          labelHidden
          bind:value={maximumAttempts}
          class="w-24"
        />
      </div>
      <div>
        <Label
          for="retry-backoff-coefficient"
          label={translate('activities.retry-backoff-coefficient')}
        />
        <p class="mb-1 text-xs text-secondary">
          {translate('activities.retry-backoff-coefficient-description')}
        </p>
        <NumberInput
          id="retry-backoff-coefficient"
          label={translate('activities.retry-backoff-coefficient')}
          labelHidden
          bind:value={backoffCoefficient}
          step={0.01}
          min={1}
          class="w-24"
        />
      </div>
      <DurationInput
        id="retry-initial-interval"
        label={translate('activities.retry-initial-interval-duration')}
        hintTextAbove={translate(
          'activities.retry-initial-interval-duration-description',
        )}
        inputmode="numeric"
        bind:value={initialInterval}
        initialUnit={initialTimeoutUnit(initialInterval)}
        units={TIMEOUT_UNITS}
        min={0}
        class="max-w-80"
      />
      <DurationInput
        id="schedule-to-start-timeout"
        label={translate('activities.schedule-to-start-timeout-duration')}
        hintTextAbove={translate(
          'activities.schedule-to-start-timeout-duration-description',
        )}
        inputmode="numeric"
        bind:value={scheduleToStartTimeout}
        initialUnit={initialTimeoutUnit(scheduleToStartTimeout)}
        units={TIMEOUT_UNITS}
        min={0}
        class="max-w-80"
      />
      <DurationInput
        id="schedule-to-close-timeout"
        label={translate('activities.schedule-to-close-timeout-duration')}
        hintTextAbove={translate(
          'activities.schedule-to-close-timeout-duration-description',
        )}
        inputmode="numeric"
        bind:value={scheduleToCloseTimeout}
        initialUnit={initialTimeoutUnit(scheduleToCloseTimeout)}
        units={TIMEOUT_UNITS}
        min={0}
        class="max-w-80"
      />
      <DurationInput
        id="start-to-close-timeout"
        label={translate('activities.start-to-close-timeout-duration')}
        hintTextAbove={translate(
          'activities.start-to-close-timeout-duration-description',
        )}
        inputmode="numeric"
        bind:value={startToCloseTimeout}
        initialUnit={initialTimeoutUnit(startToCloseTimeout)}
        units={TIMEOUT_UNITS}
        min={0}
        class="max-w-80"
      />
      <DurationInput
        id="heartbeat-timeout"
        label={translate('activities.heartbeat-timeout-duration')}
        hintTextAbove={translate(
          'activities.heartbeat-timeout-duration-description',
        )}
        inputmode="numeric"
        bind:value={heartbeatTimeout}
        initialUnit={initialTimeoutUnit(heartbeatTimeout)}
        units={TIMEOUT_UNITS}
        min={0}
        class="max-w-80"
      />
      {#if namespace}
        <StartDelayGuard {namespace}>
          <Tooltip
            text={translate(
              'standalone-activities.form-start-delay-disabled-hint',
            )}
            width={250}
            bottomLeft
            hide={delayed}
          >
            <DurationInput
              id="start-delay"
              label={translate('standalone-activities.form-start-delay-label')}
              hintTextAbove={translate(
                'standalone-activities.form-start-delay-hint',
              )}
              inputmode="numeric"
              bind:value={startDelay}
              initialUnit={SECONDS.label}
              units={[...DEFAULT_UNITS, DAYS]}
              min={0}
              disabled={!delayed}
              class="max-w-80"
            />
          </Tooltip>
        </StartDelayGuard>
      {/if}
      <div>
        <Label
          for="task-queue-name"
          label={translate('activities.task-queue-name')}
        />
        <Input
          id="task-queue-name"
          label={translate('activities.task-queue-name')}
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
