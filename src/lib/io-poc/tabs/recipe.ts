import { twJoin, twMerge } from 'tailwind-merge';

export type TabsVariant = 'line' | 'enclosed';
export type TabsOrientation = 'horizontal' | 'vertical';

export const tabsRecipe = ({
  orientation = 'horizontal',
  className,
}: { orientation?: TabsOrientation; className?: string } = {}) =>
  twMerge(
    'flex w-full text-primary',
    orientation === 'vertical' ? 'flex-row gap-6' : 'flex-col gap-4',
    className,
  );

export const tabsListRecipe = ({
  variant = 'line',
  orientation = 'horizontal',
  className,
}: {
  variant?: TabsVariant;
  orientation?: TabsOrientation;
  className?: string;
} = {}) =>
  twMerge(
    'relative flex shrink-0',
    orientation === 'vertical' ? 'flex-col items-stretch' : 'items-center',
    variant === 'line' &&
      (orientation === 'vertical'
        ? 'border-l border-primary'
        : 'gap-1 overflow-x-auto overflow-y-hidden border-b border-primary'),
    variant === 'enclosed' &&
      twJoin(
        'gap-1 rounded-lg bg-surface-secondary p-1',
        orientation === 'horizontal' &&
          'w-fit max-w-full overflow-x-auto overflow-y-hidden',
      ),
    className,
  );

const triggerBaseClasses = twJoin(
  'relative inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap',
  'text-sm font-medium text-secondary',
  'hover:text-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled data-[disabled]:hover:text-secondary',
);

export const tabsTriggerRecipe = ({
  variant = 'line',
  orientation = 'horizontal',
}: { variant?: TabsVariant; orientation?: TabsOrientation } = {}) =>
  twJoin(
    triggerBaseClasses,
    variant === 'line' &&
      twJoin(
        'rounded-sm data-[selected]:text-brand',
        orientation === 'vertical' ? 'px-4 py-2' : 'px-3 pb-3 pt-2',
      ),
    variant === 'enclosed' &&
      twJoin(
        'rounded px-3 py-1.5',
        'data-[selected]:bg-background-primary data-[selected]:text-primary data-[selected]:shadow-sm',
      ),
  );

export const tabsIndicatorRecipe = ({
  orientation = 'horizontal',
}: { orientation?: TabsOrientation } = {}) =>
  twJoin(
    'bg-interactive-primary [&[hidden]]:hidden',
    orientation === 'vertical'
      ? '-left-px h-[var(--height)] w-0.5'
      : 'bottom-0 h-0.5 w-[var(--width)]',
  );

export const tabsBadgeRecipe = () =>
  twJoin(
    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
    'bg-surface-secondary text-xs font-medium text-primary',
  );

export const tabsContentRecipe = (className?: string) =>
  twMerge(
    'min-w-0 flex-1 text-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    className,
  );
