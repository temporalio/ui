<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  import ConditionalMenu from './conditional-menu.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);
  const min = 0;

  let value = $state(null);

  $effect(() => {
    value = $filter?.value ? Number($filter.value) : null;
  });

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && value !== null && value >= min) {
      $filter.value = String(value);
      e.preventDefault();
      handleSubmit();
    }
  };

  function handleClick(e: PointerEvent) {
    if (value) {
      e.preventDefault();
      $filter.value = String(value);
      handleSubmit();
    }
  }
</script>

<NumberInput
  label={translate('common.number-input-placeholder')}
  labelHidden
  id="number-filter"
  icon="search"
  placeholder={translate('common.number-input-placeholder')}
  bind:value
  {min}
  on:keydown={handleKeydown}
  search
  class="w-full"
/>
<ConditionalMenu />
<Button class="w-full" size="sm" on:click={handleClick} disabled={!value}
  >{translate('common.apply')}</Button
>
