<script lang="ts">
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';

  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import ConditionalMenu from './conditional-menu.svelte';

  type T = $$Generic;

  const { filter, focusedElementId, handleSubmit } =
    getContext<FilterContext<T>>(FILTER_CONTEXT);

  const validateNumber = (value: string): boolean => /^[0-9]+$/.test(value);

  const handleKeydown = (e: KeyboardEvent) => {
    $focusedElementId = '';
    if (e.key === 'Enter' && $filter.value !== '') {
      const isValid = validateNumber($filter.value);
      if (isValid) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };
</script>

<div class="flex items-center">
  <ConditionalMenu inputId="number-filter-search" />
  <NumberInput
    id="number-filter-search"
    icon="search"
    placeholder="Enter a number"
    bind:value={$filter.value}
    on:keydown={handleKeydown}
    unroundLeft
    search
  />
</div>
