<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import { twJoin, twMerge } from 'tailwind-merge';

  export type GroupInnerBorderHandling = 'none' | 'collapse';
  export type GroupRoundness = 'none' | 'sm' | 'base' | 'lg' | 'full';

  export interface RoundnessGroupProps extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'class'
  > {
    roundness: GroupRoundness;
    innerBorderHandling?: GroupInnerBorderHandling;
    class?: string;
  }

  const groupClasses = '[&>*]:rounded-none';

  const roundnessClasses: Record<GroupRoundness, string> = {
    none: '',
    sm: twJoin('[&>*:first-child]:rounded-l-sm [&>*:last-child]:rounded-r-sm'),
    base: twJoin('[&>*:first-child]:rounded-l [&>*:last-child]:rounded-r'),
    lg: twJoin('[&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg'),
    full: twJoin(
      '[&>*:first-child]:rounded-l-full [&>*:last-child]:rounded-r-full',
    ),
  };

  export function roundnessGroupRecipe({
    roundness,
    innerBorderHandling = 'none',
    className,
  }: {
    roundness: GroupRoundness;
    innerBorderHandling?: GroupInnerBorderHandling;
    className?: string;
  }): string {
    return twMerge(
      groupClasses,
      roundnessClasses[roundness],
      innerBorderHandling === 'collapse' && '[&>*:not(:last-child)]:border-r-0',
      className,
    );
  }
</script>

<script lang="ts">
  const {
    roundness = 'base',
    innerBorderHandling = 'none',
    children,
    class: className,
    ...rest
  }: RoundnessGroupProps = $props();
</script>

<span
  {...rest}
  class={roundnessGroupRecipe({
    roundness,
    innerBorderHandling,
    className,
  })}
>
  {@render children?.()}
</span>
