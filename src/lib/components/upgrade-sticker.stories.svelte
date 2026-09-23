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

  const DISTRIBUTION_COMPONENT = {
    cli: 'cli',
    docker: 'ui',
    helm: 'helm',
    server: 'server',
  } as const;

  const { Story } = defineMeta({
    title: 'Upgrade Sticker',
    component: UpgradeSticker,
    args: {
      distribution: 'cli',
      current: '1.4.1',
      latest: '1.9.1',
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
  {@const component = DISTRIBUTION_COMPONENT[distribution]}
  {@const notice = getUpgradeNotice({
    distribution,
    installed: { [component]: current },
    latest: { [component]: latest },
  })}
  <div
    class="group flex h-80 flex-col justify-end border-r border-primary bg-surface-primary px-2 py-4"
    class:w-64={navOpen}
    class:w-12={!navOpen}
    data-nav={navOpen ? 'open' : 'closed'}
  >
    <div class="relative">
      <p class="flex h-10 items-center px-2 group-data-[nav=closed]:hidden">
        Feedback
      </p>
      <p class="py-3 text-center text-[0.6rem] text-secondary">2.54.1</p>
      {#if notice}
        <UpgradeSticker {notice} />
      {/if}
    </div>
  </div>
{/snippet}

<Story name="CLI" />

<Story
  name="Docker"
  args={{ distribution: 'docker', current: '2.39.0', latest: '2.54.1' }}
/>

<Story
  name="Helm"
  args={{ distribution: 'helm', current: '1.5.0', latest: '1.7.0' }}
/>

<Story
  name="Server"
  args={{ distribution: 'server', current: '1.28.0', latest: '1.32.0' }}
/>

<Story name="Collapsed Nav" args={{ navOpen: false }} />
