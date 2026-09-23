<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import {
    getUpgradeNotice,
    UPGRADE_DISTRIBUTIONS,
    type UpgradeDistribution,
  } from '$lib/utilities/upgrade-notice';

  import UpgradeSticker from './upgrade-sticker.svelte';

  type Args = {
    distribution: UpgradeDistribution;
    current: string;
    latest: string;
    navOpen: boolean;
  };

  const { Story } = defineMeta({
    title: 'Upgrade Sticker',
    component: UpgradeSticker,
    args: {
      distribution: 'cli',
      current: '1.20.1',
      latest: '1.21.1',
      navOpen: true,
    },
    argTypes: {
      distribution: { control: 'select', options: UPGRADE_DISTRIBUTIONS },
      current: { control: 'text' },
      latest: { control: 'text' },
      navOpen: { control: 'boolean' },
    },
    render: template,
  });
</script>

{#snippet template({ distribution, current, latest, navOpen }: Args)}
  {@const notice = getUpgradeNotice({
    cluster: {
      versionInfo: {
        current: { version: current },
        recommended: { version: latest },
      },
    },
    notifyOnNewVersion: true,
    distribution,
  })}
  <div
    class="group flex h-80 flex-col justify-end border-r border-primary bg-surface-primary px-2 py-4"
    class:w-64={navOpen}
    class:w-12={!navOpen}
    data-nav={navOpen ? 'open' : 'closed'}
  >
    {#if notice}
      <UpgradeSticker {notice} />
    {/if}
  </div>
{/snippet}

<Story name="CLI" />

<Story name="Docker" args={{ distribution: 'docker', latest: '1.21.0' }} />

<Story name="Helm" args={{ distribution: 'helm', latest: '1.21.0' }} />

<Story name="Server" args={{ distribution: 'server', latest: '1.21.0' }} />

<Story name="Collapsed Nav" args={{ navOpen: false }} />
