import { twJoin, twMerge } from 'tailwind-merge';

const textLinkBaseClasses = twJoin(
  'rounded-sm',
  'text-primary',
  'hover:text-secondary',
  'underline',
  'underline-offset-2',
  'items-center',
  'gap-1',
  'inline',
);

const focusVisibleClasses = twJoin(
  'focus-visible:bg-surface-primary focus-visible:text-primary focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-interactive-primary-press',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
);

const hasIconsClasses = twJoin('inline-flex');

const isDisabledClasses = twJoin(
  'cursor-not-allowed',
  'opacity-disabled',
  'hover:text-primary',
);

export const textLinkRecipe = ({
  isDisabled,
  hasIcons,
  className,
}: {
  isDisabled?: boolean;
  hasIcons?: boolean;
  className?: string;
}) =>
  twMerge(
    textLinkBaseClasses,
    focusVisibleClasses,
    hasIcons && hasIconsClasses,
    isDisabled && isDisabledClasses,
    className,
  );
