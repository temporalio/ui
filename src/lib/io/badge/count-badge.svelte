<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  import type { IconComponent } from '$lib/io/icon';
  import { IconExclamationOctagon, IconHappyLappy } from '$lib/io/icon';

  import type {
    BadgeSegment,
    CountBadgeType,
    CountBadgeVariant,
  } from './types';

  import BaseBadge from './_badge.svelte';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    value: number;
    total?: number;
    type?: CountBadgeType;
    variant?: CountBadgeVariant;
    max?: number;
    Icon?: IconComponent | null;
    class?: string;
  }

  let {
    value,
    total,
    type = 'count',
    variant = 'neutral',
    max = 99,
    Icon,
    class: className,
    ...rest
  }: Props = $props();

  const displayValue = $derived(
    value > max ? `${max}+` : value.toLocaleString('en-US'),
  );

  const segments = $derived.by<BadgeSegment[]>(() => {
    if (type === 'total') {
      const totalSegments: BadgeSegment[] = [{ text: displayValue }];

      if (total === undefined) return totalSegments;

      return [
        ...totalSegments,
        { text: '/', class: 'px-0' },
        { text: total.toLocaleString('en-US') },
      ];
    }

    const CountIcon =
      Icon === undefined
        ? variant === 'error'
          ? IconExclamationOctagon
          : IconHappyLappy
        : Icon;

    return [
      { text: displayValue },
      ...(CountIcon ? [{ text: '', LeadIcon: CountIcon }] : []),
    ];
  });

  const badgeVariant = $derived(variant === 'error' ? 'danger' : 'neutral');
  const variantClass = $derived(
    variant === 'neutral' ? 'border-secondary text-primary' : undefined,
  );
</script>

{#if value > 0}
  <BaseBadge
    variant={badgeVariant}
    {segments}
    divided={false}
    aria-hidden="true"
    class={twMerge(variantClass, className)}
    {...rest}
  />
{/if}
