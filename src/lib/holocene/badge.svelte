<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  export type BadgeType = VariantProps<typeof types>['type'];

  const type = {
    primary: 'bg-information text-information border-information',
    secondary: 'surface-subtle text-primary border-subtle',
    default: 'surface-subtle text-primary border-subtle',
    warning: 'bg-warning text-warning border-warning',
    success: 'bg-success text-success border-success',
    danger: 'bg-danger text-danger border-danger',
    count:
      'h-5 min-w-5 rounded-full bg-interactive px-1.5 text-white border-transparent',
    subtle: 'surface-subtle font-normal select-all border-subtle',
    ghost: 'surface-primary text-primary border-subtle',
  };

  const types = cva(
    [
      'flex',
      'w-fit',
      'flex-row',
      'items-center',
      'justify-center',
      'text-nowrap',
      'rounded-control',
      'border',
      'px-1.5',
      'py-0.5',
      'text-xs',
      'font-medium',
      'leading-4',
      'transition-colors',
      'duration-fast',
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
