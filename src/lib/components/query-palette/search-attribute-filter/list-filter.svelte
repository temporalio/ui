<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isInConditional } from '$lib/utilities/is';
  import { formatListFilterValue } from '$lib/utilities/query/search-attribute-filter';

  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './filter.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  $: ({ value, conditional } = $filter);
  $: _value = value;
  $: chips = formatListFilterValue(_value);
  $: options = [
    { value: 'in', label: 'In' },
    { value: '=', label: translate('common.equal-to') },
    { value: '!=', label: translate('common.not-equal-to') },
  ];

  function onSubmit() {
    $filter.value = `(${chips.map((item) => `"${item}"`).join(', ')})`;
    handleSubmit();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && _value !== '') {
      e.preventDefault();
      e.stopPropagation();
      $filter.value = _value;
      handleSubmit();
    }
  }

  function handleClick(e: PointerEvent) {
    if (_value !== '') {
      e.preventDefault();
      $filter.value = _value;
      handleSubmit();
    }
  }
</script>

<form class="flex grow" on:submit|preventDefault={onSubmit}>
  {#if isInConditional(conditional)}
    <ChipInput
      label={$filter.attribute}
      labelHidden
      id="list-filter"
      bind:chips
      class="w-full"
      removeChipButtonLabel={(chip) =>
        translate('workflows.remove-keyword-label', { keyword: chip })}
      placeholder="{translate('common.enter')} {$filter.attribute}"
      external
    />
    <div class="flex h-fit items-center">
      <Button disabled={!chips.length} type="button">
        {translate('common.add')}
      </Button>
      <slot />
    </div>
  {:else}
    <Input
      label={$filter.attribute}
      labelHidden
      id="list-filter"
      type="search"
      placeholder={`${translate('common.enter')} ${$filter.attribute}`}
      icon="search"
      class="w-full"
      bind:value={_value}
      on:keydown={handleKeydown}
    />
    <slot />
  {/if}
</form>
<ConditionalMenu inputId="list-filter" {options} />
<Button class="w-full" size="sm" on:click={handleClick}
  >{translate('common.apply')}</Button
>
