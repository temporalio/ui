<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  import { type TagColorScheme, tagSegmentRecipe } from './recipe';

  export type TagExtension = {
    text: string;
    Icon?: ConditionalValue<IconComponent>;
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { badgeRecipe } from '$lib/io/badge';
  import { IconTag } from '$lib/io/icon';
  import { RoundnessGroup } from '$lib/io/roundness-group';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    text: string;
    colorScheme?: TagColorScheme;
    Icon?: ConditionalValue<IconComponent>;
    extension?: ConditionalValue<TagExtension>;
    class?: string;
  }

  let {
    text,
    colorScheme = 'neutral',
    Icon = IconTag,
    extension,
    class: className,
    ...rest
  }: Props = $props();
</script>

<RoundnessGroup
  roundness="full"
  innerBorderHandling="collapse"
  class={badgeRecipe({ size: 'md', className })}
  {...rest}
>
  <span class={tagSegmentRecipe({ colorScheme })}>
    {#if Icon}
      <Icon width="1em" height="1em" />
    {/if}
    <span>{text}</span>
  </span>
  {#if extension}
    <span class={tagSegmentRecipe({ colorScheme })}>
      {#if extension.Icon}
        <extension.Icon width="1em" height="1em" />
      {/if}
      <span>{extension.text}</span>
    </span>
  {/if}
</RoundnessGroup>
