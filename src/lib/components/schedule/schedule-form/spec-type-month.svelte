<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import ButtonRadioGroup from '$lib/holocene/button-radio-group.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { getMonthLabel } from '$lib/i18n/format-date-names';
  import { translate } from '$lib/i18n/translate';

  import { DAYS_OF_MONTH, MONTHS } from '../constants';
  import type { FormScheduleSchema } from '../schema/form';
  import type { DayOfMonth, Month } from '../types';
  import { compactToRanges, expandRanges } from '../utilities/range';

  import ScheduleSpecPreview from './schedule-spec-preview.svelte';
  import SpecRunTime from './spec-run-time.svelte';

  interface Props {
    form: SuperForm<FormScheduleSchema>['form'];
    errors: SuperForm<FormScheduleSchema>['errors'];
    index: number;
  }

  let { form, errors, index }: Props = $props();

  const spec = $derived($form.specs[index]);

  const selectedDays = $derived(
    expandRanges(spec.calendar.dayOfMonth) as DayOfMonth[],
  );

  const selectedMonths = $derived(expandRanges(spec.calendar.month) as Month[]);

  type MonthMode = 'every-month' | 'custom-months';

  function getInitialMonthMode(): MonthMode {
    const selectedMonthSet = new Set(selectedMonths);
    if (
      selectedMonthSet.size > 0 &&
      MONTHS.every((m) => selectedMonthSet.has(m))
    ) {
      return 'every-month';
    }

    return 'custom-months';
  }

  let monthMode = $state<MonthMode>(getInitialMonthMode());

  function syncMonths(months: Month[]): void {
    $form.specs[index] = {
      ...spec,
      calendar: {
        ...spec.calendar,
        month: compactToRanges(months.map(Number)),
      },
    };
  }

  function syncDays(days: DayOfMonth[]): void {
    $form.specs[index] = {
      ...spec,
      calendar: {
        ...spec.calendar,
        dayOfMonth: compactToRanges(days.map(Number)),
      },
    };
  }

  function selectMode(mode: MonthMode) {
    if (monthMode === mode) return;

    switch (mode) {
      case 'every-month': {
        monthMode = mode;
        syncMonths([...MONTHS]);
        return;
      }

      case 'custom-months': {
        monthMode = mode;
        syncMonths([(new Date().getMonth() + 1) as Month]);
        return;
      }
    }
  }

  function isDaySelected(day: DayOfMonth): boolean {
    return selectedDays.includes(day);
  }

  function toggleDay(day: DayOfMonth) {
    if (!selectedDays.includes(day)) {
      syncDays([...selectedDays, day]);
      return;
    }

    const next = selectedDays.filter((d) => d !== day);

    if (next.length >= 1) {
      syncDays(next);
    }
  }

  function isCustomMonthSelected(month: Month): boolean {
    return selectedMonths.includes(month);
  }

  function toggleCustomMonth(month: Month) {
    if (!selectedMonths.includes(month)) {
      syncMonths([...selectedMonths, month]);
      return;
    }

    const next = selectedMonths.filter((m) => m !== month);
    if (next.length >= 1) {
      syncMonths(next);
    }
  }
</script>

<div class="flex flex-col gap-4">
  <fieldset class="flex flex-col gap-2">
    <legend class="contents text-sm text-secondary">
      {translate('schedules.recurring-dates-description')}
    </legend>
    <div
      class="grid max-w-[27rem] grid-cols-5 gap-3 border border-subtle p-3 sm:grid-cols-7"
    >
      {#each DAYS_OF_MONTH as day (day)}
        {@const isSelected = isDaySelected(day)}
        <Button
          active={isSelected}
          aria-pressed={isSelected}
          variant="secondary"
          size="sm"
          class="aspect-square min-h-12 min-w-12"
          on:click={() => toggleDay(day)}>{day}</Button
        >
      {/each}
    </div>
  </fieldset>

  <div class="flex flex-col gap-2">
    <ButtonRadioGroup
      label={translate('schedules.month-selection-label')}
      value={monthMode}
      options={[
        {
          label: translate('schedules.month-selection-every'),
          value: 'every-month',
        },
        {
          label: translate('schedules.month-selection-custom'),
          value: 'custom-months',
        },
      ] as const}
      onChange={selectMode}
    >
      {#snippet item({ option, checked, attrs, onSelect, onKeydown })}
        <Button
          active={checked}
          variant="secondary"
          on:click={onSelect}
          on:keydown={onKeydown}
          {...attrs}
        >
          {option.label}
        </Button>
      {/snippet}
    </ButtonRadioGroup>

    {#if monthMode === 'custom-months'}
      <div
        class="mt-2 grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6"
        role="group"
        aria-label={translate('schedules.month-selection-custom')}
      >
        {#each MONTHS as value (value)}
          {@const isSelected = isCustomMonthSelected(value)}
          <Button
            active={isSelected}
            aria-pressed={isSelected}
            variant="secondary"
            size="sm"
            class="w-full"
            on:click={() => toggleCustomMonth(value)}
          >
            {getMonthLabel(Number(value) - 1)}
          </Button>
        {/each}
      </div>
    {/if}
  </div>

  <SpecRunTime {form} {errors} {index} />

  <ScheduleSpecPreview {form} {index} class="mt-4" />
</div>
