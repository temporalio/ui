<script lang="ts">
  import { Menu as ArkMenu } from '@ark-ui/svelte/menu';
  import { Portal } from '@ark-ui/svelte/portal';

  import { IconCheckmark, IconChevronRight, IconDot } from '$lib/io/icon';

  import {
    menuContentRecipe,
    menuGroupLabelRecipe,
    menuIndicatorSlotRecipe,
    menuItemDescriptionRecipe,
    menuItemIconRecipe,
    menuItemRecipe,
    menuItemTextRecipe,
    menuSeparatorRecipe,
    menuSubmenuIndicatorRecipe,
  } from './recipe';
  import type { MenuActionEntry, MenuEntry } from './types';

  import MenuItems from './menu-items.svelte';

  let {
    items,
    onSelect,
  }: {
    items: MenuEntry[];
    onSelect: (value: string) => void;
  } = $props();

  const hasIndicators = $derived(
    items.some((entry) => entry.type === 'checkbox' || entry.type === 'radio'),
  );
</script>

{#snippet actionContent(entry: MenuActionEntry)}
  {#if hasIndicators}<span class={menuIndicatorSlotRecipe()}></span>{/if}
  {#if entry.Icon}
    <entry.Icon width={16} height={16} class={menuItemIconRecipe()} />
  {/if}
  <span class={menuItemTextRecipe()}>
    <ArkMenu.ItemText>{entry.label}</ArkMenu.ItemText>
    {#if entry.description}
      <span class={menuItemDescriptionRecipe()}>{entry.description}</span>
    {/if}
  </span>
{/snippet}

{#each items as entry, index (index)}
  {#if entry.type === 'separator'}
    <ArkMenu.Separator class={menuSeparatorRecipe()} />
  {:else if entry.type === 'group'}
    <ArkMenu.ItemGroup>
      {#if entry.label}
        <ArkMenu.ItemGroupLabel class={menuGroupLabelRecipe()}
          >{entry.label}</ArkMenu.ItemGroupLabel
        >
      {/if}
      <MenuItems items={entry.items} {onSelect} />
    </ArkMenu.ItemGroup>
  {:else if entry.type === 'checkbox'}
    <ArkMenu.CheckboxItem
      value={entry.value}
      checked={entry.checked}
      disabled={entry.disabled}
      closeOnSelect={false}
      onCheckedChange={entry.onCheckedChange}
      class={menuItemRecipe()}
    >
      <span class={menuIndicatorSlotRecipe()}>
        <ArkMenu.ItemIndicator
          ><IconCheckmark width={16} height={16} /></ArkMenu.ItemIndicator
        >
      </span>
      <ArkMenu.ItemText class={menuItemTextRecipe()}
        >{entry.label}</ArkMenu.ItemText
      >
    </ArkMenu.CheckboxItem>
  {:else if entry.type === 'radio'}
    {@const radio = entry}
    <ArkMenu.RadioItemGroup
      value={radio.value}
      onValueChange={(details) => radio.onValueChange?.(details.value)}
    >
      {#if radio.label}
        <ArkMenu.ItemGroupLabel class={menuGroupLabelRecipe()}
          >{radio.label}</ArkMenu.ItemGroupLabel
        >
      {/if}
      {#each radio.options as option (option.value)}
        <ArkMenu.RadioItem
          value={option.value}
          disabled={option.disabled}
          closeOnSelect={false}
          class={menuItemRecipe()}
        >
          <span class={menuIndicatorSlotRecipe()}>
            <ArkMenu.ItemIndicator
              ><IconDot width={16} height={16} /></ArkMenu.ItemIndicator
            >
          </span>
          <ArkMenu.ItemText class={menuItemTextRecipe()}
            >{option.label}</ArkMenu.ItemText
          >
        </ArkMenu.RadioItem>
      {/each}
    </ArkMenu.RadioItemGroup>
  {:else if entry.type === 'submenu'}
    {@const submenu = entry}
    <ArkMenu.Root
      positioning={{ placement: 'right-start', gutter: 4 }}
      lazyMount
      unmountOnExit
      onSelect={(details) => onSelect(details.value)}
    >
      <ArkMenu.TriggerItem class={menuItemRecipe()}>
        {#if hasIndicators}<span class={menuIndicatorSlotRecipe()}></span>{/if}
        {#if submenu.Icon}
          <submenu.Icon width={16} height={16} class={menuItemIconRecipe()} />
        {/if}
        <span class={menuItemTextRecipe()}>{submenu.label}</span>
        <IconChevronRight
          width={16}
          height={16}
          class={menuSubmenuIndicatorRecipe()}
        />
      </ArkMenu.TriggerItem>
      <Portal>
        <ArkMenu.Positioner>
          <ArkMenu.Content class={menuContentRecipe()}>
            <MenuItems items={submenu.items} {onSelect} />
          </ArkMenu.Content>
        </ArkMenu.Positioner>
      </Portal>
    </ArkMenu.Root>
  {:else if entry.href}
    {@const link = entry}
    <ArkMenu.Item
      value={link.value}
      disabled={link.disabled}
      class={menuItemRecipe({ danger: link.danger })}
    >
      {#snippet asChild(props)}
        <a {...props()} href={link.href} target={link.target}
          >{@render actionContent(link)}</a
        >
      {/snippet}
    </ArkMenu.Item>
  {:else}
    <ArkMenu.Item
      value={entry.value}
      disabled={entry.disabled}
      class={menuItemRecipe({ danger: entry.danger })}
    >
      {@render actionContent(entry)}
    </ArkMenu.Item>
  {/if}
{/each}
