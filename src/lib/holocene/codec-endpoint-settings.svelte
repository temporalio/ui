<script lang="ts">
  import { codecEndpoint } from '$lib/stores/data-encoder-config';
  import { dataEncoder } from '$lib/stores/data-encoder';

  import Checkbox from '$lib/holocene/checkbox.svelte';

  export let endpoint = '';
  export let passToken = false;
  export let error = '';
</script>

<div class="mb-8">
  <h3 class="text-lg" data-testid="data-encoder-endpoint-title">
    Remote Codec Endpoint
  </h3>
  <div class="flex flex-col gap-2">
    <Checkbox
      bind:checked={passToken}
      data-testid="data-encoder-pass-access-token"
      label="Pass access token"
      class="mt-2 mb-2 block h-5 w-full"
    />
    <textarea
      class="block w-full rounded-md border border-gray-200 p-2"
      rows={3}
      placeholder="Endpoint"
      data-testid="data-encoder-endpoint-input"
      bind:value={endpoint}
      on:keydown|stopPropagation
    />
    {#if error}
      <small data-testid="data-encoder-endpoint-error" class="text-red-700"
        >{error}</small
      >
    {/if}
    {#if $dataEncoder.settingsEndpoint}
      <div class="flex items-center justify-between">
        <p data-testid="data-encoder-site-endpoint">
          {$dataEncoder.settingsEndpoint}
        </p>
        <p data-testid="data-encoder-site-settings">Site setting</p>
      </div>
      {#if $codecEndpoint}
        <small class="text-yellow-700" data-testid="data-encoder-endpoint-info"
          >Set endpoint overrides site setting endpoint.</small
        >
      {/if}
    {/if}
  </div>
</div>
