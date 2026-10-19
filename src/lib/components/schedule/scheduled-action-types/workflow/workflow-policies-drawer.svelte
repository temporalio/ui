<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Button from '$lib/holocene/button.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import DurationInput, {
    getFirstWholeNumberUnit,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import {
    type FormWorkflowPolicies,
    formWorkflowPoliciesSchema,
  } from './schema';
  import { DEFAULT_TASK_TIMEOUT, durationUnits } from '../../constants';

  interface Props {
    policies: FormWorkflowPolicies;
    onUpdate: (policies: FormWorkflowPolicies) => void;
    isOpen: boolean;
  }

  let { policies, onUpdate, isOpen = $bindable(false) }: Props = $props();

  const pickPolicies = (
    policies: FormWorkflowPolicies,
  ): FormWorkflowPolicies => ({
    taskTimeout: policies.taskTimeout,
    runTimeout: policies.runTimeout,
    executionTimeout: policies.executionTimeout,
    keepOriginalWorkflowId: policies.keepOriginalWorkflowId,
  });

  const policiesForm = superForm(
    untrack(() => pickPolicies(policies)),
    {
      SPA: true,
      dataType: 'json',
      validators: zodClient(formWorkflowPoliciesSchema),
      resetForm: false,
      applyAction: false,
      invalidateAll: false,
      onUpdate: ({ form: validated }) => {
        if (!validated.valid) return;
        onUpdate(validated.data);
        isOpen = false;
      },
    },
  );

  const { form: workflowPolicies, errors, enhance, reset } = policiesForm;

  $effect.pre(() => {
    if (isOpen) {
      untrack(() => reset({ data: pickPolicies(policies) }));
    }
  });

  let taskTimeoutResetKey = $state(0);

  const snapTaskTimeoutToDefault = (
    event: FocusEvent & { currentTarget: HTMLInputElement },
  ) => {
    if (!event.currentTarget.value) {
      $workflowPolicies.taskTimeout = DEFAULT_TASK_TIMEOUT;
      taskTimeoutResetKey += 1;
    }
  };

  const onCancel = () => {
    isOpen = false;
  };
</script>

<Drawer
  dark={false}
  position="right"
  open={isOpen}
  onClick={onCancel}
  closeButtonLabel={translate('schedules.workflow-policies-drawer-close')}
  class="w-[35.5rem] max-w-full"
>
  <form use:enhance class="flex flex-col gap-4 p-4 pt-0">
    <h2 class="text-3xl font-medium">
      {translate('schedules.workflow-policies-title')}
    </h2>

    <hgroup>
      <h3 class="text-2xl font-medium">{translate('schedules.timeouts')}</h3>
      <p class="mt-1 text-secondary">
        {translate('schedules.timeouts-description')}
      </p>
    </hgroup>

    {#key taskTimeoutResetKey}
      <DurationInput
        id="task-timeout-duration"
        label={translate('schedules.task-timeout')}
        inputmode="numeric"
        bind:value={$workflowPolicies.taskTimeout}
        initialUnit={getFirstWholeNumberUnit(
          $workflowPolicies.taskTimeout,
          durationUnits,
          'second(s)',
        )}
        units={durationUnits}
        error={!!$errors.taskTimeout?.[0]}
        hintText={$errors.taskTimeout?.[0] ?? ''}
        class="max-w-80"
        min={0}
        onblur={snapTaskTimeoutToDefault}
      />
    {/key}

    <DurationInput
      id="run-timeout-duration"
      label={translate('schedules.run-timeout')}
      inputmode="numeric"
      bind:value={$workflowPolicies.runTimeout}
      initialUnit={getFirstWholeNumberUnit(
        $workflowPolicies.runTimeout,
        durationUnits,
        'second(s)',
      )}
      units={durationUnits}
      error={!!$errors.runTimeout?.[0]}
      hintText={$errors.runTimeout?.[0] ?? ''}
      class="max-w-80"
      min={0}
    />

    <DurationInput
      id="execution-timeout-duration"
      label={translate('schedules.execution-timeout')}
      inputmode="numeric"
      bind:value={$workflowPolicies.executionTimeout}
      initialUnit={getFirstWholeNumberUnit(
        $workflowPolicies.executionTimeout,
        durationUnits,
        'second(s)',
      )}
      units={durationUnits}
      error={!!$errors.executionTimeout?.[0]}
      hintText={$errors.executionTimeout?.[0] ?? ''}
      class="max-w-80"
      min={0}
    />

    <div class="ml-auto mt-2 flex gap-4">
      <Button variant="secondary" onclick={onCancel}
        >{translate('common.cancel')}</Button
      >
      <Button variant="primary" type="submit"
        >{translate('schedules.update-policies')}</Button
      >
    </div>
  </form>
</Drawer>
