<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import DurationInput, {
    DEFAULT_UNITS,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  import type { ScheduleFormData } from './schema';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
  }

  let { form, index }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-secondary">
    Specify the time interval for this schedule to run (for example every 5
    minutes).
  </p>

  <div
    class="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr,min-content,1fr,min-content,1fr,min-content,1fr] md:grid-cols-[1fr,min-content,1fr] md:grid-rows-2 xl:grid-cols-[1fr,min-content,1fr,min-content,1fr,min-content,1fr]"
  >
    <Input
      id="days-{index}"
      label="Days"
      inputmode="numeric"
      type="number"
      min={0}
      step={1}
      labelHidden
      bind:value={$form.specs[index].days}
      placeholder="000"
      suffix="days"
    />
    <span class="align-center hidden text-secondary sm:flex">:</span>
    <Input
      id="hour-{index}"
      label="Hours"
      labelHidden
      inputmode="numeric"
      type="number"
      min={0}
      step={1}
      bind:value={$form.specs[index].hour}
      placeholder="00"
      suffix="hrs"
    />
    <span class="align-center hidden text-secondary sm:flex md:hidden xl:flex"
      >:</span
    >
    <Input
      id="minute-{index}"
      label="Minutes"
      labelHidden
      inputmode="numeric"
      type="number"
      min={0}
      step={1}
      bind:value={$form.specs[index].minute}
      placeholder="00"
      suffix="min"
    />
    <span class="align-center hidden text-secondary sm:flex">:</span>
    <Input
      id="second-{index}"
      label="Seconds"
      labelHidden
      inputmode="numeric"
      type="number"
      min={0}
      step={1}
      bind:value={$form.specs[index].second}
      placeholder="00"
      suffix="sec"
    />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-sm text-secondary">
      Specify the time to offset when this schedule will run (for example, 15
      min past the hour).
    </p>
    <DurationInput
      id="phase-{index}"
      label="Offset"
      bind:value={$form.specs[index].phase}
      initialUnit="minute(s)"
      units={DEFAULT_UNITS}
      placeholder="00"
      class="w-40"
    />
  </div>
</div>
