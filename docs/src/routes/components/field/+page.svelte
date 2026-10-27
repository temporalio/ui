<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Field, FieldInput, FieldTextarea } from '$lib/io-ark/field';

  import FieldExamples from '../../../examples/field-examples.svelte';
  import examplesSource from '../../../examples/field-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('field');

  const controlTypes = ['FieldInput', 'FieldTextarea'] as const;
  let control = $state<(typeof controlTypes)[number]>('FieldInput');
  let label = $state('Workflow ID');
  let helperText = $state('Must be unique within the namespace.');
  let error = $state('');
  let placeholder = $state('order-processing-1042');
  let value = $state('');
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
  import { Field, ${control} } from '$lib/io-ark/field';
  let value = $state('');
</` +
      `script>

<Field
  label={${JSON.stringify(label)}}${attribute('helperText', helperText)}${attribute('error', error)}${flag('labelHidden', labelHidden)}${flag('required', required)}${flag('disabled', disabled)}${flag('readOnly', readOnly)}
>
  <${control} bind:value${placeholder ? ` placeholder={${JSON.stringify(placeholder)}}` : ''} />
</Field>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={FieldExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Field.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <Field
          id="field-preview"
          {label}
          {helperText}
          {error}
          {labelHidden}
          {required}
          {disabled}
          {readOnly}
        >
          {#if control === 'FieldTextarea'}
            <FieldTextarea bind:value {placeholder} />
          {:else}
            <FieldInput bind:value {placeholder} />
          {/if}
        </Field>
      </div>
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="field-control"
        label="Control"
        options={controlTypes}
        bind:value={control}
      />
      <Input id="field-label" label="Label" bind:value={label} />
      <Input
        id="field-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="field-error" label="Error" bind:value={error} />
      <Input
        id="field-placeholder"
        label="Placeholder"
        bind:value={placeholder}
      />
      <Checkbox
        id="field-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox id="field-required" label="Required" bind:checked={required} />
      <Checkbox id="field-disabled" label="Disabled" bind:checked={disabled} />
      <Checkbox
        id="field-read-only"
        label="Read-only"
        bind:checked={readOnly}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <Field
      id="field-anatomy"
      label="Label"
      helperText="Helper text"
      error="Error text"
      required
      class="w-64"
    >
      <FieldInput placeholder="Value" />
    </Field>
  {/snippet}
</ComponentPage>
