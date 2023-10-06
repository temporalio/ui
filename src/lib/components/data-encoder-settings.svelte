<script lang="ts" context="module">
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { clickOutside } from '$lib/holocene/outside-click';
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
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';

  let endpoint = $codecEndpoint ?? '';
  let port = $dataConverterPort ?? '';
  let passToken = $passAccessToken ?? false;
  let includeCreds = $includeCredentials ?? false;
  let override = writable($overrideRemoteCodecConfiguration);

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
    $override = $overrideRemoteCodecConfiguration;
    $viewDataEncoderSettings = false;
  };

  const onConfirm = () => {
    error = '';
    $codecEndpoint = endpoint;
    $passAccessToken = passToken;
    $includeCredentials = includeCreds;
    $dataConverterPort = port;
    $viewDataEncoderSettings = false;
    $overrideRemoteCodecConfiguration = $override;

    if ($page.url.pathname.endsWith('history')) {
      $refresh = Date.now();
    }
  };
</script>

{#if $viewDataEncoderSettings}
  <aside
    use:clickOutside
    on:click-outside={() => ($viewDataEncoderSettings = false)}
    in:fly={{ y: -50, delay: 0, duration: 500 }}
    class="relative flex h-auto w-full flex-col gap-6 border-b border-blue-100 bg-blue-50 p-12"
  >
    <div class="flex w-full flex-col gap-4 xl:w-1/2">
      <div class="flex items-center justify-between space-x-2">
        <h3 data-testid="data-encoder-title" class="text-xl">
          {translate('codec-server')}
        </h3>
      </div>
      <p class="text-sm">
        {translate('data-encoder', 'codec-server-description-prefix')}<Link
          href="https://docs.temporal.io/dataconversion#codec-server"
          newTab>{translate('codec-server')}</Link
        >
        {translate('data-encoder', 'codec-server-description-suffix', {
          level: namespaceOrCluster,
        })}
      </p>
      <Accordion
        data-testid="override-accordion"
        title={$override
          ? translate('data-encoder', 'browser-override-description', {
              level: namespaceOrCluster,
            })
          : translate('data-encoder', 'no-browser-override-description', {
              level: namespaceOrCluster,
            })}
      >
        <RadioGroup name="override" group={override}>
          <RadioInput
            id="use-configuration-endpoint-radio"
            value={false}
            label={translate(
              'data-encoder',
              'no-browser-override-description',
              {
                level: namespaceOrCluster,
              },
            )}
          />
          <RadioInput
            id="use-local-endpoint-radio"
            value={true}
            label={translate('data-encoder', 'browser-override-description', {
              level: namespaceOrCluster,
            })}
          />
        </RadioGroup>
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
          disabled={Boolean(error)}
          data-testid="confirm-data-encoder-button"
          on:click={onConfirm}
          type="submit">{translate('apply')}</Button
        >
        <Button
          variant="ghost"
          data-testid="cancel-data-encoder-button"
          on:click={onCancel}>{translate('cancel')}</Button
        >
      </div>
    </div>
  </aside>
{/if}
