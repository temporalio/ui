<script lang="ts" context="module">
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { clickoutside } from '$lib/holocene/outside-click';
  import { translate } from '$lib/i18n/translate';
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import {
    codecEndpoint,
    includeCredentials,
    overrideRemoteCodecConfiguration,
    passAccessToken,
  } from '$lib/stores/data-encoder-config';
  import { refresh } from '$lib/stores/workflow-run';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';

  import CodecEndpointSettings from './codec-endpoint-settings.svelte';
  import DataConverterPortSettings from './data-converter-port-settings.svelte';

  export const viewDataEncoderSettings = writable<boolean>(false);
</script>

<script lang="ts">
  let endpoint = $codecEndpoint ?? '';
  let port = $dataConverterPort ?? '';
  let passToken = $passAccessToken ?? false;
  let includeCreds = $includeCredentials ?? false;
  let override = $overrideRemoteCodecConfiguration ?? false;

  $: error = '';
  $: namespaceOrCluster = $page.data?.settings?.runtimeEnvironment?.isCloud
    ? translate('namespaces')
    : translate('cluster');

  $: {
    if (passToken && !validateHttps(endpoint)) {
      error = translate('data-encoder', 'access-token-https-error');
    } else if (endpoint && !validateHttpOrHttps(endpoint)) {
      error = translate('data-encoder', 'prefix-error');
    } else {
      error = '';
    }
  }

  $: if (!$viewDataEncoderSettings) {
    onCancel();
  }

  const onCancel = () => {
    endpoint = $codecEndpoint;
    port = $dataConverterPort;
    passToken = $passAccessToken;
    includeCreds = $includeCredentials;
    override = $overrideRemoteCodecConfiguration;
    $viewDataEncoderSettings = false;
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
  <aside
    use:clickoutside={() => ($viewDataEncoderSettings = false)}
    in:fly={{ y: -50, delay: 0, duration: 500 }}
    class="relative w-full h-auto p-12 bg-blue-50 border-b border-blue-100 flex flex-col gap-6"
  >
    <div class="w-full xl:w-1/2 flex flex-col gap-4">
      <div class="flex items-center justify-between space-x-2">
        <h3 data-testid="data-encoder-title" class="text-xl">
          {translate('codec-server')}
        </h3>
      </div>
      <p class="text-sm">
        {translate('data-encoder', 'codec-server-description-prefix')}<a
          rel="noreferrer"
          target="_blank"
          href="https://docs.temporal.io/dataconversion#codec-server"
          class="text-blue-700 underline decoration-blue-700"
          >{translate('codec-server')}</a
        >
        {translate('data-encoder', 'codec-server-description-suffix', {
          level: namespaceOrCluster,
        })}
      </p>
      <Accordion
        data-testid="override-accordion"
        title={override
          ? translate('data-encoder', 'browser-override-description', {
              level: namespaceOrCluster,
            })
          : translate('data-encoder', 'no-browser-override-description', {
              level: namespaceOrCluster,
            })}
      >
        <div class="flex flex-col gap-2">
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
            {translate('data-encoder', 'no-browser-override-description', {
              level: namespaceOrCluster,
            })}
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
            {translate('data-encoder', 'browser-override-description', {
              level: namespaceOrCluster,
            })}
          </label>
        </div>
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
          disabled={Boolean(error) || (override && !endpoint)}
          data-testid="confirm-data-encoder-button"
          on:click={onConfirm}
          type="submit">{translate('apply')}</Button
        >
        <Button
          thin
          variant="ghost"
          data-testid="cancel-data-encoder-button"
          on:click={onCancel}>{translate('cancel')}</Button
        >
      </div>
    </div>
  </aside>
{/if}
