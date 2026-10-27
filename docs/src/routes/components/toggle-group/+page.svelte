<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { IconCode, IconCompact, IconTable } from '$lib/io/icon';
  import {
    ToggleGroup,
    type ToggleGroupOrientation,
    type ToggleGroupSize,
  } from '$lib/io-poc/toggle-group';

  import ToggleGroupExamples from '../../../examples/toggle-group-examples.svelte';
  import examplesSource from '../../../examples/toggle-group-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('toggle-group');

  const items = [
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];
  const sizes: ToggleGroupSize[] = ['sm', 'md'];
  const orientations: ToggleGroupOrientation[] = ['horizontal', 'vertical'];
  let label = $state('Workflow status');
  let size = $state<ToggleGroupSize>('md');
  let orientation = $state<ToggleGroupOrientation>('horizontal');
  let multiple = $state(false);
  let deselectable = $state(false);
  let disabled = $state(false);
  let value = $state<string[]>(['running']);

  const source = $derived(
    `<script lang="ts">
  import { ToggleGroup } from '$lib/io-poc/toggle-group';
  let value = $state<string[]>(${JSON.stringify(value)});
</` +
      `script>

<ToggleGroup
  label={${JSON.stringify(label)}}
  items={[
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ]}
  size="${size}"${orientation === 'vertical' ? '\n  orientation="vertical"' : ''}${multiple ? '\n  multiple' : ''}${deselectable ? '\n  deselectable' : ''}${disabled ? '\n  disabled' : ''}
  bind:value
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={ToggleGroupExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="ToggleGroup.svelte">
    {#snippet preview()}
      {#key multiple}
        <ToggleGroup
          {label}
          {items}
          {size}
          {orientation}
          {multiple}
          {deselectable}
          {disabled}
          bind:value
        />
      {/key}
      <p role="status" class="text-xs text-secondary">
        Pressed: {value.length ? value.join(', ') : 'none'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="toggle-group-label" label="Label" bind:value={label} />
      <SelectControl
        id="toggle-group-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <SelectControl
        id="toggle-group-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <Checkbox
        id="toggle-group-multiple"
        label="Multiple"
        bind:checked={multiple}
      />
      <Checkbox
        id="toggle-group-deselectable"
        label="Deselectable"
        bind:checked={deselectable}
      />
      <Checkbox
        id="toggle-group-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <ToggleGroup
      id="toggle-group-anatomy"
      label="History view"
      value={['timeline']}
      items={[
        { value: 'compact', label: 'Compact', Icon: IconCompact },
        { value: 'timeline', label: 'Timeline', Icon: IconTable },
        { value: 'json', label: 'JSON', Icon: IconCode },
      ]}
    />
  {/snippet}
</ComponentPage>
