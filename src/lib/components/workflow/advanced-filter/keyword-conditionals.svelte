<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import { translate } from '$lib/i18n/translate';

  export let conditional = '';

  const operations = {
    '=': translate('is'),
    '!=': translate('is-not'),
  };
</script>

<Select id="operator-filter" bind:value={conditional}>
  {#each Object.entries(operations) as [value, label] (value)}
    <Option {value}>{label}</Option>
  {/each}
</Select>
