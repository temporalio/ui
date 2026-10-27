<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Button } from '$lib/io-poc/button';
  import { Dialog, type DialogSize } from '$lib/io-poc/dialog';

  import DialogExamples from '../../../examples/dialog-examples.svelte';
  import examplesSource from '../../../examples/dialog-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('dialog');

  const sizes: DialogSize[] = ['sm', 'md', 'lg'];
  const roles = ['dialog', 'alertdialog'] as const;

  let title = $state('Cancel workflow?');
  let description = $state(
    'The workflow receives a cancellation request and can clean up before closing.',
  );
  let size = $state<DialogSize>('md');
  let role = $state<(typeof roles)[number]>('dialog');
  let footer = $state(true);
  let open = $state(false);

  const source = $derived(
    `<script lang="ts">
  import { Button } from '$lib/io-poc/button';
  import { Dialog } from '$lib/io-poc/dialog';
  let open = $state(false);
</` +
      `script>

<Dialog
  bind:open
  title={${JSON.stringify(title)}}${description ? `\n  description={${JSON.stringify(description)}}` : ''}${size !== 'md' ? `\n  size="${size}"` : ''}${role !== 'dialog' ? `\n  role="${role}"` : ''}
>
  {#snippet trigger(props)}
    <Button {...props} colorScheme="secondary">Open dialog</Button>
  {/snippet}
  <p>Workflow order-fulfillment-7f3a is running on orders-task-queue.</p>${
    footer
      ? `
  {#snippet footer()}
    <Button colorScheme="tertiary" onclick={() => (open = false)}>Keep running</Button>
    <Button onclick={() => (open = false)}>Cancel workflow</Button>
  {/snippet}`
      : ''
  }
</Dialog>`,
  );
</script>

{#snippet previewFooter()}
  <Button colorScheme="tertiary" onclick={() => (open = false)}
    >Keep running</Button
  >
  <Button onclick={() => (open = false)}>Cancel workflow</Button>
{/snippet}

<ComponentPage
  component={documentation}
  examples={DialogExamples}
  {examplesSource}
>
  <Playground {source} filename="Dialog.svelte">
    {#snippet preview()}
      <Dialog
        bind:open
        id="dialog-preview"
        {title}
        {description}
        {size}
        {role}
        footer={footer ? previewFooter : undefined}
      >
        {#snippet trigger(props)}
          <Button {...props} colorScheme="secondary">Open dialog</Button>
        {/snippet}
        <p>Workflow order-fulfillment-7f3a is running on orders-task-queue.</p>
      </Dialog>
      <p role="status" class="text-xs text-secondary">
        {open ? 'Open' : 'Closed'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="dialog-title" label="Title" bind:value={title} />
      <Input
        id="dialog-description"
        label="Description"
        bind:value={description}
      />
      <SelectControl
        id="dialog-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <SelectControl
        id="dialog-role"
        label="Role"
        options={roles}
        bind:value={role}
      />
      <Checkbox id="dialog-footer" label="Footer" bind:checked={footer} />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <div class="h-80 w-full">
      <Dialog
        id="dialog-anatomy"
        title="Terminate workflow?"
        description="order-fulfillment-7f3a will stop immediately."
        open
        portalled={false}
        modal={false}
        closeOnInteractOutside={false}
        closeOnEscape={false}
      >
        <p>Pending activities will not run.</p>
        {#snippet footer()}
          <Button colorScheme="tertiary" tracking={false}>Cancel</Button>
          <Button colorScheme="danger" tracking={false}>Terminate</Button>
        {/snippet}
      </Dialog>
    </div>
  {/snippet}
</ComponentPage>
