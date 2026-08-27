<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  export type BadgeType = VariantProps<typeof types>['type'];
  export type BadgeSize = VariantProps<typeof types>['size'];

  const type = {
    primary:
      'border border-information bg-surface-information text-information',
    secondary: 'bg-alpha-purple-30 text-primary',
    accent: 'border border-accent bg-surface-accent text-accent',
    default: 'border border-tertiary bg-surface-tertiary text-secondary',
    warning: 'border border-warning bg-surface-warning text-warning',
    success: 'border border-success bg-surface-success text-success',
    danger: 'border border-danger bg-surface-danger text-danger',
    count:
      'gap-1 rounded-full border border-secondary bg-surface-tertiary px-1 py-0 font-mono text-xs font-normal leading-4 text-primary',
    subtle: 'bg-surface-tertiary text-secondary font-normal select-all',
    ghost: 'bg-surface-primary text-primary border border-tertiary',
  };

  const types = cva(
    [
      'flex',
      'w-fit',
      'flex-row',
      'items-center',
      'justify-center',
      'text-nowrap',
      'rounded-sm',
      'p-1',
      'text-sm',
      'font-medium',
      'leading-[1.5]',
      'transition-colors',
    ],
    {
      variants: {
        type,
        size: {
          sm: 'px-1.5 py-0 text-xs leading-5',
          md: '',
        },
      },
      defaultVariants: {
        type: 'default',
        size: 'md',
      },
    },
  );

  export const badgeTypes = Object.keys(type) as BadgeType[];
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props {
    type?: BadgeType | null | false;
    size?: BadgeSize;
    class?: string;
    children?: Snippet;
  }

  let {
    type = 'default',
    size = 'md',
    class: className = '',
    children,
  }: Props = $props();
</script>

<div
  class={merge(
    types({
      type: type || 'default',
      size: type === 'count' ? 'md' : size,
    }),
    className,
  )}
>
  {@render children?.()}
</div>
