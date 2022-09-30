<script lang="ts">
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';

  import Modal from '$holocene/modal.svelte';
  import Button from '$holocene/button.svelte';

  export let showSettings: boolean;
  export let passAccessToken: boolean;
  export let onCancel: () => void;

  let endpoint: string = '';
  let port: string = '';
  $: error = '';

  const checkForHttps = () => {
    if (validateHttps(endpoint)) {
      $dataEncoderEndpoint = endpoint;
      error = '';
    } else {
      error = 'Endpoint must start with https:// to authenticate';
    }
  };
  const onEndpointSet = () => {
    if (validateHttpOrHttps(endpoint)) {
      if (passAccessToken) {
        checkForHttps();
      } else {
        $dataEncoderEndpoint = endpoint;
        error = '';
      }
    } else {
      error = 'Endpoint must start with http:// or https://';
    }
  };

  const onEndpointClear = () => {
    endpoint = '';
    $dataEncoderEndpoint = null;
  };

  const onPointClear = () => {
    port = '';
    $dataConverterPort = null;
  };
</script>

<Modal
  open={showSettings}
  hideConfirm
  on:cancelModal={onCancel}
  on:confirmModal={onCancel}
>
  <h3 slot="title" data-cy="data-encoder-title">Data Encoder</h3>
  <div slot="content">
    {#if $dataEncoder.endpoint}
      <div class="mb-4">
        <h3 class="font-medium" data-cy="data-encoder-endpoint-title">
          Remote Codec Endpoint
        </h3>
        <div class="flex items-center justify-between">
          {#if $dataEncoderEndpoint}
            <p data-cy="data-encoder-endpoint">{$dataEncoder.endpoint}</p>
            <Button
              variant="secondary"
              on:click={onEndpointClear}
              data-cy="data-encoder-clear-endpoint">Clear</Button
            >
          {:else}
            <input
              class="block w-80 rounded-md border border-gray-200 p-2"
              placeholder="Endpoint"
              data-cy="data-encoder-endpoint-input"
              bind:value={endpoint}
            />
            <Button
              variant="secondary"
              on:click={onEndpointSet}
              data-cy="data-encoder-set-endpoint">Set</Button
            >
          {/if}
        </div>
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
    {:else}
      <div class="mb-4">
        <h3 class="font-medium" data-cy="data-encoder-endpoint-title">
          Remote Codec Endpoint
        </h3>
        <div class="flex items-center justify-between">
          <input
            class="block w-80 rounded-md border border-gray-200 p-2"
            placeholder="Endpoint"
            data-cy="data-encoder-endpoint-input"
            bind:value={endpoint}
          />
          <Button
            variant="secondary"
            on:click={onEndpointSet}
            data-cy="data-encoder-set-endpoint">Set</Button
          >
        </div>
        {#if error}
          <small data-cy="data-encoder-endpoint-error" class="text-red-700"
            >{error}</small
          >
        {/if}
      </div>
    {/if}
    {#if $dataConverterPort}
      <div class="my-4">
        <h3 class="font-medium" data-cy="data-encoder-port-title">
          tctl plugin port
        </h3>
        <div class="flex items-center justify-between">
          <p data-cy="data-encoder-port">{$dataConverterPort}</p>
          <Button
            variant="secondary"
            on:click={onPointClear}
            data-cy="data-encoder-clear-port">Clear</Button
          >
        </div>
      </div>
    {:else}
      <div class="my-4">
        <h3 class="font-medium" data-cy="data-encoder-port-title">
          tctl plugin port
        </h3>
        <div class="flex items-center justify-between">
          <input
            class="block w-80 rounded-md border border-gray-200 p-2"
            placeholder="Port"
            data-cy="data-encoder-port-input"
            bind:value={port}
          />
          <Button
            variant="secondary"
            on:click={() => ($dataConverterPort = port)}
            data-cy="data-encoder-set-port"
            >Set
          </Button>
        </div>
      </div>
    {/if}
    <div>
      <small data-cy="data-encoder-info"
        >If both are set, the Remote Codec Endpoint will be used.</small
      >
    </div>
  </div>
</Modal>
