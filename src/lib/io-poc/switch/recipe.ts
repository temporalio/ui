import { twJoin, twMerge } from 'tailwind-merge';

export type SwitchSize = 'sm' | 'md';

export const switchRecipe = (className?: string) =>
  twMerge('flex flex-col gap-1', className);

export const switchRootRecipe = () =>
  twJoin(
    'group inline-flex min-h-6 w-fit cursor-pointer select-none items-center gap-3 text-sm leading-5',
    'data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default',
  );

const controlSizeClasses: Record<SwitchSize, string> = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
};

const thumbSizeClasses: Record<SwitchSize, string> = {
  sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
  md: 'h-4 w-4 data-[state=checked]:translate-x-4',
};

export const switchControlRecipe = (size: SwitchSize) =>
  twJoin(
    'relative box-border inline-flex flex-none items-center rounded-full border border-secondary bg-surface-tertiary p-px',
    'transition-colors duration-150 motion-reduce:transition-none',
    'data-[hover]:border-tertiary',
    'data-[state=checked]:border-interactive-primary data-[state=checked]:bg-interactive-primary',
    'data-[focus-visible]:ring-2 data-[focus-visible]:ring-interactive-primary',
    'data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-background-primary',
    'data-[invalid]:border-danger data-[invalid]:data-[focus-visible]:ring-danger',
    'data-[disabled]:opacity-disabled data-[disabled]:data-[hover]:border-secondary',
    controlSizeClasses[size],
  );

export const switchThumbRecipe = (size: SwitchSize) =>
  twJoin(
    'block rounded-full bg-white shadow-sm transition-transform duration-150 motion-reduce:transition-none',
    thumbSizeClasses[size],
  );

export const switchLabelRecipe = ({ hidden = false }: { hidden?: boolean }) =>
  twJoin('text-primary data-[disabled]:opacity-disabled', hidden && 'sr-only');

export const switchDescriptionRecipe = (size: SwitchSize, className?: string) =>
  twMerge(size === 'sm' ? 'ml-10' : 'ml-12', className);
