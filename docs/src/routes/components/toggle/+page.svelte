<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { IconPin, IconPinSolid } from '$lib/io/icon';
  import { Toggle, type ToggleSize } from '$lib/io-ark/toggle';

  import ToggleExamples from '../../../examples/toggle-examples.svelte';
  import examplesSource from '../../../examples/toggle-examples.svelte?raw';

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

  const content = getComponentContent('toggle');
  const documentation = getComponentDocumentation('toggle');

  const sizes: ToggleSize[] = ['sm', 'md'];
  let label = $state('Pin workflow');
  let size = $state<ToggleSize>('md');
  let pressed = $state(false);
  let icon = $state(true);
  let iconOnly = $state(false);
  let disabled = $state(false);

  const source = $derived(
    `<script lang="ts">
  import { Toggle } from '$lib/io-ark/toggle';${icon ? "\n  import { IconPin, IconPinSolid } from '$lib/io/icon';" : ''}
  let pressed = $state(${pressed});
</` +
      `script>

<Toggle
  ${iconOnly ? 'aria-label' : 'label'}={${JSON.stringify(label)}}
  size="${size}"${icon ? '\n  Icon={IconPin}\n  PressedIcon={IconPinSolid}' : ''}${disabled ? '\n  disabled' : ''}
  bind:pressed
/>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Toggle.svelte">
    {#snippet preview()}
      {#if iconOnly}
        <Toggle
          aria-label={label}
          {size}
          {disabled}
          Icon={icon ? IconPin : undefined}
          PressedIcon={icon ? IconPinSolid : undefined}
          bind:pressed
        />
      {:else}
        <Toggle
          {label}
          {size}
          {disabled}
          Icon={icon ? IconPin : undefined}
          PressedIcon={icon ? IconPinSolid : undefined}
          bind:pressed
        />
      {/if}
      <p role="status" class="text-xs text-secondary">
        {pressed ? 'On' : 'Off'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="toggle-label" label="Label" bind:value={label} />
      <SelectControl
        id="toggle-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox id="toggle-pressed" label="Pressed" bind:checked={pressed} />
      <Checkbox id="toggle-icon" label="Icon" bind:checked={icon} />
      <Checkbox
        id="toggle-icon-only"
        label="Icon only"
        bind:checked={iconOnly}
      />
      <Checkbox id="toggle-disabled" label="Disabled" bind:checked={disabled} />
    {/snippet}
  </Playground>
  <AnatomySection slug="toggle">
    {#snippet preview()}
      <Toggle
        id="toggle-anatomy"
        label="Pin workflow"
        Icon={IconPin}
        PressedIcon={IconPinSolid}
        pressed
      />
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <ToggleExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="toggle-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="toggle" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
