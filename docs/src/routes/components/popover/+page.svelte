<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Button } from '$lib/io-poc/button';
  import { Popover, type PopoverPlacement } from '$lib/io-poc/popover';

  import PopoverExamples from '../../../examples/popover-examples.svelte';
  import examplesSource from '../../../examples/popover-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

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
  import { Button } from '$lib/io-poc/button';
  import { Popover } from '$lib/io-poc/popover';
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

<ComponentPage
  component={documentation}
  examples={PopoverExamples}
  {examplesSource}
  framed
>
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
  {#snippet anatomy()}
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
          <Button {...props} colorScheme="secondary" size="sm" tracking={false}
            >Retry policy</Button
          >
        {/snippet}
        <p class="mt-2 text-secondary">Maximum attempts: 5</p>
      </Popover>
    </div>
  {/snippet}
</ComponentPage>
