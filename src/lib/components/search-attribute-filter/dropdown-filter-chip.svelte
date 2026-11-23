<script lang="ts">
  import { writable } from 'svelte/store';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTrash } from '$lib/io/icon';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { isNullConditional } from '$lib/utilities/is';
  import {
    isDateTimeFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';

  import FilterEditor from './filter-editor.svelte';

  type Props = {
    filter: SearchAttributeFilter;
    onUpdate: (updatedFilter: SearchAttributeFilter) => void;
    onRemove: () => void;
    index?: number;
    openIndex?: number | null;
    readOnly?: boolean;
  };

  let {
    filter,
    onUpdate,
    onRemove,
    index = 0,
    openIndex = null,
    readOnly = false,
  }: Props = $props();

  const open = writable(false);

  const displayText = $derived(
    `${getDisplayKeyWithConditional(filter)} ${getDisplayValue(filter)}`,
  );

  const controlsId = $derived(
    `dropdown-filter-chip-${filter.attribute}-${index}`,
  );

  function getDisplayKeyWithConditional(filter: SearchAttributeFilter): string {
    const displayKey = getDisplayKey(filter);
    return filter.negated ? `NOT ${displayKey}` : displayKey;
  }

  function getDisplayKey(filter: SearchAttributeFilter): string {
    const { attribute, conditional } = filter;

    if (isDateTimeFilter(filter)) {
      if (filter.customDate) return `${attribute} Between`;

      const conditionText =
        conditional === '<'
          ? translate('common.before').toLowerCase()
          : conditional === '>'
            ? translate('common.after').toLowerCase()
            : conditional;
      return `${attribute} ${conditionText}`;
    }

    if (isTextFilter(filter)) {
      const conditionText =
        conditional === 'STARTS_WITH'
          ? translate('common.starts-with').toLowerCase()
          : conditional;
      return `${attribute} ${conditionText}`;
    }

    return `${attribute} ${conditional}`;
  }

  function getDisplayValue(filter: SearchAttributeFilter): string {
    const { value } = filter;

    if (isStatusFilter(filter)) {
      return value;
    }

    if (isNullConditional(filter.conditional)) {
      return 'null';
    }

    if (isDateTimeFilter(filter)) {
      if (filter.customDate) return value?.split('BETWEEN')[1];
      return $timestamp(value, { format: 'short' });
    }

    if (isTextFilter(filter)) {
      return `"${value}"`;
    }

    return value;
  }

  $effect(() => {
    if (openIndex === index) {
      $open = true;
    }
  });

  let chipContentWidthPx = $state(0);
</script>

<MenuContainer {open} class="min-w-0 max-w-full">
  <MenuButton
    size="xs"
    controls={controlsId}
    hasIndicator
    class="h-auto min-h-8 min-w-0 max-w-full whitespace-normal bg-surface-secondary"
  >
    <Tooltip
      text={displayText}
      hide={$open}
      class="min-w-0 max-w-full"
      width={chipContentWidthPx}
      usePortal
      portalOffset={{ y: 12 }}
      bottom
    >
      <div
        bind:clientWidth={chipContentWidthPx}
        class="min-w-0 max-w-full truncate text-left"
      >
        <span class="break-words text-primary"
          >{getDisplayKeyWithConditional(filter)}</span
        >
        <span class="break-all text-brand">{getDisplayValue(filter)}</span>
      </div>
    </Tooltip>
  </MenuButton>

  <Menu
    id={controlsId}
    usePortal
    class="max-h-fit w-min min-w-0 max-w-[calc(100dvw-1rem)] p-4"
  >
    <!-- Keyed on open so the editor remounts seeded from the applied filter,
         discarding anything typed and then dismissed. -->
    {#if readOnly}
      <div class="space-y-4" data-testid="read-only-filter">
        <h3 class="text-sm font-medium">
          {translate('common.filter-by-column', {
            column: filter.attribute,
            escapeValue: false,
          })}
        </h3>
        <p class="min-w-60 break-all text-sm">{displayText}</p>
        <p class="text-sm text-secondary">
          {filter.unsupportedQuery
            ? translate('common.unsupported-query-filter')
            : translate('common.read-only-filter')}
        </p>
        {#if !filter.unsupportedQuery}
          <div class="flex justify-end">
            <Button
              TrailingIcon={IconTrash}
              variant="secondary"
              size="xs"
              data-testid="remove-filter-button"
              type="button"
              onclick={onRemove}>{translate('common.remove')}</Button
            >
          </div>
        {/if}
      </div>
    {:else}
      {#key $open}
        <FilterEditor
          {filter}
          idPrefix={controlsId}
          onApply={(updated) => {
            onUpdate(updated);
            $open = false;
          }}
          {onRemove}
        />
      {/key}
    {/if}
  </Menu>
</MenuContainer>
