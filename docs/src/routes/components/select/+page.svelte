<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Select } from '$lib/io-ark/select';

  import SelectExamples from '../../../examples/select-examples.svelte';
  import examplesSource from '../../../examples/select-examples.svelte?raw';

  import AnatomySection from '$docs/components/anatomy-section.svelte';
  import ComponentPage from '$docs/components/component-page.svelte';
  import ContractSection from '$docs/components/contract-section.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import MarkdownContent from '$docs/components/markdown-content.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import {
    getComponentContent,
    getComponentDocumentation,
  } from '$docs/data/components';

  const content = getComponentContent('select');
  const documentation = getComponentDocumentation('select');

  const statuses = ['Running', 'Completed', 'Failed', 'Canceled', 'Terminated'];

  let label = $state('Execution status');
  let placeholder = $state('Any status');
  let helperText = $state('');
  let error = $state('');
  let multiple = $state(false);
  let clearable = $state(false);
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);
  let value = $state<string[]>([]);

  $effect(() => {
    if (!multiple && value.length > 1) value = value.slice(0, 1);
  });

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { Select } from '$lib/io-ark/select';
  const statuses = ${JSON.stringify(statuses)};
  let value = $state<string[]>(${JSON.stringify(value)});
</` +
      `script>

<Select
  label={${JSON.stringify(label)}}
  items={statuses}
  bind:value${attribute('placeholder', placeholder)}${attribute('helperText', helperText)}${attribute('error', error)}${flag('multiple', multiple)}${flag('clearable', clearable)}${flag('required', required)}${flag('disabled', disabled)}${flag('readOnly', readOnly)}
/>`,
  );

  let anatomyOpen = $state(true);
  $effect(() => {
    if (!anatomyOpen) anatomyOpen = true;
  });
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Select.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <Select
          id="select-preview"
          {label}
          items={statuses}
          bind:value
          {placeholder}
          {helperText}
          {error}
          {multiple}
          {clearable}
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
      <Input id="select-label" label="Label" bind:value={label} />
      <Input
        id="select-placeholder"
        label="Placeholder"
        bind:value={placeholder}
      />
      <Input
        id="select-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="select-error" label="Error" bind:value={error} />
      <Checkbox id="select-multiple" label="Multiple" bind:checked={multiple} />
      <Checkbox
        id="select-clearable"
        label="Clearable"
        bind:checked={clearable}
      />
      <Checkbox id="select-required" label="Required" bind:checked={required} />
      <Checkbox id="select-disabled" label="Disabled" bind:checked={disabled} />
      <Checkbox
        id="select-read-only"
        label="Read only"
        bind:checked={readOnly}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="select">
    {#snippet preview()}
      <div class="h-72 w-[320px]">
        <Select
          id="select-anatomy"
          label="Execution status"
          items={['Running', 'Completed', 'Failed', 'Terminated']}
          value={['Completed']}
          bind:open={anatomyOpen}
          portalled={false}
          onInteractOutside={(event) => event.preventDefault()}
        />
      </div>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <SelectExamples />
      <SourceCode
        code={examplesSource}
        filename="select-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="select" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
