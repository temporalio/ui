<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { BadgeExtension, BadgeSegment, BadgeVariant } from './types';

  import BaseBadge from './_badge.svelte';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    text: string;
    variant?: BadgeVariant;
    Icon?: BadgeSegment['TrailIcon'];
    extension?: BadgeExtension;
    class?: string;
  }

  let {
    text,
    variant = 'neutral',
    Icon,
    extension,
    class: className,
    ...rest
  }: Props = $props();

  const segments = $derived<BadgeSegment[]>([
    { text, TrailIcon: Icon },
    ...(extension
      ? [
          {
            text: extension.text ?? '',
            LeadIcon: extension.LeadIcon,
            TrailIcon: extension.TrailIcon,
          },
        ]
      : []),
  ]);
</script>

<BaseBadge {variant} {segments} class={className} {...rest} />
