<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    SegmentGroup,
    type SegmentGroupOrientation,
    type SegmentGroupSize,
  } from '$lib/io-ark/segment-group';

  import SegmentGroupExamples from '../../../examples/segment-group-examples.svelte';
  import examplesSource from '../../../examples/segment-group-examples.svelte?raw';

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

  const content = getComponentContent('segment-group');
  const documentation = getComponentDocumentation('segment-group');

  const items = [
    { value: '1h', label: '1h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
  ];
  const sizes: SegmentGroupSize[] = ['sm', 'md'];
  const orientations: SegmentGroupOrientation[] = ['horizontal', 'vertical'];
  let label = $state('Time range');
  let size = $state<SegmentGroupSize>('md');
  let orientation = $state<SegmentGroupOrientation>('horizontal');
  let labelHidden = $state(false);
  let disabled = $state(false);
  let value = $state<string | null>('24h');

  const source = $derived(
    `<script lang="ts">
  import { SegmentGroup } from '$lib/io-ark/segment-group';
  let value = $state<string | null>(${JSON.stringify(value)});
</` +
      `script>

<SegmentGroup
  label={${JSON.stringify(label)}}
  items={[
    { value: '1h', label: '1h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
  ]}
  size="${size}"${orientation === 'vertical' ? '\n  orientation="vertical"' : ''}${labelHidden ? '\n  labelHidden' : ''}${disabled ? '\n  disabled' : ''}
  bind:value
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="SegmentGroup.svelte">
    {#snippet preview()}
      <SegmentGroup
        {label}
        {items}
        {size}
        {orientation}
        {labelHidden}
        {disabled}
        bind:value
      />
      <p role="status" class="text-xs text-secondary">
        Selected: {value ?? 'none'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="segment-group-label" label="Label" bind:value={label} />
      <SelectControl
        id="segment-group-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <SelectControl
        id="segment-group-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <Checkbox
        id="segment-group-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox
        id="segment-group-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="segment-group">
    {#snippet preview()}
      <SegmentGroup
        id="segment-group-anatomy"
        label="Time range"
        value="24h"
        items={[
          { value: '1h', label: '1h' },
          { value: '24h', label: '24h' },
          { value: '7d', label: '7d' },
          { value: '30d', label: '30d' },
        ]}
      />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <SegmentGroupExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="segment-group-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="segment-group" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
