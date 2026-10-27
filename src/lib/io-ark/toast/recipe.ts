import { twJoin, twMerge } from 'tailwind-merge';

export type ToastStatusType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'loading';

const accentClasses: Record<ToastStatusType, string> = {
  info: 'border-l-information',
  success: 'border-l-success',
  warning: 'border-l-warning',
  error: 'border-l-danger',
  loading: 'border-l-brand',
};

const iconClasses: Record<ToastStatusType, string> = {
  info: 'text-static-information',
  success: 'text-static-success',
  warning: 'text-static-warning',
  error: 'text-static-danger',
  loading: 'text-brand animate-spin motion-reduce:animate-none',
};

export const toastRecipe = ({
  type = 'info',
  className,
}: { type?: ToastStatusType; className?: string } = {}) =>
  twMerge(
    'io-ark-toast flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded border border-l-4 border-primary',
    'bg-background-primary p-3 pr-2 text-sm text-primary shadow-lg',
    accentClasses[type],
    className,
  );

export const toastIconRecipe = (type: ToastStatusType = 'info') =>
  twJoin('mt-0.5 shrink-0', iconClasses[type]);

export const toastBodyRecipe = () => 'flex min-w-0 flex-1 flex-col gap-0.5';

export const toastTitleRecipe = () => 'font-medium leading-5';

export const toastDescriptionRecipe = () => 'text-secondary leading-5';

export const toastActionRecipe = () => 'mt-2 self-start';

export const toastCloseRecipe = () => '-my-1 shrink-0';
