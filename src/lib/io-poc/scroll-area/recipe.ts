import { twJoin, twMerge } from 'tailwind-merge';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollAreaScrollbars = 'hover' | 'always';

export const scrollAreaRecipe = (className?: string) =>
  twMerge('relative flex min-h-0 min-w-0 overflow-hidden', className);

export const scrollAreaViewportRecipe = ({
  orientation,
  className,
}: {
  orientation: ScrollAreaOrientation;
  className?: string;
}) =>
  twMerge(
    twJoin(
      'size-full min-h-0 rounded-[inherit]',
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary',
      orientation === 'vertical' && '!overflow-x-hidden',
      orientation === 'horizontal' && '!overflow-y-hidden',
    ),
    className,
  );

export const scrollAreaScrollbarRecipe = (scrollbars: ScrollAreaScrollbars) =>
  twJoin(
    'z-10 flex select-none p-0.5 transition-opacity duration-150 motion-reduce:transition-none',
    'data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col',
    '[&[data-orientation=vertical]:not([data-overflow-y])]:hidden',
    '[&[data-orientation=horizontal]:not([data-overflow-x])]:hidden',
    '[&[hidden]]:hidden',
    scrollbars === 'hover' &&
      'opacity-0 data-[dragging]:opacity-100 data-[hover]:opacity-100 data-[scrolling]:opacity-100',
  );

export const scrollAreaThumbRecipe = () =>
  twJoin(
    'flex-1 rounded-full bg-[color:var(--color-border-secondary)] transition-colors motion-reduce:transition-none',
    'hover:bg-[color:var(--color-content-tertiary)] data-[dragging]:bg-[color:var(--color-content-tertiary)]',
  );

export const scrollAreaCornerRecipe = () =>
  twJoin('bg-transparent', '[&[data-state=hidden]]:hidden');
