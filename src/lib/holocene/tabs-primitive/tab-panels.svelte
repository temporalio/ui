<script lang="ts" generics="T extends string">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import { getTabsContext } from './context';

  type TabPanelProps = HTMLAttributes<HTMLElement>;
  type GetTabPanelProps = (overrides?: TabPanelProps) => TabPanelProps;

  interface Props {
    tabPanelSnippet: Snippet<
      [
        GetTabPanelProps,
        { tab: T; isSelected: boolean; setSelectedTab: (tab: T) => void },
      ]
    >;
  }

  const { tabPanelSnippet }: Props = $props();
  const context = getTabsContext<T>();

  function getTabPanelProps(
    tab: T,
    isSelected: boolean,
    overrides: TabPanelProps = {},
  ): TabPanelProps {
    const { class: className, ...rest } = overrides;
    return {
      ...rest,
      id: context.getPanelIdForTab(tab),
      role: 'tabpanel',
      'aria-labelledby': context.getIdForTab(tab),
      tabindex: 0,
      hidden: !isSelected,
      class: className,
    };
  }
</script>

{#each context.tabs as tab (tab)}
  {@const isSelected = context.selectedTab === tab}
  {@render tabPanelSnippet?.(
    (overrides) => getTabPanelProps(tab, isSelected, overrides),
    { tab, isSelected, setSelectedTab: context.setSelectedTab },
  )}
{/each}
