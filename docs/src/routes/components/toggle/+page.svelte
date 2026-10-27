<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { IconPin, IconPinSolid } from '$lib/io/icon';
  import { Toggle, type ToggleSize } from '$lib/io-poc/toggle';

  import ToggleExamples from '../../../examples/toggle-examples.svelte';
  import examplesSource from '../../../examples/toggle-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('toggle');

  const sizes: ToggleSize[] = ['sm', 'md'];
  let label = $state('Pin workflow');
  let size = $state<ToggleSize>('md');
  let pressed = $state(false);
  let icon = $state(true);
  let iconOnly = $state(false);
  let disabled = $state(false);

  const source = $derived(
    `<script lang="ts">
  import { Toggle } from '$lib/io-poc/toggle';${icon ? "\n  import { IconPin, IconPinSolid } from '$lib/io/icon';" : ''}
  let pressed = $state(${pressed});
</` +
      `script>

<Toggle
  ${iconOnly ? 'aria-label' : 'label'}={${JSON.stringify(label)}}
  size="${size}"${icon ? '\n  Icon={IconPin}\n  PressedIcon={IconPinSolid}' : ''}${disabled ? '\n  disabled' : ''}
  bind:pressed
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={ToggleExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Toggle.svelte">
    {#snippet preview()}
      {#if iconOnly}
        <Toggle
          aria-label={label}
          {size}
          {disabled}
          Icon={icon ? IconPin : undefined}
          PressedIcon={icon ? IconPinSolid : undefined}
          bind:pressed
        />
      {:else}
        <Toggle
          {label}
          {size}
          {disabled}
          Icon={icon ? IconPin : undefined}
          PressedIcon={icon ? IconPinSolid : undefined}
          bind:pressed
        />
      {/if}
      <p role="status" class="text-xs text-secondary">
        {pressed ? 'On' : 'Off'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="toggle-label" label="Label" bind:value={label} />
      <SelectControl
        id="toggle-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox id="toggle-pressed" label="Pressed" bind:checked={pressed} />
      <Checkbox id="toggle-icon" label="Icon" bind:checked={icon} />
      <Checkbox
        id="toggle-icon-only"
        label="Icon only"
        bind:checked={iconOnly}
      />
      <Checkbox id="toggle-disabled" label="Disabled" bind:checked={disabled} />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <Toggle
      id="toggle-anatomy"
      label="Pin workflow"
      Icon={IconPin}
      PressedIcon={IconPinSolid}
      pressed
    />
  {/snippet}
</ComponentPage>
