<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import IconPlaySolid from '$lib/io/icon/icons/play-solid.svelte';
  import IconTemporalSettings from '$lib/io/icon/icons/temporal-settings.svelte';

  import { featureLabel } from './catalog-features';
  import { catalogKinds } from './catalog-kinds';
  import type { CatalogSession } from './session-store';
  import type { BrowserCatalogDescriptor } from './types';
  import type { WorkbenchHost } from './workbench-host';

  import CatalogKindBadge from './catalog-kind-badge.svelte';
  import CatalogLatestRun from './catalog-latest-run.svelte';

  interface Props {
    descriptor: BrowserCatalogDescriptor;
    host: WorkbenchHost;
    latest: CatalogSession | undefined;
    pendingRuns: number;
    selectedFeature: string | null;
    href: string;
    onfeature: (feature: string) => void;
    onstart: () => void;
  }

  let {
    descriptor,
    host,
    latest,
    pendingRuns,
    selectedFeature,
    href,
    onfeature,
    onstart,
  }: Props = $props();

  const kind = $derived(catalogKinds[descriptor.execution.kind]);
</script>

<li
  class="grid grid-cols-1 items-center gap-3 px-3.5 py-3 hover:bg-interactive-tertiary-hover sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:gap-4"
  data-testid="catalog-example"
>
  <div class="min-w-0">
    <Link
      class="table-link block break-words text-sm font-medium text-primary"
      {href}
    >
      {descriptor.title}
    </Link>
    <div
      class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-secondary"
    >
      <CatalogKindBadge kind={descriptor.execution.kind} />
      <span data-testid="catalog-location">
        {kind.locationLabel}
        <span class="break-all font-mono">{kind.location(descriptor)}</span>
      </span>
      <span data-testid="catalog-source">{descriptor.source.label}</span>
    </div>
    <p class="mt-1 max-w-[70ch] text-xs text-secondary">
      {descriptor.description}
    </p>
    {#if descriptor.capabilityTags.length}
      <div
        class="mt-1.5 flex flex-wrap gap-1"
        role="group"
        aria-label={`${descriptor.title} features`}
      >
        {#each descriptor.capabilityTags as feature (feature)}
          <button
            type="button"
            class="catalog-feature"
            aria-pressed={selectedFeature === feature}
            onclick={() => onfeature(feature)}>{featureLabel(feature)}</button
          >
        {/each}
      </div>
    {/if}
  </div>
  <div
    class="flex flex-row flex-wrap items-center gap-2 text-xs sm:flex-col sm:items-start sm:gap-0.5"
  >
    <CatalogLatestRun {latest} {host} />
  </div>
  <div class="flex items-center gap-2 sm:justify-end">
    <Button
      {href}
      aria-label="Configure"
      LeadingIcon={IconTemporalSettings}
      size="xs"
      variant="secondary"
    >
      Configure
    </Button>
    <div class="relative">
      <Button
        size="xs"
        LeadingIcon={IconPlaySolid}
        aria-label={pendingRuns ? `Start (${pendingRuns} pending)` : 'Start'}
        onclick={onstart}>Start</Button
      >
      {#if pendingRuns}
        <span
          class="pointer-events-none absolute -right-1 -top-1 min-w-4 rounded-full border border-primary bg-surface-primary px-1 text-center text-[10px] leading-4 text-primary"
          aria-hidden="true">{pendingRuns}</span
        >
      {/if}
    </div>
  </div>
</li>

<style lang="postcss">
  .catalog-feature {
    @apply h-[22px] rounded border border-primary px-1.5 text-xs text-secondary hover:border-brand hover:text-primary;

    &[aria-pressed='true'] {
      @apply border-brand bg-interactive-secondary-hover text-primary;
    }
  }
</style>
