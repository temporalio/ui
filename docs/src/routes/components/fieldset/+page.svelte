<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Field, FieldInput } from '$lib/io-ark/field';
  import { Fieldset } from '$lib/io-ark/fieldset';

  import FieldsetExamples from '../../../examples/fieldset-examples.svelte';
  import examplesSource from '../../../examples/fieldset-examples.svelte?raw';

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

  const content = getComponentContent('fieldset');
  const documentation = getComponentDocumentation('fieldset');

  let legend = $state('Workflow timeouts');
  let helperText = $state('Leave a value empty to use the server default.');
  let error = $state('');
  let legendHidden = $state(false);
  let disabled = $state(false);

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { Field, FieldInput } from '$lib/io-ark/field';
  import { Fieldset } from '$lib/io-ark/fieldset';
</` +
      `script>

<Fieldset
  legend={${JSON.stringify(legend)}}${attribute('helperText', helperText)}${attribute('error', error)}${flag('legendHidden', legendHidden)}${flag('disabled', disabled)}
>
  <Field label="Execution timeout">
    <FieldInput placeholder="10d" />
  </Field>
  <Field label="Run timeout">
    <FieldInput placeholder="1d" />
  </Field>
</Fieldset>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Fieldset.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <Fieldset {legend} {helperText} {error} {legendHidden} {disabled}>
          <Field label="Execution timeout">
            <FieldInput placeholder="10d" />
          </Field>
          <Field label="Run timeout">
            <FieldInput placeholder="1d" />
          </Field>
        </Fieldset>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="fieldset-legend" label="Legend" bind:value={legend} />
      <Input
        id="fieldset-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="fieldset-error" label="Error" bind:value={error} />
      <Checkbox
        id="fieldset-legend-hidden"
        label="Hide legend"
        bind:checked={legendHidden}
      />
      <Checkbox
        id="fieldset-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="fieldset">
    {#snippet preview()}
      <Fieldset
        legend="Legend"
        helperText="Helper text"
        error="Error text"
        class="w-72"
      >
        <Field label="Field">
          <FieldInput placeholder="Value" />
        </Field>
      </Fieldset>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <FieldsetExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="fieldset-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="fieldset" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
