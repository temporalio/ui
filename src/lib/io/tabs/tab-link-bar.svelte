<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  export interface TabLinkBarProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'class'
  > {
    'aria-label': string;
    class?: string;
  }
</script>

<script lang="ts">
  import { tabBarRecipe } from './recipe';

  let { class: className, children, ...rest }: TabLinkBarProps = $props();
</script>

<nav {...rest} class={tabBarRecipe({ className })}>
  {@render children?.()}
</nav>
