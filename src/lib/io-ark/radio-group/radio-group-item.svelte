<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export interface RadioGroupItemProps {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { RadioGroup as ArkRadioGroup } from '@ark-ui/svelte/radio-group';

  import {
    radioGroupItemControlRecipe,
    radioGroupItemDescriptionRecipe,
    radioGroupItemRecipe,
    radioGroupItemRowRecipe,
    radioGroupItemTextRecipe,
  } from './recipe';

  const descriptionId = $props.id();
  let {
    value,
    label,
    description = '',
    disabled,
    class: className,
    children,
  }: RadioGroupItemProps = $props();
</script>

<ArkRadioGroup.Item
  {value}
  {disabled}
  class={radioGroupItemRecipe(className)}
  data-track-name="radio"
  data-track-intent="select"
  data-track-text={label}
>
  <span class={radioGroupItemRowRecipe()}>
    <ArkRadioGroup.ItemControl class={radioGroupItemControlRecipe()} />
    <ArkRadioGroup.ItemText class={radioGroupItemTextRecipe()}
      >{label}</ArkRadioGroup.ItemText
    >
  </span>
  {#if description}
    <span id={descriptionId} class={radioGroupItemDescriptionRecipe()}
      >{description}</span
    >
  {/if}
  {@render children?.()}
  <ArkRadioGroup.ItemHiddenInput
    aria-describedby={description ? descriptionId : undefined}
  />
</ArkRadioGroup.Item>
