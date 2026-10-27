import { twJoin, twMerge } from 'tailwind-merge';

export type SliderOrientation = 'horizontal' | 'vertical';

export const sliderRecipe = (className?: string) =>
  twMerge(
    'flex w-full flex-col gap-2 data-[orientation=vertical]:w-fit',
    className,
  );

export const sliderHeaderRecipe = () =>
  'flex items-center justify-between gap-4';

export const sliderValueTextRecipe = () =>
  'text-sm tabular-nums text-secondary data-[disabled]:opacity-disabled';

export const sliderControlRecipe = () =>
  twJoin(
    'relative flex items-center',
    'data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full',
    'data-[orientation=vertical]:h-48 data-[orientation=vertical]:w-5 data-[orientation=vertical]:flex-col',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled',
  );

export const sliderTrackRecipe = () =>
  twJoin(
    'relative grow overflow-hidden rounded-full bg-surface-tertiary',
    'data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5',
  );

export const sliderRangeRecipe = () =>
  twJoin(
    'bg-interactive-primary',
    'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
    'data-[invalid]:bg-danger',
  );

export const sliderThumbRecipe = () =>
  twJoin(
    'h-5 w-5 cursor-grab rounded-full border-2 border-interactive-primary bg-white shadow-sm',
    'data-[dragging]:cursor-grabbing',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger',
    'data-[disabled]:cursor-not-allowed',
  );

export const sliderMarkerGroupRecipe = () =>
  twJoin(
    'relative',
    'data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full',
  );

export const sliderMarkerRecipe = () =>
  twJoin(
    'whitespace-nowrap text-xs text-secondary',
    'data-[state=under-value]:text-primary',
  );
