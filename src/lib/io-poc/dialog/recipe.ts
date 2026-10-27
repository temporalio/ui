import { twJoin, twMerge } from 'tailwind-merge';

import { overlayBackdropClasses } from '../shared/recipe';

export type DialogSize = 'sm' | 'md' | 'lg';

export const dialogBackdropRecipe = () =>
  twJoin(
    overlayBackdropClasses,
    'data-[state=open]:animate-[io-poc-fade-in_150ms_ease-out]',
    'data-[state=closed]:animate-[io-poc-fade-out_100ms_ease-in]',
    'motion-reduce:animate-none',
  );

export const dialogPositionerRecipe = () =>
  'fixed inset-0 z-50 flex items-center justify-center p-4';

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
};

export const dialogContentRecipe = ({
  size = 'md',
  className,
}: { size?: DialogSize; className?: string } = {}) =>
  twMerge(
    'flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg border border-primary',
    'bg-background-primary text-primary shadow-xl outline-none',
    'data-[state=open]:animate-[io-poc-scale-in_150ms_ease-out]',
    'data-[state=closed]:animate-[io-poc-fade-out_100ms_ease-in]',
    'motion-reduce:animate-none',
    sizeClasses[size],
    className,
  );

export const dialogHeaderRecipe = () =>
  'flex items-start justify-between gap-4 px-6 pb-2 pt-6';

export const dialogTitleRecipe = () => 'text-xl font-medium leading-7';

export const dialogDescriptionRecipe = () => 'mt-1 text-sm text-secondary';

export const dialogBodyRecipe = () =>
  'min-h-0 flex-1 overflow-y-auto px-6 py-4 text-sm';

export const dialogFooterRecipe = () =>
  'flex flex-wrap items-center justify-end gap-2 border-t border-primary px-6 py-4';
