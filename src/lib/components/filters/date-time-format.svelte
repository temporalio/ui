<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCheck } from '@fortawesome/free-solid-svg-icons';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    timeFormat,
    setTimeFormat,
    TimeFormatOptions,
  } from '$lib/stores/time-format';

  let dateOptions: TimeFormatOptions = [
    { label: 'UTC Time', option: 'UTC' },
    { label: 'Relative Time', option: 'relative' },
    { label: 'Local Time', option: 'local' },
  ];

  const onDateOptionClick = (option: TimeFormat) => {
    setTimeFormat(option);
  };

  $: value = $timeFormat === 'UTC' ? undefined : `${$timeFormat}`;
</script>

<DropdownMenu {value} right dataCy="date-time-format-filter">
  {#each dateOptions as { label, option } (option)}
    <div
      class="option"
      class:active={$timeFormat === option}
      on:click={() => onDateOptionClick(option)}
      data-cy="event-date-filter-{option}"
    >
      <div class="check">
        {#if $timeFormat === option}
          <Icon icon={faCheck} scale={0.8} />
        {/if}
      </div>
      <div class="label">
        {label}
      </div>
    </div>
  {/each}
</DropdownMenu>

<style lang="postcss">
  .option {
    @apply font-normal flex my-2;
  }
  .label {
    @apply cursor-pointer;
  }
  .check {
    @apply mx-4 w-4 mt-1;
  }
  .active {
    @apply text-blue-700;
  }
</style>
