<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    RadioGroup,
    type RadioGroupOrientation,
  } from '$lib/io-ark/radio-group';

  import RadioGroupExamples from '../../../examples/radio-group-examples.svelte';
  import examplesSource from '../../../examples/radio-group-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('radio-group');

  const items = [
    { value: 'fail', label: 'Fail' },
    { value: 'use-existing', label: 'Use existing' },
    { value: 'terminate', label: 'Terminate existing' },
  ];
  const orientations: RadioGroupOrientation[] = ['vertical', 'horizontal'];

  let label = $state('Workflow ID conflict policy');
  let helperText = $state('Applies when a running workflow uses the same ID.');
  let error = $state('');
  let orientation = $state<RadioGroupOrientation>('vertical');
  let value = $state<string | null>('fail');
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
  import { RadioGroup } from '$lib/io-ark/radio-group';
  let value = $state<string | null>(${JSON.stringify(value)});
</` +
      `script>

<RadioGroup
  label={${JSON.stringify(label)}}${attribute('helperText', helperText)}${attribute('error', error)}${orientation !== 'vertical' ? `\n  orientation="${orientation}"` : ''}
  bind:value${flag('labelHidden', labelHidden)}${flag('required', required)}${flag('readOnly', readOnly)}${flag('disabled', disabled)}
  items={[
${items.map((item) => `    { value: '${item.value}', label: '${item.label}' },`).join('\n')}
  ]}
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={RadioGroupExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="RadioGroup.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <RadioGroup
          id="radio-group-preview"
          {label}
          {helperText}
          {error}
          {orientation}
          {items}
          {labelHidden}
          {required}
          {disabled}
          {readOnly}
          bind:value
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          Selected: {value ?? 'none'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="radio-group-label" label="Label" bind:value={label} />
      <Input
        id="radio-group-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="radio-group-error" label="Error" bind:value={error} />
      <SelectControl
        id="radio-group-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <Checkbox
        id="radio-group-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox
        id="radio-group-required"
        label="Required"
        bind:checked={required}
      />
      <Checkbox
        id="radio-group-read-only"
        label="Read-only"
        bind:checked={readOnly}
      />
      <Checkbox
        id="radio-group-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <RadioGroup
      id="radio-group-anatomy"
      label="Label"
      helperText="Helper text"
      value="one"
      items={[
        { value: 'one', label: 'Option one' },
        { value: 'two', label: 'Option two' },
        { value: 'three', label: 'Option three' },
      ]}
    />
  {/snippet}
</ComponentPage>
