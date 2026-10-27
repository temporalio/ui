import { twJoin, twMerge } from 'tailwind-merge';

export type ToggleSize = 'sm' | 'md';

export const toggleBaseClasses = twJoin(
  'relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
  'rounded border border-secondary bg-interactive-tertiary font-sans font-medium text-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
  '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover',
  '[&:not(:disabled)]:active:bg-interactive-tertiary-press',
  'data-[pressed]:border-brand data-[pressed]:bg-interactive-secondary-hover data-[pressed]:text-brand',
  '[&:not(:disabled)[data-pressed]]:hover:bg-interactive-secondary-press',
  'data-[state=on]:border-brand data-[state=on]:bg-interactive-secondary-hover data-[state=on]:text-brand',
  '[&:not(:disabled)[data-state=on]]:hover:bg-interactive-secondary-press',
  'disabled:cursor-not-allowed disabled:opacity-disabled',
  '[&:has(>svg:only-child)]:aspect-square [&:has(>svg:only-child)]:p-0',
);

export const toggleSizeClasses: Record<ToggleSize, string> = {
  sm: 'min-h-6 gap-1 px-2 py-1 text-xs leading-none',
  md: 'min-h-8 gap-2 px-3 py-1 text-base leading-none',
};

export const toggleIconSize: Record<ToggleSize, number> = {
  sm: 12,
  md: 16,
};

export const toggleRecipe = ({
  size = 'md',
  className,
}: {
  size?: ToggleSize;
  className?: string;
} = {}) => twMerge(toggleBaseClasses, toggleSizeClasses[size], className);
