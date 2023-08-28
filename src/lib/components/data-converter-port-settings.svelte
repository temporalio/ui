<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  export let port = '';
</script>

<div class="my-4">
  <label
    class="text-lg"
    data-testid="data-encoder-port-title"
    for="data-encoder-port-input"
  >
    {translate('data-encoder', 'port-title')}<span
      class="rounded-lg bg-orange-100 px-1 text-sm text-orange-900"
      >{translate('deprecated')}</span
    >
  </label>
  <div class="flex gap-2">
    <Input
      class="w-24"
      placeholder="Port"
      id="data-encoder-port-input"
      bind:value={port}
      label={''}
      labelHidden
    />
    <p
      data-testid="data-encoder-info"
      class="text-sm w-[220px] before:content-['*']"
    >
      {translate('data-encoder', 'port-info')}
    </p>
  </div>
</div>
