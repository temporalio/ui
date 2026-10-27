import { twJoin, twMerge } from 'tailwind-merge';

import { fieldControlRecipe, fieldRecipe } from '$lib/io-ark/field';

export const tagsInputRecipe = (className?: string) => fieldRecipe(className);

export const tagsInputControlRecipe = (className?: string) =>
  fieldControlRecipe(
    twMerge(
      'flex-wrap gap-1 py-1 pl-2 pr-1 focus-within:hover:border-primary',
      'data-[focus]:ring-2 data-[focus]:ring-interactive-primary data-[focus]:ring-offset-2 data-[focus]:ring-offset-background-primary',
      className,
    ),
  );

export const tagsInputInputRecipe = () =>
  twJoin(
    'h-7 min-w-24 flex-1 border-0 bg-transparent px-1 py-0 text-sm text-primary',
    'placeholder:text-tertiary focus:outline-none focus:ring-0',
    'disabled:cursor-not-allowed [&[hidden]]:hidden',
  );

export const tagsInputItemPreviewRecipe = () =>
  twJoin(
    'inline-flex h-6 max-w-full items-center gap-1 rounded-sm border border-secondary',
    'bg-surface-secondary pl-2 pr-0.5 text-xs text-primary',
    'data-[highlighted]:border-interactive-primary data-[highlighted]:ring-1 data-[highlighted]:ring-interactive-primary',
    'data-[disabled]:opacity-disabled [&[hidden]]:hidden',
  );

export const tagsInputItemInputRecipe = () =>
  twJoin(
    'h-6 min-w-16 rounded-sm border border-interactive-primary bg-background-primary px-2 text-xs text-primary',
    'focus:outline-none [&[hidden]]:hidden',
  );

export const tagsInputIconButtonRecipe = (size: 'sm' | 'md' = 'md') =>
  twJoin(
    'flex shrink-0 items-center justify-center rounded-sm text-secondary',
    'hover:bg-interactive-tertiary-hover hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'disabled:cursor-not-allowed disabled:hover:bg-transparent [&[hidden]]:hidden',
    size === 'sm' ? 'h-5 w-5' : 'h-7 w-7',
  );
