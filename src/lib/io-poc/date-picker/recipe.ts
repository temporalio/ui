import { twJoin, twMerge } from 'tailwind-merge';

import { fieldControlRecipe, fieldRecipe } from '../field/recipe';

const focusRingClasses = twJoin(
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
);

const iconButtonClasses = twJoin(
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-secondary',
  'hover:bg-interactive-tertiary-hover hover:text-primary',
  'disabled:cursor-not-allowed disabled:opacity-disabled disabled:hover:bg-transparent',
  focusRingClasses,
);

export const datePickerRecipe = (className?: string) => fieldRecipe(className);

export const datePickerControlRecipe = (className?: string) =>
  fieldControlRecipe(twMerge('gap-1 py-0 pl-3 pr-1', className));

export const datePickerInputRecipe = () =>
  twJoin(
    'h-9 min-w-0 flex-1 bg-transparent text-sm text-primary outline-none',
    'placeholder:text-tertiary disabled:cursor-not-allowed',
  );

export const datePickerIconButtonRecipe = () => iconButtonClasses;

export const datePickerContentRecipe = (className?: string) =>
  twMerge(
    'z-50 flex w-72 flex-col gap-3 rounded-lg border border-primary bg-surface-primary p-3 text-primary shadow-lg outline-none',
    'data-[state=closed]:hidden',
    className,
  );

export const datePickerViewControlRecipe = () =>
  'flex items-center justify-between gap-2';

export const datePickerViewTriggerRecipe = () =>
  twJoin(
    'rounded px-2 py-1 text-sm font-medium text-primary hover:bg-interactive-tertiary-hover',
    focusRingClasses,
  );

export const datePickerTableRecipe = () =>
  'w-full border-separate border-spacing-0.5';

export const datePickerTableHeaderRecipe = () =>
  'h-8 text-center text-xs font-medium text-secondary';

export const datePickerCellTriggerRecipe = ({
  view = 'day',
}: { view?: 'day' | 'month' | 'year' } = {}) =>
  twJoin(
    'relative inline-flex w-full items-center justify-center rounded text-sm text-primary',
    view === 'day' ? 'h-9' : 'h-12',
    'hover:bg-interactive-tertiary-hover',
    focusRingClasses,
    'data-[today]:font-semibold data-[today]:text-brand',
    "data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:h-1 data-[today]:after:w-1 data-[today]:after:rounded-full data-[today]:after:bg-current data-[today]:after:content-['']",
    'data-[in-range]:rounded-none data-[in-range]:bg-interactive-secondary-hover',
    'data-[in-hover-range]:bg-interactive-secondary-hover',
    'data-[selected]:bg-interactive-primary data-[selected]:text-white data-[selected]:hover:bg-interactive-primary-hover',
    'data-[range-start]:rounded data-[range-end]:rounded',
    'data-[outside-range]:text-tertiary',
    'data-[unavailable]:text-tertiary data-[unavailable]:line-through',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled data-[disabled]:hover:bg-transparent',
  );

export const datePickerFooterRecipe = () =>
  'flex items-center justify-end border-t border-primary pt-3';

export const datePickerPresetRecipe = () =>
  twJoin(
    'rounded px-2 py-1 text-sm font-medium text-brand hover:bg-interactive-secondary-hover',
    focusRingClasses,
  );
