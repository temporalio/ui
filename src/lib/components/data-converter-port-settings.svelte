<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  export let port = '';
</script>

<div class="my-4">
  <h3 class="text-lg" data-testid="data-encoder-port-title">
    {translate('data-encoder', 'port-title')}<span
      class="rounded-lg bg-orange-100 px-1 text-sm text-orange-900"
      >{translate('deprecated')}</span
    >
  </h3>
  <div class="flex gap-2">
    <input
      class="block w-24 rounded-xl border-2 border-gray-900 p-2"
      placeholder="Port"
      data-testid="data-encoder-port-input"
      bind:value={port}
      on:keydown|stopPropagation
    />
    <p data-testid="data-encoder-info" class="text-sm w-[220px]">
      {translate('data-encoder', 'port-info')}
    </p>
  </div>
</div>
