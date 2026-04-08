<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';

  import type { ScheduleFormData } from './schema';

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
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <p class="text-sm text-secondary">
      Select the specific dates for the schedule to always run on.
    </p>
    <div class="grid grid-cols-7 gap-3 border border-subtle p-3">
      {#each dayNumbers as day (day)}
        <Button
          variant={isDaySelected(day) ? 'primary' : 'secondary'}
          size="sm"
          class="w-12"
          on:click={() => toggleDay(day)}>{day}</Button
        >
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        on:click={() => ($form.specs[index].months = [])}>Every month</Button
      >
      {#each monthNames as month (month.value)}
        <Button
          variant={isMonthSelected(month.value) ? 'primary' : 'secondary'}
          on:click={() => toggleMonth(month.value)}>{month.label}</Button
        >
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-sm text-secondary">
      Specify the time (UTC) for this schedule to run.
    </p>
    <div class="flex w-96 gap-4">
      <TimePicker
        bind:hour={$form.specs[index].hour}
        bind:minute={$form.specs[index].minute}
        bind:second={$form.specs[index].second}
        twelveHourClock={false}
      />
    </div>
    <p class="text-xs text-secondary">Based on Universal Standard Time (UTC)</p>
  </div>
</div>
