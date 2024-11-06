<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  let list: string[] = [];

  onMount(() => {
    const { value } = $filter;
    const initialList =
      value.length > 0
        ? value
            .slice(1, -1)
            .split(', ')
            .map((v) => v.slice(1, -1))
        : [];
    list = initialList;
  });

  function onSubmit() {
    $filter.conditional = 'IN';
    list = list.map((item) => `"${item}"`);
    $filter.value = `(${list.join(', ')})`;
    handleSubmit();
  }
</script>

<form class="flex grow" on:submit|preventDefault={onSubmit}>
  <ChipInput
    label={$filter.attribute}
    labelHidden
    id="list-filter"
    bind:chips={list}
    class="w-full"
    removeChipButtonLabel={(chip) =>
      translate('workflows.remove-keyword-label', { keyword: chip })}
    placeholder="{translate('common.type-or-paste-in')} {$filter.attribute}"
    unroundLeft
    unroundRight
    external
  />
  <div class="flex h-fit items-center">
    <Button
      borderRadiusModifier="square-left"
      disabled={!list.length}
      type="submit"
    >
      {translate('common.search')}
    </Button>
    <slot />
  </div>
</form>
