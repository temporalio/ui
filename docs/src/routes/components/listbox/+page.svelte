<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Listbox, type ListboxSelectionMode } from '$lib/io-ark/listbox';

  import ListboxExamples from '../../../examples/listbox-examples.svelte';
  import examplesSource from '../../../examples/listbox-examples.svelte?raw';

  import AnatomySection from '$docs/components/anatomy-section.svelte';
  import ComponentPage from '$docs/components/component-page.svelte';
  import ContractSection from '$docs/components/contract-section.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import MarkdownContent from '$docs/components/markdown-content.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import {
    getComponentContent,
    getComponentDocumentation,
  } from '$docs/data/components';

  const content = getComponentContent('listbox');
  const documentation = getComponentDocumentation('listbox');

  const taskQueues = [
    'orders-task-queue',
    'payments-task-queue',
    'inventory-task-queue',
    'notifications-task-queue',
    'refunds-task-queue',
  ];
  const selectionModes: ListboxSelectionMode[] = [
    'single',
    'multiple',
    'extended',
  ];
  const orientations = ['vertical', 'horizontal'] as const;

  let label = $state('Task queue');
  let helperText = $state('');
  let error = $state('');
  let selectionMode = $state<ListboxSelectionMode>('single');
  let orientation = $state<(typeof orientations)[number]>('vertical');
  let filterable = $state(false);
  let disabled = $state(false);
  let value = $state<string[]>([]);

  $effect(() => {
    if (selectionMode === 'single' && value.length > 1)
      value = value.slice(0, 1);
  });

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { Listbox } from '$lib/io-ark/listbox';
  const taskQueues = ${JSON.stringify(taskQueues, null, 2).replace(/\n/g, '\n  ')};
  let value = $state<string[]>(${JSON.stringify(value)});
</` +
      `script>

<Listbox
  label={${JSON.stringify(label)}}
  items={taskQueues}
  bind:value${selectionMode !== 'single' ? `\n  selectionMode="${selectionMode}"` : ''}${orientation !== 'vertical' ? `\n  orientation="${orientation}"` : ''}${attribute('helperText', helperText)}${attribute('error', error)}${flag('filterable', filterable)}${flag('disabled', disabled)}
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Listbox.svelte">
    {#snippet preview()}
      <div class="w-full max-w-md">
        <Listbox
          id="listbox-preview"
          {label}
          items={taskQueues}
          bind:value
          {selectionMode}
          {orientation}
          {helperText}
          {error}
          {filterable}
          {disabled}
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          Selected: {value.length ? value.join(', ') : 'none'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="listbox-label" label="Label" bind:value={label} />
      <Input
        id="listbox-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="listbox-error" label="Error" bind:value={error} />
      <SelectControl
        id="listbox-selection-mode"
        label="Selection mode"
        options={selectionModes}
        bind:value={selectionMode}
      />
      <SelectControl
        id="listbox-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <Checkbox
        id="listbox-filterable"
        label="Filterable"
        bind:checked={filterable}
      />
      <Checkbox
        id="listbox-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="listbox">
    {#snippet preview()}
      <div class="w-[320px]">
        <Listbox
          id="listbox-anatomy"
          label="Workers"
          filterable
          items={[
            { label: 'worker-orders-1', value: 'worker-orders-1' },
            { label: 'worker-orders-2', value: 'worker-orders-2' },
            { label: 'worker-billing-1', value: 'worker-billing-1' },
          ]}
          value={['worker-orders-2']}
        />
      </div>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <ListboxExamples />
      <SourceCode
        code={examplesSource}
        filename="listbox-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="listbox" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
