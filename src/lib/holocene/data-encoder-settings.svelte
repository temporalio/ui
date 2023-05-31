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

  import CodecEndpointSettings from './codec-endpoint-settings.svelte';
  import DataConverterPortSettings from './data-converter-port-settings.svelte';
  import { page } from '$app/stores';
  import { refresh } from '$lib/stores/workflow-run';
  import Button from './button.svelte';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import ToggleSwitch from './toggle-switch.svelte';
  import Input from './input/input.svelte';

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
    in:fly={{ y: -50, delay: 0, duration: 500 }}
    class="relative w-full h-auto p-12 bg-blue-50 border-b border-blue-100 flex flex-col gap-6"
  >
    <div class="flex items-center justify-between space-x-2">
      <h3 data-testid="data-encoder-title" class="text-xl">Codec Server</h3>
      <div class="flex items-center gap-2">
        <Button thin variant="secondary" on:click={onClear}>Clear</Button>
        <Button
          thin
          disabled={Boolean(error)}
          testId="confirm-codec-settings-button"
          on:click={onConfirm}
          type="submit">Apply</Button
        >
      </div>
    </div>
    <div class="border-2 border-gray-900 bg-white rounded-xl p-2">
      <div class="flex flex-col gap-2 mb-6">
        <h3 class="text-lg" data-testid="data-encoder-local-settings-title">
          Local Settings
        </h3>
        <p>
          Configure the Codec Server settings to be applied globally across all
          Namespaces in your current browser.
        </p>
        <p class="text-red-700">
          <strong>Warning!</strong> Local settings will override all configuration
          settings below.
        </p>
      </div>
      <CodecEndpointSettings
        bind:endpoint
        bind:passToken
        bind:includeCreds
        {error}
      />
    </div>
    {#if $dataEncoder.settingsEndpoint}
      <div class="border-2 border-gray-900 bg-white rounded-xl p-2">
        <div class="flex flex-col gap-4">
          <h3 class="text-lg" data-testid="data-encoder-endpoint-title">
            Configuration Settings
          </h3>
          <div class="flex flex-col gap-2">
            <h3 class="text-lg" data-testid="data-encoder-endpoint-title">
              Remote codec endpoint
            </h3>
            <textarea
              class="block w-full rounded-md border-2 border-gray-900 p-2 cursor-not-allowed"
              disabled
              rows={3}
              data-testid="data-encoder-configuration-endpoint"
              value={$dataEncoder.settingsEndpoint}
            />
            <label
              for="configuration-pass-access-token"
              class="flex items-center gap-4 font-secondary text-sm"
              ><ToggleSwitch
                id="configuration-pass-access-token"
                disabled
                checked={$dataEncoder.settingsPassAccessToken}
                data-testid="data-encoder-configuration-pass-access-token"
              />Pass the user access token with your endpoint.
            </label>
            <label
              for="configuration-include-credentials"
              class="flex items-center gap-4 font-secondary text-sm"
              ><ToggleSwitch
                id="configuration-include-credentials"
                disabled
                checked={$dataEncoder.settingsIncludeCredentials}
                data-testid="data-encoder-configuration-include-credentials"
              />Include cross-origin credentials.
            </label>
          </div>
        </div>
      </div>
    {/if}
    <DataConverterPortSettings bind:port />
    <p data-testid="data-encoder-info">
      *If both are set, the remote codec endpoint will be used.
    </p>
  </div>
{/if}
