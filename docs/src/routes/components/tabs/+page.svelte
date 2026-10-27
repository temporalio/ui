<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    Tabs,
    type TabsItem,
    type TabsOrientation,
    type TabsVariant,
  } from '$lib/io-ark/tabs';

  import TabsExamples from '../../../examples/tabs-examples.svelte';
  import examplesSource from '../../../examples/tabs-examples.svelte?raw';

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

  const content = getComponentContent('tabs');
  const documentation = getComponentDocumentation('tabs');

  const variants: TabsVariant[] = ['line', 'enclosed'];
  const orientations: TabsOrientation[] = ['horizontal', 'vertical'];
  const activationModes = ['automatic', 'manual'] as const;

  let variant = $state<TabsVariant>('line');
  let orientation = $state<TabsOrientation>('horizontal');
  let activationMode = $state<(typeof activationModes)[number]>('automatic');
  let label = $state('Workflow details');
  let badge = $state(true);
  let disableLast = $state(false);
  let value = $state('history');

  const items = $derived<TabsItem[]>([
    { value: 'history', label: 'History' },
    { value: 'workers', label: 'Workers' },
    {
      value: 'pending',
      label: 'Pending Activities',
      ...(badge ? { badge: 3 } : {}),
    },
    { value: 'queries', label: 'Queries', disabled: disableLast },
  ]);

  const source = $derived(
    `<script lang="ts">
  import { Tabs, type TabsItem } from '$lib/io-ark/tabs';

  const items: TabsItem[] = [
    { value: 'history', label: 'History' },
    { value: 'workers', label: 'Workers' },
    { value: 'pending', label: 'Pending Activities'${badge ? ', badge: 3' : ''} },
    { value: 'queries', label: 'Queries'${disableLast ? ', disabled: true' : ''} },
  ];
  let value = $state('history');
</` +
      `script>

<Tabs
  {items}
  bind:value${label ? `\n  label={${JSON.stringify(label)}}` : ''}${variant !== 'line' ? `\n  variant="${variant}"` : ''}${orientation !== 'horizontal' ? `\n  orientation="${orientation}"` : ''}${activationMode !== 'automatic' ? `\n  activationMode="${activationMode}"` : ''}
>
  {#snippet content(item)}
    <p>{item.label} for order-fulfillment-7f3a.</p>
  {/snippet}
</Tabs>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Tabs.svelte">
    {#snippet preview()}
      <div class="w-full">
        <Tabs
          id="tabs-preview"
          {items}
          bind:value
          {label}
          {variant}
          {orientation}
          {activationMode}
        >
          {#snippet content(item)}
            <p class="text-secondary">
              {item.label} for order-fulfillment-7f3a.
            </p>
          {/snippet}
        </Tabs>
        <p role="status" class="mt-4 text-xs text-secondary">
          Selected: {value}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="tabs-variant"
        label="Variant"
        options={variants}
        bind:value={variant}
      />
      <SelectControl
        id="tabs-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <SelectControl
        id="tabs-activation-mode"
        label="Activation mode"
        options={activationModes}
        bind:value={activationMode}
      />
      <Input id="tabs-label" label="Label" bind:value={label} />
      <Checkbox id="tabs-badge" label="Badge" bind:checked={badge} />
      <Checkbox
        id="tabs-disable-last"
        label="Disable Queries"
        bind:checked={disableLast}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="tabs">
    {#snippet preview()}
      <Tabs
        id="tabs-anatomy"
        label="Workflow details"
        value="history"
        items={[
          { value: 'history', label: 'History' },
          { value: 'workers', label: 'Workers' },
          { value: 'pending', label: 'Pending', badge: 3 },
        ]}
        class="w-full"
      >
        {#snippet content(item)}
          <p class="text-sm text-secondary">
            {item.label} for order-fulfillment-7f3a.
          </p>
        {/snippet}
      </Tabs>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <TabsExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="tabs-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="tabs" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
