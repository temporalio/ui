import { twJoin } from 'tailwind-merge';

export const floatingSurfaceClasses =
  'rounded border border-primary bg-background-primary shadow-lg';

export const overlayBackdropClasses =
  'fixed inset-0 z-50 bg-surface-overlay-neutral backdrop-blur-[8px]';

export const listPanelClasses = twJoin(
  'z-50 max-h-72 overflow-y-auto p-1 text-sm text-primary focus:outline-none',
  floatingSurfaceClasses,
);

export const listItemClasses = twJoin(
  'flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-2',
  'data-[highlighted]:bg-interactive-secondary-hover',
  'data-[state=checked]:font-medium',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled',
);

export const listGroupLabelClasses =
  'px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-secondary';

export const listEmptyClasses = 'px-2 py-2 text-secondary';

export const controlIconButtonClasses = twJoin(
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-secondary',
  'hover:bg-interactive-tertiary-hover hover:text-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
  'disabled:cursor-not-allowed disabled:hover:bg-transparent',
);
