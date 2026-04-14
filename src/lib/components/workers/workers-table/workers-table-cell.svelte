<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workerFilters } from '$lib/stores/filters';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

  interface Props {
    attribute?: string;
    copyable?: boolean;
    filters?: SearchAttributeFilter[];
    value?: string | null;
    filterable?: boolean;
    href?: string;
    children?: Snippet;
  }

  let {
    attribute,
    copyable = true,
    filters,
    value,
    filterable = false,
    href,
    children,
  }: Props = $props();

  const matchesFilter = (a: SearchAttributeFilter, b: SearchAttributeFilter) =>
    a.attribute === b.attribute && a.value === b.value;

  const toggleFilters = $derived(
    filters && filters.length > 0
      ? filters
      : [createFilter({ attribute, value: value ?? '', conditional: '=' })],
  );

  const isFiltered = $derived(
    toggleFilters.some((f) =>
      $workerFilters.some((wf) => matchesFilter(wf, f)),
    ),
  );

  const onRowFilterClick = async () => {
    const toRemove = toggleFilters.filter((f) =>
      $workerFilters.some((wf) => matchesFilter(wf, f)),
    );
    const toAdd = toggleFilters.filter(
      (f) => !$workerFilters.some((wf) => matchesFilter(wf, f)),
    );

    $workerFilters = [
      ...$workerFilters.filter(
        (wf) => !toRemove.some((f) => matchesFilter(wf, f)),
      ),
      ...toAdd,
    ];

    updateQueryParamsFromFilter(page.url, $workerFilters);
  };

  let filterOrCopyButtonsVisible = $state(false);
  const showFilterOrCopy = () => (filterOrCopyButtonsVisible = true);
  const hideFilterOrCopy = () => (filterOrCopyButtonsVisible = false);
  const handleFocusOut = (e: FocusEvent) => {
    const nextTarget = e.relatedTarget as HTMLElement;
    if (
      nextTarget &&
      !['filter-button', 'copy-button'].includes(nextTarget.id)
    ) {
      hideFilterOrCopy();
    }
  };
  const truncate = (value: string | undefined | null): string => {
    if (value?.length && value.length > 13) {
      return `${value.slice(0, 6)}...${value.slice(-6)}`;
    }
    return value ?? '';
  };
</script>

<td
  class="relative h-8"
  onfocus={showFilterOrCopy}
  onfocusin={showFilterOrCopy}
  onfocusout={handleFocusOut}
  onmouseover={showFilterOrCopy}
  onmouseleave={hideFilterOrCopy}
  onblur={hideFilterOrCopy}
>
  {#if attribute === 'BuildId' || attribute === 'WorkerInstanceKey'}
    {#if href}
      <Tooltip text={value ?? undefined} top class="min-w-0">
        <Link {href}>{truncate(value)}</Link>
      </Tooltip>
    {:else}
      <Tooltip text={value ?? undefined} top class="min-w-0">
        {truncate(value)}
      </Tooltip>
    {/if}
  {:else if href}
    <Link {href}>{value}</Link>
  {:else if children}
    {@render children?.()}
  {:else}
    {value}
  {/if}
  {#if value || (filters && filters.length > 0)}
    <FilterOrCopyButtons
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      filterIconTitle={translate('common.filter-workflows')}
      show={filterOrCopyButtonsVisible}
      content={value ?? ''}
      onFilter={onRowFilterClick}
      {copyable}
      {filterable}
      filtered={isFiltered}
    />
  {/if}
</td>
