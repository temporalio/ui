<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Combobox } from '$lib/io-ark/combobox';

  import ComboboxExamples from '../../../examples/combobox-examples.svelte';
  import examplesSource from '../../../examples/combobox-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('combobox');

  const workflowTypes = [
    'OrderFulfillmentWorkflow',
    'PaymentWorkflow',
    'InventorySyncWorkflow',
    'SubscriptionRenewalWorkflow',
    'RefundWorkflow',
  ];

  let label = $state('Workflow type');
  let placeholder = $state('Search workflow types');
  let helperText = $state('');
  let error = $state('');
  let multiple = $state(false);
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);
  let allowCustomValue = $state(false);
  let value = $state<string[]>([]);

  $effect(() => {
    if (!multiple && value.length > 1) value = value.slice(0, 1);
  });

  const source = $derived(
    `<script lang="ts">
  import { Combobox } from '$lib/io-ark/combobox';
  const workflowTypes = ${JSON.stringify(workflowTypes, null, 2).replace(/\n/g, '\n  ')};
  let value = $state<string[]>(${JSON.stringify(value)});
</` +
      `script>

<Combobox
  label={${JSON.stringify(label)}}
  items={workflowTypes}
  bind:value${placeholder ? `\n  placeholder={${JSON.stringify(placeholder)}}` : ''}${helperText ? `\n  helperText={${JSON.stringify(helperText)}}` : ''}${error ? `\n  error={${JSON.stringify(error)}}` : ''}${multiple ? '\n  multiple' : ''}${allowCustomValue ? '\n  allowCustomValue' : ''}${required ? '\n  required' : ''}${disabled ? '\n  disabled' : ''}${readOnly ? '\n  readOnly' : ''}
/>`,
  );

  let anatomyOpen = $state(true);
  $effect(() => {
    if (!anatomyOpen) anatomyOpen = true;
  });
</script>

<ComponentPage
  component={documentation}
  examples={ComboboxExamples}
  {examplesSource}
>
  <Playground {source} filename="Combobox.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <Combobox
          id="combobox-preview"
          {label}
          items={workflowTypes}
          bind:value
          {placeholder}
          {helperText}
          {error}
          {multiple}
          {allowCustomValue}
          {required}
          {disabled}
          {readOnly}
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          Selected: {value.length ? value.join(', ') : 'none'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="combobox-label" label="Label" bind:value={label} />
      <Input
        id="combobox-placeholder"
        label="Placeholder"
        bind:value={placeholder}
      />
      <Input
        id="combobox-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="combobox-error" label="Error" bind:value={error} />
      <Checkbox
        id="combobox-multiple"
        label="Multiple"
        bind:checked={multiple}
      />
      <Checkbox
        id="combobox-custom-value"
        label="Allow custom value"
        bind:checked={allowCustomValue}
      />
      <Checkbox
        id="combobox-required"
        label="Required"
        bind:checked={required}
      />
      <Checkbox
        id="combobox-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
      <Checkbox
        id="combobox-read-only"
        label="Read only"
        bind:checked={readOnly}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <div class="h-64 w-[320px]">
      <Combobox
        id="combobox-anatomy"
        label="Namespace"
        items={[
          'payments-prod',
          'orders-prod',
          'billing-staging',
          'search-dev',
        ]}
        value={['orders-prod']}
        bind:open={anatomyOpen}
        portalled={false}
        clearable={false}
        onInteractOutside={(event) => event.preventDefault()}
      />
    </div>
  {/snippet}
</ComponentPage>
