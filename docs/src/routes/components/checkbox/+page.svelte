<script lang="ts">
  import HoloceneCheckbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Checkbox } from '$lib/io-ark/checkbox';

  import CheckboxExamples from '../../../examples/checkbox-examples.svelte';
  import examplesSource from '../../../examples/checkbox-examples.svelte?raw';

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

  const content = getComponentContent('checkbox');
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

<ComponentPage component={documentation}>
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
  <AnatomySection slug="checkbox">
    {#snippet preview()}
      <Checkbox id="checkbox-anatomy" label="Label" required />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <CheckboxExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="checkbox-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="checkbox" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
