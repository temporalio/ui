<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  export let port = '';
</script>

<Input
  class="w-96"
  placeholder="Port"
  id="data-encoder-port-input"
  bind:value={port}
  label="{translate('data-encoder', 'port-title')} ({translate('deprecated')})"
  hintText="*{translate('data-encoder', 'port-info')}"
/>
