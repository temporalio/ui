<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { untrack } from 'svelte';

  import { page } from '$app/state';

  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { IconFilterLines } from '$lib/io/icon';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { SearchAttributeType } from '$lib/types/workflows';
  import {
    isAppliedFilter,
    isAtQueryLimit,
    removeFilterById,
    replaceAttributeFilters,
    upsertFilter,
  } from '$lib/utilities/query/column-filter';
  import {
    getDefaultConditional,
    isStatusAttribute,
  } from '$lib/utilities/query/quick-filter';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

  import FilterEditor from './filter-editor.svelte';
  import StatusFilterEditor from './status-filter-editor.svelte';

  interface Props {
    attribute: string;
    type: SearchAttributeType;
    label: string;
    filters: Writable<SearchAttributeFilter[]>;
    conditionals?: string[];
  }

  let { attribute, type, label, filters, conditionals }: Props = $props();

  const open = writable(false);
  const uid = $props.id();
  const controlsId = `column-header-filter-${uid}`;

  const appliedFilters = $derived(
    $filters.filter(
      (filter) => filter.attribute === attribute && isAppliedFilter(filter),
    ),
  );
  const filtered = $derived(appliedFilters.length > 0);
  const isStatus = $derived(isStatusAttribute(attribute));

  const atQueryLimit = $derived(isAtQueryLimit(page.url));

  const createInitialFilter = (): SearchAttributeFilter =>
    appliedFilters[0] ??
    createFilter({
      attribute,
      type,
      conditional: getDefaultConditional(type),
    });

  const initialFilter = $derived(
    $open && !isStatus ? untrack(createInitialFilter) : undefined,
  );

  const canRemove = $derived(
    initialFilter !== undefined &&
      $filters.some(({ id }) => id === initialFilter.id),
  );

  const setFilters = (next: SearchAttributeFilter[]) => {
    $filters = next;
    updateQueryParamsFromFilter(page.url, $filters);
  };

  const applyFilter = (updated: SearchAttributeFilter) => {
    if (isAppliedFilter(updated)) {
      setFilters(upsertFilter($filters, updated));
    } else if ($filters.some(({ id }) => id === updated.id)) {
      setFilters(removeFilterById($filters, updated.id));
    }
    $open = false;
  };

  const removeFilter = () => {
    if (!initialFilter) return;
    setFilters(removeFilterById($filters, initialFilter.id));
    $open = false;
  };
</script>

<MenuContainer {open} class="shrink-0">
  <MenuButton
    controls={controlsId}
    variant="ghost"
    size="xs"
    active={filtered || $open}
    disabled={!filtered && atQueryLimit}
    label={translate('common.filter-by-column', { column: label })}
    data-testid="column-header-filter-{attribute}"
    data-filtered={filtered}
  >
    {#snippet leading()}
      <IconFilterLines />
      {#if filtered}
        <span
          class="absolute right-1 top-1 size-1.5 rounded-full bg-interactive-primary"
          data-testid="column-header-filter-indicator"
        ></span>
      {/if}
    {/snippet}
  </MenuButton>
  <Menu
    id={controlsId}
    usePortal
    keepOpen={isStatus}
    class={[
      'max-h-fit p-4',
      isStatus ? 'w-80 max-w-fit' : 'w-min min-w-0 max-w-[calc(100dvw-1rem)]',
    ]}
  >
    {#if isStatusAttribute(attribute)}
      <StatusFilterEditor
        {attribute}
        filters={appliedFilters}
        onUpdate={(updated) =>
          setFilters(replaceAttributeFilters($filters, attribute, updated))}
      />
    {:else if initialFilter}
      <FilterEditor
        filter={initialFilter}
        idPrefix={controlsId}
        {conditionals}
        applyOnEnter
        onApply={applyFilter}
        onRemove={canRemove ? removeFilter : undefined}
      />
    {/if}
  </Menu>
</MenuContainer>
