<script lang="ts">
  import { type SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';

  import { type ScheduleFormData } from './schema';
  import {
    getInitialSpecData,
    getRawValue,
    getSpecSummary,
  } from './utilities/spec';

  import IntervalExamplesModal from './interval-examples-modal.svelte';
  import SpecTypeCron from './spec-type-cron.svelte';
  import SpecTypeInterval from './spec-type-interval.svelte';
  import SpecTypeMonth from './spec-type-month.svelte';
  import SpecTypeWeek from './spec-type-week.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    index: number;
    expanded: boolean;
    onRemove: () => void;
    canRemove: boolean;
  }

  let { form, errors, index, expanded, onRemove, canRemove }: Props = $props();

  const specTypeOptions = [
    { value: 'cron', label: 'Cron String' },
    { value: 'week', label: 'Days of Week' },
    { value: 'month', label: 'Days of Month' },
    { value: 'interval', label: 'Interval' },
  ];

  const specType = $derived($form.specs[index]?.type);
  const spec = $derived($form.specs[index]);

  const typeLabel = $derived(
    specTypeOptions.find((o) => o.value === specType)?.label ??
      specType ??
      'No type selected',
  );

  function onTypeChange(value: string) {
    const newType = value as ScheduleFormData['specs'][number]['type'];
    $form.specs[index] = getInitialSpecData(newType);
  }

  let isIntervalExampleModalOpen = $state(false);

  let containerEl: HTMLElement | null = $state(null);
  export const focus = () => containerEl?.focus();
</script>

{#if expanded}
  <div
    bind:this={containerEl}
    tabindex="-1"
    class="flex flex-col gap-4"
    aria-expanded="true"
  >
    <div
      class="flex items-start justify-between gap-4 border border-transparent"
    >
      <div class="flex items-end gap-4">
        <Select
          id="spec-type-{index}"
          label="Schedule Spec Type"
          placeholder="Select a spec type"
          value={$form.specs[index].type}
          onChange={onTypeChange}
          valid={!$errors.specs?.[index]?.type?.[0]}
          error={$errors.specs?.[index]?.type?.[0]}
          required
        >
          {#each specTypeOptions as option (option.value)}
            <Option value={option.value}>{option.label}</Option>
          {/each}
        </Select>
        {#if spec.type === 'interval'}
          <Button
            variant="ghost"
            on:click={() => (isIntervalExampleModalOpen = true)}
          >
            Explore interval examples
          </Button>
          <IntervalExamplesModal bind:open={isIntervalExampleModalOpen} />
        {/if}
      </div>
      {#if canRemove}
        <IconButton
          variant="ghost"
          size="sm"
          icon="trash"
          label="Delete"
          class="mr-4 mt-[1.625rem] h-10"
          on:click={onRemove}
        />
      {/if}
    </div>

    {#if specType === 'cron'}
      <SpecTypeCron {form} {errors} {index} />
    {:else if specType === 'week'}
      <SpecTypeWeek {form} {errors} {index} />
    {:else if specType === 'month'}
      <SpecTypeMonth {form} {errors} {index} />
    {:else if specType === 'interval'}
      <SpecTypeInterval {form} {errors} {index} />
    {/if}
  </div>
{:else}
  {@const rawValue = getRawValue(spec)}
  <div
    bind:this={containerEl}
    class="surface-background relative flex w-full justify-between gap-4 border border-subtle px-4 py-3 text-left transition-colors"
    aria-expanded="false"
  >
    <div
      class="grid w-full grid-cols-1 items-center gap-2 text-sm md:grid-cols-[minmax(8rem,max-content)_4fr_minmax(max-content,1fr)] md:gap-4"
    >
      <span class="font-semibold">{typeLabel}</span>
      <span class="flex-1 flex-wrap text-xs text-secondary">
        {getSpecSummary(spec)}.
      </span>
      {#if rawValue}
        <span class="font-mono">{rawValue}</span>
      {/if}
    </div>
    {#if canRemove}
      <IconButton
        variant="ghost"
        size="sm"
        icon="trash"
        label="Delete"
        on:click={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    {/if}
  </div>
{/if}
