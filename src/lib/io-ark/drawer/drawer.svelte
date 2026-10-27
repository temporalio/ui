<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { DrawerPlacement, DrawerSize } from './recipe';

  export type DrawerTriggerProps = Record<string, unknown>;

  export interface DrawerProps {
    title: string;
    description?: string;
    open?: boolean;
    placement?: DrawerPlacement;
    size?: DrawerSize;
    modal?: boolean;
    portalled?: boolean;
    closeOnEscape?: boolean;
    closeOnInteractOutside?: boolean;
    closeLabel?: string;
    initialFocusEl?: () => HTMLElement | null;
    finalFocusEl?: () => HTMLElement | null;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    'data-testid'?: string;
    class?: string;
    trigger?: Snippet<[DrawerTriggerProps]>;
    children?: Snippet;
    footer?: Snippet;
  }
</script>

<script lang="ts">
  import {
    Drawer as ArkDrawer,
    type DrawerOpenChangeDetails,
  } from '@ark-ui/svelte/drawer';
  import { Portal } from '@ark-ui/svelte/portal';

  import { IconClose } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';

  import {
    drawerBackdropRecipe,
    drawerBodyRecipe,
    drawerContentRecipe,
    drawerDescriptionRecipe,
    drawerFooterRecipe,
    drawerGrabberIndicatorRecipe,
    drawerGrabberRecipe,
    drawerHeaderRecipe,
    drawerPositionerRecipe,
    drawerSwipeDirection,
    drawerTitleRecipe,
  } from './recipe';

  let {
    title,
    description = '',
    open = $bindable(false),
    placement = 'right',
    size = 'md',
    modal = true,
    portalled = true,
    closeOnEscape = true,
    closeOnInteractOutside = true,
    closeLabel = 'Close',
    initialFocusEl,
    finalFocusEl,
    onOpenChange,
    id,
    'data-testid': testId,
    class: className,
    trigger,
    children,
    footer,
  }: DrawerProps = $props();

  function handleOpenChange(details: DrawerOpenChangeDetails) {
    if (details.open === open) return;
    open = details.open;
    onOpenChange?.(details.open);
  }
</script>

<ArkDrawer.Root
  {id}
  {open}
  {modal}
  {closeOnEscape}
  {closeOnInteractOutside}
  {initialFocusEl}
  {finalFocusEl}
  swipeDirection={drawerSwipeDirection[placement]}
  lazyMount
  unmountOnExit
  onOpenChange={handleOpenChange}
>
  {#if trigger}
    <ArkDrawer.Trigger>
      {#snippet asChild(props)}
        {@render trigger(props() as DrawerTriggerProps)}
      {/snippet}
    </ArkDrawer.Trigger>
  {/if}
  <Portal disabled={!portalled}>
    {#if modal}
      <ArkDrawer.Backdrop class={drawerBackdropRecipe()} />
    {/if}
    <ArkDrawer.Positioner class={drawerPositionerRecipe(placement)}>
      <ArkDrawer.Content
        class={drawerContentRecipe({ placement, size, className })}
        data-placement={placement}
        data-testid={testId}
      >
        {#if placement === 'bottom'}
          <ArkDrawer.Grabber class={drawerGrabberRecipe()}>
            <ArkDrawer.GrabberIndicator
              class={drawerGrabberIndicatorRecipe()}
            />
          </ArkDrawer.Grabber>
        {/if}
        <div data-part="header" class={drawerHeaderRecipe()}>
          <div class="min-w-0">
            <ArkDrawer.Title class={drawerTitleRecipe()}
              >{title}</ArkDrawer.Title
            >
            {#if description}
              <ArkDrawer.Description class={drawerDescriptionRecipe()}
                >{description}</ArkDrawer.Description
              >
            {/if}
          </div>
          <ArkDrawer.CloseTrigger>
            {#snippet asChild(props)}
              <Button
                {...props() as DrawerTriggerProps}
                colorScheme="ghost"
                size="sm"
                LeadingIcon={IconClose}
                aria-label={closeLabel}
                tracking={false}
              />
            {/snippet}
          </ArkDrawer.CloseTrigger>
        </div>
        {#if children}
          <div data-part="body" class={drawerBodyRecipe()}>
            {@render children()}
          </div>
        {/if}
        {#if footer}
          <div data-part="footer" class={drawerFooterRecipe()}>
            {@render footer()}
          </div>
        {/if}
      </ArkDrawer.Content>
    </ArkDrawer.Positioner>
  </Portal>
</ArkDrawer.Root>

<style>
  @keyframes -global-io-ark-drawer-fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes -global-io-ark-drawer-fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes -global-io-ark-drawer-in-right {
    from {
      translate: 100% 0;
    }
  }

  @keyframes -global-io-ark-drawer-out-right {
    to {
      translate: 100% 0;
    }
  }

  @keyframes -global-io-ark-drawer-in-left {
    from {
      translate: -100% 0;
    }
  }

  @keyframes -global-io-ark-drawer-out-left {
    to {
      translate: -100% 0;
    }
  }

  @keyframes -global-io-ark-drawer-in-bottom {
    from {
      translate: 0 100%;
    }
  }

  @keyframes -global-io-ark-drawer-out-bottom {
    to {
      translate: 0 100%;
    }
  }
</style>
