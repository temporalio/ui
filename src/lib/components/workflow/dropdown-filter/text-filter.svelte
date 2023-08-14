<script lang="ts">
  import { page } from '$app/stores';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    type TextFilterAttributes,
    attributeToHumanReadable,
    attributeToId,
  } from '$lib/models/workflow-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import Icon from '$lib/holocene/icon/icon.svelte';

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

<MenuContainer>
  <MenuButton variant="table-header" controls="{attribute}-filter-menu">
    {attributeToHumanReadable[attribute]}
    <Icon name="filter" slot="trailing" />
  </MenuButton>
  <Menu keepOpen id="{attribute}-filter-menu" class="w-[500px]">
    <Input
      icon="search"
      type="search"
      label={translate('search')}
      labelHidden
      id={attributeToId[attribute]}
      placeholder={attributeToHumanReadable[attribute]}
      class="flex items-center px-2 transition-all hover:cursor-pointer"
      autoFocus
      clearable
      clearButtonLabel={translate('clear-input-button-label')}
      on:input={onInput}
      on:clear={handleClearInput}
      bind:value
    />
  </Menu>
</MenuContainer>
