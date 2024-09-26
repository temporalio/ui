<script lang="ts" context="module">
  import { cva, type VariantProps } from 'class-variance-authority';
  import { twMerge as merge } from 'tailwind-merge';

  export type BadgeType = VariantProps<typeof types>['type'];

  const type = {
    primary: 'bg-blue-300',
    secondary: 'bg-purple-200',
    default: 'bg-slate-100',
    warning: 'bg-yellow-200',
    success: 'bg-green-200',
    danger: 'bg-red-200',
    count: 'h-6 w-6 min-w-max rounded-full bg-blue-300',
    subtle: 'surface-subtle dark:text-white font-normal select-all',
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
        type: 'default',
      },
    },
  );

  export const badgeTypes = Object.keys(type) as BadgeType[];
</script>

<script lang="ts">
  export let type: BadgeType | undefined | null | false = 'default';

  let className = '';
  export { className as class };
</script>

<div class={merge(types({ type: type || 'default' }), className)}>
  <slot />
</div>
