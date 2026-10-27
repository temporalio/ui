<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Accordion, AccordionGroup } from '$lib/io-ark/accordion';

  import AccordionExamples from '../../../examples/accordion-examples.svelte';
  import examplesSource from '../../../examples/accordion-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  let title = $state('Workflow details');
  let subtitle = $state('Configuration and execution information');
  let error = $state('');
  let open = $state(false);
  let disabled = $state(false);
  let expandable = $state(true);
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

  const documentation = getComponentDocumentation('accordion');
</script>

<ComponentPage
  component={documentation}
  examples={AccordionExamples}
  {examplesSource}
>
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
        >
          <p>Choose the details you want to show here.</p>
        </Accordion>
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
  {#snippet anatomy()}
    <AccordionGroup class="w-full">
      <Accordion id="accordion-anatomy-1" title="Section 1" open>
        <p>Content for Section 1</p>
      </Accordion>
      <Accordion id="accordion-anatomy-2" title="Section 2">
        <p>Content for Section 2</p>
      </Accordion>
    </AccordionGroup>
  {/snippet}
</ComponentPage>
