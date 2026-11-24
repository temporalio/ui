<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { TabsActivation, TabsOrientation } from './context';

  export interface TabsProps<T extends string> {
    tabs: T[];
    selectedTab?: T;
    orientation?: TabsOrientation;
    /** `automatic` selects a tab when arrow keys focus it; `manual` waits for click, Enter or Space. */
    activation?: TabsActivation;
    isTabDisabled?: (tab: T) => boolean;
    onSelectedTabChange?: (selected: T) => void;
    children: Snippet;
  }
</script>

<script lang="ts" generics="T extends string = string">
  import { setTabsContext } from './context';

  let {
    tabs,
    selectedTab = $bindable(tabs[0]),
    orientation = 'horizontal',
    activation = 'automatic',
    isTabDisabled = () => false,
    onSelectedTabChange,
    children,
  }: TabsProps<T> = $props();

  const id = $props.id();

  setTabsContext<T>({
    get selectedTab() {
      return selectedTab;
    },
    get tabs() {
      return tabs;
    },
    get orientation() {
      return orientation;
    },
    get activation() {
      return activation;
    },
    isTabDisabled: (tab) => isTabDisabled(tab),
    getTabId: (tab) => `${id}-tab-${encodeURIComponent(tab)}`,
    getPanelId: (tab) => `${id}-panel-${encodeURIComponent(tab)}`,
    setSelectedTab(tab) {
      if (isTabDisabled(tab) || tab === selectedTab) {
        return;
      }
      selectedTab = tab;
      onSelectedTabChange?.(tab);
    },
  });
</script>

{@render children()}
