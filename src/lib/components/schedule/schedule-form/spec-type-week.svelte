<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import ButtonRadioGroup from '$lib/holocene/button-radio-group.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { getWeekdayLabel } from '$lib/i18n/format-date-names';
  import { translate } from '$lib/i18n/translate';

  import { DAYS_OF_WEEK, WEEKDAYS, WEEKEND } from '../constants';
  import type { ScheduleFormData } from '../schema/form-schema';
  import { type DayOfWeek } from '../types';
  import { assertSpecType } from '../utilities/spec';

  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    index: number;
  }

  let { form, index, errors }: Props = $props();

  const spec = $derived(assertSpecType($form.specs[index], 'week'));

  type Selection =
    | {
        type: 'everyday' | 'weekdays' | 'weekends';
      }
    | {
        type: 'custom';
        days: DayOfWeek[];
      };

  function getInitialSelectionState(): Selection {
    if (!spec.daysOfWeek) {
      return { type: 'everyday' };
    }

    const selectedSet = new Set(spec.daysOfWeek);

    if (DAYS_OF_WEEK.every((d) => selectedSet.has(d))) {
      return { type: 'everyday' };
    }

    if (WEEKDAYS.every((d) => selectedSet.has(d))) {
      return { type: 'weekdays' };
    }

    if (WEEKEND.every((d) => selectedSet.has(d))) {
      return { type: 'weekends' };
    }

    return {
      type: 'custom',
      days: [...spec.daysOfWeek],
    };
  }

  let selection = $state(getInitialSelectionState());

  function syncDays(daysOfWeek: DayOfWeek[]): void {
    $form.specs[index] = { ...spec, daysOfWeek };
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
        const days = [new Date().getDay().toString() as DayOfWeek];
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
      {translate('schedules.run-time-description')}
    </p>
    <div class="grid max-w-108 gap-2 md:grid-cols-2">
      <Input
        id="hours"
        label={translate('common.hours')}
        labelHidden
        type="number"
        inputmode="numeric"
        step={1}
        min={0}
        max={23}
        placeholder="00"
        suffix={translate('common.hours-abbreviated')}
        error={!!$errors.specs?.[index]?.time?.hour?.[0]}
        hintText={$errors.specs?.[index]?.time?.hour?.[0]}
        bind:value={
          () => spec.time?.hour?.toString(),
          (v) =>
            ($form.specs[index] = {
              ...spec,
              time: { ...spec.time, hour: Number(v) },
            })
        }
      />

      <Input
        id="minutes"
        label={translate('common.minutes')}
        labelHidden
        type="number"
        inputmode="numeric"
        step={1}
        min={0}
        max={59}
        placeholder="00"
        suffix={translate('common.minutes-abbreviated')}
        error={!!$errors.specs?.[index]?.time?.minute?.[0]}
        hintText={$errors.specs?.[index]?.time?.minute?.[0]}
        bind:value={
          () => spec.time?.minute?.toString(),
          (v) =>
            ($form.specs[index] = {
              ...spec,
              time: { ...spec.time, minute: Number(v) },
            })
        }
      />
    </div>
    <div class="flex gap-2 text-xs">
      <Icon name="clock" class="inline-block" />
      <p class="text-secondary">
        {translate('common.based-on-time-preface')}
        {translate('common.universal-standard-time')}
      </p>
    </div>
  </fieldset>

  <ScheduleSpecPreview {form} {index} class="mt-4" />
</div>
