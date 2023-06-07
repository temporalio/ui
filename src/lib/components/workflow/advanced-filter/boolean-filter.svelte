<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import { translate } from '$lib/i18n/translate';

  export let value = 'true';
</script>

<div class="flex gap-2">
  <Select id="workflow-status" bind:value class="w-20">
    <Option value="true">{translate('true')}</Option>
    <Option value="false">{translate('false')}</Option>
  </Select>
</div>
