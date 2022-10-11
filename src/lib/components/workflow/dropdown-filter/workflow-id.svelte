<script lang="ts">
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import Sort from './sort.svelte';

  let value = '';

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== 'WorkflowId');

  $: idFilter = $workflowFilters.find((f) => f.attribute === 'WorkflowId');
  $: idSort = $workflowSorts.find((s) => s.attribute === 'WorkflowId');

  $: {
    if (value) {
      const filter = {
        attribute: 'WorkflowId',
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }
  }
</script>

<DropdownMenu
  value={idFilter ? idFilter.value : idSort ? idSort.value : ''}
  keepOpen
  left
>
  <svelte:fragment slot="label">Workflow Id</svelte:fragment>
  <div class="flex w-[500px] flex-col gap-2 p-2">
    <Input
      icon="search"
      id="workflowId"
      placeholder="Workflow Id"
      class="flex items-center px-2 transition-all hover:cursor-pointer"
      autoFocus
      clearable
      bind:value
    />
    <!-- <Sort type="WorkflowId" /> -->
  </div>
</DropdownMenu>
