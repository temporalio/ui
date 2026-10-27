<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    type ProgressColorScheme,
    ProgressLinear,
    type ProgressLinearSize,
  } from '$lib/io-ark/progress';

  import ProgressLinearExamples from '../../../examples/progress-linear-examples.svelte';
  import examplesSource from '../../../examples/progress-linear-examples.svelte?raw';

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

  const content = getComponentContent('progress-linear');
  const documentation = getComponentDocumentation('progress-linear');

  const colorSchemes: ProgressColorScheme[] = [
    'brand',
    'success',
    'warning',
    'danger',
  ];
  const sizes: ProgressLinearSize[] = ['sm', 'md'];
  let label = $state('Batch terminate');
  let valueText = $state('34');
  let colorScheme = $state<ProgressColorScheme>('brand');
  let size = $state<ProgressLinearSize>('md');
  let indeterminate = $state(false);
  let showValue = $state(true);
  let labelHidden = $state(false);

  const value = $derived(
    indeterminate ? null : Math.min(100, Math.max(0, Number(valueText) || 0)),
  );

  const source = $derived(
    `<script lang="ts">
  import { ProgressLinear } from '$lib/io-ark/progress';
</` +
      `script>

<ProgressLinear
  label={${JSON.stringify(label)}}
  value={${value === null ? 'null' : value}}
  size="${size}"
  colorScheme="${colorScheme}"${showValue ? '' : '\n  showValue={false}'}${labelHidden ? '\n  labelHidden' : ''}
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="ProgressLinear.svelte">
    {#snippet preview()}
      <div class="w-full max-w-md">
        <ProgressLinear
          {label}
          {value}
          {size}
          {colorScheme}
          {showValue}
          {labelHidden}
        />
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="progress-linear-label" label="Label" bind:value={label} />
      <Input
        id="progress-linear-value"
        label="Value (0–100)"
        type="number"
        bind:value={valueText}
      />
      <SelectControl
        id="progress-linear-color"
        label="Color scheme"
        options={colorSchemes}
        bind:value={colorScheme}
      />
      <SelectControl
        id="progress-linear-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox
        id="progress-linear-indeterminate"
        label="Indeterminate"
        bind:checked={indeterminate}
      />
      <Checkbox
        id="progress-linear-show-value"
        label="Show value"
        bind:checked={showValue}
      />
      <Checkbox
        id="progress-linear-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="progress-linear">
    {#snippet preview()}
      <ProgressLinear
        id="progress-linear-anatomy"
        label="Batch terminate"
        value={34}
        class="w-full"
      />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <ProgressLinearExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="progress-linear-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="progress-linear" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
