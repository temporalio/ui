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
  const needsUpgrade = $derived(
    Boolean(
      currentSdk &&
      !minimumVersionRequired(currentSdk.version, $sdkInfo.version),
    ),
  );
</script>

{#snippet upgradeNote()}
  {#if currentSdk}
    {@const { href, sdk, version } = currentSdk}
    <div class="flex flex-wrap items-center justify-center gap-1">
      {translate('workers.worker-heartbeats-sdk-link-preface')}
      <Link newTab {href}>
        <SdkLogo {sdk} {version} hideDocsLink />
      </Link>
      {translate('workers.worker-heartbeats-sdk-link-postface')}
    </div>
  {/if}
{/snippet}

{#snippet supportedSdks()}
  <SdkLinks
    links={supportedVersions}
    label={translate('workers.worker-heartbeats-sdk-list-preface')}
  />
{/snippet}

<ResourceEmptyState
  title={translate('workers.no-worker-heartbeats')}
  Icon={IconHeartbeat}
  testId="worker-heartbeats-sdk-warning"
  description={needsUpgrade ? upgradeNote : undefined}
  resources={currentSdk ? undefined : supportedSdks}
/>
