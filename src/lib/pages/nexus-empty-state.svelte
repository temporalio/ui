<script module lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  import { useDarkMode } from '$lib/utilities/dark-mode';
  import andromeda from '$lib/vendor/andromeda.png';

  type Props = {
    actions?: Snippet;
  };

  let { actions }: Props = $props();
</script>

<div class="flex min-h-screen flex-col gap-8 p-10">
  <div class="flex flex-col gap-4 lg:flex-row">
    <div>
      <div class="mb-8 flex items-center gap-4">
        <h1
          data-testid="namespace-selector-title"
          class="text-marketingGreen font-mono uppercase"
        >
          {translate('nexus.endpoints')}
        </h1>
      </div>
      <div class="flex w-full flex-col gap-4 pr-8 md:pr-24">
        <h2 class="text-4xl">
          {translate('nexus.registry-empty-state-title')}
        </h2>

        {@render nexusRegistryDescription()}
        {@render actions?.()}
      </div>
    </div>
    <div class="mx-auto mt-8 w-full bg-background-primary" aria-hidden="true">
      <img src={andromeda} alt="" class:invert={!$useDarkMode} />
    </div>
  </div>
</div>

{#snippet nexusRegistryDescription()}
  <p>
    <Link href="https://docs.temporal.io/evaluate/nexus" newTab>
      {translate('nexus.registry-empty-state-nexus-link')}
    </Link>
    {translate('nexus.registry-empty-state-nexus-description')}
  </p>
  <p>
    <Link href="https://docs.temporal.io/nexus/services" newTab>
      {translate('nexus.registry-empty-state-services-link')}
    </Link>
    {translate('nexus.registry-empty-state-services-preface')}
    <Link href="https://docs.temporal.io/nexus/endpoints" newTab>
      {translate('nexus.registry-empty-state-endpoint-link')}
    </Link>
    {translate('nexus.registry-empty-state-services-midface')}
    <Link href="https://docs.temporal.io/nexus/registry" newTab
      >{translate('nexus.registry-empty-state-registry-link')}</Link
    >{translate('nexus.registry-empty-state-services-postface')}
  </p>
  <p>
    {translate('nexus.registry-empty-state-proxy-preface')}
    <Link href="https://docs.temporal.io/nexus/operations" newTab>
      {translate('nexus.registry-empty-state-operations-link')}
    </Link>
    {translate('nexus.registry-empty-state-proxy-postface')}
  </p>
{/snippet}

<style>
  .invert {
    filter: invert(1);
  }
</style>
