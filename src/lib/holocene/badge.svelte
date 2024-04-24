<script lang="ts" context="module">
  import { cva, type VariantProps } from 'class-variance-authority';
  import { twMerge as merge } from 'tailwind-merge';

  export type BadgeType = VariantProps<typeof types>['type'];

  const type = {
    alpha: 'border-purple-700 bg-purple-100 text-purple-700',
    beta: 'border-blue-700 bg-indigo-400 text-black',
    success: 'border-green-700 bg-green-100 text-green-800',
    information: 'border-blue-700 bg-indigo-400 text-black',
    error: 'border-red-700 bg-red-300 text-black',
    warning: 'border-yellow-900 bg-yellow-200 text-black',
    unspecified: 'bg-badge text-primary dark:bg-slate-100 dark:text-black',
    active: 'border-green-700 bg-green-100 text-green-800',
    inactive: 'bg-badge text-primary dark:bg-slate-100 dark:text-black',
    available: 'border-green-700 bg-green-100 text-green-700',
    running: 'border-blue-700 bg-indigo-400 text-black',
    count: 'h-6 w-6 min-w-max rounded-full bg-indigo-400 text-black',
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
