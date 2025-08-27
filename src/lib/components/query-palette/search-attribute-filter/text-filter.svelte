<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { prefixSearchEnabled } from '$lib/stores/capability-enablement';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  import ConditionalMenu from './conditional-menu.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  let value = $state('');

  $effect(() => {
    value = $filter.value;
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && value !== '') {
      e.preventDefault();
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

  const options = $derived([
    { value: '=', label: translate('common.equal-to') },
    { value: '!=', label: translate('common.not-equal-to') },
    ...($prefixSearchEnabled && $filter.type === SEARCH_ATTRIBUTE_TYPE.KEYWORD
      ? [{ value: 'STARTS_WITH', label: translate('common.starts-with') }]
      : []),
  ]);
</script>

<Input
  label={$filter.attribute}
  labelHidden
  id="text-filter"
  type="search"
  placeholder={`${translate('common.enter')} ${$filter.attribute}`}
  icon="search"
  class="w-full"
  bind:value
  on:keydown={handleKeydown}
/>
<ConditionalMenu {options} />
<Button class="w-full" size="sm" on:click={handleClick}
  >{translate('common.apply')}</Button
>
