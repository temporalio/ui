<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  export const viewDataEncoderSettings = writable<boolean>(false);
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import {
    codecEndpoint,
    passAccessToken,
    includeCredentials,
  } from '$lib/stores/data-encoder-config';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';
  import { clickOutside } from '$lib/holocene/outside-click';

  import CodecEndpointSettings from './codec-endpoint-settings.svelte';
  import DataConverterPortSettings from './data-converter-port-settings.svelte';
  import { page } from '$app/stores';
  import { refresh } from '$lib/stores/workflow-run';
  import Button from './button.svelte';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import Alert from './alert.svelte';

  let endpoint = $codecEndpoint ?? '';
  let port = $dataConverterPort ?? '';
  let passToken = $passAccessToken ?? false;
  let includeCreds = $includeCredentials ?? false;

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

  const onClear = () => {
    $codecEndpoint = '';
    endpoint = '';
    $dataConverterPort = '';
    port = '';
    $passAccessToken = false;
    passToken = false;
    $includeCredentials = false;
    includeCreds = false;
    $viewDataEncoderSettings = false;
  };

  const onConfirm = () => {
    error = '';
    $codecEndpoint = endpoint;
    $passAccessToken = passToken;
    $includeCredentials = includeCreds;
    $dataConverterPort = port;
    $viewDataEncoderSettings = false;

    if ($page.url.pathname.endsWith('history')) {
      $refresh = Date.now();
    }
  };
</script>

{#if $viewDataEncoderSettings}
  <div
    use:clickOutside
    on:click-outside={() => ($viewDataEncoderSettings = false)}
    in:fly={{ y: -50, delay: 0, duration: 500 }}
    class="relative w-full h-auto p-12 bg-blue-50 border-b border-blue-100 flex flex-col gap-6"
  >
    <div class="flex items-center justify-between space-x-2">
      <h3 data-testid="data-encoder-title" class="text-xl">Codec Server</h3>
      <div class="flex items-center gap-2">
        <Button
          thin
          variant="secondary"
          testId="clear-data-encoder-button"
          on:click={onClear}>Clear</Button
        >
        <Button
          thin
          disabled={(!endpoint && !port) || Boolean(error)}
          testId="confirm-data-encoder-button"
          on:click={onConfirm}
          type="submit">Apply</Button
        >
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <h3 class="text-lg" data-testid="data-encoder-local-settings-title">
        Local Settings
      </h3>
      <p>
        Configure the Codec Server settings to be applied globally across all
        Namespaces in your current browser.
      </p>
      {#if $dataEncoder.settingsEndpointOverridden}
        <Alert
          intent="warning"
          title="Local settings override all configuration settings"
          data-testid="local-override-warning"
        >
          <p>
            Once applied, local settings will apply to all namespaces regardless
            of configuration settings. Click <strong>Clear</strong> to use configuration
            settings.
          </p>
          <div class="flex items-center gap-2 mt-4">
            <p data-testid="data-encoder-configuration-settings">
              Configuration endpoint:
            </p>
            <p data-testid="data-encoder-configuration-endpoint">
              {$dataEncoder.settingsEndpoint}
            </p>
          </div>
        </Alert>
      {/if}
    </div>
    <CodecEndpointSettings
      bind:endpoint
      bind:passToken
      bind:includeCreds
      {error}
    />
    <DataConverterPortSettings bind:port />
  </div>
{/if}
