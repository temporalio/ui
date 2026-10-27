<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { IconCopy } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';
  import { Tooltip, type TooltipPlacement } from '$lib/io-ark/tooltip';

  import TooltipExamples from '../../../examples/tooltip-examples.svelte';
  import examplesSource from '../../../examples/tooltip-examples.svelte?raw';

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

  const content = getComponentContent('tooltip');
  const documentation = getComponentDocumentation('tooltip');

  const placements: TooltipPlacement[] = [
    'top',
    'bottom',
    'left',
    'right',
    'top-start',
    'bottom-end',
  ];
  const delays = ['0', '200', '400', '700'] as const;

  let text = $state('Copy workflow ID');
  let placement = $state<TooltipPlacement>('top');
  let openDelay = $state<(typeof delays)[number]>('400');
  let showArrow = $state(true);
  let disabled = $state(false);

  const source = $derived(
    `<script lang="ts">
  import { IconCopy } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';
  import { Tooltip } from '$lib/io-ark/tooltip';
</` +
      `script>

<Tooltip
  content={${JSON.stringify(text)}}${placement !== 'top' ? `\n  placement="${placement}"` : ''}${openDelay !== '400' ? `\n  openDelay={${openDelay}}` : ''}${!showArrow ? '\n  showArrow={false}' : ''}${disabled ? '\n  disabled' : ''}
>
  {#snippet trigger(props)}
    <Button
      {...props}
      colorScheme="tertiary"
      LeadingIcon={IconCopy}
      aria-label={${JSON.stringify(text)}}
    />
  {/snippet}
</Tooltip>`,
  );
</script>

<ComponentPage component={documentation}>
  <Playground {source} filename="Tooltip.svelte">
    {#snippet preview()}
      <Tooltip
        id="tooltip-preview"
        content={text}
        {placement}
        openDelay={Number(openDelay)}
        {showArrow}
        {disabled}
      >
        {#snippet trigger(props)}
          <Button
            {...props}
            colorScheme="tertiary"
            LeadingIcon={IconCopy}
            aria-label={text}
            tracking={false}
          />
        {/snippet}
      </Tooltip>
      <p class="text-xs text-secondary">Hover or focus the button.</p>
    {/snippet}
    {#snippet controls()}
      <Input id="tooltip-content" label="Content" bind:value={text} />
      <SelectControl
        id="tooltip-placement"
        label="Placement"
        options={placements}
        bind:value={placement}
      />
      <SelectControl
        id="tooltip-open-delay"
        label="Open delay (ms)"
        options={delays}
        bind:value={openDelay}
      />
      <Checkbox id="tooltip-arrow" label="Arrow" bind:checked={showArrow} />
      <Checkbox
        id="tooltip-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  <AnatomySection slug="tooltip">
    {#snippet preview()}
      <div class="flex h-28 w-[300px] items-end justify-center pb-3">
        <Tooltip
          id="tooltip-anatomy"
          content="Copy workflow ID"
          open
          portalled={false}
          closeOnEscape={false}
          closeOnScroll={false}
          closeOnPointerDown={false}
        >
          {#snippet trigger(props)}
            <Button
              {...props}
              colorScheme="tertiary"
              size="sm"
              LeadingIcon={IconCopy}
              aria-label="Copy workflow ID"
              tracking={false}
            />
          {/snippet}
        </Tooltip>
      </div>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <TooltipExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="tooltip-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="tooltip" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
