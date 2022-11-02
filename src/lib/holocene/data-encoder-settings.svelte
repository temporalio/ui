<script lang="ts">
  import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';

  import Modal from '$holocene/modal.svelte';

  export let showSettings: boolean;
  export let passAccessToken: boolean;
  export let onCancel: () => void;

  let endpoint: string = $dataEncoderEndpoint ?? '';
  let error = '';

  const checkForHttps = () => {
    if (validateHttps(endpoint)) {
      $dataEncoderEndpoint = endpoint;
      error = '';
      onCancel();
    } else {
      error = 'Endpoint must start with https:// to authenticate';
    }
  };
  const onEndpointSet = () => {
    if (endpoint === '') {
      $dataEncoderEndpoint = null;
      onCancel();
    } else {
      if (validateHttpOrHttps(endpoint)) {
        if (passAccessToken) {
          checkForHttps();
        } else {
          $dataEncoderEndpoint = endpoint;
          error = '';
          onCancel();
        }
      } else {
        error = 'Endpoint must start with http:// or https://';
      }
    }
  };
</script>

<Modal
  open={showSettings}
  on:cancelModal={onCancel}
  on:confirmModal={onEndpointSet}
  confirmText="Set Endpoint"
>
  <h3 slot="title" data-cy="data-encoder-title">Data Encoder</h3>
  <div slot="content">
    <h3 class="font-medium" data-cy="data-encoder-endpoint-title">
      Remote Codec Endpoint
    </h3>
    <textarea
      class="block w-full rounded-md border border-gray-200 p-2"
      rows={3}
      placeholder="Endpoint"
      data-cy="data-encoder-endpoint-input"
      bind:value={endpoint}
    />
    {#if error}
      <small data-cy="data-encoder-endpoint-error" class="text-red-700"
        >{error}</small
      >
    {/if}
    {#if $dataEncoder.settingsEndpoint}
      <div class="mt-4 flex items-center justify-between">
        <p data-cy="data-encoder-site-endpoint">
          {$dataEncoder.settingsEndpoint}
        </p>
        <p data-cy="data-encoder-site-settings">Site setting</p>
      </div>
      {#if $dataEncoderEndpoint}
        <small class="text-yellow-700" data-cy="data-encoder-endpoint-info"
          >Set endpoint overrides site setting endpoint.</small
        >
      {/if}
    {/if}
  </div>
</Modal>
