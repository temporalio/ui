<script lang="ts" context="module">
  import { cva, type VariantProps } from 'class-variance-authority';
  import { twMerge as merge } from 'tailwind-merge';

  export type BadgeType = VariantProps<typeof types>['type'];

  const type = {
    alpha: 'bg-purple-100 text-purple-700',
    beta: 'bg-indigo-400',
    success: 'bg-green-100 text-green-800',
    information: 'bg-indigo-400',
    error: 'bg-red-300',
    warning: 'bg-yellow-200',
    unspecified: 'bg-slate-100',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-slate-100',
    available: 'bg-green-100 text-green-800',
    running: 'bg-indigo-400',
    count: 'h-6 w-6 min-w-max rounded-full bg-indigo-400',
  };

  const types = cva(
    [
      'flex',
      'w-fit',
      'flex-row',
      'items-center',
      'justify-center',
      'text-nowrap',
      'break-all',
      'rounded-sm',
      'p-1',
      'text-sm',
      'font-medium',
      'leading-4',
      'transition-colors',
      'text-black',
    ],
    {
      variants: {
        type,
      },
      defaultVariants: {
        type: 'unspecified',
      },
    },
  );

  export const badgeTypes = Object.keys(type) as BadgeType[];
</script>

<script lang="ts">
  export let type: BadgeType | undefined | null | false = 'unspecified';

  let className = '';
  export { className as class };
</script>

<div class={merge(types({ type: type || 'unspecified' }), className)}>
  <slot />
</div>
