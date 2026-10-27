<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { Steps, type StepsOrientation } from '$lib/io-poc/steps';

  import StepsExamples from '../../../examples/steps-examples.svelte';
  import examplesSource from '../../../examples/steps-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

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
  import { Steps, type StepsItem } from '$lib/io-poc/steps';

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

<ComponentPage
  component={documentation}
  examples={StepsExamples}
  {examplesSource}
  framed
>
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
  {#snippet anatomy()}
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
</ComponentPage>
