<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  export const dataEncoderSettings = writable<Modal>(null);
</script>

<script lang="ts">
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import {
    codecEndpoint,
    passAccessToken,
  } from '$lib/stores/data-encoder-config';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';

  import Modal from '$lib/holocene/modal.svelte';
  import CodecEndpointSettings from './codec-endpoint-settings.svelte';
  import DataConverterPortSettings from './data-converter-port-settings.svelte';

  let endpoint = $codecEndpoint ?? '';
  let port = $dataConverterPort ?? '';
  let passToken = $passAccessToken ?? false;

  $: error = '';

  $: {
    if (passToken && !validateHttps(endpoint)) {
      error = 'Endpoint must be https:// if passing access token';
    } else if (endpoint && !validateHttpOrHttps(endpoint)) {
      error = 'Endpoint must start with http:// or https://';
    } else {
      error = '';
    }
  }

  const onCancel = () => {
    endpoint = $codecEndpoint ?? '';
    port = $dataConverterPort ?? '';
    passToken = $passAccessToken ?? false;
    $dataEncoderSettings.close();
  };

  const onConfirm = () => {
    error = '';
    $codecEndpoint = endpoint;
    $passAccessToken = passToken;
    $dataConverterPort = port;
    $dataEncoderSettings.close();
  };
</script>

<Modal
  bind:this={$dataEncoderSettings}
  on:cancelModal={onCancel}
  on:confirmModal={onConfirm}
  cancelText="Cancel"
  confirmDisabled={Boolean(error)}
>
  <h3 slot="title" data-testid="data-encoder-title">Data Encoder</h3>
  <div slot="content">
    <CodecEndpointSettings bind:endpoint bind:passToken {error} />
    <DataConverterPortSettings bind:port />
    <small data-testid="data-encoder-info"
      >If both are set, the Remote Codec Endpoint will be used.</small
    >
  </div>
</Modal>
