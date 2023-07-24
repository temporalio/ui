<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';

  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';
  import { translate } from '$lib/i18n/translate';

  type T = $$Generic;

  const { filter, handleSubmit, resetFilter } =
    getContext<FilterContext<T>>(FILTER_CONTEXT);

  let value = $filter.value;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && value !== '') {
      e.preventDefault();
      $filter.value = value;
      handleSubmit();
    }
  }
</script>

<Input
  label={translate('search')}
  labelHidden
  id="text-filter-search"
  type="search"
  placeholder={`${translate('enter')} ${$filter.attribute}`}
  icon="search"
  class="w-full"
  unroundLeft
  bind:value
  on:keydown={handleKeydown}
  on:blur={resetFilter}
/>
