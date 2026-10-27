import { twJoin, twMerge } from 'tailwind-merge';

import { floatingSurfaceClasses } from '../shared/recipe';

export type NavigationMenuOrientation = 'horizontal' | 'vertical';

export const navigationMenuRecipe = (className?: string) =>
  twMerge('relative text-sm text-primary', className);

export const navigationMenuListRecipe = ({
  orientation = 'horizontal',
}: { orientation?: NavigationMenuOrientation } = {}) =>
  twJoin(
    'm-0 flex list-none p-0',
    orientation === 'vertical'
      ? 'flex-col items-stretch gap-1'
      : 'flex-wrap items-center gap-1',
  );

export const navigationMenuItemRecipe = ({
  orientation = 'horizontal',
}: { orientation?: NavigationMenuOrientation } = {}) =>
  twJoin('relative', orientation === 'vertical' && 'flex flex-col');

const itemBaseClasses = twJoin(
  'inline-flex cursor-pointer items-center gap-1 rounded px-3 py-2 font-medium text-primary',
  'hover:bg-interactive-tertiary-hover',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled',
);

export const navigationMenuLinkRecipe = () =>
  twJoin(
    itemBaseClasses,
    'no-underline data-[current]:bg-interactive-secondary-hover data-[current]:text-brand',
  );

export const navigationMenuTriggerRecipe = ({
  current = false,
}: { current?: boolean } = {}) =>
  twJoin(
    'group',
    itemBaseClasses,
    'data-[state=open]:bg-interactive-tertiary-hover',
    current && 'text-brand',
  );

export const navigationMenuIndicatorRecipe = () =>
  twJoin(
    'inline-flex shrink-0 transition-transform duration-150 motion-reduce:transition-none',
    'group-data-[state=open]:rotate-180',
  );

export const navigationMenuContentRecipe = ({
  orientation = 'horizontal',
}: { orientation?: NavigationMenuOrientation } = {}) =>
  twJoin(
    '[&[hidden]]:hidden',
    orientation === 'vertical'
      ? 'pl-3 pt-1'
      : twJoin(
          'absolute left-0 top-full z-50 mt-2 w-max min-w-64 max-w-[min(24rem,calc(100vw-2rem))]',
          floatingSurfaceClasses,
          'p-1 data-[state=open]:animate-[io-poc-drop-in_120ms_ease-out] motion-reduce:animate-none',
        ),
  );

export const navigationMenuSubLinkRecipe = () =>
  twJoin(
    'flex flex-col gap-0.5 rounded-sm px-3 py-2 text-primary no-underline',
    'hover:bg-interactive-secondary-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'data-[current]:bg-interactive-secondary-hover data-[current]:text-brand',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-disabled aria-disabled:hover:bg-transparent',
  );

export const navigationMenuSubLinkDescriptionRecipe = () =>
  'text-xs font-normal text-secondary';
