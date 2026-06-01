<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  import type { ScheduleFormData } from './schema';

  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
  }

  let { form, index }: Props = $props();

  const monthNames = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const dayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

  function isDaySelected(day: number): boolean {
    return $form.specs[index].daysOfMonth?.includes(day) ?? false;
  }

  function toggleDay(day: number) {
    const current = $form.specs[index].daysOfMonth ?? [];
    if (current.includes(day)) {
      $form.specs[index].daysOfMonth = current.filter((d) => d !== day);
    } else {
      $form.specs[index].daysOfMonth = [...current, day];
    }
  }

  function isMonthSelected(month: string): boolean {
    return $form.specs[index].months?.includes(month) ?? false;
  }

  function toggleMonth(month: string) {
    const current = $form.specs[index].months ?? [];
    if (current.includes(month)) {
      $form.specs[index].months = current.filter((m) => m !== month);
    } else {
      $form.specs[index].months = [...current, month];
    }
  }

  const allMonthsActive = $derived.by(() => {
    const monthValueSet = new Set(monthNames.map((m) => m.value));
    if (
      $form.specs[index].months.length !== 0 &&
      $form.specs[index].months.length !== monthNames.length
    ) {
      return false;
    }

    return monthNames.every((m) => monthValueSet.has(m.value));
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <p class="text-sm text-secondary">
      Select the specific dates for the schedule to always run on.
    </p>
    <div
      class="grid max-w-108 grid-cols-5 gap-3 border border-subtle p-3 sm:grid-cols-7"
    >
      {#each dayNumbers as day (day)}
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
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-2">
      <Button
        active={allMonthsActive}
        aria-pressed={allMonthsActive}
        variant="secondary"
        on:click={() => ($form.specs[index].months = [])}>Every month</Button
      >
      {#each monthNames as month (month.value)}
        {@const isSelected = isMonthSelected(month.value)}
        <Button
          active={isSelected}
          aria-pressed={isSelected}
          variant="secondary"
          size="sm"
          on:click={() => toggleMonth(month.value)}>{month.label}</Button
        >
      {/each}
    </div>
  </div>

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
