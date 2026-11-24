<script lang="ts" generics="T extends string = string">
  import type { TabsProps } from './primitive/tabs.svelte';
  import PrimitiveTabs from './primitive/tabs.svelte';

  let {
    tabs,
    selectedTab = $bindable(tabs[0]),
    ...rest
  }: TabsProps<T> = $props();
</script>

<PrimitiveTabs {...rest} {tabs} bind:selectedTab />
