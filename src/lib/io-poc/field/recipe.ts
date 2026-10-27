import { twJoin, twMerge } from 'tailwind-merge';

export const fieldRecipe = (className?: string) =>
  twMerge('flex w-full flex-col gap-2', className);

export const fieldLabelRecipe = ({
  hidden = false,
  className,
}: { hidden?: boolean; className?: string } = {}) =>
  twMerge(
    'inline-flex items-center gap-1 text-sm font-medium text-primary',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled',
    hidden && 'sr-only',
    className,
  );

export const fieldRequiredIndicatorRecipe = () =>
  'font-mono leading-none text-static-danger';

export const fieldHelperTextRecipe = (className?: string) =>
  twMerge('text-xs text-secondary', className);

export const fieldErrorTextRecipe = (className?: string) =>
  twMerge('text-xs text-danger', className);

const controlBaseClasses = twJoin(
  'box-border flex min-h-10 w-full items-center rounded border border-primary bg-background-primary',
  'text-sm text-primary placeholder:text-tertiary',
  'hover:border-brand',
  'focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive-primary',
  'focus-within:ring-offset-2 focus-within:ring-offset-background-primary',
);

const controlInvalidClasses = twJoin(
  'data-[invalid]:border-danger data-[invalid]:hover:border-danger',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:hover:border-danger',
  'data-[invalid]:focus-within:ring-danger aria-[invalid=true]:focus-within:ring-danger',
);

const controlDisabledClasses = twJoin(
  'disabled:cursor-not-allowed disabled:border-secondary disabled:bg-surface-tertiary disabled:text-tertiary disabled:hover:border-secondary',
  'data-[disabled]:cursor-not-allowed data-[disabled]:border-secondary data-[disabled]:bg-surface-tertiary data-[disabled]:text-tertiary data-[disabled]:hover:border-secondary',
  'read-only:hover:border-primary data-[readonly]:hover:border-primary',
);

export const fieldControlRecipe = (className?: string) =>
  twMerge(
    controlBaseClasses,
    controlInvalidClasses,
    controlDisabledClasses,
    className,
  );

export const fieldInputRecipe = (className?: string) =>
  fieldControlRecipe(twMerge('px-3 py-2', className));

export const fieldTextareaRecipe = (className?: string) =>
  fieldControlRecipe(twMerge('min-h-20 px-3 py-2 leading-5', className));
