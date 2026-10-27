import { twJoin, twMerge } from 'tailwind-merge';

import { fieldRecipe } from '$lib/io-ark/field';

export const fileUploadRecipe = (className?: string) => fieldRecipe(className);

export const fileUploadDropzoneRecipe = (className?: string) =>
  twMerge(
    twJoin(
      'flex w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-secondary',
      'bg-background-primary px-6 py-8 text-center text-sm text-secondary',
      'cursor-pointer hover:border-brand hover:bg-surface-secondary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
      'data-[dragging]:border-solid data-[dragging]:border-interactive-primary data-[dragging]:bg-interactive-secondary-hover',
      'data-[invalid]:border-danger',
      'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-tertiary data-[disabled]:opacity-disabled data-[disabled]:hover:border-secondary',
      'data-[readonly]:cursor-default data-[readonly]:hover:border-secondary data-[readonly]:hover:bg-background-primary',
    ),
    className,
  );

export const fileUploadItemGroupRecipe = () =>
  'm-0 flex list-none flex-col gap-2 p-0 empty:hidden';

export const fileUploadItemRecipe = () =>
  twJoin(
    'flex items-center gap-3 rounded border border-primary bg-background-primary px-3 py-2 text-sm',
    'data-[disabled]:opacity-disabled',
  );

export const fileUploadItemIconRecipe = () =>
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-secondary text-secondary';

export const fileUploadItemNameRecipe = () =>
  'truncate font-medium text-primary';

export const fileUploadItemSizeRecipe = () => 'text-xs text-secondary';

export const fileUploadIconButtonRecipe = () =>
  twJoin(
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-secondary',
    'hover:bg-interactive-tertiary-hover hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary',
    'disabled:cursor-not-allowed disabled:hover:bg-transparent [&[hidden]]:hidden',
  );
