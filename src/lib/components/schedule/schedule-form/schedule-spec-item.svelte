<script lang="ts">
  import cronstrue from 'cronstrue';
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

  const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const MONTH_NAMES = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const summary = $derived.by(() => {
    if (!spec) return '';
    if (specType === 'cron') {
      try {
        return cronstrue.toString(spec.cronString || '* * * * *');
      } catch {
        return '';
      }
    }
    if (specType === 'week') {
      const days = (spec.daysOfWeek || []).map(
        (d) => DAY_NAMES[Number(d)] || d,
      );
      const time = `${spec.hour || '00'}:${spec.minute || '00'} UTC`;
      return days.length ? `Every ${days.join(', ')} at ${time}.` : '';
    }
    if (specType === 'month') {
      const days = (spec.daysOfMonth || []).join(', ');
      const months = (spec.months || [])
        .map((m) => MONTH_NAMES[Number(m)] || m)
        .join(', ');
      const time = `${spec.hour || '00'}:${spec.minute || '00'} UTC`;
      return days
        ? `Day${spec.daysOfMonth?.length > 1 ? 's' : ''} ${days}${months ? ` of ${months}` : ''} at ${time}.`
        : '';
    }
    if (specType === 'interval') {
      const parts: string[] = [];
      if (spec.days) parts.push(`${spec.days}d`);
      if (spec.hour) parts.push(`${spec.hour}h`);
      if (spec.minute) parts.push(`${spec.minute}m`);
      if (spec.second) parts.push(`${spec.second}s`);
      return parts.length ? `Every ${parts.join(' ')}.` : '';
    }
    return '';
  });

  const rawValue = $derived.by(() => {
    if (!spec) return '';
    if (specType === 'cron') return spec.cronString || '';
    if (specType === 'interval') {
      const parts: string[] = [];
      if (spec.days) parts.push(spec.days);
      if (spec.hour) parts.push(spec.hour);
      if (spec.minute) parts.push(spec.minute);
      if (spec.second) parts.push(spec.second);
      return parts.join(':') || '';
    }
    return '';
  });

  function onTypeChange(value: string) {
    const newType = value as ScheduleFormData['specs'][number]['type'];
    $form.specs[index] = { ...DEFAULT_SPEC_ITEM, type: newType };
  }

  // svelte-ignore non_reactive_update
  let el: HTMLElement;
  let prevExpanded: boolean | null = null;

  $effect(() => {
    // prevExpanded is null on mount, we only want to focus when it actually changed
    if (prevExpanded != null && expanded && !prevExpanded) {
      el?.focus();
    }
    prevExpanded = expanded;
  });
</script>

{#if expanded}
  <div
    bind:this={el}
    tabindex="-1"
    class="flex flex-col gap-4"
    aria-expanded="true"
  >
    <div
      class="flex items-start justify-between gap-4 border border-transparent"
    >
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
      {#if canRemove}
        <Button
          variant="ghost"
          leadingIcon="trash"
          size="xs"
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
  <div
    class="surface-background relative flex w-full justify-between gap-4 border border-subtle px-4 py-3 text-left transition-colors"
    aria-expanded="false"
  >
    <div
      class="grid w-full grid-cols-1 items-center gap-2 text-sm md:grid-cols-[minmax(8rem,max-content)_4fr_minmax(max-content,1fr)] md:gap-4"
    >
      <span class="font-semibold">{typeLabel}</span>
      <span class="flex-1 text-secondary md:truncate">{summary}</span>
      <span class="font-mono">{rawValue}</span>
    </div>
    {#if canRemove}
      <Button
        variant="ghost"
        leadingIcon="trash"
        size="xs"
        on:click={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      ></Button>
    {/if}
  </div>
{/if}
