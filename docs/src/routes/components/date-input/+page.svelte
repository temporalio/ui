<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    DateInput,
    type DateInputGranularity,
    type DateValue,
  } from '$lib/io-poc/date-input';

  import DateInputExamples from '../../../examples/date-input-examples.svelte';
  import examplesSource from '../../../examples/date-input-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('date-input');

  const granularities: DateInputGranularity[] = [
    'day',
    'hour',
    'minute',
    'second',
  ];
  const hourCycles = ['locale', '12', '24'] as const;
  let label = $state('Started after');
  let helperText = $state('Executions that started on or after this date.');
  let error = $state('');
  let granularity = $state<DateInputGranularity>('day');
  let hourCycle = $state<(typeof hourCycles)[number]>('locale');
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);
  let value = $state<DateValue | undefined>();

  const hasTime = $derived(granularity !== 'day');
  const source = $derived(
    `<script lang="ts">
  import { DateInput, type DateValue } from '$lib/io-poc/date-input';
  let value = $state<DateValue | undefined>();
</` +
      `script>

<DateInput
  label={${JSON.stringify(label)}}${helperText ? `\n  helperText={${JSON.stringify(helperText)}}` : ''}${error ? `\n  error={${JSON.stringify(error)}}` : ''}${granularity !== 'day' ? `\n  granularity="${granularity}"` : ''}${hasTime && hourCycle !== 'locale' ? `\n  hourCycle={${hourCycle}}` : ''}${required ? '\n  required' : ''}${disabled ? '\n  disabled' : ''}${readOnly ? '\n  readOnly' : ''}
  bind:value
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={DateInputExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="DateInput.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        {#key `${granularity}-${hourCycle}`}
          <DateInput
            id="date-input-preview"
            {label}
            {helperText}
            {error}
            {granularity}
            hourCycle={hasTime && hourCycle !== 'locale'
              ? (Number(hourCycle) as 12 | 24)
              : undefined}
            {required}
            {disabled}
            {readOnly}
            bind:value
          />
        {/key}
        <p role="status" class="mt-4 text-xs text-secondary">
          Value: {value?.toString() ?? 'none'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="date-input-label" label="Label" bind:value={label} />
      <Input
        id="date-input-helper"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="date-input-error" label="Error" bind:value={error} />
      <SelectControl
        id="date-input-granularity"
        label="Granularity"
        options={granularities}
        bind:value={granularity}
      />
      {#if hasTime}
        <SelectControl
          id="date-input-hour-cycle"
          label="Hour cycle"
          options={hourCycles}
          bind:value={hourCycle}
        />
      {/if}
      <Checkbox
        id="date-input-required"
        label="Required"
        bind:checked={required}
      />
      <Checkbox
        id="date-input-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
      <Checkbox
        id="date-input-read-only"
        label="Read only"
        bind:checked={readOnly}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <DateInput
      id="date-input-anatomy"
      label="Label"
      helperText="Helper text"
      required
      class="w-64"
    />
  {/snippet}
</ComponentPage>
