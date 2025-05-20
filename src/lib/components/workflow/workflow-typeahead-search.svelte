<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';
  import Button from '$lib/holocene/button.svelte';
  import Chip from '$lib/holocene/chip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    searchAttributes,
    sortedSearchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import { refresh, workflowsQuery } from '$lib/stores/workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { SEARCH_ATTRIBUTE_TYPE, type SearchAttributeType } from '$lib/types/workflows';
  import { get } from 'svelte/store';

  import TypeaheadInput from './typeahead-input.svelte';

  let stage: 'attribute' | 'operator' | 'value' | 'join' = 'attribute';
  let tokens: string[] = [];
  let attribute = '';
  let attributeType: SearchAttributeType = SEARCH_ATTRIBUTE_TYPE.KEYWORD;
  let operator = '';
  let value = '';

  $: manualSearchString = tokens.join(' ');
  $: query = $page.url.searchParams.get('query');

  const operatorMap: Record<SearchAttributeType, string[]> = {
    [SEARCH_ATTRIBUTE_TYPE.KEYWORD]: ['=', '!=', 'startsWith', 'contains'],
    [SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST]: ['in', 'not in'],
    [SEARCH_ATTRIBUTE_TYPE.INT]: ['=', '!=', '>', '<', '>=', '<='],
    [SEARCH_ATTRIBUTE_TYPE.DOUBLE]: ['=', '!=', '>', '<', '>=', '<='],
    [SEARCH_ATTRIBUTE_TYPE.DATETIME]: ['=', '!=', '>', '<', '>=', '<='],
    [SEARCH_ATTRIBUTE_TYPE.BOOL]: ['=', '!='],
    [SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED]: ['='],
  };

  const attributeOptions = $sortedSearchAttributeOptions.map(({ label }) => label);

  function handleAttributeSelect(selected: string) {
    attribute = selected;
    const found = get(sortedSearchAttributeOptions).find((o) => o.label === selected);
    attributeType = found?.type ?? SEARCH_ATTRIBUTE_TYPE.KEYWORD;
    stage = 'operator';
  }

  function handleOperatorSelect(selected: string) {
    operator = selected;
    stage = 'value';
  }

  function submitValue() {
    if (!value) return;
    tokens = [...tokens, attribute, operator, `"${value}"`];
    attribute = '';
    operator = '';
    value = '';
    stage = 'join';
  }

  function handleJoinSelect(selected: string) {
    tokens = [...tokens, selected];
    stage = 'attribute';
  }

  function removeToken(index: number) {
    tokens = tokens.filter((_, i) => i !== index);
  }

  const onSearch = () => {
    if (!manualSearchString) {
      $workflowFilters = [];
      $workflowsQuery = '';
    } else {
      try {
        $workflowFilters = toListWorkflowFilters(manualSearchString, $searchAttributes);
      } catch (e) {
        console.error(e);
      }
    }
    if (manualSearchString && manualSearchString === query) {
      $refresh = Date.now();
    } else {
      updateQueryParameters({
        url: $page.url,
        parameter: 'query',
        value: manualSearchString,
        allowEmpty: true,
        clearParameters: [currentPageKey],
      });
    }
  };
</script>

<div class="w-full" in:fade>
  <form on:submit|preventDefault={onSearch} class="flex flex-col gap-2" in:fly={{ x: -100, duration: 150 }} role="search">
    <div class="flex flex-wrap gap-1">
      {#each tokens as token, i}
        <Chip on:remove={() => removeToken(i)} removeButtonLabel={translate('workflows.remove-filter-label', { attribute: token })}>
          {token}
        </Chip>
      {/each}
    </div>
    {#if stage === 'attribute'}
      <TypeaheadInput id="attr" bind:value={attribute} options={attributeOptions} placeholder="Attribute" on:select={handleAttributeSelect} on:change={handleAttributeSelect} />
    {:else if stage === 'operator'}
      <TypeaheadInput id="op" bind:value={operator} options={operatorMap[attributeType]} placeholder="Operator" on:select={handleOperatorSelect} on:change={handleOperatorSelect} />
    {:else if stage === 'value'}
      <TypeaheadInput id="val" bind:value={value} options={[]} placeholder="Value" on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), submitValue())} />
    {:else if stage === 'join'}
      <TypeaheadInput id="join" bind:value options={['AND','OR']} placeholder="Join" on:select={handleJoinSelect} on:change={handleJoinSelect} />
    {/if}
    <Button data-testid="manual-search-button" variant="primary" type="submit">
      {translate('common.search')}
    </Button>
  </form>
</div>
