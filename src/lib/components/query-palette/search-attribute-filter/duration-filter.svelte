<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isValidDurationQuery } from '$lib/utilities/to-duration';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  import ConditionalMenu from './conditional-menu.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  $: ({ value } = $filter);
  $: _value = value;

  let isValid = true;

  const handleKeydown = (e: KeyboardEvent) => {
    const newValue = _value.trim();
    if (isValid && e.key === 'Enter' && newValue !== '') {
      $filter.value = newValue;
      e.preventDefault();
      handleSubmit();
    }
  };

  function handleClick(e: PointerEvent) {
    if (_value !== '') {
      e.preventDefault();
      $filter.value = _value;
      handleSubmit();
    }
  }

  const validateDuration = (event: Event & { target: HTMLInputElement }) => {
    if (isValidDurationQuery(event.target.value.trim())) {
      isValid = true;
    } else {
      isValid = false;
    }
  };
</script>

<Input
  label={$filter.attribute}
  labelHidden
  id="duration-filter"
  type="search"
  placeholder={`${translate('common.enter')} ${
    $filter.attribute
  } (${translate('workflows.duration-filter-placeholder')})`}
  icon="search"
  class="w-full"
  bind:value={_value}
  on:keydown={handleKeydown}
  on:input={validateDuration}
  valid={isValid}
/>
<ConditionalMenu />
<Button class="w-full" size="sm" on:click={handleClick}
  >{translate('common.apply')}</Button
>
