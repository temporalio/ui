<script lang="ts">
  import { getContext } from 'svelte';
  
  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import { translate } from '$lib/i18n/translate';
  
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';
  

  type T = $$Generic;

  const { filter, handleSubmit } = getContext<FilterContext<T>>(FILTER_CONTEXT);

  let list: string[] = [];

  function onSubmit() {
    $filter.conditional = 'IN';
    list = list.map((item) => `"${item}"`);
    $filter.value = `(${list.join(', ')})`;
    handleSubmit();
  }
</script>

<div class="flex">
  <ChipInput
    label={$filter.attribute}
    labelHidden
    id="list-filter-search"
    bind:chips={list}
    class="w-full rounded-none"
    removeChipButtonLabel={(chip) =>
      translate('workflows', 'remove-keyword-label', { keyword: chip })}
    placeholder="{translate('type-or-paste-in')} {$filter.attribute}"
  />
  <Button
    variant="search"
    unroundLeft
    disabled={!list.length}
    on:click={onSubmit}>{translate('submit')}</Button
  >
</div>
