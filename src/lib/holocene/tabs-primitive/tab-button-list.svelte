<script lang="ts" generics="T extends string">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import { composeEventHandlers } from '$lib/utilities/event-handlers';

  import { getTabsContext } from './context';

  type Orientation = 'horizontal' | 'vertical';
  type Activation = 'automatic' | 'manual';

  type TabButtonProps = HTMLAttributes<HTMLElement>;
  type GetTabButtonProps = (overrides?: TabButtonProps) => TabButtonProps;

  interface Props extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'role' | 'children' | 'aria-orientation' | 'onkeydown' | 'onfocusout'
  > {
    'aria-label': string;
    orientation?: Orientation;
    activation?: Activation;
    /**
     * Renders each tab. Spread the first arg (the prop-getter) onto the
     * element of your choice. A `<button>` or `<a>` is recommended for native
     * semantics, but non-interactive elements (e.g. `div`/`span`) are also
     * supported: the prop-getter applies the correct ARIA roles and roving
     * tabindex, and wires Enter/Space keyboard activation for them.
     */
    tabButtonSnippet: Snippet<
      [
        GetTabButtonProps,
        { tab: T; isSelected: boolean; setSelectedTab: (tab: T) => void },
      ]
    >;
  }

  const {
    tabButtonSnippet,
    orientation = 'horizontal',
    activation = 'automatic',
    ...props
  }: Props = $props();

  const context = getTabsContext<T>();

  let listEl = $state<HTMLDivElement>();
  let focusedTab = $state<T>();

  const activeTab = $derived(focusedTab ?? context.selectedTab);

  function getTabButtonProps(
    tab: T,
    isSelected: boolean,
    overrides: TabButtonProps = {},
  ): TabButtonProps {
    const {
      class: className,
      onclick,
      onfocus,
      onkeydown,
      ...rest
    } = overrides;
    return {
      ...rest,
      id: context.getButtonIdForTab(tab),
      role: 'tab',
      'aria-selected': isSelected,
      'aria-controls': context.getPanelIdForTab(tab),
      tabindex: tab === activeTab ? 0 : -1,
      class: className,
      onkeydown: composeEventHandlers(
        onkeydown,
        (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
          const element = e.currentTarget;

          if (
            element instanceof HTMLAnchorElement ||
            element instanceof HTMLButtonElement
          ) {
            // if <a> or <button> let click handler handle
            return;
          }

          if (isDisabled(element)) {
            return;
          }

          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            context.setSelectedTab(tab);
          }
        },
      ),
      onclick: composeEventHandlers(
        onclick,
        (e: MouseEvent & { currentTarget: HTMLElement }) => {
          const element = e.currentTarget;

          if (isDisabled(element)) {
            return;
          }

          context.setSelectedTab(tab);
        },
      ),
      onfocus: composeEventHandlers(onfocus, () => (focusedTab = tab)),
    };
  }

  function tabElements(): HTMLElement[] {
    return Array.from(
      listEl?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [],
    );
  }

  function isDisabled(element: HTMLElement): boolean {
    return (
      element.hasAttribute('disabled') ||
      element.getAttribute('aria-disabled') === 'true'
    );
  }

  function onkeydown(event: KeyboardEvent) {
    const elements = tabElements();
    const count = elements.length;
    if (count === 0) return;

    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    let from = elements.findIndex(
      (element) => element === document.activeElement,
    );
    let step: number;
    switch (event.key) {
      case nextKey:
        step = 1;
        break;
      case prevKey:
        step = -1;
        break;
      case 'Home':
        from = -1;
        step = 1;
        break;
      case 'End':
        from = count;
        step = -1;
        break;
      default:
        return;
    }

    event.preventDefault();

    let next = from;
    for (let i = 0; i < count; i += 1) {
      next = (next + step + count) % count;
      if (!isDisabled(elements[next])) break;
    }
    if (isDisabled(elements[next])) return;

    elements[next].focus();
    if (activation === 'automatic') {
      context.setSelectedTab(context.tabs[next]);
    }
  }

  function onfocusout(event: FocusEvent) {
    if (!listEl?.contains(event.relatedTarget as Node | null)) {
      focusedTab = undefined;
    }
  }
</script>

<div
  bind:this={listEl}
  {...props}
  role="tablist"
  aria-orientation={orientation}
  {onkeydown}
  {onfocusout}
>
  {#each context.tabs as tab (tab)}
    {@const isSelected = context.selectedTab === tab}
    {@render tabButtonSnippet?.(
      (overrides) => getTabButtonProps(tab, isSelected, overrides),
      { tab, isSelected, setSelectedTab: context.setSelectedTab },
    )}
  {/each}
</div>
