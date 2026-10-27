<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { NavigationMenuOrientation } from './recipe';

  export interface NavigationMenuLinkItem {
    label: string;
    href: string;
    description?: string;
    current?: boolean;
    disabled?: boolean;
  }

  export interface NavigationMenuItem {
    label: string;
    href?: string;
    current?: boolean;
    disabled?: boolean;
    value?: string;
    children?: NavigationMenuLinkItem[];
  }

  export interface NavigationMenuProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    items: NavigationMenuItem[];
    label?: string;
    value?: string;
    orientation?: NavigationMenuOrientation;
    openDelay?: number;
    closeDelay?: number;
    onValueChange?: (value: string) => void;
    id?: string;
    class?: string;
  }
</script>

<script lang="ts">
  import {
    NavigationMenu as ArkNavigationMenu,
    type NavigationMenuValueChangeDetails,
  } from '@ark-ui/svelte/navigation-menu';

  import { IconChevronDown } from '$lib/io/icon';

  import {
    navigationMenuContentRecipe,
    navigationMenuIndicatorRecipe,
    navigationMenuItemRecipe,
    navigationMenuLinkRecipe,
    navigationMenuListRecipe,
    navigationMenuRecipe,
    navigationMenuSubLinkDescriptionRecipe,
    navigationMenuSubLinkRecipe,
    navigationMenuTriggerRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    items,
    label = 'Main',
    value = $bindable(''),
    orientation = 'horizontal',
    openDelay = 200,
    closeDelay = 300,
    onValueChange,
    id = generatedId,
    class: className,
    ...rest
  }: NavigationMenuProps = $props();

  const itemValue = (item: NavigationMenuItem) => item.value ?? item.label;

  function handleValueChange(details: NavigationMenuValueChangeDetails) {
    if (details.value === value) return;
    value = details.value;
    onValueChange?.(details.value);
  }
</script>

<ArkNavigationMenu.Root
  {id}
  {value}
  {orientation}
  {openDelay}
  {closeDelay}
  onValueChange={handleValueChange}
  aria-label={label}
  class={navigationMenuRecipe(className)}
  {...rest}
>
  <ArkNavigationMenu.List class={navigationMenuListRecipe({ orientation })}>
    {#each items as item (itemValue(item))}
      <ArkNavigationMenu.Item
        value={itemValue(item)}
        disabled={item.disabled}
        class={navigationMenuItemRecipe({ orientation })}
      >
        {#if item.children?.length}
          <ArkNavigationMenu.Trigger
            class={navigationMenuTriggerRecipe({
              current:
                item.current || item.children.some((child) => child.current),
            })}
          >
            {item.label}
            <span class={navigationMenuIndicatorRecipe()}>
              <IconChevronDown width={16} height={16} />
            </span>
          </ArkNavigationMenu.Trigger>
          <ArkNavigationMenu.Content
            class={navigationMenuContentRecipe({ orientation })}
          >
            <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
              {#each item.children as child (child.href)}
                <li>
                  <ArkNavigationMenu.Link
                    href={child.href}
                    current={child.current}
                    aria-disabled={child.disabled || undefined}
                    class={navigationMenuSubLinkRecipe()}
                  >
                    <span class="font-medium">{child.label}</span>
                    {#if child.description}
                      <span class={navigationMenuSubLinkDescriptionRecipe()}
                        >{child.description}</span
                      >
                    {/if}
                  </ArkNavigationMenu.Link>
                </li>
              {/each}
            </ul>
          </ArkNavigationMenu.Content>
        {:else if item.href}
          <ArkNavigationMenu.Link
            href={item.href}
            current={item.current}
            class={navigationMenuLinkRecipe()}
          >
            {item.label}
          </ArkNavigationMenu.Link>
        {/if}
      </ArkNavigationMenu.Item>
    {/each}
  </ArkNavigationMenu.List>
</ArkNavigationMenu.Root>

<style>
  @keyframes -global-io-ark-navigation-menu-in {
    from {
      opacity: 0;
      translate: 0 -4px;
    }
  }
</style>
