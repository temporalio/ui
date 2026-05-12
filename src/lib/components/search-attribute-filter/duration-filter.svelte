<script lang="ts">
  import { getContext } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isValidDurationQuery } from '$lib/utilities/to-duration';

  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  let _value = $derived($filter.value);
  let isValid = $state(true);

  const handleKeydown = (e: KeyboardEvent) => {
    const newValue = _value.trim();
    if (isValid && e.key === 'Enter' && newValue !== '') {
      $filter.value = newValue;
      e.preventDefault();
      handleSubmit();
    }
  };

  const validateDuration = (event: Event) => {
    if (!(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }

    isValid = isValidDurationQuery(event.currentTarget.value.trim());
  };
</script>

<ConditionalMenu inputId="duration-filter" noBorderLeft>
  <Input
    label={$filter.attribute}
    labelHidden
    id="duration-filter"
    type="search"
    placeholder={`${translate('common.enter')} ${
      $filter.attribute
    } (${translate('workflows.duration-filter-placeholder')})`}
    icon="search"
    class="w-full [&_*]:border-l-0"
    bind:value={_value}
    on:keydown={handleKeydown}
    on:input={validateDuration}
    valid={isValid}
  />
</ConditionalMenu>
