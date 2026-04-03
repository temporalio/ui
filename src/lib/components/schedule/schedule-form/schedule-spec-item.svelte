<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';

  import { DEFAULT_SPEC_ITEM, type ScheduleFormData } from './schema';

  import SpecTypeCron from './spec-type-cron.svelte';
  import SpecTypeInterval from './spec-type-interval.svelte';
  import SpecTypeMonth from './spec-type-month.svelte';
  import SpecTypeWeek from './spec-type-week.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
    onRemove: () => void;
    canRemove: boolean;
  }

  let { form, index, onRemove, canRemove }: Props = $props();

  const specTypeOptions = [
    { value: 'cron', label: 'Cron string' },
    { value: 'week', label: 'Days of the Week' },
    { value: 'month', label: 'Days of the Month' },
    { value: 'interval', label: 'Interval' },
  ];

  const specType = $derived($form.specs[index]?.type);

  function onTypeChange(value: string) {
    const newType = value as ScheduleFormData['specs'][number]['type'];
    $form.specs[index] = { ...DEFAULT_SPEC_ITEM, type: newType };
  }
</script>

<div class="flex flex-col gap-4 border-b border-subtle pb-6 last:border-b-0">
  <div class="flex items-end justify-between gap-4">
    <Select
      id="spec-type-{index}"
      label="Schedule Spec Type"
      value={$form.specs[index].type}
      onChange={onTypeChange}
      required
    >
      {#each specTypeOptions as option (option.value)}
        <Option value={option.value}>{option.label}</Option>
      {/each}
    </Select>
    {#if canRemove}
      <Button variant="destructive" on:click={onRemove}>Remove</Button>
    {/if}
  </div>

  {#if specType === 'cron'}
    <SpecTypeCron {form} {index} />
  {:else if specType === 'week'}
    <SpecTypeWeek {form} {index} />
  {:else if specType === 'month'}
    <SpecTypeMonth {form} {index} />
  {:else if specType === 'interval'}
    <SpecTypeInterval {form} {index} />
  {/if}
</div>
