<script lang="ts">
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import Conditional from './conditional.svelte';
  import Sort from './sort.svelte';

  let value = '';

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== 'WorkflowType');

  $: typeFilter = $workflowFilters.find((f) => f.attribute === 'WorkflowType');
  $: typeSort = $workflowSorts.find((s) => s.attribute === 'WorkflowType');

  $: {
    if (value) {
      const filter = {
        attribute: 'WorkflowType',
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
  value={typeFilter ? typeFilter.value : typeSort ? typeSort.value : ''}
  keepOpen
  left
>
  <svelte:fragment slot="label">Type</svelte:fragment>
  <div class="flex w-96 flex-col gap-2 p-2">
    <Input
      icon="search"
      id="workflowType"
      placeholder="Workflow Type"
      class="flex items-center px-2 transition-all hover:cursor-pointer"
      autoFocus
      bind:value
    />
    <Sort type="WorkflowType" />
  </div>
</DropdownMenu>
