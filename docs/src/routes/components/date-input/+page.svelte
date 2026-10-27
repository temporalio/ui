<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    DateInput,
    type DateInputGranularity,
    type DateValue,
  } from '$lib/io-ark/date-input';

  import DateInputExamples from '../../../examples/date-input-examples.svelte';
  import examplesSource from '../../../examples/date-input-examples.svelte?raw';

  import AnatomySection from '$docs/components/anatomy-section.svelte';
  import ComponentPage from '$docs/components/component-page.svelte';
  import ContractSection from '$docs/components/contract-section.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import MarkdownContent from '$docs/components/markdown-content.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import {
    getComponentContent,
    getComponentDocumentation,
  } from '$docs/data/components';

  const content = getComponentContent('date-input');
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
  import { DateInput, type DateValue } from '$lib/io-ark/date-input';
  let value = $state<DateValue | undefined>();
</` +
      `script>

<DateInput
  label={${JSON.stringify(label)}}${helperText ? `\n  helperText={${JSON.stringify(helperText)}}` : ''}${error ? `\n  error={${JSON.stringify(error)}}` : ''}${granularity !== 'day' ? `\n  granularity="${granularity}"` : ''}${hasTime && hourCycle !== 'locale' ? `\n  hourCycle={${hourCycle}}` : ''}${required ? '\n  required' : ''}${disabled ? '\n  disabled' : ''}${readOnly ? '\n  readOnly' : ''}
  bind:value
/>`,
  );
</script>

<ComponentPage component={documentation}>
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
  <AnatomySection slug="date-input">
    {#snippet preview()}
      <DateInput
        id="date-input-anatomy"
        label="Label"
        helperText="Helper text"
        required
        class="w-64"
      />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <DateInputExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="date-input-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="date-input" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
