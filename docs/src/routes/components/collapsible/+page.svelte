<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Collapsible } from '$lib/io-ark/collapsible';

  import CollapsibleExamples from '../../../examples/collapsible-examples.svelte';
  import examplesSource from '../../../examples/collapsible-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('collapsible');

  let label = $state('Advanced options');
  let open = $state(false);
  let disabled = $state(false);
  let lazyMount = $state(false);
  let unmountOnExit = $state(false);

  const source = $derived(
    `<script lang="ts">
  import { Collapsible } from '$lib/io-ark/collapsible';
  let open = $state(${open});
</` +
      `script>

<Collapsible
  label={${JSON.stringify(label)}}
  bind:open${disabled ? '\n  disabled' : ''}${lazyMount ? '\n  lazyMount' : ''}${unmountOnExit ? '\n  unmountOnExit' : ''}
>
  <p>Set a workflow execution timeout and a custom search attribute.</p>
</Collapsible>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={CollapsibleExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Collapsible.svelte">
    {#snippet preview()}
      <div class="w-full max-w-md">
        <Collapsible
          id="collapsible-preview"
          {label}
          {disabled}
          {lazyMount}
          {unmountOnExit}
          bind:open
        >
          <p class="text-sm">
            Set a workflow execution timeout and a custom search attribute.
          </p>
        </Collapsible>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="collapsible-label" label="Label" bind:value={label} />
      <Checkbox id="collapsible-open" label="Open" bind:checked={open} />
      <Checkbox
        id="collapsible-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
      <Checkbox
        id="collapsible-lazy-mount"
        label="Lazy mount"
        bind:checked={lazyMount}
      />
      <Checkbox
        id="collapsible-unmount-on-exit"
        label="Unmount on exit"
        bind:checked={unmountOnExit}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <Collapsible
      id="collapsible-anatomy"
      label="Advanced options"
      open
      class="w-72"
    >
      <p class="text-sm text-secondary">Content shown when open.</p>
    </Collapsible>
  {/snippet}
</ComponentPage>
