import { twJoin, twMerge } from 'tailwind-merge';

import { fieldControlRecipe, fieldRecipe } from '../field/recipe';

export const dateInputRecipe = (className?: string) => fieldRecipe(className);

export const dateInputControlRecipe = (className?: string) =>
  fieldControlRecipe(twMerge('w-fit min-w-44 gap-2 px-3 py-2', className));

export const dateInputSegmentGroupRecipe = () =>
  'flex items-center tabular-nums outline-none';

export const dateInputSegmentRecipe = () =>
  twJoin(
    'rounded-sm px-0.5 caret-transparent outline-none',
    'focus:bg-interactive-secondary-hover focus:text-primary',
    'data-[placeholder-shown]:text-tertiary',
    'data-[type=literal]:px-0 data-[type=literal]:text-secondary',
    'data-[disabled]:cursor-not-allowed',
  );
