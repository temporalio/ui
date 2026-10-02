<script lang="ts">
  import type { HTMLTdAttributes } from 'svelte/elements';

  import type { ComponentProps } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { TableDensity } from '$lib/stores/table-density';
  import { composeEventHandlers } from '$lib/utilities/event-handlers';

  type FilterOrCopyButtonsProps = ComponentProps<typeof FilterOrCopyButtons>;

  interface Props extends HTMLTdAttributes {
    class?: string;
    copyValue?: string;
    onFilter?: () => void;
    isFiltered?: boolean;
    density?: TableDensity;
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
    density = 'comfortable',
    copyIconTitle = translate('common.copy-icon-title'),
    copySuccessIconTitle = translate('common.copy-success-icon-title'),
    filterIconTitle = translate('common.filter-items'),
    menuId,
    menuOpen = false,
    ...cellProps
  }: Props = $props();

  let isHovered = $state(false);
  // The menu is portaled and anchored to the filter button, so unmounting the
  // buttons on mouseleave would take an open menu with it.
  const areFilterOrCopyButtonsVisible = $derived(isHovered || menuOpen);
  function showFilterOrCopyButtons() {
    isHovered = true;
  }
  function hideFilterOrCopyButtons() {
    isHovered = false;
  }

  const copyable = $derived(Boolean(copyValue));
  const filterable = $derived(Boolean(onFilter));

  const paddingForFilterCopyButtons = $derived.by(() => {
    if (density === 'dense') {
      return '';
    }

    if (copyable && filterable) {
      return 'pr-16';
    }

    if (copyable || filterable) {
      return 'pr-8';
    }

    return '';
  });
</script>

<td
  {...cellProps}
  class={twMerge('relative', paddingForFilterCopyButtons, cellProps.class)}
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
</td>
