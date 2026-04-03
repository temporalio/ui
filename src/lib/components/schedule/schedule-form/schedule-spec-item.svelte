<script lang="ts">
  import cronstrue from 'cronstrue';
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
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
    expanded: boolean;
    onExpand: () => void;
    onRemove: () => void;
    canRemove: boolean;
  }

  let { form, index, expanded, onExpand, onRemove, canRemove }: Props =
    $props();

  const specTypeOptions = [
    { value: 'cron', label: 'Cron String' },
    { value: 'week', label: 'Days of Week' },
    { value: 'month', label: 'Days of Month' },
    { value: 'interval', label: 'Interval' },
  ];

  const specType = $derived($form.specs[index]?.type);
  const spec = $derived($form.specs[index]);

  const typeLabel = $derived(
    specTypeOptions.find((o) => o.value === specType)?.label ?? specType,
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
</script>

{#if expanded}
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
        <Button variant="ghost" leadingIcon="trash" on:click={onRemove} />
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
{:else}
  <button
    type="button"
    class="surface-subtle flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors hover:bg-interactive-secondary-hover"
    onclick={onExpand}
  >
    <span class="min-w-[120px] text-sm font-semibold">{typeLabel}</span>
    <span class="flex-1 truncate text-sm text-secondary">{summary}</span>
    {#if rawValue}
      <span class="shrink-0 font-mono text-sm">{rawValue}</span>
    {/if}
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
  </button>
{/if}
