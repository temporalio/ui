<script lang="ts">
  import { page } from '$app/stores';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  let value = '';

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== 'WorkflowType');

  $: typeFilter = $workflowFilters.find((f) => f.attribute === 'WorkflowType');
  $: typeSort = $workflowSorts.find((s) => s.attribute === 'WorkflowType');

  const onInput = (e: Event) => {
    const { value } = e.target as HTMLInputElement;
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

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };

  function handleShowInput(event: CustomEvent) {
    const show = event.detail.show;
    if (show && typeFilter && !value) {
      value = typeFilter.value;
    } else if (show && !typeFilter && value) {
      value = '';
    }
  }

  function handleClearInput() {
    $workflowFilters = [...getOtherFilters()];
    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  }
</script>

<DropdownMenu
  value={typeFilter ? typeFilter.value : typeSort ? typeSort.value : ''}
  keepOpen
  left
  icon="filter"
  testId="workflow-type-filter-button"
  on:showmenu={handleShowInput}
>
  <svelte:fragment slot="label">Type</svelte:fragment>
  <div class="flex w-[500px] flex-col gap-2 p-2">
    <Input
      icon="search"
      type="search"
      id="workflowType"
      placeholder="Workflow Type"
      class="flex items-center px-2 transition-all hover:cursor-pointer"
      autoFocus
      clearable
      on:input={onInput}
      on:clear={handleClearInput}
      bind:value
    />
  </div>
</DropdownMenu>
