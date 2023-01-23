<script lang="ts">
  import { searchAttributes } from '$lib/stores/search-attributes';

  import CustomButton from './custom-button.svelte';
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

  const onSortChange = () => {
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

  const onSortRemove = () => {
    adding = false;
    $workflowSorts = [];
  };
</script>

<div class="flex gap-2">
  <CustomButton
    icon={adding ? 'close' : 'add'}
    class="h-8 rounded-full underline"
    on:click={() => (adding = !adding)}>Order by</CustomButton
  >
  {#if adding}
    <TypeaheadInput
      icon="filter"
      placeholder="Filter type"
      class="w-72"
      id="filter-type-name"
      bind:value
      {options}
      onChange={onTypeChange}
      autoFocus
    />
    <div class="ml-1 flex gap-1">
      <CustomButton
        icon={order === 'asc' ? 'ascending' : 'descending'}
        class="h-8 text-sm"
        on:click={onSortChange}
        >{order === 'asc' ? 'Ascending' : 'Descending'}</CustomButton
      >
      <CustomButton
        icon="trash"
        class="h-8"
        destructive
        on:click={onSortRemove}
      />
    </div>
  {/if}
</div>
