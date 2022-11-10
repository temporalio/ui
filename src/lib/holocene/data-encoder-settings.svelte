<script lang="ts">
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import {
    codecEndpoint,
    passAccessToken,
  } from '$lib/stores/data-encoder-config';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';

  import Modal from '$holocene/modal.svelte';
  import Button from '$holocene/button.svelte';
  import Checkbox from '$holocene/checkbox.svelte';

  export let showSettings: boolean;
  export let onCancel: () => void;

  let endpoint: string = '';
  let passToken: boolean = false;
  let port: string = '';
  $: error = '';

  const onEndpointSet = () => {
    if (!validateHttpOrHttps(endpoint)) {
      error = 'Endpoint must start with http:// or https://';
      return;
    }

    if (passToken && !validateHttps(endpoint)) {
      error = 'Endpoint must be https:// if passing access token';
      return;
    }

    $codecEndpoint = endpoint;
    $passAccessToken = passToken;
    error = '';
  };

  const onPortSet = () => {
    $dataConverterPort = port;
  };

  const onEndpointClear = () => {
    endpoint = '';
    $codecEndpoint = null;
    $passAccessToken = passToken = false;
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
  cancelText="Done"
>
  <h3 slot="title" data-cy="data-encoder-title" tabindex={0} autofocus>
    Data Encoder
  </h3>

  <div slot="content">
    {#if $dataEncoder.endpoint}
      <div class="mb-4">
        <h3 class="font-medium" data-cy="data-encoder-endpoint-title">
          Remote Codec Endpoint
        </h3>

        {#if $codecEndpoint}
          <div class="flex items-center justify-between">
            <Checkbox
              bind:checked={passToken}
              data-cy="data-encoder-pass-access-token"
              label="Pass access token"
              class="w-80 h-5 mt-2 mb-2"
              disabled={true}
            />
            <p data-cy="data-encoder-endpoint">{$dataEncoder.endpoint}</p>
            <Button
              variant="secondary"
              on:click={onEndpointClear}
              dataCy="data-encoder-clear-endpoint">Clear</Button
            >
          </div>
        {:else}
          <form on:submit|preventDefault={onEndpointSet}>
            <input
              class="block w-80 rounded-md border border-gray-200 p-2"
              placeholder="Endpoint"
              data-cy="data-encoder-endpoint-input"
              bind:value={endpoint}
            />
            <Button
              variant="secondary"
              on:click={onEndpointSet}
              dataCy="data-encoder-set-endpoint">Set</Button
            >
          </form>
        {/if}
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
          {#if $codecEndpoint}
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
        <form on:submit|preventDefault={onEndpointSet}>
          <Checkbox
            bind:checked={passToken}
            data-cy="data-encoder-pass-access-token"
            label="Pass access token"
            class="w-80 h-5 mt-2 mb-2"
          />
          <input
            class="block w-80 rounded-md border border-gray-200 p-2"
            placeholder="Endpoint"
            data-cy="data-encoder-endpoint-input"
            bind:value={endpoint}
          />
          <Button
            variant="secondary"
            on:click={onEndpointSet}
            dataCy="data-encoder-set-endpoint">Set</Button
          >
        </form>
        {#if error}
          <small data-cy="data-encoder-endpoint-error" class="text-red-700"
            >{error}</small
          >
        {/if}
      </div>
    {/if}
    {#if $dataConverterPort}
      <div class="my-4">
        <h3 class="mb-1 font-medium" data-cy="data-encoder-port-title">
          tctl plugin port <span
            class="rounded-lg bg-orange-100 px-1 text-orange-500"
            >DEPRECATED</span
          >
        </h3>
        <div class="flex items-center justify-between">
          <p data-cy="data-encoder-port">{$dataConverterPort}</p>
          <Button
            variant="secondary"
            on:click={onPointClear}
            dataCy="data-encoder-clear-port">Clear</Button
          >
        </div>
      </div>
    {:else}
      <div class="my-4">
        <h3 class="mb-1 font-medium" data-cy="data-encoder-port-title">
          tctl plugin port <span
            class="rounded-lg bg-orange-100 px-1 text-orange-500"
            >DEPRECATED</span
          >
        </h3>
        <form on:submit|preventDefault={onPortSet}>
          <input
            class="block w-80 rounded-md border border-gray-200 p-2"
            placeholder="Port"
            data-cy="data-encoder-port-input"
            bind:value={port}
          />
          <Button
            variant="secondary"
            on:click={onPortSet}
            dataCy="data-encoder-set-port"
            >Set
          </Button>
        </form>
      </div>
    {/if}
    <div>
      <small data-cy="data-encoder-info"
        >If both are set, the Remote Codec Endpoint will be used.</small
      >
    </div>
  </div>
</Modal>

<style lang="postcss">
  form {
    @apply flex items-center justify-between flex-wrap;
  }
</style>
