<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { isVersionNewer } from '$lib/utilities/version-check';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { temporalVersion } from '$lib/stores/versions';
  import { translate } from '$lib/i18n/translate';

  export let compact: boolean = false;

  $: label = compact
    ? translate('events', 'event-type')
    : translate('events', 'workflow-events');

  let parameter = 'category';
  let options = compact ? compactEventTypeOptions : allEventTypeOptions;

  if (isVersionNewer('1.21', $temporalVersion)) {
    options = options.filter(({ option }) => option !== 'update');
  }

  $: _value = $page.url?.searchParams?.get(parameter);

  $: {
    updateQueryParameters({
      parameter: parameter,
      value: _value,
      url: $page.url,
    }).then((v) => {
      const visibleOption = options.find(({ option }) => option === v);
      _value = visibleOption?.option?.toString() ?? null;
      $eventCategoryFilter = _value;
    });
  }

  const onOptionClick = (option: string) => {
    _value = option;
  };
</script>

<DropdownMenu value={_value} icon="filter" testId="event-category-filter">
  <svelte:fragment slot="label">
    {label}
  </svelte:fragment>
  <div class="w-56">
    {#each options as { label, option } (option)}
      <div class="option" class:active={_value === option}>
        <div class="check active">
          {#if _value === option}
            <Icon name="checkmark" />
          {/if}
        </div>
        <button
          data-testid="event-category-option"
          on:click={() => onOptionClick(option)}
        >
          {translate('events', label)}
        </button>
      </div>
    {/each}
  </div>
</DropdownMenu>

<style lang="postcss">
  .option {
    @apply my-2 flex font-normal;
  }

  .check {
    @apply mx-4 w-4;
  }

  .active {
    @apply text-blue-700;
  }
</style>
