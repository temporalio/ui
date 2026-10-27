<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Switch, type SwitchSize } from '$lib/io-poc/switch';

  import SwitchExamples from '../../../examples/switch-examples.svelte';
  import examplesSource from '../../../examples/switch-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('switch');

  const sizes: SwitchSize[] = ['md', 'sm'];

  let label = $state('Pause schedule');
  let helperText = $state('No new workflows start while paused.');
  let error = $state('');
  let size = $state<SwitchSize>('md');
  let checked = $state(false);
  let labelHidden = $state(false);
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { Switch } from '$lib/io-poc/switch';
  let checked = $state(${checked});
</` +
      `script>

<Switch
  label={${JSON.stringify(label)}}${attribute('helperText', helperText)}${attribute('error', error)}${size !== 'md' ? `\n  size="${size}"` : ''}
  bind:checked${flag('labelHidden', labelHidden)}${flag('required', required)}${flag('readOnly', readOnly)}${flag('disabled', disabled)}
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={SwitchExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Switch.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <Switch
          id="switch-preview"
          {label}
          {helperText}
          {error}
          {size}
          {labelHidden}
          {required}
          {disabled}
          {readOnly}
          bind:checked
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          {checked ? 'On' : 'Off'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="switch-label" label="Label" bind:value={label} />
      <Input
        id="switch-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="switch-error" label="Error" bind:value={error} />
      <SelectControl
        id="switch-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox id="switch-checked" label="Checked" bind:checked />
      <Checkbox
        id="switch-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox id="switch-required" label="Required" bind:checked={required} />
      <Checkbox
        id="switch-read-only"
        label="Read-only"
        bind:checked={readOnly}
      />
      <Checkbox id="switch-disabled" label="Disabled" bind:checked={disabled} />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <Switch
      id="switch-anatomy"
      label="Label"
      helperText="Helper text"
      checked
    />
  {/snippet}
</ComponentPage>
