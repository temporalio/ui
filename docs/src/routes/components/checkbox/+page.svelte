<script lang="ts">
  import HoloceneCheckbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Checkbox } from '$lib/io-ark/checkbox';

  import CheckboxExamples from '../../../examples/checkbox-examples.svelte';
  import examplesSource from '../../../examples/checkbox-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('checkbox');

  let label = $state('Retry failed activities');
  let helperText = $state('Applies to activities that fail after this change.');
  let error = $state('');
  let checked = $state(false);
  let indeterminate = $state(false);
  let disabled = $state(false);
  let required = $state(false);
  let readOnly = $state(false);
  let labelHidden = $state(false);

  const source = $derived(
    `<script lang="ts">
  import { Checkbox } from '$lib/io-ark/checkbox';
  let checked = $state(${checked});
</` +
      `script>

<Checkbox
  label={${JSON.stringify(label)}}${helperText ? `\n  helperText={${JSON.stringify(helperText)}}` : ''}${error ? `\n  error={${JSON.stringify(error)}}` : ''}
  bind:checked${indeterminate ? '\n  indeterminate' : ''}${labelHidden ? '\n  labelHidden' : ''}${required ? '\n  required' : ''}${readOnly ? '\n  readOnly' : ''}${disabled ? '\n  disabled' : ''}
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={CheckboxExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Checkbox.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <Checkbox
          id="checkbox-preview"
          {label}
          {helperText}
          {error}
          {indeterminate}
          {labelHidden}
          {required}
          {readOnly}
          {disabled}
          bind:checked
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          {checked ? 'Checked' : 'Not checked'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="checkbox-label" label="Label" bind:value={label} />
      <Input
        id="checkbox-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="checkbox-error" label="Error" bind:value={error} />
      <HoloceneCheckbox id="checkbox-checked" label="Checked" bind:checked />
      <HoloceneCheckbox
        id="checkbox-indeterminate"
        label="Indeterminate"
        bind:checked={indeterminate}
      />
      <HoloceneCheckbox
        id="checkbox-label-hidden"
        label="Label hidden"
        bind:checked={labelHidden}
      />
      <HoloceneCheckbox
        id="checkbox-required"
        label="Required"
        bind:checked={required}
      />
      <HoloceneCheckbox
        id="checkbox-read-only"
        label="Read only"
        bind:checked={readOnly}
      />
      <HoloceneCheckbox
        id="checkbox-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <Checkbox id="checkbox-anatomy" label="Label" required />
  {/snippet}
</ComponentPage>
