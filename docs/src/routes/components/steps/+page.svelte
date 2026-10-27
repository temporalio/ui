<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { Steps, type StepsOrientation } from '$lib/io-ark/steps';

  import StepsExamples from '../../../examples/steps-examples.svelte';
  import examplesSource from '../../../examples/steps-examples.svelte?raw';

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

  const content = getComponentContent('steps');
  const documentation = getComponentDocumentation('steps');

  const orientations: StepsOrientation[] = ['horizontal', 'vertical'];
  const items = [
    { title: 'Details' },
    { title: 'Retention' },
    { title: 'Access' },
    { title: 'Review' },
  ];

  let orientation = $state<StepsOrientation>('horizontal');
  let linear = $state(false);
  let descriptions = $state(false);
  let showControls = $state(true);
  let step = $state(1);

  const previewItems = $derived(
    descriptions
      ? items.map((item) => ({
          ...item,
          description: `${item.title} settings`,
        }))
      : items,
  );

  const source = $derived(
    `<script lang="ts">
  import { Steps, type StepsItem } from '$lib/io-ark/steps';

  const items: StepsItem[] = [
${previewItems.map((item) => `    ${JSON.stringify(item).replace(/"(\w+)":/g, '$1: ')},`).join('\n')}
  ];
  let step = $state(${step});
</` +
      `script>

<Steps
  {items}
  bind:step${orientation !== 'horizontal' ? `\n  orientation="${orientation}"` : ''}${linear ? '\n  linear' : ''}${!showControls ? '\n  showControls={false}' : ''}
>
  {#snippet content(item)}
    <p>{item.title} for the new namespace.</p>
  {/snippet}
  {#snippet completed()}
    <p>Namespace created.</p>
  {/snippet}
</Steps>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Steps.svelte">
    {#snippet preview()}
      <div class="w-full">
        <Steps
          id="steps-preview"
          items={previewItems}
          bind:step
          {orientation}
          {linear}
          {showControls}
        >
          {#snippet content(item)}
            <p class="text-secondary">{item.title} for the new namespace.</p>
          {/snippet}
          {#snippet completed()}
            <p>Namespace created.</p>
          {/snippet}
        </Steps>
        <p role="status" class="mt-4 text-xs text-secondary">
          Step index: {step}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="steps-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <Checkbox id="steps-linear" label="Linear" bind:checked={linear} />
      <Checkbox
        id="steps-descriptions"
        label="Descriptions"
        bind:checked={descriptions}
      />
      <Checkbox
        id="steps-controls"
        label="Show controls"
        bind:checked={showControls}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="steps">
    {#snippet preview()}
      <Steps
        id="steps-anatomy"
        step={1}
        items={[
          { title: 'Details' },
          { title: 'Retention' },
          { title: 'Review' },
        ]}
        class="w-full"
      >
        {#snippet content(item)}
          <p class="text-sm text-secondary">
            Set the {item.title.toLowerCase()} for the new namespace.
          </p>
        {/snippet}
      </Steps>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <StepsExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="steps-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="steps" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
