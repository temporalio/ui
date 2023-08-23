<script lang="ts">
  import { getContext } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit, resetFilter } =
    getContext<FilterContext>(FILTER_CONTEXT);

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
  label={$filter.attribute}
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
