<script lang="ts">
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { sdkInfo } from '$lib/stores/events';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  const supportedVersions = [
    {
      sdk: 'Go',
      version: '1.41.0',
      href: 'https://github.com/temporalio/sdk-go/releases/tag/v1.41.0',
    },
    {
      sdk: 'Python',
      version: '1.20.0',
      href: 'https://github.com/temporalio/sdk-python/releases/tag/1.20.0',
    },
    {
      sdk: 'TypeScript',
      version: '1.14.0',
      href: 'https://github.com/temporalio/sdk-typescript/releases/tag/v1.14.0',
    },
    {
      sdk: '.NET',
      version: '1.10.0',
      href: 'https://github.com/temporalio/sdk-dotnet/releases/tag/1.10.0',
    },
    {
      sdk: 'Ruby',
      version: '1.1.0',
      href: 'https://github.com/temporalio/sdk-ruby/releases/tag/v1.1.0',
    },
  ];
  const currentSdk = $derived(
    supportedVersions.find(
      ({ sdk }) => sdk.toLowerCase() === $sdkInfo.sdk.toLowerCase(),
    ),
  );
</script>

<div
  class="my-12 flex w-full flex-col items-center justify-start gap-4"
  data-testid="worker-heartbeats-sdk-warning"
  aria-live="polite"
>
  <span class="flex h-20 w-20 items-center justify-center rounded-full">
    <Icon name="heartbeat" class="block h-full w-full text-blue-200" />
  </span>
  <div class="text-center">
    <h5>{translate('workers.no-worker-heartbeats')}</h5>
    {#if currentSdk}
      {@const { href, sdk, version } = currentSdk}
      {#if !minimumVersionRequired(version, $sdkInfo.version)}
        <p class="flex flex-row gap-1 text-secondary">
          {translate('workers.worker-heartbeats-sdk-link-preface')}
          <Link newTab {href}>
            <SdkLogo {sdk} {version} hideDocsLink />
          </Link>
          {translate('workers.worker-heartbeats-sdk-link-postface')}
        </p>
      {/if}
    {:else}
      <p class="text-secondary">
        {translate('workers.worker-heartbeats-sdk-list-preface')}
      </p>
      <div
        class="mt-4 flex flex-row flex-wrap items-center justify-center gap-4"
      >
        {#each supportedVersions as { href, sdk, version } (`${sdk}:${version}`)}
          <Link newTab {href}>
            <SdkLogo {sdk} {version} hideDocsLink />
          </Link>
        {/each}
      </div>
    {/if}
  </div>
</div>
