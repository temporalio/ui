<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Button } from '$lib/io-ark/button';
  import { Popover, type PopoverPlacement } from '$lib/io-ark/popover';

  import PopoverExamples from '../../../examples/popover-examples.svelte';
  import examplesSource from '../../../examples/popover-examples.svelte?raw';

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

  const content = getComponentContent('popover');
  const documentation = getComponentDocumentation('popover');

  const placements: PopoverPlacement[] = [
    'bottom',
    'bottom-start',
    'bottom-end',
    'top',
    'right',
    'left',
  ];

  let title = $state('Task queue');
  let description = $state('orders-task-queue');
  let body = $state('3 workers are polling this task queue.');
  let placement = $state<PopoverPlacement>('bottom');
  let showArrow = $state(true);
  let modal = $state(false);
  let open = $state(false);

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';

  const source = $derived(
    `<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Popover } from '$lib/io-ark/popover';
  let open = $state(false);
</` +
      `script>

<Popover${attribute('title', title)}${attribute('description', description)}
  bind:open${placement !== 'bottom' ? `\n  placement="${placement}"` : ''}${showArrow ? '\n  showArrow' : ''}${modal ? '\n  modal' : ''}
>
  {#snippet trigger(props)}
    <Button {...props} colorScheme="secondary">Show details</Button>
  {/snippet}
  <p>{${JSON.stringify(body)}}</p>
</Popover>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Popover.svelte">
    {#snippet preview()}
      <Popover
        id="popover-preview"
        {title}
        {description}
        {placement}
        {showArrow}
        {modal}
        bind:open
      >
        {#snippet trigger(props)}
          <Button {...props} colorScheme="secondary">Show details</Button>
        {/snippet}
        <p>{body}</p>
      </Popover>
      <p role="status" class="text-xs text-secondary">
        {open ? 'Open' : 'Closed'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="popover-title" label="Title" bind:value={title} />
      <Input
        id="popover-description"
        label="Description"
        bind:value={description}
      />
      <Input id="popover-body" label="Content" bind:value={body} />
      <SelectControl
        id="popover-placement"
        label="Placement"
        options={placements}
        bind:value={placement}
      />
      <Checkbox id="popover-arrow" label="Arrow" bind:checked={showArrow} />
      <Checkbox id="popover-modal" label="Modal" bind:checked={modal} />
      <Checkbox id="popover-open" label="Open" bind:checked={open} />
    {/snippet}
  </Playground>
  <AnatomySection slug="popover">
    {#snippet preview()}
      <div class="flex h-64 w-[360px] items-start justify-center pt-1">
        <Popover
          id="popover-anatomy"
          title="Retry policy"
          description="Applies to every activity in this workflow."
          showArrow
          open
          portalled={false}
          closeOnInteractOutside={false}
          closeOnEscape={false}
        >
          {#snippet trigger(props)}
            <Button
              {...props}
              colorScheme="secondary"
              size="sm"
              tracking={false}>Retry policy</Button
            >
          {/snippet}
          <p class="mt-2 text-secondary">Maximum attempts: 5</p>
        </Popover>
      </div>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <PopoverExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="popover-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="popover" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
