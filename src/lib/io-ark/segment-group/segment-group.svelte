<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { SegmentGroupOrientation, SegmentGroupSize } from './recipe';

  export interface SegmentGroupItem {
    value: string;
    label: string;
    disabled?: boolean;
  }

  export interface SegmentGroupProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    items: SegmentGroupItem[];
    label: string;
    labelHidden?: boolean;
    value?: string | null;
    orientation?: SegmentGroupOrientation;
    size?: SegmentGroupSize;
    disabled?: boolean;
    name?: string;
    id?: string;
    onValueChange?: (value: string | null) => void;
    class?: string;
  }
</script>

<script lang="ts">
  import {
    SegmentGroup as ArkSegmentGroup,
    type SegmentGroupItemBaseProps,
  } from '@ark-ui/svelte/segment-group';

  import { fieldLabelRecipe } from '$lib/io-ark/field';

  import {
    segmentGroupIndicatorRecipe,
    segmentGroupItemRecipe,
    segmentGroupRecipe,
    segmentGroupTrackRecipe,
  } from './recipe';

  let {
    items,
    label,
    labelHidden = false,
    value = $bindable(null),
    orientation = 'horizontal',
    size = 'md',
    disabled = false,
    name,
    onValueChange,
    class: className,
    ...rest
  }: SegmentGroupProps = $props();

  const itemProps = (
    item: SegmentGroupItem,
  ): Pick<SegmentGroupItemBaseProps, 'value' | 'disabled'> =>
    item.disabled
      ? { value: item.value, disabled: true }
      : { value: item.value };
</script>

<ArkSegmentGroup.Root
  bind:value
  {orientation}
  {disabled}
  {name}
  onValueChange={(details) => onValueChange?.(details.value)}
  {...rest}
  class={segmentGroupRecipe(className)}
>
  <ArkSegmentGroup.Label class={fieldLabelRecipe({ hidden: labelHidden })}
    >{label}</ArkSegmentGroup.Label
  >
  <div class={segmentGroupTrackRecipe(orientation)}>
    <ArkSegmentGroup.Indicator class={segmentGroupIndicatorRecipe()} />
    {#each items as item (item.value)}
      <ArkSegmentGroup.Item
        {...itemProps(item)}
        data-track-name="segment-group"
        data-track-intent="select"
        data-track-text={item.label}
        class={segmentGroupItemRecipe({ size })}
      >
        <ArkSegmentGroup.ItemText>{item.label}</ArkSegmentGroup.ItemText>
        <ArkSegmentGroup.ItemHiddenInput />
      </ArkSegmentGroup.Item>
    {/each}
  </div>
</ArkSegmentGroup.Root>
