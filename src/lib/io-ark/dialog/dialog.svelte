<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { DialogSize } from './recipe';

  export type DialogTriggerProps = Record<string, unknown>;

  export interface DialogProps {
    title: string;
    description?: string;
    open?: boolean;
    size?: DialogSize;
    role?: 'dialog' | 'alertdialog';
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
    trigger?: Snippet<[DialogTriggerProps]>;
    children?: Snippet;
    footer?: Snippet;
  }
</script>

<script lang="ts">
  import {
    Dialog as ArkDialog,
    type DialogOpenChangeDetails,
  } from '@ark-ui/svelte/dialog';
  import { Portal } from '@ark-ui/svelte/portal';

  import { IconClose } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';

  import {
    dialogBackdropRecipe,
    dialogBodyRecipe,
    dialogContentRecipe,
    dialogDescriptionRecipe,
    dialogFooterRecipe,
    dialogHeaderRecipe,
    dialogPositionerRecipe,
    dialogTitleRecipe,
  } from './recipe';

  import '../shared/animations.css';

  let {
    title,
    description = '',
    open = $bindable(false),
    size = 'md',
    role = 'dialog',
    modal = true,
    portalled = true,
    closeOnEscape = true,
    closeOnInteractOutside,
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
  }: DialogProps = $props();

  function handleOpenChange(details: DialogOpenChangeDetails) {
    if (details.open === open) return;
    open = details.open;
    onOpenChange?.(details.open);
  }
</script>

<ArkDialog.Root
  {id}
  {open}
  {role}
  {modal}
  {closeOnEscape}
  closeOnInteractOutside={closeOnInteractOutside ?? role !== 'alertdialog'}
  {initialFocusEl}
  {finalFocusEl}
  lazyMount
  unmountOnExit
  onOpenChange={handleOpenChange}
>
  {#if trigger}
    <ArkDialog.Trigger>
      {#snippet asChild(props)}
        {@render trigger(props() as DialogTriggerProps)}
      {/snippet}
    </ArkDialog.Trigger>
  {/if}
  <Portal disabled={!portalled}>
    <ArkDialog.Backdrop class={dialogBackdropRecipe()} />
    <ArkDialog.Positioner class={dialogPositionerRecipe()}>
      <ArkDialog.Content
        class={dialogContentRecipe({ size, className })}
        data-testid={testId}
      >
        <div data-part="header" class={dialogHeaderRecipe()}>
          <div class="min-w-0">
            <ArkDialog.Title class={dialogTitleRecipe()}
              >{title}</ArkDialog.Title
            >
            {#if description}
              <ArkDialog.Description class={dialogDescriptionRecipe()}
                >{description}</ArkDialog.Description
              >
            {/if}
          </div>
          <ArkDialog.CloseTrigger>
            {#snippet asChild(props)}
              <Button
                {...props() as DialogTriggerProps}
                colorScheme="ghost"
                size="sm"
                LeadingIcon={IconClose}
                aria-label={closeLabel}
                tracking={false}
              />
            {/snippet}
          </ArkDialog.CloseTrigger>
        </div>
        {#if children}
          <div data-part="body" class={dialogBodyRecipe()}>
            {@render children()}
          </div>
        {/if}
        {#if footer}
          <div data-part="footer" class={dialogFooterRecipe()}>
            {@render footer()}
          </div>
        {/if}
      </ArkDialog.Content>
    </ArkDialog.Positioner>
  </Portal>
</ArkDialog.Root>
