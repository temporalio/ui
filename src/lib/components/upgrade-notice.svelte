<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import { fetchLatestReleases } from '$lib/services/releases-service';
  import {
    type ComponentVersions,
    getInstalledVersions,
    getUpgradeNotice,
    toUpgradeDistribution,
  } from '$lib/utilities/upgrade-notice';

  import UpgradeSticker from './upgrade-sticker.svelte';

  let latest = $state<ComponentVersions>({});

  const distribution = $derived(
    toUpgradeDistribution(page.data?.settings?.distribution),
  );
  const notice = $derived(
    getUpgradeNotice({
      distribution,
      installed: getInstalledVersions({
        distribution,
        distributionVersion: page.data?.settings?.distributionVersion,
        uiVersion: page.data?.settings?.version,
        serverVersion: page.data?.cluster?.serverVersion,
      }),
      latest,
    }),
  );

  onMount(async () => {
    latest = await fetchLatestReleases();
  });
</script>

{#if notice}
  <UpgradeSticker {notice} />
{/if}
