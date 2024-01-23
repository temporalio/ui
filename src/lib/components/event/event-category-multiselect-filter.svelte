<script lang="ts">
  import { page } from '$app/stores';

  import MultiSelect from '$lib/holocene/select/multi-select.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { temporalVersion } from '$lib/stores/versions';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { isVersionNewer } from '$lib/utilities/version-check';

  export let compact = false;

  $: label = compact
    ? translate('events.event-type')
    : translate('events.workflow-events');

  let parameter = 'category';
  let options = (compact ? compactEventTypeOptions : allEventTypeOptions).map(
    (o) => ({
      ...o,
      label: translate(o.label),
    }),
  );

  $: {
    if (isVersionNewer('1.21', $temporalVersion)) {
      options = options.filter(({ value }) => value !== 'update');
    }
  }
  $: initialSelected = $eventCategoryFilter
    ? options.filter((o) => $eventCategoryFilter.includes(o.value))
    : [];

  const onOptionClick = (_options) => {
    if (_options.length === options.length) {
      _options = [];
    }

    const value = _options.map((o) => o.value).join(',');
    updateQueryParameters({
      parameter: parameter,
      value,
      url: $page.url,
    });
  };
</script>

<MultiSelect
  id="event-category-filter-menu"
  {options}
  {initialSelected}
  {label}
  active={!!$eventCategoryFilter}
  selectAllLabel={translate('common.select-all')}
  clearAllLabel={translate('common.clear-all-capitalized')}
  onChange={onOptionClick}
  variant="table-header"
  icon="filter"
/>
