import { twJoin, twMerge } from 'tailwind-merge';

import { floatingSurfaceClasses } from '../shared/recipe';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export const popoverContentRecipe = (className?: string) =>
  twMerge(
    floatingSurfaceClasses,
    'z-50 w-80 max-w-[calc(100vw-2rem)] p-4 text-sm text-primary focus:outline-none',
    '[--arrow-background:var(--color-background-primary)] [--arrow-size:10px]',
    'data-[state=open]:animate-[io-ark-float-in_120ms_ease-out]',
    'data-[state=closed]:animate-[io-ark-fade-out_100ms_ease-in]',
    'motion-reduce:animate-none',
    className,
  );

export const popoverArrowTipRecipe = () =>
  twJoin('border-l border-t border-primary');

export const popoverHeaderRecipe = () =>
  'mb-2 flex items-start justify-between gap-3';

export const popoverTitleRecipe = () => 'text-base font-medium leading-6';

export const popoverDescriptionRecipe = () => 'mt-0.5 text-sm text-secondary';

export const popoverCloseRecipe = () => '-mr-2 -mt-1';
