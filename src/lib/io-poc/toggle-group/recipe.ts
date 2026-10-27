import { twJoin, twMerge } from 'tailwind-merge';

export type ToggleGroupSize = 'sm' | 'md';
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

export const toggleGroupRecipe = ({
  orientation = 'horizontal',
  className,
}: {
  orientation?: ToggleGroupOrientation;
  className?: string;
} = {}) =>
  twMerge(
    'inline-flex overflow-hidden rounded border border-secondary bg-interactive-tertiary',
    'focus-visible:outline-none data-[disabled]:cursor-not-allowed',
    orientation === 'vertical'
      ? 'flex-col divide-y divide-secondary'
      : 'flex-row divide-x divide-secondary',
    className,
  );

const itemSizeClasses: Record<ToggleGroupSize, string> = {
  sm: 'min-h-6 gap-1 px-2 py-1 text-xs leading-none',
  md: 'min-h-8 gap-2 px-3 py-1 text-base leading-none',
};

export const toggleGroupIconSize: Record<ToggleGroupSize, number> = {
  sm: 12,
  md: 16,
};

export const toggleGroupItemRecipe = ({
  size = 'md',
  className,
}: {
  size?: ToggleGroupSize;
  className?: string;
} = {}) =>
  twMerge(
    twJoin(
      'relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
      'bg-interactive-tertiary font-sans font-medium text-secondary',
      'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary-press',
      '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover [&:not(:disabled)]:hover:text-primary',
      '[&:not(:disabled)]:active:bg-interactive-tertiary-press',
      'data-[state=on]:bg-interactive-secondary-hover data-[state=on]:text-brand',
      '[&:not(:disabled)[data-state=on]]:hover:bg-interactive-secondary-press [&:not(:disabled)[data-state=on]]:hover:text-brand',
      'disabled:cursor-not-allowed disabled:opacity-disabled',
      '[&:has(>svg:only-child)]:aspect-square [&:has(>svg:only-child)]:px-0',
    ),
    itemSizeClasses[size],
    className,
  );
