import { twMerge } from 'tailwind-merge';

export const fieldsetRecipe = (className?: string) =>
  twMerge(
    'm-0 flex w-full min-w-0 flex-col gap-4 border-0 p-0',
    'disabled:cursor-not-allowed',
    className,
  );

export const fieldsetLegendRecipe = ({
  hidden = false,
  className,
}: { hidden?: boolean; className?: string } = {}) =>
  twMerge(
    'mb-1 p-0 text-base font-medium text-primary',
    'data-[disabled]:opacity-disabled',
    hidden && 'sr-only',
    className,
  );
