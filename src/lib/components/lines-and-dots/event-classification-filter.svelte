<script lang="ts">
  import { page } from '$app/state';

  import MultiSelect from '$lib/holocene/select/multi-select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventClassifications } from '$lib/models/event-history/get-event-classification';
  import { eventClassificationFilter } from '$lib/stores/filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const label = translate('events.event-classification-label');

  const parameter = 'classification';
  const options = eventClassifications.map((o) => ({
    value: o,
    label: o,
  }));

  const initialSelected = $derived(
    $eventClassificationFilter
      ? options.filter((o) => $eventClassificationFilter.includes(o.value))
      : [],
  );

  const onOptionClick = (_options) => {
    if (_options.length === options.length) {
      _options = [];
    }

    const value = _options.map((o) => o.value).join(',');
    updateQueryParameters({
      parameter: parameter,
      value,
      url: page.url,
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
