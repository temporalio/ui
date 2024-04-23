<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import GhostCard from '$lib/holocene/ghost-card.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';

  import { services } from './services';

  let view: 'all' | 'mine' = 'all';
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<h1 data-testid="namespace-selector-title" class="mb-8 text-2xl">
  {translate('nexus.nexus-services')}
</h1>
<div class="flex flex-col gap-4">
  <ToggleButtons>
    <ToggleButton
      data-testid="all-services"
      on:click={() => (view = 'all')}
      active={view === 'all'}>{translate('nexus.all-services')}</ToggleButton
    >
    <ToggleButton
      data-testid="all-services"
      on:click={() => (view = 'mine')}
      active={view === 'mine'}>{translate('nexus.my-services')}</ToggleButton
    >
  </ToggleButtons>
  <GhostCard
    class="py-12"
    title="Get Started"
    subtitle="Description lorem ipsum dolor sit amet consectetur"
  />
  <div
    class="grid grid-cols-1 gap-4 pr-8 md:grid-cols-2 md:pr-24 xl:grid-cols-3 xl:pr-48"
  >
    {#each services as service}
      <GhostCard
        title={service.title}
        subtitle={service.description}
        tags={service.tags}
      />
    {/each}
  </div>
</div>
