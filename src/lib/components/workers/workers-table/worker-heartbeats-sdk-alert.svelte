<script lang="ts">
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { sdkInfo } from '$lib/stores/events';

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
    supportedVersions.find(({ sdk }) => sdk === $sdkInfo.sdk),
  );
</script>

<Alert
  title={translate('workers.no-worker-heartbeats')}
  intent="info"
  class="max-w-screen-lg xl:w-2/3"
>
  <div class="mt-2 flex flex-col gap-2">
    {#if currentSdk}
      {@const { href, sdk, version } = currentSdk}
      <p class="flex flex-row gap-1">
        {translate('workers.worker-heartbeats-sdk-link-preface')}
        <Link newTab {href}>
          <SdkLogo {sdk} {version} />
        </Link>
        {translate('workers.worker-heartbeats-sdk-link-postface')}
      </p>
    {:else}
      <p>{translate('workers.worker-heartbeats-sdk-list-preface')}</p>
      {#each supportedVersions as { href, sdk, version } (`${sdk}:${version}`)}
        <Link newTab {href}>
          <SdkLogo {sdk} {version} />
        </Link>
      {/each}
    {/if}
  </div>
</Alert>
