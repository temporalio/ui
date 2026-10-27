import { twJoin, twMerge } from 'tailwind-merge';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export const radioGroupRecipe = (className?: string) =>
  twMerge('flex flex-col gap-2', className);

export const radioGroupItemsRecipe = (orientation: RadioGroupOrientation) =>
  twJoin(
    'flex',
    orientation === 'vertical'
      ? 'flex-col gap-2'
      : 'flex-row flex-wrap gap-x-6 gap-y-2',
  );

export const radioGroupItemRecipe = (className?: string) =>
  twMerge(
    'group flex w-fit cursor-pointer select-none flex-col gap-1 text-sm leading-5',
    'data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default',
    className,
  );

export const radioGroupItemRowRecipe = () => 'inline-flex items-center gap-3';

export const radioGroupItemControlRecipe = () =>
  twJoin(
    'relative box-border flex h-5 w-5 flex-none items-center justify-center rounded-full',
    'border border-secondary bg-background-primary',
    'after:h-2.5 after:w-2.5 after:scale-0 after:rounded-full after:bg-interactive-primary after:transition-transform after:duration-100 motion-reduce:after:transition-none',
    'data-[hover]:border-tertiary',
    'data-[state=checked]:border-interactive-primary data-[state=checked]:after:scale-100',
    'data-[focus-visible]:ring-2 data-[focus-visible]:ring-interactive-primary',
    'data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-background-primary',
    'data-[invalid]:border-danger data-[invalid]:after:bg-danger data-[invalid]:data-[focus-visible]:ring-danger',
    'data-[disabled]:opacity-disabled data-[disabled]:data-[hover]:border-secondary',
  );

export const radioGroupItemTextRecipe = () =>
  'text-primary data-[disabled]:opacity-disabled';

export const radioGroupItemDescriptionRecipe = () =>
  'ml-8 text-sm text-secondary group-data-[disabled]:opacity-disabled';
