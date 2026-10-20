<script lang="ts" module>
  import {
    type BadgeColorScheme,
    badgeContentRecipe,
    badgeRecipe,
    badgeSegmentRecipe,
    type BadgeSize,
  } from '$lib/io/badge';

  export type BadgeCountSize = BadgeSize;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { RoundnessGroup } from '$lib/io/roundness-group';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    value: string | number;
    total?: string | number;
    colorScheme?: Extract<BadgeColorScheme, 'error' | 'neutral'>;
    size?: BadgeCountSize;
    class?: string;
  }

  let {
    value,
    total,
    colorScheme = 'neutral',
    size = 'md',
    class: className,
    ...rest
  }: Props = $props();
</script>

<RoundnessGroup
  roundness="full"
  innerBorderHandling="collapse"
  class={badgeRecipe({ size, className })}
  {...rest}
>
  <span class={badgeSegmentRecipe({ size, colorScheme })}>
    <span class={badgeContentRecipe({ size })}>
      <span>{value}</span>
    </span>
    {#if total !== undefined}
      <span class="inline-flex items-center justify-center">
        <span>/</span>
      </span>
      <span class={badgeContentRecipe({ size })}>
        <span>{total}</span>
      </span>
    {/if}
  </span>
</RoundnessGroup>
