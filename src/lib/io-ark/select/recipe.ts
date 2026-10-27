import { twJoin, twMerge } from 'tailwind-merge';

import { fieldControlRecipe, fieldRecipe } from '$lib/io-ark/field';

export const selectRecipe = (className?: string) => fieldRecipe(className);

export const selectControlRecipe = (className?: string) =>
  fieldControlRecipe(twMerge('relative gap-1 pl-0 pr-1', className));

export const selectTriggerRecipe = () =>
  twJoin(
    'group flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[inherit] bg-transparent py-1 pl-3 pr-1 text-left text-sm text-primary',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed data-[readonly]:cursor-default',
  );

export const selectValueTextRecipe = () =>
  twJoin(
    'min-w-0 flex-1 truncate',
    'group-data-[placeholder-shown]:text-tertiary',
  );

export const selectIndicatorRecipe = () =>
  twJoin(
    'flex shrink-0 items-center text-secondary transition-transform duration-150',
    'motion-reduce:transition-none data-[state=open]:rotate-180',
  );

export const selectIconButtonRecipe = () =>
  twJoin(
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-secondary',
    'hover:bg-interactive-tertiary-hover hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'disabled:cursor-not-allowed disabled:hover:bg-transparent',
    '[&[hidden]]:hidden',
  );

export const selectContentRecipe = (className?: string) =>
  twMerge(
    'z-50 max-h-72 overflow-y-auto rounded border border-primary bg-background-primary p-1',
    'text-sm text-primary shadow-lg focus:outline-none',
    className,
  );

export const selectItemGroupLabelRecipe = () =>
  'px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-secondary';

export const selectItemRecipe = () =>
  twJoin(
    'flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-2',
    'data-[highlighted]:bg-interactive-secondary-hover',
    'data-[state=checked]:font-medium',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled',
  );
