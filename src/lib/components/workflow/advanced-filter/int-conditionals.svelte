<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import { translate } from '$lib/i18n/translate';

  export let conditional = '';

  const operations = {
    '=': translate('equals'),
    '>': translate('greater-than'),
    '>=': translate('greater-than-or-equal-to'),
    '<': translate('less-than'),
    '<=': translate('less-than-or-equal-to'),
  };
</script>

<Select id="int-operation-filter" bind:value={conditional}>
  {#each Object.entries(operations) as [value, label] (value)}
    <Option {value}>{label}</Option>
  {/each}
</Select>
