<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let compact: boolean = false;

  $: label = compact ? 'Event Type' : 'Workflow Events';

  let parameter = 'category';
  let options = compact ? compactEventTypeOptions : allEventTypeOptions;

  $: _value = $page.url?.searchParams?.get(parameter) ?? undefined;

  $: {
    updateQueryParameters({
      parameter: parameter,
      value: _value,
      url: $page.url,
    }).then((v) => (_value = v?.toString()));
  }

  const onOptionClick = (option: string) => {
    _value = option;
  };
</script>

<DropdownMenu value={_value} left icon="filter">
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
        <button on:click={() => onOptionClick(option)}>
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
    @apply mx-4 w-4;
  }

  .active {
    @apply text-blue-700;
  }
</style>
