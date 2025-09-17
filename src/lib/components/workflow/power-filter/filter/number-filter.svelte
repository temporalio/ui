<script lang="ts">
  import { getContext } from 'svelte';

  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from '../filter.svelte';

  import ConditionalMenu from './conditional-menu.svelte';

  const { filter, focusedElementId, handleSubmit } =
    getContext<FilterContext>(FILTER_CONTEXT);
  const min = 0;

  $: ({ value } = $filter);
  $: _value = value ? Number(value) : null;

  const handleKeydown = (e: KeyboardEvent) => {
    $focusedElementId = '';
    if (e.key === 'Enter' && _value !== null && _value >= min) {
      $filter.value = String(_value);
      e.preventDefault();
      handleSubmit();
    }
  };
</script>

<ConditionalMenu inputId="number-filter" noBorderLeft>
  <NumberInput
    label={translate('common.number-input-placeholder')}
    labelHidden
    id="number-filter"
    icon="search"
    placeholder={translate('common.number-input-placeholder')}
    bind:value={_value}
    {min}
    on:keydown={handleKeydown}
    search
    class="-mr-2 [&_*]:border-l-0"
  />
</ConditionalMenu>
