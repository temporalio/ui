import { twJoin, twMerge } from 'tailwind-merge';

export type StepsOrientation = 'horizontal' | 'vertical';

export const stepsRecipe = ({
  orientation = 'horizontal',
  className,
}: { orientation?: StepsOrientation; className?: string } = {}) =>
  twMerge(
    'flex w-full gap-6 text-primary',
    orientation === 'vertical' ? 'flex-row' : 'flex-col',
    className,
  );

export const stepsListRecipe = ({
  orientation = 'horizontal',
}: { orientation?: StepsOrientation } = {}) =>
  twJoin(
    'flex',
    orientation === 'vertical'
      ? 'w-64 shrink-0 flex-col'
      : 'w-full items-start gap-3',
  );

export const stepsItemRecipe = ({
  orientation = 'horizontal',
  last = false,
}: { orientation?: StepsOrientation; last?: boolean } = {}) =>
  twJoin(
    'relative flex',
    orientation === 'vertical'
      ? 'flex-col items-start gap-1 pb-2'
      : twJoin('min-w-0 items-start gap-3', !last && 'flex-1'),
  );

export const stepsTriggerRecipe = () =>
  twJoin(
    'group flex min-w-0 items-start gap-3 rounded text-left',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'disabled:cursor-not-allowed enabled:cursor-pointer',
  );

export const stepsIndicatorRecipe = () =>
  twJoin(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium tabular-nums',
    'border-secondary bg-background-primary text-secondary',
    'data-[current]:border-interactive-primary data-[current]:text-brand',
    'data-[current]:ring-2 data-[current]:ring-interactive-primary data-[current]:ring-offset-2 data-[current]:ring-offset-background-primary',
    'data-[complete]:border-interactive-primary data-[complete]:bg-interactive-primary data-[complete]:text-white',
  );

export const stepsTitleRecipe = () =>
  twJoin(
    'block text-sm font-medium text-secondary',
    'group-data-[current]:text-primary group-data-[complete]:text-primary',
  );

export const stepsDescriptionRecipe = () => 'block text-xs text-secondary';

export const stepsSeparatorRecipe = ({
  orientation = 'horizontal',
}: { orientation?: StepsOrientation } = {}) =>
  twJoin(
    'border-primary data-[complete]:border-interactive-primary',
    orientation === 'vertical'
      ? 'ml-4 h-6 w-0 border-l'
      : 'mt-4 h-0 min-w-6 flex-1 border-t',
  );

export const stepsContentRecipe = (className?: string) =>
  twMerge(
    'min-w-0 flex-1 text-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    className,
  );

export const stepsControlsRecipe = () =>
  'flex items-center justify-end gap-2 border-t border-primary pt-4';
