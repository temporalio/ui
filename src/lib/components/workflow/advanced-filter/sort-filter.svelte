<script lang="ts">
  import { searchAttributes } from '$lib/stores/search-attributes';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import { workflowSorts } from '$lib/stores/filters';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';
  import type { SortOrder } from '$lib/models/workflow-filters';

  let adding = false;
  let value = '';
  let order: SortOrder = 'desc';

  const options = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];

  const onTypeChange = (attribute: string) => {
    $workflowSorts = [
      {
        attribute,
        value: order,
      },
    ];
  };

  const onSortChange = (e: MouseEvent) => {
    if (order === 'asc') {
      order = 'desc';
    } else {
      order = 'asc';
    }

    if ($workflowSorts[0]) {
      $workflowSorts = [
        {
          ...$workflowSorts[0],
          value: order,
        },
      ];
    }
  };

  const onSortRemove = (e: MouseEvent) => {
    adding = false;
    $workflowSorts = [];
  };
</script>

<div class="flex gap-0">
  <CustomButton
    icon={adding ? 'chevron-left' : 'chevron-right'}
    unroundRight={adding}
    class="h-10 border border-gray-900 bg-white"
    on:click={() => (adding = !adding)}
    >Order by {$workflowSorts[0] && !adding
      ? `${$workflowSorts[0].attribute}`
      : ''}</CustomButton
  >
  {#if adding}
    <TypeaheadInput
      icon="filter"
      placeholder="Filter type"
      class="w-72"
      id="filter-type-name"
      bind:value
      unroundLeft
      {options}
      onChange={onTypeChange}
      autoFocus
    />
    <div class="ml-1 flex gap-1">
      <CustomButton
        icon={order === 'asc' ? 'ascending' : 'descending'}
        class="h-10 text-sm"
        on:click={onSortChange}
        >{order === 'asc' ? 'Ascending' : 'Descending'}</CustomButton
      >
      <CustomButton
        icon="trash"
        class="h-10"
        destructive
        on:click={onSortRemove}
      />
    </div>
  {/if}
</div>
