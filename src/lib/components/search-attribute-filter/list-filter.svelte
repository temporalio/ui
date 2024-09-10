<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

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
    id="list-filter"
    bind:chips={list}
    class="w-full rounded-none"
    removeChipButtonLabel={(chip) =>
      translate('workflows.remove-keyword-label', { keyword: chip })}
    placeholder="{translate('common.type-or-paste-in')} {$filter.attribute}"
  />
  <Button
    variant="secondary"
    borderRadiusModifier="square-left"
    disabled={!list.length}
    on:click={onSubmit}>{translate('common.submit')}</Button
  >
</div>
