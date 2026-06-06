<script lang="ts">
  import { type SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';

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
    { value: 'cron', label: translate('schedules.cron-string') },
    { value: 'week', label: translate('schedules.spec-type-week') },
    { value: 'month', label: translate('schedules.spec-type-month') },
    { value: 'interval', label: translate('schedules.spec-type-interval') },
  ];

  const specType = $derived($form.specs[index]?.type);
  const spec = $derived($form.specs[index]);

  const typeLabel = $derived(
    specTypeOptions.find((o) => o.value === specType)?.label ??
      specType ??
      translate('schedules.spec-type-none'),
  );

  function onTypeChange(value: string) {
    const newType = value as ScheduleFormData['specs'][number]['type'];
    $form.specs[index] = getInitialSpecData(newType);

    if ($errors.specs?.[index]?.type) {
      delete $errors.specs[index].type;
      $errors = $errors;
    }
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
      <div class="flex flex-col items-end gap-4 sm:flex-row">
        <Select
          id="spec-type-{index}"
          label={translate('schedules.spec-type-label')}
          placeholder={translate('schedules.spec-type-placeholder')}
          value={$form.specs[index].type === 'unspecified'
            ? undefined
            : $form.specs[index].type}
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
            {translate('schedules.explore-interval-examples')}
          </Button>
          <IntervalExamplesModal bind:open={isIntervalExampleModalOpen} />
        {/if}
      </div>
      {#if canRemove}
        <IconButton
          variant="ghost"
          size="sm"
          icon="trash"
          label={translate('common.delete')}
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
        label={translate('common.delete')}
        on:click={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    {/if}
  </div>
{/if}
