<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  export const dataEncoderSettings = writable<Modal>(null);
</script>

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
  import { page } from '$app/stores';
  import { refresh } from '$lib/stores/workflow-run';

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
    $dataEncoderSettings.close();
  };

  const onConfirm = () => {
    error = '';
    $codecEndpoint = endpoint;
    $passAccessToken = passToken;
    $passCredentials = passCreds;
    $dataConverterPort = port;
    $dataEncoderSettings.close();

    if ($page.url.pathname.endsWith('history')) {
      $refresh = Date.now();
    }
  };
</script>

<Modal
  bind:this={$dataEncoderSettings}
  on:cancelModal={onCancel}
  on:confirmModal={onConfirm}
  cancelText="Cancel"
  confirmDisabled={Boolean(error)}
>
  <h3 slot="title" data-testid="data-encoder-title">Codec Server</h3>
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
