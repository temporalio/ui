<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { IconCopy } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';
  import { Tooltip, type TooltipPlacement } from '$lib/io-ark/tooltip';

  import TooltipExamples from '../../../examples/tooltip-examples.svelte';
  import examplesSource from '../../../examples/tooltip-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

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

<ComponentPage
  component={documentation}
  examples={TooltipExamples}
  {examplesSource}
  framed
>
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
  {#snippet anatomy()}
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
</ComponentPage>
