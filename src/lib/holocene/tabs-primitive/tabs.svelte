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

  function setSelectedTab(selected: T) {
    selectedTab = selected;
    onSelectedTabChange?.(selected);
  }

  setTabsContext<T>({
    getIdForTab(tab: T) {
      return `${id}-tab-${tab}`;
    },
    getPanelIdForTab(tab: T) {
      return `${id}-panel-${tab}`;
    },
    get selectedTab() {
      return selectedTab;
    },

    get tabs() {
      return tabs;
    },

    setSelectedTab,
  });
</script>

{@render children?.()}
