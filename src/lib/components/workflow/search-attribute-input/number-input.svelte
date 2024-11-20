<script lang="ts">
  import { afterUpdate } from 'svelte';

  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeInputValue } from '$lib/stores/search-attributes';

  export let value: SearchAttributeInputValue;
  $: _value = getValue(value);

  afterUpdate(() => {
    value = _value;
  });

  function getValue(value: SearchAttributeInputValue) {
    const _numValue = Number(value);
    const isZero = value === 0 || value === '0';
    if (_numValue || isZero) return _numValue;
    return null;
  }
</script>

<NumberInput
  label={translate('common.value')}
  id="attribute-value"
  bind:value={_value}
/>
