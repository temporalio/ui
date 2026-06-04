<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import ButtonRadioGroup from '$lib/holocene/button-radio-group.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  import {
    DAYS_OF_WEEK,
    DAYS_WITH_LABEL,
    WEEKDAYS,
    WEEKEND,
  } from './constants';
  import type { ScheduleFormData } from './schema';
  import { type DayOfWeek } from './types';

  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    index: number;
  }

  let { form, index }: Props = $props();

  type Selection =
    | {
        type: 'everyday' | 'weekdays' | 'weekends';
      }
    | {
        type: 'custom';
        days: DayOfWeek[];
      };

  function getInitialSelectionState(): Selection {
    if (!$form.specs?.[index]?.daysOfWeek) {
      return { type: 'everyday' };
    }

    const selectedSet = new Set($form.specs[index].daysOfWeek);

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
      days: [...$form.specs[index].daysOfWeek],
    };
  }

  let selection = $state(getInitialSelectionState());

  $effect(() => {
    // synchronize form state with selection
    switch (selection.type) {
      case 'everyday': {
        $form.specs[index].daysOfWeek = [...DAYS_OF_WEEK];
        return;
      }

      case 'weekdays': {
        $form.specs[index].daysOfWeek = [...DAYS_OF_WEEK];
        return;
      }

      case 'weekends': {
        $form.specs[index].daysOfWeek = [...DAYS_OF_WEEK];
        return;
      }

      case 'custom': {
        $form.specs[index].daysOfWeek = [...selection.days];
      }
    }
  });

  function selectType(type: Selection['type']): void {
    if (type === selection.type) return;

    if (type === 'custom') {
      selection = {
        type: 'custom',
        days: [new Date().getDay().toString() as DayOfWeek],
      };
      return;
    }

    selection = { type };
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
      return;
    }

    if (selection.days.length > 1) {
      selection.days = selection.days.filter((d) => d !== day);
    }
  }
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-secondary">
    Select the day(s) of the week this schedule will always run on.
  </p>

  <ButtonRadioGroup
    label="Recurrence"
    value={selection.type}
    options={[
      { label: 'Every day', value: 'everyday' },
      { label: 'Weekdays', value: 'weekdays' },
      { label: 'Weekends', value: 'weekends' },
      { label: 'Custom days', value: 'custom' },
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
    <div class="flex flex-wrap gap-2" role="group" aria-label="Custom days">
      {#each DAYS_WITH_LABEL as day (day.value)}
        {@const isSelected = isCustomDaySelected(day.value)}
        <Button
          size="sm"
          aria-pressed={isSelected}
          variant="secondary"
          active={isSelected}
          on:click={() => toggleCustomDay(day.value)}
        >
          {day.label}
        </Button>
      {/each}
    </div>
  {/if}

  <fieldset class="flex flex-col gap-2.5">
    <legend class="contents font-medium">Run time</legend>
    <p class="text-sm text-secondary">
      Specify the time (UTC) for this schedule to run. The schedule will run at
      00:00 UTC if left blank.
    </p>
    <div class="grid max-w-108 gap-2 md:grid-cols-2">
      <Input
        id="hours"
        label="Hours"
        labelHidden
        type="number"
        inputmode="numeric"
        step={1}
        min={0}
        max={23}
        placeholder="00"
        suffix="hrs"
        bind:value={$form.specs[index].hour}
      />

      <Input
        id="minutes"
        label="Minutes"
        labelHidden
        type="number"
        inputmode="numeric"
        step={1}
        min={0}
        max={59}
        placeholder="00"
        suffix="min"
        bind:value={$form.specs[index].minute}
      />
    </div>
    <div class="flex gap-2 text-xs">
      <Icon name="clock" class="inline-block" />
      <p class="text-secondary">Based on Universal Standard Time (UTC)</p>
    </div>
  </fieldset>

  <ScheduleSpecPreview {form} {index} class="mt-4" />
</div>
