<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { NumberInput } from '$lib/io-ark/number-input';

  import NumberInputExamples from '../../../examples/number-input-examples.svelte';
  import examplesSource from '../../../examples/number-input-examples.svelte?raw';

  import AnatomySection from '$docs/components/anatomy-section.svelte';
  import ComponentPage from '$docs/components/component-page.svelte';
  import ContractSection from '$docs/components/contract-section.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import MarkdownContent from '$docs/components/markdown-content.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import {
    getComponentContent,
    getComponentDocumentation,
  } from '$docs/data/components';

  const content = getComponentContent('number-input');
  const documentation = getComponentDocumentation('number-input');

  let label = $state('Maximum attempts');
  let helperText = $state('Use 0 for unlimited attempts.');
  let error = $state('');
  let unit = $state('');
  let min = $state('0');
  let max = $state('100');
  let step = $state('1');
  let value = $state('5');
  let valueAsNumber = $state(5);
  let labelHidden = $state(false);
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);

  const toNumber = (text: string, fallback: number) => {
    const parsed = Number(text);
    return text.trim() === '' || Number.isNaN(parsed) ? fallback : parsed;
  };
  const minValue = $derived(toNumber(min, 0));
  const maxValue = $derived(toNumber(max, 100));
  const stepValue = $derived(toNumber(step, 1));

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { NumberInput } from '$lib/io-ark/number-input';
  let value = $state(${JSON.stringify(value)});
</` +
      `script>

<NumberInput
  label={${JSON.stringify(label)}}${attribute('helperText', helperText)}${attribute('error', error)}${attribute('unit', unit)}
  bind:value
  min={${minValue}}
  max={${maxValue}}${stepValue !== 1 ? `\n  step={${stepValue}}` : ''}${flag('labelHidden', labelHidden)}${flag('required', required)}${flag('readOnly', readOnly)}${flag('disabled', disabled)}
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="NumberInput.svelte">
    {#snippet preview()}
      <div class="w-full max-w-xs">
        <NumberInput
          id="number-input-preview"
          {label}
          {helperText}
          {error}
          {unit}
          min={minValue}
          max={maxValue}
          step={stepValue}
          {labelHidden}
          {required}
          {disabled}
          {readOnly}
          bind:value
          onValueChange={(details) => (valueAsNumber = details.valueAsNumber)}
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          valueAsNumber: {Number.isNaN(valueAsNumber) ? 'NaN' : valueAsNumber}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="number-input-label" label="Label" bind:value={label} />
      <Input
        id="number-input-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="number-input-error" label="Error" bind:value={error} />
      <Input id="number-input-unit" label="Unit" bind:value={unit} />
      <Input id="number-input-min" label="Min" bind:value={min} />
      <Input id="number-input-max" label="Max" bind:value={max} />
      <Input id="number-input-step" label="Step" bind:value={step} />
      <Checkbox
        id="number-input-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox
        id="number-input-required"
        label="Required"
        bind:checked={required}
      />
      <Checkbox
        id="number-input-read-only"
        label="Read-only"
        bind:checked={readOnly}
      />
      <Checkbox
        id="number-input-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="number-input">
    {#snippet preview()}
      <NumberInput
        id="number-input-anatomy"
        label="Label"
        helperText="Helper text"
        value="5"
        class="w-64"
      />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <NumberInputExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="number-input-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="number-input" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
