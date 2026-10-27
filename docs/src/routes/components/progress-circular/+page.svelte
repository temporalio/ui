<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    ProgressCircular,
    type ProgressCircularSize,
    type ProgressColorScheme,
  } from '$lib/io-ark/progress';

  import ProgressCircularExamples from '../../../examples/progress-circular-examples.svelte';
  import examplesSource from '../../../examples/progress-circular-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('progress-circular');

  const colorSchemes: ProgressColorScheme[] = [
    'brand',
    'success',
    'warning',
    'danger',
  ];
  const sizes: ProgressCircularSize[] = ['sm', 'md', 'lg'];
  let label = $state('Workers upgraded');
  let valueText = $state('75');
  let colorScheme = $state<ProgressColorScheme>('brand');
  let size = $state<ProgressCircularSize>('lg');
  let indeterminate = $state(false);
  let showValue = $state(true);
  let labelHidden = $state(false);

  const value = $derived(
    indeterminate ? null : Math.min(100, Math.max(0, Number(valueText) || 0)),
  );

  const source = $derived(
    `<script lang="ts">
  import { ProgressCircular } from '$lib/io-ark/progress';
</` +
      `script>

<ProgressCircular
  label={${JSON.stringify(label)}}
  value={${value === null ? 'null' : value}}
  size="${size}"
  colorScheme="${colorScheme}"${showValue ? '\n  showValue' : ''}${labelHidden ? '\n  labelHidden' : ''}
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={ProgressCircularExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="ProgressCircular.svelte">
    {#snippet preview()}
      <ProgressCircular
        {label}
        {value}
        {size}
        {colorScheme}
        {showValue}
        {labelHidden}
      />
    {/snippet}
    {#snippet controls()}
      <Input id="progress-circular-label" label="Label" bind:value={label} />
      <Input
        id="progress-circular-value"
        label="Value (0–100)"
        type="number"
        bind:value={valueText}
      />
      <SelectControl
        id="progress-circular-color"
        label="Color scheme"
        options={colorSchemes}
        bind:value={colorScheme}
      />
      <SelectControl
        id="progress-circular-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox
        id="progress-circular-indeterminate"
        label="Indeterminate"
        bind:checked={indeterminate}
      />
      <Checkbox
        id="progress-circular-show-value"
        label="Show value"
        bind:checked={showValue}
      />
      <Checkbox
        id="progress-circular-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <ProgressCircular
      id="progress-circular-anatomy"
      label="Workers upgraded"
      value={65}
      size="lg"
      showValue
    />
  {/snippet}
</ComponentPage>
