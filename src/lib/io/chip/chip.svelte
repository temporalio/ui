<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  import {
    type ChipColorScheme,
    chipRecipe,
    chipSegmentRecipe,
  } from './recipe';

  export type ChipExtension = {
    text: string;
    Icon?: ConditionalValue<IconComponent>;
  };
</script>

<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends Omit<
    HTMLButtonAttributes,
    'children' | 'class' | 'type'
  > {
    text: string;
    colorScheme?: ChipColorScheme;
    Icon?: ConditionalValue<IconComponent>;
    extension?: ConditionalValue<ChipExtension>;
    class?: string;
    type?: HTMLButtonAttributes['type'];
  }

  let {
    text,
    colorScheme = 'neutral',
    Icon,
    extension,
    class: className,
    type = 'button',
    ...rest
  }: Props = $props();
</script>

<button {type} class={chipRecipe({ colorScheme, className })} {...rest}>
  <span class={chipSegmentRecipe({ colorScheme })}>
    {#if Icon}
      <Icon width="1em" height="1em" />
    {/if}
    <span>{text}</span>
  </span>
  {#if extension}
    <span class={chipSegmentRecipe({ colorScheme, isExtension: true })}>
      {#if extension.Icon}
        <extension.Icon width="1em" height="1em" />
      {/if}
      <span>{extension.text}</span>
    </span>
  {/if}
</button>
