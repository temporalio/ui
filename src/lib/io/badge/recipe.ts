import { twJoin, twMerge } from 'tailwind-merge';

export type BadgeColorScheme =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'accent';

export type BadgeSize = 'sm' | 'md';

const wrapperClasses = twJoin(
  'inline-flex',
  'items-stretch',
  'overflow-hidden',
  'whitespace-nowrap',
  'font-sans',
  'uppercase',
  'font-medium',
  '[&>*]:shrink-0',
);
const segmentClasses = twJoin(
  'inline-flex flex-nowrap',
  'items-center justify-center',
  'gap-1',
);

const sizeClasses: Record<
  BadgeSize,
  { wrapper: string; segment: string; content: string }
> = {
  sm: {
    wrapper: twJoin('text-2xs leading-none'),
    segment: twJoin('min-h-[16px]'),
    content: twJoin('px-1'),
  },
  md: {
    wrapper: twJoin('text-xs leading-none'),
    segment: twJoin('min-h-[20px]'),
    content: twJoin('px-1.5'),
  },
};

const colorSchemeClasses: Record<BadgeColorScheme, string> = {
  neutral: twJoin('border-tertiary', 'bg-surface-tertiary', 'text-secondary'),
  info: twJoin(
    'border-information',
    'bg-surface-information',
    'text-information',
  ),
  success: twJoin('border-success', 'bg-surface-success', 'text-success'),
  warning: twJoin('border-warning', 'bg-surface-warning', 'text-warning'),
  danger: twJoin('border-danger', 'bg-surface-danger', 'text-danger'),
  error: twJoin('border-error', 'bg-surface-error', 'text-error'),
  accent: twJoin('border-accent', 'bg-surface-accent', 'text-accent'),
};

const truncateClasses = twJoin(
  'min-w-0 max-w-full',
  '[&>.truncatable]:min-w-0',
  '[&>.truncatable]:shrink',
  '[&>.truncatable>span]:truncate',
  '[&>.truncatable>span]:-my-0.5',
  '[&>.truncatable>span]:py-0.5',
);

/** Styles the RoundnessGroup wrapper with layout, typography, and opt-in truncation. */
export const badgeRecipe = ({
  size,
  truncate = false,
  className,
}: {
  size: BadgeSize;
  truncate?: boolean;
  className?: string;
}) =>
  twMerge(
    wrapperClasses,
    sizeClasses[size].wrapper,
    truncate && truncateClasses,
    className,
  );

/** Adds content alignment, gap, and horizontal padding; use inside a segment or combine with its recipe. */
export const badgeContentRecipe = ({
  size,
  className,
}: {
  size: BadgeSize;
  className?: string;
}) => twMerge(segmentClasses, sizeClasses[size].content, className);

/** Styles the colored segment shell without content spacing; truncatable opts it into wrapper truncation. */
export const badgeSegmentRecipe = ({
  size,
  colorScheme = 'neutral',
  truncatable = false,
  className,
}: {
  size: BadgeSize;
  colorScheme?: BadgeColorScheme;
  truncatable?: boolean;
  className?: string;
}) =>
  twMerge(
    twJoin('inline-flex', 'border', 'py-0.5', '[&>svg]:shrink-0'),
    sizeClasses[size].segment,
    colorSchemeClasses[colorScheme],
    truncatable && 'truncatable',
    className,
  );
