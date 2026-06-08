<script lang="ts">
  import { get } from 'svelte/store';

  import { fieldProxy, superForm, type SuperForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Button from '$lib/holocene/button.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import DurationInput, {
    parseDuration,
    type Units,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  import { getOverlapPolicyContent } from '../constants';
  import { durationUnits } from '../constants';
  import {
    DEFAULT_CATCHUP_WINDOW,
    DEFAULT_EXECUTION_TIMEOUT,
    DEFAULT_RUN_TIMEOUT,
    DEFAULT_TASK_TIMEOUT,
  } from '../constants';
  import type { ScheduleFormData } from '../schema/form-schema';
  import {
    type SchedulePoliciesData,
    schedulePoliciesFormSchema,
  } from '../schema/policies-form-schema';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    isOpen: boolean;
  }

  let { form, isOpen = $bindable(false) }: Props = $props();

  const overlapPolicyContent = getOverlapPolicyContent();

  const pickPolicies = (data: ScheduleFormData): SchedulePoliciesData => ({
    overlapPolicy: data.overlapPolicy,
    pauseOnFailure: data.pauseOnFailure,
    pauseSchedule: data.pauseSchedule,
    catchupWindow: data.catchupWindow,
    taskTimeout: data.taskTimeout,
    runTimeout: data.runTimeout,
    executionTimeout: data.executionTimeout,
  });

  // svelte-ignore state_referenced_locally
  const policiesForm = superForm(pickPolicies(get(form)), {
    SPA: true,
    dataType: 'json',
    validators: zodClient(schedulePoliciesFormSchema),
    resetForm: false,
    onUpdate: ({ form: validated }) => {
      if (!validated.valid) return;
      form.update(($form) => ({ ...$form, ...validated.data }));
      isOpen = false;
    },
  });

  const { form: policies, errors, enhance, reset } = policiesForm;

  // Re-seed from the parent form each time the drawer opens so uncommitted
  // edits are discarded on cancel and stale errors are cleared. Runs before the
  // drawer content mounts so the inputs initialize from the seeded values.
  $effect.pre(() => {
    if (isOpen) {
      reset({ data: pickPolicies(get(form)) });
    }
  });

  const overlapPolicyStore = fieldProxy(policies, 'overlapPolicy');
  const pauseOnFailureStore = fieldProxy(policies, 'pauseOnFailure');

  const onCancel = () => {
    isOpen = false;
  };

  function getFirstWholeNumberUnit<UnitLabelT extends string>(
    duration: string,
    units: Units<UnitLabelT>,
  ): UnitLabelT | undefined {
    const secondsValue = Number(parseDuration(duration));

    if (secondsValue === 0) {
      // if 0, use last unit label
      return units.at(-1)?.label;
    }

    for (const unit of units) {
      if (Number.isInteger(secondsValue / unit.convert(1))) {
        return unit.label;
      }
    }

    return undefined;
  }
</script>

<Drawer
  dark={false}
  position="right"
  open={isOpen}
  onClick={onCancel}
  closeButtonLabel={translate('schedules.policies-drawer-close')}
  class="w-[35.5rem] max-w-full "
>
  <form use:enhance class="flex flex-col gap-4 p-4 pt-0">
    <h2 class="text-3xl font-medium">
      {translate('schedules.policies-title')}
    </h2>

    <fieldset class="flex flex-col gap-4">
      <legend class="contents">
        <hgroup>
          <h3 class="text-2xl font-medium">
            {translate('schedules.overlap-policy')}
          </h3>
          <p class="mt-1 text-secondary">
            {translate('schedules.overlap-policy-description')}
          </p>
        </hgroup>
      </legend>
      <RadioGroup name="overlap-policy" group={overlapPolicyStore}>
        {#each Object.entries(overlapPolicyContent) as [value, content] (value)}
          <RadioCard
            id="overlap-policy-{value}"
            value={value as ScheduleFormData['overlapPolicy']}
            label={[
              content.label,
              content.isDefault &&
                translate('schedules.overlap-default-suffix'),
            ]
              .filter(Boolean)
              .join(' ')}
            description={content.description}
            labelContainerClass="border-transparent p-0"
          />
        {/each}
      </RadioGroup>
    </fieldset>

    <fieldset class="flex flex-col gap-4">
      <legend class="contents">
        <hgroup>
          <h3 class="text-2xl font-medium">
            {translate('schedules.on-start-behavior')}
          </h3>
          <p class="mt-1 text-secondary">
            {translate('schedules.on-start-behavior-description')}
          </p>
        </hgroup>
      </legend>

      <div class="flex flex-col gap-2">
        <p class="font-medium">{translate('schedules.on-schedule-start')}</p>
        <Checkbox
          id="on-start-behavior-pause-schedule"
          label={translate('schedules.pause-schedule-label')}
          description={translate('schedules.pause-schedule-description')}
          checked={$policies.pauseSchedule}
          error={$errors.pauseSchedule?.[0] ?? ''}
          on:change={() => ($policies.pauseSchedule = !$policies.pauseSchedule)}
        />
      </div>
    </fieldset>

    <fieldset class="flex flex-col gap-4">
      <legend class="contents">
        <hgroup>
          <h3 class="text-2xl font-medium">
            {translate('schedules.pause-on-failure')}
          </h3>
          <p class="mt-1 text-secondary">
            {translate('schedules.pause-on-failure-description')}
          </p>
        </hgroup>
      </legend>
      <RadioGroup name="pause-on-failure" group={pauseOnFailureStore}>
        <RadioInput
          id="pause-on-failure"
          value={true}
          label={translate('schedules.pause-on-failure')}
        />
        <RadioInput
          id="do-not-pause-on-failure"
          value={false}
          label={translate('schedules.do-not-pause')}
        />
      </RadioGroup>
    </fieldset>

    <fieldset class="flex flex-col gap-4">
      <legend class="contents">
        <hgroup>
          <h3 class="text-2xl font-medium">
            {translate('schedules.catchup-window-policy')}
          </h3>
          <p class="mt-1 text-secondary">
            {translate('schedules.catchup-window-policy-description')}
          </p>
        </hgroup>
      </legend>

      <p>
        {translate('schedules.catchup-window-policy-detail')}
      </p>

      <DurationInput
        id="catchup-window-policy-duration"
        label={translate('schedules.catchup-window-label')}
        inputmode="numeric"
        bind:value={$policies.catchupWindow}
        initialUnit={getFirstWholeNumberUnit(
          $policies.catchupWindow,
          durationUnits,
        )}
        units={durationUnits}
        error={!!$errors.catchupWindow?.[0]}
        hintText={$errors.catchupWindow?.[0] ?? ''}
        class="max-w-80"
        step="any"
        min={0}
        emptyValue={DEFAULT_CATCHUP_WINDOW}
        emptyUnit={getFirstWholeNumberUnit(
          DEFAULT_CATCHUP_WINDOW,
          durationUnits,
        )}
      >
        {#snippet afterLabel()}
          <Tooltip
            topLeft
            width={250}
            text={translate('schedules.catchup-window-tooltip')}
          >
            <Icon name="square-info" class="h-3 w-3" />
          </Tooltip>
        {/snippet}
      </DurationInput>
    </fieldset>

    <hgroup>
      <h3 class="text-2xl font-medium">{translate('schedules.timeouts')}</h3>
      <p class="mt-1 text-secondary">
        {translate('schedules.timeouts-description')}
      </p>
    </hgroup>

    <DurationInput
      id="task-timeout-duration"
      label={translate('schedules.task-timeout')}
      inputmode="numeric"
      bind:value={$policies.taskTimeout}
      initialUnit={getFirstWholeNumberUnit(
        $policies.taskTimeout,
        durationUnits,
      )}
      units={durationUnits}
      error={!!$errors.taskTimeout?.[0]}
      hintText={$errors.taskTimeout?.[0] ?? ''}
      class="max-w-80"
      min={0}
      emptyValue={DEFAULT_TASK_TIMEOUT}
      emptyUnit={getFirstWholeNumberUnit(DEFAULT_TASK_TIMEOUT, durationUnits)}
    />

    <DurationInput
      id="run-timeout-duration"
      label={translate('schedules.run-timeout')}
      inputmode="numeric"
      bind:value={$policies.runTimeout}
      initialUnit={getFirstWholeNumberUnit($policies.runTimeout, durationUnits)}
      units={durationUnits}
      error={!!$errors.runTimeout?.[0]}
      hintText={$errors.runTimeout?.[0] ?? ''}
      class="max-w-80"
      min={0}
      emptyValue={DEFAULT_RUN_TIMEOUT}
      emptyUnit={getFirstWholeNumberUnit(DEFAULT_RUN_TIMEOUT, durationUnits)}
    />

    <DurationInput
      id="execution-timeout-duration"
      label={translate('schedules.execution-timeout')}
      inputmode="numeric"
      bind:value={$policies.executionTimeout}
      initialUnit={getFirstWholeNumberUnit(
        $policies.executionTimeout,
        durationUnits,
      )}
      units={durationUnits}
      error={!!$errors.executionTimeout?.[0]}
      hintText={$errors.executionTimeout?.[0] ?? ''}
      class="max-w-80"
      min={0}
      emptyValue={DEFAULT_EXECUTION_TIMEOUT}
      emptyUnit={getFirstWholeNumberUnit(
        DEFAULT_EXECUTION_TIMEOUT,
        durationUnits,
      )}
    />

    <div class="ml-auto mt-2 flex gap-4">
      <Button variant="secondary" on:click={onCancel}
        >{translate('common.cancel')}</Button
      >
      <Button variant="primary" type="submit"
        >{translate('schedules.update-policies')}</Button
      >
    </div>
  </form>
</Drawer>
