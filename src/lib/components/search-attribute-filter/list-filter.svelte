<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  $: ({ value } = $filter);
  $: list =
    value.length > 0
      ? value
          .slice(1, -1)
          .split(', ')
          .map((v) => v.slice(1, -1))
      : [];

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
    class="w-full [&_*]:border-l-0 [&_*]:border-r-0"
    removeChipButtonLabel={(chip) =>
      translate('workflows.remove-keyword-label', { keyword: chip })}
    placeholder="{translate('common.type-or-paste-in')} {$filter.attribute}"
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
