<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import ButtonRadioGroup from '$lib/holocene/button-radio-group.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { getWeekdayLabel } from '$lib/i18n/format-date-names';
  import { translate } from '$lib/i18n/translate';

  import { DAYS_OF_WEEK, WEEKDAYS, WEEKEND } from '../constants';
  import type { FormScheduleSchema } from '../schema/form';
  import { type DayOfWeek } from '../types';
  import { compactToRanges, expandRanges } from '../utilities/range';

  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<FormScheduleSchema>['form'];
    errors: SuperForm<FormScheduleSchema>['errors'];
    index: number;
  }

  let { form, index }: Props = $props();

  const uuid = $props.id();

  const spec = $derived($form.specs[index]);

  const selectedDays = $derived(
    expandRanges(spec.calendar.dayOfWeek) as DayOfWeek[],
  );

  type Selection =
    | { type: 'everyday' | 'weekdays' | 'weekends' }
    | { type: 'custom'; days: DayOfWeek[] };

  function getInitialSelectionState(): Selection {
    if (selectedDays.length === 0) {
      return { type: 'everyday' };
    }

    const selectedSet = new Set(selectedDays);

    if (DAYS_OF_WEEK.every((d) => selectedSet.has(d))) {
      return { type: 'everyday' };
    }

    if (
      WEEKDAYS.every((d) => selectedSet.has(d)) &&
      selectedSet.size === WEEKDAYS.length
    ) {
      return { type: 'weekdays' };
    }

    if (
      WEEKEND.every((d) => selectedSet.has(d)) &&
      selectedSet.size === WEEKEND.length
    ) {
      return { type: 'weekends' };
    }

    return { type: 'custom', days: [...selectedDays] };
  }

  let selection = $state(getInitialSelectionState());

  function syncDays(days: DayOfWeek[]): void {
    const ranges = compactToRanges(days.map(Number));
    $form.specs[index] = {
      ...spec,
      calendar: { ...spec.calendar, dayOfWeek: ranges },
    };
  }

  function selectType(type: Selection['type']): void {
    if (type === selection.type) return;

    switch (type) {
      case 'everyday':
        selection = { type };
        syncDays([...DAYS_OF_WEEK]);
        return;

      case 'weekdays':
        selection = { type };
        syncDays([...WEEKDAYS]);
        return;

      case 'weekends':
        selection = { type };
        syncDays([...WEEKEND]);
        return;

      case 'custom': {
        const days = [new Date().getDay() as DayOfWeek];
        selection = { type: 'custom', days };
        syncDays([...days]);
        return;
      }
    }
  }

  function isCustomDaySelected(day: DayOfWeek): boolean {
    if (selection.type !== 'custom') {
      return false;
    }

    return selection.days.includes(day);
  }

  function toggleCustomDay(day: DayOfWeek): void {
    if (selection.type !== 'custom') {
      return;
    }

    if (!selection.days.includes(day)) {
      selection.days = [...selection.days, day];
      syncDays([...selection.days]);
      return;
    }

    if (selection.days.length > 1) {
      selection.days = selection.days.filter((d) => d !== day);
      syncDays([...selection.days]);
    }
  }

  function setHour(value: string): void {
    const n = value === '' ? undefined : Number(value);
    $form.specs[index] = {
      ...spec,
      calendar: {
        ...spec.calendar,
        hour:
          n !== undefined && Number.isFinite(n) ? [{ start: n }] : undefined,
      },
    };
  }

  function setMinute(value: string): void {
    const n = value === '' ? undefined : Number(value);
    $form.specs[index] = {
      ...spec,
      calendar: {
        ...spec.calendar,
        minute:
          n !== undefined && Number.isFinite(n) ? [{ start: n }] : undefined,
      },
    };
  }
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-secondary">
    {translate('schedules.recurring-days-description')}
  </p>

  <ButtonRadioGroup
    label={translate('schedules.recurrence-label')}
    value={selection.type}
    options={[
      { label: translate('schedules.recurrence-everyday'), value: 'everyday' },
      { label: translate('schedules.recurrence-weekdays'), value: 'weekdays' },
      { label: translate('schedules.recurrence-weekends'), value: 'weekends' },
      { label: translate('schedules.recurrence-custom'), value: 'custom' },
    ]}
    onChange={selectType}
  >
    {#snippet item({ option, checked, attrs, onSelect, onKeydown })}
      <Button
        variant="secondary"
        active={checked}
        {...attrs}
        on:click={onSelect}
        on:keydown={onKeydown}
      >
        {option.label}
      </Button>
    {/snippet}
  </ButtonRadioGroup>

  {#if selection.type === 'custom'}
    <div
      class="flex flex-wrap gap-2"
      role="group"
      aria-label={translate('schedules.recurrence-custom')}
    >
      {#each DAYS_OF_WEEK as value (value)}
        {@const isSelected = isCustomDaySelected(value)}
        <Button
          size="sm"
          aria-pressed={isSelected}
          variant="secondary"
          active={isSelected}
          on:click={() => toggleCustomDay(value)}
        >
          {getWeekdayLabel(Number(value))}
        </Button>
      {/each}
    </div>
  {/if}

  <fieldset class="flex flex-col gap-2.5">
    <legend class="contents font-medium"
      >{translate('schedules.run-time-heading')}</legend
    >
    <p class="text-sm text-secondary">
      {translate('schedules.run-time-description', {
        timezoneName: $form.timezoneName ?? 'UTC',
      })}
    </p>
    <div class="grid max-w-108 gap-2 md:grid-cols-2">
      <Input
        id="hours-{uuid}"
        label={translate('common.hours')}
        labelHidden
        type="number"
        inputmode="numeric"
        step={1}
        min={0}
        max={23}
        placeholder="00"
        suffix={translate('common.hours-abbreviated')}
        bind:value={
          () => spec.calendar.hour?.[0]?.start?.toString() ?? '', setHour
        }
      />

      <Input
        id="minutes-{uuid}"
        label={translate('common.minutes')}
        labelHidden
        type="number"
        inputmode="numeric"
        step={1}
        min={0}
        max={59}
        placeholder="00"
        suffix={translate('common.minutes-abbreviated')}
        bind:value={
          () => spec.calendar.minute?.[0]?.start?.toString() ?? '', setMinute
        }
      />
    </div>
    <div class="flex gap-2 text-xs">
      <Icon name="clock" class="inline-block" />
      <p class="text-secondary">
        {translate('schedules.run-time-based-on-timezone', {
          timezoneName: $form.timezoneName,
        })}
      </p>
    </div>
  </fieldset>

  <ScheduleSpecPreview {form} {index} class="mt-4" />
</div>
