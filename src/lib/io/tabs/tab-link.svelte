<script lang="ts" module>
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  export interface TabLinkProps extends Omit<HTMLAnchorAttributes, 'class'> {
    href: string;
    current?: boolean;
    count?: number;
    class?: string;
  }
</script>

<script lang="ts">
  import { BadgeCount } from '$lib/io/badge-count';

  import { tabRecipe } from './recipe';

  let {
    href,
    current = false,
    count,
    class: className,
    children,
    ...rest
  }: TabLinkProps = $props();
</script>

<a
  aria-current={current ? 'page' : undefined}
  {...rest}
  {href}
  class={tabRecipe({ className })}
>
  {@render children?.()}
  {#if count != null}
    <BadgeCount value={count} size="sm" />
  {/if}
</a>
