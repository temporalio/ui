<script lang="ts">
  import { searchAttributes } from '$lib/stores/search-attributes';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import { workflowSorts } from '$lib/stores/filters';

  const options = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];

  const onOrderBy = () => {
    if ($workflowSorts.length) {
      $workflowSorts = [];
    } else {
      $workflowSorts = [
        {
          attribute: 'WorkflowType',
          value: 'asc',
        },
      ];
    }
  };
</script>

<div class="flex gap-2">
  <CustomButton class="h-10 text-sm" on:click={onOrderBy}>Order by</CustomButton
  >
  {#each $workflowSorts as { attribute, value }}
    <Select id="filter-type" bind:value={attribute} class="w-auto">
      {#each options as { value, label } (value)}
        <Option {value}>{label}</Option>
      {/each}
    </Select>
    <CustomButton
      icon={value === 'asc' ? 'ascending' : 'descending'}
      class="h-10 text-sm"
      on:click={() => {
        if (value === 'asc') {
          value = 'desc';
        } else {
          value = 'asc';
        }
      }}>{value === 'asc' ? 'Ascending' : 'Descending'}</CustomButton
    >
  {/each}
</div>
