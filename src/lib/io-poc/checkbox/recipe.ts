import { twJoin, twMerge } from 'tailwind-merge';

export type CheckboxGroupOrientation = 'vertical' | 'horizontal';

export const checkboxRecipe = (className?: string) =>
  twMerge('flex flex-col gap-1', className);

export const checkboxRootRecipe = () =>
  twJoin(
    'group inline-flex min-h-6 w-fit cursor-pointer select-none items-center gap-3 text-sm leading-5',
    'data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default',
  );

export const checkboxControlRecipe = () =>
  twJoin(
    'relative box-border flex h-5 w-5 flex-none items-center justify-center rounded-sm',
    'border border-secondary bg-background-primary text-inverse-primary',
    'data-[hover]:border-tertiary',
    'data-[state=checked]:border-interactive-primary data-[state=checked]:bg-interactive-primary',
    'data-[state=indeterminate]:border-interactive-primary data-[state=indeterminate]:bg-interactive-primary',
    'data-[focus-visible]:shadow-sm data-[focus-visible]:ring-2 data-[focus-visible]:ring-interactive-primary',
    'data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-background-primary',
    'data-[invalid]:border-danger data-[invalid]:data-[focus-visible]:ring-danger',
    'data-[disabled]:opacity-disabled data-[disabled]:data-[hover]:border-secondary',
  );

export const checkboxIndicatorRecipe = () => 'h-4 w-4';

export const checkboxLabelRecipe = ({ hidden = false }: { hidden?: boolean }) =>
  twJoin('text-primary data-[disabled]:opacity-disabled', hidden && 'sr-only');

export const checkboxDescriptionRecipe = (className?: string) =>
  twMerge('ml-8', className);

export const checkboxGroupRecipe = (className?: string) =>
  twMerge('flex flex-col gap-2', className);

export const checkboxGroupItemsRecipe = (
  orientation: CheckboxGroupOrientation,
) =>
  twJoin(
    'flex',
    orientation === 'vertical'
      ? 'flex-col gap-2'
      : 'flex-row flex-wrap gap-x-6 gap-y-2',
  );
