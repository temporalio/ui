import { twJoin, twMerge } from 'tailwind-merge';

import { fieldControlRecipe } from '$lib/io-poc/field';

import {
  controlIconButtonClasses,
  listEmptyClasses,
  listItemClasses,
  listPanelClasses,
} from '../shared/recipe';

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

export const comboboxIconButtonRecipe = () => controlIconButtonClasses;

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
  twMerge(listPanelClasses, className);

export const comboboxItemRecipe = () => listItemClasses;

export const comboboxEmptyRecipe = () => listEmptyClasses;
