import { twJoin } from 'tailwind-merge';

import { fieldControlRecipe } from '$lib/io-poc/field';

export const numberInputControlRecipe = () =>
  fieldControlRecipe('relative h-10 overflow-hidden pr-0');

export const numberInputInputRecipe = () =>
  twJoin(
    'h-full min-w-0 grow bg-transparent px-3 text-sm text-primary tabular-nums',
    'placeholder:text-tertiary focus:outline-none',
    'disabled:cursor-not-allowed',
  );

export const numberInputUnitRecipe = () =>
  'shrink-0 select-none pr-2 text-sm text-secondary';

export const numberInputTriggerGroupRecipe = () =>
  'flex h-full w-7 shrink-0 flex-col border-l border-primary';

export const numberInputTriggerRecipe = () =>
  twJoin(
    'flex flex-1 items-center justify-center text-secondary',
    'hover:bg-interactive-tertiary-hover hover:text-primary',
    'active:bg-interactive-tertiary-press',
    'first:border-b first:border-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary',
    'disabled:cursor-not-allowed disabled:opacity-disabled disabled:hover:bg-transparent',
  );
