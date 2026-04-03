<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

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

  <div class="flex items-end gap-2">
    <Input
      id="days-{index}"
      label="Days"
      bind:value={$form.specs[index].days}
      placeholder="0"
      class="w-20"
    />
    <span class="pb-2.5 text-secondary">:</span>
    <Input
      id="hour-{index}"
      label="Hrs"
      bind:value={$form.specs[index].hour}
      placeholder="0"
      class="w-20"
    />
    <span class="pb-2.5 text-secondary">:</span>
    <Input
      id="minute-{index}"
      label="Min"
      bind:value={$form.specs[index].minute}
      placeholder="0"
      class="w-20"
    />
    <span class="pb-2.5 text-secondary">:</span>
    <Input
      id="second-{index}"
      label="Sec"
      bind:value={$form.specs[index].second}
      placeholder="0"
      class="w-20"
    />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-sm text-secondary">
      Specify the time to offset when this schedule will run (for example, 15
      min past the hour).
    </p>
    <Input
      id="phase-{index}"
      label="Offset"
      bind:value={$form.specs[index].phase}
      placeholder="0"
      class="w-40"
    />
  </div>
</div>
