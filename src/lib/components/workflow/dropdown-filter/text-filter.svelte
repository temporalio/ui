<script lang="ts">
  import { page } from '$app/stores';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    type TextFilterAttributes,
    attributeToHumanReadable,
    attributeToId,
  } from '$lib/models/workflow-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  let value = '';
  export let attribute: TextFilterAttributes;

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== attribute);

  $: idFilter = $workflowFilters.find((f) => f.attribute === attribute);

  const onInput = (e: Event) => {
    const { value } = e.target as HTMLInputElement;
    if (value) {
      const filter = {
        attribute,
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters);
  };

  function handleShowInput(event: CustomEvent) {
    const show = event.detail.show;
    if (show && idFilter?.value) {
      value = idFilter.value;
    } else if (show && !idFilter && value) {
      value = '';
    }
  }

  function handleClearInput() {
    $workflowFilters = [...getOtherFilters()];
    updateQueryParamsFromFilter($page.url, $workflowFilters);
  }
</script>

<DropdownMenu
  value={idFilter ? idFilter.value : ''}
  keepOpen
  icon="filter"
  testId="{attributeToId[attribute]}-filter-button"
  on:showmenu={handleShowInput}
>
  <svelte:fragment slot="label"
    >{attributeToHumanReadable[attribute]}</svelte:fragment
  >
  <div class="flex w-[500px] flex-col gap-2 p-2">
    <Input
      icon="search"
      type="search"
      id={attributeToId[attribute]}
      placeholder={attributeToHumanReadable[attribute]}
      class="flex items-center px-2 transition-all hover:cursor-pointer"
      autoFocus
      clearable
      on:input={onInput}
      on:clear={handleClearInput}
      bind:value
    />
  </div>
</DropdownMenu>
