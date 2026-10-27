<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import {
    ScrollArea,
    type ScrollAreaOrientation,
    type ScrollAreaScrollbars,
  } from '$lib/io-poc/scroll-area';

  import ScrollAreaExamples from '../../../examples/scroll-area-examples.svelte';
  import examplesSource from '../../../examples/scroll-area-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('scroll-area');

  const orientations: ScrollAreaOrientation[] = [
    'vertical',
    'horizontal',
    'both',
  ];
  const scrollbarModes: ScrollAreaScrollbars[] = ['hover', 'always'];

  let label = $state('Task queue pollers');
  let orientation = $state<ScrollAreaOrientation>('vertical');
  let scrollbars = $state<ScrollAreaScrollbars>('hover');
  let maxHeight = $state('12rem');

  const pollers = Array.from({ length: 24 }, (_, index) => ({
    identity: `worker-${String(index + 1).padStart(2, '0')}@orders-host-${(index % 4) + 1}.internal.temporal.example`,
    lastAccess: `${index + 2}s ago`,
  }));

  const source = $derived(
    `<script lang="ts">
  import { ScrollArea } from '$lib/io-poc/scroll-area';
</` +
      `script>

<ScrollArea
  label={${JSON.stringify(label)}}${orientation !== 'vertical' ? `\n  orientation="${orientation}"` : ''}${scrollbars !== 'hover' ? `\n  scrollbars="${scrollbars}"` : ''}${maxHeight ? `\n  maxHeight={${JSON.stringify(maxHeight)}}` : ''}
  class="rounded border border-primary"
>
  <ul>
    {#each pollers as poller (poller.identity)}
      <li>{poller.identity}</li>
    {/each}
  </ul>
</ScrollArea>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={ScrollAreaExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="ScrollArea.svelte">
    {#snippet preview()}
      <div class="w-full max-w-md">
        {#key orientation}
          <ScrollArea
            {label}
            {orientation}
            {scrollbars}
            {maxHeight}
            class="rounded border border-primary bg-background-primary"
          >
            <ul
              class="divide-y divide-[color:var(--color-border-primary)] text-sm"
            >
              {#each pollers as poller (poller.identity)}
                <li class="flex items-center gap-4 whitespace-nowrap px-3 py-2">
                  <span class="font-mono text-xs">{poller.identity}</span>
                  <span class="text-xs text-secondary">{poller.lastAccess}</span
                  >
                </li>
              {/each}
            </ul>
          </ScrollArea>
        {/key}
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="scroll-area-label" label="Label" bind:value={label} />
      <SelectControl
        id="scroll-area-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <SelectControl
        id="scroll-area-scrollbars"
        label="Scrollbars"
        options={scrollbarModes}
        bind:value={scrollbars}
      />
      <Input
        id="scroll-area-max-height"
        label="Max height"
        bind:value={maxHeight}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <ScrollArea
      id="scroll-area-anatomy"
      label="Task queue pollers"
      orientation="both"
      scrollbars="always"
      maxHeight="9rem"
      class="w-full rounded border border-primary"
    >
      <ul class="w-[560px] divide-y divide-primary text-sm">
        {#each Array.from({ length: 12 }, (_, index) => index + 1) as poller (poller)}
          <li class="px-3 py-1.5 font-mono">
            worker-{poller}@orders-host-{poller}.internal.temporal.example
          </li>
        {/each}
      </ul>
    </ScrollArea>
  {/snippet}
</ComponentPage>
