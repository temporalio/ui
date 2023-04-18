<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    timeFormat,
    setTimeFormat,
    type TimeFormatOptions,
  } from '$lib/stores/time-format';
  import type { TimeFormat } from '$lib/types/global';

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

<DropdownMenu {value} right testId="date-time-format-filter">
  <div class="w-56">
    {#each dateOptions as { label, option } (option)}
      <div class="option" class:active={$timeFormat === option}>
        <div class="check">
          {#if $timeFormat === option}
            <Icon name="checkmark" />
          {/if}
        </div>
        <button
          data-testid="event-date-filter-{option}"
          on:click={() => onDateOptionClick(option)}
        >
          {label}
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
    @apply mx-4 mt-1 w-4;
  }

  .active {
    @apply text-blue-700;
  }
</style>
