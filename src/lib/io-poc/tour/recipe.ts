import { twJoin, twMerge } from 'tailwind-merge';

import { floatingSurfaceClasses } from '../shared/recipe';

export const tourBackdropRecipe = () =>
  twJoin(
    'z-50 bg-surface-overlay-neutral [&[hidden]]:hidden',
    'data-[state=open]:animate-[io-poc-fade-in_150ms_ease-out]',
    'motion-reduce:animate-none',
  );

export const tourSpotlightRecipe = () =>
  twJoin(
    'z-50 ring-2 ring-interactive-primary ring-offset-2 ring-offset-background-primary',
    'transition-all duration-200 ease-out motion-reduce:transition-none',
  );

export const tourPositionerRecipe = () =>
  twJoin(
    'z-50 [--tour-z-index:50]',
    'data-[type=dialog]:fixed data-[type=dialog]:inset-0 data-[type=dialog]:flex',
    'data-[type=dialog]:items-center data-[type=dialog]:justify-center data-[type=dialog]:p-4',
    'data-[type=dialog]:pointer-events-none',
  );

export const tourContentRecipe = (className?: string) =>
  twMerge(
    floatingSurfaceClasses,
    'pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3',
    'p-4 text-sm text-primary focus:outline-none',
    'data-[type=dialog]:w-[28rem] data-[type=dialog]:rounded-lg data-[type=dialog]:p-6',
    'data-[state=open]:animate-[io-poc-fade-in_150ms_ease-out] motion-reduce:animate-none',
    '[&[hidden]]:hidden',
    className,
  );

export const tourHeaderRecipe = () => 'flex items-start justify-between gap-3';

export const tourTitleRecipe = () => 'text-base font-medium leading-6';

export const tourDescriptionRecipe = () => 'text-sm text-secondary';

export const tourFooterRecipe = () =>
  'flex flex-wrap items-center justify-between gap-3 pt-1';

export const tourProgressTextRecipe = () => 'text-xs text-secondary';

export const tourActionsRecipe = () =>
  'ml-auto flex flex-wrap items-center gap-2';
