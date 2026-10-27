import { twJoin, twMerge } from 'tailwind-merge';

export type ButtonColorScheme =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md';

const disabledClasses = twJoin(
  'disabled:cursor-not-allowed',
  'disabled:[&:not([aria-busy=true])]:opacity-disabled',
);

const iconOnlyClasses = twJoin(
  '[&:has(>svg:only-child)]:aspect-square',
  '[&:has(>svg:only-child)]:p-0',
);

const wrapperClasses = twJoin(
  'relative',
  'inline-flex',
  'shrink-0',
  'font-sans',
  'font-medium',
  'items-center',
  'justify-center',
  'whitespace-nowrap',
  'rounded',
  'border',
  'border-transparent',
  'cursor-pointer',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-interactive-primary-press',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background-primary',
);

const colorSchemeClasses: Record<ButtonColorScheme, string> = {
  primary: twJoin(
    'text-white bg-interactive-primary',
    '[&:not(:disabled)]:hover:bg-interactive-primary-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-primary-hover',
    '[&:not(:disabled)]:active:bg-interactive-primary-press',
    '[&:not(:disabled)[data-state=active]]:bg-interactive-primary-press',
    '[&:not(:disabled)]:focus-visible:bg-interactive-primary-hover',
  ),
  secondary: twJoin(
    'border-brand bg-interactive-secondary text-brand',
    '[&:not(:disabled)]:hover:bg-interactive-secondary-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-secondary-hover',
    '[&:not(:disabled)]:active:bg-interactive-secondary-press',
    '[&:not(:disabled)[data-state=active]]:bg-interactive-secondary-press',
    '[&:not(:disabled)]:focus-visible:bg-interactive-secondary-hover',
  ),
  tertiary: twJoin(
    'border-secondary bg-interactive-tertiary text-primary',
    '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-tertiary-hover',
    '[&:not(:disabled)]:active:bg-interactive-tertiary-press',
    '[&:not(:disabled)[data-state=active]]:bg-interactive-tertiary-press',
    '[&:not(:disabled)]:focus-visible:bg-interactive-tertiary-hover',
  ),
  ghost: twJoin(
    'bg-interactive-tertiary text-primary',
    '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-tertiary-hover',
    '[&:not(:disabled)]:active:bg-interactive-tertiary-press',
    '[&:not(:disabled)[data-state=active]]:bg-interactive-tertiary-press',
    '[&:not(:disabled)]:focus-visible:bg-interactive-tertiary-hover',
  ),
  danger: twJoin(
    'bg-interactive-danger text-white',
    '[&:not(:disabled)]:hover:bg-interactive-danger-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-danger-hover',
    '[&:not(:disabled)]:active:bg-interactive-danger-press',
    '[&:not(:disabled)[data-state=active]]:bg-interactive-danger-press',
    '[&:not(:disabled)]:focus-visible:bg-interactive-danger-hover',
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: twJoin('min-h-5 py-0.5 px-2 gap-1 text-xs leading-none'),
  sm: twJoin('min-h-6 py-1 px-2 gap-1 text-xs leading-none'),
  md: twJoin('min-h-8 py-1 px-3 gap-2 text-base leading-none'),
};

export const buttonRecipe = ({
  colorScheme,
  size,
  className,
}: {
  colorScheme: ButtonColorScheme;
  size: ButtonSize;
  className?: string;
}) => {
  return twMerge(
    wrapperClasses,
    colorSchemeClasses[colorScheme],
    sizeClasses[size],
    iconOnlyClasses,
    className,
    disabledClasses,
  );
};
