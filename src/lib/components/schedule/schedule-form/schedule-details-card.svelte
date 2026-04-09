<script lang="ts">
  import { get, type Writable, writable } from 'svelte/store';

  import Card from '$lib/holocene/card.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EndDateType } from '$lib/types/schedule';
  import type { FullSchedule } from '$lib/types/schedule';
  import { formatOffset, TimezoneOptions } from '$lib/utilities/timezone';

  import type { ScheduleFormData } from './schema';

  import ScheduleInputPayload from './schedule-input-payload.svelte';

  interface Props {
    form: Writable<ScheduleFormData>;
    errors: Record<string, string[] | undefined> | Record<string, unknown>;
    schedule?: FullSchedule | null;
  }

  let { form, errors, schedule = null }: Props = $props();

  const endDateType = $derived($form.endDateType);

  const timezoneComboboxOptions = $derived.by(() => {
    const opts = [{ label: 'UTC', value: 'UTC' }];
    for (const tz of TimezoneOptions) {
      const offsetStr = formatOffset(tz.offset);
      opts.push({
        label: `${tz.label} (${tz.abbr}) ${offsetStr}`,
        value: tz.zones?.[0] ?? tz.label,
      });
    }
    return opts;
  });

  const endDateTypeStore: Writable<EndDateType> = writable($form.endDateType);
  $effect(() => {
    if (get(endDateTypeStore) !== $form.endDateType)
      endDateTypeStore.set($form.endDateType);
  });
  $effect(() => {
    const val = $endDateTypeStore;
    if (val !== $form.endDateType) $form.endDateType = val;
  });

  const startDateValue = $derived(
    $form.startDate ? new Date($form.startDate) : new Date(),
  );
  const endDateValue = $derived(
    $form.endDate ? new Date($form.endDate) : new Date(),
  );

  const onStartDateChange = (e: CustomEvent<Date>) => {
    $form.startDate = e.detail.toISOString();
  };

  const onEndDateChange = (e: CustomEvent<Date>) => {
    $form.endDate = e.detail.toISOString();
  };
</script>

<Card class="w-full">
  <h2 class="text-lg font-semibold">Schedule Details</h2>
  <div class="mt-4 flex flex-col gap-2">
    <Input
      id="name"
      bind:value={$form.name}
      data-testid="schedule-name-input"
      label="Schedule Name"
      error={!!errors.name?.[0]}
      hintText={errors.name?.[0]}
      maxLength={232}
      disabled={Boolean(schedule)}
      required
    />
    <Input
      id="workflowType"
      bind:value={$form.workflowType}
      data-testid="schedule-type-input"
      label="Workflow Type"
      error={!!errors.workflowType?.[0]}
      hintText={errors.workflowType?.[0]}
      required
    />
    <Input
      id="workflowId"
      bind:value={$form.workflowId}
      data-testid="schedule-workflow-id-input"
      label="Workflow ID"
      hintText={errors.workflowId?.[0] ||
        'The unique ID of the Workflow Execution. If left blank, we will generate a unique ID.'}
      error={!!errors.workflowId?.[0]}
    />
    <Input
      id="taskQueue"
      bind:value={$form.taskQueue}
      data-testid="schedule-task-queue-input"
      label="Task Queue"
      error={!!errors.taskQueue?.[0]}
      hintText={errors.taskQueue?.[0]}
      required
    />

    <DatePicker
      label="Schedule Start Date"
      selected={startDateValue}
      todayLabel={translate('common.today')}
      closeLabel={translate('common.close')}
      clearLabel={translate('common.clear-input-button-label')}
      on:datechange={onStartDateChange}
    />

    <RadioGroup
      name="endDateType"
      group={endDateTypeStore}
      description="End Date"
    >
      <RadioInput id="end-date-never" value="never" label="Never" />
      <div class="flex h-8 items-center gap-3">
        <RadioInput id="end-date-on" value="on" label="On" />
        {#if endDateType === 'on'}
          <DatePicker
            label="End date"
            labelHidden
            selected={endDateValue}
            todayLabel={translate('common.today')}
            closeLabel={translate('common.close')}
            clearLabel={translate('common.clear-input-button-label')}
            on:datechange={onEndDateChange}
          />
        {/if}
      </div>
      <div class="flex h-8 items-center gap-3">
        <RadioInput id="end-date-after" value="after" label="After" />
        {#if endDateType === 'after'}
          <NumberInput
            id="endAfterOccurrences"
            label="Occurrences"
            labelHidden
            bind:value={$form.endAfterOccurrences}
            placeholder="### occurrences"
            min={1}
          />
        {/if}
      </div>
    </RadioGroup>

    <div class="flex gap-4">
      <Combobox
        id="timezoneName"
        label="Timezone"
        bind:value={$form.timezoneName}
        options={timezoneComboboxOptions}
        optionValueKey="value"
        optionLabelKey="label"
        noResultsText={translate('common.no-results')}
        placeholder="Search timezone..."
        leadingIcon="clock"
        required
        class="w-96"
      />
      <DurationInput id="jitter" bind:value={$form.jitter} label="Jitter" />
    </div>

    <ScheduleInputPayload
      bind:input={$form.input}
      bind:editInput={$form.editInput}
      bind:encoding={$form.encoding}
      bind:messageType={$form.messageType}
      payloads={schedule?.action?.startWorkflow?.input}
      showEditActions={Boolean(schedule)}
    />
  </div>
</Card>
