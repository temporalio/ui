<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/index.svelte';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let compact: boolean = false;

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

<DropdownMenu value={_value} left>
  {#each options as { label, option } (option)}
    <div
      class="option"
      class:active={_value === option}
      on:click={() => onOptionClick(option)}
    >
      <div class="check active">
        {#if _value === option}
          <Icon stroke="currentcolor" name="checkMark" scale={0.8} />
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
    @apply my-2 flex font-normal;
  }
  .label {
    @apply cursor-pointer;
  }
  .check {
    @apply mx-4 w-4;
  }
  .active {
    @apply text-blue-700;
  }
</style>
