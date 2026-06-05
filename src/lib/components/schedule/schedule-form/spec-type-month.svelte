<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import ButtonRadioGroup from '$lib/holocene/button-radio-group.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { getMonthLabel } from '$lib/i18n/format-date-names';
  import { translate } from '$lib/i18n/translate';

  import { DAYS_OF_MONTH, MONTHS } from './constants';
  import { type ScheduleFormData } from './schema';
  import type { DayOfMonth, Month } from './types';
  import { assertSpecType } from './utilities/spec';

  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    index: number;
  }

  let { form, index, errors }: Props = $props();

  const spec = $derived(assertSpecType($form.specs[index], 'month'));

  type MonthMode = 'every-month' | 'custom-months';

  function getInitialMonthMode(): MonthMode {
    const selectedMonthSet = new Set(spec.months ?? []);
    if (MONTHS.every((m) => selectedMonthSet.has(m))) {
      return 'every-month';
    }

    return 'custom-months';
  }

  let monthMode = $state<MonthMode>(getInitialMonthMode());

  function selectMode(mode: MonthMode) {
    if (monthMode === mode) return;

    switch (mode) {
      case 'every-month': {
        monthMode = mode;
        $form.specs[index] = { ...spec, months: [...MONTHS] };
        return;
      }

      case 'custom-months': {
        monthMode = mode;
        $form.specs[index] = {
          ...spec,
          months: [(new Date().getMonth() + 1).toString() as Month],
        };
        return;
      }
    }
  }

  function isDaySelected(day: DayOfMonth): boolean {
    return spec.daysOfMonth?.includes(day) ?? false;
  }

  function toggleDay(day: DayOfMonth) {
    const current = spec.daysOfMonth ?? [];

    if (!current.includes(day)) {
      $form.specs[index] = { ...spec, daysOfMonth: [...current, day] };
      return;
    }

    const next = current.filter((d) => d !== day);

    if (next.length >= 1) {
      $form.specs[index] = { ...spec, daysOfMonth: next };
      return;
    }
  }

  function isCustomMonthSelected(month: Month): boolean {
    return spec.months?.includes(month) ?? false;
  }

  function toggleCustomMonth(month: Month) {
    const current = spec.months ?? [];

    if (!current.includes(month)) {
      $form.specs[index] = { ...spec, months: [...current, month] };
      return;
    }

    const next = current.filter((m) => m !== month);
    if (next.length >= 1) {
      $form.specs[index] = { ...spec, months: next };
      return;
    }
  }
</script>

<div class="flex flex-col gap-4">
  <fieldset class="flex flex-col gap-2">
    <legend class="contents text-sm text-secondary">
      {translate('schedules.recurring-dates-description')}
    </legend>
    <div
      class="grid max-w-108 grid-cols-5 gap-3 border border-subtle p-3 sm:grid-cols-7"
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
