<script lang="ts">
  import type { HTMLTdAttributes } from 'svelte/elements';

  import type { ComponentProps } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Portal from '$lib/holocene/portal/portal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { composeEventHandlers } from '$lib/utilities/event-handlers';

  type FilterOrCopyButtonsProps = ComponentProps<typeof FilterOrCopyButtons>;

  interface Props extends HTMLTdAttributes {
    class?: string;
    copyValue?: string;
    onFilter?: () => void;
    isFiltered?: boolean;
    copyIconTitle?: FilterOrCopyButtonsProps['copyIconTitle'];
    copySuccessIconTitle?: FilterOrCopyButtonsProps['copySuccessIconTitle'];
    filterIconTitle?: FilterOrCopyButtonsProps['filterIconTitle'];
    menuId?: FilterOrCopyButtonsProps['menuId'];
    menuOpen?: boolean;
  }

  const {
    children,
    copyValue,
    onFilter,
    isFiltered,
    copyIconTitle = translate('common.copy-icon-title'),
    copySuccessIconTitle = translate('common.copy-success-icon-title'),
    filterIconTitle = translate('common.filter-items'),
    menuId,
    menuOpen = false,
    ...cellProps
  }: Props = $props();

  let cellElement = $state<HTMLElement | null>(null);
  let isHovered = $state(false);
  // The menu is portaled and anchored to the filter button, so unmounting the
  // buttons on mouseleave would take an open menu with it.
  const areFilterOrCopyButtonsVisible = $derived(isHovered || menuOpen);

  // Leaving the cell for the buttons dispatches the cell's mouseleave and the
  // buttons' mouseenter in the same task, and Svelte batches the two updates,
  // so the buttons stay mounted without needing a hide delay. A delay would
  // leave a trail of popovers when sweeping across a row.
  function showFilterOrCopyButtons() {
    isHovered = true;
  }
  function hideFilterOrCopyButtons() {
    isHovered = false;
  }

  const copyable = $derived(Boolean(copyValue));
  const filterable = $derived(Boolean(onFilter));
</script>

<td
  bind:this={cellElement}
  {...cellProps}
  class={twMerge('relative', cellProps.class)}
  onmouseenter={composeEventHandlers(
    cellProps.onmouseenter,
    showFilterOrCopyButtons,
  )}
  onmouseleave={composeEventHandlers(
    cellProps.onmouseleave,
    hideFilterOrCopyButtons,
  )}
  onfocusin={composeEventHandlers(cellProps.onfocusin, showFilterOrCopyButtons)}
  onfocusout={composeEventHandlers(cellProps.onfocusout, (e) => {
    const next = e.relatedTarget;
    if (!(next instanceof Node) || !e.currentTarget.contains(next)) {
      // focus left subtree
      hideFilterOrCopyButtons();
    }
  })}
>
  {@render children?.()}
</td>

{#if cellElement && (copyable || filterable)}
  <Portal
    anchor={cellElement}
    open={areFilterOrCopyButtonsVisible}
    position="top-right"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onmouseenter={showFilterOrCopyButtons}
      onmouseleave={hideFilterOrCopyButtons}
      onfocusin={showFilterOrCopyButtons}
      onfocusout={hideFilterOrCopyButtons}
    >
      <FilterOrCopyButtons
        show={areFilterOrCopyButtonsVisible}
        {copyIconTitle}
        {copySuccessIconTitle}
        {filterIconTitle}
        {copyable}
        {filterable}
        content={copyValue ?? ''}
        {onFilter}
        filtered={isFiltered}
        {menuId}
        {menuOpen}
      />
    </div>
  </Portal>
{/if}
