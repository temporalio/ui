<script lang="ts">
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeInputValue } from '$lib/stores/search-attributes';
  import { isNumber } from '$lib/utilities/is';

  export let value: SearchAttributeInputValue;
  let _value = value !== '' && isNumber(Number(value)) ? Number(value) : null;

  $: {
    value = _value;
  }
</script>

<NumberInput
  label={translate('common.value')}
  id="attribute-value"
  bind:value={_value}
/>
