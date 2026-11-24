import { twJoin, twMerge } from 'tailwind-merge';

const tabBarClasses = twJoin(
  'flex flex-wrap items-start gap-4',
  'border-b border-primary',
);

export const tabBarRecipe = ({ className }: { className?: string } = {}) =>
  twMerge(tabBarClasses, className);

const tabPanelClasses = twJoin(
  'focus-visible:outline',
  'focus-visible:outline-2',
  'focus-visible:outline-offset-2',
  'focus-visible:outline-interactive-primary',
);

export const tabPanelRecipe = ({ className }: { className?: string } = {}) =>
  twMerge(tabPanelClasses, className);

const tabBaseClasses = twJoin(
  'relative inline-flex shrink-0 items-center justify-center gap-1',
  'px-1 pb-1 rounded-sm',
  'whitespace-nowrap font-sans text-xs font-medium leading-4',
  'text-secondary cursor-pointer',
);

const tabSelectedClasses = twJoin(
  'aria-selected:text-primary',
  'aria-selected:after:absolute',
  'aria-selected:after:inset-x-0',
  'aria-selected:after:-bottom-px',
  'aria-selected:after:h-0.5',
  'aria-selected:after:bg-interactive-primary',
);

const tabCurrentPageClasses = twJoin(
  'aria-[current=page]:text-primary',
  'aria-[current=page]:after:absolute',
  'aria-[current=page]:after:inset-x-0',
  'aria-[current=page]:after:-bottom-px',
  'aria-[current=page]:after:h-0.5',
  'aria-[current=page]:after:bg-interactive-primary',
);

const tabHoverClasses = twJoin(
  '[&:not([aria-disabled=true])]:hover:text-brand',
  '[&:not([aria-disabled=true])[data-state=hover]]:text-brand',
);

const tabFocusClasses = twJoin(
  'focus-visible:bg-background-primary',
  'focus-visible:shadow-sm',
  'focus-visible:outline',
  'focus-visible:outline-2',
  'focus-visible:outline-offset-2',
  'focus-visible:outline-interactive-primary',
  'aria-selected:focus-visible:text-brand',
  'aria-[current=page]:focus-visible:text-brand',
  '[&[data-state=focus]]:bg-background-primary',
  '[&[data-state=focus]]:shadow-sm',
  '[&[data-state=focus]]:outline',
  '[&[data-state=focus]]:outline-2',
  '[&[data-state=focus]]:outline-offset-2',
  '[&[data-state=focus]]:outline-interactive-primary',
  '[&[aria-selected=true][data-state=focus]]:text-brand',
  '[&[aria-current=page][data-state=focus]]:text-brand',
);

const tabDisabledClasses = twJoin(
  'aria-disabled:cursor-not-allowed',
  'aria-disabled:opacity-disabled',
);

export const tabRecipe = ({ className }: { className?: string } = {}) =>
  twMerge(
    tabBaseClasses,
    tabSelectedClasses,
    tabCurrentPageClasses,
    tabHoverClasses,
    tabFocusClasses,
    tabDisabledClasses,
    className,
  );
