<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Slider, type SliderOrientation } from '$lib/io-ark/slider';

  import SliderExamples from '../../../examples/slider-examples.svelte';
  import examplesSource from '../../../examples/slider-examples.svelte?raw';

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

  const content = getComponentContent('slider');
  const documentation = getComponentDocumentation('slider');

  const orientations: SliderOrientation[] = ['horizontal', 'vertical'];

  let label = $state('History retention');
  let helperText = $state('Closed workflows are deleted after this period.');
  let error = $state('');
  let suffix = $state(' days');
  let min = $state('1');
  let max = $state('90');
  let step = $state('1');
  let orientation = $state<SliderOrientation>('horizontal');
  let range = $state(false);
  let showMarks = $state(true);
  let showValue = $state(true);
  let labelHidden = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);
  let value = $state([30]);

  const toNumber = (text: string, fallback: number) => {
    const parsed = Number(text);
    return text.trim() === '' || Number.isNaN(parsed) ? fallback : parsed;
  };
  const minValue = $derived(toNumber(min, 0));
  const maxValue = $derived(Math.max(toNumber(max, 100), minValue + 1));
  const stepValue = $derived(Math.max(toNumber(step, 1), 0.01));
  const marks = $derived(
    showMarks
      ? [minValue, Math.round((minValue + maxValue) / 2), maxValue].map(
          (mark) => ({ value: mark }),
        )
      : [],
  );
  const formatValue = (current: number) => `${current}${suffix}`;

  $effect(() => {
    const low = minValue;
    const high = maxValue;
    value = range
      ? [
          low + Math.round((high - low) * 0.25),
          low + Math.round((high - low) * 0.75),
        ]
      : [low + Math.round((high - low) / 3)];
  });

  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { Slider } from '$lib/io-ark/slider';
  let value = $state([${value.join(', ')}]);
</` +
      `script>

<Slider
  label={${JSON.stringify(label)}}${helperText ? `\n  helperText={${JSON.stringify(helperText)}}` : ''}${error ? `\n  error={${JSON.stringify(error)}}` : ''}
  bind:value
  min={${minValue}}
  max={${maxValue}}${stepValue !== 1 ? `\n  step={${stepValue}}` : ''}${orientation !== 'horizontal' ? `\n  orientation="${orientation}"` : ''}${suffix ? `\n  formatValue={(value) => \`\${value}${suffix}\`}` : ''}${showMarks ? `\n  marks={[${marks.map((mark) => `{ value: ${mark.value} }`).join(', ')}]}` : ''}${range ? "\n  thumbLabels={['Minimum', 'Maximum']}" : ''}${!showValue ? '\n  showValue={false}' : ''}${flag('labelHidden', labelHidden)}${flag('readOnly', readOnly)}${flag('disabled', disabled)}
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Slider.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm" class:flex={orientation === 'vertical'}>
        <Slider
          id="slider-preview"
          {label}
          {helperText}
          {error}
          min={minValue}
          max={maxValue}
          step={stepValue}
          {orientation}
          {marks}
          {formatValue}
          {showValue}
          {labelHidden}
          {disabled}
          {readOnly}
          thumbLabels={range ? ['Minimum', 'Maximum'] : []}
          bind:value
        />
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="slider-label" label="Label" bind:value={label} />
      <Input
        id="slider-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="slider-error" label="Error" bind:value={error} />
      <Input id="slider-suffix" label="Value suffix" bind:value={suffix} />
      <Input id="slider-min" label="Min" bind:value={min} />
      <Input id="slider-max" label="Max" bind:value={max} />
      <Input id="slider-step" label="Step" bind:value={step} />
      <SelectControl
        id="slider-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <Checkbox id="slider-range" label="Range" bind:checked={range} />
      <Checkbox id="slider-marks" label="Marks" bind:checked={showMarks} />
      <Checkbox
        id="slider-show-value"
        label="Show value"
        bind:checked={showValue}
      />
      <Checkbox
        id="slider-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox
        id="slider-read-only"
        label="Read-only"
        bind:checked={readOnly}
      />
      <Checkbox id="slider-disabled" label="Disabled" bind:checked={disabled} />
    {/snippet}
  </Playground>
  <AnatomySection slug="slider">
    {#snippet preview()}
      <Slider
        id="slider-anatomy"
        label="Label"
        value={[20, 70]}
        marks={[
          { value: 0, label: '0' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
        ]}
        showValue
        class="w-80"
      />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <SliderExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="slider-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="slider" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
