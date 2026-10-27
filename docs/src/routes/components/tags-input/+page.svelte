<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { TagsInput } from '$lib/io-ark/tags-input';

  import TagsInputExamples from '../../../examples/tags-input-examples.svelte';
  import examplesSource from '../../../examples/tags-input-examples.svelte?raw';

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

  const content = getComponentContent('tags-input');
  const documentation = getComponentDocumentation('tags-input');

  let label = $state('Task queues');
  let placeholder = $state('Add a task queue');
  let helperText = $state('Press Enter or comma to add.');
  let error = $state('');
  let max = $state('');
  let clearable = $state(true);
  let editable = $state(true);
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);
  let value = $state<string[]>(['orders-task-queue']);

  const maxTags = $derived(Number(max) > 0 ? Number(max) : undefined);

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { TagsInput } from '$lib/io-ark/tags-input';
  let value = $state<string[]>(${JSON.stringify(value)});
</` +
      `script>

<TagsInput
  label={${JSON.stringify(label)}}
  bind:value${attribute('placeholder', placeholder)}${attribute('helperText', helperText)}${attribute('error', error)}${maxTags ? `\n  max={${maxTags}}` : ''}${flag('clearable', clearable)}${editable ? '' : '\n  editable={false}'}${flag('required', required)}${flag('disabled', disabled)}${flag('readOnly', readOnly)}
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="TagsInput.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <TagsInput
          id="tags-input-preview"
          {label}
          bind:value
          {placeholder}
          {helperText}
          {error}
          max={maxTags}
          {clearable}
          {editable}
          {required}
          {disabled}
          {readOnly}
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          Tags: {value.length ? value.join(', ') : 'none'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="tags-input-label" label="Label" bind:value={label} />
      <Input
        id="tags-input-placeholder"
        label="Placeholder"
        bind:value={placeholder}
      />
      <Input
        id="tags-input-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="tags-input-error" label="Error" bind:value={error} />
      <Input id="tags-input-max" label="Max tags" bind:value={max} />
      <Checkbox
        id="tags-input-clearable"
        label="Clearable"
        bind:checked={clearable}
      />
      <Checkbox
        id="tags-input-editable"
        label="Editable"
        bind:checked={editable}
      />
      <Checkbox
        id="tags-input-required"
        label="Required"
        bind:checked={required}
      />
      <Checkbox
        id="tags-input-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
      <Checkbox
        id="tags-input-read-only"
        label="Read only"
        bind:checked={readOnly}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="tags-input">
    {#snippet preview()}
      <div class="w-[360px]">
        <TagsInput
          id="tags-input-anatomy"
          label="Task queues"
          value={['orders', 'billing']}
          placeholder="Add a task queue"
          clearable
        />
      </div>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <TagsInputExamples />
      <SourceCode
        code={examplesSource}
        filename="tags-input-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="tags-input" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
