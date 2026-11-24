<script lang="ts" generics="T extends string">
  import { tabBarRecipe } from './recipe';

  import type { TabBarProps } from './primitive/tab-bar.svelte';
  import PrimitiveTabBar from './primitive/tab-bar.svelte';

  interface Props extends Omit<TabBarProps<T>, 'class'> {
    class?: string;
  }

  const { class: className, ...rest }: Props = $props();
</script>

<PrimitiveTabBar {...rest} class={tabBarRecipe({ className })} />
