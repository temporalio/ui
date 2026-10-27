import { twJoin, twMerge } from 'tailwind-merge';

export type SegmentGroupSize = 'sm' | 'md';
export type SegmentGroupOrientation = 'horizontal' | 'vertical';

export const segmentGroupRecipe = (className?: string) =>
  twMerge('inline-flex flex-col gap-2', className);

export const segmentGroupTrackRecipe = (
  orientation: SegmentGroupOrientation = 'horizontal',
) =>
  twJoin(
    'relative isolate inline-flex w-fit rounded border border-primary bg-surface-secondary p-0.5',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
  );

export const segmentGroupIndicatorRecipe = () =>
  twJoin(
    'z-0 h-[var(--height)] w-[var(--width)] rounded-sm border border-primary bg-surface-primary shadow-sm',
    '[--transition-timing-function:ease-out]',
    'motion-reduce:[--transition-duration:0ms]',
    '[&[hidden]]:hidden',
  );

const itemSizeClasses: Record<SegmentGroupSize, string> = {
  sm: 'min-h-6 px-2 text-xs',
  md: 'min-h-8 px-3 text-sm',
};

export const segmentGroupItemRecipe = ({
  size = 'md',
  className,
}: {
  size?: SegmentGroupSize;
  className?: string;
} = {}) =>
  twMerge(
    twJoin(
      'relative z-10 inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap',
      'rounded-sm font-medium leading-none text-secondary',
      'hover:text-primary data-[state=checked]:text-primary',
      'data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-interactive-primary',
      'data-[focus-visible]:ring-offset-1 data-[focus-visible]:ring-offset-background-primary',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled data-[disabled]:hover:text-secondary',
    ),
    itemSizeClasses[size],
    className,
  );
