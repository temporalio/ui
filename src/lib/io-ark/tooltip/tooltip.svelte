<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { TooltipPlacement } from './recipe';

  export type TooltipTriggerProps = Record<string, unknown>;

  export interface TooltipProps {
    content: string | Snippet;
    placement?: TooltipPlacement;
    open?: boolean;
    openDelay?: number;
    closeDelay?: number;
    disabled?: boolean;
    interactive?: boolean;
    showArrow?: boolean;
    closeOnClick?: boolean;
    closeOnEscape?: boolean;
    closeOnScroll?: boolean;
    closeOnPointerDown?: boolean;
    portalled?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    class?: string;
    triggerClass?: string;
    trigger?: Snippet<[TooltipTriggerProps]>;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { Portal } from '@ark-ui/svelte/portal';
  import {
    Tooltip as ArkTooltip,
    type TooltipOpenChangeDetails,
  } from '@ark-ui/svelte/tooltip';

  import {
    tooltipArrowRecipe,
    tooltipContentRecipe,
    tooltipTriggerRecipe,
  } from './recipe';

  let {
    content,
    placement = 'top',
    open = $bindable(false),
    openDelay = 400,
    closeDelay = 150,
    disabled = false,
    interactive = false,
    showArrow = true,
    closeOnClick = true,
    closeOnEscape = true,
    closeOnScroll = true,
    closeOnPointerDown = true,
    portalled = true,
    onOpenChange,
    id,
    class: className,
    triggerClass,
    trigger,
    children,
  }: TooltipProps = $props();

  function handleOpenChange(details: TooltipOpenChangeDetails) {
    if (details.open === open) return;
    open = details.open;
    onOpenChange?.(details.open);
  }
</script>

<ArkTooltip.Root
  {id}
  {open}
  {openDelay}
  {closeDelay}
  {disabled}
  {interactive}
  {closeOnClick}
  {closeOnEscape}
  {closeOnScroll}
  {closeOnPointerDown}
  positioning={{ placement }}
  lazyMount
  unmountOnExit
  onOpenChange={handleOpenChange}
>
  <ArkTooltip.Trigger>
    {#snippet asChild(props)}
      {#if trigger}
        {@render trigger(props() as TooltipTriggerProps)}
      {:else}
        <button
          {...props() as TooltipTriggerProps}
          type="button"
          class={tooltipTriggerRecipe(triggerClass)}
          >{@render children?.()}</button
        >
      {/if}
    {/snippet}
  </ArkTooltip.Trigger>
  <Portal disabled={!portalled}>
    <ArkTooltip.Positioner>
      <ArkTooltip.Content class={tooltipContentRecipe(className)}>
        {#if showArrow}
          <ArkTooltip.Arrow class={tooltipArrowRecipe()}>
            <ArkTooltip.ArrowTip />
          </ArkTooltip.Arrow>
        {/if}
        {#if typeof content === 'string'}
          {content}
        {:else}
          {@render content()}
        {/if}
      </ArkTooltip.Content>
    </ArkTooltip.Positioner>
  </Portal>
</ArkTooltip.Root>

<style>
  @keyframes -global-io-ark-tooltip-fade-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes -global-io-ark-tooltip-fade-out {
    to {
      opacity: 0;
    }
  }
</style>
