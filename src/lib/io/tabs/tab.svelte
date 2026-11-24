<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  export interface TabProps extends Omit<HTMLButtonAttributes, 'class'> {
    count?: number;
    class?: string;
  }
</script>

<script lang="ts">
  import { BadgeCount } from '$lib/io/badge-count';

  import { tabRecipe } from './recipe';

  let {
    count,
    class: className,
    type = 'button',
    children,
    ...rest
  }: TabProps = $props();
</script>

<button {...rest} {type} class={tabRecipe({ className })}>
  {@render children?.()}
  {#if count != null}
    <BadgeCount value={count} size="sm" />
  {/if}
</button>
