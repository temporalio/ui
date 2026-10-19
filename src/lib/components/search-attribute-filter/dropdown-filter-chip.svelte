<script lang="ts">
  import { writable } from 'svelte/store';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
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
  };

  let {
    filter,
    onUpdate,
    onRemove,
    index = 0,
    openIndex = null,
  }: Props = $props();

  const open = writable(false);

  const displayText = $derived(
    `${getDisplayKeyWithConditional(filter)} ${getDisplayValue(filter)}`,
  );

  const controlsId = $derived(
    `dropdown-filter-chip-${filter.attribute}-${index}`,
  );

  function getDisplayKeyWithConditional(filter: SearchAttributeFilter): string {
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

<MenuContainer {open} class="max-w-full min-w-0">
  <MenuButton
    size="xs"
    controls={controlsId}
    hasIndicator
    class="h-auto min-h-8 max-w-full min-w-0 bg-surface-secondary whitespace-normal"
  >
    <Tooltip
      text={displayText}
      hide={$open}
      class="max-w-full min-w-0"
      width={chipContentWidthPx}
      usePortal
      portalOffset={{ y: 12 }}
      bottom
    >
      <div
        bind:clientWidth={chipContentWidthPx}
        class="max-w-full min-w-0 truncate text-left"
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
    class="max-h-fit w-min max-w-[calc(100dvw-1rem)] min-w-0 p-4"
  >
    <!-- Keyed on open so the editor remounts seeded from the applied filter,
         discarding anything typed and then dismissed. -->
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
  </Menu>
</MenuContainer>
