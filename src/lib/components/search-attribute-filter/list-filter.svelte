<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isInConditional } from '$lib/utilities/is';
  import { formatListFilterValue } from '$lib/utilities/query/search-attribute-filter';

  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  const value = $derived($filter.value);
  const conditional = $derived($filter.conditional);
  let _value = $derived(value);
  let chips = $derived(formatListFilterValue(_value));
  const options = [
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
      $filter.value = _value;
      handleSubmit();
    }
  }
</script>

<form
  class="flex grow"
  onsubmit={(e) => {
    e.preventDefault();
    onSubmit();
  }}
>
  <ConditionalMenu inputId="list-filter" noBorderLeft {options}>
    {#if isInConditional(conditional)}
      <ChipInput
        label={$filter.attribute}
        labelHidden
        id="list-filter"
        bind:chips
        class="w-full [&_*]:border-l-0 [&_*]:border-r-0"
        removeChipButtonLabel={(chip) =>
          translate('workflows.remove-keyword-label', { keyword: chip })}
        placeholder="{translate('common.enter')} {$filter.attribute}"
        external
      />
      <div class="flex h-fit items-center">
        <Button disabled={!chips.length} type="submit">
          {translate('common.search')}
        </Button>
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
        class="w-full [&_*]:border-l-0"
        bind:value={_value}
        on:keydown={handleKeydown}
      />
      {@render children?.()}
    {/if}
  </ConditionalMenu>
</form>
