import { twJoin, twMerge } from 'tailwind-merge';

export const treeViewRecipe = (className?: string) =>
  twMerge('flex w-full flex-col gap-2 text-sm text-primary', className);

export const treeViewTreeRecipe = () =>
  twJoin(
    'flex flex-col gap-px rounded focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-interactive-primary',
  );

const nodeClasses = twJoin(
  'relative flex min-h-8 w-full cursor-pointer select-none items-center gap-2 rounded-sm py-1 pr-2',
  'pl-[calc((var(--depth)_-_1)_*_1.25rem_+_0.5rem)]',
  'hover:bg-interactive-tertiary-hover',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary',
  'data-[selected]:bg-interactive-secondary-hover data-[selected]:font-medium data-[selected]:text-brand',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled data-[disabled]:hover:bg-transparent',
);

export const treeViewBranchControlRecipe = () => nodeClasses;

export const treeViewItemRecipe = () =>
  twMerge(nodeClasses, 'pl-[calc((var(--depth)_-_1)_*_1.25rem_+_2rem)]');

export const treeViewBranchIndicatorRecipe = () =>
  twJoin(
    'flex h-4 w-4 shrink-0 items-center justify-center text-secondary',
    'transition-transform duration-150 motion-reduce:transition-none',
    'data-[state=open]:rotate-90',
  );

export const treeViewNodeTextRecipe = () =>
  'flex min-w-0 flex-1 items-center gap-2 truncate';

export const treeViewBranchContentRecipe = () =>
  'relative flex flex-col gap-px [&[hidden]]:hidden';

export const treeViewIndentGuideRecipe = () =>
  twJoin(
    'pointer-events-none absolute bottom-0 top-0 z-[1] w-0 border-l border-primary',
    'left-[calc((var(--depth)_-_1)_*_1.25rem_+_1rem)]',
  );
