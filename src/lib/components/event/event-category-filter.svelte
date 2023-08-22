<script lang="ts">
  import { page } from '$app/stores';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
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
    ? translate('events', 'event-type')
    : translate('events', 'workflow-events');

  let parameter = 'category';
  let options = compact ? compactEventTypeOptions : allEventTypeOptions;

  if (isVersionNewer('1.21', $temporalVersion)) {
    options = options.filter(({ option }) => option !== 'update');
  }

  $: visibleOption = options.find(
    ({ option }) => option === $page.url?.searchParams?.get(parameter),
  );
  $: $eventCategoryFilter = visibleOption?.option?.toString() ?? undefined;

  const onOptionClick = (value: string) => {
    updateQueryParameters({
      parameter: parameter,
      value,
      url: $page.url,
    });
  };
</script>

<DropdownMenu
  label={translate('event-category-filter-label')}
  value={$eventCategoryFilter}
  icon="filter"
  testId="event-category-filter"
>
  <svelte:fragment slot="label">
    {label}
  </svelte:fragment>
  <div class="w-56">
    {#each options as { label, option } (option)}
      <div class="option" class:active={$eventCategoryFilter === option}>
        <div class="check active">
          {#if $eventCategoryFilter === option}
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
