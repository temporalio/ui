import { twJoin, twMerge } from 'tailwind-merge';

import { roundnessGroupRecipe } from '$lib/io/roundness-group';

export type ChipColorScheme =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error';

const overlayClasses = twJoin(
  'before:absolute',
  'before:inset-0',
  'before:z-0',
  'before:rounded-[var(--group-inner-radius)]',
  'before:bg-transparent',
  "before:content-['']",
  'enabled:hover:before:bg-surface-overlay-primary',
  'enabled:active:before:bg-surface-overlay-secondary',
);

const focusClasses = twJoin(
  'focus-visible:outline-hidden',
  'focus-visible:ring-2',
  'focus-visible:ring-interactive-primary',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background-primary',
);

const disabledClasses = twJoin(
  'disabled:cursor-not-allowed',
  'disabled:opacity-disabled',
);

const wrapperClasses = twJoin(
  'relative',
  'inline-flex',
  'appearance-none',
  'items-stretch',
  'whitespace-nowrap',

  '[--group-border-width:1px]',
  'border-[length:var(--group-border-width)]',
  'p-0',
  'font-sans',
  'uppercase',
  'font-medium',
  'text-xs leading-none',
  'enabled:cursor-pointer',
  'min-h-[20px]',
  focusClasses,
  overlayClasses,
);

const segmentClasses = twJoin(
  'relative',
  'z-10',
  'inline-flex',
  'flex-nowrap',
  'items-center',
  'justify-center',
  'gap-1',
  'py-0.5',
  'px-1',
);

const colorSchemeClasses: Record<
  ChipColorScheme,
  { wrapper: string; extension: string }
> = {
  neutral: {
    wrapper: twJoin('border-secondary bg-surface-neutral text-secondary'),
    extension: twJoin('bg-surface-overlay-tertiary'),
  },
  info: {
    wrapper: twJoin(
      'border-information bg-surface-information text-information',
    ),
    extension: twJoin('bg-surface-overlay-information'),
  },
  success: {
    wrapper: twJoin('border-success bg-surface-success text-success'),
    extension: twJoin('bg-surface-overlay-success'),
  },
  warning: {
    wrapper: twJoin('border-warning bg-surface-warning text-warning'),
    extension: twJoin('bg-surface-overlay-warning'),
  },
  danger: {
    wrapper: twJoin('border-danger bg-surface-danger text-danger'),
    extension: twJoin('bg-surface-overlay-danger'),
  },
  error: {
    wrapper: twJoin('border-error bg-surface-error text-error'),
    extension: twJoin('bg-surface-overlay-error'),
  },
};

/** Styles the button shell; --group-border-width controls its border and inset segment/overlay radii. */
export const chipRecipe = ({
  colorScheme,
  className,
}: {
  colorScheme: ChipColorScheme;
  className?: string;
}) =>
  twMerge(
    roundnessGroupRecipe({ roundness: 'base', roundnessTarget: 'wrapper' }),
    wrapperClasses,
    colorSchemeClasses[colorScheme].wrapper,
    className,
    disabledClasses,
  );

/** Aligns and pads chip content; isExtension adds the scheme's extension overlay. */
export const chipSegmentRecipe = ({
  colorScheme,
  isExtension = false,
  className,
}: {
  colorScheme: ChipColorScheme;
  isExtension?: boolean;
  className?: string;
}) =>
  twMerge(
    segmentClasses,
    isExtension && colorSchemeClasses[colorScheme].extension,
    className,
  );
