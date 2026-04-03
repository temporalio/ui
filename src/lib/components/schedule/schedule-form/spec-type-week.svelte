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

  const days = [
    { label: 'Sun', value: '0' },
    { label: 'Mon', value: '1' },
    { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' },
    { label: 'Thu', value: '4' },
    { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' },
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
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-secondary">
    Select the day(s) of the week this schedule will always run on.
  </p>

  <div class="flex flex-wrap gap-2">
    <Button
      variant="ghost"
      size="xs"
      on:click={() =>
        ($form.specs[index].daysOfWeek = ['0', '1', '2', '3', '4', '5', '6'])}
      >Every day</Button
    >
    <Button
      variant="ghost"
      size="xs"
      on:click={() =>
        ($form.specs[index].daysOfWeek = ['1', '2', '3', '4', '5'])}
      >Weekdays</Button
    >
    <Button
      variant="ghost"
      size="xs"
      on:click={() => ($form.specs[index].daysOfWeek = ['0', '6'])}
      >Weekends</Button
    >
  </div>

  <div class="flex flex-wrap gap-2">
    {#each days as day (day.value)}
      <Button
        variant={isDaySelected(day.value) ? 'primary' : 'ghost'}
        size="xs"
        on:click={() => toggleDay(day.value)}>{day.label}</Button
      >
    {/each}
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
