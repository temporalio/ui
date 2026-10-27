import { twJoin, twMerge } from 'tailwind-merge';

export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export const tooltipTriggerRecipe = (className?: string) =>
  twMerge(
    'inline-flex cursor-default appearance-none rounded-sm border-0 bg-transparent p-0 text-left text-[inherit] font-[inherit]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    className,
  );

export const tooltipContentRecipe = (className?: string) =>
  twMerge(
    'z-50 max-w-xs rounded bg-content-primary px-2 py-1.5 text-xs leading-4 text-inverse-primary shadow-md',
    '[--arrow-background:var(--color-content-primary)] [--arrow-size:8px]',
    'data-[state=open]:animate-[io-ark-zoom-in_100ms_ease-out]',
    'data-[state=closed]:animate-[io-ark-fade-out_75ms_ease-in]',
    'motion-reduce:animate-none',
    className,
  );

export const tooltipArrowRecipe = () => twJoin('[&>*]:rounded-[1px]');
