<script lang="ts" generics="T extends string = string">
  import { type Snippet } from 'svelte';

  import { setTabsContext } from './context';

  interface Props {
    selectedTab?: T;
    tabs: T[];
    children: Snippet<[]>;
    onSelectedTabChange?: (selected: T) => void;
  }

  let {
    children,
    tabs,
    selectedTab = $bindable(tabs[0]),
    onSelectedTabChange,
  }: Props = $props();

  const id = $props.id();

  setTabsContext<T>({
    get selectedTab() {
      return selectedTab;
    },

    get tabs() {
      return tabs;
    },

    getIdForTab(tab: string) {
      return `${id}-tab-${tab}`;
    },

    getPanelIdForTab(tab: string) {
      return `${id}-panel-${tab}`;
    },

    setSelectedTab(selected: string) {
      selectedTab = selected as T;
      onSelectedTabChange?.(selected as T);
    },
  });
</script>

{@render children?.()}
