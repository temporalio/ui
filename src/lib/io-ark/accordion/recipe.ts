import { twJoin, twMerge } from 'tailwind-merge';

export const accordionRecipe = ({
  expandable = true,
  className,
}: { expandable?: boolean; className?: string } = {}) =>
  twMerge(
    'w-full rounded border border-primary bg-surface-primary text-primary',
    !expandable && 'p-4',
    className,
  );

export const accordionTriggerRecipe = ({
  open,
  hasAction,
}: {
  open: boolean;
  hasAction: boolean;
}) =>
  twJoin(
    'flex w-full grow flex-col rounded-tl-[inherit] p-4 text-left',
    'hover:bg-interactive-secondary-hover focus-visible:bg-surface-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'disabled:cursor-not-allowed disabled:opacity-disabled disabled:hover:bg-transparent',
    !hasAction && 'rounded-tr-[inherit]',
    !open && 'rounded-bl-[inherit]',
    !open && !hasAction && 'rounded-br-[inherit]',
  );

export const accordionGroupRecipe = (className?: string) =>
  twMerge(
    '*:rounded-none *:border-t-0 [&>*:first-child]:rounded-t [&>*:first-child]:border-t [&>*:last-child]:rounded-b',
    className,
  );
