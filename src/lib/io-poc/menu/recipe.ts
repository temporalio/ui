import { twJoin, twMerge } from 'tailwind-merge';

import { floatingSurfaceClasses } from '../shared/recipe';

export type MenuPlacement =
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

export const menuContentRecipe = (className?: string) =>
  twMerge(
    floatingSurfaceClasses,
    'z-50 min-w-48 max-w-xs overflow-y-auto p-1',
    'max-h-[min(24rem,var(--available-height))] text-sm text-primary focus:outline-none',
    'data-[state=open]:animate-[io-poc-float-in_100ms_ease-out]',
    'data-[state=closed]:animate-[io-poc-fade-out_75ms_ease-in]',
    'motion-reduce:animate-none',
    className,
  );

export const menuItemRecipe = ({ danger = false }: { danger?: boolean } = {}) =>
  twJoin(
    'flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left no-underline',
    'outline-none data-[highlighted]:bg-interactive-secondary-hover',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled data-[disabled]:data-[highlighted]:bg-transparent',
    danger
      ? 'text-danger data-[highlighted]:bg-surface-danger'
      : 'text-primary',
  );

export const menuItemIconRecipe = () => 'shrink-0 text-current';

export const menuItemTextRecipe = () => 'flex min-w-0 flex-1 flex-col';

export const menuItemDescriptionRecipe = () =>
  'text-xs font-normal text-secondary';

export const menuIndicatorSlotRecipe = () =>
  'flex h-4 w-4 shrink-0 items-center justify-center text-brand';

export const menuGroupLabelRecipe = () =>
  'px-2 pb-1 pt-2 text-xs font-medium text-secondary';

export const menuSeparatorRecipe = () =>
  '-mx-1 my-1 border-0 border-t border-primary';

export const menuSubmenuIndicatorRecipe = () =>
  'ml-auto shrink-0 text-secondary';
