import { twJoin, twMerge } from 'tailwind-merge';

export const paginationRecipe = (className?: string) =>
  twMerge(
    'flex w-full flex-wrap items-center justify-between gap-3 text-sm text-primary',
    className,
  );

export const paginationListRecipe = () => 'flex items-center gap-1';

export const paginationItemRecipe = () =>
  twJoin(
    'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded px-2',
    'text-sm font-medium text-primary',
    'hover:bg-interactive-tertiary-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'data-[selected]:bg-interactive-primary data-[selected]:text-white data-[selected]:hover:bg-interactive-primary-hover',
  );

export const paginationTriggerRecipe = () =>
  twJoin(
    'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded px-2',
    'text-sm font-medium text-primary',
    'hover:bg-interactive-tertiary-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled data-[disabled]:hover:bg-transparent',
    'aria-disabled:pointer-events-none aria-disabled:opacity-disabled',
  );

export const paginationEllipsisRecipe = () =>
  'inline-flex h-8 min-w-8 items-center justify-center text-secondary';

export const paginationSummaryRecipe = () => 'text-secondary tabular-nums';

export const paginationPageSizeRecipe = () =>
  'flex items-center gap-2 text-secondary';

export const paginationPageSizeSelectRecipe = () =>
  twJoin(
    'h-8 rounded border border-primary bg-background-primary px-2 text-sm text-primary',
    'hover:border-brand',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
  );
