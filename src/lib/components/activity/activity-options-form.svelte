<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import z from 'zod/v3';

  import Button from '$lib/holocene/button.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import DurationInput, {
    DAYS,
    DEFAULT_UNITS,
    parseDuration,
    SECONDS,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
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

  const toStringValue = (value: unknown): string =>
    value === null || value === undefined ? '' : String(value);

  const isWholeNumber = (value: string): boolean =>
    value.trim() !== '' &&
    Number.isInteger(Number(value)) &&
    Number(value) >= 0;
  const isBackoffCoefficient = (value: string): boolean =>
    value.trim() !== '' && Number(value) >= 1;
  const isPositiveDuration = (value: string | undefined): boolean => {
    const seconds = Number(parseDuration(value ?? ''));
    return !isNaN(seconds) && seconds > 0;
  };

  const schema = z
    .object({
      taskQueue: z
        .string()
        .trim()
        .min(1, {
          message: translate('standalone-activities.form-task-queue-required'),
        }),
      scheduleToCloseTimeout: z.string().default(''),
      scheduleToStartTimeout: z.string().default(''),
      startToCloseTimeout: z.string().default(''),
      heartbeatTimeout: z.string().default(''),
      initialInterval: z.string().default(''),
      maximumInterval: z.string().default(''),
      startDelay: z.string().default(''),
      maximumAttempts: z.preprocess(
        toStringValue,
        z.string().refine(isWholeNumber, {
          message: translate('activities.retry-max-attempts-error'),
        }),
      ),
      backoffCoefficient: z.preprocess(
        toStringValue,
        z.string().refine(isBackoffCoefficient, {
          message: translate('activities.retry-backoff-coefficient-error'),
        }),
      ),
    })
    .superRefine((data, context) => {
      if (
        !isPositiveDuration(data.startToCloseTimeout) &&
        !isPositiveDuration(data.scheduleToCloseTimeout)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startToCloseTimeout'],
          message: translate('standalone-activities.form-timeout-required'),
        });
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scheduleToCloseTimeout'],
          message: translate('standalone-activities.form-timeout-required'),
        });
      }
    });

  // Seeded from activity.activityOptions once when the drawer opens. These must
  // NOT reset reactively if the activity prop changes while the user is
  // mid-edit — untrack() captures the initial values intentionally.
  const initialData: z.infer<typeof schema> = untrack(() => ({
    taskQueue: initialOptions?.taskQueue?.name ?? '',
    scheduleToCloseTimeout: String(
      initialOptions?.scheduleToCloseTimeout ?? '',
    ),
    scheduleToStartTimeout: String(
      initialOptions?.scheduleToStartTimeout ?? '',
    ),
    startToCloseTimeout: String(initialOptions?.startToCloseTimeout ?? ''),
    heartbeatTimeout: String(initialOptions?.heartbeatTimeout ?? ''),
    initialInterval: String(initialOptions?.retryPolicy?.initialInterval ?? ''),
    maximumInterval: String(initialOptions?.retryPolicy?.maximumInterval ?? ''),
    startDelay: String(initialOptions?.startDelay ?? ''),
    maximumAttempts: String(initialOptions?.retryPolicy?.maximumAttempts ?? 0),
    backoffCoefficient: String(
      initialOptions?.retryPolicy?.backoffCoefficient || 2,
    ),
  }));

  const toActivityOptions = (data: z.infer<typeof schema>) =>
    ({
      taskQueue: { name: data.taskQueue },
      ...(data.scheduleToCloseTimeout && {
        scheduleToCloseTimeout: data.scheduleToCloseTimeout,
      }),
      ...(data.scheduleToStartTimeout && {
        scheduleToStartTimeout: data.scheduleToStartTimeout,
      }),
      ...(data.startToCloseTimeout && {
        startToCloseTimeout: data.startToCloseTimeout,
      }),
      ...(data.heartbeatTimeout && {
        heartbeatTimeout: data.heartbeatTimeout,
      }),
      ...(data.startDelay !== initialData.startDelay && {
        startDelay: data.startDelay || '0s',
      }),
      retryPolicy: {
        maximumAttempts: Number(data.maximumAttempts),
        backoffCoefficient: Number(data.backoffCoefficient),
        ...(data.initialInterval && { initialInterval: data.initialInterval }),
        ...(data.maximumInterval && { maximumInterval: data.maximumInterval }),
      },
    }) as unknown as ActivityOptions;

  const closeCustomizationDrawer = () => {
    open = false;
  };

  const { form, errors, enhance } = superForm(initialData, {
    SPA: true,
    dataType: 'json',
    resetForm: false,
    invalidateAll: false,
    validators: zodClient(schema),
    onUpdate: async ({ form }) => {
      if (!form.valid) return;

      try {
        await onSave(toActivityOptions(form.data));
        toaster.push({
          variant: 'success',
          message: translate('activities.update-options-success', {
            activityId,
          }),
        });
      } catch (error) {
        console.error('Error updating activity options:', error);
        toaster.push({
          variant: 'error',
          message: translate('activities.update-options-error', {
            activityId,
            error: has(error, 'message')
              ? String(error.message)
              : translate('common.unknown-error'),
          }),
          duration: 5000,
        });
      } finally {
        closeCustomizationDrawer();
      }
    },
  });
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
    <form use:enhance novalidate class="flex flex-col gap-4">
      <div>
        <Label
          for="maximum-attempts"
          label={translate('activities.retry-max-attempts')}
        />
        <p class="mb-1 text-xs text-secondary">
          {translate('activities.retry-max-attempts-description')}
        </p>
        <Input
          id="maximum-attempts"
          type="number"
          label={translate('activities.retry-max-attempts')}
          labelHidden
          bind:value={$form.maximumAttempts}
          min={0}
          error={!!$errors.maximumAttempts}
          hintText={$errors.maximumAttempts?.[0] ?? ''}
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
        <Input
          id="retry-backoff-coefficient"
          type="number"
          label={translate('activities.retry-backoff-coefficient')}
          labelHidden
          bind:value={$form.backoffCoefficient}
          step={0.01}
          min={1}
          error={!!$errors.backoffCoefficient}
          hintText={$errors.backoffCoefficient?.[0] ?? ''}
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
        bind:value={$form.initialInterval}
        initialUnit={initialTimeoutUnit(initialData.initialInterval)}
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
        bind:value={$form.scheduleToStartTimeout}
        initialUnit={initialTimeoutUnit(initialData.scheduleToStartTimeout)}
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
        required={!isPositiveDuration($form.startToCloseTimeout)}
        bind:value={$form.scheduleToCloseTimeout}
        initialUnit={initialTimeoutUnit(initialData.scheduleToCloseTimeout)}
        units={TIMEOUT_UNITS}
        min={0}
        error={!!$errors.scheduleToCloseTimeout}
        hintText={$errors.scheduleToCloseTimeout?.[0] ?? ''}
        class="max-w-80"
      />
      <DurationInput
        id="start-to-close-timeout"
        label={translate('activities.start-to-close-timeout-duration')}
        hintTextAbove={translate(
          'activities.start-to-close-timeout-duration-description',
        )}
        inputmode="numeric"
        required={!isPositiveDuration($form.scheduleToCloseTimeout)}
        bind:value={$form.startToCloseTimeout}
        initialUnit={initialTimeoutUnit(initialData.startToCloseTimeout)}
        units={TIMEOUT_UNITS}
        min={0}
        error={!!$errors.startToCloseTimeout}
        hintText={$errors.startToCloseTimeout?.[0] ?? ''}
        class="max-w-80"
      />
      <DurationInput
        id="heartbeat-timeout"
        label={translate('activities.heartbeat-timeout-duration')}
        hintTextAbove={translate(
          'activities.heartbeat-timeout-duration-description',
        )}
        inputmode="numeric"
        bind:value={$form.heartbeatTimeout}
        initialUnit={initialTimeoutUnit(initialData.heartbeatTimeout)}
        units={TIMEOUT_UNITS}
        min={0}
        class="max-w-80"
      />
      {#if namespace}
        <StartDelayGuard {namespace}>
          {#if delayed}
            <DurationInput
              id="start-delay"
              label={translate('standalone-activities.form-start-delay-label')}
              hintTextAbove={translate(
                'standalone-activities.form-start-delay-hint',
              )}
              inputmode="numeric"
              bind:value={$form.startDelay}
              initialUnit={SECONDS.label}
              units={[...DEFAULT_UNITS, DAYS]}
              min={0}
              class="max-w-80"
            />
          {/if}
        </StartDelayGuard>
      {/if}
      <div>
        <Input
          id="task-queue-name"
          label={translate('activities.task-queue-name')}
          required
          bind:value={$form.taskQueue}
          error={!!$errors.taskQueue}
          hintText={$errors.taskQueue?.[0] ?? ''}
          class="w-full"
        />
      </div>
      <div class="flex items-center justify-end gap-4">
        <Button
          type="button"
          onclick={closeCustomizationDrawer}
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
