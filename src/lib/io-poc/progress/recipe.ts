import { twJoin, twMerge } from 'tailwind-merge';

export type ProgressColorScheme = 'brand' | 'success' | 'warning' | 'danger';
export type ProgressLinearSize = 'sm' | 'md';
export type ProgressCircularSize = 'sm' | 'md' | 'lg';

export interface ProgressValueDetails {
  value: number | null;
  percent: number;
  min: number;
  max: number;
}

export const progressRangeColorClasses: Record<ProgressColorScheme, string> = {
  brand: 'bg-content-brand',
  success: 'bg-content-success',
  warning: 'bg-content-warning',
  danger: 'bg-content-danger',
};

export const progressStrokeColorClasses: Record<ProgressColorScheme, string> = {
  brand: 'text-brand',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export const progressCircularSizes: Record<
  ProgressCircularSize,
  { size: number; thickness: number }
> = {
  sm: { size: 32, thickness: 3 },
  md: { size: 48, thickness: 4 },
  lg: { size: 72, thickness: 6 },
};

export const progressLinearRecipe = (className?: string) =>
  twMerge('flex w-full flex-col gap-2', className);

export const progressHeaderRecipe = (hidden = false) =>
  twJoin('flex items-baseline justify-between gap-4', hidden && 'sr-only');

export const progressLabelRecipe = (hidden = false) =>
  twJoin('text-sm font-medium text-primary', hidden && 'sr-only');

export const progressValueTextRecipe = () =>
  'shrink-0 text-xs tabular-nums text-secondary';

export const progressTrackRecipe = (size: ProgressLinearSize = 'md') =>
  twJoin(
    'relative w-full overflow-hidden rounded-full bg-surface-tertiary',
    size === 'sm' ? 'h-1' : 'h-2',
  );

export const progressRangeRecipe = (
  colorScheme: ProgressColorScheme = 'brand',
) =>
  twJoin(
    'h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none',
    progressRangeColorClasses[colorScheme],
    'data-[state=indeterminate]:w-2/5',
    'data-[state=indeterminate]:animate-[io-poc-progress-indeterminate_1.4s_ease-in-out_infinite]',
    'motion-reduce:data-[state=indeterminate]:w-full motion-reduce:data-[state=indeterminate]:animate-none motion-reduce:data-[state=indeterminate]:opacity-50',
  );

export const progressCircularRecipe = (className?: string) =>
  twMerge('inline-flex flex-col items-center gap-2', className);

export const progressCircleRecipe = () =>
  twJoin(
    'block',
    'data-[state=indeterminate]:animate-spin motion-reduce:data-[state=indeterminate]:animate-none',
  );

export const progressCircleTrackRecipe = () =>
  'stroke-current text-[color:var(--color-surface-tertiary)]';

export const progressCircleRangeRecipe = (
  colorScheme: ProgressColorScheme = 'brand',
) =>
  twJoin(
    'stroke-current [stroke-linecap:round]',
    'transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none',
    progressStrokeColorClasses[colorScheme],
    'data-[state=indeterminate]:[stroke-dasharray:calc(var(--circumference)*0.25)_var(--circumference)]',
  );

export const progressCircleValueTextRecipe = (size: number) =>
  twJoin(
    'absolute inset-0 flex items-center justify-center font-medium tabular-nums text-primary',
    size < 48 ? 'text-[0.625rem]' : size < 64 ? 'text-xs' : 'text-sm',
  );

export const getProgressPercent = (
  value: number | null,
  min: number,
  max: number,
) => {
  if (value == null || max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

export const defaultProgressFormat = ({ percent }: ProgressValueDetails) =>
  `${Math.round(percent)}%`;
