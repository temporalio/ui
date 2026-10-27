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

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

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

<ComponentPage
  component={documentation}
  examples={ProgressLinearExamples}
  {examplesSource}
  framed
>
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
  {#snippet anatomy()}
    <ProgressLinear
      id="progress-linear-anatomy"
      label="Batch terminate"
      value={34}
      class="w-full"
    />
  {/snippet}
</ComponentPage>
