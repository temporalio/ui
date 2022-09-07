<script context="module">
  export const dateParameter = 'time-format';
</script>

<script>import Icon from '$holocene/icon/icon.svelte';
import DropdownMenu from '../dropdown-menu.svelte';
import { eventFilterSort, eventSortOrder, eventShowElapsed, supportsReverseOrder, } from '../../stores/event-view';
import { timeFormat, setTimeFormat, } from '../../stores/time-format';
import { page } from '$app/stores';
import { updateQueryParameters } from '../../utilities/update-query-parameters';
let sortOptions = [
    { label: 'Sort 1-9', option: 'ascending' },
    { label: 'Sort 9-1', option: 'descending' },
];
let dateOptions = [
    { label: 'UTC Time', option: 'UTC' },
    { label: 'Relative Time', option: 'relative' },
    { label: 'Local Time', option: 'local' },
];
const onSortOptionClick = (option) => {
    $eventFilterSort = option;
    updateQueryParameters({
        parameter: 'sort',
        value: option,
        url: $page.url,
    });
};
const onDateOptionClick = (option) => {
    setTimeFormat(option);
};
const onShowElapsedClick = () => {
    if ($eventShowElapsed === 'true') {
        $eventShowElapsed = 'false';
    }
    else {
        $eventShowElapsed = 'true';
    }
};
$: value =
    $eventSortOrder === 'descending' &&
        $timeFormat === 'UTC' &&
        $eventShowElapsed === 'false'
        ? undefined
        : `${$eventSortOrder}:${$timeFormat}:${$eventShowElapsed}`;
</script>

<DropdownMenu {value} right dataCy="event-date-filter">
  {#if $supportsReverseOrder}
    {#each sortOptions as { option, label } (option)}
      <div
        class="option"
        class:active={$eventSortOrder === option}
        on:click={() => onSortOptionClick(option)}
      >
        <div class="check active">
          {#if $eventSortOrder === option}
            <Icon name="checkmark" />
          {/if}
        </div>
        <div class="label">
          {label}
        </div>
      </div>
    {/each}

    <div class="option pr-4">
      <div class="check" />
      <div class="my-2 w-full border-b-2 border-gray-300 pr-2" />
    </div>
  {/if}
  {#each dateOptions as { label, option } (option)}
    <div
      class="option"
      class:active={$timeFormat === option}
      on:click={() => onDateOptionClick(option)}
      data-cy="event-date-filter-{option}"
    >
      <div class="check active">
        {#if $timeFormat === option}
          <Icon name="checkmark" />
        {/if}
      </div>
      <div class="label">
        {label}
      </div>
    </div>
  {/each}
  <div class="option pr-4">
    <div class="check" />
    <div class="my-2 w-full border-b-2 border-gray-300 pr-2" />
  </div>
  <div
    class="option"
    class:active={$eventShowElapsed === 'true'}
    on:click={onShowElapsedClick}
  >
    <div class="check active">
      {#if $eventShowElapsed === 'true'}
        <Icon name="checkmark" />
      {/if}
    </div>
    <div class="label">Show Elapsed Time</div>
  </div>
</DropdownMenu>

<style>
  .option {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    font-weight: 400
}
  .label {
    cursor: pointer
}
  .check {
    margin-left: 1rem;
    margin-right: 1rem;
    width: 1rem
}
  .active {
    --tw-text-opacity: 1;
    color: rgb(29 78 216 / var(--tw-text-opacity))
}</style>
