<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import { twJoin, twMerge } from 'tailwind-merge';

  export type GroupInnerBorderHandling = 'none' | 'erase' | 'collapse';
  export type GroupRoundness = 'none' | 'sm' | 'base' | 'lg' | 'full';
  export type GroupRoundnessTarget = 'children' | 'wrapper';

  interface RoundnessGroupProps extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'class'
  > {
    roundness: GroupRoundness;
    roundnessTarget?: GroupRoundnessTarget;
    innerBorderHandling?: GroupInnerBorderHandling;
    class?: string;
  }

  const groupClasses = '[&>*]:rounded-none';

  const roundnessClasses: Record<GroupRoundness, string> = {
    none: '',
    sm: twJoin('[&>*:first-child]:rounded-l-xs [&>*:last-child]:rounded-r-xs'),
    base: twJoin('[&>*:first-child]:rounded-l [&>*:last-child]:rounded-r'),
    lg: twJoin('[&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg'),
    full: twJoin(
      '[&>*:first-child]:rounded-l-full [&>*:last-child]:rounded-r-full',
    ),
  };

  const wrapperRoundnessClasses: Record<GroupRoundness, string> = {
    none: twJoin('[--group-radius:0px]'),
    sm: twJoin('[--group-radius:var(--radius-xs)]'),
    base: twJoin('[--group-radius:var(--radius-sm)]'),
    lg: twJoin('[--group-radius:var(--radius-lg)]'),
    full: twJoin('[--group-radius:var(--radius-full)]'),
  };

  const wrapperClasses = twJoin(
    'rounded-[var(--group-radius)]',
    '[--group-inner-radius:max(0px,calc(var(--group-radius)-var(--group-border-width,0px)))]',
    '[&>*:first-child]:rounded-l-[var(--group-inner-radius)]',
    '[&>*:last-child]:rounded-r-[var(--group-inner-radius)]',
  );

  /** Wrapper mode subtracts --group-border-width (default 0px) from the radius for inner corners. */
  export function roundnessGroupRecipe({
    roundness,
    roundnessTarget = 'children',
    innerBorderHandling = 'none',
    className,
  }: {
    roundness: GroupRoundness;
    roundnessTarget?: GroupRoundnessTarget;
    innerBorderHandling?: GroupInnerBorderHandling;
    className?: string;
  }): string {
    return twMerge(
      groupClasses,
      roundnessTarget === 'wrapper'
        ? twJoin(wrapperRoundnessClasses[roundness], wrapperClasses)
        : roundnessClasses[roundness],
      innerBorderHandling === 'collapse' && '[&>*:not(:last-child)]:border-r-0',
      innerBorderHandling === 'erase' &&
        twJoin(
          '[&>*:not(:last-child)]:border-r-0',
          '[&>*:not(:first-child)]:border-l-0',
        ),
      className,
    );
  }
</script>

<script lang="ts">
  const {
    roundness = 'base',
    roundnessTarget = 'children',
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
    roundnessTarget,
    innerBorderHandling,
    className,
  })}
>
  {@render children?.()}
</span>
