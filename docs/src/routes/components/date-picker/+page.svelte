<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    DatePicker,
    type DateValue,
    parseDate,
  } from '$lib/io-poc/date-picker';

  import DatePickerExamples from '../../../examples/date-picker-examples.svelte';
  import examplesSource from '../../../examples/date-picker-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('date-picker');

  const selectionModes = ['single', 'range'] as const;
  let selectionMode = $state<(typeof selectionModes)[number]>('single');
  let label = $state('Schedule start date');
  let helperText = $state('The first action runs on this date.');
  let error = $state('');
  let closeOnSelect = $state(true);
  let showToday = $state(true);
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);
  let value = $state<DateValue[]>([]);

  const isRange = $derived(selectionMode === 'range');
  const source = $derived(
    `<script lang="ts">
  import { DatePicker, type DateValue } from '$lib/io-poc/date-picker';
  let value = $state<DateValue[]>([]);
</` +
      `script>

<DatePicker
  label={${JSON.stringify(label)}}${isRange ? '\n  selectionMode="range"' : ''}${helperText ? `\n  helperText={${JSON.stringify(helperText)}}` : ''}${error ? `\n  error={${JSON.stringify(error)}}` : ''}${!closeOnSelect ? '\n  closeOnSelect={false}' : ''}${!isRange && !showToday ? '\n  showToday={false}' : ''}${required ? '\n  required' : ''}${disabled ? '\n  disabled' : ''}${readOnly ? '\n  readOnly' : ''}
  bind:value
/>`,
  );

  $effect(() => {
    void selectionMode;
    value = [];
  });
</script>

<ComponentPage
  component={documentation}
  examples={DatePickerExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="DatePicker.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        {#key selectionMode}
          <DatePicker
            id="date-picker-preview"
            {label}
            {selectionMode}
            {helperText}
            {error}
            {closeOnSelect}
            {showToday}
            {required}
            {disabled}
            {readOnly}
            bind:value
          />
        {/key}
        <p role="status" class="mt-4 text-xs text-secondary">
          {value.length
            ? value.map((date) => date.toString()).join(' – ')
            : 'No date selected'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="date-picker-selection-mode"
        label="Selection mode"
        options={selectionModes}
        bind:value={selectionMode}
      />
      <Input id="date-picker-label" label="Label" bind:value={label} />
      <Input
        id="date-picker-helper"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="date-picker-error" label="Error" bind:value={error} />
      <Checkbox
        id="date-picker-close-on-select"
        label="Close on select"
        bind:checked={closeOnSelect}
      />
      {#if !isRange}
        <Checkbox
          id="date-picker-show-today"
          label="Show today"
          bind:checked={showToday}
        />
      {/if}
      <Checkbox
        id="date-picker-required"
        label="Required"
        bind:checked={required}
      />
      <Checkbox
        id="date-picker-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
      <Checkbox
        id="date-picker-read-only"
        label="Read only"
        bind:checked={readOnly}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <div class="w-[320px]">
      <DatePicker
        id="date-picker-anatomy"
        label="Schedule start date"
        value={[parseDate('2026-10-14')]}
        inline
      />
    </div>
  {/snippet}
</ComponentPage>
