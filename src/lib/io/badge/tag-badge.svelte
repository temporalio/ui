<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  import type { IconComponent } from '$lib/io/icon';
  import { IconTag } from '$lib/io/icon';

  import type {
    BadgeSegment,
    TagBadgeExtension,
    TagBadgeVariant,
  } from './types';

  import BaseBadge from './_badge.svelte';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    text: string;
    variant?: TagBadgeVariant;
    Icon?: IconComponent | null;
    extension?: TagBadgeExtension;
    class?: string;
  }

  let {
    text,
    variant = 'neutral',
    Icon = IconTag,
    extension,
    class: className,
    ...rest
  }: Props = $props();

  const segments = $derived.by<BadgeSegment[]>(() => {
    const content: BadgeSegment = {
      text,
      LeadIcon: Icon || undefined,
    };

    if (!extension) return [content];

    const ExtensionIcon =
      extension.Icon === undefined ? IconTag : extension.Icon;

    return [
      content,
      {
        text: extension.text,
        LeadIcon: ExtensionIcon || undefined,
      },
    ];
  });

  const variantClass = $derived(
    variant === 'neutral' ? 'border-primary bg-surface-primary' : undefined,
  );
</script>

<BaseBadge
  {variant}
  {segments}
  class={twMerge(variantClass, className)}
  {...rest}
/>
