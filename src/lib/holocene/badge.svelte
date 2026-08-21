<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  export type BadgeType = VariantProps<typeof types>['type'];

  const type = {
    primary:
      'border border-io-border-information bg-io-surface-information text-io-content-information',
    secondary: 'bg-io-alpha-purple-30 text-io-content-primary',
    default:
      'border border-io-border-secondary bg-io-surface-primary text-io-content-secondary',
    warning:
      'border border-io-border-warning bg-io-surface-warning text-io-content-warning',
    success:
      'border border-io-border-success bg-io-surface-success text-io-content-success',
    danger:
      'border border-io-border-danger bg-io-surface-danger text-io-content-danger',
    count:
      'h-6 w-6 min-w-max rounded-full border border-io-border-information bg-io-surface-information text-io-content-information',
    subtle:
      'bg-io-surface-tertiary text-io-content-secondary font-normal select-all',
    ghost:
      'bg-io-surface-primary text-io-content-primary border border-io-border-tertiary',
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
