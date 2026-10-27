<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Switch, type SwitchSize } from '$lib/io-ark/switch';

  import SwitchExamples from '../../../examples/switch-examples.svelte';
  import examplesSource from '../../../examples/switch-examples.svelte?raw';

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

  const content = getComponentContent('switch');
  const documentation = getComponentDocumentation('switch');

  const sizes: SwitchSize[] = ['md', 'sm'];

  let label = $state('Pause schedule');
  let helperText = $state('No new workflows start while paused.');
  let error = $state('');
  let size = $state<SwitchSize>('md');
  let checked = $state(false);
  let labelHidden = $state(false);
  let required = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { Switch } from '$lib/io-ark/switch';
  let checked = $state(${checked});
</` +
      `script>

<Switch
  label={${JSON.stringify(label)}}${attribute('helperText', helperText)}${attribute('error', error)}${size !== 'md' ? `\n  size="${size}"` : ''}
  bind:checked${flag('labelHidden', labelHidden)}${flag('required', required)}${flag('readOnly', readOnly)}${flag('disabled', disabled)}
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Switch.svelte">
    {#snippet preview()}
      <div class="w-full max-w-sm">
        <Switch
          id="switch-preview"
          {label}
          {helperText}
          {error}
          {size}
          {labelHidden}
          {required}
          {disabled}
          {readOnly}
          bind:checked
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          {checked ? 'On' : 'Off'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="switch-label" label="Label" bind:value={label} />
      <Input
        id="switch-helper-text"
        label="Helper text"
        bind:value={helperText}
      />
      <Input id="switch-error" label="Error" bind:value={error} />
      <SelectControl
        id="switch-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox id="switch-checked" label="Checked" bind:checked />
      <Checkbox
        id="switch-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox id="switch-required" label="Required" bind:checked={required} />
      <Checkbox
        id="switch-read-only"
        label="Read-only"
        bind:checked={readOnly}
      />
      <Checkbox id="switch-disabled" label="Disabled" bind:checked={disabled} />
    {/snippet}
  </Playground>
  <AnatomySection slug="switch">
    {#snippet preview()}
      <Switch
        id="switch-anatomy"
        label="Label"
        helperText="Helper text"
        checked
      />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <SwitchExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="switch-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="switch" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
