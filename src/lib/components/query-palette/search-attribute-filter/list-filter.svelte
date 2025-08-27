<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isInConditional } from '$lib/utilities/is';
  import { formatListFilterValue } from '$lib/utilities/query/search-attribute-filter';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  import ConditionalMenu from './conditional-menu.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  let { children }: { children?: Snippet } = $props();

  let value = $state('');
  let conditional = $state('');
  let chips = $state<string[]>([]);

  $effect(() => {
    value = $filter.value;
    conditional = $filter.conditional;
    chips = formatListFilterValue(value);
  });

  const options = $derived([
    { value: 'in', label: 'In' },
    { value: '=', label: translate('common.equal-to') },
    { value: '!=', label: translate('common.not-equal-to') },
  ]);

  function onSubmit(e: Event) {
    e.preventDefault();
    $filter.value = `(${chips.map((item) => `"${item}"`).join(', ')})`;
    handleSubmit();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && value !== '') {
      e.preventDefault();
      e.stopPropagation();
      $filter.value = value;
      handleSubmit();
    }
  }

  function handleClick(e: PointerEvent) {
    if (value !== '') {
      e.preventDefault();
      $filter.value = value;
      handleSubmit();
    }
  }
</script>

<form class="flex grow" onsubmit={onSubmit}>
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
      <Button leadingIcon="add" type="button" />
      {@render children?.()}
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
      bind:value
      on:keydown={handleKeydown}
    />
    {@render children?.()}
  {/if}
</form>
<ConditionalMenu {options} />
<Button class="w-full" size="sm" on:click={handleClick} disabled={!value}
  >{translate('common.apply')}</Button
>
