<script lang="ts" module>
  import { writable } from 'svelte/store';

  export const viewDataEncoderSettings = writable<boolean>(false);
</script>

<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';

  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    codecEndpoint,
    includeCredentials,
    overrideRemoteCodecConfiguration,
    passAccessToken,
  } from '$lib/stores/data-encoder-config';
  import { refresh } from '$lib/stores/workflow-run';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';
  import { trimTrailingSlash } from '$lib/utilities/trim-trailing-slash';

  import CodecEndpointSettings from './codec-endpoint-settings.svelte';

  let endpoint = $state($codecEndpoint ?? '');
  let passToken = $state($passAccessToken ?? false);
  let includeCreds = $state($includeCredentials ?? false);
  let error = $state('');
  let override = writable($overrideRemoteCodecConfiguration);
  let namespaceOrCluster = page.data?.settings?.runtimeEnvironment?.isCloud
    ? translate('common.namespaces')
    : translate('common.cluster');

  $effect(() => {
    if (passToken && !validateHttps(endpoint)) {
      error = translate('data-encoder.access-token-https-error');
    } else if (endpoint && !validateHttpOrHttps(endpoint)) {
      error = translate('data-encoder.prefix-error');
    } else {
      error = '';
    }
  });

  $effect(() => {
    if (!$viewDataEncoderSettings) {
      onCancel();
    }
  });

  const confirmDisabled = $derived(!!error || ($override && !endpoint));

  const onCancel = () => {
    endpoint = $codecEndpoint;
    passToken = $passAccessToken;
    includeCreds = $includeCredentials;
    $override = $overrideRemoteCodecConfiguration;
    $viewDataEncoderSettings = false;
  };

  const onConfirm = () => {
    error = '';
    $codecEndpoint = endpoint ? trimTrailingSlash(endpoint) : endpoint;
    $passAccessToken = passToken;
    $includeCredentials = includeCreds;
    $viewDataEncoderSettings = false;
    $overrideRemoteCodecConfiguration = $override;

    if (page.url.pathname.endsWith('history')) {
      $refresh = Date.now();
    }
  };

  const md = new MediaQuery('max-width:768px');
</script>

<Modal
  bind:open={$viewDataEncoderSettings}
  id="data-encoder-settings"
  cancelText={translate('common.cancel')}
  confirmText={translate('common.apply')}
  {confirmDisabled}
  on:cancelModal={onCancel}
  on:confirmModal={onConfirm}
  large
  {...md.current && { 'data-theme': 'dark' }}
>
  <h3 slot="title" data-testid="data-encoder-title">
    {translate('common.codec-server')}
  </h3>
  <div slot="content" class="flex w-full flex-col gap-4">
    <p class="text-sm">
      {translate('data-encoder.codec-server-description-prefix')}<Link
        href="https://docs.temporal.io/dataconversion#codec-server"
        newTab>{translate('common.codec-server')}</Link
      >
      {translate('data-encoder.codec-server-description-suffix', {
        level: namespaceOrCluster,
      })}
    </p>

    <RadioGroup name="override" group={override}>
      <RadioInput
        id="use-configuration-endpoint-radio"
        data-testid="use-configuration-endpoint-input"
        value={false}
        label={translate('data-encoder.no-browser-override-description', {
          level: namespaceOrCluster,
        })}
      />
      <RadioInput
        id="use-local-endpoint-radio"
        data-testid="use-local-endpoint-input"
        value={true}
        label={translate('data-encoder.browser-override-description', {
          level: namespaceOrCluster,
        })}
      />
    </RadioGroup>

    {#if $override}
      <CodecEndpointSettings
        bind:endpoint
        bind:passToken
        bind:includeCreds
        {error}
      />
    {/if}
  </div>
</Modal>
