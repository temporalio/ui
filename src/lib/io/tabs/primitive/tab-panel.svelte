<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  export interface TabPanelProps<T extends string> extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'id' | 'role' | 'hidden' | 'aria-labelledby'
  > {
    tab: T;
    /** Keep the content mounted while the panel is hidden. */
    keepMounted?: boolean;
  }
</script>

<script lang="ts" generics="T extends string">
  import { getTabsContext } from './context';

  const {
    tab,
    keepMounted = false,
    tabindex = 0,
    children,
    ...rest
  }: TabPanelProps<T> = $props();

  const context = getTabsContext<T>();

  const isSelected = $derived(context.selectedTab === tab);
</script>

<div
  {...rest}
  id={context.getPanelId(tab)}
  role="tabpanel"
  aria-labelledby={context.getTabId(tab)}
  hidden={!isSelected}
  {tabindex}
>
  {#if isSelected || keepMounted}
    {@render children?.()}
  {/if}
</div>
