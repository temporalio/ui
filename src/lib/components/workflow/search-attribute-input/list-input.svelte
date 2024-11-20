<script lang="ts">
  import { afterUpdate, onMount } from 'svelte';

  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeInputValue } from '$lib/stores/search-attributes';

  export let value: SearchAttributeInputValue;
  let _value = [];

  afterUpdate(() => {
    value = _value;
  });

  onMount(() => {
    _value = getInitialValue(value);
  });

  function getInitialValue(value: SearchAttributeInputValue) {
    if (!value) return [];
    if (typeof value === 'string' || typeof value === 'number') return [];
    return value;
  }
</script>

<ChipInput
  label={translate('common.value')}
  id="attribute-value"
  bind:chips={_value}
  class="w-full"
  removeChipButtonLabel={(chip) =>
    translate('workflows.remove-keyword-label', { keyword: chip })}
/>
