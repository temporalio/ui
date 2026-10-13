import { twJoin, twMerge } from 'tailwind-merge';

import {
  type BadgeColorScheme,
  badgeContentRecipe,
  badgeSegmentRecipe,
} from '$lib/io/badge';

export type TagColorScheme = Exclude<BadgeColorScheme, 'error'>;

/** Reuses badge segment/content styling with only neutral surface and border overrides. */
export const tagSegmentRecipe = ({
  colorScheme,
  className,
}: {
  colorScheme: TagColorScheme;
  className?: string;
}) =>
  badgeSegmentRecipe({
    size: 'md',
    colorScheme,
    className: twMerge(
      badgeContentRecipe({ size: 'md' }),
      colorScheme === 'neutral' &&
        twJoin('border-primary', 'bg-surface-primary'),
      className,
    ),
  });
