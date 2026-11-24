<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  export type TabAttributes = HTMLAttributes<HTMLElement> & { class?: string };

  export interface TabSnippetProps<T extends string> {
    tab: T;
    isSelected: boolean;
    isDisabled: boolean;
    /** Spread onto the tab element; pass your own handlers here so they compose. */
    getAttributes: (overrides?: TabAttributes) => TabAttributes;
  }

  export interface TabBarProps<T extends string> extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'role'
    | 'children'
    | 'aria-orientation'
    | 'onkeydown'
    | 'onfocusin'
    | 'onfocusout'
  > {
    'aria-label': string;
    /**
     * Renders each tab. A `<button>` is recommended, but any element works:
     * `getAttributes` adds the ARIA roles, roving tabindex and Enter/Space
     * activation for non-button elements.
     */
    tabSnippet: Snippet<[TabSnippetProps<T>]>;
  }
</script>

<script lang="ts" generics="T extends string">
  import { composeEventHandlers } from '$lib/utilities/event-handlers';
  import { createRovingFocusState } from '$lib/utilities/roving-focus';

  import { getTabsContext } from './context';

  const { tabSnippet, ...rest }: TabBarProps<T> = $props();

  const context = getTabsContext<T>();

  const rovingFocus = createRovingFocusState<T>({
    getItems: () => context.tabs,
    getElement: (tab) => document.getElementById(context.getTabId(tab)),
    getResetItem: () => context.selectedTab,
    isDisabled: (tab) => context.isTabDisabled(tab),
    get orientation() {
      return context.orientation;
    },
    onNavigate: (tab) => {
      if (context.activation === 'automatic') {
        context.setSelectedTab(tab);
      }
    },
  });

  function getAttributes(tab: T, overrides: TabAttributes = {}): TabAttributes {
    const { onclick, onkeydown, ...overrideAttributes } = overrides;
    return {
      ...overrideAttributes,
      id: context.getTabId(tab),
      role: 'tab',
      'aria-selected': context.selectedTab === tab,
      'aria-controls': context.getPanelId(tab),
      'aria-disabled': context.isTabDisabled(tab) || undefined,
      tabindex: rovingFocus.tabIndex(tab),
      onclick: composeEventHandlers(onclick, () => context.setSelectedTab(tab)),
      onkeydown: composeEventHandlers(
        onkeydown,
        (event: KeyboardEvent & { currentTarget: HTMLElement }) => {
          if (
            event.currentTarget instanceof HTMLButtonElement ||
            event.currentTarget instanceof HTMLAnchorElement
          ) {
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            context.setSelectedTab(tab);
          }
        },
      ),
    };
  }
</script>

<div
  {...rest}
  role="tablist"
  aria-orientation={context.orientation}
  onkeydown={rovingFocus.onkeydown}
  onfocusin={rovingFocus.onfocusin}
  onfocusout={rovingFocus.onfocusout}
>
  {#each context.tabs as tab (tab)}
    {@render tabSnippet({
      tab,
      isSelected: context.selectedTab === tab,
      isDisabled: context.isTabDisabled(tab),
      getAttributes: (overrides) => getAttributes(tab, overrides),
    })}
  {/each}
</div>
