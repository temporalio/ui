import { twJoin, twMerge } from 'tailwind-merge';

export type DrawerPlacement = 'right' | 'left' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg';

export const drawerSwipeDirection = {
  right: 'end',
  left: 'start',
  bottom: 'down',
} as const satisfies Record<DrawerPlacement, string>;

export const drawerBackdropRecipe = () =>
  twJoin(
    'fixed inset-0 z-50 bg-surface-overlay-neutral backdrop-blur-[8px]',
    'opacity-[calc(1-var(--drawer-swipe-progress,0))]',
    'data-[state=open]:animate-[io-ark-drawer-fade-in_200ms_ease-out]',
    'data-[state=closed]:animate-[io-ark-drawer-fade-out_150ms_ease-in]',
    'motion-reduce:animate-none',
  );

const positionerClasses: Record<DrawerPlacement, string> = {
  right: 'justify-end',
  left: 'justify-start',
  bottom: 'items-end justify-center',
};

export const drawerPositionerRecipe = (placement: DrawerPlacement) =>
  twJoin('fixed inset-0 z-50 flex', positionerClasses[placement]);

const placementClasses: Record<DrawerPlacement, string> = {
  right: twJoin(
    'h-full border-l',
    'data-[state=open]:animate-[io-ark-drawer-in-right_250ms_ease-out]',
    'data-[state=closed]:animate-[io-ark-drawer-out-right_200ms_ease-in]',
  ),
  left: twJoin(
    'h-full border-r',
    'data-[state=open]:animate-[io-ark-drawer-in-left_250ms_ease-out]',
    'data-[state=closed]:animate-[io-ark-drawer-out-left_200ms_ease-in]',
  ),
  bottom: twJoin(
    'max-h-[85vh] rounded-t-lg border-t',
    'data-[state=open]:animate-[io-ark-drawer-in-bottom_250ms_ease-out]',
    'data-[state=closed]:animate-[io-ark-drawer-out-bottom_200ms_ease-in]',
  ),
};

const sideSizeClasses: Record<DrawerSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

const bottomSizeClasses: Record<DrawerSize, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-none',
};

export const drawerContentRecipe = ({
  placement = 'right',
  size = 'md',
  className,
}: {
  placement?: DrawerPlacement;
  size?: DrawerSize;
  className?: string;
} = {}) =>
  twMerge(
    'flex w-full flex-col overflow-hidden border-primary bg-background-primary text-primary shadow-xl outline-none',
    'transition-transform duration-200 ease-out data-[swiping]:transition-none',
    'motion-reduce:animate-none motion-reduce:transition-none',
    placementClasses[placement],
    placement === 'bottom' ? bottomSizeClasses[size] : sideSizeClasses[size],
    className,
  );

export const drawerGrabberRecipe = () =>
  'flex shrink-0 cursor-grab justify-center pt-3 active:cursor-grabbing';

export const drawerGrabberIndicatorRecipe = () =>
  'h-1 w-10 rounded-full bg-surface-tertiary';

export const drawerHeaderRecipe = () =>
  'flex shrink-0 items-start justify-between gap-4 border-b border-primary px-6 py-4';

export const drawerTitleRecipe = () => 'text-lg font-medium leading-7';

export const drawerDescriptionRecipe = () => 'mt-1 text-sm text-secondary';

export const drawerBodyRecipe = () =>
  'min-h-0 flex-1 overflow-y-auto px-6 py-4 text-sm';

export const drawerFooterRecipe = () =>
  'flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-primary px-6 py-4';
