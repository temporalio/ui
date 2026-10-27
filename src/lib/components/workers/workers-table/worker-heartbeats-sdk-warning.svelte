<script lang="ts">
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconHeartbeat } from '$lib/io/icon';
  import { sdkInfo } from '$lib/stores/events';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  const supportedVersions = [
    {
      sdk: 'Go',
      version: '1.41.0',
      href: 'https://github.com/temporalio/sdk-go/releases',
    },
    {
      sdk: 'Python',
      version: '1.20.0',
      href: 'https://github.com/temporalio/sdk-python/releases',
    },
    {
      sdk: 'Typescript',
      version: '1.14.0',
      href: 'https://github.com/temporalio/sdk-typescript/releases',
    },
    {
      sdk: '.NET',
      version: '1.10.0',
      href: 'https://github.com/temporalio/sdk-dotnet/releases',
    },
    {
      sdk: 'Ruby',
      version: '1.1.0',
      href: 'https://github.com/temporalio/sdk-ruby/releases',
    },
    {
      sdk: 'Java',
      version: '1.35.0',
      href: 'https://github.com/temporalio/sdk-java/releases',
    },
    {
      sdk: 'Rust',
      version: '0.70.0',
      href: 'https://github.com/temporalio/sdk-rust/releases',
    },
  ];
  const currentSdk = $derived(
    supportedVersions.find(
      ({ sdk }) => sdk.toLowerCase() === $sdkInfo.sdk.toLowerCase(),
    ),
  );
</script>

<ResourceEmptyState
  title={translate('workers.no-worker-heartbeats')}
  Icon={IconHeartbeat}
  testId="worker-heartbeats-sdk-warning"
>
  {#snippet description()}
    {#if currentSdk}
      {@const { href, sdk, version } = currentSdk}
      {#if !minimumVersionRequired(version, $sdkInfo.version)}
        <div class="flex flex-wrap items-center justify-center gap-1">
          {translate('workers.worker-heartbeats-sdk-link-preface')}
          <Link newTab {href}>
            <SdkLogo {sdk} {version} hideDocsLink />
          </Link>
          {translate('workers.worker-heartbeats-sdk-link-postface')}
        </div>
      {/if}
    {:else}
      <p>{translate('workers.worker-heartbeats-sdk-list-preface')}</p>
    {/if}
  {/snippet}
  {#if !currentSdk}
    <SdkLinks links={supportedVersions} />
  {/if}
</ResourceEmptyState>
