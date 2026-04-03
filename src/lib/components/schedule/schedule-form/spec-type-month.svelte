<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  import type { ScheduleFormData } from './schema';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
  }

  let { form, index }: Props = $props();

  const monthNames = [
    { label: 'Jan', value: '1' },
    { label: 'Feb', value: '2' },
    { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' },
    { label: 'May', value: '5' },
    { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' },
    { label: 'Aug', value: '8' },
    { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
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
    <div class="grid grid-cols-7 gap-1">
      {#each dayNumbers as day (day)}
        <Button
          variant={isDaySelected(day) ? 'primary' : 'ghost'}
          size="xs"
          on:click={() => toggleDay(day)}>{day}</Button
        >
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="xs"
        on:click={() => ($form.specs[index].months = [])}>Every month</Button
      >
      {#each monthNames as month (month.value)}
        <Button
          variant={isMonthSelected(month.value) ? 'primary' : 'ghost'}
          size="xs"
          on:click={() => toggleMonth(month.value)}>{month.label}</Button
        >
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-sm text-secondary">
      Specify the time (UTC) for this schedule to run.
    </p>
    <div class="flex gap-4">
      <Input
        id="hour-{index}"
        label="Hour"
        bind:value={$form.specs[index].hour}
        placeholder="0"
        class="w-24"
      />
      <Input
        id="minute-{index}"
        label="Minute"
        bind:value={$form.specs[index].minute}
        placeholder="0"
        class="w-24"
      />
    </div>
    <p class="text-xs text-secondary">Based on Universal Standard Time (UTC)</p>
  </div>
</div>
