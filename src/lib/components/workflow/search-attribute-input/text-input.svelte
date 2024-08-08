<script lang="ts">
  import { afterUpdate } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeInputValue } from '$lib/stores/search-attributes';

  export let value: SearchAttributeInputValue;
  $: _value = value ? String(value) : null;

  afterUpdate(() => {
    value = _value;
  });
</script>

<Input
  label={translate('common.value')}
  id="attribute-value"
  class="grow"
  bind:value={_value}
/>
