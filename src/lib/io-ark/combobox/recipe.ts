import { twJoin, twMerge } from 'tailwind-merge';

import { fieldControlRecipe } from '$lib/io-ark/field';

export const comboboxControlRecipe = (className?: string) =>
  fieldControlRecipe(
    twMerge(
      'flex-wrap gap-1 py-1 pl-3 pr-1 focus-within:hover:border-primary',
      className,
    ),
  );

export const comboboxInputRecipe = () =>
  twJoin(
    'h-7 min-w-16 flex-1 border-0 bg-transparent p-0 text-sm text-primary',
    'placeholder:text-tertiary focus:outline-none focus:ring-0',
    'disabled:cursor-not-allowed',
  );

export const comboboxIconButtonRecipe = () =>
  twJoin(
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-secondary',
    'hover:bg-interactive-tertiary-hover hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'disabled:cursor-not-allowed disabled:hover:bg-transparent',
  );

export const comboboxTagRecipe = () =>
  twJoin(
    'inline-flex h-6 max-w-full items-center gap-1 rounded-sm border border-secondary',
    'bg-surface-secondary pl-2 pr-0.5 text-xs text-primary',
  );

export const comboboxTagRemoveRecipe = () =>
  twJoin(
    'flex h-5 w-5 items-center justify-center rounded-sm text-secondary',
    'hover:bg-interactive-tertiary-hover hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
  );

export const comboboxContentRecipe = (className?: string) =>
  twMerge(
    'z-50 max-h-72 overflow-y-auto rounded border border-primary bg-background-primary p-1',
    'text-sm text-primary shadow-lg focus:outline-none',
    className,
  );

export const comboboxItemRecipe = () =>
  twJoin(
    'flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-2',
    'data-[highlighted]:bg-interactive-secondary-hover',
    'data-[state=checked]:font-medium',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled',
  );

export const comboboxEmptyRecipe = () => 'px-2 py-2 text-secondary';
