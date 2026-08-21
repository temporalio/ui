<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import z from 'zod/v3';

  import Message from '$lib/components/form/message.svelte';
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
  import NumberInput from '$lib/holocene/input/number-input.svelte';
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
      scheduleToCloseTimeout: z.string(),
      scheduleToStartTimeout: z.string(),
      startToCloseTimeout: z.string(),
      heartbeatTimeout: z.string(),
      initialInterval: z.string(),
      maximumInterval: z.string(),
      startDelay: z.string(),
      maximumAttempts: z
        .number({
          invalid_type_error: translate('activities.retry-max-attempts-error'),
        })
        .int(translate('activities.retry-max-attempts-error'))
        .min(0, translate('activities.retry-max-attempts-error')),
      backoffCoefficient: z
        .number({
          invalid_type_error: translate(
            'activities.retry-backoff-coefficient-error',
          ),
        })
        .min(1, translate('activities.retry-backoff-coefficient-error')),
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
    maximumAttempts: initialOptions?.retryPolicy?.maximumAttempts ?? 0,
    backoffCoefficient: initialOptions?.retryPolicy?.backoffCoefficient || 2,
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
        maximumAttempts: data.maximumAttempts,
        backoffCoefficient: data.backoffCoefficient,
        ...(data.initialInterval && { initialInterval: data.initialInterval }),
        ...(data.maximumInterval && { maximumInterval: data.maximumInterval }),
      },
    }) as unknown as ActivityOptions;

  const closeCustomizationDrawer = () => {
    open = false;
  };

  const { form, errors, message, enhance } = superForm(initialData, {
    SPA: true,
    dataType: 'json',
    resetForm: false,
    invalidateAll: false,
    validators: zodClient(schema),
    onUpdate: async ({ form, cancel }) => {
      if (!form.valid) return;

      try {
        await onSave(toActivityOptions(form.data));
        toaster.push({
          variant: 'success',
          message: translate('activities.update-options-success', {
            activityId,
          }),
        });
        closeCustomizationDrawer();
      } catch (error) {
        message.set({
          intent: 'error',
          title: translate('common.error-occurred'),
          text: translate('activities.update-options-error', {
            activityId,
            error: has(error, 'message')
              ? String(error.message)
              : translate('common.unknown-error'),
          }),
        });
        cancel();
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
        <p class="mb-1 text-xs text-io-content-secondary">
          {translate('activities.retry-max-attempts-description')}
        </p>
        <NumberInput
          id="maximum-attempts"
          label={translate('activities.retry-max-attempts')}
          labelHidden
          bind:value={$form.maximumAttempts}
          min={0}
          invalid={!!$errors.maximumAttempts?.[0]}
          hintText={$errors.maximumAttempts?.[0] ?? ''}
          class="w-24"
        />
      </div>
      <div>
        <Label
          for="retry-backoff-coefficient"
          label={translate('activities.retry-backoff-coefficient')}
        />
        <p class="mb-1 text-xs text-io-content-secondary">
          {translate('activities.retry-backoff-coefficient-description')}
        </p>
        <NumberInput
          id="retry-backoff-coefficient"
          label={translate('activities.retry-backoff-coefficient')}
          labelHidden
          bind:value={$form.backoffCoefficient}
          step={0.01}
          min={1}
          invalid={!!$errors.backoffCoefficient?.[0]}
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
        error={!!$errors.scheduleToCloseTimeout?.[0]}
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
        error={!!$errors.startToCloseTimeout?.[0]}
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
          error={!!$errors.taskQueue?.[0]}
          hintText={$errors.taskQueue?.[0] ?? ''}
          class="w-full"
        />
      </div>
      <Message value={$message} />
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
