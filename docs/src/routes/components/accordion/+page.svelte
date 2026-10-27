<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Accordion } from '$lib/io-ark/accordion';

  import AccordionExamples from '../../../examples/accordion-examples.svelte';
  import examplesSource from '../../../examples/accordion-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import MarkdownContent from '$docs/components/markdown-content.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import {
    accordionContent,
    accordionDocumentation,
  } from '$docs/data/components';

  let title = $state('Workflow details');
  let subtitle = $state('Configuration and execution information');
  let error = $state('');
  let open = $state(false);
  let disabled = $state(false);
  let expandable = $state(true);
  let toggles = $state(0);
  const source = $derived(
    `<script lang="ts">
  import { Accordion } from '$lib/io-ark/accordion';
  let open = $state(${open});
</` +
      `script>

<Accordion
  title={${JSON.stringify(title)}}
  subtitle={${JSON.stringify(subtitle)}}${error ? `\n  error={${JSON.stringify(error)}}` : ''}
  bind:open${disabled ? '\n  disabled' : ''}${!expandable ? '\n  expandable={false}' : ''}
>
  <p>Choose the details you want to show here.</p>
</Accordion>`,
  );
</script>

<ComponentPage component={accordionDocumentation}>
  <Playground {source} filename="Accordion.svelte">
    {#snippet preview()}
      <div class="w-full">
        <Accordion
          id="accordion-preview"
          {title}
          {subtitle}
          {error}
          {disabled}
          {expandable}
          bind:open
          onToggle={() => toggles++}
        >
          <p>Choose the details you want to show here.</p>
        </Accordion>
        <p role="status" class="mt-4 text-xs text-secondary">
          Toggled {toggles} times
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="accordion-title" label="Title" bind:value={title} />
      <Input id="accordion-subtitle" label="Subtitle" bind:value={subtitle} />
      <Input id="accordion-error" label="Error" bind:value={error} />
      <Checkbox id="accordion-open" label="Open" bind:checked={open} />
      <Checkbox
        id="accordion-expandable"
        label="Expandable"
        bind:checked={expandable}
      />
      <Checkbox
        id="accordion-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  <DocSection id="examples" title={accordionContent.sections.examples.title}>
    <MarkdownContent section={accordionContent.sections.examples} />
    <div class="mt-5">
      <AccordionExamples />
      <SourceCode
        code={examplesSource}
        filename="accordion-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={accordionContent.sections.usage.title}>
    <MarkdownContent section={accordionContent.sections.usage} />
  </DocSection>
  <DocSection id="api" title={accordionContent.sections.api.title}>
    <MarkdownContent section={accordionContent.sections.api} />
  </DocSection>
</ComponentPage>
