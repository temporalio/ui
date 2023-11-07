<script lang="ts">
  import { getContext } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isValidDurationQuery } from '$lib/utilities/to-duration';

  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);
  let value = $filter.value;
  let isValid = true;

  const handleKeydown = (e: KeyboardEvent) => {
    if (isValid && e.key === 'Enter' && value !== '') {
      $filter.value = value.trim();
      e.preventDefault();
      handleSubmit();
    }
  };

  const validateDuration = (event: Event & { target: HTMLInputElement }) => {
    if (isValidDurationQuery(event.target.value.trim())) {
      isValid = true;
    } else {
      isValid = false;
    }
  };
</script>

<ConditionalMenu inputId="duration-filter-search" noBorderLeft />
<Input
  label={$filter.attribute}
  labelHidden
  id="duration-filter-search"
  type="search"
  placeholder={`${translate('common.enter')} ${$filter.attribute}`}
  icon="search"
  class="w-full"
  unroundLeft
  bind:value
  on:keydown={handleKeydown}
  on:input={validateDuration}
  valid={isValid}
/>
