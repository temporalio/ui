<script lang="ts">
  import { get, type Writable, writable } from 'svelte/store';

  import { isBefore } from 'date-fns';
  import { utcToZonedTime } from 'date-fns-tz';
  import { type SuperForm } from 'sveltekit-superforms';

  import Card from '$lib/holocene/card.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EndDateType } from '$lib/types/schedule';
  import type { FullSchedule } from '$lib/types/schedule';
  import {
    formatOffset,
    TimezoneOptions,
    utcToZonedWallClock,
    zonedWallClockToUTCISOString,
  } from '$lib/utilities/timezone';

  import type { ScheduleFormData } from './schema';

  import ScheduleInputPayload from './schedule-input-payload.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
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

  const timezone = $derived($form.timezoneName || 'UTC');

  // svelte-ignore state_referenced_locally
  let startDay = $state<Date | null>(
    utcToZonedWallClock($form.startDate, timezone),
  );

  $effect(() => {
    // keep $form.startDate value in sync with selected date and selected timezone
    // (underlying value potentially changes when either changes)
    $form.startDate = zonedWallClockToUTCISOString(startDay, timezone);
  });

  // svelte-ignore state_referenced_locally
  let endDay = $state<Date | null>(
    utcToZonedWallClock($form.endDate, timezone),
  );

  $effect(() => {
    // keep $form.endDate value in sync with selected date and selected timezone
    // (underlying value potentially changes when either changes)
    $form.endDate = zonedWallClockToUTCISOString(endDay, timezone);
  });

  const startDateValue = $derived(
    startDay ?? utcToZonedTime(new Date(), timezone),
  );
  const endDateValue = $derived.by(() => {
    if (!endDay) {
      const now = utcToZonedTime(new Date(), timezone);

      return isBefore(now, startDateValue) ? startDateValue : now;
    }

    return endDay;
  });

  const onStartDateChange = (d: Date) => {
    startDay = d;
    if (isBefore(endDateValue, d)) {
      endDay = d;
    }
  };

  const onEndDateChange = (d: Date) => {
    endDay = d;
  };
</script>

<Card class="w-full">
  <h2 class="text-2xl font-medium">Schedule Details</h2>
  <div class="mt-4 flex flex-col gap-4">
    <Input
      id="name"
      bind:value={$form.name}
      data-testid="schedule-name-input"
      label="Schedule Name"
      error={!!$errors.name?.[0]}
      hintText={$errors.name?.[0]}
      maxLength={232}
      disabled={Boolean(schedule)}
      required
    />
    <Input
      id="workflowType"
      bind:value={$form.workflowType}
      data-testid="schedule-type-input"
      label="Workflow Type"
      error={!!$errors.workflowType?.[0]}
      hintText={$errors.workflowType?.[0]}
      required
    />
    <Input
      id="workflowId"
      bind:value={$form.workflowId}
      data-testid="schedule-workflow-id-input"
      label="Workflow ID"
      hintText={$errors.workflowId?.[0] ||
        'The unique ID of the Workflow Execution. If left blank, we will generate a unique ID.'}
      error={!!$errors.workflowId?.[0]}
    />
    <Input
      id="taskQueue"
      bind:value={$form.taskQueue}
      data-testid="schedule-task-queue-input"
      label="Task Queue"
      error={!!$errors.taskQueue?.[0]}
      hintText={$errors.taskQueue?.[0] ||
        'The task queue this schedule should poll.'}
      required
    />

    <div class="max-w-108">
      <DatePicker
        label="Schedule Start Date"
        selected={startDateValue}
        todayLabel={translate('common.today')}
        closeLabel={translate('common.close')}
        clearLabel={translate('common.clear-input-button-label')}
        onDateChange={onStartDateChange}
        clearable={false}
      >
        {#snippet afterLabel()}
          <Tooltip
            topLeft
            width={250}
            text="If a Schedule Spec start time has already passed for the start date, the schedule will run at the next time specified in the Schedule Spec."
          >
            <Icon name="square-info" class="h-3 w-3" />
          </Tooltip>
        {/snippet}
      </DatePicker>
    </div>

    <RadioGroup
      name="endDateType"
      group={endDateTypeStore}
      class="flex max-w-108 flex-col gap-1 p-0"
      description="End Date"
    >
      {@const rowClass =
        'grid h-11 grid-cols-[theme(spacing.24)_1fr] items-center gap-3'}
      <div class={rowClass}>
        <RadioInput id="end-date-never" value="never" label="Never" />
      </div>
      <div class={rowClass}>
        <RadioInput id="end-date-on" value="on" label="On" />
        {#if endDateType === 'on'}
          <DatePicker
            label="End date"
            labelHidden
            selected={endDateValue}
            todayLabel={translate('common.today')}
            closeLabel={translate('common.close')}
            clearLabel={translate('common.clear-input-button-label')}
            onDateChange={onEndDateChange}
            clearable={false}
            isAllowed={(d) => !isBefore(d, startDateValue)}
          />
        {/if}
      </div>
      <div class={rowClass}>
        <RadioInput id="end-date-after" value="after" label="After" />
        {#if endDateType === 'after'}
          <NumberInput
            id="endAfterOccurrences"
            label="Occurrences"
            labelHidden
            bind:value={$form.endAfterOccurrences}
            placeholder="### occurrences"
            min={1}
            disabled={endDateType !== 'after'}
            class="w-full"
          />
        {/if}
      </div>
    </RadioGroup>

    <div
      class="grid grid-cols-[minmax(100%,theme(spacing.108))] gap-4 md:grid-cols-[minmax(theme(spacing.56),4fr)_minmax(theme(spacing.56),3fr)]"
    >
      <Combobox
        id="timezoneName"
        label="Timezone"
        bind:value={$form.timezoneName}
        options={timezoneComboboxOptions}
        optionValueKey="value"
        optionLabelKey="label"
        noResultsText={translate('common.no-results')}
        placeholder="Search timezone…"
        leadingIcon="clock"
        required
      />

      <Input
        id="jitter"
        label="Jitter"
        type="number"
        step={1}
        min={0}
        suffix="sec"
        bind:value={$form.jitter}
      >
        {#snippet afterLabel()}
          <Tooltip
            topLeft
            width={250}
            text="A random offset between zero and this value added to each action time, bound by the next scheduled Action time, used to avoid load spikes."
          >
            <Icon name="square-info" class="h-3 w-3" />
          </Tooltip>
        {/snippet}
      </Input>
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
