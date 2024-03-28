<script lang="ts">
  import { page } from '$app/stores';

  import MultiSelect from '$lib/holocene/select/multi-select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventClassifications } from '$lib/models/event-history/get-event-classification';
  import { eventClassificationFilter } from '$lib/stores/filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  $: label = translate('events.event-classification-label');

  let parameter = 'classification';
  let options = eventClassifications.map((o) => ({
    value: o,
    label: o,
  }));

  $: initialSelected = $eventClassificationFilter
    ? options.filter((o) => $eventClassificationFilter.includes(o.value))
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
  id="event-classification-filter-menu"
  {options}
  {initialSelected}
  {label}
  active={!!$eventClassificationFilter}
  selectAllLabel={translate('common.select-all')}
  clearAllLabel={translate('common.clear-all-capitalized')}
  onChange={onOptionClick}
  variant="primary"
  icon="filter"
/>
