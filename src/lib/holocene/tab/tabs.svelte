<script lang="ts" module>
  export type TabContext = {
    activeTab: Writable<string>;
    activePanel: Writable<string>;
    registerTab: (tab: string) => void;
    registerPanel: (panel: string) => void;
    selectTab: (tab: string) => void;
  };

  export const TABS = {};
</script>

<script lang="ts">
  import { type Writable, writable } from 'svelte/store';

  import { onDestroy, setContext } from 'svelte';

  let { children, ...rest } = $props();

  const tabs: string[] = $state([]);
  const panels: string[] = $state([]);
  const activeTab = writable<string>(null);
  const activePanel = writable<string>(null);

  setContext<TabContext>(TABS, {
    registerTab: (tab: string) => {
      tabs.push(tab);
      activeTab.update((current) => current || tab);

      onDestroy(() => {
        const i = tabs.indexOf(tab);
        tabs.splice(i, 1);
        activeTab.update((current) =>
          current === tab ? tabs[i] || tabs[tabs.length - 1] : current,
        );
      });
    },

    registerPanel: (panel: string) => {
      panels.push(panel);
      activePanel.update((current) => current || panel);

      onDestroy(() => {
        const i = panels.indexOf(panel);
        panels.splice(i, 1);
        activePanel.update((current) =>
          current === panel ? panels[i] || panels[panels.length - 1] : current,
        );
      });
    },

    selectTab: (tab: string) => {
      const i = tabs.indexOf(tab);
      activeTab.set(tab);
      activePanel.set(panels[i]);
    },

    activeTab,
    activePanel,
  });
</script>

<div class="tabs" {...rest}>
  {@render children?.()}
</div>
