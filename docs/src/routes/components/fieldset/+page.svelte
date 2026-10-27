<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Field, FieldInput } from '$lib/io-ark/field';
  import { Fieldset } from '$lib/io-ark/fieldset';

  import FieldsetExamples from '../../../examples/fieldset-examples.svelte';
  import examplesSource from '../../../examples/fieldset-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

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

<ComponentPage
  component={documentation}
  examples={FieldsetExamples}
  {examplesSource}
  framed
>
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
  {#snippet anatomy()}
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
</ComponentPage>
