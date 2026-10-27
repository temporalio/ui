import { twJoin, twMerge } from 'tailwind-merge';

import { fieldRecipe } from '$lib/io-ark/field';

export const listboxRecipe = (className?: string) => fieldRecipe(className);

export const listboxPanelRecipe = (className?: string) =>
  twMerge(
    'flex w-full flex-col overflow-hidden rounded border border-primary bg-background-primary',
    'data-[invalid]:border-danger data-[disabled]:opacity-disabled',
    className,
  );

export const listboxInputRecipe = () =>
  twJoin(
    'h-10 w-full border-0 border-b border-primary bg-transparent px-3 text-sm text-primary',
    'placeholder:text-tertiary focus:outline-none focus-visible:bg-surface-secondary',
    'disabled:cursor-not-allowed',
  );

export const listboxContentRecipe = (
  orientation: 'horizontal' | 'vertical' = 'vertical',
) =>
  twJoin(
    'flex gap-0.5 p-1 text-sm text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary',
    orientation === 'horizontal'
      ? 'flex-row overflow-x-auto'
      : 'max-h-72 flex-col overflow-y-auto',
  );

export const listboxItemGroupLabelRecipe = () =>
  'px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-secondary';

export const listboxItemRecipe = () =>
  twJoin(
    'flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-2',
    'hover:bg-interactive-tertiary-hover',
    'data-[highlighted]:bg-interactive-secondary-hover',
    'data-[state=checked]:font-medium',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled data-[disabled]:hover:bg-transparent',
  );

export const listboxEmptyRecipe = () => 'px-2 py-2 text-secondary';
