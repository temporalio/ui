<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { IconComponent } from '$lib/io/icon';

  import type { ToggleGroupOrientation, ToggleGroupSize } from './recipe';

  export interface ToggleGroupItem {
    value: string;
    label?: string;
    Icon?: IconComponent;
    disabled?: boolean;
    ariaLabel?: string;
  }

  export interface ToggleGroupProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    items: ToggleGroupItem[];
    label: string;
    value?: string[];
    multiple?: boolean;
    deselectable?: boolean;
    orientation?: ToggleGroupOrientation;
    loopFocus?: boolean;
    rovingFocus?: boolean;
    disabled?: boolean;
    size?: ToggleGroupSize;
    id?: string;
    onValueChange?: (value: string[]) => void;
    class?: string;
    itemClass?: string;
  }
</script>

<script lang="ts">
  import {
    ToggleGroup as ArkToggleGroup,
    type ToggleGroupItemBaseProps,
  } from '@ark-ui/svelte/toggle-group';

  import {
    toggleGroupIconSize,
    toggleGroupItemRecipe,
    toggleGroupRecipe,
  } from './recipe';

  let {
    items,
    label,
    value = $bindable([]),
    multiple = false,
    deselectable = false,
    orientation = 'horizontal',
    loopFocus = true,
    rovingFocus = true,
    disabled = false,
    size = 'md',
    onValueChange,
    class: className,
    itemClass,
    ...rest
  }: ToggleGroupProps = $props();

  const iconSize = $derived(toggleGroupIconSize[size]);

  const itemProps = (
    item: ToggleGroupItem,
  ): Pick<ToggleGroupItemBaseProps, 'value' | 'disabled'> =>
    item.disabled
      ? { value: item.value, disabled: true }
      : { value: item.value };
</script>

<ArkToggleGroup.Root
  bind:value
  {multiple}
  {deselectable}
  {orientation}
  {loopFocus}
  {rovingFocus}
  {disabled}
  onValueChange={(details) => onValueChange?.(details.value)}
  aria-label={label}
  {...rest}
  class={toggleGroupRecipe({ orientation, className })}
>
  {#each items as item (item.value)}
    <ArkToggleGroup.Item
      {...itemProps(item)}
      aria-label={item.ariaLabel ?? (item.label ? undefined : item.value)}
      data-track-name="toggle-group"
      data-track-intent="toggle"
      data-track-text={item.label ?? item.ariaLabel ?? item.value}
      class={toggleGroupItemRecipe({ size, className: itemClass })}
    >
      {#if item.Icon}
        <item.Icon width={iconSize} height={iconSize} />
      {/if}
      {#if item.label}
        <span>{item.label}</span>
      {/if}
    </ArkToggleGroup.Item>
  {/each}
</ArkToggleGroup.Root>
