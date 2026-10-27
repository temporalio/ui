<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { PopoverPlacement } from './recipe';

  export type PopoverTriggerProps = Record<string, unknown>;

  export interface PopoverProps {
    title?: string;
    description?: string;
    open?: boolean;
    placement?: PopoverPlacement;
    modal?: boolean;
    portalled?: boolean;
    closeOnInteractOutside?: boolean;
    closeOnEscape?: boolean;
    showArrow?: boolean;
    showClose?: boolean;
    closeLabel?: string;
    initialFocusEl?: () => HTMLElement | null;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    'data-testid'?: string;
    class?: string;
    trigger?: Snippet<[PopoverTriggerProps]>;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import {
    Popover as ArkPopover,
    type PopoverOpenChangeDetails,
  } from '@ark-ui/svelte/popover';
  import { Portal } from '@ark-ui/svelte/portal';

  import { IconClose } from '$lib/io/icon';
  import { Button } from '$lib/io-poc/button';

  import {
    popoverArrowTipRecipe,
    popoverCloseRecipe,
    popoverContentRecipe,
    popoverDescriptionRecipe,
    popoverHeaderRecipe,
    popoverTitleRecipe,
  } from './recipe';

  import '../shared/animations.css';

  let {
    title = '',
    description = '',
    open = $bindable(false),
    placement = 'bottom',
    modal = false,
    portalled = true,
    closeOnInteractOutside = true,
    closeOnEscape = true,
    showArrow = false,
    showClose,
    closeLabel = 'Close',
    initialFocusEl,
    onOpenChange,
    id,
    'data-testid': testId,
    class: className,
    trigger,
    children,
  }: PopoverProps = $props();

  const hasClose = $derived(showClose ?? !!title);

  function handleOpenChange(details: PopoverOpenChangeDetails) {
    if (details.open === open) return;
    open = details.open;
    onOpenChange?.(details.open);
  }
</script>

<ArkPopover.Root
  {id}
  {open}
  {modal}
  {portalled}
  {closeOnInteractOutside}
  {closeOnEscape}
  {initialFocusEl}
  positioning={{ placement, gutter: showArrow ? 10 : 6 }}
  lazyMount
  unmountOnExit
  onOpenChange={handleOpenChange}
>
  {#if trigger}
    <ArkPopover.Trigger>
      {#snippet asChild(props)}
        {@render trigger(props() as PopoverTriggerProps)}
      {/snippet}
    </ArkPopover.Trigger>
  {/if}
  <Portal disabled={!portalled}>
    <ArkPopover.Positioner>
      <ArkPopover.Content
        class={popoverContentRecipe(className)}
        data-testid={testId}
      >
        {#if showArrow}
          <ArkPopover.Arrow>
            <ArkPopover.ArrowTip class={popoverArrowTipRecipe()} />
          </ArkPopover.Arrow>
        {/if}
        {#if title || hasClose}
          <div class={popoverHeaderRecipe()}>
            <div class="min-w-0">
              {#if title}
                <ArkPopover.Title class={popoverTitleRecipe()}
                  >{title}</ArkPopover.Title
                >
              {/if}
              {#if description}
                <ArkPopover.Description class={popoverDescriptionRecipe()}
                  >{description}</ArkPopover.Description
                >
              {/if}
            </div>
            {#if hasClose}
              <ArkPopover.CloseTrigger>
                {#snippet asChild(props)}
                  <Button
                    {...props() as PopoverTriggerProps}
                    class={popoverCloseRecipe()}
                    colorScheme="ghost"
                    size="sm"
                    LeadingIcon={IconClose}
                    aria-label={closeLabel}
                    tracking={false}
                  />
                {/snippet}
              </ArkPopover.CloseTrigger>
            {/if}
          </div>
        {:else if description}
          <ArkPopover.Description class={popoverDescriptionRecipe()}
            >{description}</ArkPopover.Description
          >
        {/if}
        {@render children?.()}
      </ArkPopover.Content>
    </ArkPopover.Positioner>
  </Portal>
</ArkPopover.Root>
