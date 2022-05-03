<script lang="ts">
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
  import { dataEncoder } from '$lib/stores/data-encoder';

  import Modal from './modal.svelte';
  import Button from './button.svelte';

  export let showSettings: boolean;
  export let onCancel: () => void;

  let endpoint: string = '';
  let port: string = '';

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
  <h3 slot="title">Data Encoder</h3>
  <div slot="content">
    {#if $dataEncoder.endpoint}
      <div class="mb-4">
        <h3 class="font-medium">Remote Codec Endpoint</h3>
        <div class="flex items-center justify-between">
          {#if $dataEncoderEndpoint}
            <p>{$dataEncoder.endpoint}</p>
            <Button secondary on:click={onEndpointClear}>Clear</Button>
          {:else}
            <input
              class="block w-80 border border-gray-200 rounded-md p-2"
              placeholder="Endpoint"
              bind:value={endpoint}
            />
            <Button secondary on:click={() => ($dataEncoderEndpoint = endpoint)}
              >Set</Button
            >
          {/if}
        </div>
        {#if !$dataEncoderEndpoint}
          <div class="flex items-center justify-between mt-4">
            <p>{$dataEncoder.settingsEndpoint}</p>
            <p>Site setting</p>
          </div>
        {/if}
      </div>
    {:else}
      <div class="mb-4">
        <h3 class="font-medium">Remote Codec Endpoint</h3>
        <div class="flex items-center justify-between">
          <input
            class="block w-80 border border-gray-200 rounded-md p-2"
            placeholder="Endpoint"
            bind:value={endpoint}
          />
          <Button secondary on:click={() => ($dataEncoderEndpoint = endpoint)}
            >Set</Button
          >
        </div>
      </div>
    {/if}
    {#if $dataConverterPort}
      <div class="mb-4">
        <h3 class="font-medium">tctl plugin port</h3>
        <div class="flex items-center justify-between">
          <p>{$dataConverterPort}</p>
          <Button secondary on:click={onPointClear}>Clear</Button>
        </div>
      </div>
    {:else}
      <div class="mb-4">
        <h3 class="font-medium">tctl plugin port</h3>
        <div class="flex items-center justify-between">
          <input
            class="block w-80 border border-gray-200 rounded-md p-2"
            placeholder="Port"
            bind:value={port}
          />
          <Button secondary on:click={() => ($dataConverterPort = port)}
            >Set
          </Button>
        </div>
      </div>
    {/if}
  </div>
</Modal>
