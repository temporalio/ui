<script lang="ts" context="module">
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    codecEndpoint,
    includeCredentials,
    overrideRemoteCodecConfiguration,
    passAccessToken,
  } from '$lib/stores/data-encoder-config';
  import { refresh } from '$lib/stores/workflow-run';
  import { validateHttpOrHttps, validateHttps } from '$lib/utilities/is-http';

  import CodecEndpointSettings from './codec-endpoint-settings.svelte';

  export const viewDataEncoderSettings = writable<boolean>(false);
</script>

<script lang="ts">
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { trimTrailingSlash } from '$lib/utilities/trim-trailing-slash';

  let className = '';
  export { className as class };

  let endpoint = $codecEndpoint ?? '';
  let passToken = $passAccessToken ?? false;
  let includeCreds = $includeCredentials ?? false;
  let override = writable($overrideRemoteCodecConfiguration);

  $: error = '';
  $: namespaceOrCluster = $page.data?.settings?.runtimeEnvironment?.isCloud
    ? translate('common.namespaces')
    : translate('common.cluster');

  $: {
    if (passToken && !validateHttps(endpoint)) {
      error = translate('data-encoder.access-token-https-error');
    } else if (endpoint && !validateHttpOrHttps(endpoint)) {
      error = translate('data-encoder.prefix-error');
    } else {
      error = '';
    }
  }

  $: if (!$viewDataEncoderSettings) {
    onCancel();
  }

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

    if ($page.url.pathname.endsWith('history')) {
      $refresh = Date.now();
    }
  };
</script>

{#if $viewDataEncoderSettings}
  <aside
    in:fly={{ y: -50, delay: 0, duration: 500 }}
    class={merge(
      'surface-primary relative flex h-[540px] w-full flex-col gap-6 overflow-auto border-b border-subtle p-4 md:p-12',
      className,
    )}
  >
    <div class="flex w-full flex-col gap-4 xl:w-1/2">
      <div class="flex items-center justify-between space-x-2">
        <h3 data-testid="data-encoder-title">
          {translate('common.codec-server')}
        </h3>
      </div>
      <p class="text-sm">
        {translate('data-encoder.codec-server-description-prefix')}<Link
          href="https://docs.temporal.io/dataconversion#codec-server"
          newTab>{translate('common.codec-server')}</Link
        >
        {translate('data-encoder.codec-server-description-suffix', {
          level: namespaceOrCluster,
        })}
      </p>
      <Accordion
        data-testid="override-accordion"
        title={$override
          ? translate('data-encoder.browser-override-description', {
              level: namespaceOrCluster,
            })
          : translate('data-encoder.no-browser-override-description', {
              level: namespaceOrCluster,
            })}
        subtitle={!$override ? $page?.data?.settings?.codec?.endpoint : ''}
      >
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
      </Accordion>
      <CodecEndpointSettings
        bind:endpoint
        bind:passToken
        bind:includeCreds
        {error}
      />
      <div class="flex items-center gap-4">
        <Button
          disabled={Boolean(error)}
          data-testid="confirm-data-encoder-button"
          on:click={onConfirm}
          type="submit">{translate('common.apply')}</Button
        >
        <Button
          variant="ghost"
          data-testid="cancel-data-encoder-button"
          on:click={onCancel}>{translate('common.cancel')}</Button
        >
      </div>
    </div>
  </aside>
{/if}
