<script lang="ts">
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import {
    codecEndpoint,
    passAccessToken,
    passCredentials,
  } from '$lib/stores/data-encoder-config';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';

  import Modal from '$lib/holocene/modal.svelte';
  import CodecEndpointSettings from './codec-endpoint-settings.svelte';
  import DataConverterPortSettings from './data-converter-port-settings.svelte';

  export let showSettings: boolean;
  export let onClose: () => void;

  let endpoint = $codecEndpoint ?? '';
  let port = $dataConverterPort ?? '';
  let passToken = $passAccessToken ?? false;
  let passCreds = $passCredentials ?? false;

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
    passCreds = $passCredentials ?? false;
    onClose();
  };

  const onConfirm = () => {
    error = '';
    $codecEndpoint = endpoint;
    $passAccessToken = passToken;
    $passCredentials = passCreds;
    $dataConverterPort = port;
    onClose();
  };
</script>

<Modal
  open={showSettings}
  on:cancelModal={onCancel}
  on:confirmModal={onConfirm}
  cancelText="Cancel"
  confirmDisabled={Boolean(error)}
>
  <h3 slot="title" data-testid="data-encoder-title">Data Encoder</h3>
  <div slot="content">
    <CodecEndpointSettings
      bind:endpoint
      bind:passToken
      bind:passCreds
      {error}
    />
    <DataConverterPortSettings bind:port />
    <p data-testid="data-encoder-info">
      *If both are set, the remote codec endpoint will be used.
    </p>
  </div>
</Modal>
