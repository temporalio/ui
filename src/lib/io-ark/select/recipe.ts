import { twJoin, twMerge } from 'tailwind-merge';

import { fieldControlRecipe, fieldRecipe } from '$lib/io-ark/field';

import {
  controlIconButtonClasses,
  listGroupLabelClasses,
  listItemClasses,
  listPanelClasses,
} from '../shared/recipe';

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
  twJoin(controlIconButtonClasses, '[&[hidden]]:hidden');

export const selectContentRecipe = (className?: string) =>
  twMerge(listPanelClasses, className);

export const selectItemGroupLabelRecipe = () => listGroupLabelClasses;

export const selectItemRecipe = () => listItemClasses;
