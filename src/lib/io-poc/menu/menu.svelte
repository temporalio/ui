<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { ButtonColorScheme, ButtonSize } from '$lib/io-poc/button';

  import type { MenuPlacement } from './recipe';
  import type { MenuEntry } from './types';

  export type MenuTriggerProps = Record<string, unknown>;

  export interface MenuProps {
    items: MenuEntry[];
    label?: string;
    triggerColorScheme?: ButtonColorScheme;
    triggerSize?: ButtonSize;
    open?: boolean;
    placement?: MenuPlacement;
    closeOnSelect?: boolean;
    closeOnInteractOutside?: boolean;
    closeOnEscape?: boolean;
    portalled?: boolean;
    disabled?: boolean;
    onSelect?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    'data-testid'?: string;
    class?: string;
    trigger?: Snippet<[MenuTriggerProps]>;
  }
</script>

<script lang="ts">
  import {
    Menu as ArkMenu,
    type MenuOpenChangeDetails,
    type MenuSelectionDetails,
  } from '@ark-ui/svelte/menu';
  import { Portal } from '@ark-ui/svelte/portal';

  import { IconChevronDown } from '$lib/io/icon';
  import { Button } from '$lib/io-poc/button';

  import { menuContentRecipe } from './recipe';
  import { getActionValues } from './types';

  import MenuItems from './menu-items.svelte';

  import '../shared/animations.css';

  let {
    items,
    label = '',
    triggerColorScheme = 'tertiary',
    triggerSize = 'md',
    open = $bindable(false),
    placement = 'bottom-start',
    closeOnSelect = true,
    closeOnInteractOutside = true,
    closeOnEscape = true,
    portalled = true,
    disabled = false,
    onSelect,
    onOpenChange,
    id,
    'data-testid': testId,
    class: className,
    trigger,
  }: MenuProps = $props();

  const actionValues = $derived(new Set(getActionValues(items)));

  function handleSelect(value: string) {
    if (actionValues.has(value)) onSelect?.(value);
  }

  function handleOpenChange(details: MenuOpenChangeDetails) {
    if (details.open === open) return;
    open = details.open;
    onOpenChange?.(details.open);
  }
</script>

<ArkMenu.Root
  {id}
  {open}
  {closeOnSelect}
  onInteractOutside={(event: Event) => {
    if (!closeOnInteractOutside) event.preventDefault();
  }}
  onEscapeKeyDown={(event: KeyboardEvent) => {
    if (!closeOnEscape) event.preventDefault();
  }}
  positioning={{ placement, gutter: 4 }}
  lazyMount
  unmountOnExit
  onOpenChange={handleOpenChange}
  onSelect={(details: MenuSelectionDetails) => handleSelect(details.value)}
>
  <ArkMenu.Trigger {disabled}>
    {#snippet asChild(props)}
      {#if trigger}
        {@render trigger(props() as MenuTriggerProps)}
      {:else}
        <Button
          {...props() as MenuTriggerProps}
          colorScheme={triggerColorScheme}
          size={triggerSize}
          TrailingIcon={IconChevronDown}
          tracking={false}>{label}</Button
        >
      {/if}
    {/snippet}
  </ArkMenu.Trigger>
  <Portal disabled={!portalled}>
    <ArkMenu.Positioner>
      <ArkMenu.Content
        class={menuContentRecipe(className)}
        data-testid={testId}
      >
        <MenuItems {items} onSelect={handleSelect} />
      </ArkMenu.Content>
    </ArkMenu.Positioner>
  </Portal>
</ArkMenu.Root>
