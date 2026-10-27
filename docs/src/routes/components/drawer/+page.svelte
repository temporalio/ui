<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Button } from '$lib/io-ark/button';
  import {
    Drawer,
    type DrawerPlacement,
    type DrawerSize,
  } from '$lib/io-ark/drawer';

  import DrawerExamples from '../../../examples/drawer-examples.svelte';
  import examplesSource from '../../../examples/drawer-examples.svelte?raw';

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

  const content = getComponentContent('drawer');
  const documentation = getComponentDocumentation('drawer');

  const placements: DrawerPlacement[] = ['right', 'left', 'bottom'];
  const sizes: DrawerSize[] = ['sm', 'md', 'lg'];

  let title = $state('Workflow details');
  let description = $state('order-fulfillment-7f3a · Running');
  let placement = $state<DrawerPlacement>('right');
  let size = $state<DrawerSize>('md');
  let modal = $state(true);
  let footer = $state(false);
  let open = $state(false);

  const source = $derived(
    `<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Drawer } from '$lib/io-ark/drawer';
  let open = $state(false);
</` +
      `script>

<Drawer
  bind:open
  title={${JSON.stringify(title)}}${description ? `\n  description={${JSON.stringify(description)}}` : ''}${placement !== 'right' ? `\n  placement="${placement}"` : ''}${size !== 'md' ? `\n  size="${size}"` : ''}${!modal ? '\n  modal={false}' : ''}
>
  {#snippet trigger(props)}
    <Button {...props} colorScheme="secondary">Open drawer</Button>
  {/snippet}
  <p>Task queue: orders-task-queue. Started 2 minutes ago.</p>${
    footer
      ? `
  {#snippet footer()}
    <Button onclick={() => (open = false)}>Done</Button>
  {/snippet}`
      : ''
  }
</Drawer>`,
  );
</script>

{#snippet previewFooter()}
  <Button onclick={() => (open = false)}>Done</Button>
{/snippet}

<ComponentPage component={documentation}>
  <Playground {source} filename="Drawer.svelte">
    {#snippet preview()}
      <Drawer
        bind:open
        id="drawer-preview"
        {title}
        {description}
        {placement}
        {size}
        {modal}
        footer={footer ? previewFooter : undefined}
      >
        {#snippet trigger(props)}
          <Button {...props} colorScheme="secondary">Open drawer</Button>
        {/snippet}
        <p>Task queue: orders-task-queue. Started 2 minutes ago.</p>
      </Drawer>
      <p role="status" class="text-xs text-secondary">
        {open ? 'Open' : 'Closed'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="drawer-title" label="Title" bind:value={title} />
      <Input
        id="drawer-description"
        label="Description"
        bind:value={description}
      />
      <SelectControl
        id="drawer-placement"
        label="Placement"
        options={placements}
        bind:value={placement}
      />
      <SelectControl
        id="drawer-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox id="drawer-modal" label="Modal" bind:checked={modal} />
      <Checkbox id="drawer-footer" label="Footer" bind:checked={footer} />
    {/snippet}
  </Playground>
  <AnatomySection slug="drawer">
    {#snippet preview()}
      <div class="h-80 w-full space-y-3 p-4 text-sm text-secondary">
        <p>order-fulfillment-7f3a · Running</p>
        <p>payment-processing-19c2 · Completed</p>
        <p>inventory-sync-4b8e · Failed</p>
        <Drawer
          id="drawer-anatomy"
          title="Filter workflows"
          description="Show workflows in payments-prod with these statuses."
          placement="bottom"
          open
          portalled={false}
          modal={false}
          closeOnInteractOutside={false}
          closeOnEscape={false}
        >
          <p>Running, Failed</p>
          {#snippet footer()}
            <Button colorScheme="tertiary" tracking={false}>Clear</Button>
            <Button tracking={false}>Apply filters</Button>
          {/snippet}
        </Drawer>
      </div>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <DrawerExamples />
      <SourceCode
        code={examplesSource}
        filename="drawer-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="drawer" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
