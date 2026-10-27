<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Collapsible } from '$lib/io-ark/collapsible';

  import CollapsibleExamples from '../../../examples/collapsible-examples.svelte';
  import examplesSource from '../../../examples/collapsible-examples.svelte?raw';

  import AnatomySection from '$docs/components/anatomy-section.svelte';
  import ComponentPage from '$docs/components/component-page.svelte';
  import ContractSection from '$docs/components/contract-section.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import MarkdownContent from '$docs/components/markdown-content.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import {
    getComponentContent,
    getComponentDocumentation,
  } from '$docs/data/components';

  const content = getComponentContent('collapsible');
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

<ComponentPage component={documentation}>
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
  <AnatomySection slug="collapsible">
    {#snippet preview()}
      <Collapsible
        id="collapsible-anatomy"
        label="Advanced options"
        open
        class="w-72"
      >
        <p class="text-sm text-secondary">Content shown when open.</p>
      </Collapsible>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <CollapsibleExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="collapsible-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="collapsible" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
