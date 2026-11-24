<script lang="ts" generics="T extends string">
  import { tabPanelRecipe } from './recipe';

  import type { TabPanelProps } from './primitive/tab-panel.svelte';
  import PrimitiveTabPanel from './primitive/tab-panel.svelte';

  interface Props extends Omit<TabPanelProps<T>, 'class'> {
    class?: string;
  }

  const { class: className, ...rest }: Props = $props();
</script>

<PrimitiveTabPanel {...rest} class={tabPanelRecipe({ className })} />
