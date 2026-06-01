<script lang="ts" module>
  const everyday = ['0', '1', '2', '3', '4', '5', '6'];
  const weekdays = ['1', '2', '3', '4', '5'];
  const weekend = ['0', '6'];
</script>

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

  const days = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
  ];

  function isDaySelected(day: string): boolean {
    return $form.specs[index].daysOfWeek?.includes(day) ?? false;
  }

  function toggleDay(day: string) {
    const current = $form.specs[index].daysOfWeek ?? [];
    if (current.includes(day)) {
      $form.specs[index].daysOfWeek = current.filter((d) => d !== day);
    } else {
      $form.specs[index].daysOfWeek = [...current, day];
    }
  }

  const activeCollection: 'every' | 'weekday' | 'weekend' | 'none' =
    $derived.by(() => {
      const selectedSet = new Set($form.specs[index].daysOfWeek);
      switch (selectedSet.size) {
        case everyday.length: {
          return everyday.every((d) => selectedSet.has(d)) ? 'every' : 'none';
        }
        case weekdays.length: {
          return weekdays.every((d) => selectedSet.has(d)) ? 'weekday' : 'none';
        }
        case weekend.length: {
          return weekend.every((d) => selectedSet.has(d)) ? 'weekend' : 'none';
        }

        default: {
          return 'none';
        }
      }
    });
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-secondary">
    Select the day(s) of the week this schedule will always run on.
  </p>

  <div class="flex flex-wrap gap-2">
    <Button
      variant="secondary"
      active={activeCollection === 'every'}
      on:click={() => ($form.specs[index].daysOfWeek = everyday)}
      >Every day</Button
    >
    <Button
      variant="secondary"
      active={activeCollection === 'weekday'}
      on:click={() => ($form.specs[index].daysOfWeek = weekdays)}
      >Weekdays</Button
    >
    <Button
      variant="secondary"
      active={activeCollection === 'weekend'}
      on:click={() => ($form.specs[index].daysOfWeek = weekend)}
      >Weekends</Button
    >
  </div>

  <div class="flex flex-wrap gap-2">
    {#each days as day (day.value)}
      {@const isSelected = isDaySelected(day.value)}
      <Button
        size="sm"
        aria-pressed={isSelected}
        variant="secondary"
        active={isSelected}
        on:click={() => toggleDay(day.value)}>{day.label}</Button
      >
    {/each}
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
