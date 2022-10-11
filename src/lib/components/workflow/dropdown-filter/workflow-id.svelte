<script lang="ts">
  import { page } from '$app/stores';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-advanced-parameters';

  let value = '';

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== 'WorkflowId');

  $: idFilter = $workflowFilters.find((f) => f.attribute === 'WorkflowId');
  $: idSort = $workflowSorts.find((s) => s.attribute === 'WorkflowId');

  const onInput = (e: Event) => {
    const { value } = e.target as HTMLInputElement;
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

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };

  function handleShowInput(event: CustomEvent) {
    const show = event.detail.show;
    if (show && idFilter?.value && !value) {
      value = idFilter.value;
    }
  }

  function handleClearInput() {
    $workflowFilters = [...getOtherFilters()];
    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  }
</script>

<DropdownMenu
  value={idFilter ? idFilter.value : idSort ? idSort.value : ''}
  keepOpen
  left
  icon="filter"
  on:showmenu={handleShowInput}
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
      on:input={onInput}
      on:clear={handleClearInput}
      bind:value
    />
  </div>
</DropdownMenu>
