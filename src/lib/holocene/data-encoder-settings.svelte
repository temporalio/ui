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
    overrideRemoteCodecConfiguration,
  } from '$lib/stores/data-encoder-config';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';
  import { clickOutside } from '$lib/holocene/outside-click';

  import CodecEndpointSettings from './codec-endpoint-settings.svelte';
  import DataConverterPortSettings from './data-converter-port-settings.svelte';
  import { page } from '$app/stores';
  import { refresh } from '$lib/stores/workflow-run';
  import Button from './button.svelte';
  import Accordion from './accordion.svelte';

  let endpoint = $codecEndpoint ?? '';
  let port = $dataConverterPort ?? '';
  let passToken = $passAccessToken ?? false;
  let includeCreds = $includeCredentials ?? false;
  let override = $overrideRemoteCodecConfiguration ?? false;

  $: editing =
    endpoint !== $codecEndpoint ||
    passToken !== $passAccessToken ||
    includeCreds !== $includeCredentials ||
    port !== $dataConverterPort ||
    override !== $overrideRemoteCodecConfiguration;

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

  $: if (!$viewDataEncoderSettings) {
    onReset();
  }

  const onReset = () => {
    endpoint = $codecEndpoint;
    port = $dataConverterPort;
    passToken = $passAccessToken;
    includeCreds = $includeCredentials;
    override = $overrideRemoteCodecConfiguration;
    // $viewDataEncoderSettings = false;
  };

  const onConfirm = () => {
    error = '';
    $codecEndpoint = endpoint;
    $passAccessToken = passToken;
    $includeCredentials = includeCreds;
    $dataConverterPort = port;
    $overrideRemoteCodecConfiguration = override;
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
    <div class="w-full xl:w-1/2 flex flex-col gap-4">
      <div class="flex items-center justify-between space-x-2">
        <h3 data-testid="data-encoder-title" class="text-xl">Codec Server</h3>
      </div>
      <p class="text-sm">
        The Codec Server uses a remote codec endpoint to decrypt your payloads,
        ensuring that Temporal never sees your data. A remote codec endpoint can
        be set at the Namespace-level, or locally in your browser.
      </p>
      <Accordion
        data-testid="override-accordion"
        title={override
          ? 'Uses my local setting and ignores Namespace-level settings.'
          : 'Uses Namespace-level settings, where available.'}
      >
        <label
          class="flex flex-row items-center gap-2 cursor-pointer"
          for="use-configuration-endpoint-radio"
        >
          <input
            on:click={() => (override = false)}
            class="w-4 h-4 accent-gray-900"
            type="radio"
            checked={!override}
            name="use-configuration-endpoint"
            id="use-configuration-endpoint-radio"
            data-testid="use-configuration-endpoint-input"
          />
          Uses Namespace-level settings, where available. Otherwise, use my local
          setting.
        </label>
        <label
          class="flex flex-row items-center gap-2 cursor-pointer"
          for="use-local-endpoint-radio"
        >
          <input
            on:click={() => (override = true)}
            class="w-4 h-4 accent-gray-900"
            type="radio"
            checked={override}
            name="use-local-endpoint"
            id="use-local-endpoint-radio"
            data-testid="use-local-endpoint-input"
          />
          Uses my local setting and ignores Namespace-level settings.
        </label>
      </Accordion>
      <CodecEndpointSettings
        bind:endpoint
        bind:passToken
        bind:includeCreds
        {error}
      />
      <DataConverterPortSettings bind:port />
      <div class="flex items-center gap-4">
        <Button
          thin
          disabled={Boolean(error)}
          testId="confirm-data-encoder-button"
          on:click={onConfirm}
          type="submit">Apply</Button
        >
        <Button
          thin
          variant="link"
          disabled={!editing}
          testId="reset-data-encoder-button"
          on:click={onReset}>Reset</Button
        >
      </div>
    </div>
  </div>
{/if}
