<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  export type BadgeType = VariantProps<typeof types>['type'];

  const type = {
    primary:
      'border border-information bg-surface-information text-information',
    secondary: 'bg-alpha-purple-30 text-primary',
    default: 'border border-secondary bg-surface-primary text-secondary',
    warning: 'border border-warning bg-surface-warning text-warning',
    success: 'border border-success bg-surface-success text-success',
    danger: 'border border-danger bg-surface-danger text-danger',
    count:
      'h-6 w-6 min-w-max rounded-full border border-information bg-surface-information text-information',
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
      },
      defaultVariants: {
        type: 'default',
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
    class?: string;
    children?: Snippet;
  }

  let { type = 'default', class: className = '', children }: Props = $props();
</script>

<div class={merge(types({ type: type || 'default' }), className)}>
  {@render children?.()}
</div>
