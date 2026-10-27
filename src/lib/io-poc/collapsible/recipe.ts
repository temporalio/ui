import { twJoin, twMerge } from 'tailwind-merge';

export const collapsibleRecipe = (className?: string) =>
  twMerge('w-full text-primary', className);

export const collapsibleTriggerRecipe = (className?: string) =>
  twMerge(
    twJoin(
      'inline-flex cursor-pointer items-center gap-2 rounded text-sm font-medium text-primary',
      'hover:text-brand',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
      'disabled:cursor-not-allowed disabled:opacity-disabled disabled:hover:text-primary',
    ),
    className,
  );

export const collapsibleIndicatorRecipe = () =>
  twJoin(
    'inline-flex shrink-0 transition-transform duration-150 motion-reduce:transition-none',
    'data-[state=open]:rotate-180',
  );

export const collapsibleContentRecipe = (className?: string) =>
  twMerge('io-poc-collapsible-content overflow-hidden', className);
