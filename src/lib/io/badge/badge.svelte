<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  import {
    type BadgeColorScheme,
    badgeContentRecipe,
    badgeRecipe,
    badgeSegmentRecipe,
    type BadgeSize,
  } from './recipe';

  export type BadgeExtension = {
    text?: string;
    colorScheme?: BadgeColorScheme;
    truncate?: boolean;
    LeadIcon?: ConditionalValue<IconComponent>;
    TrailIcon?: ConditionalValue<IconComponent>;
  };

  export type BadgeExtensions = ConditionalValue<BadgeExtension>[];

  const isBadgeExtension = (
    extension: ConditionalValue<BadgeExtension>,
  ): extension is BadgeExtension =>
    extension !== false && extension !== null && extension !== undefined;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { RoundnessGroup } from '$lib/io/roundness-group';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    text: string;
    colorScheme?: BadgeColorScheme;
    size?: BadgeSize;
    truncate?: boolean;
    Icon?: ConditionalValue<IconComponent>;
    extension?: ConditionalValue<BadgeExtension>;
    extensions?: ConditionalValue<BadgeExtensions>;
    class?: string;
  }

  let {
    text,
    colorScheme = 'neutral',
    size = 'md',
    truncate = false,
    Icon,
    extension,
    extensions,
    class: className,
    ...rest
  }: Props = $props();

  const visibleExtensions = $derived(
    [extension, ...(extensions || [])].filter(isBadgeExtension),
  );
</script>

<RoundnessGroup
  roundness="full"
  innerBorderHandling="collapse"
  class={badgeRecipe({ size, truncate, className })}
  {...rest}
>
  <span
    class={badgeSegmentRecipe({
      size,
      colorScheme,
      truncatable: true,
      className: badgeContentRecipe({ size }),
    })}
  >
    <span>{text}</span>
    {#if Icon}
      <Icon width="1em" height="1em" />
    {/if}
  </span>
  {#each visibleExtensions as extension, index (index)}
    <span
      class={badgeSegmentRecipe({
        size,
        colorScheme: extension.colorScheme ?? colorScheme,
        truncatable: extension.truncate,
        className: badgeContentRecipe({ size }),
      })}
    >
      {#if extension.LeadIcon}
        <extension.LeadIcon width="1em" height="1em" />
      {/if}
      {#if extension.text}
        <span>{extension.text}</span>
      {/if}
      {#if extension.TrailIcon}
        <extension.TrailIcon width="1em" height="1em" />
      {/if}
    </span>
  {/each}
</RoundnessGroup>
