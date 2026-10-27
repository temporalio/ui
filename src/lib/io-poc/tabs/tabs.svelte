<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { IconComponent } from '$lib/io/icon';

  import type { TabsOrientation, TabsVariant } from './recipe';

  export interface TabsItem {
    value: string;
    label: string;
    disabled?: boolean;
    Icon?: IconComponent;
    badge?: string | number;
  }

  export interface TabsProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    items: TabsItem[];
    value?: string;
    label?: string;
    orientation?: TabsOrientation;
    variant?: TabsVariant;
    activationMode?: 'automatic' | 'manual';
    loopFocus?: boolean;
    lazyMount?: boolean;
    unmountOnExit?: boolean;
    onValueChange?: (value: string) => void;
    id?: string;
    class?: string;
    listClass?: string;
    contentClass?: string;
    content?: Snippet<[TabsItem]>;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import {
    Tabs as ArkTabs,
    type TabsValueChangeDetails,
  } from '@ark-ui/svelte/tabs';

  import {
    tabsBadgeRecipe,
    tabsContentRecipe,
    tabsIndicatorRecipe,
    tabsListRecipe,
    tabsRecipe,
    tabsTriggerRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    items,
    value = $bindable(),
    label,
    orientation = 'horizontal',
    variant = 'line',
    activationMode = 'automatic',
    loopFocus = true,
    lazyMount = false,
    unmountOnExit = false,
    onValueChange,
    id = generatedId,
    class: className,
    listClass,
    contentClass,
    content,
    children,
    ...rest
  }: TabsProps = $props();

  const selectedValue = $derived(
    value ?? items.find((item) => !item.disabled)?.value ?? null,
  );

  function handleValueChange(details: TabsValueChangeDetails) {
    if (details.value === value) return;
    value = details.value;
    onValueChange?.(details.value);
  }
</script>

<ArkTabs.Root
  {id}
  value={selectedValue}
  {orientation}
  {activationMode}
  {loopFocus}
  {lazyMount}
  {unmountOnExit}
  onValueChange={handleValueChange}
  class={tabsRecipe({ orientation, className })}
  {...rest}
>
  <ArkTabs.List
    aria-label={label}
    class={tabsListRecipe({ variant, orientation, className: listClass })}
  >
    {#each items as item (item.value)}
      <ArkTabs.Trigger
        value={item.value}
        disabled={item.disabled}
        class={tabsTriggerRecipe({ variant, orientation })}
        data-track-name="tabs"
        data-track-intent="select"
        data-track-text={item.label}
      >
        {#if item.Icon}<item.Icon width={16} height={16} />{/if}
        <span>{item.label}</span>
        {#if item.badge !== undefined}
          <span class={tabsBadgeRecipe()}>{item.badge}</span>
        {/if}
      </ArkTabs.Trigger>
    {/each}
    {#if variant === 'line'}
      <ArkTabs.Indicator class={tabsIndicatorRecipe({ orientation })} />
    {/if}
  </ArkTabs.List>
  {#if content}
    {#each items as item (item.value)}
      <ArkTabs.Content
        value={item.value}
        class={tabsContentRecipe(contentClass)}
      >
        {@render content(item)}
      </ArkTabs.Content>
    {/each}
  {/if}
  {@render children?.()}
</ArkTabs.Root>
