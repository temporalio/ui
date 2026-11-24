<script lang="ts" module>
  import { twJoin, twMerge } from 'tailwind-merge';

  const segmentedControlClasses = twJoin(
    'inline-flex flex-wrap items-center gap-2',
    'rounded border border-primary bg-surface-primary p-px',
  );

  export const segmentedControlRecipe = ({
    className,
  }: { className?: string } = {}) =>
    twMerge(segmentedControlClasses, className);
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class'> {
    element?: 'div' | 'nav';
    class?: string;
  }

  let {
    element = 'div',
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<svelte:element
  this={element}
  {...rest}
  class={segmentedControlRecipe({ className })}
>
  {@render children?.()}
</svelte:element>
